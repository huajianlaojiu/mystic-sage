import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateReading } from "@/lib/reading";
import { sendEmail, isEmailConfigured, detailedReportEmailHtml } from "@/lib/email";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// The PayPal account that should receive payments (the "business" in the buttons).
// Override with PAYPAL_BUSINESS_EMAIL (e.g. the sandbox facilitator email when testing).
const EXPECTED_RECEIVER =
  process.env.PAYPAL_BUSINESS_EMAIL || "mountain0342@gmail.com";

// PayPal IPN verification endpoint.
// - PAYPAL_MODE=sandbox  -> PayPal's sandbox verifier (for IPN 联调 tests)
// - otherwise            -> live verifier, or override fully with PAYPAL_IPN_VERIFY_URL
const IPN_VERIFY_URL = (() => {
  if (process.env.PAYPAL_IPN_VERIFY_URL) return process.env.PAYPAL_IPN_VERIFY_URL;
  if (process.env.PAYPAL_MODE === "sandbox") {
    return "https://ipnpb.sandbox.paypal.com/cgi-bin/webscr";
  }
  return "https://ipnpb.paypal.com/cgi-bin/webscr";
})();

console.log(
  `[paypal-ipn] mode=${process.env.PAYPAL_MODE || "live"} verify=${IPN_VERIFY_URL} skipVerify=${process.env.PAYPAL_IPN_SKIP_VERIFY === "true"}`
);

/**
 * The `custom` field carries either a plain email (legacy subscription button)
 * or a JSON object `{ e: email, q: question }` (Detailed Report button, so the
 * purchased report can be personalized). This helper accepts both shapes.
 */
function parseCustom(raw: string | null): { email: string; question: string } {
  const s = (raw || "").trim();
  if (!s) return { email: "", question: "" };
  if (s.startsWith("{")) {
    try {
      const o = JSON.parse(s);
      return { email: (o.e || "").trim(), question: (o.q || "").trim() };
    } catch {
      // fall through to plain-email handling
    }
  }
  return { email: s, question: "" };
}

function getDb() {
  // Use service role when available (bypasses RLS), otherwise anon
  return createClient(SUPABASE_URL, SERVICE_KEY || ANON_KEY, {
    auth: { persistSession: false },
  });
}

/**
 * PayPal IPN verification: echo the raw POST body back to PayPal with
 * cmd=_notify-validate. PayPal responds "VERIFIED" or "INVALID".
 * Set PAYPAL_IPN_SKIP_VERIFY=true ONLY in local dev to simulate IPNs.
 */
async function verifyIpn(rawBody: string): Promise<"verified" | "invalid" | "error"> {
  if (process.env.PAYPAL_IPN_SKIP_VERIFY === "true") {
    console.log("[paypal-ipn] Verification skipped (PAYPAL_IPN_SKIP_VERIFY=true)");
    return "verified";
  }
  try {
    const res = await fetch(IPN_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "cmd=_notify-validate&" + rawBody,
    });
    const text = (await res.text()).trim();
    console.log("[paypal-ipn] Verification response:", text);
    if (text === "VERIFIED") return "verified";
    if (text === "INVALID") return "invalid";
    return "error";
  } catch (err: any) {
    console.error("[paypal-ipn] Verification request failed:", err?.message || err);
    return "error";
  }
}

async function upsertSubscription(db: any, params: URLSearchParams) {
  const subscrId = params.get("subscr_id") || "";
  // Prefer the logged-in email we tagged on the button (custom field) so the
  // membership is tied to the user's account even when their PayPal email
  // differs. Fall back to payer_email.
  const { email } = parseCustom(params.get("custom"));
  const emailFinal = email || params.get("payer_email") || "";
  if (!subscrId || !emailFinal) return;

  const planName = params.get("item_name") || "Mystic Plus";
  const amount = params.get("mc_gross") || "0";

  const { error } = await db.from("subscriptions").upsert(
    {
      paypal_subscr_id: subscrId,
      email: emailFinal,
      plan_name: planName,
      amount: parseFloat(amount) || 0,
      currency: params.get("mc_currency") || "USD",
      status: "active",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "paypal_subscr_id" }
  );

  if (error) {
    console.warn("[paypal-ipn] Upsert subscription failed:", error.message);
  } else {
    console.log("[paypal-ipn] Subscription upserted:", subscrId, emailFinal, planName);
  }
}

async function updateSubscriptionStatus(db: any, subscrId: string, status: string) {
  if (!subscrId) return;
  const { error } = await db
    .from("subscriptions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("paypal_subscr_id", subscrId);

  if (error) {
    console.warn("[paypal-ipn] Update subscription status failed:", error.message);
  } else {
    console.log("[paypal-ipn] Subscription status updated:", subscrId, status);
  }
}

async function recordOrder(db: any, params: URLSearchParams) {
  const txnId = params.get("txn_id") || "";
  const { email } = parseCustom(params.get("custom"));
  const emailFinal = email || params.get("payer_email") || "";
  if (!txnId || !emailFinal) return;

  const { error } = await db.from("orders").upsert(
    {
      paypal_txn_id: txnId,
      email: emailFinal,
      item_name: params.get("item_name") || "",
      amount: parseFloat(params.get("mc_gross") || "0") || 0,
      currency: params.get("mc_currency") || "USD",
      status: params.get("payment_status") || "pending",
    },
    { onConflict: "paypal_txn_id" }
  );

  if (error) {
    console.warn("[paypal-ipn] Record order failed:", error.message);
  } else {
    console.log("[paypal-ipn] Order recorded:", txnId, emailFinal);
  }
}

/**
 * Scheme B: when a Detailed Report is purchased, generate a premium 5-card
 * reading and email it to the buyer. Best-effort — a failure here must never
 * break the webhook response or the order record.
 */
async function emailDetailedReport(params: URLSearchParams) {
  const { email, question } = parseCustom(params.get("custom"));
  const buyerEmail = email || params.get("payer_email") || "";
  if (!buyerEmail) {
    console.warn("[paypal-ipn] No buyer email for Detailed Report — skipping email");
    return;
  }
  if (!isEmailConfigured()) {
    console.warn("[paypal-ipn] RESEND_API_KEY not set — Detailed Report email not sent to", buyerEmail);
    return;
  }

  try {
    const generated = await generateReading(question || "What do I need to know right now?", {
      premium: true,
    });
    const html = detailedReportEmailHtml(question, generated.reading, generated.cards);
    const result = await sendEmail({
      to: buyerEmail,
      subject: "Your MysticSage Detailed Tarot Report ✦",
      html,
      replyTo: process.env.EMAIL_REPLY_TO || "mountain0342@gmail.com",
    });
    if (result.ok) {
      console.log("[paypal-ipn] Detailed Report emailed to", buyerEmail);
    } else {
      console.warn("[paypal-ipn] Detailed Report email failed:", result.error);
    }
  } catch (err: any) {
    console.warn("[paypal-ipn] Detailed Report generation/email error:", err?.message || err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);

    const txnType = params.get("txn_type") || "unknown";
    const payerEmail = params.get("payer_email") || "";
    const subscrId = params.get("subscr_id") || "";
    const receiverEmail = params.get("receiver_email") || "";
    const paymentStatus = params.get("payment_status") || "";
    const itemName = (params.get("item_name") || "").toLowerCase();

    // Verify authenticity with PayPal BEFORE doing anything.
    const verification = await verifyIpn(rawBody);
    if (verification !== "verified") {
      if (verification === "error") {
        // Transient failure — return 500 so PayPal retries the IPN later.
        console.warn("[paypal-ipn] Verification error — 500 to trigger retry");
        return NextResponse.json({ error: "Verification error" }, { status: 500 });
      }
      console.warn("[paypal-ipn] IPN INVALID — dropping", { txnType, payerEmail });
      return NextResponse.json({ success: true });
    }

    if (receiverEmail && receiverEmail !== EXPECTED_RECEIVER) {
      console.warn("[paypal-ipn] Receiver email mismatch:", receiverEmail);
      return NextResponse.json({ error: "Invalid receiver" }, { status: 400 });
    }

    console.log("[paypal-ipn] Transaction:", { type: txnType, from: payerEmail, subscrId, status: paymentStatus });

    if (!SUPABASE_URL) {
      console.warn("[paypal-ipn] Supabase not configured, skipping DB writes");
      return NextResponse.json({ success: true });
    }

    const db = getDb();

    switch (txnType) {
      case "subscr_signup":
        await upsertSubscription(db, params);
        break;
      case "subscr_payment":
        await upsertSubscription(db, params);
        if (paymentStatus === "Completed") {
          await recordOrder(db, params);
        }
        break;
      case "subscr_cancel":
        await updateSubscriptionStatus(db, subscrId, "cancelled");
        break;
      case "subscr_eot":
        await updateSubscriptionStatus(db, subscrId, "expired");
        break;
      case "web_accept":
        if (paymentStatus === "Completed") {
          await recordOrder(db, params);
          // Scheme B: email the purchased Detailed Report to the buyer.
          if (/detailed report/.test(itemName)) {
            await emailDetailedReport(params);
          }
        }
        break;
      default:
        console.log("[paypal-ipn] Unhandled txn_type:", txnType);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[paypal-ipn] Error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "PayPal IPN endpoint active",
    mode: process.env.PAYPAL_MODE || "live",
    verify: IPN_VERIFY_URL,
    skipVerify: process.env.PAYPAL_IPN_SKIP_VERIFY === "true",
  });
}

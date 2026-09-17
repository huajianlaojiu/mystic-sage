import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { generateReading } from "@/lib/reading";
import { sendEmail, isEmailConfigured, detailedReportEmailHtml } from "@/lib/email";
import { parseStoredCards } from "@/lib/tarot";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const EXPECTED_RECEIVER = (process.env.PAYPAL_BUSINESS_EMAIL || "mountain0342@gmail.com").trim().toLowerCase();
const DETAILED_REPORT = "Detailed Report";
const MYSTIC_PLUS = "Mystic Plus - Monthly";

const IPN_VERIFY_URL = (() => {
  if (process.env.PAYPAL_IPN_VERIFY_URL) return process.env.PAYPAL_IPN_VERIFY_URL;
  return process.env.PAYPAL_MODE === "sandbox"
    ? "https://ipnpb.sandbox.paypal.com/cgi-bin/webscr"
    : "https://ipnpb.paypal.com/cgi-bin/webscr";
})();

function getDb(): SupabaseClient {
  if (!SUPABASE_URL || !SERVICE_KEY) throw new Error("Payment database credentials are not configured");
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
}

function parseCustom(raw: string | null): { email: string; question: string } {
  const value = (raw || "").trim();
  if (!value) return { email: "", question: "" };
  if (value.startsWith("{")) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (parsed && typeof parsed === "object") {
        const obj = parsed as Record<string, unknown>;
        return { email: typeof obj.e === "string" ? obj.e.trim().toLowerCase() : "", question: typeof obj.q === "string" ? obj.q.trim().slice(0, 200) : "" };
      }
    } catch { /* Fall through to legacy email handling. */ }
  }
  return { email: value.toLowerCase(), question: "" };
}

function hasExpectedAmount(params: URLSearchParams, expected: number, required: boolean) {
  const raw = params.get("mc_gross") || params.get("mc_amount3") || params.get("amount3") || params.get("a3");
  if (!raw) return !required;
  const amount = Number(raw);
  return Number.isFinite(amount) && Math.abs(amount - expected) < 0.001;
}

/**
 * Amount check for `subscr_signup`.
 *
 * Nothing has been charged at signup, so `mc_gross` is frequently 0.00 there —
 * running it through the general check would reject perfectly legitimate
 * signups. Only the recurring-period fields describe the agreed price, and if
 * PayPal sends none of them the event is still accepted: a signup no longer
 * grants access, so a tampered one only creates a `pending` row that the
 * amount-checked `subscr_payment` later promotes or leaves alone.
 */
function hasExpectedRecurringAmount(params: URLSearchParams, expected: number) {
  const raw = params.get("mc_amount3") || params.get("amount3") || params.get("a3");
  if (!raw) return true;
  const amount = Number(raw);
  return Number.isFinite(amount) && Math.abs(amount - expected) < 0.001;
}

function isSupportedEvent(txnType: string, params: URLSearchParams) {
  const itemName = (params.get("item_name") || "").trim();
  const currency = (params.get("mc_currency") || params.get("currency_code") || "USD").toUpperCase();
  if (currency !== "USD") return false;
  if (txnType === "web_accept") return itemName === DETAILED_REPORT && hasExpectedAmount(params, 4.99, true);
  if (txnType === "subscr_signup") return itemName === MYSTIC_PLUS && hasExpectedRecurringAmount(params, 19);
  if (txnType === "subscr_payment") return itemName === MYSTIC_PLUS && hasExpectedAmount(params, 19, true);
  // A failed or skipped renewal must be recorded, otherwise the member keeps
  // premium forever while PayPal collects nothing. These events do not always
  // carry the product name or an amount, so only the subscription id is used —
  // the handler matches on an id that already exists in our own table.
  if (["subscr_failed", "recurring_payment_suspended", "recurring_payment_skipped"].includes(txnType)) return true;
  return ["subscr_cancel", "subscr_eot"].includes(txnType);
}

async function verifyIpn(rawBody: string): Promise<"verified" | "invalid" | "error"> {
  if (process.env.PAYPAL_IPN_SKIP_VERIFY === "true" && process.env.NODE_ENV !== "production") return "verified";
  try {
    const res = await fetch(IPN_VERIFY_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "cmd=_notify-validate&" + rawBody });
    const text = (await res.text()).trim();
    return text === "VERIFIED" ? "verified" : text === "INVALID" ? "invalid" : "error";
  } catch (error) {
    console.error("[paypal-ipn] Verification request failed:", error);
    return "error";
  }
}

async function upsertSubscription(db: SupabaseClient, params: URLSearchParams, status: string) {
  const id = params.get("subscr_id") || "";
  const { email } = parseCustom(params.get("custom"));
  const buyerEmail = email || (params.get("payer_email") || "").trim().toLowerCase();
  if (!id || !buyerEmail) throw new Error("Subscription event is missing a subscription ID or buyer email");
  const { error } = await db.from("subscriptions").upsert({ paypal_subscr_id: id, email: buyerEmail, plan_name: MYSTIC_PLUS, amount: 19, currency: "USD", status, updated_at: new Date().toISOString() }, { onConflict: "paypal_subscr_id" });
  if (error) throw new Error(`Subscription write failed: ${error.message}`);
}

/**
 * Record that a subscription exists without granting access yet.
 *
 * A `subscr_signup` only proves the agreement was created — it arrives before
 * any money moves, and because the button is a plain WPS form the amount in it
 * is client-controlled. Access is therefore granted on the first
 * `subscr_payment` whose amount PayPal itself reports as 19.00, not here.
 *
 * If the payment already landed (PayPal does not guarantee ordering), the
 * existing row is left alone so a late signup cannot downgrade an active plan.
 */
async function upsertPendingSubscription(db: SupabaseClient, params: URLSearchParams) {
  const id = params.get("subscr_id") || "";
  const { email } = parseCustom(params.get("custom"));
  const buyerEmail = email || (params.get("payer_email") || "").trim().toLowerCase();
  if (!id || !buyerEmail) throw new Error("Subscription event is missing a subscription ID or buyer email");

  const { data: existing, error: readError } = await db
    .from("subscriptions")
    .select("status")
    .eq("paypal_subscr_id", id)
    .limit(1);
  if (readError) throw new Error(`Subscription lookup failed: ${readError.message}`);
  if (existing && existing.length > 0) return;

  const { error } = await db.from("subscriptions").insert({
    paypal_subscr_id: id,
    email: buyerEmail,
    plan_name: MYSTIC_PLUS,
    amount: 19,
    currency: "USD",
    status: "pending",
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(`Subscription write failed: ${error.message}`);
}

async function updateSubscriptionStatus(db: SupabaseClient, id: string, status: "cancelled" | "expired" | "past_due") {
  if (!id) throw new Error("Subscription event is missing a subscription ID");
  const { error } = await db.from("subscriptions").update({ status, updated_at: new Date().toISOString() }).eq("paypal_subscr_id", id);
  if (error) throw new Error(`Subscription status update failed: ${error.message}`);
}

async function recordOrder(db: SupabaseClient, params: URLSearchParams, itemName: string, amount: number) {
  const id = params.get("txn_id") || "";
  const { email } = parseCustom(params.get("custom"));
  const buyerEmail = email || (params.get("payer_email") || "").trim().toLowerCase();
  if (!id || !buyerEmail) throw new Error("Payment event is missing a transaction ID or buyer email");
  const { error } = await db.from("orders").upsert({ paypal_txn_id: id, email: buyerEmail, item_name: itemName, amount, currency: "USD", status: "Completed" }, { onConflict: "paypal_txn_id" });
  if (error) throw new Error(`Order write failed: ${error.message}`);
}

async function emailDetailedReport(params: URLSearchParams) {
  const { email, question } = parseCustom(params.get("custom"));
  const buyerEmail = email || (params.get("payer_email") || "").trim().toLowerCase();
  if (!buyerEmail || !isEmailConfigured()) throw new Error("Detailed Report delivery is not configured");
  const drawnCards = await loadRecentSpread(buyerEmail);
  const generated = await generateReading(question || "What do I need to know right now?", {
    premium: true,
    ...(drawnCards.length > 0 ? { drawnCards } : {}),
  });
  const result = await sendEmail({ to: buyerEmail, subject: "Your MysticSage Detailed Tarot Report", html: detailedReportEmailHtml(question, generated.reading, generated.cards), replyTo: process.env.EMAIL_REPLY_TO || "mountain0342@gmail.com" });
  if (!result.ok) throw new Error(`Detailed Report email failed: ${result.error}`);
}

/**
 * Reuse the seeker's most recent pull (last 24h) so the paid report explains
 * the cards they actually saw, instead of a fresh random spread. Falls back to
 * a new spread when nothing is found.
 */
async function loadRecentSpread(email: string) {
  try {
    const db = getDb();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await db
      .from("readings")
      .select("cards")
      .eq("email", email)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) {
      console.warn("[paypal-ipn] Could not load recent spread:", error.message);
      return [];
    }
    const cards = parseStoredCards(data?.[0]?.cards);
    // The $4.99 report is advertised as a full 10-card spread, so only reuse a
    // stored spread when it is already a complete one (i.e. the buyer is a
    // member). A 3-card free pull gets a full spread drawn for the report.
    if (cards.length >= 10) {
      console.log(`[paypal-ipn] Reusing the buyer's own ${cards.length}-card spread`);
      return cards;
    }
    return [];
  } catch (err) {
    console.warn("[paypal-ipn] Recent spread lookup failed:", err instanceof Error ? err.message : err);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);
    const txnType = params.get("txn_type") || "";
    const receiver = (params.get("receiver_email") || "").trim().toLowerCase();

    const verification = await verifyIpn(rawBody);
    if (verification === "error") return NextResponse.json({ error: "Verification temporarily unavailable" }, { status: 500 });
    if (verification === "invalid") return NextResponse.json({ success: true });
    if (receiver !== EXPECTED_RECEIVER) return NextResponse.json({ error: "Invalid receiver" }, { status: 400 });
    if (!isSupportedEvent(txnType, params)) return NextResponse.json({ error: "Unsupported product, currency, or payment amount" }, { status: 400 });

    const db = getDb();
    if (txnType === "subscr_signup") {
      // Records the subscription only. Signing up is not paying, and the amount
      // on a WPS button is editable in the browser before submission.
      await upsertPendingSubscription(db, params);
    } else if (txnType === "subscr_payment") {
      // isSupportedEvent already rejected anything whose reported amount is not
      // 19.00, so a Completed payment here is a real full-price charge.
      const paid = params.get("payment_status") === "Completed";
      await upsertSubscription(db, params, paid ? "active" : "past_due");
      if (paid) await recordOrder(db, params, MYSTIC_PLUS, 19);
    } else if (["subscr_failed", "recurring_payment_suspended", "recurring_payment_skipped"].includes(txnType)) {
      await updateSubscriptionStatus(db, params.get("subscr_id") || "", "past_due");
    } else if (txnType === "subscr_cancel") {
      await updateSubscriptionStatus(db, params.get("subscr_id") || "", "cancelled");
    } else if (txnType === "subscr_eot") {
      await updateSubscriptionStatus(db, params.get("subscr_id") || "", "expired");
    } else if (txnType === "web_accept" && params.get("payment_status") === "Completed") {
      await recordOrder(db, params, DETAILED_REPORT, 4.99);
      await emailDetailedReport(params);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown webhook error";
    console.error("[paypal-ipn] Error:", message);
    // Alert the operator: a failed report/subscription write means a paying
    // customer may have received nothing, and PayPal will retry this IPN.
    await alertOperator("PayPal webhook failed", message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

/**
 * Email the operator when something goes wrong in the payment flow. Never
 * throws - a failed alert must not change the webhook response.
 */
async function alertOperator(subject: string, detail: string): Promise<void> {
  if (!isEmailConfigured()) return;
  const to = process.env.OWNER_ALERT_EMAIL || process.env.EMAIL_REPLY_TO || "mountain0342@gmail.com";
  const stamp = new Date().toISOString();
  try {
    const result = await sendEmail({
      to,
      subject: `[MysticSage] ${subject}`,
      html: `<p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#222;">
        <strong>${subject}</strong><br/>At: ${stamp}<br/><br/>
        <code style="display:block;padding:12px;background:#f4f4f7;border-radius:6px;white-space:pre-wrap;">${detail}</code><br/>
        PayPal retries failed IPN messages automatically, so this may resolve itself. Check the Vercel logs and the orders table if it repeats.
      </p>`,
    });
    if (!result.ok) console.warn("[paypal-ipn] Operator alert failed:", result.error);
  } catch (err) {
    console.warn("[paypal-ipn] Operator alert threw:", err instanceof Error ? err.message : err);
  }
}

export async function GET() {
  return NextResponse.json({ message: "PayPal IPN endpoint active", mode: process.env.PAYPAL_MODE || "live", verificationEnabled: process.env.PAYPAL_IPN_SKIP_VERIFY !== "true" || process.env.NODE_ENV === "production" });
}

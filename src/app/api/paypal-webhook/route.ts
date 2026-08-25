import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { generateReading } from "@/lib/reading";
import { sendEmail, isEmailConfigured, detailedReportEmailHtml } from "@/lib/email";

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

function isSupportedEvent(txnType: string, params: URLSearchParams) {
  const itemName = (params.get("item_name") || "").trim();
  const currency = (params.get("mc_currency") || params.get("currency_code") || "USD").toUpperCase();
  if (currency !== "USD") return false;
  if (txnType === "web_accept") return itemName === DETAILED_REPORT && hasExpectedAmount(params, 4.99, true);
  if (["subscr_signup", "subscr_payment"].includes(txnType)) return itemName === MYSTIC_PLUS && hasExpectedAmount(params, 19, txnType === "subscr_payment");
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

async function upsertSubscription(db: SupabaseClient, params: URLSearchParams) {
  const id = params.get("subscr_id") || "";
  const { email } = parseCustom(params.get("custom"));
  const buyerEmail = email || (params.get("payer_email") || "").trim().toLowerCase();
  if (!id || !buyerEmail) throw new Error("Subscription event is missing a subscription ID or buyer email");
  const { error } = await db.from("subscriptions").upsert({ paypal_subscr_id: id, email: buyerEmail, plan_name: MYSTIC_PLUS, amount: 19, currency: "USD", status: "active", updated_at: new Date().toISOString() }, { onConflict: "paypal_subscr_id" });
  if (error) throw new Error(`Subscription write failed: ${error.message}`);
}

async function updateSubscriptionStatus(db: SupabaseClient, id: string, status: "cancelled" | "expired") {
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
  const generated = await generateReading(question || "What do I need to know right now?", { premium: true });
  const result = await sendEmail({ to: buyerEmail, subject: "Your MysticSage Detailed Tarot Report", html: detailedReportEmailHtml(question, generated.reading, generated.cards), replyTo: process.env.EMAIL_REPLY_TO || "mountain0342@gmail.com" });
  if (!result.ok) throw new Error(`Detailed Report email failed: ${result.error}`);
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
    if (txnType === "subscr_signup" || txnType === "subscr_payment") {
      await upsertSubscription(db, params);
      if (txnType === "subscr_payment" && params.get("payment_status") === "Completed") await recordOrder(db, params, MYSTIC_PLUS, 19);
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
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "PayPal IPN endpoint active", mode: process.env.PAYPAL_MODE || "live", verificationEnabled: process.env.PAYPAL_IPN_SKIP_VERIFY !== "true" || process.env.NODE_ENV === "production" });
}

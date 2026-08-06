import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getDb() {
  // Use service role when available (bypasses RLS), otherwise anon
  return createClient(SUPABASE_URL, SERVICE_KEY || ANON_KEY, {
    auth: { persistSession: false },
  });
}

async function upsertSubscription(db: any, params: URLSearchParams) {
  const subscrId = params.get("subscr_id") || "";
  const email = params.get("payer_email") || "";
  if (!subscrId || !email) return;

  const planName = params.get("item_name") || "Mystic Plus";
  const amount = params.get("mc_gross") || "0";

  const { error } = await db.from("subscriptions").upsert(
    {
      paypal_subscr_id: subscrId,
      email,
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
    console.log("[paypal-ipn] Subscription upserted:", subscrId, email, planName);
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
  const email = params.get("payer_email") || "";
  if (!txnId || !email) return;

  const { error } = await db.from("orders").upsert(
    {
      paypal_txn_id: txnId,
      email,
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
    console.log("[paypal-ipn] Order recorded:", txnId, email);
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

    const expectedEmail = "mountain0342@gmail.com";
    if (receiverEmail && receiverEmail !== expectedEmail) {
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
  return NextResponse.json({ message: "PayPal IPN endpoint active" });
}

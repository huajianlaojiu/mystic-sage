import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, getServerClient } from "@/lib/supabase/server";

/**
 * Cancel the caller's active subscription.
 *
 * If PayPal REST credentials (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET) are
 * configured, the subscription is cancelled via PayPal and marked cancelled in
 * the database. Otherwise the endpoint returns 501 with needsManual=true so the
 * UI can route the user to email-based cancellation instead.
 */
async function cancelPayPalSubscription(subscriptionId: string): Promise<{ ok: boolean; error?: string }> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return { ok: false, error: "PayPal API not configured" };
  }

  try {
    // 1) OAuth token
    const tokenRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: { "Authorization": "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials",
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      return { ok: false, error: "PayPal token failed: " + (tokenJson.error_description || tokenRes.status) };
    }

    // 2) Cancel the subscription
    const cancelRes = await fetch("https://api-m.paypal.com/v1/billing/subscriptions/" + encodeURIComponent(subscriptionId) + "/cancel", {
      method: "POST",
      headers: { "Authorization": "Bearer " + tokenJson.access_token, "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Customer cancelled from MysticSage account" }),
    });
    if (cancelRes.status !== 204 && !cancelRes.ok) {
      return { ok: false, error: "PayPal cancel failed: " + cancelRes.status };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function POST(_req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.email) {
      return NextResponse.json({ ok: false, error: "Sign in to manage your subscription." }, { status: 401 });
    }
    const email = sessionUser.email.trim().toLowerCase();

    const db = getServerClient();
    const { data: subs, error } = await db
      .from("subscriptions")
      .select("id, paypal_subscr_id, plan_name, status")
      .eq("email", email)
      .eq("status", "active")
      .limit(1);

    if (error) {
      console.error("[cancel] Query error:", error.message);
      return NextResponse.json({ ok: false, error: "Could not look up your subscription." }, { status: 500 });
    }

    if (!subs || subs.length === 0) {
      return NextResponse.json({ ok: false, error: "No active subscription found for this account." }, { status: 404 });
    }

    const sub = subs[0];
    const paypalId = sub.paypal_subscr_id as string | null;

    if (paypalId) {
      const result = await cancelPayPalSubscription(paypalId);
      if (!result.ok) {
        if (result.error === "PayPal API not configured") {
          return NextResponse.json({ ok: false, needsManual: true, error: "Automatic cancellation is not enabled yet. Please email mountain0342@gmail.com to cancel." }, { status: 501 });
        }
        return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
      }
    }

    const { error: updateErr } = await db
      .from("subscriptions")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", sub.id);

    if (updateErr) {
      console.error("[cancel] Update error:", updateErr.message);
      return NextResponse.json({ ok: false, error: "Subscription cancelled with PayPal but failed to sync. Contact support." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Subscription cancelled. Access continues until the end of the billing period." });
  } catch (err) {
    console.error("[cancel] Error:", err);
    return NextResponse.json({ ok: false, error: "Cancellation failed. Please try again." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, getServerClient } from "@/lib/supabase/server";

/**
 * Where a subscriber cancels.
 *
 * The plan is created with PayPal's classic buttons (`_xclick-subscriptions`),
 * and those subscription IDs are not valid on the REST billing API — calling
 * `/v1/billing/subscriptions/{id}/cancel` with one returns 404. PayPal's own
 * autopay page accepts both classic and REST subscriptions, and cancelling
 * there fires a `subscr_cancel` IPN that this app already handles, so the local
 * row updates from PayPal's confirmation rather than from our own guess.
 *
 * This also keeps us on the right side of the FTC and EU rules on negative
 * option billing: cancelling online is as easy as subscribing was.
 */
const PAYPAL_MANAGE_URL = "https://www.paypal.com/myaccount/autopay/";

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

    return NextResponse.json({
      ok: true,
      manageUrl: PAYPAL_MANAGE_URL,
      message: "Cancel your plan in PayPal. Your access here stays active until the end of the billing period.",
    });
  } catch (err) {
    console.error("[cancel] Error:", err);
    return NextResponse.json({ ok: false, error: "Cancellation failed. Please try again." }, { status: 500 });
  }
}

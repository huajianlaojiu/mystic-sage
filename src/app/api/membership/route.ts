import { NextResponse } from "next/server";
import { getMembership } from "@/lib/membership";
import { getSessionUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    // Membership is tied to the authenticated account, not a freely supplied
    // email. An unauthenticated caller cannot probe whether an arbitrary email
    // is a member (prevents enumeration / forgery).
    const sessionUser = await getSessionUser();
    if (!sessionUser?.email) {
      return NextResponse.json(
        { member: false, error: "Sign in to view your membership." },
        { status: 401 }
      );
    }

    // A membership is keyed on the email address, so an address that was never
    // confirmed could belong to someone else. Do not report a plan for it.
    if (!sessionUser.emailConfirmed) {
      return NextResponse.json({
        member: false,
        plan: null,
        subscriptionSince: null,
        emailUnverified: true,
        error: "Confirm your email address to use a membership.",
      });
    }

    const status = await getMembership(sessionUser.email);
    if (!status) {
      return NextResponse.json(
        { member: false, error: "Supabase not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json(status);
  } catch (err) {
    console.error("[membership] Error:", err);
    return NextResponse.json(
      { member: false, error: "Membership check failed" },
      { status: 500 }
    );
  }
}

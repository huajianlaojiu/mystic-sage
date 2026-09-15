import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { sendEmail, isEmailConfigured, recoveryEmailHtml } from "@/lib/email";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mysticsages.com";

/**
 * Send a password reset link over the app's own mail channel.
 *
 * Same reason as the signup route: Supabase Auth's outbound mail never arrived,
 * while the app's Resend integration demonstrably does.
 *
 * The response never reveals whether the address exists, so this cannot be used
 * to enumerate accounts.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !email.includes("@") || email.length > 254) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const generic = { ok: true, message: "If that address has an account, a reset link is on its way." };

    if (!isEmailConfigured()) {
      return NextResponse.json({ error: "Email is not configured on the server." }, { status: 503 });
    }

    const db = getServerClient();
    const { data, error } = await db.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: SITE_URL + "/auth/callback?next=/auth/reset-password" },
    });

    if (error) {
      // A missing account looks the same as a success to the caller.
      console.warn("[auth/reset] generateLink failed:", error.message);
      return NextResponse.json(generic);
    }

    const link = data?.properties?.action_link;
    if (!link) {
      console.warn("[auth/reset] generateLink returned no action_link");
      return NextResponse.json(generic);
    }

    const sent = await sendEmail({
      to: email,
      subject: "Reset your MysticSage password",
      html: recoveryEmailHtml(link),
      replyTo: process.env.EMAIL_REPLY_TO || "mountain0342@gmail.com",
    });
    if (!sent.ok) console.error("[auth/reset] reset email failed:", sent.error);

    return NextResponse.json(generic);
  } catch (err) {
    console.error("[auth/reset] Error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

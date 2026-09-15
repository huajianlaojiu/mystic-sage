import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { sendEmail, isEmailConfigured, confirmationEmailHtml } from "@/lib/email";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mysticsages.com";
const MIN_PASSWORD = 8;

/**
 * Create an account and email the confirmation link ourselves.
 *
 * Supabase Auth is configured with custom SMTP, but its messages never reached
 * users — a delivery test through Resend's own API arrives in the same mailbox
 * seconds later, so the mail path is fine and Supabase's is not.
 *
 * `auth.admin.generateLink` creates the user and returns the verification URL
 * without sending anything, which lets this route deliver it over the Resend
 * channel the welcome email already proved works.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !email.includes("@") || email.length > 254) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (password.length < MIN_PASSWORD) {
      return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD} characters.` }, { status: 400 });
    }
    if (!isEmailConfigured()) {
      return NextResponse.json({ error: "Email is not configured on the server." }, { status: 503 });
    }

    const db = getServerClient();
    const { data, error } = await db.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: { redirectTo: SITE_URL + "/auth/callback" },
    });

    if (error) {
      const message = error.message || "";
      if (/already|exists|registered/i.test(message)) {
        return NextResponse.json(
          { error: "That email address already has an account. Try signing in instead." },
          { status: 409 }
        );
      }
      console.error("[auth/register] generateLink failed:", message);
      return NextResponse.json({ error: "Could not create the account. Please try again." }, { status: 500 });
    }

    const link = data?.properties?.action_link;
    if (!link) {
      console.error("[auth/register] generateLink returned no action_link");
      return NextResponse.json({ error: "Could not create the confirmation link." }, { status: 500 });
    }

    const sent = await sendEmail({
      to: email,
      subject: "Confirm your email address",
      html: confirmationEmailHtml(link),
      replyTo: process.env.EMAIL_REPLY_TO || "mountain0342@gmail.com",
    });

    if (!sent.ok) {
      console.error("[auth/register] confirmation email failed:", sent.error);
      return NextResponse.json(
        { error: "The account was created but the confirmation email could not be sent. Please contact support." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Check your email for the confirmation link.",
    });
  } catch (err) {
    console.error("[auth/register] Error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

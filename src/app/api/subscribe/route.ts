import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { sendEmail, welcomeEmailHtml, isEmailConfigured } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Store in Supabase. Surface write failures instead of silently reporting success.
    try {
      const supabase = getServerClient();
      const { error } = await supabase.from("subscribers").insert({
        email: normalizedEmail,
        source: "reading_page",
        created_at: new Date().toISOString(),
      });
      if (error) {
        console.error("[subscribe] Supabase insert failed:", error.message);
        return NextResponse.json(
          { success: false, error: "Could not save your subscription. Please try again later." },
          { status: 500 }
        );
      }
    } catch (supaErr) {
      console.error("[subscribe] Supabase error:", supaErr instanceof Error ? supaErr.message : String(supaErr));
      return NextResponse.json(
        { success: false, error: "Could not save your subscription. Please try again later." },
        { status: 500 }
      );
    }

    // Send welcome email. Non-blocking: a send failure must not roll back the
    // subscription. If email isn't configured yet, just log it.
    if (isEmailConfigured()) {
      const sendResult = await sendEmail({
        to: normalizedEmail,
        subject: "Welcome to MysticSage ✦ Your daily guidance starts now",
        html: welcomeEmailHtml(normalizedEmail),
        replyTo: process.env.EMAIL_REPLY_TO || "mountain0342@gmail.com",
      });
      if (!sendResult.ok) {
        console.warn("[subscribe] Welcome email failed:", sendResult.error);
      } else {
        console.log("[subscribe] Welcome email sent to", normalizedEmail);
      }
    } else {
      console.warn("[subscribe] RESEND_API_KEY not set — welcome email not sent to", normalizedEmail);
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing! Check your inbox for a welcome email.",
    });
  } catch (err) {
    console.error("[subscribe] Error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

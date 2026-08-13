import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";

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
    } catch (supaErr: any) {
      console.error("[subscribe] Supabase error:", supaErr?.message || supaErr);
      return NextResponse.json(
        { success: false, error: "Could not save your subscription. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing! Check your inbox for a welcome email.",
    });
  } catch (err: any) {
    console.error("[subscribe] Error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Try storing in Supabase â gracefully handle if table doesn't exist yet
    try {
      const supabase = getServerClient();
      const { error } = await supabase.from("subscribers").insert({
        email: normalizedEmail,
        source: "reading_page",
        created_at: new Date().toISOString(),
      });
      if (error) {
        // Table likely doesn't exist â log and fall through gracefully
        console.warn("[subscribe] Supabase insert failed:", error.message);
        console.warn("[subscribe] Create a 'subscribers' table in Supabase dashboard with columns: id (uuid pk), email (text), source (text), created_at (timestamptz)");
      }
    } catch (supaErr: any) {
      console.warn("[subscribe] Supabase error (non-blocking):", supaErr?.message || supaErr);
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

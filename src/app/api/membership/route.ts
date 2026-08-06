import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ member: false, error: "Valid email required" }, { status: 400 });
    }

    if (!SUPABASE_URL || !ANON_KEY) {
      return NextResponse.json({ member: false, error: "Supabase not configured" }, { status: 503 });
    }

    const db = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

    // Check active subscriptions
    const { data: subs, error: subErr } = await db
      .from("subscriptions")
      .select("plan_name, status, created_at")
      .eq("email", email)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);

    if (subErr) {
      console.warn("[membership] Sub query error:", subErr.message);
    }

    const activeSub = subs && subs.length > 0 ? subs[0] : null;

    // Check one-time orders (premium reports)
    const { data: orders, error: ordErr } = await db
      .from("orders")
      .select("item_name, status, created_at")
      .eq("email", email)
      .eq("status", "Completed")
      .order("created_at", { ascending: false })
      .limit(5);

    if (ordErr) {
      console.warn("[membership] Order query error:", ordErr.message);
    }

    const hasReports = !!(orders && orders.length > 0);

    return NextResponse.json({
      member: !!activeSub,
      plan: activeSub?.plan_name || null,
      subscriptionSince: activeSub?.created_at || null,
      hasReports,
      reports: orders || [],
    });
  } catch (err: any) {
    console.error("[membership] Error:", err);
    return NextResponse.json({ member: false, error: "Membership check failed" }, { status: 500 });
  }
}

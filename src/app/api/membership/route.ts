import { NextRequest, NextResponse } from "next/server";
import { getMembership } from "@/lib/membership";

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ member: false, error: "Valid email required" }, { status: 400 });
    }

    const status = await getMembership(email);
    if (!status) {
      return NextResponse.json({ member: false, error: "Supabase not configured" }, { status: 503 });
    }

    return NextResponse.json(status);
  } catch (err: any) {
    console.error("[membership] Error:", err);
    return NextResponse.json({ member: false, error: "Membership check failed" }, { status: 500 });
  }
}

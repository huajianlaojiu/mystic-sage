import { NextResponse } from "next/server";
import { getSessionClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/reading";

  if (code) {
    const supabase = await getSessionClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchange error:", error.message);
      return NextResponse.redirect(new URL("/auth/login?error=session", req.url));
    }
  }

  return NextResponse.redirect(new URL(next, req.url));
}

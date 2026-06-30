import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Supabase redirects here after email confirmation
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (code) {
    // Exchange code for session (handled client-side)
    return NextResponse.redirect(new URL("/reading?verified=true", req.url));
  }
  return NextResponse.redirect(new URL("/auth/login", req.url));
}

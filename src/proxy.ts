import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { withTimeout } from "@/lib/supabase/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshes the auth token and writes the updated session cookies.
  // Capped by a timeout so a stalled Supabase round-trip (e.g. a paused
  // free-tier project cold-starting) cannot hang the request.
  try {
    await withTimeout(supabase.auth.getUser(), 5000);
  } catch {
    // Session refresh skipped this request — next request will retry.
  }

  return response;
}

export const config = {
  matcher: [
    // Refresh sessions on page navigations, but skip /api routes — those
    // validate the session themselves via getSessionUser() and we don't want
    // to double the (cold-start-prone) server-side Supabase calls.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

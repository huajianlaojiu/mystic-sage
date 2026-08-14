import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server client — service_role key, bypasses RLS. Use for privileged DB writes
// (e.g. /api/subscribe) where we trust the server, not the caller.
export function getServerClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

// Cookie-based server client for reading the auth session (anon key only — no
// privileged access). Used to verify the caller's identity in route handlers.
export async function getSessionClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component where cookies are read-only.
          // Middleware refreshes the session on each request instead.
        }
      },
    },
  });
}

// Resolve the authenticated user from the session cookie. getUser() validates
// the JWT with Supabase (unlike getSession, which trusts the cookie blindly),
// so a forged/expired session cannot impersonate a member.
// Returns null when there is no valid session.
export async function getSessionUser(): Promise<{ email: string | null } | null> {
  const supabase = await getSessionClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { email: user.email ?? null };
}

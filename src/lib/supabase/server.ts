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
//
// Wrapped in a timeout: the server-side Supabase round-trip can stall when the
// (free-tier) project is paused/cold-starting. Without a cap the whole request
// hangs until the serverless function times out — surfacing as an endless
// spinner to the user. Failing fast degrades gracefully to an anonymous
// experience instead.
export async function getSessionUser(): Promise<{ email: string | null } | null> {
  const supabase = await getSessionClient();
  let user = null;
  try {
    const res = await withTimeout(supabase.auth.getUser(), 5000);
    if (!res.error && res.data.user) user = res.data.user;
  } catch {
    // Timed out / network error — treat as no session, degrade gracefully.
  }
  if (!user) return null;
  return { email: user.email ?? null };
}

// Reject after `ms` so a stalled upstream call cannot hang the request forever.
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

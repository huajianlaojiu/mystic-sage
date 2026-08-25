import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Privileged database operations are server-only and must never fall back to anon.
export function getServerClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) throw new Error("Server database credentials are not configured");
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
}

export async function getSessionClient() {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Public Supabase credentials are not configured");
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* Server Components cannot write cookies. */ }
      },
    },
  });
}

export async function getSessionUser(): Promise<{ email: string | null } | null> {
  try {
    const supabase = await getSessionClient();
    const res = await withTimeout(supabase.auth.getUser(), 5000);
    return !res.error && res.data.user ? { email: res.data.user.email ?? null } : null;
  } catch {
    return null;
  }
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
  });
}

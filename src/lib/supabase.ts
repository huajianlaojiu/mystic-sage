import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client — uses @supabase/ssr so the auth session is stored in cookies
// and is readable by the server (route handlers / middleware). Use in "use client" pages.
// NOTE: this module must stay free of server-only imports (e.g. next/headers) so it
// can be safely bundled into client components.
let browserClient: SupabaseClient | null = null;
export function getBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

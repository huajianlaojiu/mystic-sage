import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export type MembershipStatus = {
  member: boolean;
  plan: string | null;
  subscriptionSince: string | null;
};

/**
 * Membership lookup is server-only. Payment records are never queried with the
 * public anon key, and one-time report purchases do not grant subscription access.
 */
export async function getMembership(email: string): Promise<MembershipStatus | null> {
  const normalized = email?.trim().toLowerCase();
  if (!normalized || !normalized.includes("@") || !SUPABASE_URL || !SERVICE_KEY) return null;

  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  type SubRow = { plan_name: string | null; created_at: string };

  try {
    const res = await withTimeout<{ data: SubRow[] | null; error: { message: string } | null }>(
      db
        .from("subscriptions")
        .select("plan_name, created_at")
        .eq("email", normalized)
        .eq("status", "active")
        .eq("plan_name", "Mystic Plus - Monthly")
        .order("created_at", { ascending: false })
        .limit(1),
      5000
    );
    if (res.error) {
      console.warn("[membership] Subscription query error:", res.error.message);
      return null;
    }
    const activeSub = res.data?.[0];
    return {
      member: Boolean(activeSub),
      plan: activeSub?.plan_name || null,
      subscriptionSince: activeSub?.created_at || null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown membership error";
    console.warn("[membership] Subscription query failed:", message);
    return null;
  }
}

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    Promise.resolve(promise).then(
      value => { clearTimeout(timer); resolve(value); },
      error => { clearTimeout(timer); reject(error); }
    );
  });
}

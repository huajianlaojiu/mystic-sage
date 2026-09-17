import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export type MembershipStatus = {
  member: boolean;
  plan: string | null;
  subscriptionSince: string | null;
  hasReports: boolean;
  reports: { item_name: string; status: string; created_at: string }[];
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
  type OrderRow = { item_name: string; status: string; created_at: string };

  try {
    // The two lookups are independent, so run them together rather than
    // adding a second round-trip to every membership check.
    const [res, ordersRes] = await withTimeout<[
      { data: SubRow[] | null; error: { message: string } | null },
      { data: OrderRow[] | null; error: { message: string } | null },
    ]>(
      Promise.all([
        db
          .from("subscriptions")
          .select("plan_name, created_at")
          .eq("email", normalized)
          .eq("status", "active")
          .eq("plan_name", "Mystic Plus - Monthly")
          .order("created_at", { ascending: false })
          .limit(1),
        db
          .from("orders")
          .select("item_name, status, created_at")
          .eq("email", normalized)
          .ilike("item_name", "%detailed report%")
          .order("created_at", { ascending: false })
          .limit(20),
      ]),
      5000
    );
    if (res.error) {
      console.warn("[membership] Subscription query error:", res.error.message);
      return null;
    }
    if (ordersRes.error) {
      // A report lookup failure must not hide an active subscription.
      console.warn("[membership] Orders query error:", ordersRes.error.message);
    }
    const activeSub = res.data?.[0];
    const reports = (ordersRes.data || []).map(o => ({
      item_name: o.item_name,
      status: o.status,
      created_at: o.created_at,
    }));
    return {
      member: Boolean(activeSub),
      plan: activeSub?.plan_name || null,
      subscriptionSince: activeSub?.created_at || null,
      hasReports: reports.length > 0,
      reports,
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

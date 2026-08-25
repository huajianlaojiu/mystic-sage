import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export type MembershipReport = {
  item_name: string;
  status: string;
  created_at: string;
};

export type MembershipStatus = {
  member: boolean;
  plan: string | null;
  subscriptionSince: string | null;
  hasReports: boolean;
  reports: MembershipReport[];
};

/**
 * Resolve a user's membership status from their PayPal-linked email.
 * Reads via the anon key — RLS policies on subscriptions/orders allow anon
 * SELECT, so this is safe to call from route handlers.
 * Returns null when inputs/env are missing or invalid.
 */
export async function getMembership(email: string): Promise<MembershipStatus | null> {
  const normalized = email?.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) return null;
  if (!SUPABASE_URL || !ANON_KEY) return null;

  const db = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

  // The free-tier Supabase project can be paused/cold-starting, which makes these
  // queries hang. Without a timeout a stalled call blocks the whole request until
  // the serverless function times out — surfacing as a 500 to the (logged-in) user.
  // Anonymous requests skip this path entirely, which is why they never 500'd.
  // Cap each query at 5s and degrade gracefully to "not a member".
  type SubRow = { plan_name: string; status: string; created_at: string };
  let subs: SubRow[] | null = null;
  try {
    const res = await withTimeout<{ data: SubRow[] | null; error: { message: string } | null }>(
      db
        .from("subscriptions")
        .select("plan_name, status, created_at")
        .eq("email", normalized)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1),
      5000
    );
    subs = res.data ?? null;
    if (res.error) console.warn("[membership] Sub query error:", res.error.message);
  } catch (e: any) {
    console.warn("[membership] Sub query failed/timeout:", e?.message);
  }

  const activeSub = subs && subs.length > 0 ? subs[0] : null;

  let orders: MembershipReport[] | null = null;
  try {
    const res = await withTimeout<{ data: MembershipReport[] | null; error: { message: string } | null }>(
      db
        .from("orders")
        .select("item_name, status, created_at")
        .eq("email", normalized)
        .eq("status", "Completed")
        .order("created_at", { ascending: false })
        .limit(5),
      5000
    );
    orders = res.data ?? null;
    if (res.error) console.warn("[membership] Order query error:", res.error.message);
  } catch (e: any) {
    console.warn("[membership] Order query failed/timeout:", e?.message);
  }

  const reports = (orders || []).filter((o) => o.status === "Completed");

  // A one-time "Detailed Report" purchase also unlocks the premium 5-card
  // reading on the site. We only count Completed orders and match the item
  // name written by the PayPal webhook, so partial/failed payments don't grant
  // access. This reuses the existing `member` flag that reading/route.ts and
  // the UI already key off of — no other files need to change.
  const hasDetailedReport = reports.some((r) =>
    /detailed report/i.test(r.item_name || "")
  );

  return {
    member: !!activeSub || hasDetailedReport,
    plan: activeSub?.plan_name || (hasDetailedReport ? "Detailed Report" : null),
    subscriptionSince: activeSub?.created_at || null,
    hasReports: reports.length > 0,
    reports,
  };
}

// Reject after `ms` so a stalled Supabase round-trip cannot hang the request
// (and thus the whole serverless function) until it times out.
function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    Promise.resolve(promise).then(
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

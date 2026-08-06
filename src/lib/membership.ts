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

  const { data: subs, error: subErr } = await db
    .from("subscriptions")
    .select("plan_name, status, created_at")
    .eq("email", normalized)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1);

  if (subErr) {
    console.warn("[membership] Sub query error:", subErr.message);
  }

  const activeSub = subs && subs.length > 0 ? subs[0] : null;

  const { data: orders, error: ordErr } = await db
    .from("orders")
    .select("item_name, status, created_at")
    .eq("email", normalized)
    .eq("status", "Completed")
    .order("created_at", { ascending: false })
    .limit(5);

  if (ordErr) {
    console.warn("[membership] Order query error:", ordErr.message);
  }

  const reports = (orders || []).filter((o) => o.status === "Completed");

  return {
    member: !!activeSub,
    plan: activeSub?.plan_name || null,
    subscriptionSince: activeSub?.created_at || null,
    hasReports: reports.length > 0,
    reports,
  };
}

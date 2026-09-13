"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase";

type MembershipStatus = {
  member: boolean;
  plan: string | null;
  subscriptionSince: string | null;
  hasReports: boolean;
  reports: { item_name: string; status: string; created_at: string }[];
};

type ReadingEntry = {
  id: string;
  createdAt: string;
  question: string | null;
  premium: boolean;
  cards: string[];
  excerpt: string;
};

export default function AccountPage() {
  const [status, setStatus] = useState<"loading" | "signedOut" | "ready">("loading");
  const [membership, setMembership] = useState<MembershipStatus | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMsg, setCancelMsg] = useState("");
  const [readings, setReadings] = useState<ReadingEntry[]>([]);
  const [readingsMsg, setReadingsMsg] = useState("");

  useEffect(() => {
    let active = true;
    getBrowserClient()
      .auth.getUser()
      .then(async ({ data }) => {
        if (!data.user) {
          if (active) setStatus("signedOut");
          return;
        }
         const r = await fetch("/api/membership");
         const d = await r.json();
         if (active) { setMembership(d); setStatus("ready"); }

         try {
           const rr = await fetch("/api/readings");
           const rd = await rr.json();
           if (active && Array.isArray(rd.readings)) setReadings(rd.readings);
           else if (active && rd.error) setReadingsMsg(rd.error);
         } catch {
           if (active) setReadingsMsg("Could not load your readings.");
         }
       })
      .catch(() => { if (active) setStatus("signedOut"); });
    return () => { active = false; };
  }, []);

  async function handleCancel() {
    setCancelling(true); setCancelMsg("");
    try {
      const r = await fetch("/api/subscription/cancel", { method: "POST" });
      const d = await r.json();
      if (r.status === 401) { setCancelMsg("Please sign in first."); }
      else if (r.status === 501) { setCancelMsg("Automatic cancellation is not enabled yet. Email mountain0342@gmail.com to cancel, or use PayPal directly."); }
      else if (r.ok) { setCancelMsg("Subscription cancelled. Access continues until the end of the billing period."); setMembership({ ...membership!, member: false } as MembershipStatus); }
      else { setCancelMsg(d.error || "Cancellation failed. Please try again."); }
    } catch {
      setCancelMsg("Something went wrong. Please try again.");
    }
    setCancelling(false);
  }

  if (status === "loading") return <section className="page-header"><h1>Account</h1><p>Loading...</p></section>;

  if (status === "signedOut") {
    return (
      <>
        <section className="page-header"><h1>Account</h1><p>Sign in to manage your subscription.</p></section>
        <section className="section" style={{ textAlign: "center" }}>
          <Link href="/auth/login" className="btn-primary" style={{ display: "inline-flex" }}>Sign In</Link>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="page-header"><h1>My Account</h1><p>Manage your subscription and purchased reports.</p></section>
      <section className="section">
        <div className="container" style={{ maxWidth: 620, margin: "0 auto" }}>

          <div style={{ padding: "24px 28px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>Your readings</h3>
            {readingsMsg && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{readingsMsg}</p>}
            {!readingsMsg && readings.length === 0 && (
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                No saved readings yet. <Link href="/reading" style={{ color: "var(--accent)" }}>Pull your cards</Link> while signed in and they will show up here.
              </p>
            )}
            {readings.length > 0 && (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {readings.map((r) => (
                  <li key={r.id} style={{ padding: "14px 0", borderTop: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      {r.premium && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 0.5 }}>10-card</span>}
                    </div>
                    {r.question && <p style={{ fontSize: 14, fontStyle: "italic", color: "var(--text-secondary)", marginBottom: 4 }}>&ldquo;{r.question}&rdquo;</p>}
                    {r.cards.length > 0 && <p style={{ fontSize: 12, color: "var(--accent)", marginBottom: 6 }}>{r.cards.join(" · ")}</p>}
                    {r.excerpt && <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>{r.excerpt}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ padding: "24px 28px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>Membership</p>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: membership?.member ? "var(--accent)" : "var(--text-primary)", marginBottom: 8 }}>
              {membership?.member ? (membership.plan || "Mystic Plus") + " active" : "Free plan"}
            </h2>
            {membership?.member && membership.subscriptionSince && (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Member since {new Date(membership.subscriptionSince).toLocaleDateString()}</p>
            )}
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>
              {membership?.member ? "Unlimited 10-card Celtic Cross readings." : "Get one free 3-card reading per day."}
            </p>
          </div>

          <div style={{ padding: "24px 28px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>Your reports</h3>
            {membership?.hasReports && membership.reports.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)", fontSize: 14 }}>
                {membership.reports.map((r, i) => <li key={i}>{r.item_name}</li>)}
              </ul>
            ) : (
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No report purchases yet. <Link href="/pricing" style={{ color: "var(--accent)" }}>Browse reports</Link></p>
            )}
          </div>

          <div style={{ padding: "24px 28px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>Cancel subscription</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
              Cancelling stops future payments. Access continues until the end of the current billing period. See our <Link href="/refund" style={{ color: "var(--accent)" }}>refund policy</Link>.
            </p>
            {membership?.member ? (
              <>
                <button onClick={handleCancel} disabled={cancelling} className="btn-secondary" style={{ fontSize: 13, padding: "10px 20px", opacity: cancelling ? 0.6 : 1 }}>
                  {cancelling ? "Cancelling..." : "Cancel subscription"}
                </button>
                {cancelMsg && <p style={{ fontSize: 13, marginTop: 10, color: "var(--text-secondary)" }}>{cancelMsg}</p>}
              </>
            ) : (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>You have no active subscription to cancel.</p>
            )}
          </div>

          <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
            Questions? <a href="mailto:mountain0342@gmail.com" style={{ color: "var(--accent)" }}>mountain0342@gmail.com</a>
          </p>
        </div>
      </section>
    </>
  );
}

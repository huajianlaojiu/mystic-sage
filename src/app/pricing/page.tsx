"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase";

const PAYPAL_EMAIL = process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL || "mountain0342@gmail.com";
const PAYPAL_ACTION = process.env.NEXT_PUBLIC_PAYPAL_MODE === "sandbox" ? "https://www.sandbox.paypal.com/cgi-bin/webscr" : "https://www.paypal.com/cgi-bin/webscr";
const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://mysticsages.com";

function PayPalSubForm({ userEmail }: { userEmail: string | null }) {
  return <form action={PAYPAL_ACTION} method="post">
    <input type="hidden" name="cmd" value="_xclick-subscriptions" /><input type="hidden" name="business" value={PAYPAL_EMAIL} /><input type="hidden" name="item_name" value="Mystic Plus - Monthly" /><input type="hidden" name="currency_code" value="USD" /><input type="hidden" name="a3" value="19.00" /><input type="hidden" name="p3" value="1" /><input type="hidden" name="t3" value="M" /><input type="hidden" name="src" value="1" /><input type="hidden" name="sra" value="1" /><input type="hidden" name="no_note" value="1" /><input type="hidden" name="return" value={SITE_URL + "/success?type=subscription"} /><input type="hidden" name="cancel_return" value={SITE_URL + "/pricing"} /><input type="hidden" name="notify_url" value={SITE_URL + "/api/paypal-webhook"} />
    {/* Tie the purchase to the signed-in account so the plan lands on the right
        user even when the PayPal address differs. */}
    <input type="hidden" name="custom" value={userEmail || ""} />
    <button type="submit" className="btn-pricing primary">Subscribe - $19/month</button>
  </form>;
}

function PayPalReportForm({ userEmail, question }: { userEmail: string | null; question: string }) {
  return <form action={PAYPAL_ACTION} method="post">
    <input type="hidden" name="cmd" value="_xclick" /><input type="hidden" name="business" value={PAYPAL_EMAIL} /><input type="hidden" name="item_name" value="Detailed Report" /><input type="hidden" name="amount" value="4.99" /><input type="hidden" name="currency_code" value="USD" /><input type="hidden" name="no_note" value="1" /><input type="hidden" name="return" value={SITE_URL + "/success?type=report"} /><input type="hidden" name="cancel_return" value={SITE_URL + "/pricing"} /><input type="hidden" name="notify_url" value={SITE_URL + "/api/paypal-webhook"} />
    <input type="hidden" name="custom" value={JSON.stringify({ e: userEmail || "", q: (question || "").slice(0, 200) })} />
    <button type="submit" className="btn-pricing secondary">Buy Detailed Report - $4.99</button>
  </form>;
}

export default function Pricing() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [question, setQuestion] = useState("");

  // Resolve the signed-in email so both checkout forms can tag the purchase with
  // it. Without this the webhook could only fall back to the PayPal address,
  // which is often a different inbox from the one used to sign in.
  useEffect(() => {
    let active = true;
    getBrowserClient()
      .auth.getUser()
      .then(({ data }) => { if (active && data.user) setUserEmail(data.user.email ?? null); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return <><section className="page-header"><h1>Simple, transparent pricing</h1><p>Two products, two clearly defined outcomes.</p></section>
    <section className="section"><div className="container"><div className="pricing-grid" style={{ maxWidth: 780, margin: "0 auto" }}>
      <div className="pricing-card" style={{ textAlign: "center" }}><h3>Free Tarot</h3><div className="subtitle">Try the experience</div><div className="price">$0<span>/day</span></div><div className="desc">A three-card AI tarot reading for reflection.</div><ul><li>One free reading per day</li><li>Three-card spread</li><li>No payment required</li></ul><Link href="/reading" className="btn-pricing secondary">Start a Free Reading</Link></div>
      <div className="pricing-card featured" style={{ textAlign: "center" }}><div className="badge">Mystic Plus</div><h3>Mystic Plus</h3><div className="subtitle">For deeper ongoing reflection</div><div className="price">$19<span>/mo</span></div><div className="desc">Ten-card readings with your reading history kept. Subject to fair-use and abuse-prevention limits.</div><ul><li>Up to 50 readings a day</li><li>Full 10-card Celtic Cross every time</li><li>Reading history saved to your account</li><li>Auto-renews monthly until cancelled</li><li>Cancel any time - no lock-in</li></ul><PayPalSubForm userEmail={userEmail} /><p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>{userEmail ? "Your plan will be linked to " + userEmail + "." : "Sign in first if you want the plan linked to your account."} Cancel from your <a href="/account" style={{ color: "var(--accent)" }}>account page</a> or by emailing support - whichever is easier.</p></div>
    </div></div></section>
    <section className="section"><div className="container" style={{ maxWidth: 720, margin: "0 auto" }}><div className="section-tag">One-time report</div><h2 className="section-title">Detailed Tarot Report</h2><p className="section-sub">A written report on a full 10-card Celtic Cross spread, generated after PayPal confirms payment and emailed to the address you pay with.</p><div className="pricing-card" style={{ textAlign: "center", maxWidth: 460, margin: "28px auto 0" }}><h3>Detailed Report</h3><div className="price">$4.99</div><div className="desc">One full report on your question. This does not create a subscription.</div><ul style={{ textAlign: "left" }}><li>The big picture of your spread</li><li>Every card explained in depth</li><li>The pattern across your cards</li><li>Timing - what is moving and what needs time</li><li>3 concrete steps to take next</li><li>2 reflective questions to journal on</li></ul><label htmlFor="report-question" style={{ display: "block", fontSize: 12, color: "var(--text-muted)", textAlign: "left", marginBottom: 6 }}>Your question (optional)</label><textarea id="report-question" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={200} rows={2} placeholder="What should the report focus on?" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", marginBottom: 14, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)", color: "var(--text-primary)", fontFamily: "inherit", fontSize: 14, resize: "vertical" }} /><PayPalReportForm userEmail={userEmail} question={question} /><p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>Delivered by email, yours to keep. Leave the question blank and we will write about what is most present for you right now.</p></div></div></section>
    <section className="section" style={{ border: "none", paddingTop: 0 }}><div className="container" style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}><p style={{ fontSize: 14, color: "var(--text-muted)" }}>Questions about billing, cancellation, or delivery? <a href="mailto:mountain0342@gmail.com" style={{ color: "var(--accent)" }}>Contact support</a>.</p></div></section>
  </>;
}

"use client";
import Link from "next/link";

const PAYPAL_EMAIL = process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL || "mountain0342@gmail.com";
const PAYPAL_ACTION = process.env.NEXT_PUBLIC_PAYPAL_MODE === "sandbox" ? "https://www.sandbox.paypal.com/cgi-bin/webscr" : "https://www.paypal.com/cgi-bin/webscr";
const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://mysticsages.com";

function PayPalSubForm() {
  return <form action={PAYPAL_ACTION} method="post" target="_blank">
    <input type="hidden" name="cmd" value="_xclick-subscriptions" /><input type="hidden" name="business" value={PAYPAL_EMAIL} /><input type="hidden" name="item_name" value="Mystic Plus - Monthly" /><input type="hidden" name="currency_code" value="USD" /><input type="hidden" name="a3" value="19.00" /><input type="hidden" name="p3" value="1" /><input type="hidden" name="t3" value="M" /><input type="hidden" name="src" value="1" /><input type="hidden" name="sra" value="1" /><input type="hidden" name="no_note" value="1" /><input type="hidden" name="return" value={SITE_URL + "/success?type=subscription"} /><input type="hidden" name="cancel_return" value={SITE_URL + "/pricing"} /><input type="hidden" name="notify_url" value={SITE_URL + "/api/paypal-webhook"} />
    <button type="submit" className="btn-pricing primary">Subscribe — $19/month</button>
  </form>;
}

function PayPalReportForm() {
  return <form action={PAYPAL_ACTION} method="post" target="_blank">
    <input type="hidden" name="cmd" value="_xclick" /><input type="hidden" name="business" value={PAYPAL_EMAIL} /><input type="hidden" name="item_name" value="Detailed Report" /><input type="hidden" name="amount" value="4.99" /><input type="hidden" name="currency_code" value="USD" /><input type="hidden" name="no_note" value="1" /><input type="hidden" name="return" value={SITE_URL + "/success?type=report"} /><input type="hidden" name="cancel_return" value={SITE_URL + "/pricing"} /><input type="hidden" name="notify_url" value={SITE_URL + "/api/paypal-webhook"} />
    <button type="submit" className="btn-pricing secondary">Buy Detailed Report — $4.99</button>
  </form>;
}

export default function Pricing() {
  return <><section className="page-header"><h1>Simple, transparent pricing</h1><p>Two products, two clearly defined outcomes.</p></section>
    <section className="section"><div className="container"><div className="pricing-grid" style={{ maxWidth: 780, margin: "0 auto" }}>
      <div className="pricing-card" style={{ textAlign: "center" }}><h3>Free Tarot</h3><div className="subtitle">Try the experience</div><div className="price">$0<span>/day</span></div><div className="desc">A three-card AI tarot reading for reflection.</div><ul><li>One free reading per day</li><li>Three-card spread</li><li>No payment required</li></ul><Link href="/reading" className="btn-pricing secondary">Start a Free Reading</Link></div>
      <div className="pricing-card featured" style={{ textAlign: "center" }}><div className="badge">Mystic Plus</div><h3>Mystic Plus</h3><div className="subtitle">For deeper ongoing reflection</div><div className="price">$19<span>/mo</span></div><div className="desc">Premium 10-card Celtic Cross readings, subject to fair-use and abuse-prevention controls.</div><ul><li>Premium 10-card Celtic Cross readings</li><li>Active subscription required</li><li>Auto-renews monthly until cancelled</li><li>Cancel by emailing support</li></ul><PayPalSubForm /><p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>Use the same email for PayPal and sign-in. For cancellation, email mountain0342@gmail.com.</p></div>
    </div></div></section>
    <section className="section"><div className="container" style={{ maxWidth: 720, margin: "0 auto" }}><div className="section-tag">One-time report</div><h2 className="section-title">Detailed Tarot Report</h2><p className="section-sub">A personalized 10-card Celtic Cross reading generated after PayPal confirms payment and sent to the purchaser&apos;s email.</p><div className="pricing-card" style={{ textAlign: "center", maxWidth: 420, margin: "28px auto 0" }}><h3>Detailed Report</h3><div className="price">$4.99</div><div className="desc">One personalized 10-card reading. This purchase does not create a Mystic Plus subscription.</div><PayPalReportForm /></div></div></section>
    <section className="section" style={{ border: "none", paddingTop: 0 }}><div className="container" style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}><p style={{ fontSize: 14, color: "var(--text-muted)" }}>Questions about billing, cancellation, or delivery? <a href="mailto:mountain0342@gmail.com" style={{ color: "var(--accent)" }}>Contact support</a>.</p></div></section>
  </>;
}

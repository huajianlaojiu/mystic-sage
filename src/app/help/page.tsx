import Link from "next/link";

const topics = [
  { q: "How do I get a free reading?", a: "Go to the reading page, type your question, and pull three cards. It is free and no account is required. Signed-in users get one free reading per day." },
  { q: "How do I become a member?", a: "Visit the pricing page and choose Mystic Plus or Sage Premium. Payment is handled securely through PayPal. Members unlock unlimited 10-card Celtic Cross readings." },
  { q: "What happens after I buy a report?", a: "Your personalized report is generated and delivered to your inbox within 48 hours. Sign in with the email you used at PayPal to view it under your membership." },
  { q: "How do I cancel my subscription?", a: "Email us at mountain0342@gmail.com from the address used for payment and we will cancel it for you. Refunds are handled case by case." },
  { q: "Are my readings private?", a: "Yes. Readings are anonymous and we never share your reading history or personal information." },
];

export default function HelpPage() {
  return (
    <>
      <section className="page-header">
        <h1>Help Center</h1>
        <p>Quick answers to the most common questions.</p>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: 750, margin: "0 auto" }}>
          {topics.map((t, i) => (
            <div key={i} style={{ marginBottom: 12, padding: "20px 24px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>{t.q}</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{t.a}</p>
            </div>
          ))}
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12 }}>Still need help?</p>
            <Link href="/contact" className="btn-secondary" style={{ display: "inline-flex" }}>Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}

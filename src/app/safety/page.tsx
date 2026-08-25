export default function SafetyPage() {
  const items = [
    { icon: "🔒", title: "Privacy first", desc: "Your readings and personal information are private. We never sell your data." },
    { icon: "🔐", title: "Secure payments", desc: "All payments are processed securely through PayPal. We never see or store your card details." },
    { icon: "🛡️", title: "Entertainment only", desc: "Readings are for entertainment and spiritual wellness. They are not medical, legal, or financial advice." },
    { icon: "18+", title: "Adults only", desc: "You must be 18 or older to use MysticSage." },
  ];
  return (
    <>
      <section className="page-header">
        <h1>Safety</h1>
        <p>How we keep your experience private, secure, and healthy.</p>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: 750, margin: "0 auto" }}>
          <div className="services-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            {items.map((item, i) => (
              <div key={i} className="service-card" style={{ textAlign: "center", padding: 32 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 32, padding: 24, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>If you need support</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>
              MysticSage is a space for reflection, not crisis support. If you are in distress or need professional help,
              please contact a licensed professional or a local crisis line. For site questions, email mountain0342@gmail.com.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

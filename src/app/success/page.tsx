import Link from "next/link";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const isReport = type === "report";

  return (
    <>
      <section className="page-header">
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase. Your transaction has been completed.</p>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 72, marginBottom: 24 }}>✨</div>
          <h3 style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
            {isReport ? "Your report is on its way" : "Welcome to the MysticSage community"}
          </h3>

          <div style={{ padding: "20px 24px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, marginBottom: 24, textAlign: "left" }}>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
              {isReport ? "Here is what happens next:" : "Here is what happens next:"}
            </p>
            <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 2 }}>
              {isReport ? (
                <>
                  <p>📜 <strong style={{ color: "var(--text-secondary)" }}>Report:</strong> Your personalized report will be delivered to your PayPal email within 48 hours.</p>
                  <p>🔮 <strong style={{ color: "var(--text-secondary)" }}>While you wait:</strong> Enjoy a free tarot reading right now.</p>
                  <p>🔑 <strong style={{ color: "var(--text-secondary)" }}>View it in your account:</strong> Sign in with the email you used at PayPal and your purchased report will appear under your membership.</p>
                  <p>💬 <strong style={{ color: "var(--text-secondary)" }}>Questions?</strong> Email us at mountain0342@gmail.com — we reply within 24 hours.</p>
                </>
              ) : (
                <>
                  <p>🔮 <strong style={{ color: "var(--text-secondary)" }}>Subscriptions:</strong> Your membership is now active. Start your unlimited readings right away.</p>
                  <p>📜 <strong style={{ color: "var(--text-secondary)" }}>Premium Reports:</strong> Any report you order is delivered to your inbox within 48 hours.</p>
                  <p>💬 <strong style={{ color: "var(--text-secondary)" }}>Questions?</strong> Email us at mountain0342@gmail.com and we will respond within 24 hours.</p>
                  <p>📧 <strong style={{ color: "var(--text-secondary)" }}>Confirmation:</strong> A receipt has been sent to your PayPal email address.</p>
                </>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
            <Link href="/reading" className="btn-primary" style={{ display: "inline-flex" }}>
              {isReport ? "✦ Get a Free Reading" : "✦ Start Premium Readings"}
            </Link>
            <Link href="/" className="btn-secondary" style={{ display: "inline-flex" }}>Back to Home</Link>
          </div>

          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Need help with your purchase? <a href="mailto:mountain0342@gmail.com" style={{ color: "var(--accent)" }}>Contact support</a>
          </p>
        </div>
      </section>
    </>
  );
}

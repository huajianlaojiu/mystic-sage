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
        <h1>Thanks — payment is being verified</h1>
        <p>PayPal will send a verified payment notification before access or delivery is completed.</p>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 72, marginBottom: 24 }}>✨</div>
          <h3 style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
            {isReport ? "Your Detailed Report is being prepared" : "Your Mystic Plus subscription is being verified"}
          </h3>
          <div style={{ padding: "20px 24px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, marginBottom: 24, textAlign: "left" }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 2 }}>
              {isReport ? (
                <>
                  <p>📜 <strong style={{ color: "var(--text-secondary)" }}>Detailed Report:</strong> After PayPal confirms payment, MysticSage generates and emails your personalized 10-card report.</p>
                  <p>🔮 <strong style={{ color: "var(--text-secondary)" }}>Important:</strong> A Detailed Report is a one-time purchase and does not activate Mystic Plus.</p>
                </>
              ) : (
                <>
                  <p>✦ <strong style={{ color: "var(--text-secondary)" }}>Mystic Plus:</strong> After PayPal confirms payment, sign in with the same email used at PayPal to access premium 10-card readings.</p>
                  <p>📌 <strong style={{ color: "var(--text-secondary)" }}>Fair use:</strong> Premium access remains subject to fair-use controls.</p>
                </>
              )}
              <p>💬 <strong style={{ color: "var(--text-secondary)" }}>Need help?</strong> Email mountain0342@gmail.com with your PayPal transaction ID.</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/reading" className="btn-primary" style={{ display: "inline-flex" }}>✦ Go to Tarot Reading</Link>
            <Link href="/" className="btn-secondary" style={{ display: "inline-flex" }}>Back to Home</Link>
          </div>
        </div>
      </section>
    </>
  );
}

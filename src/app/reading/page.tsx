"use client";
import { useState } from "react";

type Card = { name: string; keywords: string; position: string; emoji: string };
type Reading = { reading: string; cards: Card[] };
const SITE = typeof window !== "undefined" ? window.location.origin : "https://mysticsages.com";

function ShareButtons({ reading, cards }: { reading: string; cards: Card[] }) {
  const url = encodeURIComponent(SITE + "/reading");
  const cardText = cards.map((c) => c.name + " (" + c.position + ")").join(" | ");
  const text = encodeURIComponent(
    "I just got a tarot reading on MysticSage: " + cardText + " - " + reading.slice(0, 100) + "..."
  );

  return (
    <div style={{ margin: "20px 0", textAlign: "center" }}>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>Share your reading</p>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        <a
          href={"https://twitter.com/intent/tweet?text=" + text + "&url=" + url}
          target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text-primary)", textDecoration: "none" }}
        >Share on X</a>
        <a
          href={"https://pinterest.com/pin/create/button/?url=" + url + "&description=" + text}
          target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text-primary)", textDecoration: "none" }}
        >Pin it</a>
        <button
          onClick={() => { navigator.clipboard.writeText(SITE + "/reading"); alert("Link copied!"); }}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text-primary)", cursor: "pointer", fontFamily: "inherit" }}
        >Copy Link</button>
      </div>
    </div>
  );
}

function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg("");
    try {
      const r = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await r.json();
      if (d.success) setMsg("Subscribed! Check your inbox.");
      else setMsg(d.error || "Please try again.");
    } catch {
      setMsg("Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <div style={{ margin: "20px 0", padding: "24px 20px", background: "linear-gradient(135deg,rgba(180,100,255,0.06),rgba(88,56,250,0.03))", border: "1px solid rgba(180,100,255,0.2)", borderRadius: 16 }}>
      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Get readings in your inbox</p>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>Daily tarot pulls, horoscopes and spiritual guidance - free.</p>
      {msg ? (
        <p style={{ fontSize: 14, color: msg.includes("Subscribed") ? "var(--accent)" : "#ff5050" }}>{msg}</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, maxWidth: 420, margin: "0 auto" }}>
          <input
            type="email" required placeholder="your@email.com" value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ flex: 1, padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit", outline: "none" }}
          />
          <button type="submit" disabled={loading}
            style={{ padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "linear-gradient(135deg,var(--accent),var(--accent-dark))", color: "#fff", border: "none", cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1, fontFamily: "inherit", whiteSpace: "nowrap" }}
          >{loading ? "Subscribing..." : "Subscribe"}</button>
        </form>
      )}
    </div>
  );
}

export default function ReadingPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Reading | null>(null);
  const [error, setError] = useState("");

  async function startReading() {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question || "What do I need to know right now?" })
      });
      const d = await r.json();
      if (d.error) { setError(d.error); setLoading(false); return; }
      setResult(d);
    } catch { setError("Could not connect. Try again."); }
    setLoading(false);
  }

  return (
    <>
      <section className="page-header">
        <h1>Free Daily Tarot</h1>
        <p>Ask a question and pull three cards.</p>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center" }}>

            {!result && !loading && (
              <>
                <div style={{ fontSize: 48 }}>🔮</div>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", margin: "12px 0 8px" }}>What would you like guidance on?</h3>
                <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>Free AI tarot reading</p>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. How can I grow in my career?"
                  rows={3}
                  style={{ width: "100%", maxWidth: 500, padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit", resize: "none", outline: "none", marginBottom: 20 }}
                />
                <br />
                <button onClick={startReading} className="btn-primary" style={{ fontSize: 16, padding: "14px 44px" }}>Pull Your Cards</button>
              </>
            )}

            {loading && (
              <div style={{ padding: "60px 40px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16, animation: "float 3s ease-in-out infinite" }}>🔮</div>
                <p style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 12 }}>The cards are being shuffled...</p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  {[0, 1, 2].map((n) => (
                    <div key={n} className="shimmer-bg" style={{ width: 90, height: 135, borderRadius: 10, animationDelay: n * 0.2 + "s" }}></div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{ padding: 20, background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", borderRadius: 12, margin: "16px auto", maxWidth: 400 }}>
                <p style={{ color: "#ff5050", fontSize: 14 }}>{error}</p>
                <button onClick={() => { setError(""); setLoading(false); }} className="btn-secondary" style={{ marginTop: 12 }}>Try Again</button>
              </div>
            )}

            {result && !loading && (
              <>
                <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
                    {result.cards.map((c: Card, i: number) => (
                      <div key={i} className="tarot-card animate-card-flip" style={{ animationDelay: i * 0.25 + "s" }}>
                        <div className="tarot-card-front">
                          <div style={{ fontSize: 28 }}>{c.emoji}</div>
                          <div style={{ fontSize: 9, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase" }}>{c.position}</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", margin: "2px 0", textAlign: "center" }}>{c.name}</div>
                          <div style={{ fontSize: 8, color: "var(--text-muted)", textAlign: "center" }}>{c.keywords}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="animate-fade-up" style={{ animationDelay: "0.5s", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 20px", margin: "0 auto 20px", maxWidth: 600, textAlign: "left" }}>
                  <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{result.reading}</div>
                </div>

                <div className="animate-fade-up" style={{ animationDelay: "0.7s" }}>
                  <ShareButtons reading={result.reading} cards={result.cards} />
                </div>

                <div className="animate-fade-up" style={{ animationDelay: "0.8s" }}>
                  <SubscribeForm />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "20px 0", color: "var(--text-muted)", fontSize: 12 }}>
                  <span style={{ flex: 1, height: 1, background: "var(--border)" }}></span>
                  <span>Unlock more</span>
                  <span style={{ flex: 1, height: 1, background: "var(--border)" }}></span>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
                  <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
                    <input type="hidden" name="cmd" value="_xclick-subscriptions" />
                    <input type="hidden" name="business" value="mountain0342@gmail.com" />
                    <input type="hidden" name="item_name" value="Unlimited Readings" />
                    <input type="hidden" name="currency_code" value="USD" />
                    <input type="hidden" name="a3" value="19.00" />
                    <input type="hidden" name="p3" value="1" />
                    <input type="hidden" name="t3" value="M" />
                    <input type="hidden" name="src" value="1" />
                    <input type="hidden" name="sra" value="1" />
                    <input type="hidden" name="no_note" value="1" />
                    <input type="hidden" name="return" value={SITE + "/success"} />
                    <input type="hidden" name="cancel_return" value={SITE + "/reading"} />
                    <input type="hidden" name="notify_url" value={SITE + "/api/paypal-webhook"} />
                    <button type="submit" className="btn-primary" style={{ fontSize: 13, padding: "10px 18px" }}>Get Unlimited - $19/mo</button>
                  </form>
                  <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
                    <input type="hidden" name="cmd" value="_xclick" />
                    <input type="hidden" name="business" value="mountain0342@gmail.com" />
                    <input type="hidden" name="item_name" value="Detailed Report" />
                    <input type="hidden" name="amount" value="4.99" />
                    <input type="hidden" name="currency_code" value="USD" />
                    <input type="hidden" name="return" value={SITE + "/success"} />
                    <input type="hidden" name="cancel_return" value={SITE + "/reading"} />
                    <input type="hidden" name="notify_url" value={SITE + "/api/paypal-webhook"} />
                    <button type="submit" className="btn-secondary" style={{ fontSize: 13, padding: "10px 18px" }}>Detailed Report - $4.99</button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

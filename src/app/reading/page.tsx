"use client";
import { useState, useEffect } from "react";

type Card = { name: string; keywords: string; position: string; emoji: string };
type Reading = { reading: string; cards: Card[]; premium?: boolean };
type MembershipStatus = {
  member: boolean;
  plan: string | null;
  subscriptionSince: string | null;
  hasReports: boolean;
  reports: { item_name: string; status: string; created_at: string }[];
};
const SITE = typeof window !== "undefined" ? window.location.origin : "https://mysticsages.com";
const STORAGE_EMAIL_KEY = "mysticsage_email";

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

function MemberUnlock({
  membership, checking, lookupEmail, setLookupEmail, onCheck, msg, compact,
}: {
  membership: MembershipStatus | null;
  checking: boolean;
  lookupEmail: string;
  setLookupEmail: (v: string) => void;
  onCheck: (email: string) => void;
  msg: string;
  compact?: boolean;
}) {
  return (
    <div style={{
      margin: compact ? "8px auto 20px" : "28px auto 8px",
      maxWidth: 460, padding: "18px 18px",
      background: membership?.member
        ? "linear-gradient(135deg,rgba(120,220,160,0.10),rgba(80,200,140,0.04))"
        : "rgba(255,255,255,0.04)",
      border: "1px solid " + (membership?.member ? "rgba(120,220,160,0.35)" : "var(--border)"),
      borderRadius: 14, textAlign: "left",
    }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
        {membership?.member ? "✨ " + (membership.plan || "Mystic Plus") + " active" : "Already a member?"}
      </p>
      <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 12 }}>
        {membership?.member
          ? "Your plan is unlocked — pull a Premium 5-card reading anytime."
          : "Enter the email you used at PayPal to unlock your plan."}
      </p>
      <form onSubmit={(e) => { e.preventDefault(); onCheck(lookupEmail); }} style={{ display: "flex", gap: 8 }}>
        <input
          type="email" required value={lookupEmail}
          onChange={(e) => setLookupEmail(e.target.value)}
          placeholder="paypal@email.com"
          style={{ flex: 1, padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit", outline: "none" }}
        />
        <button type="submit" disabled={checking}
          style={{ padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "linear-gradient(135deg,var(--accent),var(--accent-dark))", color: "#fff", border: "none", cursor: checking ? "default" : "pointer", opacity: checking ? 0.6 : 1, fontFamily: "inherit", whiteSpace: "nowrap" }}
        >{checking ? "Checking..." : "Unlock"}</button>
      </form>
      {msg && (
        <p style={{ fontSize: 13, marginTop: 10, color: membership?.member ? "var(--accent)" : "var(--text-muted)" }}>{msg}</p>
      )}
      {membership?.hasReports && membership.reports.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Your purchased reports</p>
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)", fontSize: 13 }}>
            {membership.reports.map((r, i) => (
              <li key={i}>{r.item_name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ReadingPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Reading | null>(null);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [membership, setMembership] = useState<MembershipStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupMsg, setLookupMsg] = useState("");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_EMAIL_KEY) : null;
    if (saved) {
      setEmail(saved);
      setLookupEmail(saved);
      checkMembership(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkMembership(emailVal: string) {
    const v = (emailVal || "").trim().toLowerCase();
    if (!v || !v.includes("@")) {
      setLookupMsg("Enter the email you used at PayPal.");
      return;
    }
    setChecking(true);
    setLookupMsg("");
    try {
      const r = await fetch("/api/membership?email=" + encodeURIComponent(v));
      const d = await r.json();
      if (!r.ok) {
        setLookupMsg(d.error || "Could not verify.");
        setChecking(false);
        return;
      }
      setMembership(d);
      setEmail(v);
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_EMAIL_KEY, v);
      if (d.member) {
        setLookupMsg("✨ " + (d.plan || "Mystic Plus") + " is active — Premium unlocked!");
      } else if (d.hasReports) {
        setLookupMsg("You have purchased reports on this email.");
      } else {
        setLookupMsg("No active plan found for this email yet.");
      }
    } catch {
      setLookupMsg("Something went wrong. Try again.");
    }
    setChecking(false);
  }

  async function startReading() {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question || "What do I need to know right now?",
          ...(membership?.member ? { email } : {}),
        })
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
                <MemberUnlock
                  membership={membership} checking={checking}
                  lookupEmail={lookupEmail} setLookupEmail={setLookupEmail}
                  onCheck={checkMembership} msg={lookupMsg}
                />
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

                {result.premium && (
                  <div className="animate-fade-up" style={{ animationDelay: "0.55s", margin: "0 auto 16px", maxWidth: 600, textAlign: "center", fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>
                    ✨ Premium 5-card reading — thanks for being a member!
                  </div>
                )}

                {membership?.member && (
                  <div className="animate-fade-up" style={{ animationDelay: "0.6s", margin: "0 auto 16px", maxWidth: 600, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
                    ✨ {membership.plan || "Mystic Plus"} active — your plan is unlocked.
                  </div>
                )}

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

                <MemberUnlock
                  membership={membership} checking={checking}
                  lookupEmail={lookupEmail} setLookupEmail={setLookupEmail}
                  onCheck={checkMembership} msg={lookupMsg}
                />

                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
                  {!membership?.member && (
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
                      <input type="hidden" name="return" value={SITE + "/success?type=subscription"} />
                      <input type="hidden" name="cancel_return" value={SITE + "/reading"} />
                      <input type="hidden" name="notify_url" value={SITE + "/api/paypal-webhook"} />
                      <button type="submit" className="btn-primary" style={{ fontSize: 13, padding: "10px 18px" }}>Get Unlimited - $19/mo</button>
                    </form>
                  )}
                  <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
                    <input type="hidden" name="cmd" value="_xclick" />
                    <input type="hidden" name="business" value="mountain0342@gmail.com" />
                    <input type="hidden" name="item_name" value="Detailed Report" />
                    <input type="hidden" name="amount" value="4.99" />
                    <input type="hidden" name="currency_code" value="USD" />
                    <input type="hidden" name="return" value={SITE + "/success?type=report"} />
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

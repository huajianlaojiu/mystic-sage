"use client";
import { useEffect, useState } from "react";
import { getConsent, setConsent, gtagConsent } from "@/lib/analytics";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const c = getConsent();
    // Intentional: read persisted consent once on mount and sync banner visibility.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (c === null) setShow(true);
    else if (c) gtagConsent(true);
  }, []);

  function choose(granted: boolean) {
    setConsent(granted);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 2000,
      background: "rgba(10,10,15,0.97)", borderTop: "1px solid var(--border)",
      padding: "14px 20px", backdropFilter: "blur(12px)",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "center", textAlign: "left" }}>
        <p style={{ flex: "1 1 300px", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
          We use cookies to understand how visitors use MysticSage and to improve the experience.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/privacy" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "underline", padding: "6px 8px" }}>Privacy Policy</a>
          <button onClick={() => choose(false)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,0.06)", color: "var(--text-primary)", border: "1px solid var(--border)", cursor: "pointer", fontFamily: "inherit" }}>Decline</button>
          <button onClick={() => choose(true)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "linear-gradient(135deg,var(--accent),var(--accent-dark))", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Accept</button>
        </div>
      </div>
    </div>
  );
}

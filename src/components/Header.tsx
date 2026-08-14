"use client";
import Link from "next/link";
import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase";

type User = { email: string | null } | null;

export default function Header({ user }: { user?: User }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    const supabase = getBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo">
          <div className="logo-icon">✦</div>
          <span className="logo-text">MysticSage</span>
        </Link>
        <nav className={"nav" + (open ? " open" : "")}>
          <Link href="/" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/services" onClick={() => setOpen(false)}>Services</Link>
          <Link href="/pricing" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/about" onClick={() => setOpen(false)}>About</Link>
          <Link href="/blog" onClick={() => setOpen(false)}>Blog</Link>
          <Link href="/cards" onClick={() => setOpen(false)}>Card Meanings</Link>
          <Link href="/reading" onClick={() => setOpen(false)}>Free Reading</Link>

          {user?.email ? (
            <>
              <span className="header-email" style={{ color: "var(--text-secondary)", fontSize: 13 }}>{user.email}</span>
              <button
                className="btn-header"
                onClick={() => { setOpen(false); handleLogout(); }}
                disabled={signingOut}
                style={{ opacity: signingOut ? 0.6 : 1 }}
              >
                {signingOut ? "..." : "Logout"}
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="btn-header" onClick={() => setOpen(false)}>Sign In</Link>
          )}
        </nav>
        <button className="hamburger" aria-label="Menu" onClick={() => setOpen(!open)}>
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}

"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

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
          <Link href="/reading" onClick={() => setOpen(false)}>Free Reading</Link>
          <Link href="/auth/login" className="btn-header" onClick={() => setOpen(false)}>Sign In</Link>
        </nav>
        <button className="hamburger" aria-label="Menu" onClick={() => setOpen(!open)}>
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link href="/" className="logo" style={{marginBottom:8,display:"inline-flex",alignItems:"center",gap:8}}>
            <div className="logo-icon">✦</div>
            <span className="logo-text">MysticSage</span>
          </Link>
          <p>Spiritual guidance and wellness for the modern seeker. <strong>For entertainment and spiritual wellness purposes only.</strong></p>
        </div>
        <div>
          <h4>Services</h4>
          <Link href="/services">Tarot Reading</Link>
          <Link href="/services">Astrology</Link>
          <Link href="/services">Numerology</Link>
          <Link href="/services">Relationship</Link>
          <Link href="/services">Career Reading</Link>
        </div>
        <div>
          <h4>Company</h4>
          <Link href="/about">About Us</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div>
          <h4>Support</h4>
          <Link href="/help">Help Center</Link>
          <Link href="/refund">Refund Policy</Link>
          <Link href="/safety">Safety</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <strong>&copy; 2026 MysticSage.</strong> All rights reserved.
        <div className="disclaimer">All readings are for entertainment and spiritual wellness purposes only. They are not a substitute for professional medical, legal, or financial advice. Must be 18+.</div>
      </div>
    </footer>
  );
}

import Link from "next/link";

const services = [
  { icon: "🔮", title: "Free Tarot Reading", desc: "Ask an open-ended question and receive a three-card AI tarot reading designed for reflection." },
  { icon: "📜", title: "Detailed Tarot Report", desc: "A one-time, personalized 10-card Celtic Cross report generated after payment verification and delivered by email." },
  { icon: "✦", title: "Mystic Plus", desc: "An active monthly subscription for premium 10-card readings, subject to fair-use and abuse-prevention controls." },
];

export default function Services() {
  return <><section className="page-header"><h1>Tarot Reading Services</h1><p>AI-powered tarot tools for reflection and spiritual wellness.</p></section><section className="section"><div className="container"><div className="service-detail-grid">{services.map((service) => <div className="service-detail-card" key={service.title}><div className="icon">{service.icon}</div><div><h3>{service.title}</h3><p>{service.desc}</p></div></div>)}</div></div></section><section className="section cta-section"><h2 className="section-title centered" style={{ textAlign: "center" }}>Start with a free reading</h2><p>Readings are for entertainment and reflection, not medical, legal, or financial advice.</p><Link href="/reading" className="btn-primary" style={{ display: "inline-flex" }}>✦ Try Free Tarot</Link></section></>;
}

import Link from "next/link";

const topics = [
  { q: "How do I get a free reading?", a: "Go to the reading page, type your question, and pull three cards. It is free and no account is required. Free usage is limited to one reading per day." },
  { q: "What does Mystic Plus include?", a: "Mystic Plus is a $19 monthly subscription for premium 10-card Celtic Cross readings. It is subject to fair-use and abuse-prevention controls." },
  { q: "What happens after I buy a Detailed Report?", a: "After PayPal verifies the $4.99 payment, MysticSage generates a personalized 10-card report and sends it to the purchaser's email. This purchase does not create a subscription." },
  { q: "How do I cancel Mystic Plus?", a: "Email mountain0342@gmail.com from the address used for payment. Access continues until the end of the current billing period after cancellation is processed." },
  { q: "Are my readings private?", a: "We do not sell reading data. Signed-in reading history is stored only to provide the service and is subject to the privacy policy." },
];

export default function HelpPage() { return <><section className="page-header"><h1>Help Center</h1><p>Answers about the current products and billing process.</p></section><section className="section"><div className="container" style={{ maxWidth: 750, margin: "0 auto" }}>{topics.map(topic => <div key={topic.q} style={{ marginBottom: 12, padding: "20px 24px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12 }}><h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>{topic.q}</h3><p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{topic.a}</p></div>)}<div style={{ textAlign: "center", marginTop: 40 }}><Link href="/contact" className="btn-secondary" style={{ display: "inline-flex" }}>Contact Us</Link></div></div></section></>; }

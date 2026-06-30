import Link from "next/link";

const services = [
  {icon:"🔮",title:"Tarot Reading",desc:"A timeless tool for self-reflection. Our skilled tarot readers interpret the cards to reveal hidden patterns, illuminate your path, and empower your choices. Available as live video, audio call, or detailed written report."},
  {icon:"🌙",title:"Birth Chart & Astrology",desc:"Your natal chart is a cosmic map of your potential. Through detailed analysis of planetary positions at your moment of birth, we reveal your core strengths, challenges, and life themes. Includes transit forecasts."},
  {icon:"🔢",title:"Numerology Reading",desc:"Numbers hold the key to your life rhythms. Calculate your Life Path, Expression, and Soul Urge numbers to understand your core drive, talents, and the timing of major life cycles."},
  {icon:"💞",title:"Love & Relationship",desc:"Navigate the complexities of the heart with compassion. Whether you are single, dating, partnered, or healing from a breakup, our readers provide clarity on dynamics, timing, and compatibility."},
  {icon:"💼",title:"Career & Financial",desc:"Seek clarity on your professional path. Understand the timing of career transitions, discover your natural gifts, and gain insight into financial cycles and abundance blocks."},
  {icon:"🧘",title:"Spiritual Counseling",desc:"A non-judgmental space to unpack life big questions. Our spiritual counselors blend intuitive guidance with compassionate listening to help you reconnect with your inner compass."},
  {icon:"👥",title:"Couples & Synastry",desc:"Explore the cosmic dynamics between you and another person. Synastry and composite chart readings reveal strengths, challenges, and growth opportunities in any relationship."},
  {icon:"🤖",title:"AI Instant Reading",desc:"Need quick insight? Our AI-powered reading provides an instant, personalized tarot or astrology interpretation. A great starting point before diving deeper with a human reader."},
];

const reports = [
  {icon:"📜",title:"Full Birth Chart Report",desc:"A 20+ page deep dive into your natal chart including planetary placements, houses, aspects, and a personalized life theme analysis."},
  {icon:"📅",title:"Annual Forecast",desc:"Your complete year ahead. Monthly transits, key dates, and guidance for love, career, and personal growth across all 12 months."},
  {icon:"💞",title:"Couples Compatibility Report",desc:"A full synastry and composite analysis for two charts. Understand your connection on every level: emotional, intellectual, physical, and spiritual."},
];

export default function Services() {
  return (
    <>
      <section className="page-header">
        <h1>Our Services</h1>
        <p>Ancient wisdom, delivered with modern care. Find the reading that speaks to you.</p>
      </section>
      <section className="section">
        <div className="container">
          <div className="service-detail-grid">
            {services.map((s,i)=>(
              <div className="service-detail-card" key={i}>
                <div className="icon">{s.icon}</div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-tag">Premium Reports</div>
          <h2 className="section-title">Deep-dive personalized reports</h2>
          <p className="section-sub">For those who want the full picture. Our comprehensive written reports are crafted after detailed analysis and delivered straight to your inbox.</p>
          <div className="services-grid">
            {reports.map((r,i)=>(
              <div className="service-card" key={i}>
                <span className="icon">{r.icon}</span>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section cta-section">
        <h2 className="section-title centered" style={{textAlign:"center"}}>Not sure where to start?</h2>
        <p>Take our quick compatibility quiz and we will recommend the perfect reading for where you are right now.</p>
        <Link href="/reading" className="btn-primary" style={{display:"inline-flex"}}>✦ Find My Reading</Link>
      </section>
    </>
  );
}

import Link from "next/link";

export default function About() {
  return (
    <>
      <section className="page-header">
        <h1>Our Story</h1>
        <p>We believe everyone deserves access to clarity, compassion, and cosmic wisdom.</p>
      </section>
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div>
              <div className="section-tag">About Us</div>
              <h2 className="section-title" style={{marginBottom:16}}>Where ancient wisdom meets modern wellness</h2>
              <p style={{color:"var(--text-secondary)",marginBottom:16,lineHeight:1.8}}>MysticSage was born from a simple observation: in an increasingly complex world, people are hungry for meaning, connection, and guidance that feels personally relevant.</p>
              <p style={{color:"var(--text-secondary)",marginBottom:16,lineHeight:1.8}}>We created a platform that honors the rich traditions of tarot, astrology, numerology, and intuitive arts while making them accessible to a modern, global audience. Every reader on our platform is carefully vetted not just for their abilities, but for their empathy, ethics, and commitment to compassionate guidance.</p>
              <p style={{color:"var(--text-muted)",lineHeight:1.8}}>We are not about predicting a fixed future. We believe in empowering you to understand the patterns, timing, and possibilities so you can make choices aligned with your highest good.</p>
            </div>
            <div>
              <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:24,padding:32}}>
                <div className="about-stats">
                  <div className="about-stat"><span className="num">50K+</span><span className="label">Readings Completed</span></div>
                  <div className="about-stat"><span className="num">500+</span><span className="label">Verified Readers</span></div>
                  <div className="about-stat"><span className="num">30+</span><span className="label">Countries Served</span></div>
                  <div className="about-stat"><span className="num">4.9★</span><span className="label">Average Rating</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-tag">Our Principles</div>
          <h2 className="section-title">What we stand for</h2>
          <p className="section-sub">Our platform is built on four core values that guide every decision we make.</p>
          <div className="services-grid">
            {[
              {icon:"🔒",title:"Privacy First",desc:"Your sessions are anonymous and end-to-end encrypted. We never share your personal information or reading history."},
              {icon:"🛡️",title:"Trust & Transparency",desc:"Every reader is thoroughly vetted. Pricing is displayed upfront with zero hidden fees. Our review system is verified and unfiltered."},
              {icon:"🧭",title:"Empowerment, Not Dependence",desc:"Our goal is to give you clarity and tools, not create dependency. We encourage critical thinking and personal agency."},
              {icon:"🌍",title:"Inclusive & Accessible",desc:"We welcome everyone regardless of background, belief system, identity, or orientation. Free tier available so cost is never a barrier."},
              {icon:"📋",title:"Ethical Standards",desc:"All readings are provided for entertainment and spiritual wellness purposes. No medical, legal, or financial advice."},
              {icon:"💬",title:"Community First",desc:"We are building more than a platform — we are building a community. Member forums, shared experiences, and group events."},
            ].map((v,i)=>(
              <div className="service-card" key={i}>
                <span className="icon">{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-tag">Our Readers</div>
          <h2 className="section-title">Expertly vetted, deeply compassionate</h2>
          <p className="section-sub">Every reader on MysticSage passes a rigorous multi-stage vetting process. We accept fewer than 15% of applicants.</p>
          <div className="steps">
            {[
              {num:"1",title:"Background Check",desc:"All applicants complete a detailed background check and identity verification before being considered."},
              {num:"2",title:"Skill Assessment",desc:"Candidates undergo a comprehensive evaluation of their chosen discipline by our panel of senior readers."},
              {num:"3",title:"Trial Period",desc:"New readers serve a monitored trial period with anonymous quality checks and community feedback."},
              {num:"4",title:"Ongoing QA",desc:"Readers are continuously evaluated through client ratings, mystery shopping, and peer reviews."},
            ].map((s,i)=>(
              <div className="step" key={i}>
                <div className="num">{s.num}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

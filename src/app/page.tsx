import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="section-tag">Find Your Clarity</div>
            <h1>Your journey to <span className="highlight">inner clarity</span> begins here</h1>
            <p>Connect with expert guides for tarot readings, astrological insights, numerology and spiritual counseling. A safe space for self-discovery, emotional healing, and life guidance.</p>
            <div className="hero-buttons">
              <Link href="/reading" className="btn-primary">✦ Get Your Free Tarot Pull</Link>
              <Link href="/services" className="btn-secondary">Explore Services</Link>
            </div>
            <div className="hero-stats-row">
              <div className="hs-item"><span className="hs-num">50K+</span><span className="hs-label">Readings Done</span></div>
              <div className="hs-item"><span className="hs-num">4.9★</span><span className="hs-label">Avg Rating</span></div>
              <div className="hs-item"><span className="hs-num">99%</span><span className="hs-label">Satisfied Clients</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="card-badge">Daily Free Reading</div>
              <div className="card-title">Your Cards Today</div>
              <div className="card-cards">
                <div className="mini-card" style={{background:"linear-gradient(145deg,rgba(180,100,255,0.15),rgba(88,56,250,0.08))"}}>🌙</div>
                <div className="mini-card" style={{background:"linear-gradient(145deg,rgba(80,150,255,0.15),rgba(80,200,120,0.08))"}}>⭐</div>
                <div className="mini-card" style={{background:"linear-gradient(145deg,rgba(255,200,50,0.15),rgba(180,100,255,0.08))"}}>🔮</div>
              </div>
              <div style={{fontSize:13,color:"var(--text-muted)",lineHeight:1.5}}>The Star, The Moon &amp; The Sun — a powerful combination suggesting clarity is near.</div>
              <Link href="/reading" className="card-cta" style={{display:"block"}}>✨ Pull Your Cards</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section" id="services">
        <div className="container">
          <div className="section-tag">What We Offer</div>
          <h2 className="section-title">Guidance for every chapter of your life</h2>
          <p className="section-sub">Whether you are seeking answers about love, career, or personal growth, our experienced readers provide compassionate, insightful guidance tailored to you.</p>
          <div className="services-grid">
            {[
              {icon:"🔮",title:"Tarot Reading",desc:"Ancient wisdom meets modern insight. Our tarot readers reveal the patterns shaping your path and illuminate the choices ahead."},
              {icon:"🌙",title:"Astrology & Birth Chart",desc:"Discover the cosmic blueprint of your personality, relationships, and life purpose through detailed natal chart analysis."},
              {icon:"🔢",title:"Numerology",desc:"Uncover the hidden meanings in your name and birth date. Understand your life path number and the cycles shaping your journey."},
              {icon:"💞",title:"Relationship Guidance",desc:"Gain clarity on matters of the heart. Explore compatibility, navigate challenges, and understand the dynamics of your connections."},
              {icon:"💼",title:"Career & Life Purpose",desc:"Find direction when the path is not clear. Discover your strengths, timing, and the opportunities aligned with your highest potential."},
              {icon:"🧘",title:"Spiritual Counseling",desc:"A compassionate space for emotional healing, self-reflection, and reconnecting with your inner wisdom."},
            ].map((s,i)=>(
              <div className="service-card" key={i}>
                <span className="icon">{s.icon}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container">
          <div className="section-tag">Simple Process</div>
          <h2 className="section-title centered">How it works</h2>
          <p className="section-sub centered">Get the clarity you need in four simple steps.</p>
          <div className="steps">
            {[
              {num:"1",title:"Choose Your Service",desc:"Browse our range of readings and find the one that resonates with what you are seeking."},
              {num:"2",title:"Pick Your Guide",desc:"Browse reader profiles, read reviews, and choose the one whose energy aligns with you."},
              {num:"3",title:"Receive Your Reading",desc:"Connect via private chat, voice, or video. Or get an instant AI-generated reading to start."},
              {num:"4",title:"Gain Clarity",desc:"Walk away with actionable insights, a renewed sense of direction, and peace of mind."},
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

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <div className="section-tag">Real Stories</div>
          <h2 className="section-title centered">What our community says</h2>
          <p className="section-sub centered">Thousands have found clarity, comfort, and direction through our platform.</p>
          <div className="testimonials">
            {[
              {stars:"★★★★★",quote:"I was at a crossroads in my career and my tarot session gave me the clarity I desperately needed. The reading was eerily accurate and deeply compassionate.",name:"Sarah M.",handle:"New York, USA",avatar:"S"},
              {stars:"★★★★★",quote:"My birth chart reading helped me understand relationship patterns I have been repeating for years. It was eye-opening and truly healing.",name:"James K.",handle:"London, UK",avatar:"J"},
              {stars:"★★★★★",quote:"I was skeptical at first, but the numerology reading was spot-on about my life path. It gave me a framework for understanding myself that therapy never did.",name:"Elena R.",handle:"Toronto, Canada",avatar:"E"},
            ].map((t,i)=>(
              <div className="testimonial" key={i}>
                <div className="stars">{t.stars}</div>
                <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
                <div className="author">
                  <div className="avatar">{t.avatar}</div>
                  <div>
                    <div className="name">{t.name}</div>
                    <div className="handle">{t.handle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <h2 className="section-title centered" style={{textAlign:"center"}}>Ready to find your clarity?</h2>
        <p>Start with a free daily tarot pull, or dive deep with a personalized reading from one of our expert guides.</p>
        <Link href="/reading" className="btn-primary" style={{display:"inline-flex"}}>✦ Get Your Free Reading</Link>
      </section>
    </>
  );
}

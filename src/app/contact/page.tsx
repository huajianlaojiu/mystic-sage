import Link from "next/link";

export default function ContactPage() {
  return (
    <>
      <section className="page-header">
        <h1>Contact Us</h1>
        <p>We are here to help. Reach out with any questions or feedback.</p>
      </section>
      <section className="section">
        <div className="container" style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:48}}>
            <div className="service-card" style={{textAlign:"center",padding:32}}>
              <div style={{fontSize:36,marginBottom:12}}>💬</div>
              <h3 style={{fontSize:15,fontWeight:600,color:"var(--text-primary)",marginBottom:6}}>Email Us</h3>
              <p style={{fontSize:14,color:"var(--text-muted)",marginBottom:8}}>For questions, support, or feedback</p>
              <a href="mailto:mountain0342@gmail.com" style={{color:"var(--accent)",fontSize:14,fontWeight:500}}>mountain0342@gmail.com</a>
            </div>
            <div className="service-card" style={{textAlign:"center",padding:32}}>
              <div style={{fontSize:36,marginBottom:12}}>🔮</div>
              <h3 style={{fontSize:15,fontWeight:600,color:"var(--text-primary)",marginBottom:6}}>Reading Support</h3>
              <p style={{fontSize:14,color:"var(--text-muted)",marginBottom:8}}>Help with your tarot reading or account</p>
              <Link href="/faq" style={{color:"var(--accent)",fontSize:14,fontWeight:500}}>Visit FAQ</Link>
            </div>
          </div>

          <div className="service-card" style={{padding:32}}>
            <h3 style={{fontSize:16,fontWeight:600,color:"var(--text-primary)",marginBottom:8}}>Send us a message</h3>
            <p style={{fontSize:14,color:"var(--text-muted)",marginBottom:20}}>We typically respond within 24 hours.</p>
            <a href="mailto:mountain0342@gmail.com?subject=Question%20about%20MysticSage" className="btn-primary" style={{display:"inline-flex"}}>Send Email</a>
          </div>

          <div style={{marginTop:32,padding:24,border:"1px solid var(--border)",borderRadius:16,background:"var(--bg-card)"}}>
            <h3 style={{fontSize:14,fontWeight:600,color:"var(--text-primary)",marginBottom:8}}>Frequently asked</h3>
            <div style={{fontSize:13,color:"var(--text-muted)",lineHeight:1.8}}>
              <p><strong style={{color:"var(--text-secondary)"}}>How long does it take to get a response?</strong> We respond within 24 hours on business days.</p>
              <p style={{marginTop:8}}><strong style={{color:"var(--text-secondary)"}}>Can I request a refund?</strong> Yes, contact us at mountain0342@gmail.com with your order details.</p>
              <p style={{marginTop:8}}><strong style={{color:"var(--text-secondary)"}}>Do you offer custom readings?</strong> Yes, email us with your specific needs and we will match you with a reader.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

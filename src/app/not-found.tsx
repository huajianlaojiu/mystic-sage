import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <section className="page-header">
        <h1>This page has drifted away</h1>
        <p>The link may be old or mistyped. Here are the paths most people are looking for.</p>
      </section>
      <section className="section">
        <div className="container" style={{maxWidth:700,margin:"0 auto",textAlign:"center"}}>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:48}}>
            <Link href="/reading" className="btn-primary">Get a Free Tarot Reading</Link>
            <Link href="/" className="btn-secondary">Back to Home</Link>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
            <Link href="/cards" style={{textDecoration:"none",color:"inherit"}}>
              <div className="service-card" style={{padding:20,cursor:"pointer"}}>
                <div style={{fontSize:28,marginBottom:6}}>🃏</div>
                <h3 style={{fontSize:14,fontWeight:600,color:"var(--text-primary)"}}>Tarot Card Meanings</h3>
              </div>
            </Link>
            <Link href="/blog" style={{textDecoration:"none",color:"inherit"}}>
              <div className="service-card" style={{padding:20,cursor:"pointer"}}>
                <div style={{fontSize:28,marginBottom:6}}>📖</div>
                <h3 style={{fontSize:14,fontWeight:600,color:"var(--text-primary)"}}>Guides & Articles</h3>
              </div>
            </Link>
            <Link href="/services" style={{textDecoration:"none",color:"inherit"}}>
              <div className="service-card" style={{padding:20,cursor:"pointer"}}>
                <div style={{fontSize:28,marginBottom:6}}>🌙</div>
                <h3 style={{fontSize:14,fontWeight:600,color:"var(--text-primary)"}}>All Services</h3>
              </div>
            </Link>
            <Link href="/help" style={{textDecoration:"none",color:"inherit"}}>
              <div className="service-card" style={{padding:20,cursor:"pointer"}}>
                <div style={{fontSize:28,marginBottom:6}}>💬</div>
                <h3 style={{fontSize:14,fontWeight:600,color:"var(--text-primary)"}}>Help Center</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

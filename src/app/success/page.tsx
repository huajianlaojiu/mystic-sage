import Link from "next/link";

export default function SuccessPage() {
  return (
    <>
      <section className="page-header">
        <h1>Thank you for your purchase!</h1>
        <p>Your order is being processed. You will receive a confirmation email shortly.</p>
      </section>
      <section className="section">
        <div className="container" style={{maxWidth:500,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:72,marginBottom:24}}>✨</div>
          <h3 style={{fontSize:22,fontWeight:600,color:"var(--text-primary)",marginBottom:12}}>Welcome to the MysticSage community</h3>
          <p style={{color:"var(--text-muted)",fontSize:15,lineHeight:1.7,marginBottom:32}}>
            Your reading or subscription has been confirmed. If you purchased a premium report, it will arrive in your inbox within 48 hours. For subscriptions, your member benefits are now active.
          </p>
          <Link href="/reading" className="btn-primary" style={{display:"inline-flex",marginBottom:12}}>✦ Get a Free Reading</Link>
          <br />
          <Link href="/" className="btn-secondary" style={{display:"inline-flex"}}>Back to Home</Link>
        </div>
      </section>
    </>
  );
}

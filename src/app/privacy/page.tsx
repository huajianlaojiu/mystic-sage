export default function PrivacyPage() {
  return (
    <>
      <section className="page-header">
        <h1>Privacy Policy</h1>
        <p>Last updated: July 2026</p>
      </section>
      <section className="section">
        <div className="container" style={{maxWidth:800,margin:"0 auto"}}>

          <div style={{marginBottom:24}}>
            <h3 style={{fontSize:16,fontWeight:600,color:"var(--text-primary)",marginBottom:8}}>1. Information We Collect</h3>
            <p style={{color:"var(--text-secondary)",fontSize:14,lineHeight:1.7}}>
              We collect information you provide directly, such as your name and email address when you create an account or purchase a reading. We also collect anonymous usage data through Google Analytics, including pages visited and time spent on the site.
            </p>
          </div>

          <div style={{marginBottom:24}}>
            <h3 style={{fontSize:16,fontWeight:600,color:"var(--text-primary)",marginBottom:8}}>2. How We Use Your Information</h3>
            <p style={{color:"var(--text-secondary)",fontSize:14,lineHeight:1.7}}>
              We use your information to provide and improve our services, process payments, send you your reading results, and communicate with you about your account. We never sell your personal information to third parties.
            </p>
          </div>

          <div style={{marginBottom:24}}>
            <h3 style={{fontSize:16,fontWeight:600,color:"var(--text-primary)",marginBottom:8}}>3. Data Storage &amp; Security</h3>
            <p style={{color:"var(--text-secondary)",fontSize:14,lineHeight:1.7}}>
              Your data is stored securely on US-based servers (Supabase). We implement industry-standard security measures including encryption in transit and at rest. Payment processing is handled entirely by PayPal — we never see or store your payment details.
            </p>
          </div>

          <div style={{marginBottom:24}}>
            <h3 style={{fontSize:16,fontWeight:600,color:"var(--text-primary)",marginBottom:8}}>4. GDPR Rights (European Users)</h3>
            <p style={{color:"var(--text-secondary)",fontSize:14,lineHeight:1.7}}>
              If you are a resident of the European Economic Area, you have the right to access, correct, update, or delete your personal data. You may also object to or restrict processing of your data. To exercise these rights, please contact us.
            </p>
          </div>

          <div style={{marginBottom:24}}>
            <h3 style={{fontSize:16,fontWeight:600,color:"var(--text-primary)",marginBottom:8}}>5. CCPA Rights (California Users)</h3>
            <p style={{color:"var(--text-secondary)",fontSize:14,lineHeight:1.7}}>
              California residents have the right to request disclosure of personal information collected, request deletion of personal information, and opt out of the sale of personal information. We do not sell personal information.
            </p>
          </div>

          <div style={{marginBottom:24}}>
            <h3 style={{fontSize:16,fontWeight:600,color:"var(--text-primary)",marginBottom:8}}>6. Cookies</h3>
            <p style={{color:"var(--text-secondary)",fontSize:14,lineHeight:1.7}}>
              We use essential cookies for site functionality and Google Analytics cookies to understand how visitors interact with our site. You can control cookie preferences through your browser settings.
            </p>
          </div>

          <div style={{marginBottom:24}}>
            <h3 style={{fontSize:16,fontWeight:600,color:"var(--text-primary)",marginBottom:8}}>7. Contact</h3>
            <p style={{color:"var(--text-secondary)",fontSize:14,lineHeight:1.7}}>
              For privacy-related inquiries, please contact us at mountain0342@gmail.com. We will respond within 30 days.
            </p>
          </div>

          <div style={{padding:16,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,marginTop:24}}>
            <p style={{color:"var(--text-muted)",fontSize:12,lineHeight:1.5}}>
              This service is for entertainment and spiritual wellness purposes only. Readings are not a substitute for professional medical, legal, or financial advice. All users must be 18 years or older.
            </p>
          </div>

        </div>
      </section>
    </>
  );
}

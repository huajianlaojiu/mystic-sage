import Link from "next/link";

const faqs = [
  { q: "Is MysticSage really free?", a: "Yes! Our daily tarot card pull is completely free. You can ask a question and receive a three-card tarot reading with interpretation at no cost. Premium subscriptions and detailed reports are available for those who want deeper insights." },
  { q: "How accurate are AI tarot readings?", a: "Our AI readings combine traditional tarot symbolism with modern interpretation techniques. While no reading can predict the future with certainty, many users find the insights remarkably relevant to their situations. Readings are for guidance and reflection purposes." },
  { q: "What kind of questions can I ask?", a: "You can ask about love, career, personal growth, relationships, or any area where you seek clarity. Open-ended questions tend to yield the most insightful readings." },
  { q: "Is my reading private?", a: "Absolutely. All readings are anonymous and we never share your reading history or personal information. Your data is encrypted and protected." },
  { q: "Do I need to create an account?", a: "No account is needed for the free daily tarot reading. Creating an account lets you save your reading history and access premium features." },
  { q: "How do I upgrade to a paid plan?", a: "Visit our pricing page to choose a plan. We accept PayPal for secure payments. Subscriptions auto-renew unless cancelled." },
  { q: "Can I get a refund?", a: "Refund requests are handled on a case-by-case basis. Contact us at mountain0342@gmail.com with your order details for assistance." },
  { q: "How do I cancel my subscription?", a: "Contact us at mountain0342@gmail.com from the email you used to subscribe and we will process your cancellation." },
];

export default function FAQPage() {
  return (
    <>
      <section className="page-header">
        <h1>Frequently Asked Questions</h1>
        <p>Everything you need to know about MysticSage.</p>
      </section>
      <section className="section">
        <div className="container" style={{maxWidth:750,margin:"0 auto"}}>
          <div itemScope itemType="https://schema.org/FAQPage">
            {faqs.map((faq,i) => (
              <div key={i} itemScope itemProp="mainEntity" itemType="https://schema.org/Question"
                style={{marginBottom:12,padding:"20px 24px",background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:12}}>
                <h3 itemProp="name" style={{fontSize:15,fontWeight:600,color:"var(--text-primary)",marginBottom:6}}>{faq.q}</h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <div itemProp="text" style={{fontSize:14,color:"var(--text-muted)",lineHeight:1.6}}>{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:40}}>
            <p style={{fontSize:14,color:"var(--text-muted)",marginBottom:12}}>Still have questions?</p>
            <Link href="/contact" className="btn-secondary" style={{display:"inline-flex"}}>Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}

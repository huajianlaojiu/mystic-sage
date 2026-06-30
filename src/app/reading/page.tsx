"use client";
import { useState } from "react";
type Card = { name: string; keywords: string; position: string; emoji: string };
type Reading = { reading: string; cards: Card[] };

export default function ReadingPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Reading | null>(null);
  const [error, setError] = useState("");

  async function startReading() {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/reading", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question || "What do I need to know right now?" })
      });
      const d = await r.json();
      if (d.error) { setError(d.error); setLoading(false); return; }
      setResult(d);
    } catch { setError("Could not connect. Try again."); }
    setLoading(false);
  }

  return (<><section className="page-header"><h1>Free Daily Tarot</h1><p>Ask a question and pull three cards.</p></section>
    <section className="section"><div className="container" style={{maxWidth:680,margin:"0 auto"}}><div style={{textAlign:"center"}}>

    {!result && !loading && (<><div style={{fontSize:48}}>馃敭</div>
      <h3 style={{fontSize:20,fontWeight:600,color:"var(--text-primary)",margin:"12px 0 8px"}}>What would you like guidance on?</h3>
      <p style={{color:"var(--text-muted)",fontSize:14,marginBottom:20}}>Free AI tarot reading</p>
      <textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="e.g. How can I grow in my career?" rows={3}
        style={{width:"100%",maxWidth:500,padding:"14px 16px",borderRadius:12,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--text-primary)",fontSize:14,fontFamily:"inherit",resize:"none",outline:"none",marginBottom:20}} />
      <br /><button onClick={startReading} className="btn-primary" style={{fontSize:16,padding:"14px 44px"}}>Pull Your Cards</button></>)}

    {loading && <div style={{padding:40}}><p style={{color:"var(--text-muted)"}}>Consulting the cards...</p></div>}

    {error && <div style={{padding:20,background:"rgba(255,80,80,0.08)",border:"1px solid rgba(255,80,80,0.2)",borderRadius:12,margin:"16px auto",maxWidth:400}}>
      <p style={{color:"#ff5050",fontSize:14}}>{error}</p>
      <button onClick={()=>{setError("");setLoading(false);}} className="btn-secondary" style={{marginTop:12}}>Try Again</button></div>}

    {result && !loading && (<>
      <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:20,flexWrap:"wrap"}}>
        {result.cards.map((c:Card,i:number)=>(<div key={i} style={{width:120,height:175,borderRadius:12,border:"1px solid var(--border)",background:"linear-gradient(145deg,rgba(180,100,255,0.12),rgba(88,56,250,0.06))",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:10}}>
          <div style={{fontSize:28}}>{c.emoji}</div>
          <div style={{fontSize:9,fontWeight:600,color:"var(--accent)",textTransform:"uppercase"}}>{c.position}</div>
          <div style={{fontSize:11,fontWeight:600,color:"var(--text-primary)",margin:"2px 0"}}>{c.name}</div>
          <div style={{fontSize:8,color:"var(--text-muted)"}}>{c.keywords}</div></div>))}
      </div>
      <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:16,padding:"24px 20px",margin:"0 auto 20px",maxWidth:600,textAlign:"left"}}>
        <div style={{fontSize:14,color:"var(--text-secondary)",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{result.reading}</div>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:16}}>
        <form action="https://www.sandbox.paypal.com/cgi-bin/webscr" method="post" target="_blank">
          <input type="hidden" name="cmd" value="_xclick" />
          <input type="hidden" name="business" value="mountain0342@gmail.com" />
          <input type="hidden" name="item_name" value="Unlimited Readings" />
          <input type="hidden" name="amount" value="19.00" />
          <input type="hidden" name="currency_code" value="USD" />
          
          <button type="submit" className="btn-primary" style={{fontSize:13,padding:"10px 18px"}}>Get Unlimited - $19/mo</button>
        </form>
        <form action="https://www.sandbox.paypal.com/cgi-bin/webscr" method="post" target="_blank">
          <input type="hidden" name="cmd" value="_xclick" />
          <input type="hidden" name="business" value="mountain0342@gmail.com" />
          <input type="hidden" name="item_name" value="Detailed Report" />
          <input type="hidden" name="amount" value="4.99" />
          <input type="hidden" name="currency_code" value="USD" />
          
          <button type="submit" className="btn-secondary" style={{fontSize:13,padding:"10px 18px"}}>Detailed Report - $4.99</button>
        </form>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:8,marginTop:16}}>
  <a href="/success" className="btn-primary" style={{fontSize:13,padding:"10px 18px",textDecoration:"none"}}>Test: $4.99 Payment</a>
  <a href="/success" className="btn-secondary" style={{fontSize:13,padding:"10px 18px",textDecoration:"none"}}>Test: $19/mo Payment</a>
</div>
              <button onClick={()=>{setResult(null);setQuestion("");setError("");}} className="btn-secondary" style={{fontSize:13}}>Draw Again (Free)</button>
    </>)}
  </div></div></section></>);
}

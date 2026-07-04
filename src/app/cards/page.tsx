import Link from "next/link";
import { cardMeanings } from "@/content/cards";

export default function CardsPage() {
  return (
    <>
      <section className="page-header">
        <h1>Tarot Card Meanings</h1>
        <p>Discover the meanings of all 22 Major Arcana cards.</p>
      </section>
      <section className="section">
        <div className="container">
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16}}>
            {cardMeanings.map(function(c) {
              return (
                <Link key={c.slug} href={"/cards/" + c.slug} style={{textDecoration:"none",color:"inherit"}}>
                  <div className="service-card" style={{padding:16,cursor:"pointer",textAlign:"center"}}>
                    <div style={{fontSize:40,marginBottom:4}}>{c.emoji}</div>
                    <h3 style={{fontSize:14,fontWeight:600,color:"var(--text-primary)"}}>{c.name}</h3>
                    <p style={{fontSize:11,color:"var(--text-muted)",marginTop:4}}>{c.keywords}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

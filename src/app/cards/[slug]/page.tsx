import Link from "next/link";
import { cardMeanings } from "@/content/cards";

export function generateStaticParams() {
  return cardMeanings.map(function(c) { return { slug: c.slug }; });
}

export default function CardPage({ params }: { params: { slug: string } }) {
  const card = cardMeanings.find(function(c) { return c.slug === params.slug; });
  if (!card) return <section className="page-header"><h1>Card not found</h1></section>;

  return (
    <>
      <section className="page-header">
        <h1>{card.emoji} {card.name}</h1>
        <p>{card.keywords}</p>
      </section>
      <section className="section">
        <div className="container" style={{maxWidth:700,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:80,marginBottom:16}}>{card.emoji}</div>
          <div style={{fontSize:15,color:"var(--text-secondary)",lineHeight:1.8,maxWidth:550,margin:"0 auto 32px"}}>{card.description}</div>
          <Link href="/reading" className="btn-primary" style={{display:"inline-flex",marginBottom:32}}>Get a Free Reading</Link>
          <div style={{padding:16,background:"rgba(255,255,255,0.03)",borderRadius:8,marginBottom:24}}>
            <p style={{fontSize:13,color:"var(--text-muted)",marginBottom:8}}>Explore all cards</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>
              {cardMeanings.map(function(c) {
                return (
                  <Link key={c.slug} href={"/cards/" + c.slug}
                    style={{fontSize:11,padding:"4px 10px",borderRadius:4,background:"rgba(180,100,255,0.08)",color:"var(--accent)",textDecoration:"none"}}>
                    {c.emoji} {c.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
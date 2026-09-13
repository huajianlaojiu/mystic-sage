import type { Metadata } from "next";
import Link from "next/link";
import { cardMeanings } from "@/content/cards";

export function generateStaticParams() {
  return cardMeanings.map(function(c) { return { slug: c.slug }; });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const card = cardMeanings.find(function(c) { return c.slug === slug; });
  if (!card) return {};
  const title = card.name + " Tarot Card Meaning - " + card.keywords;
  const description = card.description;
  return {
    title: title + " | MysticSage",
    description,
    alternates: { canonical: "https://mysticsages.com/cards/" + card.slug },
    openGraph: {
      title,
      description,
      url: "https://mysticsages.com/cards/" + card.slug,
      images: [{ url: "https://mysticsages.com/images/og-default.png", width: 1200, height: 630 }],
      type: "article",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

function CardJsonLd({ name, slug, description, keywords }: { name: string; slug: string; description: string; keywords: string }) {
  const url = "https://mysticsages.com/cards/" + slug;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://mysticsages.com/" },
      { "@type": "ListItem", position: 2, name: "Tarot Card Meanings", item: "https://mysticsages.com/cards" },
      { "@type": "ListItem", position: 3, name, item: url },
    ],
  };
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: name + " Tarot Card Meaning",
    description,
    keywords,
    author: { "@type": "Organization", name: "MysticSage" },
    publisher: { "@type": "Organization", name: "MysticSage", logo: { "@type": "ImageObject", url: "https://mysticsages.com/images/og-default.png" } },
    image: "https://mysticsages.com/images/og-default.png",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
    </>
  );
}

export default async function CardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = cardMeanings.find(function(c) { return c.slug === slug; });
  if (!card) return <section className="page-header"><h1>Card not found</h1></section>;

  return (
    <>
      <CardJsonLd name={card.name} slug={card.slug} description={card.description} keywords={card.keywords} />
      <section className="page-header">
        <h1>{card.emoji} {card.name}</h1>
        <p>{card.keywords}</p>
      </section>
      <section className="section">
        <div className="container" style={{maxWidth:700,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:80,marginBottom:16}}>{card.emoji}</div>
          <div style={{fontSize:15,color:"var(--text-secondary)",lineHeight:1.8,maxWidth:550,margin:"0 auto 32px"}}>{card.description}</div>
          <Link href="/reading" className="btn-primary" style={{display:"inline-flex",marginBottom:32}}>Get a Free Reading</Link>
          <p style={{marginBottom:28}}>
            <Link href="/blog/how-to-read-tarot-cards-for-beginners" style={{fontSize:13}}>
              New to tarot? Read the beginner&apos;s guide to reading cards &rarr;
            </Link>
          </p>
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

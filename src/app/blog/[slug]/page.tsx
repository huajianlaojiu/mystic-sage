import Link from "next/link";
import { blogPosts, getRelatedPosts } from "@/content/blog";

export function generateStaticParams() {
  return blogPosts.map(function(post) { return { slug: post.slug }; });
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = blogPosts.find(function(p) { return p.slug === params.slug; });
  if (!post) return {};
  return {
    title: post.title + " | MysticSage",
    description: post.excerpt,
    openGraph: {
      title: post.title + " | MysticSage",
      description: post.excerpt,
      url: "https://mysticsages.com/blog/" + post.slug,
      images: [{ url: "https://mysticsages.com/images/og-default.svg", width: 1200, height: 630 }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title + " | MysticSage",
      description: post.excerpt,
    },
  };
}

function ArticleJsonLd({ post }: { post: { title: string; excerpt: string; date: string; slug: string } }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": post.date,
    "author": { "@type": "Organization", "name": "MysticSage" },
    "publisher": { "@type": "Organization", "name": "MysticSage", "logo": { "@type": "ImageObject", "url": "https://mysticsages.com/images/og-default.svg" } },
    "image": "https://mysticsages.com/images/og-default.svg",
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://mysticsages.com/blog/" + post.slug }
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find(function(p) { return p.slug === params.slug; });
  if (!post) return <section className="page-header"><h1>Post not found</h1></section>;

  const related = getRelatedPosts(post, 3);

  const shareUrl = encodeURIComponent("https://mysticsages.com/blog/" + post.slug);
  const shareText = encodeURIComponent(post.title + "\n\n");

  return (<>
    <ArticleJsonLd post={post} />
    <section className="page-header">
      <h1>{post.title}</h1>
      <p style={{fontSize:13,color:"#666"}}>{post.date} \u00b7 {post.readTime}</p>
    </section>
    <section className="section">
      <div className="container" style={{maxWidth:750,margin:"0 auto"}}>
        <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
          {post.tags.map(function(tag) { return <span key={tag} style={{fontSize:12,padding:"3px 10px",borderRadius:4,background:"rgba(180,100,255,0.12)",color:"var(--accent)"}}>{tag}</span>; })}
        </div>
        <div style={{fontSize:15,color:"var(--text-secondary)",lineHeight:1.9,whiteSpace:"pre-wrap"}}>{post.content}</div>

        {/* Share section */}
        <div style={{marginTop:40,padding:"24px 0",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
          <p style={{fontSize:13,color:"var(--text-muted)",marginBottom:12,textAlign:"center"}}>Share this article</p>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
            <a href={"https://twitter.com/intent/tweet?text=" + shareText + "&url=" + shareUrl}
               target="_blank" rel="noopener noreferrer"
               style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 18px",borderRadius:8,fontSize:13,fontWeight:600,background:"rgba(255,255,255,0.06)",border:"1px solid var(--border)",color:"var(--text-primary)",textDecoration:"none"}}>🔗 Share on X</a>
            <a href={"https://pinterest.com/pin/create/button/?url=" + shareUrl + "&description=" + shareText}
               target="_blank" rel="noopener noreferrer"
               style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 18px",borderRadius:8,fontSize:13,fontWeight:600,background:"rgba(255,255,255,0.06)",border:"1px solid var(--border)",color:"var(--text-primary)",textDecoration:"none"}}>📌 Pin on Pinterest</a>
            <a href={"https://www.facebook.com/sharer/sharer.php?u=" + shareUrl}
               target="_blank" rel="noopener noreferrer"
               style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 18px",borderRadius:8,fontSize:13,fontWeight:600,background:"rgba(255,255,255,0.06)",border:"1px solid var(--border)",color:"var(--text-primary)",textDecoration:"none"}}>📘 Share on Facebook</a>
          </div>
        </div>

        {/* CTA */}
        <div style={{marginTop:32,textAlign:"center"}}>
          <p style={{color:"var(--text-muted)",fontSize:14,marginBottom:12}}>Try a free tarot reading</p>
          <Link href="/reading" className="btn-primary" style={{display:"inline-flex"}}>Get Your Free Reading</Link>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div style={{marginTop:48}}>
            <h2 style={{fontSize:20,fontWeight:600,color:"var(--text-primary)",marginBottom:20,textAlign:"center"}}>Related Articles</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:20}}>
              {related.map(function(r) {
                return (
                  <Link key={r.slug} href={"/blog/" + r.slug} style={{textDecoration:"none",color:"inherit"}}>
                    <div className="service-card" style={{padding:20,cursor:"pointer",height:"100%"}}>
                      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                        {r.tags.slice(0,2).map(function(tag) {
                          return <span key={tag} style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:"rgba(180,100,255,0.12)",color:"var(--accent)"}}>{tag}</span>;
                        })}
                      </div>
                      <h3 style={{fontSize:15,fontWeight:600,color:"var(--text-primary)",marginBottom:8,lineHeight:1.4}}>{r.title}</h3>
                      <p style={{fontSize:13,color:"var(--text-muted)",lineHeight:1.6}}>{r.excerpt}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  </>);
}

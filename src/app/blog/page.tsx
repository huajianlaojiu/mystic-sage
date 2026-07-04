
import Link from "next/link";
import { blogPosts } from "@/content/blog";

export default function BlogPage() {
  return (
    <>
      <section className="page-header">
        <h1>MysticSage Blog</h1>
        <p>Articles about tarot, astrology, numerology, and spiritual guidance.</p>
      </section>
      <section className="section">
        <div className="container">
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:24}}>
            {blogPosts.map(function(post) {
              return (
                <Link key={post.slug} href={"/blog/" + post.slug} style={{textDecoration:"none",color:"inherit"}}>
                  <div className="service-card" style={{padding:24,cursor:"pointer"}}>
                    <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                      {post.tags.map(function(tag) {
                        return <span key={tag} style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:"rgba(180,100,255,0.12)",color:"var(--accent)"}}>{tag}</span>;
                      })}
                    </div>
                    <h3 style={{fontSize:17,fontWeight:600,color:"var(--text-primary)",marginBottom:8}}>{post.title}</h3>
                    <p style={{fontSize:14,color:"var(--text-muted)",lineHeight:1.6,marginBottom:12}}>{post.excerpt}</p>
                    <div style={{fontSize:12,color:"#666"}}>{post.date} · {post.readTime}</div>
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


import Link from "next/link";
import { blogPosts } from "@/content/blog";

export function generateStaticParams() {
  return blogPosts.map(function(post) { return { slug: post.slug }; });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  var post = blogPosts.find(function(p) { return p.slug === params.slug; });
  if (!post) return <section className="page-header"><h1>Post not found</h1></section>;

  return (
    <>
      <section className="page-header">
        <h1>{post.title}</h1>
        <p style={{fontSize:13,color:"#666"}}>{post.date} · {post.readTime}</p>
      </section>
      <section className="section">
        <div className="container" style={{maxWidth:750,margin:"0 auto"}}>
          <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
            {post.tags.map(function(tag) { return <span key={tag} style={{fontSize:12,padding:"3px 10px",borderRadius:4,background:"rgba(180,100,255,0.12)",color:"var(--accent)"}}>{tag}</span>; })}
          </div>
          <div style={{fontSize:15,color:"var(--text-secondary)",lineHeight:1.9,whiteSpace:"pre-wrap"}}>{post.content}</div>
          <div style={{marginTop:40,paddingTop:24,borderTop:"1px solid var(--border)",textAlign:"center"}}>
            <p style={{color:"var(--text-muted)",fontSize:14,marginBottom:12}}>Try a free tarot reading</p>
            <Link href="/reading" className="btn-primary" style={{display:"inline-flex"}}>Get Your Free Reading</Link>
          </div>
        </div>
      </section>
    </>
  );
}

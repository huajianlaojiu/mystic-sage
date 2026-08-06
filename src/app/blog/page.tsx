
import BlogSearch from "@/components/BlogSearch";
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
          <BlogSearch posts={blogPosts} />
        </div>
      </section>
    </>
  );
}

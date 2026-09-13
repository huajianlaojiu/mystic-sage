import { blogPosts, postDateISO } from "@/content/blog";
import { cardMeanings } from "@/content/cards";
export default async function sitemap() {
  const staticPages = [
    "/","/about","/services","/pricing","/reading","/privacy","/success","/blog","/terms","/cards","/contact","/faq","/help","/safety","/refund"
  ].map(function(p) { return { url: "https://mysticsages.com" + p, lastModified: new Date() }; });
  const blogPages = blogPosts.map(function(p) {
    // Each post keeps its own date so lastmod reflects real content changes
    // instead of resetting to the build time on every deploy.
    return { url: "https://mysticsages.com/blog/" + p.slug, lastModified: new Date(postDateISO(p.date)) };
  });
  const cardPages = cardMeanings.map(function(c) { return { url: "https://mysticsages.com/cards/" + c.slug, lastModified: new Date() }; });
  return [...staticPages, ...blogPages, ...cardPages];
}


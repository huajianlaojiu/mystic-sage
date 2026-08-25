import { blogPosts } from "@/content/blog";
import { cardMeanings } from "@/content/cards";
export default async function sitemap() {
  const staticPages = [
    "/","/about","/services","/pricing","/reading","/privacy","/success","/blog","/terms","/cards","/contact","/faq","/help","/safety","/refund"
  ].map(function(p) { return { url: "https://mysticsages.com" + p, lastModified: new Date() }; });
  const blogPages = blogPosts.map(function(p) {
    return { url: "https://mysticsages.com/blog/" + p.slug, lastModified: new Date() };
  });
  const cardPages = cardMeanings.map(function(c) { return { url: "https://mysticsages.com/cards/" + c.slug, lastModified: new Date() }; });
  return [...staticPages, ...blogPages, ...cardPages];
}


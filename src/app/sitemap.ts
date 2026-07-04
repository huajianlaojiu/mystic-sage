import { blogPosts } from "@/content/blog";
import { cardMeanings } from "@/content/cards";
export default async function sitemap() {
  var staticPages = [
    "/","/about","/services","/pricing","/reading","/privacy","/success","/blog","/terms","/cards"
  ].map(function(p) { return { url: "https://mysticsages.com" + p, lastModified: new Date() }; });
  var blogPages = blogPosts.map(function(p) {
    return { url: "https://mysticsages.com/blog/" + p.slug, lastModified: new Date() };
  });
  var cardPages = cardMeanings.map(function(c) { return { url: "https://mysticsages.com/cards/" + c.slug, lastModified: new Date() }; });
  return [...staticPages, ...blogPages, ...cardPages];
}

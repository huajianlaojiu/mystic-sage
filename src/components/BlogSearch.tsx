"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { BlogPost } from "@/content/blog";

export default function BlogSearch({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (activeTag && !p.tags.includes(activeTag)) return false;
      if (!q) return true;
      const hay = (
        p.title + " " + p.excerpt + " " + p.tags.join(" ") + " " + p.content
      ).toLowerCase();
      return hay.includes(q);
    });
  }, [posts, query, activeTag]);

  return (
    <div>
      {/* Search bar */}
      <div style={{ maxWidth: 520, margin: "0 auto 20px" }}>
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 16,
              opacity: 0.5,
            }}
          >
            🔍
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, topics, cards..."
            style={{
              width: "100%",
              padding: "12px 14px 12px 42px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              fontSize: 15,
              fontFamily: "inherit",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Tag filter chips */}
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: 28,
        }}
      >
        <button
          onClick={() => setActiveTag(null)}
          style={{
            fontSize: 12,
            padding: "5px 12px",
            borderRadius: 999,
            cursor: "pointer",
            fontFamily: "inherit",
            border: "1px solid " + (activeTag === null ? "var(--accent)" : "var(--border)"),
            background: activeTag === null ? "rgba(180,100,255,0.15)" : "transparent",
            color: activeTag === null ? "var(--accent)" : "var(--text-muted)",
          }}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            style={{
              fontSize: 12,
              padding: "5px 12px",
              borderRadius: 999,
              cursor: "pointer",
              fontFamily: "inherit",
              border:
                "1px solid " + (activeTag === tag ? "var(--accent)" : "var(--border)"),
              background: activeTag === tag ? "rgba(180,100,255,0.15)" : "transparent",
              color: activeTag === tag ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 15, padding: "40px 0" }}>
          No articles found. Try a different keyword or tag.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
            gap: 24,
          }}
        >
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={"/blog/" + post.slug}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="service-card" style={{ padding: 24, cursor: "pointer", height: "100%" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: "rgba(180,100,255,0.12)",
                        color: "var(--accent)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: 8,
                  }}
                >
                  {post.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-muted)",
                    lineHeight: 1.6,
                    marginBottom: 12,
                  }}
                >
                  {post.excerpt}
                </p>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {post.date} · {post.readTime}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <p
        style={{
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: 13,
          marginTop: 24,
        }}
      >
        {filtered.length} {filtered.length === 1 ? "article" : "articles"}
        {(query || activeTag) && " (filtered)"}
      </p>
    </div>
  );
}

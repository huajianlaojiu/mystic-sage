import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { getSessionUser } from "@/lib/supabase/server";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

export const metadata: Metadata = {
  title: "MysticSage — Spiritual Guidance & Wellness",
  description: "Find clarity through tarot, astrology, numerology and psychic readings. Your journey to self-discovery starts here.",
  openGraph: {
    title: "MysticSage — Free Tarot, Astrology & Numerology Readings",
    description: "Find clarity through tarot, astrology, numerology and psychic readings. Get your free daily tarot pull at MysticSage.",
    url: "https://mysticsages.com",
    siteName: "MysticSage",
    images: [{ url: "https://mysticsages.com/images/og-default.svg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MysticSage — Free Tarot, Astrology & Numerology Readings",
    description: "Find clarity through tarot, astrology, numerology and psychic readings. Get your free daily tarot pull at MysticSage.",
    images: ["https://mysticsages.com/images/og-default.svg"],
  },
  alternates: {
    canonical: "https://mysticsages.com",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Global app fonts loaded via Google Fonts link. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {GA_ID && (
          <>
            <Script strategy="afterInteractive" src={"https://www.googletagmanager.com/gtag/js?id=" + GA_ID} />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag("js", new Date());
                gtag("config", "${GA_ID}");
                gtag("consent", "default", { analytics_storage: "denied" });
              `}
            </Script>
          </>
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Organization\",\n  \"name\": \"MysticSage\",\n  \"url\": \"https://mysticsages.com\",\n  \"logo\": \"https://mysticsages.com/images/og-default.svg\",\n  \"description\": \"Free tarot readings, astrology, numerology and spiritual guidance online.\",\n  \"sameAs\": [\n    \"https://twitter.com/mysticsage\"\n  ]\n}" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"WebSite\",\"name\":\"MysticSage\",\"url\":\"https://mysticsages.com\",\"potentialAction\":{\"@type\":\"SearchAction\",\"target\":{\"@type\":\"EntryPoint\",\"urlTemplate\":\"https://mysticsages.com/search?q={search_term_string}\"},\"query-input\":\"required name=search_term_string\"}}" }} />
        <Header user={user} />
        <main>{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}

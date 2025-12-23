import { Metadata } from "next";
import { CMSAdapter } from "@/lib/cms-adapter";
import HomePageClient from "@/components/home-page-client";

// Generate dynamic metadata from Strapi
export async function generateMetadata(): Promise<Metadata> {
  const seo = await CMSAdapter.getLandingPageSEO();

  if (!seo) {
    return {
      title: "Professional Cleaning Services | Clensy",
      description: "Professional cleaning services for homes and offices in New Jersey.",
    };
  }

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    robots: seo.robots,
    alternates: {
      canonical: seo.canonicalUrl,
    },
    openGraph: {
      title: seo.openGraph.title,
      description: seo.openGraph.description,
      url: seo.canonicalUrl,
      siteName: "Clensy",
      images: seo.openGraph.image
        ? [
            {
              url: seo.openGraph.image,
              width: 1200,
              height: 630,
              alt: "Clensy Professional Cleaning Services",
            },
          ]
        : [],
      type: seo.openGraph.type as "website" | "article",
    },
    twitter: {
      card: seo.twitter.card as "summary_large_image" | "summary",
      title: seo.twitter.title,
      description: seo.twitter.description,
    },
  };
}

// Server component that fetches SEO data and renders client component
export default async function Home() {
  const seo = await CMSAdapter.getLandingPageSEO();

  return (
    <HomePageClient
      schemaJsonLd={seo?.schemaJsonLd}
      additionalSchemas={seo?.additionalSchemas}
      headScripts={seo?.scripts.head}
      bodyEndScripts={seo?.scripts.bodyEnd}
      customCss={seo?.customCss}
    />
  );
}

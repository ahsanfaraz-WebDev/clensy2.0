"use client";

import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import HowItWorks from "@/components/how-it-works";
import ComparisonSection from "@/components/comparison-section";
import ChecklistSection from "@/components/checklist-section";
import ReviewsSection from "@/components/reviews-section";
import CTASection from "@/components/cta-section";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";

interface HomePageClientProps {
  schemaJsonLd?: object | null;
  additionalSchemas?: object[];
  headScripts?: string;
  bodyEndScripts?: string;
  customCss?: string;
}

export default function HomePageClient({
  schemaJsonLd,
  additionalSchemas,
  headScripts,
  bodyEndScripts,
  customCss,
}: HomePageClientProps) {
  return (
    <main className="overflow-x-hidden">
      {/* SEO Scripts and Schema */}
      <SEOHead
        schemaJsonLd={schemaJsonLd}
        additionalSchemas={additionalSchemas}
        headScripts={headScripts}
        bodyEndScripts={bodyEndScripts}
        customCss={customCss}
      />

      <Navbar />
      <HeroSection />
      <div className="max-w-full">
        <HowItWorks />
        <ChecklistSection />
        <ReviewsSection />
        <ComparisonSection />
        <CTASection />
      </div>
      <Footer />
    </main>
  );
}

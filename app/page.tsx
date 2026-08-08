import { ComingSoonSection } from "./components/landing/ComingSoonSection";
import { FeatureList } from "./components/landing/FeatureList";
import { LaunchOffer } from "./components/landing/LaunchOffer";
import { MediaTextSection } from "./components/landing/MediaTextSection";
import { Newsletter } from "./components/landing/Newsletter";
import { PremiumFooter } from "./components/landing/PremiumFooter";
import { PremiumHeader } from "./components/landing/PremiumHeader";
import { PremiumHero } from "./components/landing/PremiumHero";
import { TestimonialsSection } from "./components/landing/TestimonialsSection";
import { jsonLd } from "./lib/site";

// SENIOR (2026-07-31, bug real achado via DevTools - 27 requests de fonte
// falhando com 503 em URL file:// quebrada): Archivo/Inter agora carregam
// via <link> no <head> (app/layout.tsx), nao mais via next/font/google - ver
// comentario em app/globals.css. font-body ja resolve certo via @theme.
export default function Home() {
  return (
    <div className="font-body">
      <PremiumHeader />
      <main>
        <PremiumHero />
        <MediaTextSection />
        <LaunchOffer />
        <FeatureList />
        <TestimonialsSection />
        <ComingSoonSection />
        <Newsletter />
      </main>
      <PremiumFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}

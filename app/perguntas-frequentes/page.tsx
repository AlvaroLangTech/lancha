import type { Metadata } from "next";
import { PremiumFooter } from "../components/landing/PremiumFooter";
import { PremiumHeader } from "../components/landing/PremiumHeader";
import { PageHero } from "../components/content/PageHero";
import { FaqAccordion } from "../components/content/FaqAccordion";
import { faqItems } from "../lib/site";

export const metadata: Metadata = {
  title: "Perguntas frequentes",
  description: "Dúvidas frequentes sobre passeio privativo de lancha no Lago Paranoá.",
};

export default function Page() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-abyss pb-24">
        <PageHero
          kicker="FAQ"
          title="Perguntas frequentes"
          description="Respostas curtas para conduzir o visitante ao contato, sem inventar informações ainda não confirmadas."
        />
        <div className="px-6 md:px-10">
          <FaqAccordion items={faqItems} openByDefault />
        </div>
      </main>
      <PremiumFooter />
    </>
  );
}

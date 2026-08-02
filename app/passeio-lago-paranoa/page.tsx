import type { Metadata } from "next";
import { Phone, ShieldAlert, Users } from "lucide-react";
import { PremiumFooter } from "../components/landing/PremiumFooter";
import { PremiumHeader } from "../components/landing/PremiumHeader";
import { PageHero } from "../components/content/PageHero";
import { InfoPanel, InfoPanelGrid } from "../components/content/InfoPanel";
import { siteConfig } from "../lib/site";

export const metadata: Metadata = {
  title: "Passeio no Lago Paranoá",
  description: "Experiência privativa no Lago Paranoá com contato direto pelo WhatsApp da Lancha Bêju.",
};

export default function Page() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-abyss">
        <PageHero
          kicker="SEO local"
          title="Passeio no Lago Paranoá"
          description="Uma página local para explicar a experiência, o cenário, as melhores ocasiões e as orientações que reduzem insegurança antes do primeiro contato."
        />

        <section className="px-6 pb-24 md:px-10">
          <div className="mx-auto max-w-6xl">
            <InfoPanelGrid>
              <InfoPanel title="Para quem" icon={Users}>
                Casais, famílias, pequenos grupos, aniversários, ensaios e celebrações com maior valor percebido.
              </InfoPanel>
              <InfoPanel title="O que não publicar ainda" icon={ShieldAlert} delay={0.1}>
                Rotas, limites, capacidade, documentos, combustível e regras comerciais sem confirmação.
              </InfoPanel>
              <InfoPanel title="Contato" icon={Phone} delay={0.2}>
                <p>{siteConfig.displayPhone}</p>
                <a
                  href={siteConfig.whatsappHref}
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-neon px-6 py-3 text-xs font-extrabold uppercase tracking-widest text-abyss transition hover:scale-105 hover:brightness-110"
                >
                  Falar agora
                </a>
              </InfoPanel>
            </InfoPanelGrid>
          </div>
        </section>
      </main>
      <PremiumFooter />
    </>
  );
}

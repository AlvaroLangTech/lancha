import type { Metadata } from "next";
import { Anchor, ScrollText, ShieldCheck } from "lucide-react";
import { PremiumFooter } from "../components/landing/PremiumFooter";
import { PremiumHeader } from "../components/landing/PremiumHeader";
import { Reveal } from "../components/landing/Reveal";
import { PageHero } from "../components/content/PageHero";
import { InfoPanel, InfoPanelGrid } from "../components/content/InfoPanel";
import { FaqAccordion } from "../components/content/FaqAccordion";
import { faqItems } from "../lib/site";

export const metadata: Metadata = {
  title: "Segurança e regras",
  description:
    "Orientações de segurança, reserva e regras da Lancha Bêju. Informações finais dependem de validação operacional e jurídica.",
};

export default function Page() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-abyss">
        <PageHero
          kicker="Confiança"
          title="Segurança e regras"
          description="O objetivo desta página é reduzir dúvidas antes da reserva. Os textos finais passam por validação operacional e revisão jurídica."
        />

        <section className="px-6 pb-20 md:px-10">
          <div className="mx-auto max-w-6xl">
            <InfoPanelGrid>
              <InfoPanel title="Políticas" icon={ScrollText}>
                Reserva, cancelamento, reagendamento, clima, atraso, conduta a bordo e uso de imagem.
              </InfoPanel>
              <InfoPanel title="LGPD" icon={ShieldCheck} delay={0.1}>
                Consentimentos separados para contato, Clube, marketing, uso de imagem e programa de pontos.
              </InfoPanel>
              <InfoPanel title="Operação" icon={Anchor} delay={0.2}>
                Capacidade, itens obrigatórios, ponto de embarque e regras de segurança precisam de confirmação.
              </InfoPanel>
            </InfoPanelGrid>
          </div>
        </section>

        <section className="bg-abyss-light px-6 py-20 md:px-10 md:py-28">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-neon">Dúvidas comuns</p>
            <h2 className="mt-4 font-display text-3xl font-extrabold uppercase text-white md:text-4xl">
              Perguntas frequentes
            </h2>
          </Reveal>
          <FaqAccordion items={faqItems} />
        </section>
      </main>
      <PremiumFooter />
    </>
  );
}

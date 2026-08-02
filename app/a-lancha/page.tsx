import type { Metadata } from "next";
import { Ban, Camera, ListChecks } from "lucide-react";
import { PremiumFooter } from "../components/landing/PremiumFooter";
import { PremiumHeader } from "../components/landing/PremiumHeader";
import { Reveal } from "../components/landing/Reveal";
import { PageHero } from "../components/content/PageHero";
import { InfoPanel, InfoPanelGrid } from "../components/content/InfoPanel";

export const metadata: Metadata = {
  title: "A lancha",
  description: "Conheça a proposta da Lancha Bêju. Dados técnicos serão publicados somente após confirmação.",
};

export default function Page() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-abyss">
        <PageHero
          kicker="Produto e prova"
          title="A lancha"
          description="Esta página vai receber fotos reais, estrutura confirmada, itens disponíveis e diferenciais da embarcação. Por enquanto, funciona como espaço preparado para conteúdo validado."
        />

        <section className="px-6 pb-10 md:px-10">
          <Reveal className="mx-auto block max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-abyss-card">
            {/* SENIOR (2026-08-02, "EU QUERO A SEGUNDA IMAGEM... NO LUGAR DA
                PRIMEIRA"): mesma troca de foto feita na landing premium, pra
                não ficar foto antiga aqui e foto nova nas outras páginas. */}
            <img
              src="/call_FwCQxvWceQgcEgnBdX0YTMUQ.png"
              alt="Lancha Bêju no Lago Paranoá"
              className="h-[420px] w-full object-contain"
            />
          </Reveal>
        </section>

        <section className="px-6 pb-24 md:px-10">
          <div className="mx-auto max-w-6xl">
            <InfoPanelGrid>
              <InfoPanel title="Conteúdo necessário" icon={Camera}>
                Fotos reais, ambientes, conforto, segurança, capacidade homologada e orientações de uso.
              </InfoPanel>
              <InfoPanel title="Evitar" icon={Ban} delay={0.1}>
                Não publicar modelo, ano, motor, capacidade, itens inclusos ou documentos sem validação.
              </InfoPanel>
              <InfoPanel title="Próxima etapa" icon={ListChecks} delay={0.2}>
                Organizar uma sessão visual com fotos horizontais, verticais e assets para SEO/social.
              </InfoPanel>
            </InfoPanelGrid>
          </div>
        </section>
      </main>
      <PremiumFooter />
    </>
  );
}

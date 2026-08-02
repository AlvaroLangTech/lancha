import type { Metadata } from "next";
import { PremiumFooter } from "../components/landing/PremiumFooter";
import { PremiumHeader } from "../components/landing/PremiumHeader";
import { PageHero } from "../components/content/PageHero";
import { TourViewer } from "../components/landing/TourViewer";

export const metadata: Metadata = {
  title: "Tour 360",
  description: "Tour 360 da Lancha Bêju - arraste para olhar ao redor de cada área do barco, com fotos reais.",
};

// SENIOR (2026-08-02, "recebemos as fotos panoramicas para fazer o street
// view, vamos fazer essa maluquice hahaha"): antes esta pagina era so um
// placeholder editorial explicando o plano futuro (Pannellum/Marzipano em
// subdominio). Agora que temos fotos panoramicas reais em public/, virou
// implementacao de verdade - ver TourViewer.tsx (estado/selecao de cena) e
// PanoramaViewer.tsx (visualizador de arrastar-pra-olhar-ao-redor).
export default function Page() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-abyss">
        <PageHero
          kicker="Experiência imersiva"
          title="Tour 360° da Lancha Bêju"
          description="Arraste a imagem pra olhar ao redor, como se você já estivesse a bordo. Escolha o ponto da lancha que quer explorar."
        />

        <section className="px-6 pb-24 md:px-10">
          <div className="mx-auto max-w-5xl">
            <TourViewer />
          </div>
        </section>
      </main>
      <PremiumFooter />
    </>
  );
}

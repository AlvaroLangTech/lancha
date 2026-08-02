import { MediaCarousel } from "./MediaCarousel";
import { Reveal } from "./Reveal";
import { mediaGallery } from "../../lib/landing-content";

export function MediaTextSection() {
  return (
    <section id="a-bordo" className="bg-abyss py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 md:grid-cols-2 md:items-center md:gap-20 md:px-10">
        {/* SENIOR (2026-07-31, bug real confirmado via scroll no navegador -
            pagina inteira tinha scroll horizontal no mobile): item de grid
            sem min-w-0 deixa a largura intrinseca do carrossel (soma de
            TODOS os slides lado a lado, mesmo sem estar rolado) vazar pra
            fora da coluna e empurrar a pagina inteira mais larga que a tela.
            min-w-0 forca o item a respeitar a largura da coluna - o scroll
            horizontal passa a ficar contido DENTRO do carrossel (que ja tem
            overflow-x-auto), onde deveria estar. */}
        <Reveal className="min-w-0">
          <MediaCarousel slides={mediaGallery} />
        </Reveal>

        <Reveal delay={0.1}>
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-neon">Cada Detalhe a Bordo</p>
          <h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] text-white md:text-6xl">
            Feita para quem quer aproveitar, não se preocupar.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/60">
            Do embarque ao desembarque, a experiência é conduzida pela nossa equipe — você só precisa escolher a
            ocasião e chegar. O resto a gente cuida.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

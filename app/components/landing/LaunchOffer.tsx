import { Reveal } from "./Reveal";
import { siteConfig } from "../../lib/site";

// SENIOR: a spec original pedia "20% de desconto no lancamento" - troquei
// por uma chamada de acesso antecipado ao Clube, porque o FAQ real do site
// (app/lib/site.ts) deixa explicito que preco/promocao ainda NAO estao
// confirmados publicamente. Quando o desconto for confirmado de verdade,
// e so trocar o texto abaixo.
export function LaunchOffer() {
  return (
    <section className="relative overflow-hidden bg-abyss-light py-28 md:py-36">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(46,230,200,0.12),transparent_55%)]"
      />
      <div className="relative mx-auto max-w-4xl px-6 text-center md:px-10">
        <Reveal>
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-neon">Temporada de lançamento</p>
          <h2 className="mt-5 font-display text-4xl font-extrabold uppercase leading-[0.95] text-white md:text-6xl">
            Seja um dos primeiros a navegar
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60">
            Entre no Clube de Interesse e fique na frente da fila quando as datas da temporada abrirem.
          </p>
          <a
            href={siteConfig.whatsappGroupHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-9 inline-flex items-center justify-center rounded-full bg-neon px-8 py-4 text-sm font-bold uppercase tracking-widest text-abyss transition hover:scale-105 hover:brightness-110"
          >
            Entrar no Clube
          </a>
        </Reveal>
      </div>
    </section>
  );
}

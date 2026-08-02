"use client";

import { ChevronLeft, ChevronRight, Compass, Play } from "lucide-react";
import { useRef, useState } from "react";
import { TiltPhoto } from "./TiltPhoto";

// SENIOR (2026-07-31): carrossel proprio (scroll-snap nativo do CSS), sem
// dependencia externa (embla/swiper) de proposito - o ambiente de execucao
// ficou instavel a sessao inteira e nao dava pra confirmar com seguranca
// que um pacote novo de carrossel ia instalar/buildar certo antes da
// demonstracao. Scroll-snap + setas cobre o efeito pedido (navegacao +
// botao de play) sem esse risco.
// SENIOR (2026-08-01, "quero que seja uma ideia para galeria de fotos, vai
// ficar bem legal"): cada slide agora aceita "image" opcional - quando
// existe, renderiza a foto real com o efeito de profundidade/tilt
// (TiltPhoto: reage ao mouse no desktop e ao giroscopio no celular). Sem
// foto, mantem o placeholder de bussola de antes. Assim a galeria ja fica
// "viva" pros slots que ja tem foto real, e vai enchendo aos poucos sem
// precisar mexer no carrossel de novo.
export function MediaCarousel({ slides }: { slides: { label: string; caption: string; image?: string }[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(slides.length - 1, index));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    setActive(clamped);
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, index) => (
          <div key={slide.label} className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 bg-abyss-card">
            {slide.image ? (
              <>
                <TiltPhoto src={slide.image} alt={slide.label} className="h-full w-full" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-abyss/90 via-abyss/30 to-transparent p-6">
                  <span className="font-display text-sm font-bold uppercase tracking-widest text-neon">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-2 font-display text-2xl font-bold text-white">{slide.label}</p>
                  <p className="mt-1 text-sm text-white/70">{slide.caption}</p>
                </div>
              </>
            ) : (
              /* SENIOR (2026-07-31, feedback do Alvaro: card ficava quase
                  invisivel - gradiente ia direto pra preto sobre um fundo ja
                  escuro): placeholder agora usa abyss-card (mais claro que o
                  fundo) + glow radial teal, nunca escurece ate preto puro, e
                  ganhou um icone-fantasma grande de fundo pra nao parecer caixa
                  vazia/quebrada enquanto nao ha foto real. Trocar por foto real
                  em app/lib/landing-content.ts (campo "image") assim que
                  houver asset. */
              <div className="flex h-full w-full flex-col justify-end bg-[radial-gradient(circle_at_30%_20%,rgba(46,230,200,0.16),transparent_60%)] p-6">
                <Compass className="pointer-events-none absolute right-4 top-4 h-16 w-16 text-white/[0.07]" strokeWidth={1} />
                <span className="font-display text-sm font-bold uppercase tracking-widest text-neon">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 font-display text-2xl font-bold text-white">{slide.label}</p>
                <p className="mt-1 text-sm text-white/70">{slide.caption}</p>
              </div>
            )}
            {index === 0 && !slide.image && (
              <button
                type="button"
                aria-label="Reproduzir video de apresentacao"
                className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition hover:scale-110 hover:bg-white/25"
              >
                <Play className="h-6 w-6 fill-white text-white" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {slides.map((slide, index) => (
            <button
              key={slide.label}
              type="button"
              aria-label={`Ir para o slide ${index + 1}`}
              onClick={() => scrollToIndex(index)}
              className={`h-1.5 rounded-full transition-all ${index === active ? "w-6 bg-neon" : "w-1.5 bg-white/20"}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Slide anterior"
            onClick={() => scrollToIndex(active - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-neon hover:text-neon"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Próximo slide"
            onClick={() => scrollToIndex(active + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-neon hover:text-neon"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

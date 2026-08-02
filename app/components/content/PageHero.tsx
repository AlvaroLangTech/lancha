import type { ReactNode } from "react";
import { Reveal } from "../landing/Reveal";

// SENIOR (2026-07-31, feedback do Alvaro: "as outras paginas estao erradas,
// sem personalidade"): cabecalho padrao pras paginas internas (nao-Home) -
// mesma linguagem tipografica/cor da Home (kicker neon + titulo display
// gigante + Reveal), pra parar de parecer um site diferente de pagina pra
// pagina. pt-36/44 existe pra abrir espaco do PremiumHeader, que e fixed e
// fica transparente até rolar (ver PremiumHeader.tsx).
export function PageHero({
  kicker,
  title,
  description,
  children,
}: {
  kicker: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-abyss pb-16 pt-36 md:pb-20 md:pt-44">
      <div className="mx-auto max-w-4xl px-6 md:px-10">
        <Reveal>
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-neon">{kicker}</p>
          <h1 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] text-white md:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">{description}</p>
          )}
          {children}
        </Reveal>
      </div>
    </section>
  );
}

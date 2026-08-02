import { ArrowUpRight, Compass, Route, Users } from "lucide-react";
import { Reveal } from "./Reveal";
import { comingSoon } from "../../lib/landing-content";

const icons = [Compass, Route, Users];

export function ComingSoonSection() {
  return (
    <section className="bg-abyss py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal className="max-w-xl">
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-neon">Em Breve</p>
          <h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] text-white md:text-5xl">
            O que vem por aí na Lancha Bêju
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/60">
            Estamos construindo a experiência com calma e transparência — aqui está o que já está no radar.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {comingSoon.map((item, index) => {
            const Icon = icons[index] ?? Compass;
            // SENIOR (2026-08-02, "coloque aqui, 'em breve'" - pedido no
            // card do Tour 360°, e depois "vamos fazer essa maluquice" quando
            // as fotos panoramicas chegaram): item com "href" já tem
            // implementação real (ver /tour-360) - vira card clicável com
            // selo "Disponível" em vez de "Em breve", os outros dois
            // continuam como antes (sem link, selo "Em breve").
            const content = (
              <>
                <span
                  className={`absolute right-6 top-6 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    item.href ? "border-neon bg-neon text-abyss" : "border-neon/40 bg-neon/10 text-neon"
                  }`}
                >
                  {item.href ? "Disponível" : "Em breve"}
                </span>
                <Icon className="h-7 w-7 text-neon" />
                <h3 className="mt-5 flex items-center gap-1.5 font-display text-xl font-bold text-white">
                  {item.title}
                  {item.href && <ArrowUpRight className="h-4 w-4 text-neon" />}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{item.description}</p>
              </>
            );

            if (item.href) {
              // SENIOR (2026-08-02): link externo (grupo de WhatsApp) abre em
              // nova aba pra não tirar o visitante do site; link interno
              // (/tour-360) navega normal na mesma aba.
              const isExternal = item.href.startsWith("http");
              return (
                // SENIOR (2026-08-02, "ajuste para a altura do card ficar no
                // padrao"): o grid já estica cada Reveal pra altura da linha
                // (comportamento padrão do CSS Grid), mas o <a> de dentro,
                // sendo um bloco comum, só ficava do tamanho do próprio
                // conteúdo - por isso o card "Tour 360°" (descrição de 1
                // linha) ficava visualmente mais baixo que os outros dois
                // (descrição de 2 linhas). h-full no Reveal + flex h-full no
                // <a> faz o card clicável esticar igual aos não-clicáveis.
                <Reveal key={item.title} delay={index * 0.1} className="h-full">
                  <a
                    href={item.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-abyss-card p-8 transition hover:border-neon/40 hover:bg-abyss-card/80"
                  >
                    {content}
                  </a>
                </Reveal>
              );
            }

            return (
              <Reveal key={item.title} delay={index * 0.1} className="relative rounded-2xl border border-white/10 bg-abyss-card p-8">
                {content}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

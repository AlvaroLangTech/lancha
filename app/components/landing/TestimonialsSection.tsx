import { Reveal } from "./Reveal";
import { TestimonialCard } from "./TestimonialCard";
import { testimonials, boatPackage } from "../../lib/landing-content";

export function TestimonialsSection() {
  return (
    // SENIOR (2026-07-31): antes era a UNICA secao clara (bg-sand + texto
    // escuro) no meio de uma landing inteira escura - pedido do Alvaro pra
    // trocar por texto branco. Agora segue o mesmo bg-abyss-light + branco
    // do resto da pagina.
    <section id="avaliacoes" className="bg-abyss-light py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-neon">Vozes de Quem Navega</p>
          <h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] text-white md:text-5xl">
            Confiança se constrói passeio a passeio
          </h2>
          {/* SENIOR (2026-08-01): "300+ passeios" e fato confirmado pelo
              Alvaro (origem lanchabeju.lovable.app), nao e mais placeholder. */}
          <p className="mt-3 text-sm font-bold uppercase tracking-widest text-white/60">{boatPackage.socialProof}</p>
        </Reveal>

        {/* SENIOR (2026-08-01): eram 4 depoimentos (grid-cols-4, 1 linha
            perfeita); agora sao 5 (novo caso de casamento). 3 colunas
            (3 em cima + 2 embaixo) fica mais equilibrado que 4+1 sobrando
            sozinho, e da mais largura pro texto mais longo/humano de cada
            depoimento. */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.name + index} delay={index * 0.1} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

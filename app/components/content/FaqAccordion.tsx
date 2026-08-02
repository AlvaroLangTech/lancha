import { ChevronDown } from "lucide-react";
import { Reveal } from "../landing/Reveal";

// SENIOR: <details>/<summary> nativo (acessivel, sem JS) restilizado pro
// padrao dark/neon - mesmos itens de app/lib/site.ts (faqItems), so mudou a
// casca visual. openByDefault existe porque perguntas-frequentes/page.tsx
// usava <details open> (todas abertas de cara); seguranca-e-regras/page.tsx
// usava fechado.
export function FaqAccordion({
  items,
  openByDefault = false,
}: {
  items: { question: string; answer: string }[];
  openByDefault?: boolean;
}) {
  return (
    <div className="mx-auto mt-14 flex max-w-3xl flex-col gap-3">
      {items.map((item, index) => (
        <Reveal key={item.question} delay={Math.min(index * 0.05, 0.3)}>
          <details
            open={openByDefault}
            className="group rounded-2xl border border-white/10 bg-abyss-card px-6 py-5 open:pb-5"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-bold text-white marker:content-none">
              {item.question}
              <ChevronDown className="h-5 w-5 shrink-0 text-neon transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-white/60">{item.answer}</p>
          </details>
        </Reveal>
      ))}
    </div>
  );
}

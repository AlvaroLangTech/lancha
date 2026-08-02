import { Quote } from "lucide-react";
import { Reveal } from "./Reveal";

export function TestimonialCard({
  quote,
  name,
  affiliation,
  delay = 0,
}: {
  quote: string;
  name: string;
  affiliation: string;
  delay?: number;
}) {
  return (
    // SENIOR (2026-07-31, pedido explicito do Alvaro: "prefiro fonte branca
    // mesmo, da pra ver merda nenhuma" - card claro sobre secao clara vinha
    // dando problema de legibilidade): card e secao agora seguem o MESMO
    // padrao escuro do resto da pagina (bg-abyss-card + texto branco), em
    // vez de ser a unica secao clara no meio de uma landing inteira escura -
    // elimina de vez qualquer risco de texto sumindo, e fica mais coerente
    // com o resto do design tambem.
    <Reveal delay={delay} className="rounded-2xl border border-white/10 bg-abyss-card p-8">
      <Quote className="h-6 w-6 text-neon" />
      <p className="mt-5 text-base leading-relaxed text-white/70 italic">&ldquo;{quote}&rdquo;</p>
      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neon text-xs font-bold text-abyss">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-bold text-white">{name}</p>
          <p className="text-xs text-white/50">{affiliation}</p>
        </div>
      </div>
    </Reveal>
  );
}

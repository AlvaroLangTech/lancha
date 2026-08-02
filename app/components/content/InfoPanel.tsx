import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "../landing/Reveal";

// SENIOR: substitui os antigos ".info-grid"/".info-panel" (CSS global,
// visual generico) pelo mesmo cartao usado em ComingSoonSection na Home -
// borda sutil + bg-abyss-card + Reveal, com variante "wide" pra ocupar mais
// de 1 coluna quando o texto é maior (ex: "Como deve funcionar").
export function InfoPanelGrid({ children }: { children: ReactNode }) {
  return <div className="mt-14 grid gap-5 md:grid-cols-3">{children}</div>;
}

export function InfoPanel({
  title,
  icon: Icon,
  wide,
  delay = 0,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  wide?: boolean;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <Reveal
      delay={delay}
      className={`rounded-2xl border border-white/10 bg-abyss-card p-8 ${wide ? "md:col-span-2" : ""}`}
    >
      {Icon && <Icon className="h-7 w-7 text-neon" />}
      <h3 className={`font-display text-xl font-bold text-white ${Icon ? "mt-5" : ""}`}>{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-white/60">{children}</div>
    </Reveal>
  );
}

import type { Metadata } from "next";
import { PremiumFooter } from "../components/landing/PremiumFooter";
import { PremiumHeader } from "../components/landing/PremiumHeader";
import { Reveal } from "../components/landing/Reveal";
import { PageHero } from "../components/content/PageHero";

export const metadata: Metadata = {
  title: "Clube de Interesse",
  description: "Entre voluntariamente na lista de interesse da Lancha Bêju para receber novidades e abertura de datas.",
};

export default function Page() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-abyss">
        <PageHero
          kicker="Lista exclusiva"
          title="Clube de Interesse"
          description="Para quem ainda não tem data definida, mas quer acompanhar abertura de agenda, experiências especiais e novidades da Lancha Bêju."
        />

        <section className="px-6 pb-24 md:px-10">
          <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-2 md:items-center md:gap-16">
            <Reveal>
              <h2 className="font-display text-3xl font-extrabold uppercase leading-[1.05] text-white md:text-4xl">
                Entrada voluntária, sem adicionar ninguém automaticamente.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/60">
                O fluxo correto é apresentar a proposta de valor, pedir autorização clara e registrar origem e
                versão do consentimento. No MVP, o bot/WhatsApp continua a conversa; na próxima fase, a API salva
                o opt-in.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="rounded-2xl border border-white/10 bg-abyss-card p-8 md:p-10">
              <form action="/go/falar" method="get" className="flex flex-col gap-4">
                <input type="hidden" name="origem" value="clube" />
                <input
                  type="hidden"
                  name="mensagem"
                  value="Olá, quero entrar no Clube de Interesse da Lancha Bêju e autorizo receber informações sobre datas e experiências."
                />
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-bold text-white/70">Nome</span>
                  <input
                    name="nome"
                    placeholder="Seu nome"
                    className="min-h-12 rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none placeholder:text-white/40 focus:border-neon"
                  />
                </label>
                <button
                  type="submit"
                  className="mt-2 min-h-13 rounded-full bg-neon text-sm font-extrabold uppercase tracking-widest text-abyss transition hover:scale-[1.02] hover:brightness-110"
                >
                  Pedir entrada pelo WhatsApp
                </button>
                <p className="text-xs text-white/45">
                  A entrada no grupo/lista é confirmada de forma clara durante a conversa.
                </p>
              </form>
            </Reveal>
          </div>
        </section>
      </main>
      <PremiumFooter />
    </>
  );
}

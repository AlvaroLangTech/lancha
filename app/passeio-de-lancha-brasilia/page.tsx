import type { Metadata } from "next";
import { Banknote, ClipboardList, MapPin, Route } from "lucide-react";
import { PremiumFooter } from "../components/landing/PremiumFooter";
import { PremiumHeader } from "../components/landing/PremiumHeader";
import { Reveal } from "../components/landing/Reveal";
import { PageHero } from "../components/content/PageHero";
import { InfoPanel, InfoPanelGrid } from "../components/content/InfoPanel";
import { ReserveButton } from "../components/checkout/ReserveButton";
import { boatPackage, bookingPolicy, embarkPoint } from "../lib/landing-content";
import { siteConfig } from "../lib/site";

export const metadata: Metadata = {
  title: "Passeio de lancha em Brasília",
  description: `Passeio privativo de lancha no Lago Paranoá, ${boatPackage.priceLabel} a diária, ${boatPackage.hoursLabel.toLowerCase()}, para ${boatPackage.capacityLabel.toLowerCase()}.`,
};

// SENIOR (2026-08-01, "já arrume isso aqui, tá vendo que precisamos ter o
// copy?" - Alvaro reportou que essa pagina de alta intencao (link "Ver
// Passeios" da hero) ainda mostrava a copy antiga de placeholder, "a
// confirmar" preco/capacidade/itens - MESMO depois de ja termos os dados
// reais confirmados em landing-content.ts (boatPackage/bookingPolicy/
// embarkPoint, usados em FeatureList/TestimonialsSection). Essa pagina
// especifica nao tinha sido atualizada na mesma leva. Fix: reusa os MESMOS
// dados reais ja confirmados, sem inventar nada novo.
export default function Page() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-abyss">
        <PageHero
          kicker="Alta intenção"
          title="Passeio de lancha em Brasília"
          description={`Passeio privativo no Lago Paranoá por ${boatPackage.priceLabel} (${boatPackage.priceUnit}), ${boatPackage.hoursLabel.toLowerCase()}, para ${boatPackage.capacityLabel.toLowerCase()}. Piloto, combustível e churrasqueiro a bordo já inclusos na diária.`}
        />

        <section className="px-6 pb-20 md:px-10">
          <div className="mx-auto max-w-6xl">
            <InfoPanelGrid>
              <InfoPanel title="Como funciona" icon={Route} wide>
                Reserve direto pelo site: seus dados, confirmação por email e sinal de 50% via Pix, cartão ou boleto —
                em poucos minutos, sem precisar sair da página. Prefere conversar antes? É só chamar no WhatsApp.
              </InfoPanel>

              <InfoPanel title="O que já está incluso" icon={ClipboardList} delay={0.1}>
                <ul className="space-y-1.5">
                  {boatPackage.inclusions.map((item) => (
                    <li key={item.title}>
                      <span className="font-bold text-neon">{item.title}: </span>
                      {item.description}
                    </li>
                  ))}
                </ul>
              </InfoPanel>

              <InfoPanel title="Sinal e cancelamento" icon={Banknote} delay={0.15}>
                <p>{bookingPolicy.deposit}</p>
                <p className="mt-2">{bookingPolicy.cancellation}</p>
              </InfoPanel>

              <InfoPanel title="Local de embarque" icon={MapPin} wide delay={0.2}>
                <p className="font-bold text-white/80">{embarkPoint.title}</p>
                <p className="mt-1">{embarkPoint.description}</p>
                <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5">
                  {embarkPoint.perks.map((perk) => (
                    <li key={perk.title}>
                      <span className="font-bold text-neon">{perk.title}: </span>
                      {perk.description}
                    </li>
                  ))}
                </ul>
              </InfoPanel>
            </InfoPanelGrid>
          </div>
        </section>

        {/* SENIOR (2026-08-02, "???" - Alvaro reportou essa página, que é o
            destino do botão "Ver Passeios" da hero, ainda mostrando o
            <WhatsAppLeadForm> antigo com a copy "reserva assistida primeiro,
            automação depois" - isso foi escrito em 2026-08-01, ANTES de
            existir checkout de verdade no site. Hoje já existe reserva +
            pagamento (Pix/cartão/boleto via Asaas) completos no site
            (CheckoutModal/SiteChatWidget), então a página de maior intenção
            de compra estava escondendo exatamente o caminho mais direto pra
            conversão. Troca: mesmo padrão de CTA usado em FeatureList.tsx -
            <ReserveButton> (abre o checkout de verdade) como ação primária,
            WhatsApp como alternativa pra quem prefere conversar antes. */}
        <section className="bg-abyss-light py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-2 md:items-center md:gap-16 md:px-10">
            <Reveal>
              <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-neon">Conversão</p>
              <h2 className="mt-4 font-display text-3xl font-extrabold uppercase leading-[0.95] text-white md:text-4xl">
                Reserve e pague o sinal direto aqui.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/60">
                4 passos rápidos: seus dados, confirmação por email, sinal de 50% via Pix, cartão ou boleto — sua data
                fica garantida assim que o pagamento cai. Prefere conversar antes? Fala com a equipe no WhatsApp.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ReserveButton className="inline-flex min-h-13 items-center justify-center rounded-full bg-neon px-8 text-sm font-extrabold uppercase tracking-wide text-abyss transition hover:scale-105 hover:brightness-110" />
                <a
                  href={siteConfig.whatsappHref}
                  className="inline-flex min-h-13 items-center justify-center rounded-full border-2 border-neon bg-neon/10 px-8 text-sm font-extrabold uppercase tracking-wide text-neon transition hover:scale-105 hover:bg-neon hover:text-abyss"
                >
                  Consultar no WhatsApp
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-neon/30 bg-abyss-card p-8 md:p-10">
                <h3 className="font-display text-xl font-bold text-white">O que já está incluso</h3>
                <ul className="mt-4 space-y-2 text-sm text-white/70">
                  {boatPackage.inclusions.map((item) => (
                    <li key={item.title}>
                      <span className="font-bold text-neon">{item.title}: </span>
                      {item.description}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-xs text-white/50">
                  {bookingPolicy.deposit} {bookingPolicy.cancellation}
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <PremiumFooter />
    </>
  );
}

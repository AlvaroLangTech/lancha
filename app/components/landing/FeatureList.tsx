import { CheckCircle2 } from "lucide-react";
import { Reveal } from "./Reveal";
import { TiltPhoto } from "./TiltPhoto";
import { ReserveButton } from "../checkout/ReserveButton";
import { boardChecklist, boatPackage, bookingPolicy } from "../../lib/landing-content";
import { siteConfig } from "../../lib/site";

export function FeatureList() {
  return (
    // SENIOR (2026-08-02, "experiencia nao leva pra bosta nenhuma!"): o link
    // "Experiência" do header (PremiumHeader.tsx, href="/#experiencia")
    // nunca teve uma seção com esse id em lugar nenhum da Home - os outros
    // dois links do menu (A Lancha -> #a-bordo, Avaliações -> #avaliacoes)
    // sempre funcionaram, só esse ficava sem destino. Essa seção (checklist
    // de conforto/segurança + preço + o que está incluso) é a que melhor
    // representa "a experiência" do passeio, então ganhou o id.
    <section id="experiencia" className="bg-abyss py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 md:grid-cols-2 md:items-center md:gap-20 md:px-10">
        <Reveal>
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-neon">Conforto e Segurança</p>
          <h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] text-white md:text-5xl">
            Tudo pensado pra você só aproveitar
          </h2>

          <ul className="mt-8 space-y-4">
            {boardChecklist.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-neon" />
                <span className="text-sm leading-relaxed text-white/70 md:text-base">{item}</span>
              </li>
            ))}
          </ul>

          {/* SENIOR (2026-08-01): pacote comercial real (preco, horario,
              capacidade, sinal/cancelamento) confirmado pelo Alvaro, origem
              lanchabeju.lovable.app. Antes o site nao mostrava nenhum
              numero de proposito ("a confirmar"); agora e fato publicavel -
              ver docs/10-plano-migracao-lovable-e-painel-gestor.md. */}
          <div className="mt-10 rounded-2xl border border-neon/30 bg-abyss-card p-6">
            <p className="font-display text-3xl font-extrabold text-white">
              {boatPackage.priceLabel}{" "}
              <span className="text-sm font-bold uppercase tracking-widest text-white/50">{boatPackage.priceUnit}</span>
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {boatPackage.inclusions.map((item) => (
                <li key={item.title} className="text-xs text-white/70">
                  <span className="font-bold uppercase tracking-wide text-neon">{item.title}: </span>
                  {item.description}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-white/50">{bookingPolicy.deposit} {bookingPolicy.cancellation}</p>
          </div>

          {/* SENIOR (2026-08-01, "finalizarmos a compra toda pelo site"):
              checkout de verdade (verificação de email + sinal via Asaas)
              agora vive ao lado do caminho assistido por WhatsApp - o
              cliente escolhe. Ver app/components/checkout/. */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ReserveButton className="inline-flex min-h-13 items-center justify-center rounded-full bg-neon px-8 text-sm font-extrabold uppercase tracking-wide text-abyss transition hover:scale-105 hover:brightness-110" />
            <a
              href={siteConfig.whatsappHref}
              className="inline-flex min-h-13 items-center justify-center rounded-full border-2 border-neon bg-neon/10 px-8 text-sm font-extrabold uppercase tracking-wide text-neon transition hover:scale-105 hover:bg-neon hover:text-abyss"
            >
              Consultar no WhatsApp
            </a>
          </div>
        </Reveal>

        {/* SENIOR (2026-08-01, "quero a imagem toda"): mesma foto paisagem
            forçada num box retrato 4:5 com object-cover cortava a lancha
            quase inteira pras bordas. object-contain + fundo abyss-card
            mostra a foto completa, sem esticar nem cortar. */}
        {/* SENIOR (2026-08-01, "vamos subir de nivel, efeito que da
            profundidade... mexe conforme balança o celular"): TiltPhoto
            reage ao mouse (desktop) e ao giroscopio real do celular
            (mobile), com sombra/brilho que acompanham a inclinacao - da
            sensacao de profundidade numa foto comum, sem precisar de
            camera 3D. Ver app/components/landing/TiltPhoto.tsx. */}
        <Reveal delay={0.1} className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-abyss-card">
          <TiltPhoto
            src="/call_FwCQxvWceQgcEgnBdX0YTMUQ.png"
            alt="Detalhe da Lancha Bêju no Lago Paranoa"
            className="h-full w-full"
          />
        </Reveal>
      </div>
    </section>
  );
}

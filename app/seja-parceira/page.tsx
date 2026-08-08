import type { Metadata } from "next";
import { Camera, CalendarDays, Users, ShieldCheck } from "lucide-react";
import { PremiumFooter } from "../components/landing/PremiumFooter";
import { PremiumHeader } from "../components/landing/PremiumHeader";
import { Reveal } from "../components/landing/Reveal";
import { PageHero } from "../components/content/PageHero";
import { InfoPanel, InfoPanelGrid } from "../components/content/InfoPanel";
import { FaqAccordion } from "../components/content/FaqAccordion";
import { PartnersRankingBoard } from "../components/partners/PartnersRankingBoard";

export const metadata: Metadata = {
  title: "Seja parceira de conteúdo",
  description:
    "Entenda como funciona a dinâmica de indicação remunerada e conteúdo da Lancha Bêju antes de se inscrever.",
};

const PARTNER_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScQBrAqmxgUnsIb8kj5f5dxQaj4DQcZUg4-VI5UrqMwvz0pvg/viewform?usp=sharing&ouid=113346557454208394327";

const rulesFaq = [
  {
    question: "A participação no passeio é uma contratação?",
    answer:
      "Não. Participar dos roles de conteúdo não é emprego, salário ou cachê. É uma experiência a bordo para gerar fotos e vídeos de qualidade. Quem quiser ir além pode entrar no programa de indicação: aí você ganha comissão como se fosse nossa vendedora, toda vez que alguém reserva e paga usando o seu cupom.",
  },
  {
    question: "Como funciona um role de conteúdo?",
    answer:
      "É um dia de gravação, separado dos passeios normais que os clientes alugam. Reunimos até 5 participantes por vez para um bloco com churrasco, drinks e sessão de fotos e vídeos a bordo. Ao final do bloco, o grupo retorna ao píer e entram as próximas 5. No último bloco do dia, damos um pouco mais de tempo para quem se destacou nas gravações anteriores.",
  },
  {
    question: "Com que frequência acontecem os roles?",
    answer:
      "A previsão é de até um dia de gravação por semana, podendo abrir aproximadamente 4 listas por mês. Essa quantidade não é garantida e pode variar conforme o clima, a operação da lancha, a disponibilidade da equipe e o calendário de locações pagas — passeios de clientes têm prioridade na agenda.",
  },
  {
    question: "Quantas participantes vão em cada bloco?",
    answer:
      "Cada bloco tem escala de até 5 participantes, respeitando a capacidade e as regras de segurança da embarcação. Quando há mais interessadas do que vagas, fazemos rodízio para que outras participantes também tenham a chance de participar dos próximos roles.",
  },
  {
    question: "Como funciona a indicação e a comissão?",
    answer:
      "Quem tiver interesse recebe um cupom próprio para divulgar nas suas redes sociais. A comissão só é gerada quando alguém usa esse cupom, conclui a reserva e paga a locação — apenas divulgar o cupom ou participar do role não gera comissão por si só. Regras, valores e condições completas da comissão são apresentados antes da adesão ao programa de indicação.",
  },
  {
    question: "Preciso autorizar o uso das minhas fotos e vídeos?",
    answer:
      "Sim. A participação nos roles exige aceite do termo de autorização de imagem, dando permissão para a Lancha Bêju usar as fotos e vídeos produzidos a bordo nas redes sociais e campanhas de divulgação. Sem esse aceite não é possível participar.",
  },
  {
    question: "Preencher o formulário garante minha vaga?",
    answer:
      "Não. A inscrição não garante automaticamente uma vaga no role. Depois de analisarmos as respostas, montamos a lista e enviamos individualmente a confirmação, o horário e as orientações. Quem não for selecionada na primeira lista pode ser chamada para as próximas.",
  },
];

export default function Page() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-abyss">
        <PageHero
          kicker="Grupo de parceiras"
          title="Seja parceira de conteúdo"
          description="Antes de se inscrever, leia com atenção como funciona essa dinâmica. Ela é clara desde o início: participação nos roles de conteúdo agora, indicação remunerada como próximo passo pra quem quiser vender como se fosse da nossa equipe."
        />

        <section className="px-6 pb-20 md:px-10">
          <div className="mx-auto max-w-6xl">
            <InfoPanelGrid>
              <InfoPanel title="O que é" icon={Camera}>
                Dias de gravação a bordo — separados dos passeios pagos — para produzir fotos e vídeos da lancha e
                das experiências, divulgados nas redes sociais da Lancha Bêju. Participar do role não é
                contratação, salário ou cachê. Quem quiser ir além entra no programa de indicação remunerada.
              </InfoPanel>
              <InfoPanel title="Frequência" icon={CalendarDays} delay={0.1}>
                Até um role por semana, cerca de 4 listas por mês. Não é garantido — varia com clima, operação da
                lancha, disponibilidade da equipe e calendário de locações pagas, que têm prioridade.
              </InfoPanel>
              <InfoPanel title="Escala por role" icon={Users} delay={0.2}>
                Até 5 participantes por bloco, com churrasco, drinks e sessão de fotos, respeitando capacidade e
                segurança da embarcação. Ao final, o grupo retorna ao píer e entram as próximas 5.
              </InfoPanel>
              <InfoPanel title="Uso de imagem" icon={ShieldCheck} delay={0.3}>
                Participar exige aceitar o termo de autorização de imagem, liberando o uso das fotos e vídeos
                produzidos a bordo nas redes e campanhas da Lancha Bêju.
              </InfoPanel>
            </InfoPanelGrid>
          </div>
        </section>

        <section className="px-6 pb-24 md:px-10">
          <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-2 md:items-center md:gap-16">
            <Reveal>
              <h2 className="font-display text-3xl font-extrabold uppercase leading-[1.05] text-white md:text-4xl">
                Indicação: comissão só quando vira reserva paga.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/60">
                Quem tiver interesse recebe um cupom próprio para divulgar nas suas redes — como se fosse nossa
                vendedora. A comissão só é gerada quando alguém usa o cupom, conclui a reserva e paga a locação —
                divulgar o cupom ou participar do role, sozinho, não gera comissão. As regras, valores, prazos e
                condições completas são apresentadas antes da adesão ao programa.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="rounded-2xl border border-white/10 bg-abyss-card p-8 md:p-10">
              <h3 className="font-display text-xl font-bold text-white">Como participar</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Preencha o formulário e confirme que entendeu como a dinâmica funciona. Depois de analisarmos as
                respostas, montamos a lista e enviamos individualmente a confirmação, o horário e as orientações.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-white/45">
                A inscrição não garante vaga automática nesta primeira lista. Quem não for chamada agora pode ser
                convidada nas próximas ações.
              </p>
              <a
                href={PARTNER_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-13 items-center justify-center rounded-full bg-neon px-6 text-sm font-extrabold uppercase tracking-widest text-abyss transition hover:scale-[1.02] hover:brightness-110"
              >
                Preencher formulário de inscrição
              </a>
            </Reveal>
          </div>
        </section>

        <PartnersRankingBoard />

        <section className="bg-abyss-light px-6 py-20 md:px-10 md:py-28">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-neon">Antes de inscrever</p>
            <h2 className="mt-4 font-display text-3xl font-extrabold uppercase text-white md:text-4xl">
              Perguntas que deixam a dinâmica clara
            </h2>
          </Reveal>
          <FaqAccordion items={rulesFaq} />
        </section>
      </main>
      <PremiumFooter />
    </>
  );
}

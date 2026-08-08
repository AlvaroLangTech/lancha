"use client";

import { useEffect, useState } from "react";
import { Camera, Loader2, Trophy, Vote } from "lucide-react";
import { Reveal } from "../landing/Reveal";
import { getOrCreateVisitorId, partnersApi, type PublicRankingEntry } from "../../lib/partnersApi";

// SENIOR (2026-08-06, pedido do Alvaro: "eu tenho que saber os proximos
// niveis" + "tem que ser tipo bbb"): roadmap fixo dos 4 níveis pra mostrar no
// board público - só nome e a partir de quantas reservas, NUNCA o valor em
// R$ (isso fica só no admin, ver partners.controller.ts). Precisa ficar em
// sincronia manual com server/src/modules/partners/levels.ts se os
// thresholds mudarem lá (não dá pra importar direto, back e front são
// projetos/runtimes separados).
const LEVEL_ROADMAP = [
  { level: 1, name: "Tripulante", from: 0 },
  { level: 2, name: "Marinheira", from: 3 },
  { level: 3, name: "Timoneira", from: 6 },
  { level: 4, name: "Capitã", from: 12 },
];

// SENIOR (2026-08-05, pedido do Alvaro: "quero que quem acessar o site
// possa votar... ranking profissional, gamificação entre as meninas"):
// board público do ranking mensal - combina venda real (peso maior) e voto
// do público (peso menor), calculado em partners.service.ts. Aqui só
// exibe e deixa votar; nenhuma lógica de pontuação vive no frontend.
// Sem cadastro pra votar (visitorId no localStorage, ver partnersApi.ts) -
// simples de propósito, sabendo que não é fraude-proof (ver conversa
// 2026-08-05 sobre nível de anti-fraude escolhido).
const VOTED_KEY_PREFIX = "lancha-beju-voted-";

function currentMonthLabel() {
  return new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export function PartnersRankingBoard() {
  const [ranking, setRanking] = useState<PublicRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [votedId, setVotedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  // SENIOR (2026-08-06, pedido do Alvaro: "clicou no nome da modelo aparece
  // a foto"): foto grande fica escondida até clicar no nome - dá um
  // clima de revelação (bate com a ideia de "tipo um bbb" que ele mencionou)
  // em vez de já abrir tudo de cara.
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setVotedId(window.localStorage.getItem(VOTED_KEY_PREFIX + currentMonthKey()));
    void loadRanking();
  }, []);

  async function loadRanking() {
    setLoading(true);
    try {
      const data = await partnersApi.ranking();
      setRanking(data);
    } catch {
      // SENIOR: se o backend estiver fora do ar, o board some sem quebrar o
      // resto da página de parceiras - não é conteúdo crítico da página.
      setRanking([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(partnerId: string) {
    if (votedId) return;
    setMessage(null);
    setVotingId(partnerId);
    try {
      const visitorId = getOrCreateVisitorId();
      await partnersApi.vote(partnerId, visitorId);
      window.localStorage.setItem(VOTED_KEY_PREFIX + currentMonthKey(), partnerId);
      setVotedId(partnerId);
      setMessage("Voto registrado! Obrigado por participar.");
      void loadRanking();
    } catch (err) {
      const text = err instanceof Error ? err.message : "Não consegui registrar seu voto.";
      // SENIOR: se o backend já rejeitou por "já votou esse mês" (409), trava
      // o botão local também, pra não ficar tentando de novo à toa.
      if (text.toLowerCase().includes("já votou")) {
        setVotedId(partnerId);
      }
      setMessage(text);
    } finally {
      setVotingId(null);
    }
  }

  if (!loading && ranking.length === 0) return null;

  return (
    <section className="bg-abyss px-6 pb-24 md:px-10">
      <div className="mx-auto max-w-4xl">
        <Reveal className="text-center">
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-neon">
            Ranking de {currentMonthLabel()}
          </p>
          <h2 className="mt-4 font-display text-3xl font-extrabold uppercase text-white md:text-4xl">
            Vote na sua parceira favorita
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/60">
            O ranking soma indicação de verdade (reserva feita com o cupom dela) e o voto do público. Reseta todo
            mês. Você pode votar uma vez por mês.
          </p>
        </Reveal>

        {/* SENIOR (2026-08-06, pedido do Alvaro: "eu tenho que saber os
            proximos niveis" + "tem que ser tipo bbb"): roadmap dos níveis
            sempre visível no topo - dá o clima de "jogo com fases" que ele
            pediu, sem expor R$. */}
        <Reveal className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {LEVEL_ROADMAP.map((tier, index) => (
            <div key={tier.level} className="flex items-center gap-2">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white/70">
                {tier.level}. {tier.name}
                <span className="ml-1.5 text-white/40">
                  {tier.from === 0 ? "início" : `${tier.from}+ reservas`}
                </span>
              </span>
              {index < LEVEL_ROADMAP.length - 1 && <span className="text-white/25">→</span>}
            </div>
          ))}
        </Reveal>

        {loading ? (
          <div className="mt-10 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-neon" />
          </div>
        ) : (
          <div className="mt-10 flex flex-col gap-3">
            {ranking.map((entry) => {
              const isExpanded = expandedId === entry.partnerId;
              return (
                <Reveal
                  key={entry.partnerId}
                  delay={Math.min(entry.rank * 0.05, 0.3)}
                  className="rounded-2xl border border-white/10 bg-abyss-card p-4 md:p-5"
                >
                  {/* SENIOR (2026-08-06, pedido do Alvaro: "preciso arrumar o
                      responsivo" + "aqui nao ta aparecendo as fotos"): duas
                      mudanças aqui - (1) miniatura da foto agora aparece
                      SEMPRE que existe photoUrl (antes só mostrava depois de
                      clicar no nome - dava a impressão de "não tem foto");
                      clicar no nome/foto ainda expande a versão grande
                      embaixo do card. (2) flex-wrap no grupo de
                      votos+botão - em tela estreita eles quebram pra uma
                      2ª linha em vez de espremer o nome no meio. */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neon/30 bg-neon/10 font-display text-lg font-black text-neon">
                        {entry.rank === 1 ? <Trophy className="h-5 w-5" /> : entry.rank}
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : entry.partnerId)}
                        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10"
                      >
                        {entry.photoUrl ? (
                          <img src={entry.photoUrl} alt={entry.name} className="h-full w-full object-cover" />
                        ) : (
                          <Camera className="h-4 w-4 text-white/25" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : entry.partnerId)}
                            className="truncate font-display text-base font-bold text-white underline decoration-neon/40 decoration-2 underline-offset-4 hover:text-neon"
                          >
                            {entry.name}
                          </button>
                          <span className="shrink-0 rounded-full border border-neon/30 bg-neon/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-neon">
                            Nível {entry.levelNumber} · {entry.levelName}
                          </span>
                          {!entry.photoUrl && (
                            <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/35">
                              Foto em breve
                            </span>
                          )}
                        </div>
                        {entry.instagram && <p className="truncate text-xs text-white/50">@{entry.instagram.replace(/^@/, "")}</p>}
                        {/* SENIOR (pedido: "eu tenho que saber os proximos niveis"): progresso
                            visível pra visitante/parceira, sem número de R$. */}
                        {entry.bookingsUntilNextLevel !== null && (
                          <p className="mt-0.5 text-[11px] text-white/40">
                            Faltam {entry.bookingsUntilNextLevel} {entry.bookingsUntilNextLevel === 1 ? "reserva" : "reservas"} pro
                            próximo nível
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-auto flex shrink-0 items-center gap-3 pl-14 sm:ml-0 sm:pl-0">
                      <p className="whitespace-nowrap text-xs text-white/50">{entry.voteCount} votos</p>
                      <button
                        type="button"
                        onClick={() => void handleVote(entry.partnerId)}
                        disabled={Boolean(votedId) || votingId === entry.partnerId}
                        className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-neon px-4 text-xs font-extrabold uppercase tracking-widest text-abyss transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {votingId === entry.partnerId ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Vote className="h-3.5 w-3.5" />
                        )}
                        {votedId === entry.partnerId ? "Votado" : "Votar"}
                      </button>
                    </div>
                  </div>
                  {isExpanded && entry.photoUrl && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={entry.photoUrl}
                        alt={entry.name}
                        className="max-h-80 w-full max-w-xs rounded-xl object-cover"
                      />
                    </div>
                  )}
                </Reveal>
              );
            })}
          </div>
        )}

        {message && <p className="mt-6 text-center text-sm font-bold text-white/70">{message}</p>}

        {/* SENIOR (2026-08-06, pedido do Alvaro: "quero que as modelos
            ganham destaque na home"): quem vê o board na home e quer
            participar (não só votar) precisa achar o caminho pra virar
            parceira - link direto pra página completa do programa. */}
        <Reveal className="mt-8 text-center">
          <a
            href="/seja-parceira"
            className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-neon underline decoration-neon/40 decoration-2 underline-offset-4 hover:text-white"
          >
            Quer ser parceira e ganhar comissão? Saiba como →
          </a>
        </Reveal>
      </div>
    </section>
  );
}

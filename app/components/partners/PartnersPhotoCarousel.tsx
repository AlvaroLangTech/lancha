"use client";

import { useEffect, useState } from "react";
import { partnersApi, type PublicPartner } from "../../lib/partnersApi";
import { Reveal } from "../landing/Reveal";

// SENIOR (2026-08-06, pedido do Alvaro: "a foto da pat nao pode ficar perto
// da ana luisa, cuidado"): a ordem natural vem de createdAt (ver
// findAllPublic no backend) - como as duas foram cadastradas em sequência no
// seed-partners.ts, cairiam vizinhas na faixa. Essa função reordena só o
// necessário pra separar um par específico, tratando a lista como um CICLO
// (a faixa duplica pra fazer loop contínuo - ver `track` abaixo - então a
// "costura" entre a 1ª e a 2ª cópia também conta como vizinhança). Genérica
// de propósito: se aparecer outro par sensível no futuro, é só chamar de
// novo com os nomes certos.
function keepApart<T extends { name: string }>(items: T[], nameA: string, nameB: string): T[] {
  const n = items.length;
  if (n < 4) return items; // pouca gente pra reordenar com segurança
  const arr = [...items];
  const idxA = arr.findIndex((p) => p.name === nameA);
  const idxB = arr.findIndex((p) => p.name === nameB);
  if (idxA === -1 || idxB === -1) return arr;

  const isAdjacent = (i: number, j: number) => {
    const d = Math.abs(i - j);
    return d === 1 || d === n - 1;
  };
  if (!isAdjacent(idxA, idxB)) return arr;

  // acha uma posição "do outro lado do ciclo" em relação a A, longe o
  // suficiente pra não ficar vizinha dela também, e troca B pra lá.
  for (let offset = Math.floor(n / 2); offset < n; offset += 1) {
    const candidate = (idxA + offset) % n;
    if (!isAdjacent(idxA, candidate) && candidate !== idxB) {
      [arr[idxB], arr[candidate]] = [arr[candidate], arr[idxB]];
      return arr;
    }
  }
  return arr;
}

// SENIOR (2026-08-06, pedido do Alvaro: "quero que as modelos ganham
// destaque na home" + "com as fotos passando na horizontal?"): faixa
// visual separada do PartnersRankingBoard (que é a lista/votação) - essa
// aqui é só vitrine, sem interação, pra dar impacto visual logo no topo da
// home. Só mostra quem já tem foto cadastrada (ver savePartnerPhoto no
// admin) - parceira sem foto não aparece aqui (ela ainda aparece no board
// de ranking, com o selo "Foto em breve").
export function PartnersPhotoCarousel() {
  const [partners, setPartners] = useState<PublicPartner[]>([]);

  useEffect(() => {
    partnersApi
      .list()
      .then((data) => {
        const withPhoto = data.filter((p) => p.photoUrl);
        setPartners(keepApart(withPhoto, "Pat Ribeiro", "Ana Luísa"));
      })
      .catch(() => setPartners([]));
  }, []);

  if (partners.length === 0) return null;

  // SENIOR: duplica a lista uma vez - é o que permite a animação CSS
  // (partners-marquee, ver globals.css) andar -50% e looping ficar
  // invisível ao olho (a "costura" cai exatamente onde a 2ª cópia começa).
  const track = [...partners, ...partners];

  return (
    <section className="overflow-hidden bg-abyss pb-4 pt-10 md:pt-14">
      <Reveal className="mb-6 text-center">
        <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-neon">Nossas parceiras</p>
      </Reveal>
      <div className="relative">
        {/* SENIOR: gradiente nas bordas pra foto não "cortar seco" saindo da
            tela - efeito de vitrine contínua, não de lista truncada. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-abyss to-transparent md:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-abyss to-transparent md:w-32" />

        <div className="flex w-max animate-[partners-marquee_36s_linear_infinite] gap-4 px-4 hover:[animation-play-state:paused]">
          {track.map((partner, index) => (
            <div
              key={`${partner.id}-${index}`}
              className="flex w-36 shrink-0 flex-col items-center gap-2 md:w-44"
            >
              <div className="h-36 w-36 overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:h-44 md:w-44">
                <img src={partner.photoUrl} alt={partner.name} className="h-full w-full object-cover" />
              </div>
              <p className="font-display text-sm font-bold text-white">{partner.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

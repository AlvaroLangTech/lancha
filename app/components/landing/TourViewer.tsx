"use client";

import { useState } from "react";
import { PanoramaViewer } from "./PanoramaViewer";

// SENIOR (2026-08-02, "recebemos as fotos panoramicas para fazer o street
// view"): 5 panoramas escolhidos a dedo das 10 fotos que o Alvaro mandou -
// descartei 3 quase-duplicatas (mesmo ponto, foto repetida com o dedo
// tampando parte da lente) e 1 foto apontada pra baixo sem quadro
// aproveitável, ficando com o melhor ângulo de cada área real da lancha.
// Componente separado (client) da page.tsx (server, com metadata) porque
// page com "use client" não pode exportar metadata do Next.
const scenes = [
  { label: "Console e comandos", image: "/WhatsApp Image 2026-08-02 at 18.10.01 (3).jpeg" },
  { label: "Popa e estofados", image: "/WhatsApp Image 2026-08-02 at 18.10.02.jpeg" },
  { label: "Área de proa", image: "/WhatsApp Image 2026-08-02 at 18.10.01 (2).jpeg" },
  { label: "Doca e acesso", image: "/WhatsApp Image 2026-08-02 at 18.10.00.jpeg" },
  { label: "Saída para o lago", image: "/WhatsApp Image 2026-08-02 at 18.10.03 (1).jpeg" },
];

export function TourViewer() {
  const [active, setActive] = useState(0);
  const scene = scenes[active];

  return (
    <div>
      <PanoramaViewer key={scene.image} src={scene.image} alt={scene.label} />

      <div className="mt-6 flex flex-wrap gap-2.5">
        {scenes.map((s, i) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setActive(i)}
            className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
              i === active
                ? "border-neon bg-neon text-abyss"
                : "border-white/15 bg-white/5 text-white/70 hover:border-neon/50 hover:text-white"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-white/50">
        Fotos reais da própria Lancha Bêju, tiradas na Vila Planalto. Arraste com o mouse ou o dedo pra olhar ao
        redor de cada ponto do barco.
      </p>
    </div>
  );
}

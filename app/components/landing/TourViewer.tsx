"use client";

import { SphericalPanoramaViewer, type SphericalScene } from "./SphericalPanoramaViewer";

// SENIOR (2026-08-03, pedido do Alvaro: "deixe apenas a primeira imagem e a
// segunda que vamos gerar agora, permita andar pela imagem, coloque esse
// street view na pagina principal"): duas cenas panoramicas ligadas por
// hotspots clicaveis (setas dentro da propria foto 360). yaw/pitch abaixo
// sao "chute inicial" (0 = centro da foto, 90 = direita, -90 = esquerda,
// pitch negativo = olhando pra baixo, onde normalmente fica o convés/deck
// e faz mais sentido colocar uma seta de "andar") - ajustar visualmente se
// a seta aparecer apontando pro lugar errado depois do deploy.
const scenes: (SphericalScene & { label: string })[] = [
  {
    id: "doca",
    label: "Doca e acesso",
    src: "/lancha panorama 1.webp",
    alt: "Doca e acesso da Lancha Bêju",
    hotspots: [
      {
        pitch: -8,
        yaw: 35,
        targetSceneId: "conves",
        text: "Ir para o convés",
      },
    ],
  },
  {
    id: "conves",
    label: "Convés da lancha",
    src: "/406be9f4-e073-4b64-8c48-053fd29ebbe7.webp",
    alt: "Convés da Lancha Bêju",
    hotspots: [
      {
        pitch: -8,
        yaw: -145,
        targetSceneId: "doca",
        text: "Voltar para a doca",
      },
    ],
  },
];

export function TourViewer() {
  return (
    <div>
      <SphericalPanoramaViewer scenes={scenes} initialSceneId={scenes[0].id} />

      <div className="mt-6 flex flex-wrap gap-2">
        {scenes.map((scene) => (
          <span
            key={scene.id}
            className="inline-flex rounded-full border border-neon bg-neon px-4 py-2 text-xs font-bold uppercase tracking-widest text-abyss"
          >
            {scene.label}
          </span>
        ))}
      </div>

      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-white/50">
        Panorama 360 real da Lancha Bêju. Arraste com o mouse ou com o dedo para olhar ao redor e clique
        nas setas dentro da imagem para andar entre a doca e o convés.
      </p>
    </div>
  );
}

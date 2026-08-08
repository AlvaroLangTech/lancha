"use client";

import { useEffect, useRef } from "react";

// SENIOR (2026-08-02, "mandei" - primeira foto panoramica que o Alvaro
// completou via IA (panopulse.com, outpainting a partir de 3 fotos reais da
// doca) em equirretangular de verdade, 3840x1920, 2:1): esse componente é o
// visualizador 360 ESFÉRICO de verdade, diferente do PanoramaViewer.tsx
// (que só arrasta lateralmente uma foto larga comum). Usa Pannellum via CDN
// (não é dependência npm - carregado sob demanda, só quando essa cena
// aparece, mesmo padrão do Google Fonts em layout.tsx) porque é uma lib
// pequena, madura, MIT, feita exatamente pra isso (rotação livre em
// qualquer direção + zoom), sem precisar montar câmera/esfera/controles do
// zero em Three.js.
//
// SENIOR (2026-08-03, pedido do Alvaro: "permita andar pela imagem" - agora
// com a segunda cena panoramica pronta): trocado de UMA cena fixa pro modo
// MULTI-CENA nativo do Pannellum (config `scenes` + `hotSpots` do tipo
// "scene"). Cada cena pode ter um ou mais pontos clicaveis DENTRO da propria
// imagem 360 que levam pra outra cena - isso e o que da a sensacao de
// "andar" pela lancha (doca -> console -> doca), sem precisar da feature
// paga "Create World" do gerador de imagem (essa e outra tecnologia, 3D de
// verdade, cara e incompativel com o resto do site). O Pannellum troca de
// cena com crossfade suave sozinho.
declare global {
  interface Window {
    pannellum?: {
      viewer: (
        container: HTMLElement,
        config: Record<string, unknown>,
      ) => { destroy: () => void; loadScene: (sceneId: string) => void };
    };
  }
}

let pannellumLoad: Promise<void> | null = null;

function loadPannellum(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.pannellum) return Promise.resolve();
  if (pannellumLoad) return pannellumLoad;

  pannellumLoad = new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/pannellum/2.5.6/pannellum.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pannellum/2.5.6/pannellum.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar o visualizador 360."));
    document.body.appendChild(script);
  });

  return pannellumLoad;
}

export interface SphericalHotspot {
  pitch: number;
  yaw: number;
  targetSceneId: string;
  text: string;
}

export interface SphericalScene {
  id: string;
  src: string;
  alt: string;
  hotspots?: SphericalHotspot[];
}

interface SphericalPanoramaViewerProps {
  scenes: SphericalScene[];
  initialSceneId: string;
}

export function SphericalPanoramaViewer({ scenes, initialSceneId }: SphericalPanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<{ destroy: () => void; loadScene: (sceneId: string) => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const sceneConfig: Record<string, unknown> = {};
    for (const scene of scenes) {
      sceneConfig[scene.id] = {
        type: "equirectangular",
        panorama: scene.src,
        title: scene.alt,
        hotSpots: (scene.hotspots || []).map((hs) => ({
          pitch: hs.pitch,
          yaw: hs.yaw,
          type: "scene",
          sceneId: hs.targetSceneId,
          text: hs.text,
        })),
      };
    }

    loadPannellum()
      .then(() => {
        if (cancelled || !containerRef.current || !window.pannellum) return;
        viewerRef.current = window.pannellum.viewer(containerRef.current, {
          default: {
            firstScene: initialSceneId,
            autoLoad: true,
            compass: false,
            showZoomCtrl: true,
            showFullscreenCtrl: true,
            mouseZoom: true,
            draggable: true,
            sceneFadeDuration: 800,
            // SENIOR (2026-08-02, "eu já quero o zoom longe no maximo, zoom
            // out, nao proximo"): hfov = campo de visão horizontal - quanto
            // MAIOR, mais "afastado"/mais cena cabe na tela.
            hfov: 120,
            minHfov: 50,
            maxHfov: 120,
          },
          scenes: sceneConfig,
        });
      })
      .catch(() => {
        // SENIOR: se o CDN falhar (rede bloqueada, etc.), fica só o fundo
        // escuro do container em vez de quebrar a página - degrada bem.
      });

    return () => {
      cancelled = true;
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenes.map((s) => s.id + s.src).join("|"), initialSceneId]);

  return (
    <div
      role="img"
      aria-label="Tour 360 pela Lancha Bêju"
      className="relative h-[56vh] max-h-[560px] w-full overflow-hidden rounded-2xl border border-white/10 bg-abyss-card"
    >
      {/* SENIOR (bug real, descoberto testando): Pannellum SOBRESCREVE o
          atributo className do elemento que a gente passa pra ele (troca
          tudo por só "pnlm-container"), apagando h-[56vh]/border/etc do
          Tailwind e colapsando a altura pra 0. Fix: as classes de tamanho
          ficam no <div> DE FORA (que o Pannellum nunca toca), e o <div> que
          vai pro Pannellum é medido via style inline (position/inset), que
          sobrevive à troca de className porque não é className. */}
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[5] flex justify-center">
        <span className="rounded-full bg-abyss/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80 backdrop-blur">
          Arraste para olhar ao redor · clique nas setas para andar pela lancha
        </span>
      </div>
    </div>
  );
}

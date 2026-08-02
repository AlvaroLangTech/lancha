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
declare global {
  interface Window {
    pannellum?: {
      viewer: (
        container: HTMLElement,
        config: Record<string, unknown>,
      ) => { destroy: () => void };
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

interface SphericalPanoramaViewerProps {
  src: string;
  alt: string;
}

export function SphericalPanoramaViewer({ src, alt }: SphericalPanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadPannellum()
      .then(() => {
        if (cancelled || !containerRef.current || !window.pannellum) return;
        viewerRef.current = window.pannellum.viewer(containerRef.current, {
          type: "equirectangular",
          panorama: src,
          title: alt,
          autoLoad: true,
          compass: false,
          showZoomCtrl: true,
          showFullscreenCtrl: true,
          mouseZoom: true,
          draggable: true,
          // SENIOR (2026-08-02, "eu já quero o zoom longe no maximo, zoom
          // out, nao proximo"): hfov = campo de visão horizontal - quanto
          // MAIOR, mais "afastado"/mais cena cabe na tela. Antes abria em
          // 100 (mais perto); agora abre já no maxHfov (o zoom out máximo
          // permitido), pra mostrar a cena inteira de cara. O visitante
          // ainda pode dar zoom in se quiser (scroll/botão -), só não começa
          // assim.
          hfov: 120,
          minHfov: 50,
          maxHfov: 120,
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
  }, [src, alt]);

  return (
    <div
      role="img"
      aria-label={alt}
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
      {/* SENIOR: sem badge própria de canto aqui - o Pannellum já desenha
          controles de zoom/fullscreen no canto superior esquerdo e o título
          (prop "title" passada no viewer()) no inferior esquerdo; e o "X/5"
          de progresso já vem do TourViewer no canto superior direito. Um
          selo extra nosso ia disputar espaço com um desses em qualquer
          canto. Só a dica central embaixo, que fica numa faixa livre. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[5] flex justify-center">
        <span className="rounded-full bg-abyss/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80 backdrop-blur">
          Arraste em qualquer direção
        </span>
      </div>
    </div>
  );
}

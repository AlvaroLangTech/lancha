"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// SENIOR (2026-08-02, "recebemos as fotos panoramicas para fazer o street
// view, vamos fazer essa maluquice"): as fotos que o Alvaro mandou sao
// panoramas de celular (modo "Panorama" nativo do Android/iPhone) - bem
// largas (~5:1), mas NAO sao equirretangulares 360x180 de verdade (o tipo
// que bibliotecas como Pannellum/Photo Sphere Viewer esperam, com projecao
// esferica e polos). Tentar forcar essas fotos numa lib de 360 esferico
// distorceria tudo (esticaria o topo/base de forma esquisita). Em vez
// disso, isso aqui e um visualizador mais simples e honesto com o material
// que temos: a foto fica MAIOR que a janela visivel, o usuario arrasta
// (mouse ou dedo) pra deslizar horizontalmente e "olhar ao redor" - mesma
// sensacao de passear pela cena, sem fingir ser uma esfera 3D que a foto
// não é.
interface PanoramaViewerProps {
  src: string;
  alt: string;
}

export function PanoramaViewer({ src, alt }: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [offset, setOffset] = useState(0);
  const drag = useRef({ startX: 0, startOffset: 0, active: false });

  const clamp = useCallback((value: number) => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img || !img.clientWidth) return 0;
    const min = Math.min(0, container.clientWidth - img.clientWidth);
    return Math.max(min, Math.min(0, value));
  }, []);

  const center = useCallback(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img || !img.clientWidth) return;
    setOffset(clamp((container.clientWidth - img.clientWidth) / 2));
  }, [clamp]);

  // Troca de cena (usuario clicou outro ponto de interesse): recentraliza
  // a nova foto assim que ela tiver layout pronto, em vez de herdar o
  // offset de arraste da foto anterior (senao abre "cortada" de lado).
  useEffect(() => {
    setOffset(0);
    const id = requestAnimationFrame(center);
    return () => cancelAnimationFrame(id);
  }, [src, center]);

  useEffect(() => {
    const onResize = () => center();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [center]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { startX: e.clientX, startOffset: offset, active: true };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    setOffset(clamp(drag.current.startOffset + (e.clientX - drag.current.startX)));
  };
  const endDrag = () => {
    drag.current.active = false;
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") setOffset((o) => clamp(o + 80));
    if (e.key === "ArrowRight") setOffset((o) => clamp(o - 80));
  };

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={alt}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onKeyDown={onKeyDown}
      className="relative h-[56vh] max-h-[560px] w-full touch-none select-none overflow-hidden rounded-2xl border border-white/10 bg-abyss-card outline-none [cursor:grab] active:[cursor:grabbing]"
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        onLoad={center}
        className="pointer-events-none absolute left-0 top-0 h-full w-auto max-w-none"
        style={{ transform: `translateX(${offset}px)` }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
        <span className="rounded-full bg-abyss/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80 backdrop-blur">
          Arraste para olhar ao redor
        </span>
      </div>
      <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-abyss/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neon backdrop-blur">
        360°
      </div>
    </div>
  );
}

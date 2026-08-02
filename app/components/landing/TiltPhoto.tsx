"use client";

import { useEffect, useRef, useState } from "react";
import { Move3d } from "lucide-react";

// SENIOR (2026-08-01, pedido do Alvaro: "vamos subir de nivel... efeito que
// da profundidade e realismo pra foto e mexe conforme balança o celular"):
// efeito de tilt/parallax 3D na foto - no desktop reage ao mouse, no celular
// reage ao giroscópio de verdade (evento deviceorientation). A foto "flutua"
// levemente com sombra + brilho que se movem junto, dando sensação de
// profundidade numa imagem 2D comum (sem precisar de foto 3D real).
//
// iOS 13+ EXIGE que o usuário toque na tela pra liberar o acesso ao sensor
// de movimento (DeviceOrientationEvent.requestPermission() só funciona
// dentro de um gesto do usuário, tipo onClick - não dá pra pedir sozinho no
// load da página). Por isso: no iOS mostra um botão discreto "ativar efeito
// 3D"; no Android/desktop já funciona direto (mouse ou giroscópio sem
// permissão extra).
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function TiltPhoto({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [needsMotionPermission, setNeedsMotionPermission] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);

  useEffect(() => {
    const DeviceOrientationEventTyped = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };

    function handleOrientation(event: DeviceOrientationEvent) {
      // gamma: inclinação esquerda/direita (-90 a 90). beta: frente/tras
      // (-180 a 180, ~45-60 graus e o "neutro" de segurar o celular na mao).
      const gamma = event.gamma ?? 0;
      const beta = event.beta ?? 45;
      const ry = clamp(gamma, -16, 16);
      const rx = clamp(-(beta - 50) * 0.4, -12, 12);
      setTilt({ rx, ry });
    }

    if (typeof DeviceOrientationEventTyped?.requestPermission === "function") {
      // iOS: nao registra o listener ainda, precisa do toque do usuario primeiro.
      setNeedsMotionPermission(true);
      return;
    }

    // Android e a maioria dos navegadores desktop com sensor: funciona direto.
    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  const enableMotion = async () => {
    try {
      const DeviceOrientationEventTyped = window.DeviceOrientationEvent as unknown as {
        requestPermission: () => Promise<"granted" | "denied">;
      };
      const result = await DeviceOrientationEventTyped.requestPermission();
      if (result === "granted") {
        window.addEventListener("deviceorientation", (event) => {
          const gamma = event.gamma ?? 0;
          const beta = event.beta ?? 45;
          setTilt({
            rx: clamp(-(beta - 50) * 0.4, -12, 12),
            ry: clamp(gamma, -16, 16),
          });
        });
        setMotionEnabled(true);
        setNeedsMotionPermission(false);
      }
    } catch {
      // usuario negou ou navegador nao suporta - fica so no efeito de mouse mesmo.
      setNeedsMotionPermission(false);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -py * 14, ry: px * 14 });
  };

  const handleMouseLeave = () => setTilt({ rx: 0, ry: 0 });

  // Posicao do brilho/sombra acompanha a inclinacao - reforca a leitura de
  // profundidade (luz "escorrega" pro lado oposto de onde a foto se inclina).
  const glowX = 50 + tilt.ry * 2.2;
  const glowY = 50 - tilt.rx * 2.2;

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative [perspective:1200px] ${className || ""}`}
    >
      <div
        style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
        className="relative h-full w-full [transform-style:preserve-3d] transition-transform duration-150 ease-out will-change-transform"
      >
        {/* SENIOR (2026-08-01, "só uma sensação de movimento", usando as
            fotos que já temos, sem gerar nada novo): zoom/pan lento
            (ken-burns, definido em globals.css) fica numa camada separada
            do translateZ estático - se os dois animassem "transform" no
            MESMO elemento, um sobrescreveria o outro. Esse wrapper carrega
            a profundidade fixa; o <img> dentro dele só faz o zoom/pan. */}
        <div className="h-full w-full overflow-hidden [transform:translateZ(24px)]">
          <img
            src={src}
            alt={alt}
            className="h-full w-full origin-center object-contain animate-[ken-burns_22s_ease-in-out_infinite]"
            style={{
              filter: `drop-shadow(${-tilt.ry * 0.8}px ${8 - tilt.rx * 0.8}px 16px rgba(0,0,0,0.45))`,
            }}
          />
        </div>
        {/* Brilho que se move com a inclinacao - da sensacao de superficie
            refletindo luz, nao so uma foto plana colada na tela. */}
        <div
          className="pointer-events-none absolute inset-0 [transform:translateZ(30px)] transition-[background] duration-150 ease-out"
          style={{
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.16), transparent 55%)`,
          }}
        />
      </div>

      {needsMotionPermission && !motionEnabled && (
        <button
          type="button"
          onClick={enableMotion}
          className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-abyss/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/80 backdrop-blur-sm transition hover:border-neon hover:text-neon"
        >
          <Move3d className="h-3 w-3" /> Ativar efeito 3D
        </button>
      )}
    </div>
  );
}

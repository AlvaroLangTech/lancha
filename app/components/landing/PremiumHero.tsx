"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "../../lib/site";

export function PremiumHero() {
  // SENIOR (2026-08-01, "no hero, eu quero primeiro o vídeo! depois a
  // foto!"): Alvaro inverteu o pedido original (antes era foto->video,
  // "a pessoa ve, entende, depois o video, fluidez"). Agora e video->foto:
  // o video toca UMA vez (sem loop) e, quando termina, desaparece revelando
  // a foto por baixo, que fica como estado de descanso permanente.
  //
  // O <video poster="/call_FwCQxvWceQgcEgnBdX0YTMUQ.png"> resolve a reclamacao "ta demorando pra
  // comecar o video" de um jeito nativo: o poster (a MESMA foto, poucos KB)
  // pinta a tela instantaneamente no load, sem esperar nada do arquivo de
  // video (que continua grande - 27,5MB - e continua precisando ser
  // comprimido de verdade, isso o poster nao resolve, so disfarca a
  // espera). Assim que os primeiros frames do video estao prontos
  // (onCanPlay), ele entra em cross-fade sobre o poster; quando termina
  // (onEnded), sai em cross-fade revelando a foto de novo - fecha o ciclo
  // video->foto que ele pediu.
  const [videoVisible, setVideoVisible] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // SENIOR (2026-08-02, "tá demorando muito pra aparecer o vídeo cara!"):
  // antes só existia o listener onCanPlay - se por qualquer motivo esse
  // evento específico não disparasse (varia por navegador/host), o vídeo
  // ficava preso invisível PRA SEMPRE, mesmo já carregado. Agora: (1) reage
  // a onCanPlay OU onLoadedData, o que disparar primeiro; (2) chama
  // videoRef.play() manualmente também - o atributo autoPlay sozinho às
  // vezes não é suficiente em todo navegador; (3) onError loga no console
  // pra facilitar diagnóstico se o arquivo de vídeo não carregar.
  // IMPORTANTE - isso NÃO resolve o problema real de fundo: o arquivo tem
  // 27,5MB, então numa rede mais lenta a demora é o download em si, não um
  // bug de JS. Comprimir o arquivo (H.264, poucos segundos, alvo < 5MB) é a
  // única forma de resolver a demora de verdade.
  const showVideoNow = () => {
    setVideoVisible(true);
    videoRef.current?.play().catch(() => {});
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video && video.readyState >= 2) {
      showVideoNow();
    }
  }, []);

  return (
    <section id="top" className="relative flex min-h-screen items-end overflow-hidden bg-abyss">
      {/* Wordmark gigante decorativo atras da lancha - elemento tipografico */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[22vw] font-extrabold leading-none text-white/[0.04] select-none"
      >
        BÊJU
      </span>

      {/* SENIOR (2026-07-31, feedback do Alvaro: "a fonte quase nao da pra
          ver" - no mobile o recorte object-cover da foto as vezes deixa o
          brilho do por-do-sol bem atras do texto pequeno do topo, e so os
          gradientes direcionais nao garantiam escurecimento minimo ali):
          camada extra bg-abyss/40 uniforme por cima de tudo - escurece a
          foto inteira de forma pareja, garante contraste minimo em QUALQUER
          zona da imagem, independente de onde o recorte cair. */}
      {/* SENIOR (2026-08-01, pedido do Alvaro: "coloca esse video, funcional
          e nitido" - video de drone gerado por IA (Kling) da lancha andando
          no lago, pra substituir a foto estatica do hero): autoplay+muted+
          loop+playsInline sao TODOS obrigatorios pra autoplay funcionar sem
          interacao do usuario em qualquer navegador mobile (Safari/Chrome
          iOS e Android exigem os 4 juntos, senao o video fica pausado no
          primeiro frame). */}
      {/* Camada base permanente - nunca desmonta, garante que sempre tem
          alguma coisa visivel embaixo do video (sem flash pra tela preta
          nem pro fallback generico do navegador). */}
      {/* SENIOR (2026-08-01, bug real: imagem quebrada - o Alvaro salvou a
          foto real da lancha como "barco-.jpeg" em vez de sobrescrever
          "hero-lancha-beju.png" (2x seguidas, nomes diferentes cada vez).
          Apontando o codigo pro nome real que esta em public/ em vez de
          continuar pedindo rename manual - assim para de quebrar. */}
      {/* SENIOR (2026-08-01, "a proporção tá ruim, apertou a imagem, quero a
          imagem toda"): a foto e paisagem (~3:2) mas o hero e tela cheia
          (retrato no celular, largo no desktop) - object-cover ANTES
          cortava as bordas da lancha pra preencher esses formatos bem
          diferentes do da foto. Fix: object-contain mostra a lancha
          INTEIRA sempre, em qualquer tela - a sobra (letterbox) fica com
          a cor bg-abyss da propria <section>, entao nao precisa de camada
          extra de fundo (testei com blur decorativo, mas pesava o
          carregamento sem necessidade - a secao ja e escura). Foto e video
          usam o MESMO tratamento (object-contain) pra nao trocar de
          enquadramento no crossfade e reabrir o bug do "flash". */}
      <img
        src="/call_FwCQxvWceQgcEgnBdX0YTMUQ.png"
        alt="Lancha Bêju atracada no Lago Paranoa"
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ease-in [filter:brightness(1.12)_contrast(1.16)_saturate(1.14)] ${
          videoVisible && !videoEnded ? "opacity-0" : "opacity-90"
        }`}
      />
      <video
        ref={videoRef}
        src="/hero-lancha-beju.mp4"
        poster="/call_FwCQxvWceQgcEgnBdX0YTMUQ.png"
        autoPlay
        muted
        playsInline
        preload="auto"
        onCanPlay={showVideoNow}
        onLoadedData={showVideoNow}
        onEnded={() => setVideoEnded(true)}
        onError={(e) => console.error("Hero video falhou ao carregar:", e)}
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ease-in [filter:brightness(1.1)_contrast(1.14)_saturate(1.12)] ${
          videoVisible && !videoEnded ? "opacity-90" : "opacity-0"
        }`}
      />
      <div className="absolute inset-0 bg-abyss/15" />
      <div className="absolute inset-0 bg-linear-to-t from-abyss/90 via-abyss/28 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-r from-abyss/55 via-transparent to-abyss/35" />

      <div className="relative z-10 w-full px-6 pb-20 pt-40 md:px-10">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 font-display text-xs font-bold uppercase tracking-[0.3em] text-neon"
        >
          Passeios privativos · Lago Paranoá
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-4xl font-display text-[13vw] font-extrabold uppercase leading-[0.86] text-white md:text-[7vw]"
        >
          Lancha Bêju
        </motion.h1>

        {/* SENIOR (2026-08-01): assinatura em Great Vibes, mesmo tratamento
            do "Navegue. Relaxe. Aproveite." do site de referencia que o
            Alvaro gostou - decisao dele foi trocar so a fonte (mantendo a
            paleta abyss/neon), entao aqui uso font-script em vez de mexer
            em cor/fundo. */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-2 font-script text-4xl text-neon md:text-5xl"
        >
          Navegue. Relaxe. Aproveite.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-10 flex flex-col justify-between gap-8 md:flex-row md:items-end"
        >
          <div className="max-w-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-white/80">Experiência Náutica Privativa</p>
            <p className="mt-2 text-sm text-white/80">
              Grupo fechado, roteiro combinado com você e atendimento direto do início ao fim do passeio.
            </p>
          </div>

          <a
            href="/passeio-de-lancha-brasilia"
            className="inline-flex w-fit items-center justify-center rounded-full bg-neon px-8 py-4 text-sm font-bold uppercase tracking-widest text-abyss transition hover:scale-105 hover:brightness-110"
          >
            Ver Passeios
          </a>

          <div className="max-w-sm text-left md:text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-white/80">Viva o Lago Paranoá</p>
            <p className="mt-2 text-sm text-white/80">{siteConfig.displayPhone} · {siteConfig.location}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

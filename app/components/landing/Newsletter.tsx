"use client";

import { CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Reveal } from "./Reveal";
import { siteConfig } from "../../lib/site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// SENIOR: formulario simples e controlado (useState + regex de e-mail) em
// vez de react-hook-form + zod - pra um unico campo de e-mail + checkbox,
// as duas libs seriam peso extra sem ganho real, e cada dependencia nova
// e um risco a mais sem eu poder rodar `npm install`/build local pra
// confirmar (ambiente de execucao instavel a sessao inteira).
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError("Digite um e-mail válido.");
      return;
    }
    if (!optIn) {
      setError("Confirme que quer receber novidades da Lancha Bêju.");
      return;
    }
    setError(null);
    // MVP: sem backend proprio ainda pra este projeto - segue pro WhatsApp
    // com o e-mail preenchido, mesma logica ja usada em WhatsAppLeadForm.tsx.
    setSent(true);
    window.open(
      `${siteConfig.whatsappHref}&email=${encodeURIComponent(email)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <section className="bg-abyss-light py-24 md:py-32">
      <div className="mx-auto max-w-2xl px-6 text-center md:px-10">
        <Reveal>
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-neon">Fique por dentro</p>
          <h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] text-white md:text-5xl">
            Entre para o Clube Bêju
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/60">
            Novidades de agenda, roteiros e experiências especiais direto com você — sem spam.
          </p>

          {sent ? (
            <div className="mx-auto mt-8 flex max-w-sm items-center justify-center gap-2 rounded-full border border-neon/40 bg-neon/10 px-6 py-4 text-sm font-bold text-neon">
              <CheckCircle2 className="h-5 w-5" />
              Perfeito! Continue a conversa no WhatsApp que abrimos.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seu@email.com"
                  className="min-h-13 flex-1 rounded-full border border-white/15 bg-white/5 px-5 text-sm text-white outline-none placeholder:text-white/40 focus:border-neon"
                />
                <button
                  type="submit"
                  className="min-h-13 shrink-0 rounded-full bg-neon px-7 text-sm font-bold uppercase tracking-widest text-abyss transition hover:scale-105 hover:brightness-110"
                >
                  Enviar
                </button>
              </div>

              <label className="flex items-start gap-2.5 text-left text-xs text-white/50">
                <input
                  type="checkbox"
                  checked={optIn}
                  onChange={(event) => setOptIn(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-neon"
                />
                Quero receber novidades da Lancha Bêju por e-mail e WhatsApp.
              </label>

              {error && <p className="text-left text-xs font-bold text-red-400">{error}</p>}
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

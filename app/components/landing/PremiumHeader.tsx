"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { siteConfig } from "../../lib/site";

// SENIOR (2026-07-31): "/#..." em vez de "#..." - agora que este header e
// usado em TODAS as paginas do site (nao so na Home), um link "#experiencia"
// puro nao faz nada fora da Home (nao existe esse id na pagina atual). Com
// "/#experiencia" o Next navega pra Home e rola ate a secao certa, de
// qualquer pagina.
const navItems = [
  { href: "/#experiencia", label: "Experiência" },
  { href: "/#a-bordo", label: "A Lancha" },
  { href: "/#avaliacoes", label: "Avaliações" },
];

export function PremiumHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-abyss/95 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <a href="/" className="font-display text-lg font-extrabold uppercase tracking-tight text-white">
          {siteConfig.brand}
        </a>

        <nav className="hidden items-center gap-9 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-xs font-bold uppercase tracking-[0.18em] text-white/70 transition hover:text-neon"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <a
            href={siteConfig.whatsappHref}
            className="inline-flex items-center rounded-full bg-neon px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-abyss transition hover:scale-105 hover:brightness-110"
          >
            Falar no WhatsApp
          </a>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMenuOpen((v) => !v)}
          className="text-white md:hidden"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-abyss px-6 py-6 md:hidden">
          <nav className="flex flex-col gap-5">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-bold uppercase tracking-widest text-white/80"
              >
                {item.label}
              </a>
            ))}
            <a
              href={siteConfig.whatsappHref}
              className="inline-flex items-center justify-center rounded-full bg-neon px-5 py-3 text-xs font-bold uppercase tracking-widest text-abyss"
            >
              Falar no WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

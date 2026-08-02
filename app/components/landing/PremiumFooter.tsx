import { MessageCircle, Phone } from "lucide-react";
import { siteConfig } from "../../lib/site";

// SENIOR: colunas de "Siga-nos" e "Politicas" do spec original foram
// ajustadas pra so linkar coisas que existem de verdade hoje - nao tem
// Instagram/redes confirmadas nem paginas de Termos/Privacidade ainda
// nesse projeto (so /perguntas-frequentes e /seguranca-e-regras), entao
// preferi nao inventar link quebrado.
export function PremiumFooter() {
  return (
    <footer className="overflow-hidden bg-neon text-abyss">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-20 md:px-10">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-abyss/60">Contato</p>
            <a href={siteConfig.whatsappHref} className="mt-4 flex items-center gap-2 text-sm font-bold hover:underline">
              <MessageCircle className="h-4 w-4" /> WhatsApp oficial
            </a>
            <a href={`tel:+${siteConfig.phone}`} className="mt-2 flex items-center gap-2 text-sm font-bold hover:underline">
              <Phone className="h-4 w-4" /> {siteConfig.displayPhone}
            </a>
            <p className="mt-2 text-sm text-abyss/70">{siteConfig.location}</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-abyss/60">Navegue</p>
            <nav className="mt-4 flex flex-col gap-2 text-sm font-bold">
              <a href="/passeio-de-lancha-brasilia" className="hover:underline">Passeios</a>
              <a href="/a-lancha" className="hover:underline">A Lancha</a>
              <a href="/clube" className="hover:underline">Clube</a>
              <a href="/tour-360" className="hover:underline">Tour 360°</a>
            </nav>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-abyss/60">Informações</p>
            <nav className="mt-4 flex flex-col gap-2 text-sm font-bold">
              <a href="/perguntas-frequentes" className="hover:underline">Perguntas Frequentes</a>
              <a href="/seguranca-e-regras" className="hover:underline">Segurança e Regras</a>
            </nav>
          </div>
        </div>

        <p className="mt-14 text-xs text-abyss/60">
          © {new Date().getFullYear()} {siteConfig.brand}. Todos os direitos reservados.
        </p>
      </div>

      <div aria-hidden className="select-none pb-2 text-center leading-none">
        <span className="font-display text-[16vw] font-extrabold uppercase text-abyss/10 md:text-[12vw]">
          {siteConfig.brand}
        </span>
      </div>
    </footer>
  );
}

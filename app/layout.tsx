import type { Metadata } from "next";
import "./globals.css";
import { SiteChatWidget } from "./components/chat/SiteChatWidget";

export const metadata: Metadata = {
  metadataBase: new URL("https://lanchabeju.com.br"),
  title: {
    default: "Lancha Bêju | Passeio de lancha no Lago Paranoa",
    template: "%s | Lancha Bêju",
  },
  description:
    "Passeios privativos de lancha no Lago Paranoa, em Brasilia. Consulte disponibilidade pelo WhatsApp e entre no Clube de Interesse da Lancha Beju.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  alternates: { canonical: "/" },
  openGraph: {
    title: "Lancha Bêju",
    description: "Experiencias privativas de lancha no Lago Paranoa, em Brasilia.",
    images: ["/og.png"],
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* SENIOR (2026-07-31): Archivo/Inter carregadas via <link> classico
            do Google Fonts, NAO via next/font/google - ver comentario em
            app/globals.css sobre o bug de 503 (file:// quebrado) causado
            pelo pipeline de fonte local do vinext nesse ambiente. */}
        {/* SENIOR (2026-08-01, pedido do Alvaro: "gostei muito da fonte" do
            site de referencia lanchabeju.lovable.app - Playfair Display +
            Great Vibes, confirmado via getComputedStyle no navegador, nao
            chute): Archivo saiu do papel de fonte de titulo (--font-display),
            Playfair Display entra no lugar. Great Vibes e nova, script pra
            frases de destaque tipo assinatura. Inter continua no corpo do
            texto - decisao do Alvaro foi trocar SO a fonte, mantendo a
            paleta abyss/neon que ja testamos essa sessao inteira. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,600&display=swap"
        />
      </head>
      <body>
        {children}
        {/* SENIOR (2026-08-02, épico E11): widget global, aparece em toda
            página pública. Fica no layout raiz em vez de cada página incluir
            manualmente. */}
        <SiteChatWidget />
      </body>
    </html>
  );
}

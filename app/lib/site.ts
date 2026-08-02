export const siteConfig = {
  brand: "Lancha Bêju",
  url: "https://lanchabeju.com.br",
  tagline: "Passeios privativos no Lago Paranoa",
  location: "Lago Paranoa, Brasilia/DF",
  phone: "5561996940065",
  displayPhone: "(61) 99694-0065",
  whatsappHref:
    "/go/falar?origem=site&mensagem=Ola%2C%20quero%20consultar%20disponibilidade%20para%20um%20passeio%20privativo%20no%20Lago%20Paranoa.",
  // SENIOR (2026-08-02, "aqui é o link do grupo"): grupo de WhatsApp do
  // Clube de Interesse (fila de espera da temporada) - diferente do
  // whatsappHref acima, que é o contato direto 1:1 pra consultar
  // disponibilidade. Usado especificamente no botão "Entrar no Clube"
  // (LaunchOffer.tsx), não nos outros CTAs de WhatsApp do site.
  whatsappGroupHref: "https://chat.whatsapp.com/LF82jVdhCeHBVnjTZNDF2b",
};

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${siteConfig.phone}?text=${encodeURIComponent(message)}`;
}

export const benefits = [
  {
    index: "01",
    title: "Privacidade e presença",
    description:
      "Uma experiencia pensada para casais, familias, pequenos grupos e celebracoes com alto valor percebido.",
  },
  {
    index: "02",
    title: "Reserva com clareza",
    description:
      "O primeiro contato qualifica data, ocasiao e expectativas antes de confirmar qualquer informacao sensivel.",
  },
  {
    index: "03",
    title: "Crescimento rastreavel",
    description:
      "WhatsApp, Clube, QR codes e indicacoes ja nascem com origem, consentimento e eventos de conversao.",
  },
];

export const experiences = [
  {
    title: "Passeio de lancha em Brasilia",
    intent: "Alta intenção",
    href: "/passeio-de-lancha-brasilia",
    description:
      "Pagina principal para quem procura uma experiencia privativa de lancha na cidade.",
  },
  {
    title: "Lago Paranoa",
    intent: "SEO local",
    href: "/passeio-lago-paranoa",
    description:
      "Conteudo local para explicar a experiencia, o cenario e o processo de reserva.",
  },
  {
    title: "A lancha",
    intent: "Prova visual",
    href: "/a-lancha",
    description:
      "Espaco para fotos reais, estrutura confirmada, diferenciais e itens ainda a validar.",
  },
  {
    title: "Seguranca e regras",
    intent: "Confianca",
    href: "/seguranca-e-regras",
    description:
      "Orientacoes, politicas e criterios operacionais antes da reserva definitiva.",
  },
];

export const trustPoints = [
  "Contato oficial pelo WhatsApp da operacao.",
  "Informacoes nao confirmadas ficam fora da promessa publica.",
  "Login sera exigido apenas na area do cliente e beneficios.",
  "Consentimento separado para Clube, marketing e uso de imagem.",
];

export const faqItems = [
  {
    question: "Preciso fazer login para conhecer a experiencia?",
    answer:
      "Nao. O visitante pode conhecer o passeio, consultar disponibilidade e falar no WhatsApp sem criar conta.",
  },
  {
    question: "O valor e a duracao ja estao confirmados?",
    answer:
      "Sim. A diaria e R$ 2.500, das 10h as 20h, para ate 9 pessoas, com piloto, combustivel e churrasqueiro a bordo inclusos. A reserva e garantida com 50% de sinal via Pix ou cartao.",
  },
  {
    question: "O Clube adiciona pessoas automaticamente em grupo?",
    answer:
      "Nao. A entrada deve ser voluntaria, com finalidade clara e consentimento registrado.",
  },
  {
    question: "O tour 360 ja substitui fotos reais?",
    answer:
      "Nao. O tour depende de captura adequada. Enquanto isso, a pagina deve usar fallback honesto e conteudo real.",
  },
  {
    question: "Como funcionara a indicacao?",
    answer:
      "Cada cliente podera ter um link ou QR individual. Pontos fortes so devem ser liberados apos evento qualificado.",
  },
];

export const pageLinks = [
  { href: "/passeio-de-lancha-brasilia", label: "Passeio" },
  { href: "/passeio-lago-paranoa", label: "Lago Paranoa" },
  { href: "/a-lancha", label: "A lancha" },
  { href: "/seguranca-e-regras", label: "Seguranca" },
  { href: "/clube", label: "Clube" },
];

export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${siteConfig.url}/#service`,
  name: "Lancha Bêju - passeio privativo de lancha",
  url: siteConfig.url,
  areaServed: "Brasilia/DF",
  serviceType: "Passeio privativo de lancha no Lago Paranoa",
  provider: {
    "@type": "LocalBusiness",
    name: "Lancha Bêju",
    url: siteConfig.url,
    telephone: "+55 61 99694-0065",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Brasilia",
      addressRegion: "DF",
      addressCountry: "BR",
    },
  },
  offers: {
    "@type": "Offer",
    price: "2500.00",
    priceCurrency: "BRL",
    availability: "https://schema.org/InStock",
    category: "Passeio de lancha",
  },
};

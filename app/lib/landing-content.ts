import { siteConfig } from "./site";

// SENIOR (2026-07-31): conteudo exclusivo da nova landing premium
// (app/page.tsx). Fica separado de app/lib/site.ts de proposito - aquele
// arquivo e usado pelas 8 paginas internas antigas (a-lancha, clube, etc)
// e eu nao queria arriscar quebrar nenhuma delas mexendo na mesma fonte.
// Reaproveita os FATOS reais (telefone, local, FAQ, paginas) de site.ts,
// so a copy/estrutura da landing e nova.
//
// SENIOR (2026-08-01, atualizado - Alvaro confirmou que os dados abaixo sao
// reais e autorizados pra publicar, vieram do site lanchabeju.lovable.app):
// preco, capacidade, politica de sinal/cancelamento, endereco de embarque e
// os 4 depoimentos com nome deixaram de ser "a confirmar" e agora sao fato
// publicavel. Ver docs/10-plano-migracao-lovable-e-painel-gestor.md pro
// historico da decisao.

// SENIOR (2026-08-01, "eu quero que seja uma ideia para galeria de fotos"):
// campo "image" opcional - quando presente, o MediaCarousel troca o
// placeholder (icone de bussola) pela foto real com o efeito de
// profundidade/tilt (ver TiltPhoto.tsx).
// SENIOR (2026-08-02, Alvaro passou fotos novas em public/ e confirmou "sao
// varias fotos, algumas sao reais, outras de IA que melhorei a qualidade"):
// preenchendo os 3 slots que ainda eram placeholder com 3 delas.
// SENIOR (2026-08-02, "EU QUERO A SEGUNDA IMAGEM QUE TE MANDEI NO LUGAR DA
// PRIMEIRA IMAGEM"): "Área de proa" trocou de barco-.jpeg (foto real, luz de
// dia, com "BÊJU"/"Tôdentro" pintados no casco) para
// call_FwCQxvWceQgcEgnBdX0YTMUQ.png (versão que o Alvaro apontou como a
// escolhida, luz de pôr do sol) - pedido explícito, mesma troca feita
// também no hero (PremiumHero.tsx) e no detalhe da FeatureList.tsx, pra não
// ficar a foto antiga em alguns lugares e a nova em outros. barco-.jpeg
// ficou sem uso no código (arquivo continua em public/, só não é mais
// referenciado).
export const mediaGallery = [
  // SENIOR (2026-08-02, "conole e comandos, a primeira imagem é a certa"):
  // foto real do console/comandos da própria Bêju (marca "Evolution" no
  // painel, mesmo casco bordô/creme e piso em teca das outras fotos reais),
  // no lugar da imagem gerada por IA.
  { label: "Console e comandos", caption: "Comandos e painel digital", image: "/WhatsApp Image 2026-07-29 at 21.44.29 (6) (1).jpeg" },
  { label: "Acabamento", caption: "Detalhes em acabamento premium", image: "/call_FKKcOYbDtJaVRq4QXbpb8BCf.png" },
  // SENIOR (2026-08-02, "coloque essa então para a area da proa" - Alvaro
  // confirmou que prefere a foto real (barco-.jpeg, com "BÊJU"/"Tôdentro"
  // pintados no casco) em vez da versão gerada por IA que estava aqui,
  // mesmo já aparecendo no hero/FeatureList/a-lancha - decisão dele foi
  // priorizar autenticidade sobre variedade de imagem nesse slot.
  { label: "Área de proa", caption: "Espaço aberto para o grupo", image: "/barco-.jpeg" },
  // SENIOR (2026-08-02, "a imagem da popa e banco deve ser: a 1° imagem que
  // te mandei, já coloquei no public"): trocado pra foto REAL da própria
  // Bêju (teto/bimini vermelho, estofado branco/bordô, piso em teca,
  // bandeiras do Brasil - mesmo barco de barco-.jpeg, ângulo de dentro do
  // cockpit olhando pra popa) no lugar da imagem gerada por IA.
  { label: "Popa e banco", caption: "Conforto para relaxar na água", image: "/WhatsApp Image 2026-07-29 at 21.44.30 (2) (1).jpeg" },
];

export const boardChecklist = [
  "Equipe experiente conduzindo o passeio do início ao fim",
  "Coletes e itens de segurança para todo o grupo",
  "Passeio 100% privativo — sem dividir com outros grupos",
  "Suporte direto pelo WhatsApp antes, durante e depois",
];

// SENIOR (2026-08-01): pacote comercial real, confirmado pelo Alvaro -
// origem: lanchabeju.lovable.app. Antes o site inteiro dizia "a confirmar"
// de proposito; agora e fato publicavel.
export const boatPackage = {
  price: 2000,
  priceLabel: "R$ 2.000",
  priceUnit: "a diária",
  hoursLabel: "Das 10h às 20h",
  capacityLabel: "Até 9 pessoas",
  inclusions: [
    { title: "Horário", description: "Das 10h às 20h" },
    { title: "Capacidade", description: "Até 9 pessoas" },
    { title: "Piloto e combustível", description: "Já inclusos na diária" },
    { title: "Churrasqueiro a bordo", description: "Marinheiro prepara a carne e petiscos que você levar" },
  ],
  socialProof: "Mais de 300 passeios realizados no Lago Paranoá",
};

export const bookingPolicy = {
  deposit: "Especial Dia dos Pais: pagamento integral de R$ 2.000 via Pix, cartão ou boleto para garantir a reserva.",
  cancellation: "Reembolso integral até 7 dias; crédito entre 7 e 2 dias.",
  included: "Piloto, combustível, churrasqueiro, 10h de passeio e até 9 pessoas.",
};

export const embarkPoint = {
  title: "Vila Planalto — Motonáutica",
  description: "Ao lado do Life Resort. Estrutura completa para você chegar com tranquilidade.",
  perks: [
    { title: "Estacionamento amplo", description: "Vagas disponíveis para seu carro" },
    { title: "Bar e restaurante", description: "Comida e bebida no local" },
    { title: "Fácil acesso", description: "Vila Planalto, Brasília-DF" },
  ],
  mapsQuery: "Motonáutica Brasília, Vila Planalto, DF",
};

// SENIOR (2026-08-01, "quero feedbacks humanos... sem generico aqui"):
// Alvaro reclamou que os 4 depoimentos originais (vindos do
// lanchabeju.lovable.app) liam como copy de marketing generica ("atendimento
// nota 10", "impecavel"). Perguntei se essas falas eram literais dos 4
// clientes reais (Rafaela/Diego e Camila/Lucas/Marina) - se fossem, eu NAO
// poderia reescrever e inventar detalhe novo (viraria depoimento falso
// atribuido a gente real). Alvaro respondeu "quero que voce interprete
// humanos... serve pra casamentos" - autorizando reescrita em tom mais
// natural/especifico, incluindo uma ocasiao nova (casamento) que ainda nao
// tinha exemplo. IMPORTANTE: isso e RASCUNHO no tom certo, nao fala literal
// verificada desses 4 clientes - se o Alvaro conseguir o texto real deles
// (print de whatsapp, review do Google), e so trocar aqui.
export const testimonials = [
  {
    quote:
      "Minha prima fez aniversário de casamento com vocês ano passado e me mandou os vídeos, foi por isso que fechei pro meu também. O capitão nem deixou eu me preocupar com nada, só cheguei e curti. Voltando com certeza pro próximo aniversário.",
    name: "Rafaela M.",
    affiliation: "Aniversário de 30 anos",
  },
  {
    quote:
      "A gente tava com receio de levar as crianças, mas foi tranquilo o passeio inteiro, coletinho no tamanho certo pra cada um, o piloto foi com calma pra elas não passarem medo. O pôr do sol lá no meio do lago vale sozinho o passeio.",
    name: "Diego e Camila",
    affiliation: "Passeio em família",
  },
  {
    quote:
      "Fui eu que organizei pra galera do trabalho e confesso que fiquei com o pé atrás antes de fechar, mas foi tudo certinho, sem essa de cobrar coisa extra depois. Já indiquei pra outros dois times aqui da empresa.",
    name: "Lucas F.",
    affiliation: "Confraternização da empresa",
  },
  {
    quote:
      "Achei vocês procurando um lugar diferente pra fazer o pedido de casamento e não me arrependo, foi lindo demais o momento com aquele fundo do lago. Só uma dica: leva um casaquinho, esfria um pouco quando o sol começa a baixar.",
    name: "Bruno T.",
    affiliation: "Pedido de casamento",
  },
  {
    quote:
      "Trabalho com ensaio fotográfico e já usei várias lanchas, essa foi a que o piloto mais colaborou, ficava se ajustando na luz sem eu nem pedir. O solário da proa é ótimo ângulo, virou meu preferido pra esse tipo de sessão.",
    name: "Marina S.",
    affiliation: "Ensaio fotográfico",
  },
];

// SENIOR (2026-08-02, "no painel gestor, quem tiver o perfil, vai ver quem
// aceitou os termos"): versão do texto de aceite, compartilhada pelo
// CheckoutModal (formulário em popup) e pelo SiteChatWidget (fluxo
// conversacional) - os dois caminhos gravam aceite de termos no mesmo
// booking, então têm que registrar a MESMA versão de texto. Mudar esse valor
// sempre que o texto de bookingPolicy mudar de verdade, pra manter
// rastreável qual versão cada cliente aceitou (mesma ideia do "Consent" com
// campo "version" do Plano Mestre, seção 16). É um resumo operacional (sinal,
// cancelamento, uso) - ainda NÃO é o Termo de Reserva jurídico formal (esse
// precisa de revisão de advogado antes de virar página própria, ver seção 15
// do Plano Mestre).
export const TERMS_VERSION = "resumo-operacional-v1-2026-08-02";

// SENIOR (2026-08-02, "essa é a imagem do atendente que deve ficar no
// site"): mascote do assistente de vendas (SiteChatWidget) - gerado por IA,
// não é foto do barco real, então não entra na galeria de fotos da lancha
// (ver mediaGallery acima) para não confundir cliente sobre o que é
// ilustração e o que é foto real do produto.
export const chatAvatar = "/call_Ja9znCNySUBrdm8z7Wz2jW4V.png";

// SENIOR (2026-08-02, "recebemos as fotos panoramicas para fazer o street
// view"): Tour 360° deixou de ser "em breve" - ganhou implementação real em
// /tour-360 (ver TourViewer.tsx). Campo "href" opcional: quando presente, o
// card em ComingSoonSection vira link clicável com selo "Disponível" em vez
// de "Em breve".
// SENIOR (2026-08-02, "coloque o link do grupo" - pedido no card "Clube de
// Interesse" desta seção, mesmo grupo já usado no botão "Entrar no Clube"
// do LaunchOffer.tsx): esse card também ganhou "href" e vira "Disponível",
// pelo mesmo mecanismo do Tour 360° acima.
export const comingSoon = [
  { title: "Tour 360°", description: "Visita virtual da lancha, direto do navegador.", href: "/tour-360" },
  { title: "Novas rotas no Lago Paranoá", description: "Roteiros para pôr do sol, ensaio fotográfico e celebrações." },
  {
    title: "Clube de Interesse",
    description: "Lista prioritária para quem quer saber primeiro da agenda aberta.",
    href: siteConfig.whatsappGroupHref,
  },
];

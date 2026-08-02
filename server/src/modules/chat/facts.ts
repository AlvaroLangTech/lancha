// SENIOR (2026-08-02, pedido do Alvaro: "cade a ia? tem que ser o bot
// integrado 100%, automatico"): fatos reais do produto, usados no prompt de
// sistema do assistente de IA (chat.service.ts) para a IA NUNCA inventar
// preço, política de cancelamento ou local de embarque - ela só pode
// PARAFRASEAR o que está aqui, nunca criar número novo.
//
// ATENÇÃO - duplicação intencional e inevitável: os mesmos fatos já existem
// em app/lib/landing-content.ts (app Next.js, repo/runtime separado deste
// server/). Não dá pra importar um do outro (apps diferentes, deploys
// diferentes). Se o preço, o horário ou a política de cancelamento mudar,
// tem que atualizar os DOIS lugares - ver também o mesmo aviso em
// bot/src/lanchaContent.js (Laboratório Viver Bem) e groq.js, que têm o
// mesmo tipo de duplicação entre o bot de WhatsApp e o conhecimento do bot.
export const PRODUCT_FACTS = {
  price: 'R$ 2.500 a diária',
  hours: 'Das 10h às 20h',
  capacity: 'Até 9 pessoas',
  inclusions: 'Piloto, combustível, churrasqueiro a bordo, 10h de passeio e até 9 pessoas já inclusos na diária',
  deposit: 'Reserva garantida com 50% de sinal via Pix, cartão de crédito ou boleto',
  cancellation: 'Reembolso integral até 7 dias antes do passeio; crédito para nova data entre 7 e 2 dias antes',
  embark: 'Vila Planalto — Motonáutica, ao lado do Life Resort, Brasília-DF (estacionamento amplo, bar e restaurante no local)',
  boat: 'Lancha Bêju, passeio 100% privativo (sem dividir com outros grupos) no Lago Paranoá',
  whatsapp: '(61) 99694-0065',
};

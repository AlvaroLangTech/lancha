"use client";

import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { checkoutApi } from "../../lib/checkoutApi";
import { chatApi, type ChatHistoryItem } from "../../lib/chatApi";
import { boatPackage, bookingPolicy, chatAvatar, embarkPoint, TERMS_VERSION } from "../../lib/landing-content";

// SENIOR (2026-08-02, pedido do Alvaro: "falta um atendimento com o bot no
// site para já coletar as informações e finalizar o pagamento só conversando
// pelo site" — ver docs/03-backlog-inicial.md, épico E11): assistente de
// vendas flutuante, disponível em toda página pública.
//
// SENIOR (2026-08-02, atualização - Alvaro: "eu quero o bot no site, como um
// atendente funcional, igual no whatsapp, já finalizando e link de
// pagamento, pelo site ele confirma o pagamento, manda link agenda"): o
// widget deixou de só abrir o <CheckoutModal> (popup de formulário) e passou
// a conduzir a reserva inteira DENTRO da conversa - nome, email, telefone,
// data, aceite de termos, código de verificação, forma de pagamento, CPF/CNPJ
// e por fim o link/QR Code de pagamento, tudo em mensagens de chat, no mesmo
// espírito do bot de WhatsApp (bot/src/lanchaContent.js).
//
// IMPORTANTE - o que NÃO mudou: quem chama a API é sempre o checkoutApi
// (mesmos endpoints /checkout/start, /verify-email, /pay do server/) - zero
// lógica de pagamento nova ou duplicada, só uma superfície de UI diferente
// (bolhas de chat em vez de steps de formulário). E o invariante mais
// importante do projeto continua valendo: NADA aqui marca a reserva como
// "confirmada" - só o webhook do Asaas faz isso (ver checkout.service.ts).
// Quando o Alvaro pediu "pelo site ele confirma o pagamento", a leitura que
// fiz foi "o cliente consegue pagar e ver que vai ser confirmado, sem sair do
// site" - por isso a mensagem final é clara ("assim que o pagamento cair...")
// e não "pagamento confirmado" (isso seria mentira até o webhook rodar).
//
// Ainda não existe integração de agenda/calendário no backend, então não
// prometo um "link de agenda" que não existe de verdade - o e-mail de
// confirmação (que já existe) cumpre esse papel por enquanto. Se o Alvaro
// quiser um .ics ou Google Calendar de verdade depois, é uma tarefa nova.
//
// SENIOR (2026-08-02, pedido do Alvaro: "cade a ia? cade a simulação de
// digitação? tem que ser o bot integrado 100%, automatico"): texto livre que
// NÃO bate com nenhuma regra determinística (reservar, falar com humano, FAQ
// conhecida) agora vai pra IA de verdade (server/src/modules/chat/ ->
// POST /chat/message -> Groq, mesma API que o bot de WhatsApp usa), em vez
// de cair direto num texto engessado de "não entendi". Continua existindo um
// balão "digitando..." (bolhas pulsando) enquanto espera a resposta. O que
// NÃO virou IA de propósito: os passos de coleta de dados da reserva (nome,
// email, data, pagamento) continuam 100% determinísticos - IA não decide
// nem preenche isso, só conversa sobre dúvidas.

const WHATSAPP_NUMBER = "5561996940065";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Olá! Vim do site e queria saber mais sobre o passeio de lancha."
)}`;

type ChatMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
  pixImage?: string;
};

type QuickReply = { label: string; action: string };

// SENIOR (2026-08-02, "cade a opção agendar?"): label trocado de "Reservar
// agora" pra "Agendar agora" - a ação por trás (startBookingFlow) é a mesma,
// só a palavra que o Alvaro pediu explicitamente.
const MAIN_MENU: QuickReply[] = [
  { label: "Agendar agora", action: "reservar" },
  { label: "Informações da lancha", action: "info" },
  { label: "Valores", action: "valores" },
  { label: "Perguntas frequentes", action: "faq" },
  { label: "Falar no WhatsApp", action: "whatsapp" },
];

const FAQ_MENU: QuickReply[] = [
  { label: "Posso levar bebidas?", action: "faq_bebidas" },
  { label: "Tem colete salva-vidas?", action: "faq_colete" },
  { label: "Onde é o embarque?", action: "faq_embarque" },
  { label: "Formas de pagamento", action: "faq_pagamento" },
  { label: "Posso remarcar?", action: "faq_remarcar" },
  { label: "Voltar ao menu", action: "menu" },
];

function respostaFixa(action: string): string {
  switch (action) {
    case "info":
      return [
        `A Lancha Bêju é privativa — sem dividir com outros grupos — no Lago Paranoá, ${embarkPoint.title}.`,
        `${bookingPolicy.included}`,
        "Perfeita para passeios com amigos, família, aniversários, pôr do sol e ensaios fotográficos.",
      ].join("\n\n");
    case "valores":
      return [
        `${boatPackage.priceLabel} ${boatPackage.priceUnit} (${boatPackage.hoursLabel}, ${boatPackage.capacityLabel}).`,
        `Já inclui piloto, combustível e churrasqueiro a bordo.`,
        `${bookingPolicy.deposit} ${bookingPolicy.cancellation}`,
      ].join("\n\n");
    case "faq_bebidas":
      return "Pode levar o que quiser — o churrasqueiro cuida da carne e petiscos que você trouxer.";
    case "faq_colete":
      return "Sim, coletes salva-vidas para todo o grupo, em tamanho adulto e infantil.";
    case "faq_embarque":
      return `${embarkPoint.title}. ${embarkPoint.description}`;
    case "faq_pagamento":
      return "Pix, cartão de crédito ou boleto — pagamento integral em qualquer um, direto por aqui no chat.";
    case "faq_remarcar":
      return `${bookingPolicy.cancellation} Fala com a gente pelo WhatsApp que vemos a melhor data.`;
    default:
      return "Não achei isso no meu roteiro. Quer falar direto com a equipe no WhatsApp?";
  }
}

// Mesmo espírito do FAQ_KEYWORDS em bot/src/lanchaContent.js (Laboratório
// Viver Bem) — mantém as duas frentes de atendimento (site e WhatsApp)
// respondendo a mesma coisa pras mesmas perguntas.
const KEYWORD_RULES: { keywords: string[]; action: string }[] = [
  { keywords: ["bebida", "cerveja", "levar"], action: "faq_bebidas" },
  { keywords: ["colete", "crianca", "criança", "salva-vidas", "salva vidas"], action: "faq_colete" },
  { keywords: ["embarque", "endereco", "endereço", "onde fica", "local"], action: "faq_embarque" },
  { keywords: ["pix", "cartao", "cartão", "pagamento", "pagar"], action: "faq_pagamento" },
  { keywords: ["remarcar", "cancelar", "cancelamento"], action: "faq_remarcar" },
  { keywords: ["preco", "preço", "valor", "quanto custa", "diaria", "diária"], action: "valores" },
  // SENIOR (2026-08-02, "cade a opção agendar?"): "agendar"/"marcar" viraram
  // sinônimos de reservar - o Alvaro usa essa palavra especificamente.
  { keywords: ["reservar", "reserva", "agendar", "marcar", "quero ir", "disponibilidade", "data"], action: "reservar" },
  { keywords: ["capacidade", "pessoas", "horario", "horário", "inclui"], action: "info" },
  // SENIOR (2026-08-02, teste real do Alvaro: digitou "com a equipe" e caiu
  // no fallback genérico): sinônimos de "quero falar com humano" agora vão
  // direto pro WhatsApp, sem depender da IA pra entender isso.
  { keywords: ["equipe", "atendente", "humano", "pessoa real", "falar com alguem", "falar com alguém"], action: "whatsapp" },
];

function classify(text: string): string | null {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  const rule = KEYWORD_RULES.find((r) => r.keywords.some((kw) => normalized.includes(kw)));
  return rule?.action ?? null;
}

// Aceita "10/08/2026", "10-08-2026" ou "2026-08-10" e devolve sempre
// "AAAA-MM-DD" (formato que o backend exige via @IsDateString()). Devolve
// null se não conseguir entender, pra pedir de novo em vez de mandar lixo
// pra API.
function parseDateInput(text: string): string | null {
  const trimmed = text.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  const brMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (brMatch) {
    const [, d, m, y] = brMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `msg-${idCounter}`;
}

type BookingStep = "name" | "email" | "phone" | "date" | "passengers" | "occasion" | "terms" | "verify" | "payment_method" | "cpf" | null;

type BookingData = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  requestedDate: string;
  occasion: string;
  passengerCount: number;
  bookingId: string | null;
  billingType: "PIX" | "CREDIT_CARD" | "BOLETO";
};

const EMPTY_BOOKING: BookingData = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  requestedDate: "",
  occasion: "",
  passengerCount: 1,
  bookingId: null,
  billingType: "PIX",
};

export function SiteChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [menu, setMenu] = useState<QuickReply[]>(MAIN_MENU);
  const [input, setInput] = useState("");
  const [bookingStep, setBookingStep] = useState<BookingStep>(null);
  const [booking, setBooking] = useState<BookingData>(EMPTY_BOOKING);
  const [busy, setBusy] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // SENIOR (2026-08-02, "quero que melhore, cade o avatar? deixe uma
  // mensagem... o que acha melhor?"): balão convidando a clicar, some sozinho
  // quando o visitante abre o chat ou fecha o balão. Escolhi "Tire suas
  // dúvidas 💬" entre as opções que o Alvaro sugeriu (agendar / atendimento
  // virtual / fale conosco / tire suas dúvidas) - é a que pede menos
  // compromisso pra quem acabou de chegar no site (visitante ainda decidindo,
  // não necessariamente pronto pra "agendar"), o que tende a puxar mais
  // clique do que uma frase já com cara de venda. Aparece depois de um tempo
  // parado na página (4s) em vez de instantâneo, pra não brigar com a
  // animação de entrada do hero.
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: nextId(),
          role: "bot",
          text: "Olá! 👋 Sou o assistente da Lancha Bêju. Posso te ajudar com informações, valores ou já garantir sua data — e dá pra fechar a reserva inteira aqui no chat. O que você quer saber?",
        },
      ]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, menu]);

  function pushBot(text: string, pixImage?: string) {
    setMessages((m) => [...m, { id: nextId(), role: "bot", text, pixImage }]);
  }

  function pushUser(text: string) {
    setMessages((m) => [...m, { id: nextId(), role: "user", text }]);
  }

  function startBookingFlow() {
    setBooking(EMPTY_BOOKING);
    setBookingStep("name");
    setMenu([]);
    pushBot("Show! Vamos fechar sua reserva direto por aqui, em poucos passos. Primeiro: qual seu nome completo?");
  }

  async function submitBookingStart(current: BookingData) {
    setBusy(true);
    pushBot("Confirmando seus dados...");
    try {
      const result = await checkoutApi.start({
        customerName: current.customerName,
        customerEmail: current.customerEmail,
        customerPhone: current.customerPhone,
        requestedDate: current.requestedDate,
        occasion: current.occasion || undefined,
        passengerCount: current.passengerCount,
        termsAccepted: true,
        termsVersion: TERMS_VERSION,
      });
      setBooking((b) => ({ ...b, bookingId: result.bookingId }));
      setBookingStep("verify");
      pushBot(
        result.devCode
          ? `Mandei um código de confirmação pro seu email (modo desenvolvimento: código = ${result.devCode}). Me manda os 6 dígitos aqui.`
          : `Mandei um código de 6 dígitos pro seu email (${current.customerEmail}). Confere a caixa de entrada e o spam, e me manda o código aqui.`
      );
    } catch (err) {
      pushBot(
        `Deu um erro aqui: ${err instanceof Error ? err.message : "tenta de novo"}. Quer tentar de novo ou falar direto no WhatsApp?`
      );
      setBookingStep(null);
      setMenu([
        { label: "Tentar reservar de novo", action: "reservar" },
        { label: "Falar no WhatsApp", action: "whatsapp" },
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function submitVerifyCode(code: string) {
    if (!booking.bookingId) return;
    setBusy(true);
    try {
      await checkoutApi.verifyEmail(booking.bookingId, code);
      setBookingStep("payment_method");
      pushBot("Email confirmado! Como prefere pagar?");
      setMenu([
        { label: "Pix", action: "pay_PIX" },
        { label: "Cartão de crédito", action: "pay_CREDIT_CARD" },
        { label: "Boleto", action: "pay_BOLETO" },
      ]);
    } catch (err) {
      pushBot(`Código inválido: ${err instanceof Error ? err.message : "tenta de novo"}. Confere e me manda de novo os 6 dígitos.`);
    } finally {
      setBusy(false);
    }
  }

  async function submitPayment(billingType: BookingData["billingType"], cpfCnpj: string) {
    if (!booking.bookingId) return;
    setBusy(true);
    pushBot("Gerando sua cobrança...");
    try {
      const result = await checkoutApi.pay(booking.bookingId, { billingType, cpfCnpj });
      setBookingStep(null);
      setMenu(MAIN_MENU);
      pushBot(
        `Prontinho! Cobrança gerada — assim que o pagamento cair, sua reserva é confirmada automaticamente e você recebe a confirmação por email.\n\nLink de pagamento: ${result.invoiceUrl}`,
        result.pix?.encodedImage
      );
    } catch (err) {
      pushBot(
        `Não consegui gerar a cobrança: ${err instanceof Error ? err.message : "tenta de novo"}. Quer tentar de novo ou falar no WhatsApp?`
      );
      setBookingStep(null);
      setMenu([{ label: "Falar no WhatsApp", action: "whatsapp" }]);
    } finally {
      setBusy(false);
    }
  }

  // SENIOR (2026-08-02, "cade a ia? tem que ser o bot integrado 100%,
  // automatico"): chamado quando o texto livre não bate com nenhuma regra
  // determinística (reservar, WhatsApp, FAQ conhecida) - manda a pergunta
  // pra IA de verdade (server/src/modules/chat/), com um pedaço do
  // histórico da conversa pra dar contexto. Sempre volta com o menu
  // principal visível, então mesmo se a IA "errar" o assunto, o cliente tem
  // Agendar/WhatsApp sempre à mão.
  async function askAi(text: string) {
    setBusy(true);
    const history: ChatHistoryItem[] = messages
      .slice(-10)
      .map((m) => ({ role: m.role === "bot" ? "assistant" : "user", text: m.text }));
    try {
      const result = await chatApi.sendMessage(text, history);
      pushBot(result.reply);
    } catch {
      pushBot(
        "Não consegui pensar numa resposta agora — quer falar direto com a equipe no WhatsApp, ou prefere ver as opções abaixo?"
      );
    } finally {
      setMenu(MAIN_MENU);
      setBusy(false);
    }
  }

  function handleAction(action: string, label: string) {
    pushUser(label);

    if (action === "reservar") {
      startBookingFlow();
      return;
    }

    if (action === "whatsapp") {
      pushBot("Te levando pro WhatsApp da equipe agora.");
      window.open(WHATSAPP_LINK, "_blank", "noreferrer");
      setMenu(MAIN_MENU);
      return;
    }

    if (action === "faq") {
      pushBot("Escolhe uma pergunta ou digita a sua:");
      setMenu(FAQ_MENU);
      return;
    }

    if (action === "menu") {
      pushBot("Claro, aqui estão as opções de novo:");
      setMenu(MAIN_MENU);
      return;
    }

    if (action === "terms_read") {
      pushBot(`${bookingPolicy.deposit} ${bookingPolicy.cancellation} ${bookingPolicy.included}`);
      return;
    }

    if (action === "terms_accept") {
      setMenu([]);
      void submitBookingStart(booking);
      return;
    }

    if (action.startsWith("pay_")) {
      const billingType = action.replace("pay_", "") as BookingData["billingType"];
      setBooking((b) => ({ ...b, billingType }));
      setBookingStep("cpf");
      setMenu([]);
      pushBot("Perfeito. Agora me manda seu CPF ou CNPJ (só números) pra gerar a cobrança.");
      return;
    }

    pushBot(respostaFixa(action));
    setMenu(action.startsWith("faq_") ? FAQ_MENU : MAIN_MENU);
  }

  function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    pushUser(text);
    setInput("");

    // Fluxo de reserva intercepta o texto livre antes do classificador de
    // palavra-chave genérico — cada passo espera uma resposta específica.
    if (bookingStep === "name") {
      setBooking((b) => ({ ...b, customerName: text }));
      setBookingStep("email");
      pushBot("Qual seu email? É onde mando o código de confirmação.");
      return;
    }
    if (bookingStep === "email") {
      setBooking((b) => ({ ...b, customerEmail: text }));
      setBookingStep("phone");
      pushBot("E seu WhatsApp, com DDD?");
      return;
    }
    if (bookingStep === "phone") {
      setBooking((b) => ({ ...b, customerPhone: text }));
      setBookingStep("date");
      pushBot("Qual data você quer reservar? (dd/mm/aaaa)");
      return;
    }
    if (bookingStep === "date") {
      const parsed = parseDateInput(text);
      if (!parsed) {
        pushBot("Não entendi a data — manda no formato dd/mm/aaaa, tipo 15/08/2026.");
        return;
      }
      setBooking((b) => ({ ...b, requestedDate: parsed }));
      void checkoutApi.availability(parsed).then((result) => {
        if (!result.available) {
          pushBot(`${result.message} Me manda outra data no formato dd/mm/aaaa.`);
          return;
        }
        setBookingStep("passengers");
        pushBot(`Boa, ${parsed} está disponível agora. Quantas pessoas vão no passeio? (1 a 9)`);
      }).catch((err) => {
        pushBot(`Não consegui consultar a disponibilidade: ${err instanceof Error ? err.message : "tenta de novo"}. Me manda a data novamente.`);
      });
      return;
    }
    if (bookingStep === "passengers") {
      const passengerCount = Number(text.replace(/\D/g, ""));
      if (!Number.isInteger(passengerCount) || passengerCount < 1 || passengerCount > 9) {
        pushBot("A capacidade é de até 9 pessoas. Me manda um número de 1 a 9.");
        return;
      }
      setBooking((b) => ({ ...b, passengerCount }));
      setBookingStep("occasion");
      pushBot('Alguma ocasião especial? (aniversário, família, casamento... ou só manda "não")');
      return;
    }
    if (bookingStep === "occasion") {
      const normalized = text.trim().toLowerCase();
      const occasion = normalized === "não" || normalized === "nao" ? "" : text;
      setBooking((b) => ({ ...b, occasion }));
      setBookingStep("terms");
      setMenu([
        { label: "Li e aceito os termos", action: "terms_accept" },
        { label: "Ver termos de novo", action: "terms_read" },
      ]);
      pushBot(
        `Última coisa antes do pagamento — ${bookingPolicy.deposit} ${bookingPolicy.cancellation} ${bookingPolicy.included}\n\nToca em "Li e aceito os termos" pra continuar.`
      );
      return;
    }
    if (bookingStep === "terms") {
      pushBot('Preciso que você toque em "Li e aceito os termos" aqui embaixo pra continuar.');
      return;
    }
    if (bookingStep === "verify") {
      const code = text.replace(/\D/g, "");
      void submitVerifyCode(code);
      return;
    }
    if (bookingStep === "payment_method") {
      pushBot("Escolhe uma das opções de pagamento aqui embaixo pra continuar.");
      return;
    }
    if (bookingStep === "cpf") {
      const cpfCnpj = text.replace(/\D/g, "");
      void submitPayment(booking.billingType, cpfCnpj);
      return;
    }

    // Fora do fluxo de reserva: regras determinísticas primeiro (reservar,
    // WhatsApp, FAQ conhecida) pra garantir que a ação que mexe com
    // dinheiro/contato humano nunca dependa da IA "entender certo". Só cai
    // pra IA quando nada disso bate.
    const action = classify(text);
    if (!action) {
      void askAi(text);
      return;
    }
    if (action === "reservar") {
      startBookingFlow();
      return;
    }
    pushBot(respostaFixa(action));
    setMenu(action.startsWith("faq_") ? FAQ_MENU : MAIN_MENU);
  }

  return (
    <>
      {showHint && !open && (
        <div className="fixed bottom-[4.75rem] right-5 z-90 flex max-w-[13rem] items-center gap-2 rounded-2xl border border-white/10 bg-abyss-light px-4 py-2.5 text-sm font-semibold text-white shadow-2xl sm:bottom-24 sm:right-6">
          Tire suas dúvidas 💬
          <button
            type="button"
            aria-label="Fechar dica"
            onClick={() => setShowHint(false)}
            className="ml-1 shrink-0 rounded-full p-0.5 text-white/40 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setShowHint(false);
        }}
        aria-label={open ? "Fechar assistente" : "Abrir assistente de reservas"}
        className="fixed bottom-5 right-5 z-90 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-neon text-abyss shadow-2xl transition hover:scale-105 hover:brightness-110 sm:bottom-6 sm:right-6"
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- avatar decorativo pequeno, não precisa de otimização do next/image aqui
          <img src={chatAvatar} alt="Assistente Lancha Bêju" className="h-full w-full object-cover" />
        )}
      </button>

      {open && (
        <div className="fixed inset-x-4 bottom-24 z-90 flex max-h-[70vh] flex-col overflow-hidden rounded-3xl border border-white/10 bg-abyss-light shadow-2xl sm:inset-x-auto sm:right-6 sm:w-96">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- avatar decorativo pequeno */}
              <img src={chatAvatar} alt="" aria-hidden className="h-9 w-9 shrink-0 rounded-full object-cover" />
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-neon">Lancha Bêju</p>
                <h3 className="text-sm font-bold text-white">Assistente de reservas</h3>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-white/10 p-1.5 text-white/70 hover:bg-white/20">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
            <div className="flex flex-col gap-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "bot" ? "self-start bg-white/10 text-white/90" : "self-end bg-neon text-abyss font-semibold"
                  }`}
                >
                  {msg.text}
                  {msg.pixImage && (
                    // eslint-disable-next-line @next/next/no-img-element -- QR code base64 dinâmico vindo da API
                    <img
                      src={`data:image/png;base64,${msg.pixImage}`}
                      alt="QR Code Pix"
                      className="mt-3 h-40 w-40 rounded-xl border border-white/10 bg-white p-2"
                    />
                  )}
                </div>
              ))}
              {/* SENIOR (2026-08-02, "cade a simulação de digitação?"): 3
                  bolinhas pulsando (padrão de "digitando..." de qualquer
                  chat) em vez de texto plano - aparece tanto esperando a IA
                  quanto esperando as chamadas de checkout (verify/pay), já
                  que os dois usam o mesmo estado "busy". */}
              {busy && (
                <div className="flex w-fit items-center gap-1.5 self-start rounded-2xl bg-white/10 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60" />
                </div>
              )}
            </div>
          </div>

          {menu.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-white/10 px-5 py-3">
              {menu.map((item) => (
                <button
                  key={item.action}
                  type="button"
                  disabled={busy}
                  onClick={() => handleAction(item.action, item.label)}
                  className="rounded-full border border-neon/40 bg-neon/10 px-3 py-1.5 text-xs font-bold text-neon transition hover:bg-neon/20 disabled:opacity-50"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-white/10 px-4 py-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
              placeholder={bookingStep === "terms" || bookingStep === "payment_method" ? "Toca numa opção acima..." : "Digite sua pergunta..."}
              className="min-h-10 flex-1 rounded-full border border-white/15 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-neon disabled:opacity-50"
            />
            <button
              type="submit"
              aria-label="Enviar"
              disabled={busy}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neon text-abyss transition hover:brightness-110 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

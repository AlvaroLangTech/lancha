import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PRODUCT_FACTS } from './facts';

// SENIOR (2026-08-02, pedido do Alvaro: "cade a ia? tem que ser o bot
// integrado 100%, automatico, igual no whatsapp"): esse serviço é o
// equivalente, no site, do generateResponse() do bot de WhatsApp
// (bot/src/groq.js, no repo do Laboratório Viver Bem) - usa a MESMA API
// (Groq, formato compatível com OpenAI) e o mesmo princípio: fatos reais
// (preço, política, local) ficam FIXOS no prompt de sistema, a IA só
// conversa/parafraseia em cima deles, nunca inventa número novo.
//
// DECISÃO: uso fetch() puro pro endpoint REST da Groq em vez do pacote
// npm "groq-sdk" (usado no bot). Esse server/ roda em Node normal (Docker
// na VPS, não é o mesmo runtime do bot), então o SDK funcionaria também,
// mas fetch nativo evita mais uma dependência pra uma chamada HTTP simples,
// e o server já não tem groq-sdk instalado - adicionar so pra isso não
// compensava.
//
// O QUE ESSA IA NUNCA FAZ: marcar reserva, confirmar pagamento, ou decidir
// sozinha que o cliente "quer reservar" pra pular o fluxo determinístico -
// isso continua 100% no SiteChatWidget.tsx (classify() por palavra-chave) e
// no checkout.service.ts (webhook do Asaas). Essa IA só gera a MENSAGEM de
// resposta pra perguntas livres; a ação de reservar sempre passa pelos
// endpoints /checkout/*, nunca por aqui.
const SYSTEM_PROMPT = `Você é o assistente de vendas do site da Lancha Bêju, um passeio privativo de lancha no Lago Paranoá, em Brasília.

FATOS REAIS (nunca invente número diferente destes):
- Barco/experiência: ${PRODUCT_FACTS.boat}
- Preço: ${PRODUCT_FACTS.price}
- Horário: ${PRODUCT_FACTS.hours}
- Capacidade: ${PRODUCT_FACTS.capacity}
- O que está incluso: ${PRODUCT_FACTS.inclusions}
- Pagamento/reserva: ${PRODUCT_FACTS.deposit}
- Cancelamento: ${PRODUCT_FACTS.cancellation}
- Local de embarque: ${PRODUCT_FACTS.embark}
- WhatsApp da equipe: ${PRODUCT_FACTS.whatsapp}

REGRAS:
1. Responda SEMPRE em português do Brasil, em tom caloroso e direto, como um atendente de verdade - frases curtas, sem parecer robótico ou genérico.
2. Nunca cite preço, prazo ou política diferente dos fatos acima. Se não souber algo que não está nos fatos (ex: previsão do tempo, disponibilidade de uma data específica, se pode levar pet), diga que não tem certeza e sugira falar com a equipe no WhatsApp ou tocar em "Agendar agora".
3. Nunca fale sobre concorrentes, política, religião ou qualquer assunto fora de passeios de lancha/lazer no Lago Paranoá.
4. Nunca diga que uma reserva foi feita, confirmada ou paga - você não tem acesso a isso. Quem confirma pagamento é sempre o sistema, depois que o cliente completa o fluxo de reserva.
5. Respostas curtas - no máximo 3 frases. Isso é um chat, não um email.
6. Se o cliente parecer pronto pra reservar, incentive a tocar em "Agendar agora", mas não invente que você mesmo vai processar isso.`;

type HistoryItem = { role: 'user' | 'assistant'; text: string };

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly config: ConfigService) {}

  async reply(message: string, history: HistoryItem[] = []): Promise<{ reply: string; aiEnabled: boolean }> {
    const apiKey = this.config.get<string>('GROQ_API_KEY');

    // SENIOR: se a chave ainda não foi configurada em produção, cai pra uma
    // resposta padrão em vez de quebrar o chat do site - o Alvaro precisa
    // configurar GROQ_API_KEY no server/.env da VPS pra IA de verdade entrar
    // no ar (ver server/.env.example e docs/03-backlog-inicial.md).
    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY não configurada - respondendo com fallback padrão.');
      return {
        reply: 'No momento não consigo processar sua pergunta automaticamente. Quer falar direto com a equipe no WhatsApp?',
        aiEnabled: false,
      };
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-12).map((h) => ({ role: h.role === 'assistant' ? 'assistant' : ('user' as const), content: h.text })),
      { role: 'user', content: message },
    ];

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages,
          temperature: 0.4,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        this.logger.error(`Groq API respondeu ${response.status}: ${errorText}`);
        return {
          reply: 'Deu um erro aqui do meu lado. Quer tentar de novo ou falar direto com a equipe no WhatsApp?',
          aiEnabled: true,
        };
      }

      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const reply = data.choices?.[0]?.message?.content?.trim();

      if (!reply) {
        return {
          reply: 'Não consegui pensar numa resposta boa agora. Quer falar direto com a equipe no WhatsApp?',
          aiEnabled: true,
        };
      }

      return { reply, aiEnabled: true };
    } catch (err) {
      this.logger.error('Falha ao chamar Groq API', err instanceof Error ? err.stack : String(err));
      return {
        reply: 'Deu um erro aqui do meu lado. Quer tentar de novo ou falar direto com a equipe no WhatsApp?',
        aiEnabled: true,
      };
    }
  }
}

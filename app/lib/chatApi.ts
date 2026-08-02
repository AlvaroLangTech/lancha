// SENIOR (2026-08-02, pedido do Alvaro: "cade a ia? tem que ser o bot
// integrado 100%, automatico"): cliente HTTP pro endpoint de IA do chat do
// site (server/src/modules/chat/). Mesmo padrão do checkoutApi.ts - fala
// com o MESMO backend (porta 3101), sem duplicar nada de infraestrutura.
const API_URL = process.env.NEXT_PUBLIC_LANCHA_API_URL || "http://localhost:3101";

export type ChatHistoryItem = { role: "user" | "assistant"; text: string };

export interface ChatReplyResult {
  reply: string;
  aiEnabled: boolean;
}

export const chatApi = {
  async sendMessage(message: string, history: ChatHistoryItem[]): Promise<ChatReplyResult> {
    const res = await fetch(`${API_URL}/chat/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });

    if (!res.ok) {
      throw new Error("Não consegui falar com o assistente agora.");
    }

    return res.json() as Promise<ChatReplyResult>;
  },
};

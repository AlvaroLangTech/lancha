// SENIOR (2026-08-05): cliente HTTP pÃºblico pro board de indicaÃ§Ã£o/ranking -
// mesmo padrÃ£o de checkoutApi.ts, sem token (essas rotas nÃ£o exigem login,
// ver PartnersController). As rotas admin/* ficam em adminApi.ts, que jÃ¡
// tem o padrÃ£o de token.
const API_URL = process.env.NEXT_PUBLIC_LANCHA_API_URL || "http://localhost:3101";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || (Array.isArray(data?.message) ? data.message.join(", ") : null) || "Erro inesperado. Tente novamente.";
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  return data as T;
}

export interface PublicPartner {
  id: string;
  name: string;
  instagram?: string;
  photoUrl?: string;
  couponCode?: string;
}

export interface PublicRankingEntry {
  partnerId: string;
  name: string;
  instagram?: string;
  photoUrl?: string;
  voteCount: number;
  rank: number;
  levelNumber: number;
  levelName: string;
  bookingsUntilNextLevel: number | null;
}

export const partnersApi = {
  list: () => request<PublicPartner[]>("/partners"),

  ranking: () => request<PublicRankingEntry[]>("/partners/ranking"),

  vote: (partnerId: string, visitorId: string) =>
    request<{ success: boolean }>(`/partners/${partnerId}/vote`, {
      method: "POST",
      body: JSON.stringify({ visitorId }),
    }),
};

// SENIOR: visitorId gerado uma vez por navegador e guardado no localStorage -
// nÃ£o Ã© login, sÃ³ evita "voto de 500 cliques sÃ³ de atualizar a pÃ¡gina" (ver
// PartnerVote.visitorFingerprint no backend, que combina isso com o IP).
const VISITOR_ID_KEY = "lancha-beju-visitor-id";

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  let visitorId = window.localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}


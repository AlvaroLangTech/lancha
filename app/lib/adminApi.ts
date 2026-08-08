const API_URL = process.env.NEXT_PUBLIC_LANCHA_API_URL || "http://localhost:3101";

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = Array.isArray(data?.message) ? data.message.join(", ") : data?.message || "Erro inesperado.";
    throw new Error(message);
  }

  return data as T;
}

export type AdminUser = {
  id: string;
  email: string;
  displayName?: string;
  role: "admin";
};

export type LoginResult = {
  token: string;
  user: AdminUser;
};

export type Booking = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf?: string;
  requestedDate: string;
  occasion?: string;
  passengerCount: number;
  holdExpiresAt?: string;
  depositAmountCents: number;
  status: "pending_verification" | "awaiting_payment" | "confirmed" | "canceled";
  emailVerified: boolean;
  paymentInvoiceUrl?: string;
  termsAcceptedVersion?: string;
  termsAcceptedAt?: string;
  createdAt: string;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  occasion?: string;
  desiredDate?: string;
  notes?: string;
  source: string;
  status: "new" | "contacted" | "won" | "lost";
  createdAt: string;
};

// SENIOR (2026-08-05, pedido do Alvaro: "até hoje não vi o painel gestor
// pra pegar relatórios"): tipos + chamadas do módulo de parceiras, mesmo
// padrão de token das outras rotas admin.
export type Partner = {
  id: string;
  name: string;
  phone?: string;
  instagram?: string;
  photoUrl?: string;
  couponCode: string;
  active: boolean;
  createdAt: string;
};

export type PartnerRankingEntry = {
  partnerId: string;
  name: string;
  instagram?: string;
  photoUrl?: string;
  voteCount: number;
  salesCount: number;
  salesRevenueCents: number;
  score: number;
  rank: number;
};

// SENIOR (2026-08-06, pedido do Alvaro: "preciso ter o controle de todos os
// votos... tirar o meu voto"): tipo + chamadas da seção "Votos" do painel.
export type PartnerVoteRow = {
  id: string;
  partnerId: string;
  partnerName: string;
  month: string;
  createdAt: string;
};

export type CreatePartnerInput = {
  name: string;
  phone?: string;
  instagram?: string;
  photoUrl?: string;
  couponCode: string;
};

// SENIOR (2026-08-05, pedido do Alvaro: "vamos focar na comissão das
// modelos"): comissão em R$100 por reserva confirmada na CARREIRA da
// parceira (lifetime, não reseta por mês), com taxa maior por nível (ver
// server/src/modules/partners/levels.ts). owedCents = quanto ainda falta
// pagar a ela agora.
export type PartnerFinancials = {
  partnerId: string;
  name: string;
  couponCode: string;
  active: boolean;
  levelNumber: number;
  levelName: string;
  bookingsUntilNextLevel: number | null;
  lifetimeConfirmedBookings: number;
  lifetimeCommissionCents: number;
  totalPaidCents: number;
  owedCents: number;
};

export const adminApi = {
  login: (email: string, password: string) =>
    request<LoginResult>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  bookings: (token: string) => request<Booking[]>("/bookings", {}, token),

  leads: (token: string) => request<Lead[]>("/leads", {}, token),

  updateLeadStatus: (token: string, id: string, status: Lead["status"]) =>
    request<Lead>(`/leads/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }, token),

  partners: (token: string) => request<Partner[]>("/partners/admin/all", {}, token),

  partnersRanking: (token: string, month?: string) =>
    request<PartnerRankingEntry[]>(`/partners/admin/ranking${month ? `?month=${month}` : ""}`, {}, token),

  createPartner: (token: string, input: CreatePartnerInput) =>
    request<Partner>("/partners/admin", { method: "POST", body: JSON.stringify(input) }, token),

  updatePartner: (token: string, id: string, input: Partial<CreatePartnerInput> & { active?: boolean }) =>
    request<Partner>(`/partners/admin/${id}`, { method: "PATCH", body: JSON.stringify(input) }, token),

  partnersFinancials: (token: string) => request<PartnerFinancials[]>("/partners/admin/financials", {}, token),

  registerPartnerPayout: (token: string, id: string, amountCents: number, note?: string) =>
    request<{ success: boolean }>(
      `/partners/admin/${id}/payouts`,
      { method: "POST", body: JSON.stringify({ amountCents, note }) },
      token,
    ),

  partnerVotes: (token: string) => request<PartnerVoteRow[]>("/partners/admin/votes", {}, token),

  deletePartnerVote: (token: string, id: string) =>
    request<{ success: boolean }>(`/partners/admin/votes/${id}`, { method: "DELETE" }, token),
};
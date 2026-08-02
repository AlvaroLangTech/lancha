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

export const adminApi = {
  login: (email: string, password: string) =>
    request<LoginResult>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  bookings: (token: string) => request<Booking[]>("/bookings", {}, token),

  leads: (token: string) => request<Lead[]>("/leads", {}, token),

  updateLeadStatus: (token: string, id: string, status: Lead["status"]) =>
    request<Lead>(`/leads/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }, token),
};
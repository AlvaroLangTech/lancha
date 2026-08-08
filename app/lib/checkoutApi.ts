// SENIOR (2026-08-01): cliente HTTP pro backend NOVO da Lancha (server/,
// NestJS na porta 3101 - ver server/.env.example). Separado de propósito de
// qualquer coisa do Viver Bem; esse backend só existe pra Lancha Bêju.
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

export interface AvailabilityResult {
  date: string;
  available: boolean;
  holdMinutes: number;
  status: string | null;
  message: string;
}

export interface StartCheckoutInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  requestedDate: string;
  passengerCount: number;
  occasion?: string;
  termsAccepted: boolean;
  termsVersion: string;
  couponCode?: string;
  partnerId?: string;
}

export interface StartCheckoutResult {
  bookingId: string;
  emailSent: boolean;
  devCode?: string;
}

export interface PayInput {
  billingType: "PIX" | "CREDIT_CARD" | "BOLETO";
  cpfCnpj: string;
}

export interface PayResult {
  paymentId: string;
  invoiceUrl: string;
  status: string;
  pix?: { encodedImage?: string; payload?: string };
}

export interface BookingStatus {
  id: string;
  status: "pending_verification" | "awaiting_payment" | "confirmed" | "canceled";
  emailVerified: boolean;
  paymentInvoiceUrl?: string;
}

export const checkoutApi = {
  availability: (date: string) => request<AvailabilityResult>(`/availability?date=${encodeURIComponent(date)}`),

  start: (input: StartCheckoutInput) =>
    request<StartCheckoutResult>("/checkout/start", { method: "POST", body: JSON.stringify(input) }),

  verifyEmail: (bookingId: string, code: string) =>
    request<BookingStatus>(`/checkout/${bookingId}/verify-email`, { method: "POST", body: JSON.stringify({ code }) }),

  pay: (bookingId: string, input: PayInput) =>
    request<PayResult>(`/checkout/${bookingId}/pay`, { method: "POST", body: JSON.stringify(input) }),

  status: (bookingId: string) => request<BookingStatus>(`/checkout/${bookingId}/status`),
};
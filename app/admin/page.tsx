"use client";

import { useEffect, useMemo, useState } from "react";
import { Anchor, CalendarDays, CheckCircle2, Loader2, LogOut, Mail, Phone, ShieldCheck, Users } from "lucide-react";
import { adminApi, type AdminUser, type Booking, type Lead } from "../lib/adminApi";

const tokenKey = "lancha-beju-admin-token";
const userKey = "lancha-beju-admin-user";

const statusLabel: Record<Booking["status"], string> = {
  pending_verification: "Aguardando email",
  awaiting_payment: "Aguardando pagamento",
  confirmed: "Confirmada",
  canceled: "Cancelada",
};

const leadStatusLabel: Record<Lead["status"], string> = {
  new: "Novo",
  contacted: "Contato feito",
  won: "Fechado",
  lost: "Perdido",
};

function formatDate(date?: string) {
  if (!date) return "-";
  const [year, month, day] = date.split("T")[0].split("-");
  if (!year || !month || !day) return date;
  return `${day}/${month}/${year}`;
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const tone =
    status === "confirmed"
      ? "border-neon/30 bg-neon/10 text-neon"
      : status === "canceled"
        ? "border-red-400/30 bg-red-400/10 text-red-200"
        : "border-yellow-300/30 bg-yellow-300/10 text-yellow-100";
  return <span className={`rounded-full border px-3 py-1 text-xs font-bold ${tone}`}>{statusLabel[status]}</span>;
}

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(tokenKey);
    const savedUser = window.localStorage.getItem(userKey);
    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  async function loadData(activeToken = token) {
    if (!activeToken) return;
    setLoading(true);
    setError(null);
    try {
      const [bookingData, leadData] = await Promise.all([adminApi.bookings(activeToken), adminApi.leads(activeToken)]);
      setBookings(bookingData);
      setLeads(leadData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar painel.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) void loadData(token);
  }, [token]);

  async function submitLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.login(email, password);
      setToken(result.token);
      setUser(result.user);
      window.localStorage.setItem(tokenKey, result.token);
      window.localStorage.setItem(userKey, JSON.stringify(result.user));
      await loadData(result.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login inválido.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    window.localStorage.removeItem(tokenKey);
    window.localStorage.removeItem(userKey);
    setToken(null);
    setUser(null);
    setBookings([]);
    setLeads([]);
  }

  async function updateLeadStatus(id: string, status: Lead["status"]) {
    if (!token) return;
    setError(null);
    try {
      const updated = await adminApi.updateLeadStatus(token, id, status);
      setLeads((items) => items.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não consegui atualizar o lead.");
    }
  }

  const stats = useMemo(() => {
    const confirmed = bookings.filter((booking) => booking.status === "confirmed").length;
    const pending = bookings.filter((booking) => booking.status === "pending_verification" || booking.status === "awaiting_payment").length;
    return { confirmed, pending, leads: leads.filter((lead) => lead.status === "new").length };
  }, [bookings, leads]);

  if (!token) {
    return (
      <main className="min-h-screen bg-abyss px-6 py-10 text-white md:px-10">
        <section className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center">
          <a href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-neon">
            <Anchor className="h-4 w-4" /> Lancha Bêju
          </a>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-neon">Painel gestor</p>
              <h1 className="mt-2 font-display text-3xl font-black">Entrar</h1>
              <p className="mt-2 text-sm text-white/60">Acesso restrito para acompanhar reservas, pagamentos e leads.</p>
            </div>
            {error && <p className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
            <form onSubmit={submitLogin} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-bold text-white/70">
                Email
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-h-12 rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-neon"
                  placeholder="admin@lanchabeju.com.br"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold text-white/70">
                Senha
                <input
                  required
                  type="password"
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-h-12 rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-neon"
                  placeholder="Sua senha"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-full bg-neon px-5 text-sm font-extrabold uppercase tracking-widest text-abyss disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Acessar painel
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-abyss text-white">
      <header className="border-b border-white/10 bg-abyss/95 px-6 py-5 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <a href="/" className="font-display text-xl font-black uppercase tracking-tight">Lancha Bêju</a>
            <p className="mt-1 text-sm text-white/55">Painel gestor de reservas e leads</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-white/60 md:inline">{user?.displayName || user?.email}</span>
            <button onClick={() => void loadData()} className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/80 hover:border-neon hover:text-neon">
              Atualizar
            </button>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/80 hover:bg-white/15">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        {error && <p className="mb-6 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <CheckCircle2 className="h-5 w-5 text-neon" />
            <p className="mt-4 text-3xl font-black">{stats.confirmed}</p>
            <p className="text-sm text-white/55">Reservas confirmadas</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <CalendarDays className="h-5 w-5 text-yellow-100" />
            <p className="mt-4 text-3xl font-black">{stats.pending}</p>
            <p className="text-sm text-white/55">Aguardando email/pagamento</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <Users className="h-5 w-5 text-white" />
            <p className="mt-4 text-3xl font-black">{stats.leads}</p>
            <p className="text-sm text-white/55">Novos leads</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-black">Reservas</h2>
              {loading && <Loader2 className="h-5 w-5 animate-spin text-neon" />}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
                <thead className="text-xs uppercase tracking-widest text-white/45">
                  <tr>
                    <th className="px-3 py-2">Cliente</th>
                    <th className="px-3 py-2">Data</th>
                    <th className="px-3 py-2">Pessoas</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Sinal</th>
                    <th className="px-3 py-2">Pagamento</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="bg-white/[0.035]">
                      <td className="rounded-l-xl px-3 py-3">
                        <p className="font-bold text-white">{booking.customerName}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-white/50"><Mail className="h-3 w-3" /> {booking.customerEmail}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-white/50"><Phone className="h-3 w-3" /> {booking.customerPhone}</p>
                      </td>
                      <td className="px-3 py-3 font-bold">{formatDate(booking.requestedDate)}</td>
                      <td className="px-3 py-3">{booking.passengerCount}</td>
                      <td className="px-3 py-3"><StatusBadge status={booking.status} /></td>
                      <td className="px-3 py-3">{formatMoney(booking.depositAmountCents)}</td>
                      <td className="rounded-r-xl px-3 py-3">
                        {booking.paymentInvoiceUrl ? (
                          <a href={booking.paymentInvoiceUrl} target="_blank" rel="noreferrer" className="font-bold text-neon hover:underline">Abrir</a>
                        ) : (
                          <span className="text-white/35">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr><td colSpan={6} className="px-3 py-10 text-center text-white/45">Nenhuma reserva ainda.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="font-display text-2xl font-black">Leads</h2>
            <div className="mt-5 flex flex-col gap-3">
              {leads.map((lead) => (
                <article key={lead.id} className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">{lead.name}</h3>
                      <p className="mt-1 text-xs text-white/50">{lead.phone}</p>
                      {lead.email && <p className="mt-1 text-xs text-white/50">{lead.email}</p>}
                    </div>
                    <select
                      value={lead.status}
                      onChange={(event) => void updateLeadStatus(lead.id, event.target.value as Lead["status"])}
                      className="rounded-lg border border-white/15 bg-abyss px-2 py-1 text-xs font-bold text-white outline-none"
                    >
                      {Object.entries(leadStatusLabel).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-3 text-xs text-white/45">Origem: {lead.source} • Criado em {formatDate(lead.createdAt)}</p>
                  {lead.notes && <p className="mt-3 rounded-lg bg-black/20 p-3 text-sm text-white/65">{lead.notes}</p>}
                </article>
              ))}
              {leads.length === 0 && <p className="py-10 text-center text-white/45">Nenhum lead ainda.</p>}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
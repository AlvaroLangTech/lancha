"use client";

import { useEffect, useMemo, useState } from "react";
import { Anchor, CalendarDays, CheckCircle2, CircleDollarSign, Loader2, LogOut, Mail, Phone, ShieldCheck, Trash2, Trophy, UserPlus, Users, Vote } from "lucide-react";
import {
  adminApi,
  type AdminUser,
  type Booking,
  type Lead,
  type Partner,
  type PartnerFinancials,
  type PartnerRankingEntry,
  type PartnerVoteRow,
} from "../lib/adminApi";

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
  const [partners, setPartners] = useState<Partner[]>([]);
  const [ranking, setRanking] = useState<PartnerRankingEntry[]>([]);
  const [financials, setFinancials] = useState<PartnerFinancials[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SENIOR (2026-08-06, pedido do Alvaro: "preciso ter o controle de todos os
  // votos... tirar o meu voto"): lista de votos + apagar - pra ele conseguir
  // limpar voto de teste sem mexer no banco direto.
  const [votes, setVotes] = useState<PartnerVoteRow[]>([]);
  const [voteDeletingId, setVoteDeletingId] = useState<string | null>(null);

  // SENIOR (2026-08-05, pedido do Alvaro: "registrar pagamento no painel"):
  // um valor de input por parceira (chave = partnerId), pra não precisar de
  // modal - digita o valor na linha dela e confirma ali mesmo.
  const [payoutAmounts, setPayoutAmounts] = useState<Record<string, string>>({});
  const [payoutSavingId, setPayoutSavingId] = useState<string | null>(null);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  // SENIOR (2026-08-05): form simples de cadastro de parceira - só o Alvaro
  // (logado no painel) pode criar cupom novo, ver PartnersController
  // (admin/*, atrás de JwtAuthGuard).
  const [partnerForm, setPartnerForm] = useState({ name: "", couponCode: "", instagram: "", phone: "", photoUrl: "" });
  const [partnerSaving, setPartnerSaving] = useState(false);
  const [partnerError, setPartnerError] = useState<string | null>(null);

  // SENIOR (2026-08-06, pedido do Alvaro: "preciso colocar as fotos das
  // modelos"): edição rápida de foto por parceira já cadastrada - sem
  // upload de arquivo (o backend não tem endpoint de upload ainda), só cola
  // a URL da foto (ex: depois de subir o arquivo em public/parceiras/ do
  // site, ou um link de imagem já hospedada em algum lugar).
  const [photoEdits, setPhotoEdits] = useState<Record<string, string>>({});
  const [photoSavingId, setPhotoSavingId] = useState<string | null>(null);

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
      const [bookingData, leadData, partnerData, rankingData, financialsData, voteData] = await Promise.all([
        adminApi.bookings(activeToken),
        adminApi.leads(activeToken),
        adminApi.partners(activeToken),
        adminApi.partnersRanking(activeToken),
        adminApi.partnersFinancials(activeToken),
        adminApi.partnerVotes(activeToken),
      ]);
      setBookings(bookingData);
      setLeads(leadData);
      setPartners(partnerData);
      setRanking(rankingData);
      setFinancials(financialsData);
      setVotes(voteData);
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
    setPartners([]);
    setRanking([]);
    setFinancials([]);
    setVotes([]);
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

  async function submitPartner(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    setPartnerError(null);
    if (!partnerForm.name.trim() || !partnerForm.couponCode.trim()) {
      setPartnerError("Preencha nome e cupom.");
      return;
    }
    setPartnerSaving(true);
    try {
      await adminApi.createPartner(token, {
        name: partnerForm.name.trim(),
        couponCode: partnerForm.couponCode.trim(),
        instagram: partnerForm.instagram.trim() || undefined,
        phone: partnerForm.phone.trim() || undefined,
        photoUrl: partnerForm.photoUrl.trim() || undefined,
      });
      setPartnerForm({ name: "", couponCode: "", instagram: "", phone: "", photoUrl: "" });
      await loadData(token);
    } catch (err) {
      setPartnerError(err instanceof Error ? err.message : "Não consegui cadastrar a parceira.");
    } finally {
      setPartnerSaving(false);
    }
  }

  async function submitPayout(partnerId: string) {
    if (!token) return;
    setPayoutError(null);
    const rawValue = payoutAmounts[partnerId]?.replace(",", ".").trim();
    const amount = Number(rawValue);
    if (!rawValue || Number.isNaN(amount) || amount <= 0) {
      setPayoutError("Digite um valor válido em reais (ex: 100 ou 100,50).");
      return;
    }
    setPayoutSavingId(partnerId);
    try {
      await adminApi.registerPartnerPayout(token, partnerId, Math.round(amount * 100));
      setPayoutAmounts((amounts) => ({ ...amounts, [partnerId]: "" }));
      await loadData(token);
    } catch (err) {
      setPayoutError(err instanceof Error ? err.message : "Não consegui registrar o pagamento.");
    } finally {
      setPayoutSavingId(null);
    }
  }

  async function savePartnerPhoto(partnerId: string) {
    if (!token) return;
    const photoUrl = photoEdits[partnerId]?.trim();
    if (!photoUrl) return;
    setPhotoSavingId(partnerId);
    try {
      await adminApi.updatePartner(token, partnerId, { photoUrl });
      setPhotoEdits((edits) => ({ ...edits, [partnerId]: "" }));
      await loadData(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não consegui salvar a foto.");
    } finally {
      setPhotoSavingId(null);
    }
  }

  // SENIOR (2026-08-06, pedido do Alvaro: "nao consigo tirar as fotos
  // bugadas"): antes só dava pra SUBSTITUIR a foto (o botão "Salvar foto"
  // fica desabilitado com o campo vazio, ver disabled abaixo) - não tinha
  // como voltar a ficar sem foto. Manda photoUrl vazio pro backend, que já
  // aceita (CreatePartnerDto.photoUrl é @IsOptional @IsString, string vazia
  // é válida) - some do carrossel/board (ambos filtram por photoUrl truthy).
  async function removePartnerPhoto(partnerId: string) {
    if (!token) return;
    setPhotoSavingId(partnerId);
    try {
      await adminApi.updatePartner(token, partnerId, { photoUrl: "" });
      await loadData(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não consegui remover a foto.");
    } finally {
      setPhotoSavingId(null);
    }
  }

  async function deleteVote(id: string) {
    if (!token) return;
    setVoteDeletingId(id);
    try {
      await adminApi.deletePartnerVote(token, id);
      setVotes((items) => items.filter((v) => v.id !== id));
      await loadData(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não consegui apagar o voto.");
    } finally {
      setVoteDeletingId(null);
    }
  }

  async function togglePartnerActive(partner: Partner) {
    if (!token) return;
    try {
      await adminApi.updatePartner(token, partner.id, { active: !partner.active });
      await loadData(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não consegui atualizar a parceira.");
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

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-5 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-neon" />
              <h2 className="font-display text-2xl font-black">Ranking de parceiras (este mês)</h2>
            </div>
            <p className="mb-4 text-xs text-white/45">
              Score combina venda real (peso maior) e voto público do site (peso menor). Só aqui aparece o valor de
              vendas — a página pública mostra só posição e votos.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-left text-sm">
                <thead className="text-xs uppercase tracking-widest text-white/45">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Parceira</th>
                    <th className="px-3 py-2">Vendas</th>
                    <th className="px-3 py-2">Faturamento</th>
                    <th className="px-3 py-2">Votos</th>
                    <th className="px-3 py-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((entry) => (
                    <tr key={entry.partnerId} className="bg-white/[0.035]">
                      <td className="rounded-l-xl px-3 py-3 font-bold">{entry.rank}</td>
                      <td className="px-3 py-3">
                        <p className="font-bold text-white">{entry.name}</p>
                        {entry.instagram && <p className="text-xs text-white/50">@{entry.instagram.replace(/^@/, "")}</p>}
                      </td>
                      <td className="px-3 py-3">{entry.salesCount}</td>
                      <td className="px-3 py-3">{formatMoney(entry.salesRevenueCents)}</td>
                      <td className="px-3 py-3">{entry.voteCount}</td>
                      <td className="rounded-r-xl px-3 py-3">{(entry.score * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                  {ranking.length === 0 && (
                    <tr><td colSpan={6} className="px-3 py-10 text-center text-white/45">Nenhuma parceira cadastrada ainda.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-5 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-neon" />
              <h2 className="font-display text-2xl font-black">Cadastrar parceira</h2>
            </div>
            <form onSubmit={submitPartner} className="flex flex-col gap-3">
              {partnerError && <p className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">{partnerError}</p>}
              <input
                placeholder="Nome"
                value={partnerForm.name}
                onChange={(e) => setPartnerForm((f) => ({ ...f, name: e.target.value }))}
                className="min-h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white outline-none focus:border-neon"
              />
              <input
                placeholder="Cupom (ex: BESSA10)"
                value={partnerForm.couponCode}
                onChange={(e) => setPartnerForm((f) => ({ ...f, couponCode: e.target.value.toUpperCase() }))}
                className="min-h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white outline-none focus:border-neon"
              />
              <input
                placeholder="Instagram (opcional)"
                value={partnerForm.instagram}
                onChange={(e) => setPartnerForm((f) => ({ ...f, instagram: e.target.value }))}
                className="min-h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white outline-none focus:border-neon"
              />
              <input
                placeholder="WhatsApp (opcional)"
                value={partnerForm.phone}
                onChange={(e) => setPartnerForm((f) => ({ ...f, phone: e.target.value }))}
                className="min-h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white outline-none focus:border-neon"
              />
              <input
                placeholder="URL da foto (opcional)"
                value={partnerForm.photoUrl}
                onChange={(e) => setPartnerForm((f) => ({ ...f, photoUrl: e.target.value }))}
                className="min-h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white outline-none focus:border-neon"
              />
              <button
                type="submit"
                disabled={partnerSaving}
                className="mt-1 flex min-h-11 items-center justify-center gap-2 rounded-full bg-neon px-5 text-xs font-extrabold uppercase tracking-widest text-abyss disabled:opacity-50"
              >
                {partnerSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Cadastrar
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-2">
              {partners.map((partner) => (
                <div key={partner.id} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {partner.photoUrl ? (
                        <img src={partner.photoUrl} alt={partner.name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                      ) : (
                        <div className="h-9 w-9 shrink-0 rounded-full bg-white/10" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">{partner.name}</p>
                        <p className="text-xs text-white/50">Cupom: {partner.couponCode}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => void togglePartnerActive(partner)}
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${
                        partner.active ? "border-neon/30 bg-neon/10 text-neon" : "border-white/15 bg-white/5 text-white/50"
                      }`}
                    >
                      {partner.active ? "Ativa" : "Inativa"}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      value={photoEdits[partner.id] ?? ""}
                      onChange={(e) => setPhotoEdits((edits) => ({ ...edits, [partner.id]: e.target.value }))}
                      placeholder="Colar URL da foto"
                      className="min-h-9 flex-1 rounded-lg border border-white/15 bg-abyss px-3 text-xs text-white outline-none focus:border-neon"
                    />
                    <button
                      onClick={() => void savePartnerPhoto(partner.id)}
                      disabled={photoSavingId === partner.id || !photoEdits[partner.id]?.trim()}
                      className="shrink-0 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/15 disabled:opacity-40"
                    >
                      {photoSavingId === partner.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Salvar foto"}
                    </button>
                    {partner.photoUrl && (
                      <button
                        onClick={() => void removePartnerPhoto(partner.id)}
                        disabled={photoSavingId === partner.id}
                        className="shrink-0 rounded-full border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-400/20 disabled:opacity-40"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {partners.length === 0 && <p className="py-6 text-center text-xs text-white/45">Nenhuma parceira cadastrada ainda.</p>}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-2 flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-neon" />
            <h2 className="font-display text-2xl font-black">Comissões das parceiras</h2>
          </div>
          <p className="mb-5 text-xs text-white/45">
            R$100 por reserva confirmada, sobe por nível (carreira, nunca reseta por mês) - Tripulante R$100, Marinheira
            R$120 (a partir da 3ª), Timoneira R$150 (a partir da 6ª), Capitã R$200 (a partir da 12ª).
          </p>
          {payoutError && <p className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">{payoutError}</p>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase tracking-widest text-white/45">
                <tr>
                  <th className="px-3 py-2">Parceira</th>
                  <th className="px-3 py-2">Nível</th>
                  <th className="px-3 py-2">Reservas</th>
                  <th className="px-3 py-2">Comissão total</th>
                  <th className="px-3 py-2">Pago</th>
                  <th className="px-3 py-2">Devido</th>
                  <th className="px-3 py-2">Registrar pagamento</th>
                </tr>
              </thead>
              <tbody>
                {financials.map((entry) => (
                  <tr key={entry.partnerId} className="bg-white/[0.035]">
                    <td className="rounded-l-xl px-3 py-3">
                      <p className="font-bold text-white">{entry.name}</p>
                      <p className="text-xs text-white/50">Cupom: {entry.couponCode}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-bold">Nível {entry.levelNumber} · {entry.levelName}</p>
                      {entry.bookingsUntilNextLevel !== null && (
                        <p className="text-xs text-white/45">Faltam {entry.bookingsUntilNextLevel} pro próximo nível</p>
                      )}
                    </td>
                    <td className="px-3 py-3">{entry.lifetimeConfirmedBookings}</td>
                    <td className="px-3 py-3">{formatMoney(entry.lifetimeCommissionCents)}</td>
                    <td className="px-3 py-3">{formatMoney(entry.totalPaidCents)}</td>
                    <td className="px-3 py-3">
                      <span className={`font-bold ${entry.owedCents > 0 ? "text-neon" : "text-white/50"}`}>
                        {formatMoney(entry.owedCents)}
                      </span>
                    </td>
                    <td className="rounded-r-xl px-3 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          value={payoutAmounts[entry.partnerId] ?? ""}
                          onChange={(e) => setPayoutAmounts((amounts) => ({ ...amounts, [entry.partnerId]: e.target.value }))}
                          placeholder="R$"
                          className="min-h-9 w-24 rounded-lg border border-white/15 bg-abyss px-2 text-xs text-white outline-none focus:border-neon"
                        />
                        <button
                          onClick={() => void submitPayout(entry.partnerId)}
                          disabled={payoutSavingId === entry.partnerId}
                          className="shrink-0 rounded-full bg-neon px-3 py-2 text-xs font-extrabold uppercase tracking-widest text-abyss disabled:opacity-50"
                        >
                          {payoutSavingId === entry.partnerId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Pagar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {financials.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-10 text-center text-white/45">Nenhuma parceira cadastrada ainda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-2 flex items-center gap-2">
            <Vote className="h-5 w-5 text-neon" />
            <h2 className="font-display text-2xl font-black">Votos do mês</h2>
          </div>
          <p className="mb-5 text-xs text-white/45">
            Todos os votos registrados este mês. Use "Apagar" pra remover um voto de teste ou suspeito de fraude - o
            ranking recalcula na hora.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase tracking-widest text-white/45">
                <tr>
                  <th className="px-3 py-2">Parceira</th>
                  <th className="px-3 py-2">Mês</th>
                  <th className="px-3 py-2">Data/hora</th>
                  <th className="px-3 py-2">Ação</th>
                </tr>
              </thead>
              <tbody>
                {votes.map((v) => (
                  <tr key={v.id} className="bg-white/[0.035]">
                    <td className="rounded-l-xl px-3 py-3 font-bold text-white">{v.partnerName}</td>
                    <td className="px-3 py-3">{v.month}</td>
                    <td className="px-3 py-3 text-white/60">{new Date(v.createdAt).toLocaleString("pt-BR")}</td>
                    <td className="rounded-r-xl px-3 py-3">
                      <button
                        onClick={() => void deleteVote(v.id)}
                        disabled={voteDeletingId === v.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1.5 text-xs font-bold text-red-200 hover:bg-red-400/20 disabled:opacity-40"
                      >
                        {voteDeletingId === v.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        Apagar
                      </button>
                    </td>
                  </tr>
                ))}
                {votes.length === 0 && (
                  <tr><td colSpan={4} className="px-3 py-10 text-center text-white/45">Nenhum voto ainda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
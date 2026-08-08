"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronDown, Loader2, Mail, X } from "lucide-react";
import { checkoutApi } from "../../lib/checkoutApi";
import { partnersApi, type PublicPartner } from "../../lib/partnersApi";
import { boatPackage, bookingPolicy, TERMS_VERSION } from "../../lib/landing-content";

// SENIOR (2026-08-01, pedido do Alvaro: "finalizarmos a compra toda pelo
// site... verificaÃ§Ã£o de email com modal e steps, simples e funcional,
// checkout para o banco asaas"): modal de 4 passos - dados -> confirma
// email -> paga o sinal (Asaas) -> confirmaÃ§Ã£o. Cada passo sÃ³ avanÃ§a
// depois que o passo anterior responde OK da API (server/, porta 3101) -
// nada aqui finge sucesso no frontend; quem confirma pagamento de verdade
// Ã© o webhook do Asaas (ver checkout.service.ts), esse modal sÃ³ mostra o
// status.
type Step = "form" | "verify" | "pay" | "success";

// SENIOR (2026-08-02): TERMS_VERSION agora vive em landing-content.ts,
// compartilhado com o SiteChatWidget (fluxo conversacional de reserva) - os
// dois caminhos gravam aceite no mesmo booking e precisam registrar a MESMA
// versÃ£o de texto. Ver comentÃ¡rio completo lÃ¡.

const inputClass =
  "min-h-12 w-full appearance-none rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none placeholder:text-white/40 focus:border-neon [color-scheme:dark]";
// SENIOR (2026-08-03, feedback do Alvaro: "chevron ta mal posicionado" no
// input de data e no select de forma de pagamento): navegador desenha o
// proprio icone nativo (seta/calendario) em posicao que ele NAO deixa a
// gente controlar direito, e ainda mistura mal com o tema escuro. Fix:
// appearance-none tira o desenho nativo, escondemos o indicador nativo do
// <input type="date"> (webkit-calendar-picker-indicator) deixando ele
// INVISIVEL mas clicavel por cima do campo inteiro (cobre 100% da area,
// entao clicar em qualquer parte do input ainda abre o seletor nativo), e
// desenhamos nosso proprio icone (CalendarDays/ChevronDown) por cima, so
// visual, sem pointer-events - assim o icone fica sempre alinhado certinho
// com o resto do design, em vez de na posicao que o navegador escolher.
const dateInputClass =
  `${inputClass} pr-11 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0`;
const selectInputClass = `${inputClass} pr-11`;
const fieldWrapClass = "relative flex items-center";
const fieldIconClass = "pointer-events-none absolute right-4 h-4 w-4 text-white/50";
const fieldErrorClass = "mt-1 text-xs font-bold text-red-300";
const labelClass = "flex flex-col gap-1.5 text-sm";
const buttonClass =
  "mt-2 flex min-h-13 items-center justify-center gap-2 rounded-full bg-neon text-sm font-extrabold uppercase tracking-widest text-abyss transition hover:scale-[1.02] hover:brightness-110 disabled:opacity-50 disabled:hover:scale-100";

export function CheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // SENIOR (2026-08-03, pedido do Alvaro: "erro em ingles, nao mostra o
  // preenchimento errado de forma direta"): antes o form so tinha o atributo
  // HTML `required`, entao um campo vazio disparava o popup NATIVO do
  // navegador ("Please fill out this field") - em ingles se o navegador do
  // cliente estiver em ingles, e sempre generico, sem dizer qual regra
  // exatamente falhou. Substituido por validacao manual em PT-BR, por campo
  // (fieldErrors), com noValidate nos <form> pra nunca mais deixar o popup
  // nativo aparecer.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerPhone: "", requestedDate: "", passengerCount: 1, occasion: "" });
  // SENIOR (2026-08-06, pedido do Alvaro: "a pessoa chegou, escolheu a
  // modelo... a comissÃ£o rola daÃ­"): caminho PRINCIPAL agora Ã© escolher o
  // nome da parceira num seletor (sem precisar saber cupom de cor) - ver
  // partnersApi.list() (endpoint pÃºblico, sÃ³ nome/instagram/foto, nunca
  // cupom). couponCode digitado continua existindo como alternativa pra
  // quem sÃ³ ouviu o cÃ³digo de boca, sem link nenhum.
  const [partners, setPartners] = useState<PublicPartner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [couponCode, setCouponCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("cupom")?.trim() ?? "";
  });

  useEffect(() => {
    if (!open) return;
    partnersApi
      .list()
      .then(setPartners)
      .catch(() => setPartners([]));
  }, [open]);

  const selectedPartner = partners.find((partner) => partner.id === selectedPartnerId);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [code, setCode] = useState("");
  const [payment, setPayment] = useState({ billingType: "PIX" as "PIX" | "CREDIT_CARD" | "BOLETO", cpfCnpj: "" });
  const [payResult, setPayResult] = useState<{ invoiceUrl: string; pix?: { encodedImage?: string; payload?: string } } | null>(null);

  if (!open) return null;

  const reset = () => {
    setStep("form");
    setError(null);
    setBookingId(null);
    setDevCode(null);
    setCode("");
    setPayResult(null);
    setTermsAccepted(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // SENIOR: valida tudo em PT-BR ANTES de chamar a API - devolve o primeiro
  // erro de cada campo, ou objeto vazio se tudo certo. today em
  // YYYY-MM-DD (mesmo formato do <input type="date">) pra comparar direto
  // sem parsing de timezone.
  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    const today = new Date().toISOString().slice(0, 10);

    if (!form.customerName.trim()) errors.customerName = "Preencha seu nome completo.";
    if (!form.customerEmail.trim()) {
      errors.customerEmail = "Preencha seu email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail.trim())) {
      errors.customerEmail = "Digite um email vÃ¡lido (ex: voce@email.com).";
    }
    const phoneDigits = form.customerPhone.replace(/\D/g, "");
    if (phoneDigits.length < 10) errors.customerPhone = "Digite um WhatsApp vÃ¡lido, com DDD.";
    if (!form.requestedDate) {
      errors.requestedDate = "Escolha a data desejada.";
    } else if (form.requestedDate < today) {
      errors.requestedDate = "A data precisa ser hoje ou no futuro.";
    }
    if (!form.passengerCount || form.passengerCount < 1 || form.passengerCount > 9) {
      errors.passengerCount = "Informe de 1 a 9 pessoas.";
    }
    if (!termsAccepted) errors.termsAccepted = "VocÃª precisa aceitar os termos da reserva pra continuar.";

    return errors;
  };

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const errors = validateForm();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Confira os campos destacados abaixo antes de continuar.");
      return;
    }
    setLoading(true);
    try {
      const availability = await checkoutApi.availability(form.requestedDate);
      if (!availability.available) throw new Error(availability.message);
      const result = await checkoutApi.start({
        ...form,
        termsAccepted,
        termsVersion: TERMS_VERSION,
        // SENIOR: partnerId (seletor) manda mais que couponCode (digitado) -
        // sÃ³ manda um dos dois pro backend, coerente com a prioridade em
        // CheckoutService.start.
        partnerId: selectedPartnerId || undefined,
        couponCode: selectedPartnerId ? undefined : couponCode.trim() || undefined,
      });
      setBookingId(result.bookingId);
      setDevCode(result.devCode || null);
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao iniciar reserva.");
    } finally {
      setLoading(false);
    }
  };

  const submitVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!bookingId) return;
    setError(null);
    setLoading(true);
    try {
      await checkoutApi.verifyEmail(bookingId, code);
      setStep("pay");
    } catch (err) {
      setError(err instanceof Error ? err.message : "CÃ³digo invÃ¡lido.");
    } finally {
      setLoading(false);
    }
  };

  const submitPay = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!bookingId) return;
    setError(null);
    const cpfDigits = payment.cpfCnpj.replace(/\D/g, "");
    if (cpfDigits.length !== 11 && cpfDigits.length !== 14) {
      setFieldErrors((fe) => ({ ...fe, cpfCnpj: "Digite um CPF (11 dÃ­gitos) ou CNPJ (14 dÃ­gitos) vÃ¡lido." }));
      setError("Confira os campos destacados abaixo antes de continuar.");
      return;
    }
    setFieldErrors((fe) => ({ ...fe, cpfCnpj: "" }));
    setLoading(true);
    try {
      const result = await checkoutApi.pay(bookingId, payment);
      setPayResult({ invoiceUrl: result.invoiceUrl, pix: result.pix });
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar cobranÃ§a.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-abyss/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-abyss-light shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-neon">
              {step === "form" && "1. Seus dados"}
              {step === "verify" && "2. Confirme seu email"}
              {step === "pay" && "3. Pagamento da reserva"}
              {step === "success" && "Reserva iniciada"}
            </p>
            <h2 className="mt-1 font-display text-xl font-bold text-white">Reservar Lancha BÃªju</h2>
          </div>
          <button type="button" onClick={handleClose} className="rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">{error}</p>
          )}

          {step === "form" && (
            <form onSubmit={submitForm} noValidate className="flex flex-col gap-4">
              <label className={labelClass}>
                <span className="font-bold text-white/70">Nome completo</span>
                <input
                  value={form.customerName}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, customerName: e.target.value }));
                    setFieldErrors((fe) => ({ ...fe, customerName: "" }));
                  }}
                  className={inputClass}
                  placeholder="Seu nome"
                />
                {fieldErrors.customerName && <span className={fieldErrorClass}>{fieldErrors.customerName}</span>}
              </label>
              <label className={labelClass}>
                <span className="font-bold text-white/70">Email</span>
                <input
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, customerEmail: e.target.value }));
                    setFieldErrors((fe) => ({ ...fe, customerEmail: "" }));
                  }}
                  className={inputClass}
                  placeholder="voce@email.com"
                />
                {fieldErrors.customerEmail && <span className={fieldErrorClass}>{fieldErrors.customerEmail}</span>}
              </label>
              <label className={labelClass}>
                <span className="font-bold text-white/70">WhatsApp</span>
                <input
                  value={form.customerPhone}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, customerPhone: e.target.value }));
                    setFieldErrors((fe) => ({ ...fe, customerPhone: "" }));
                  }}
                  className={inputClass}
                  placeholder="(61) 99999-9999"
                />
                {fieldErrors.customerPhone && <span className={fieldErrorClass}>{fieldErrors.customerPhone}</span>}
              </label>
              <label className={labelClass}>
                <span className="font-bold text-white/70">Data desejada</span>
                <div className={fieldWrapClass}>
                  <input
                    type="date"
                    value={form.requestedDate}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, requestedDate: e.target.value }));
                      setFieldErrors((fe) => ({ ...fe, requestedDate: "" }));
                    }}
                    className={dateInputClass}
                  />
                  <CalendarDays className={fieldIconClass} />
                </div>
                {fieldErrors.requestedDate && <span className={fieldErrorClass}>{fieldErrors.requestedDate}</span>}
              </label>
              <label className={labelClass}>
                <span className="font-bold text-white/70">Quantidade de pessoas</span>
                <input
                  type="number"
                  min={1}
                  max={9}
                  value={form.passengerCount}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, passengerCount: Number(e.target.value) }));
                    setFieldErrors((fe) => ({ ...fe, passengerCount: "" }));
                  }}
                  className={inputClass}
                />
                {fieldErrors.passengerCount && <span className={fieldErrorClass}>{fieldErrors.passengerCount}</span>}
              </label>
              <label className={labelClass}>
                <span className="font-bold text-white/70">OcasiÃ£o</span>
                <input
                  value={form.occasion}
                  onChange={(e) => setForm((f) => ({ ...f, occasion: e.target.value }))}
                  className={inputClass}
                  placeholder="AniversÃ¡rio, famÃ­lia, ensaio..."
                />
              </label>
              {partners.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <div>
                    <span className="font-bold text-white/70">Quem te indicou? (opcional)</span>
                    <p className="mt-1 text-xs text-white/45">Escolha pela foto. O cupom da parceira fica vinculado automaticamente.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPartnerId("")}
                      className={`min-h-28 rounded-2xl border p-3 text-left transition ${
                        !selectedPartnerId
                          ? "border-neon bg-neon/10 text-white"
                          : "border-white/10 bg-white/5 text-white/65 hover:border-white/25"
                      }`}
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-sm font-black">?</span>
                      <span className="mt-2 block text-sm font-extrabold">Sem indicação</span>
                      <span className="mt-1 block text-[11px] text-white/45">Continuar sem cupom</span>
                    </button>
                    {partners.map((partner) => (
                      <button
                        key={partner.id}
                        type="button"
                        onClick={() => {
                          setSelectedPartnerId(partner.id);
                          setCouponCode(partner.couponCode ?? "");
                        }}
                        className={`min-h-28 rounded-2xl border p-2 text-left transition ${
                          selectedPartnerId === partner.id
                            ? "border-neon bg-neon/10 text-white"
                            : "border-white/10 bg-white/5 text-white/70 hover:border-neon/50 hover:text-white"
                        }`}
                      >
                        <div className="flex gap-2.5">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/10">
                            {partner.photoUrl ? (
                              <img src={partner.photoUrl} alt={partner.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-lg font-black text-white/50">
                                {partner.name.slice(0, 1)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-extrabold">{partner.name}</span>
                            {partner.instagram && <span className="block truncate text-[11px] text-white/45">{partner.instagram}</span>}
                            {partner.couponCode && (
                              <span className="mt-1 inline-flex rounded-full bg-neon px-2 py-0.5 text-[10px] font-black uppercase text-abyss">
                                {partner.couponCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {selectedPartner && (
                    <p className="rounded-xl border border-neon/25 bg-neon/10 px-3 py-2 text-xs font-bold text-neon">
                      Indicação selecionada: {selectedPartner.name}{selectedPartner.couponCode ? ` — cupom ${selectedPartner.couponCode}` : ""}.
                    </p>
                  )}
                </div>
              )}
              {!selectedPartnerId && (
                <label className={labelClass}>
                  <span className="font-bold text-white/70">Ou digite o cupom, se souber (opcional)</span>
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className={inputClass}
                    placeholder="Ex: BESSA10"
                  />
                </label>
              )}
              <label className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    setFieldErrors((fe) => ({ ...fe, termsAccepted: "" }));
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-neon"
                />
                <span>
                  Li e aceito os termos da reserva: <strong className="text-white/90">{bookingPolicy.deposit}</strong> {bookingPolicy.cancellation}{" "}
                  {bookingPolicy.included}
                </span>
              </label>
              {fieldErrors.termsAccepted && <span className={fieldErrorClass}>{fieldErrors.termsAccepted}</span>}
              <button type="submit" disabled={loading} className={buttonClass}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Enviar cÃ³digo de confirmaÃ§Ã£o
              </button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={submitVerify} noValidate className="flex flex-col gap-4">
              <p className="text-sm text-white/60">
                Mandamos um cÃ³digo de 6 dÃ­gitos para <strong className="text-white">{form.customerEmail}</strong>. Confira sua caixa de
                entrada (e o spam).
              </p>
              {devCode && (
                <p className="rounded-xl border border-neon/30 bg-neon/10 px-4 py-2 text-xs font-bold text-neon">
                  Modo desenvolvimento: cÃ³digo = {devCode} (envio de email nÃ£o configurado ainda)
                </p>
              )}
              <label className={labelClass}>
                <span className="font-bold text-white/70">CÃ³digo de 6 dÃ­gitos</span>
                <input
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className={`${inputClass} text-center text-2xl font-black tracking-[0.5em]`}
                  placeholder="000000"
                />
              </label>
              <button type="submit" disabled={loading || code.length !== 6} className={buttonClass}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Confirmar cÃ³digo
              </button>
            </form>
          )}

          {step === "pay" && (
            <form onSubmit={submitPay} noValidate className="flex flex-col gap-4">
              <p className="text-sm text-white/60">
                Pagamento integral para garantir sua data: <strong className="text-white">R$ {boatPackage.price.toFixed(2)}</strong>.{" "}
                {bookingPolicy.cancellation}
              </p>
              <label className={labelClass}>
                <span className="font-bold text-white/70">CPF ou CNPJ</span>
                <input
                  value={payment.cpfCnpj}
                  onChange={(e) => {
                    setPayment((p) => ({ ...p, cpfCnpj: e.target.value.replace(/\D/g, "") }));
                    setFieldErrors((fe) => ({ ...fe, cpfCnpj: "" }));
                  }}
                  className={inputClass}
                  placeholder="SÃ³ nÃºmeros"
                />
                {fieldErrors.cpfCnpj && <span className={fieldErrorClass}>{fieldErrors.cpfCnpj}</span>}
              </label>
              <label className={labelClass}>
                <span className="font-bold text-white/70">Forma de pagamento</span>
                <div className={fieldWrapClass}>
                  <select
                    value={payment.billingType}
                    onChange={(e) => setPayment((p) => ({ ...p, billingType: e.target.value as typeof p.billingType }))}
                    className={selectInputClass}
                  >
                    <option value="PIX">Pix</option>
                    <option value="CREDIT_CARD">CartÃ£o de crÃ©dito</option>
                    <option value="BOLETO">Boleto</option>
                  </select>
                  <ChevronDown className={fieldIconClass} />
                </div>
              </label>
              <button type="submit" disabled={loading} className={buttonClass}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Gerar cobranÃ§a
              </button>
            </form>
          )}

          {step === "success" && payResult && (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-neon" />
              <p className="text-sm text-white/70">
                CobranÃ§a gerada! Assim que o pagamento cair, sua reserva Ã© confirmada automaticamente e vocÃª recebe a confirmaÃ§Ã£o por
                email.
              </p>
              {payResult.pix?.encodedImage && (
                <img
                  src={`data:image/png;base64,${payResult.pix.encodedImage}`}
                  alt="QR Code Pix"
                  className="h-48 w-48 rounded-xl border border-white/10 bg-white p-2"
                />
              )}
              <a
                href={payResult.invoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-neon px-6 text-sm font-extrabold uppercase tracking-widest text-abyss transition hover:brightness-110"
              >
                Abrir pÃ¡gina de pagamento
              </a>
              <button type="button" onClick={handleClose} className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white">
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

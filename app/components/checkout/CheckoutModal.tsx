"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Mail, X } from "lucide-react";
import { checkoutApi } from "../../lib/checkoutApi";
import { boatPackage, bookingPolicy, TERMS_VERSION } from "../../lib/landing-content";

// SENIOR (2026-08-01, pedido do Alvaro: "finalizarmos a compra toda pelo
// site... verificação de email com modal e steps, simples e funcional,
// checkout para o banco asaas"): modal de 4 passos - dados -> confirma
// email -> paga o sinal (Asaas) -> confirmação. Cada passo só avança
// depois que o passo anterior responde OK da API (server/, porta 3101) -
// nada aqui finge sucesso no frontend; quem confirma pagamento de verdade
// é o webhook do Asaas (ver checkout.service.ts), esse modal só mostra o
// status.
type Step = "form" | "verify" | "pay" | "success";

// SENIOR (2026-08-02): TERMS_VERSION agora vive em landing-content.ts,
// compartilhado com o SiteChatWidget (fluxo conversacional de reserva) - os
// dois caminhos gravam aceite no mesmo booking e precisam registrar a MESMA
// versão de texto. Ver comentário completo lá.

const inputClass =
  "min-h-12 rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none placeholder:text-white/40 focus:border-neon [color-scheme:dark]";
const labelClass = "flex flex-col gap-1.5 text-sm";
const buttonClass =
  "mt-2 flex min-h-13 items-center justify-center gap-2 rounded-full bg-neon text-sm font-extrabold uppercase tracking-widest text-abyss transition hover:scale-[1.02] hover:brightness-110 disabled:opacity-50 disabled:hover:scale-100";

export function CheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerPhone: "", requestedDate: "", passengerCount: 1, occasion: "" });
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

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const availability = await checkoutApi.availability(form.requestedDate);
      if (!availability.available) throw new Error(availability.message);
      const result = await checkoutApi.start({ ...form, termsAccepted, termsVersion: TERMS_VERSION });
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
      setError(err instanceof Error ? err.message : "Código inválido.");
    } finally {
      setLoading(false);
    }
  };

  const submitPay = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!bookingId) return;
    setError(null);
    setLoading(true);
    try {
      const result = await checkoutApi.pay(bookingId, payment);
      setPayResult({ invoiceUrl: result.invoiceUrl, pix: result.pix });
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar cobrança.");
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
              {step === "pay" && "3. Sinal da reserva"}
              {step === "success" && "Reserva iniciada"}
            </p>
            <h2 className="mt-1 font-display text-xl font-bold text-white">Reservar Lancha Bêju</h2>
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
            <form onSubmit={submitForm} className="flex flex-col gap-4">
              <label className={labelClass}>
                <span className="font-bold text-white/70">Nome completo</span>
                <input
                  required
                  value={form.customerName}
                  onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                  className={inputClass}
                  placeholder="Seu nome"
                />
              </label>
              <label className={labelClass}>
                <span className="font-bold text-white/70">Email</span>
                <input
                  required
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                  className={inputClass}
                  placeholder="voce@email.com"
                />
              </label>
              <label className={labelClass}>
                <span className="font-bold text-white/70">WhatsApp</span>
                <input
                  required
                  value={form.customerPhone}
                  onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                  className={inputClass}
                  placeholder="(61) 99999-9999"
                />
              </label>
              <label className={labelClass}>
                <span className="font-bold text-white/70">Data desejada</span>
                <input
                  required
                  type="date"
                  value={form.requestedDate}
                  onChange={(e) => setForm((f) => ({ ...f, requestedDate: e.target.value }))}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                <span className="font-bold text-white/70">Quantidade de pessoas</span>
                <input
                  required
                  type="number"
                  min={1}
                  max={9}
                  value={form.passengerCount}
                  onChange={(e) => setForm((f) => ({ ...f, passengerCount: Number(e.target.value) }))}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                <span className="font-bold text-white/70">Ocasião</span>
                <input
                  value={form.occasion}
                  onChange={(e) => setForm((f) => ({ ...f, occasion: e.target.value }))}
                  className={inputClass}
                  placeholder="Aniversário, família, ensaio..."
                />
              </label>
              <label className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-neon"
                />
                <span>
                  Li e aceito os termos da reserva: <strong className="text-white/90">{bookingPolicy.deposit}</strong> {bookingPolicy.cancellation}{" "}
                  {bookingPolicy.included}
                </span>
              </label>
              <button type="submit" disabled={loading || !termsAccepted} className={buttonClass}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Enviar código de confirmação
              </button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={submitVerify} className="flex flex-col gap-4">
              <p className="text-sm text-white/60">
                Mandamos um código de 6 dígitos para <strong className="text-white">{form.customerEmail}</strong>. Confira sua caixa de
                entrada (e o spam).
              </p>
              {devCode && (
                <p className="rounded-xl border border-neon/30 bg-neon/10 px-4 py-2 text-xs font-bold text-neon">
                  Modo desenvolvimento: código = {devCode} (envio de email não configurado ainda)
                </p>
              )}
              <label className={labelClass}>
                <span className="font-bold text-white/70">Código de 6 dígitos</span>
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
                Confirmar código
              </button>
            </form>
          )}

          {step === "pay" && (
            <form onSubmit={submitPay} className="flex flex-col gap-4">
              <p className="text-sm text-white/60">
                Sinal de 50% para garantir sua data: <strong className="text-white">R$ {(boatPackage.price / 2).toFixed(2)}</strong>.{" "}
                {bookingPolicy.cancellation}
              </p>
              <label className={labelClass}>
                <span className="font-bold text-white/70">CPF ou CNPJ</span>
                <input
                  required
                  value={payment.cpfCnpj}
                  onChange={(e) => setPayment((p) => ({ ...p, cpfCnpj: e.target.value.replace(/\D/g, "") }))}
                  className={inputClass}
                  placeholder="Só números"
                />
              </label>
              <label className={labelClass}>
                <span className="font-bold text-white/70">Forma de pagamento</span>
                <select
                  value={payment.billingType}
                  onChange={(e) => setPayment((p) => ({ ...p, billingType: e.target.value as typeof p.billingType }))}
                  className={inputClass}
                >
                  <option value="PIX">Pix</option>
                  <option value="CREDIT_CARD">Cartão de crédito</option>
                  <option value="BOLETO">Boleto</option>
                </select>
              </label>
              <button type="submit" disabled={loading} className={buttonClass}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Gerar cobrança do sinal
              </button>
            </form>
          )}

          {step === "success" && payResult && (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-neon" />
              <p className="text-sm text-white/70">
                Cobrança gerada! Assim que o pagamento cair, sua reserva é confirmada automaticamente e você recebe a confirmação por
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
                Abrir página de pagamento
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

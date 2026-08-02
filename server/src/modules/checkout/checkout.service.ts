import { BadRequestException, Injectable } from '@nestjs/common';
import { BookingsService } from '../bookings/bookings.service';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { AsaasService } from '../asaas/asaas.service';
import { StartCheckoutDto } from './dto/start-checkout.dto';
import { PayDto } from './dto/pay.dto';

// SENIOR (2026-08-01, "finalizarmos a compra toda pelo site... simples e
// funcional, checkout para o banco asaas"): orquestra as 3 etapas em ordem -
// 1) cria a reserva (pending_verification) e dispara o código por email;
// 2) confirma o código -> libera pagamento (awaiting_payment);
// 3) gera a cobrança Asaas do SINAL (50%, nunca o valor cheio) - a reserva
// só vira "confirmed" quando o webhook do Asaas confirmar o pagamento
// (ver asaas.controller.ts), nunca antes disso. Mesma regra de ouro do
// Viver Bem: o site não fecha venda sozinho, quem confirma é o gateway.
@Injectable()
export class CheckoutService {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly emailVerification: EmailVerificationService,
    private readonly asaas: AsaasService,
  ) {}

  async start(dto: StartCheckoutDto) {
    const available = await this.bookingsService.isDateAvailable(dto.requestedDate);
    if (!available) {
      throw new BadRequestException('Essa data não está disponível no momento. Escolha outra data.');
    }

    const holdExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const booking = await this.bookingsService.create({
      customerName: dto.customerName,
      customerEmail: dto.customerEmail.toLowerCase().trim(),
      customerPhone: dto.customerPhone,
      requestedDate: dto.requestedDate,
      passengerCount: dto.passengerCount,
      occasion: dto.occasion,
      status: 'pending_verification',
      holdExpiresAt,
      // SENIOR (2026-08-02): DTO já garante termsAccepted === true (ver
      // @Equals no StartCheckoutDto) - aqui só registra a EVIDÊNCIA
      // (versão + quando), pro painel gestor conseguir mostrar quem aceitou.
      termsAcceptedVersion: dto.termsVersion,
      termsAcceptedAt: new Date(),
    });

    const { sent, devCode } = await this.emailVerification.sendCode(booking.customerEmail, booking.id);

    return {
      bookingId: booking.id,
      emailSent: sent,
      // devCode só vem preenchido fora de produção (ver EmailVerificationService) -
      // permite testar o fluxo ponta a ponta sem Resend configurado.
      devCode,
    };
  }

  async verifyEmail(bookingId: string, code: string) {
    const booking = await this.bookingsService.findByIdOrFail(bookingId);
    await this.emailVerification.verifyCode(booking.customerEmail, code);
    return this.bookingsService.update(bookingId, { emailVerified: true, status: 'awaiting_payment' });
  }

  async pay(bookingId: string, dto: PayDto) {
    const booking = await this.bookingsService.findByIdOrFail(bookingId);

    if (!booking.emailVerified) {
      throw new BadRequestException('Confirme o email antes de pagar.');
    }
    if (booking.status === 'confirmed') {
      throw new BadRequestException('Essa reserva já está confirmada.');
    }
    if (booking.holdExpiresAt && booking.holdExpiresAt <= new Date()) {
      const available = await this.bookingsService.isDateAvailable(booking.requestedDate, booking.id);
      if (!available) {
        await this.bookingsService.setStatus(booking.id, 'canceled');
        throw new BadRequestException('O prazo dessa reserva expirou e a data não está mais disponível. Escolha outra data.');
      }
      await this.bookingsService.update(booking.id, { holdExpiresAt: new Date(Date.now() + 30 * 60 * 1000) });
    }

    const asaasCustomerId = await this.asaas.createCustomer({
      name: booking.customerName,
      cpfCnpj: dto.cpfCnpj,
      email: booking.customerEmail,
      phone: booking.customerPhone,
    });

    const payment = await this.asaas.createPayment({
      customerId: asaasCustomerId,
      billingType: dto.billingType,
      value: booking.depositAmountCents / 100,
      description: `Sinal (50%) - Passeio Lancha Bêju em ${booking.requestedDate}`,
      externalReference: booking.id,
    });

    await this.bookingsService.update(bookingId, {
      asaasCustomerId,
      asaasPaymentId: payment.id,
      paymentInvoiceUrl: payment.invoiceUrl,
      customerCpf: dto.cpfCnpj,
    });

    return {
      paymentId: payment.id,
      invoiceUrl: payment.invoiceUrl,
      status: payment.status,
      pix: dto.billingType === 'PIX' ? { encodedImage: payment.encodedImage, payload: payment.payload } : undefined,
    };
  }

  async status(bookingId: string) {
    const booking = await this.bookingsService.findByIdOrFail(bookingId);
    return {
      id: booking.id,
      status: booking.status,
      emailVerified: booking.emailVerified,
      paymentInvoiceUrl: booking.paymentInvoiceUrl,
    };
  }

  // Chamado pelo AsaasController quando o webhook confirma o pagamento.
  async confirmPaymentByExternalReference(bookingId: string) {
    return this.bookingsService.setStatus(bookingId, 'confirmed');
  }
}

import { Body, Controller, Logger, Post } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { BookingsService } from '../bookings/bookings.service';

const CONFIRMED_EVENTS = new Set(['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED']);

// SENIOR: endpoint que o ASAAS chama sozinho quando o pagamento muda de
// status (configurar em asaas.com > Integrações > Webhooks, apontando pra
// https://SEU-DOMINIO/webhooks/asaas). É a ÚNICA fonte de verdade que
// confirma uma reserva - o frontend nunca marca "pago" sozinho.
@Controller('webhooks/asaas')
export class AsaasWebhookController {
  private readonly logger = new Logger(AsaasWebhookController.name);

  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly bookingsService: BookingsService,
  ) {}

  @Post()
  async handle(@Body() payload: any) {
    const event = payload?.event;
    const payment = payload?.payment;
    const bookingId = payment?.externalReference;

    if (!bookingId) {
      this.logger.warn(`Webhook Asaas sem externalReference. Evento: ${event}`);
      return { received: true };
    }

    if (CONFIRMED_EVENTS.has(event)) {
      const booking = await this.bookingsService.findByAsaasPaymentId(payment.id).catch(() => null);
      if (!booking) {
        this.logger.warn(`Webhook Asaas: pagamento ${payment.id} não corresponde a nenhuma reserva conhecida.`);
        return { received: true };
      }
      await this.checkoutService.confirmPaymentByExternalReference(bookingId);
      this.logger.log(`Reserva ${bookingId} confirmada via webhook Asaas (${event}).`);
    }

    return { received: true };
  }
}

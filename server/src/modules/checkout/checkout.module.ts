import { Module } from '@nestjs/common';
import { BookingsModule } from '../bookings/bookings.module';
import { EmailVerificationModule } from '../email-verification/email-verification.module';
import { AsaasModule } from '../asaas/asaas.module';
import { PartnersModule } from '../partners/partners.module';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { AsaasWebhookController } from './asaas-webhook.controller';

@Module({
  imports: [BookingsModule, EmailVerificationModule, AsaasModule, PartnersModule],
  providers: [CheckoutService],
  controllers: [CheckoutController, AsaasWebhookController],
})
export class CheckoutModule {}

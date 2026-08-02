import { Module } from '@nestjs/common';
import { BookingsModule } from '../bookings/bookings.module';
import { EmailVerificationModule } from '../email-verification/email-verification.module';
import { AsaasModule } from '../asaas/asaas.module';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { AsaasWebhookController } from './asaas-webhook.controller';

@Module({
  imports: [BookingsModule, EmailVerificationModule, AsaasModule],
  providers: [CheckoutService],
  controllers: [CheckoutController, AsaasWebhookController],
})
export class CheckoutModule {}

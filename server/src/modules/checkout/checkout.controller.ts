import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { StartCheckoutDto } from './dto/start-checkout.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { PayDto } from './dto/pay.dto';

// Tudo público de propósito - é o fluxo que o cliente final usa no site,
// sem estar logado. O que precisa de segurança (JWT) é o painel gestor
// (BookingsController), não este.
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('start')
  start(@Body() dto: StartCheckoutDto) {
    return this.checkoutService.start(dto);
  }

  @Post(':bookingId/verify-email')
  verifyEmail(@Param('bookingId') bookingId: string, @Body() dto: VerifyEmailDto) {
    return this.checkoutService.verifyEmail(bookingId, dto.code);
  }

  @Post(':bookingId/pay')
  pay(@Param('bookingId') bookingId: string, @Body() dto: PayDto) {
    return this.checkoutService.pay(bookingId, dto);
  }

  @Get(':bookingId/status')
  status(@Param('bookingId') bookingId: string) {
    return this.checkoutService.status(bookingId);
  }
}

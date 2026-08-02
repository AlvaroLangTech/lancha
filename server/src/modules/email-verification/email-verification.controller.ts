import { Body, Controller, Post } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { SendCodeDto } from './dto/send-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';

@Controller('email-verification')
export class EmailVerificationController {
  constructor(private readonly service: EmailVerificationService) {}

  @Post('send')
  send(@Body() dto: SendCodeDto) {
    return this.service.sendCode(dto.email, dto.bookingId);
  }

  @Post('verify')
  async verify(@Body() dto: VerifyCodeDto) {
    const ok = await this.service.verifyCode(dto.email, dto.code);
    return { verified: ok };
  }
}

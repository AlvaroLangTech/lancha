import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationCode } from './email-verification-code.entity';
import { EmailVerificationService } from './email-verification.service';
import { EmailVerificationController } from './email-verification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmailVerificationCode])],
  providers: [EmailVerificationService],
  controllers: [EmailVerificationController],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}

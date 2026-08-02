import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailVerificationCode } from './email-verification-code.entity';

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);
  private readonly resend: Resend | null;
  private readonly emailFrom: string;

  constructor(
    @InjectRepository(EmailVerificationCode) private readonly codes: Repository<EmailVerificationCode>,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.emailFrom = this.config.get<string>('EMAIL_FROM') || 'Lancha Bêju <onboarding@resend.dev>';
  }

  private generateCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  async sendCode(email: string, bookingId?: string): Promise<{ sent: boolean; devCode?: string }> {
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

    const entry = this.codes.create({ email: email.toLowerCase().trim(), code, bookingId, expiresAt });
    await this.codes.save(entry);

    if (!this.resend) {
      // SENIOR: sem RESEND_API_KEY configurada (ex: dev local), não quebra o
      // fluxo - loga o código no console e devolve em "devCode" só em
      // ambiente não-produção, pra dar pra testar o checkout ponta a ponta
      // sem precisar de conta de email configurada.
      this.logger.warn(`RESEND_API_KEY não configurada. Código de verificação para ${email}: ${code}`);
      const isProd = this.config.get<string>('NODE_ENV') === 'production';
      return { sent: false, devCode: isProd ? undefined : code };
    }

    try {
      await this.resend.emails.send({
        from: this.emailFrom,
        to: email,
        subject: 'Seu código de verificação - Lancha Bêju',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #141414;">Confirme seu email</h2>
            <p>Use o código abaixo pra confirmar sua reserva na Lancha Bêju:</p>
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2ee6c8;">${code}</p>
            <p style="color: #666; font-size: 13px;">Válido por ${CODE_TTL_MINUTES} minutos. Se não foi você, ignore este email.</p>
          </div>
        `,
      });
      return { sent: true };
    } catch (error: any) {
      this.logger.error('Falha ao enviar email de verificação', error.message);
      throw new BadRequestException('Não foi possível enviar o código de verificação. Tente novamente.');
    }
  }

  async verifyCode(email: string, code: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const entry = await this.codes.findOne({
      where: { email: normalizedEmail, verified: false },
      order: { createdAt: 'DESC' },
    });

    if (!entry) throw new BadRequestException('Nenhum código pendente para esse email. Solicite um novo.');
    if (entry.expiresAt < new Date()) throw new BadRequestException('Código expirado. Solicite um novo.');
    if (entry.attempts >= MAX_ATTEMPTS) throw new BadRequestException('Muitas tentativas. Solicite um novo código.');

    if (entry.code !== code.trim()) {
      entry.attempts += 1;
      await this.codes.save(entry);
      throw new BadRequestException('Código incorreto.');
    }

    entry.verified = true;
    await this.codes.save(entry);
    return true;
  }

  // Cron simples poderia limpar códigos expirados; v1 deixa por conta do
  // TTL na query (não afeta funcionamento, só acumula linhas antigas).
  async purgeExpired() {
    await this.codes.delete({ expiresAt: LessThan(new Date()) });
  }
}

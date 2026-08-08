import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AdminUser } from './admin-user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminUser) private readonly adminUsers: Repository<AdminUser>,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.adminUsers.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) throw new UnauthorizedException('Email ou senha inválidos.');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Email ou senha inválidos.');

    const token = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role });
    return {
      token,
      user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
    };
  }

  // SENIOR (2026-08-06, bug real do Alvaro: rodou seed-admin.ts de novo pra
  // trocar a senha e caiu em "UNIQUE constraint failed: admin_users.email"
  // porque o email já existia de uma rodada anterior): agora é upsert - se
  // o email já existe, ATUALIZA a senha/nome em vez de quebrar. Script fica
  // seguro de rodar de novo a qualquer momento (mesmo padrão do
  // seed-partners.ts, que já pulava cupom duplicado sem crashar).
  async createAdmin(email: string, password: string, displayName?: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 10);
    const existing = await this.adminUsers.findOne({ where: { email: normalizedEmail } });

    if (existing) {
      await this.adminUsers.update(existing.id, { passwordHash, displayName });
      return { ...existing, passwordHash, displayName };
    }

    const user = this.adminUsers.create({ email: normalizedEmail, passwordHash, displayName });
    return this.adminUsers.save(user);
  }
}

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

  // SENIOR: usado só pra criar o primeiro admin (via seed/script), não é
  // exposto como endpoint público - senão qualquer um vira admin.
  async createAdmin(email: string, password: string, displayName?: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.adminUsers.create({ email: email.toLowerCase().trim(), passwordHash, displayName });
    return this.adminUsers.save(user);
  }
}

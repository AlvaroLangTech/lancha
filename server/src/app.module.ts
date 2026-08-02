import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AdminUser } from './modules/auth/admin-user.entity';
import { AuthModule } from './modules/auth/auth.module';
import { Booking } from './modules/bookings/booking.entity';
import { BookingsModule } from './modules/bookings/bookings.module';
import { Lead } from './modules/leads/lead.entity';
import { LeadsModule } from './modules/leads/leads.module';
import { EmailVerificationCode } from './modules/email-verification/email-verification-code.entity';
import { EmailVerificationModule } from './modules/email-verification/email-verification.module';
import { AsaasModule } from './modules/asaas/asaas.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { ChatModule } from './modules/chat/chat.module';

// SENIOR (2026-08-01): backend novo e dedicado pra Lancha Beju - NAO e
// multi-tenant (um negocio so), entao sem TenantMiddleware/x-tenant-slug
// que o Viver Bem precisa. Mesma logica de banco (SQLite em dev, Postgres
// em producao via DB_URL) copiada de la, testada e funcionando.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 300 }]),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const dbType = cfg.get<string>('DB_TYPE') || 'better-sqlite3';
        const entities = [AdminUser, Booking, Lead, EmailVerificationCode];

        if (dbType === 'postgres') {
          const url = cfg.get<string>('DB_URL');
          return {
            type: 'postgres' as const,
            url,
            ssl: { rejectUnauthorized: false },
            entities,
            synchronize: cfg.get<string>('SYNC_SCHEMA') === 'true', // JAMAIS true no servidor normal; usado só pelo sync-schema.ts
          };
        }

        return {
          type: 'better-sqlite3' as const,
          database: cfg.get<string>('DB_DATABASE') ?? 'dev.sqlite',
          entities,
          synchronize: cfg.get('NODE_ENV') !== 'production',
          logging: cfg.get('NODE_ENV') === 'development',
        };
      },
    }),

    AuthModule,
    BookingsModule,
    LeadsModule,
    EmailVerificationModule,
    AsaasModule,
    CheckoutModule,
    ChatModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

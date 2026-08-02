import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

// SENIOR (2026-08-01, pedido do Alvaro: "finalizarmos a compra toda pelo
// site... simples e funcional"): backend novo, dedicado so pra Lancha Beju -
// segue o MESMO padrao comprovado do server/ do Viver Bem (NestJS +
// TypeORM), mas sem o TenantMiddleware/multi-empresa de la, porque aqui e
// UM negocio so. Rodando em porta propria (3101, ver .env.example) - nao
// tem NENHUMA relacao de runtime com o backend do Viver Bem, so reaproveita
// o padrao de codigo.
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const expressApp = app.getHttpAdapter().getInstance();
  (expressApp as any).set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    }),
  );

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const isAllowed =
        !origin ||
        /^https?:\/\/([a-z0-9-]+\.)*lanchabeju\.com\.br$/.test(origin) ||
        /^https?:\/\/localhost:\d+$/.test(origin) ||
        /^https?:\/\/127\.0\.0\.1:\d+$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Bloqueado pelo CORS: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    maxAge: 3600,
  });

  app.getHttpAdapter().get('/health', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3101;
  await app.listen(port);
  console.log(`🚤 Lancha Bêju API rodando em http://localhost:${port}`);
}

bootstrap();

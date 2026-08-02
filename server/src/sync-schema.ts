import { NestFactory } from '@nestjs/core';

// SENIOR (2026-08-02, banco Postgres novo no Neon): esse backend nunca teve
// migração de banco - hoje as tabelas só existem porque em desenvolvimento
// o TypeORM cria elas sozinho (synchronize: true, ver condição em
// app.module.ts). Em produção isso fica desligado de propósito
// (synchronize: false - "JAMAIS true em produção", pra nunca alterar schema
// com dado real sem controle), mas sem nenhuma migração pra substituir, um
// banco Postgres novo (Neon) fica vazio e a API quebra na primeira consulta
// (nenhuma tabela existe: bookings, leads, admin_users,
// email_verification_codes).
//
// Esse script roda o synchronize UMA VEZ, manualmente, contra o banco que
// DB_URL apontar no momento em que ele roda - usa as MESMAS entidades reais
// do app (Booking, Lead, AdminUser, EmailVerificationCode), então não tem
// risco de divergência de uma migração escrita à mão. Depois de rodar, as
// tabelas existem e o servidor normal (com synchronize: false, seguro pra
// sempre) funciona por cima delas. Não roda isso automaticamente no boot do
// servidor de propósito - só quando alguém decide rodar, uma vez,
// conscientemente, com o banco novo já em mãos.
//
// Uso (defina DB_TYPE=postgres e DB_URL - a connection string do Neon -
// antes de rodar, mesmo que só nessa linha de comando, sem precisar mexer
// no .env ainda):
//
//   cd server
//   DB_TYPE=postgres DB_URL="postgresql://usuario:senha@host/banco?sslmode=require" npx ts-node src/sync-schema.ts
//
// No Windows (PowerShell):
//   cd server
//   $env:DB_TYPE="postgres"; $env:DB_URL="postgresql://usuario:senha@host/banco?sslmode=require"; npx ts-node src/sync-schema.ts
//
// Depois de confirmar "Tabelas sincronizadas com sucesso" abaixo, aí sim
// adicionar DB_TYPE e DB_URL no server/.env de produção de verdade (na VPS)
// e reiniciar o servidor normal - ele vai encontrar as tabelas já prontas.
async function run() {
  if (!process.env.DB_URL) {
    console.error('Defina DB_URL (a connection string do Neon) antes de rodar este script. Ver comentário no topo deste arquivo.');
    process.exit(1);
  }
  if (process.env.DB_TYPE !== 'postgres') {
    console.error('Defina DB_TYPE=postgres antes de rodar este script.');
    process.exit(1);
  }

  // Força synchronize=true só pra ESSE processo (ver condição em
  // app.module.ts: `synchronize: cfg.get('NODE_ENV') !== 'production'`) -
  // não muda nada no servidor real, que continua lendo o NODE_ENV
  // verdadeiro do seu próprio .env quando ele sobe normalmente.
  process.env.NODE_ENV = 'development';
  process.env.SYNC_SCHEMA = 'true';

  const { AppModule } = await import('./app.module');
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('Tabelas sincronizadas com sucesso no banco configurado em DB_URL.');
  await app.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Falha ao sincronizar o schema:', err);
  process.exit(1);
});

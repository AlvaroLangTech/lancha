import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PartnersService } from './modules/partners/partners.service';

// SENIOR (2026-08-05, pedido do Alvaro: "ja faça o cupom para as meninas"):
// cadastro em lote das primeiras parceiras do programa de indicação. Mesmo
// padrão do seed-admin.ts - roda uma vez, local ou na VPS, contra o banco
// que estiver configurado no momento (dev.sqlite local, ou Postgres de
// produção se DB_URL estiver setado):
//
//   cd server
//   npx ts-node src/seed-partners.ts
//
// Pode rodar de novo sem problema - cupom já existente é pulado (não
// duplica, não quebra o script).
const PARTNERS: { name: string; couponCode: string }[] = [
  { name: 'Aline', couponCode: 'ALINE10' },
  { name: 'Ashley', couponCode: 'ASHLEY10' },
  { name: 'Bessa', couponCode: 'BESSA10' },
  { name: 'Gabi Prado', couponCode: 'GABIPRADO10' },
  { name: 'Hamile', couponCode: 'HAMILE10' },
  { name: 'Kawine', couponCode: 'KAWINE10' },
  { name: 'Larissa', couponCode: 'LARISSA10' },
  { name: 'Nalanda', couponCode: 'NALANDA10' },
  { name: 'Vitória Noronha', couponCode: 'VITORIANORONHA10' },
  { name: 'Ana Luísa', couponCode: 'ANALUISA10' },
  { name: 'Pat Ribeiro', couponCode: 'PATRIBEIRO10' },
  // SENIOR (2026-08-06, pedido do Alvaro: "entrou mais modelos"): 3 novas.
  { name: 'Laura', couponCode: 'LAURA10' },
  { name: 'Giulia', couponCode: 'GIULIA10' },
  { name: 'Kanandra', couponCode: 'KANANDRA10' },
];

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const partnersService = app.get(PartnersService);

  for (const entry of PARTNERS) {
    try {
      const created = await partnersService.create(entry);
      console.log(`Criada: ${created.name} - cupom ${created.couponCode}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/unique|duplicate/i.test(message)) {
        console.log(`Já existia: ${entry.name} (cupom ${entry.couponCode}) - pulado.`);
      } else {
        console.error(`Erro ao criar ${entry.name}:`, message);
      }
    }
  }

  await app.close();
  console.log('Concluído.');
}

run();

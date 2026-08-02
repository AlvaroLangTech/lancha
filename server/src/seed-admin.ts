import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './modules/auth/auth.service';

// SENIOR: cria o primeiro usuário do painel gestor. Não existe endpoint
// público de cadastro de propósito (senão qualquer um vira admin) - roda
// isso uma vez, localmente ou no servidor:
//   npx ts-node src/seed-admin.ts alvaro@lanchabeju.com.br "senha-forte-aqui" "Alvaro"
async function run() {
  const [, , email, password, displayName] = process.argv;
  if (!email || !password) {
    console.error('Uso: npx ts-node src/seed-admin.ts <email> <senha> [nome]');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);
  const user = await authService.createAdmin(email, password, displayName);
  console.log(`Admin criado: ${user.email} (id: ${user.id})`);
  await app.close();
}

run();

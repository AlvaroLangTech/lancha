import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './modules/auth/auth.service';

// SENIOR: cria (ou atualiza a senha de) o admin do painel gestor. Não existe
// endpoint público de cadastro de propósito (senão qualquer um vira admin) -
// pode rodar de novo a qualquer momento pra trocar a senha, é seguro (ver
// AuthService.createAdmin - upsert por email):
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
  console.log(`Admin pronto: ${user.email} (id: ${user.id}) - senha atualizada pra o valor que voce acabou de digitar.`);
  await app.close();
}

run();

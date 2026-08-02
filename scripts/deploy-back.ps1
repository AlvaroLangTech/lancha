# --- CONFIGURACAO ---
# SENIOR (2026-08-01, "docker, script, tudo facil pra dar deploy em prod"):
# mesmo padrao comprovado do deploy-back.ps1 do Viver Bem (tar exclui o que
# e "dado ao vivo" no servidor - node_modules, dist, .env, dev.sqlite -
# manda so codigo, faz o servidor reconstruir a imagem Docker e reiniciar).
#
# ATENCAO - SETUP UNICO (rodar 1x na VPS antes do primeiro deploy, ver
# instrucoes completas no final deste arquivo): esse script assume que ja
# existe no servidor um usuario "lancha-server" com a pasta
# /home/lancha-server/apps/docker-lancha/ e um arquivo server/.env preenchido
# la dentro (com DB_URL do Postgres, ASAAS_API_KEY, RESEND_API_KEY, JWT_SECRET
# reais de producao - esse .env NUNCA e commitado nem enviado por este
# script, e "dado ao vivo" so do servidor, igual o Viver Bem).
$USER = "lancha-server"
$HOST_IP = "168.231.100.16"
$REMOTE_PATH = "/home/lancha-server/apps/docker-lancha"
$FILE_NAME = "lancha_backend_deploy.tar.gz"
# Uso: .\scripts\deploy-back.ps1

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   DEPLOY BACKEND - Lancha Beju" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Compactando pasta server..." -ForegroundColor Yellow
tar -czf $FILE_NAME `
  --exclude="server/node_modules" `
  --exclude="server/dist" `
  --exclude="server/.env" `
  --exclude="server/dev.sqlite" `
  server docker-compose.yml

if (-not (Test-Path $FILE_NAME)) {
    Write-Host "ERRO: Falha ao compactar. Verifique se a pasta server/ existe." -ForegroundColor Red
    exit 1
}

Write-Host "[2/4] Enviando pacote via SCP..." -ForegroundColor Yellow
scp $FILE_NAME "$USER@$($HOST_IP):$REMOTE_PATH/"

Write-Host "[3/4] Extraindo e reiniciando Docker no servidor..." -ForegroundColor Cyan
$REMOTE_COMMAND = "cd $REMOTE_PATH && tar --no-same-owner --no-same-permissions -xzf $FILE_NAME && rm $FILE_NAME && docker-compose down && docker-compose up -d --build && docker ps"
ssh "$USER@$HOST_IP" $REMOTE_COMMAND

Write-Host "[4/4] Limpeza local..." -ForegroundColor Yellow
Remove-Item $FILE_NAME

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "   DEPLOY CONCLUIDO!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Testar: curl http://$($HOST_IP):3101/health" -ForegroundColor White
Write-Host ""

<#
SETUP UNICO NA VPS (rodar so na primeira vez, antes de usar este script):

1. Criar o usuario e as pastas (como root ou outro usuario com sudo):
   adduser --disabled-password --gecos "" lancha-server
   mkdir -p /home/lancha-server/apps/docker-lancha
   chown -R lancha-server:lancha-server /home/lancha-server

2. Copiar sua chave SSH publica pra esse usuario poder receber
   scp/ssh sem senha (mesmo esquema do viverbem-server/laboratorio-bot):
   rsync --archive --chown=lancha-server:lancha-server ~/.ssh /home/lancha-server

3. Como o usuario lancha-server, instalar docker (se a VPS ja tem Docker
   instalado globalmente, so garantir que o usuario esta no grupo docker):
   usermod -aG docker lancha-server

4. Criar o arquivo de producao (nunca commitado):
   /home/lancha-server/apps/docker-lancha/server/.env
   - copiar o conteudo de server/.env.example e preencher:
     DB_TYPE=postgres
     DB_URL=<connection string do Postgres/Supabase>
     JWT_SECRET=<string aleatoria longa>
     ASAAS_API_KEY=<chave de producao do Asaas da Lancha>
     ASAAS_ENV=production
     RESEND_API_KEY=<chave do Resend>
     EMAIL_FROM="Lancha Bêju <reservas@lanchabeju.com.br>"
     FRONTEND_URL=https://lanchabeju.com.br

5. Rodar o seed do primeiro admin (uma vez, depois do primeiro deploy):
   ssh lancha-server@168.231.100.16 "cd /home/lancha-server/apps/docker-lancha/server && docker-compose exec backend node dist/seed-admin.js seu@email.com 'senha-forte'"

Depois desse setup, ./scripts/deploy-back.ps1 fica sendo o unico comando
necessario pra cada deploy seguinte.
#>

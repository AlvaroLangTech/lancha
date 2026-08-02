# Deploy FRONTEND - Lancha Beju (Hostinger/CloudPanel Node.js)
#
# Este script envia o codigo do frontend para a VPS e roda build Node/Nitro.
# Requer setup previo no servidor:
# - usuario SSH com acesso ao REMOTE_PATH
# - Node 22+
# - app/site Node.js no CloudPanel apontando para REMOTE_PATH
# - variaveis no CloudPanel: NITRO_PRESET=node, NEXT_PUBLIC_SITE_URL,
#   NEXT_PUBLIC_LANCHA_API_URL, PORT=3010 (se CloudPanel exigir porta fixa)
#
# Ajuste USER/HOST_IP/REMOTE_PATH conforme o servidor final.

$USER = "lanchabeju"
$HOST_IP = "168.231.100.16"
$REMOTE_PATH = "/home/lanchabeju/htdocs/lanchabeju.com.br"
$FILE_NAME = "lancha_frontend_deploy.tar.gz"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   DEPLOY FRONTEND - Lancha Beju" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/5] Build local Node/Nitro..." -ForegroundColor Yellow
$env:NITRO_PRESET = "node"
npm run build:node
if ($LASTEXITCODE -ne 0) {
  Write-Host "ERRO: build:node falhou. Deploy cancelado." -ForegroundColor Red
  exit 1
}

Write-Host "[2/5] Compactando fonte do frontend..." -ForegroundColor Yellow
tar -czf $FILE_NAME `
  --exclude="node_modules" `
  --exclude=".output" `
  --exclude=".vinext" `
  --exclude=".wrangler" `
  --exclude=".env" `
  --exclude="server/node_modules" `
  --exclude="server/dist" `
  --exclude="server/.env" `
  app public worker build scripts docs tests package.json package-lock.json tsconfig.json vite.config.ts next.config.ts postcss.config.mjs eslint.config.mjs .env.example

if (-not (Test-Path $FILE_NAME)) {
  Write-Host "ERRO: falha ao compactar frontend." -ForegroundColor Red
  exit 1
}

Write-Host "[3/5] Enviando pacote via SCP..." -ForegroundColor Yellow
ssh "$USER@$HOST_IP" "mkdir -p $REMOTE_PATH"
scp $FILE_NAME "$USER@$($HOST_IP):$REMOTE_PATH/"
if ($LASTEXITCODE -ne 0) {
  Write-Host "ERRO: scp falhou." -ForegroundColor Red
  Remove-Item $FILE_NAME -ErrorAction SilentlyContinue
  exit 1
}

Write-Host "[4/5] Instalando e buildando no servidor..." -ForegroundColor Cyan
$REMOTE_COMMAND = "cd $REMOTE_PATH && tar --no-same-owner --no-same-permissions -xzf $FILE_NAME && rm $FILE_NAME && npm install && NITRO_PRESET=node npm run build:node"
ssh "$USER@$HOST_IP" $REMOTE_COMMAND
if ($LASTEXITCODE -ne 0) {
  Write-Host "ERRO: build remoto falhou." -ForegroundColor Red
  Remove-Item $FILE_NAME -ErrorAction SilentlyContinue
  exit 1
}

Write-Host "[5/5] Limpeza local..." -ForegroundColor Yellow
Remove-Item $FILE_NAME -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "   FRONTEND ENVIADO E BUILDADO!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "No CloudPanel, reinicie o app Node.js se ele nao reiniciar automaticamente." -ForegroundColor White
Write-Host "Comando de start esperado: npm run start:node" -ForegroundColor White
Write-Host ""

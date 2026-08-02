# Deploy Hostinger / CloudPanel - Lancha Beju

Status em 2026-08-02: configurado e parcialmente validado.

Validado localmente:
- `npm install` concluiu.
- `npm run build:node` concluiu e gerou `.output/server/index.mjs`.
- `npm run build` padrao tambem concluiu.
- Backend NestJS compila com `npm run build` em `server/`.
- Backend tem `server/Dockerfile` e `docker-compose.yml`.
- Script backend existe: `scripts/deploy-back.ps1`.
- Script frontend inicial criado: `scripts/deploy-front-cloudpanel.ps1`.

Pendente antes de apontar producao:
- Validar `npm run start:node` como processo persistente no Linux/CloudPanel. No Windows local, o entrypoint Nitro gerado saiu sem erro imediato apesar de conter `serve({ port })`; pode ser detalhe do Nitro beta/ambiente local, mas precisa ser confirmado no servidor.
- Configurar variaveis reais de producao.
- Criar primeiro admin com seed.
- Configurar webhook Asaas.
- Testar pagamento real/sandbox ponta a ponta.

## Arquitetura recomendada

Frontend:
- CloudPanel site tipo Node.js.
- Build: `npm install && npm run build:node`.
- Start: `npm run start:node`.
- Variaveis: `NITRO_PRESET=node`, `NEXT_PUBLIC_SITE_URL=https://lanchabeju.com.br`, `NEXT_PUBLIC_LANCHA_API_URL=https://api.lanchabeju.com.br`.

Backend:
- Preferencia: Docker com `server/Dockerfile` + `docker-compose.yml`.
- Porta interna: `3101`.
- Healthcheck: `/health`.
- Variaveis em `server/.env` no servidor, nunca no git:
  - `PORT=3101`
  - `NODE_ENV=production`
  - `DB_TYPE=postgres`
  - `DB_URL=...`
  - `JWT_SECRET=...`
  - `ASAAS_API_KEY=...`
  - `ASAAS_ENV=production`
  - `RESEND_API_KEY=...`
  - `EMAIL_FROM="Lancha Beju <reservas@lanchabeju.com.br>"`
  - `FRONTEND_URL=https://lanchabeju.com.br`
  - `GROQ_API_KEY=...` opcional para IA livre no chat

Bot WhatsApp:
- Configurar `LANCHA_API_BASE_URL=https://api.lanchabeju.com.br` no `.env` do bot.
- Reiniciar o bot depois do deploy.

## Dominio e DNS

Registrar o dominio na Hostinger nao basta sozinho. Depois precisa:
- `lanchabeju.com.br` apontando para o frontend no CloudPanel.
- `api.lanchabeju.com.br` apontando para o backend no CloudPanel/VPS.
- SSL ativo nos dois hosts.
- Asaas webhook apontando para `https://api.lanchabeju.com.br/webhooks/asaas`.

DNS simples:
- Registro A `@` -> IP do CloudPanel.
- Registro A `www` -> IP do CloudPanel ou CNAME para `@`.
- Registro A `api` -> IP do CloudPanel/backend.

## Scripts

Backend:
```powershell
.\scripts\deploy-back.ps1
```

Frontend:
```powershell
.\scripts\deploy-front-cloudpanel.ps1
```

Ajustar `USER`, `HOST_IP` e `REMOTE_PATH` nos scripts se o servidor final for diferente.
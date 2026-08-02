# Fase 1 - Inventario tecnico da API

## Objetivo

Entender a API existente antes de reaproveitar codigo, banco, autenticacao ou servicos. A meta e decidir se o modulo nautico entra no SaaS atual, em um BFF separado ou em um servico novo com integracoes pontuais.

## Entrega esperada

Documento de arquitetura atual + decisao de reuso + contrato minimo para o primeiro endpoint de leads.

## Checklist de inventario

### 1. Repositorio e stack

- Linguagem e versao.
- Framework principal.
- Gerenciador de pacotes.
- Estrutura de pastas.
- Padrao de controllers/routes/services/repositories.
- Padrao de validacao.
- Padrao de erros.
- Testes existentes.
- CI/CD existente.

### 2. Banco e dados

- Banco usado em producao.
- ORM/query builder.
- Migrations.
- Multi-tenancy existe ou nao.
- Separacao por schema, tenant, database ou campo.
- Backups.
- Retencao de dados.
- Dados sensiveis ja tratados.

### 3. Autenticacao e autorizacao

- Login atual.
- Tipo de sessao: JWT, cookie, refresh token, session store ou outro.
- RBAC/permissions.
- MFA para administradores.
- Recuperacao de senha.
- Revogacao de sessoes.
- Rate limit de login.

### 4. Integracoes

- WhatsApp/bot atual.
- Pagamentos.
- Notificacoes.
- Email.
- Webhooks.
- Analytics.
- SaaS atual e dominios acoplados.

### 5. Infra e deploy

- Onde roda hoje.
- CloudPanel ou outro painel.
- Nginx/Apache.
- SSL.
- Logs.
- Observabilidade.
- Ambiente DEV/STAGING/PROD.
- Secrets.
- Firewall.
- Backups externos.

## Decisao de reuso

### Caminho A - Reuso direto modular

Usar se a API ja for modular, multi-tenant e tiver services genericos bem separados.

Resultado: criar modulo nautico no mesmo ecossistema, com schema/banco separado e endpoints `/v1`.

### Caminho B - BFF nautico separado

Usar se a API tiver bons servicos de autenticacao, notificacao ou pagamento, mas dominio atual for acoplado.

Resultado: criar uma API/BFF nautica que integra somente servicos seguros e genericos do SaaS atual.

### Caminho C - Servico novo

Usar se a API atual for monolitica, sem separacao clara, com risco de quebrar o SaaS existente.

Resultado: criar servico proprio para reservas de lancha e integrar depois por eventos/webhooks.

## Criterios de aceite da Fase 1

- Stack atual documentada.
- Estrutura de pastas e padroes entendidos.
- Modelo de autenticacao conhecido.
- Banco e estrategia de separacao definidos.
- Decisao A/B/C aprovada.
- Primeiro contrato de API aprovado.
- Riscos P0 registrados.
- Proxima tarefa tecnica definida: `POST /v1/leads`.

## O que enviar para continuar

- Link ou pasta do repositorio da API existente.
- Arquivo `.env.example`, sem segredos reais.
- OpenAPI/Swagger se existir.
- Print ou lista da estrutura de pastas.
- Descricao do banco e migrations.
- Fluxo atual de login/autenticacao.

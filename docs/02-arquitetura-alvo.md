# Arquitetura alvo

## Principio

Separar venda, operacao e experiencia logada.

- Venda e SEO: Wix Studio.
- Operacao e regras de negocio: API propria.
- Area logada: app proprio.
- Tour pesado: subdominio dedicado.

## Dominios

```text
www.dominio.com.br
  Wix Studio
  Home, landing pages, paginas SEO, blog, formularios, CTAs.

app.dominio.com.br
  Aplicacao propria
  Login, perfil, reservas, QR pessoal, pontos, beneficios, documentos.

api.dominio.com.br
  API propria
  Auth, RBAC, leads, reservas, consentimentos, referrals, ledger, webhooks, auditoria.

tour.dominio.com.br
  Tour 360
  Marzipano/Pannellum, hotspots, cenas, analytics e CTA.
```

## Wix Studio

Responsabilidades:

- Conteudo publico e indexavel.
- SEO tecnico/on-page.
- Template 3540 e animacoes.
- Formularios publicos de lead.
- Landing `/clube`.
- CTA para WhatsApp e reserva.
- JSON-LD nas paginas publicas quando aplicavel.

Nao deve controlar:

- Regra de reserva.
- Pontos.
- Indicacao qualificada.
- Saldo de cliente.
- Pagamentos definitivos.
- Permissoes.
- Segredos.

## App proprio

Responsabilidades:

- Login.
- Perfil do cliente.
- Minhas reservas.
- Pontos e beneficios.
- QR/link individual.
- Consentimentos.
- Documentos e orientacoes.

Stack recomendada quando for iniciar:

- React + TypeScript.
- Componentes reutilizaveis.
- Services finos para API.
- Design system simples.
- Auth via cookie seguro ou fluxo definido pela API.

## API propria

Camadas recomendadas:

```text
src/
  modules/
    leads/
      leads.controller.ts
      leads.service.ts
      leads.repository.ts
      leads.schema.ts
    bookings/
    referrals/
    points-ledger/
    consent/
  shared/
    http/
    auth/
    errors/
    validation/
    observability/
    integrations/
```

Regras:

- Validacao sempre no backend.
- Erros padronizados com `correlationId`.
- Idempotencia em criacao de reserva, pagamento e pontos.
- RBAC no servidor.
- Auditoria para acoes criticas.
- Secrets fora do frontend e fora do Git.

## React e componentes

Usar React onde houver interacao rica:

- Calendario/disponibilidade.
- Widget de solicitacao de reserva.
- Area do cliente.
- QR pessoal e compartilhamento.
- Painel de pontos.
- Componentes internos de operacao.

Evitar React para conteudo simples indexavel que o Wix resolve melhor:

- Textos comerciais.
- Blog.
- FAQ simples.
- Paginas de experiencia sem logica complexa.

## Autenticacao

Decisao alvo:

- Identidade principal controlada pelo app/API propria.
- Wix apenas envia lead ou inicia jornada.
- Area publica nao exige login.
- Login exigido somente para reservas, QR pessoal, beneficios e historico.

Controles:

- Cookies `HttpOnly`, `Secure`, `SameSite`.
- Refresh token com rotacao.
- MFA para equipe.
- RBAC e ownership.
- Auditoria de login, alteracao de reserva, reembolso, pontos e permissoes.

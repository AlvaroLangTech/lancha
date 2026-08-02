# Contrato inicial da API

Base proposta: `https://api.dominio.com.br/v1`

## Padroes globais

Headers recomendados:

```http
Content-Type: application/json
X-Correlation-Id: <uuid-opcional>
Idempotency-Key: <uuid-para-operacoes-de-criacao-critica>
```

Resposta de erro:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados invalidos.",
    "fields": {
      "phone": "Telefone obrigatorio."
    },
    "correlationId": "uuid"
  }
}
```

## POST /v1/leads

Cria ou atualiza um lead publico vindo do Wix, WhatsApp, QR, campanha ou indicacao.

Payload minimo:

```json
{
  "name": "Nome do interessado",
  "phone": "+5561999999999",
  "email": "opcional@exemplo.com",
  "interest": "availability",
  "preferredDate": "2026-08-15",
  "occasion": "aniversario",
  "source": {
    "page": "/passeio-de-lancha-brasilia",
    "channel": "organic",
    "utmSource": "google",
    "utmMedium": "organic",
    "utmCampaign": null,
    "referralCode": null
  },
  "consent": {
    "accepted": true,
    "purpose": "contact_about_booking",
    "textVersion": "2026-07-31-v1"
  }
}
```

Resposta 201:

```json
{
  "leadId": "lead_uuid",
  "status": "new",
  "correlationId": "uuid"
}
```

Regras:

- Normalizar telefone no backend.
- Nao confiar em origem enviada pelo frontend sem validacao.
- Registrar IP/user-agent apenas se houver finalidade e politica de privacidade compativel.
- Nao exigir login para criar lead.
- Nao aceitar consentimento implicito para grupo; grupo usa endpoint proprio.

## POST /v1/group-optins

Registra entrada voluntaria no Clube/Grupo de Interesse.

Regras:

- Opt-in separado de lead comercial.
- Guardar versao do texto, timestamp e origem.
- Exibir link de grupo apenas apos sucesso.

## GET /v1/availability

Consulta disponibilidade publica ou semi-publica.

Parametros:

```text
date=YYYY-MM-DD
experienceId=opcional
pax=opcional
```

Regras:

- Retornar disponibilidade comercial, nao detalhes internos.
- Rate limit.
- Cache curto quando aplicavel.

## POST /v1/booking-requests

Cria solicitacao de reserva.

Regras:

- Requer `Idempotency-Key`.
- Validar data, experiencia, quantidade de pessoas, contato e consentimentos.
- Status inicial sugerido: `requested`.
- Confirmacao final pode depender de humano, pagamento ou regra operacional.

## Eventos analiticos base

- `view_service`
- `click_whatsapp`
- `lead_started`
- `lead_submitted`
- `group_optin`
- `booking_requested`
- `booking_confirmed`
- `referral_opened`
- `referral_qualified`
- `points_credited`

Observacao: escolher uma taxonomia unica antes de implementar, evitando misturar `view_service` com `view_experience` para o mesmo evento.


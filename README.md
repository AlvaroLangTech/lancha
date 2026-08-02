# Lancha Reservas

Fundacao do projeto digital da Lancha Beju: site publico premium, funil de leads, API propria, reservas, area do cliente, QR codes, indicacoes, pontos, tour 360, SEO local, analytics e seguranca.

## Status atual

Ver `docs/09-status-redesign-premium-2026-07-31.md` para o estado atual completo (guia de pastas, o que está pronto, o que é placeholder, bugs corrigidos, tasks pendentes). Resumo:

- Home + 7 páginas internas redesenhadas no estilo premium (Tailwind v4, Framer Motion), 31/07/2026.
- CTA e formulario direcionando para WhatsApp oficial: (61) 99694-0065.
- Redirecionador `/go/falar` com mensagem preenchida.
- Estrutura de componentes em `app/components/landing` (Home) e `app/components/content` (páginas internas).
- Imagem hero e Open Graph em `public/`.

## Fase atual

Fase 1 - Inventario tecnico, arquitetura base e decisao de reuso da API existente.

Antes de implementar reserva automatica, o projeto precisa registrar:

- stack real da API atual;
- modelo de autenticacao existente;
- banco, schemas e separacao do dominio nautico;
- contratos minimos de API;
- estrategia de Wix Studio, app proprio e tour 360;
- criterios de seguranca, LGPD, SEO e analytics.

## Artefatos iniciais

- `docs/00-revisao-senior.md`: revisao critica do plano mestre.
- `docs/01-fase-1-inventario-api.md`: checklist executavel da primeira fase.
- `docs/02-arquitetura-alvo.md`: decisoes de arquitetura e limites entre Wix, app, API e VPS.
- `docs/03-backlog-inicial.md`: epicos, historias e prioridades.
- `docs/04-contrato-api-inicial.md`: contrato funcional minimo da API.
- `docs/05-seo-e-conversao-inicial.md`: URLs, intencoes e funil inicial.

## Principio tecnico

O Wix Studio vende, indexa e converte. A API propria guarda as regras de negocio. O app proprio controla login, reservas, indicacoes, pontos e operacao. React/TypeScript entra onde houver interacao rica e manutencao real, nao como substituto automatico do Wix.

## Variaveis

Copie `.env.example` para `.env` quando for rodar localmente e troque `NEXT_PUBLIC_SITE_URL` pelo dominio real quando ele for confirmado.

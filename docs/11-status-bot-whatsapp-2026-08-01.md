# Status do bot de WhatsApp da Lancha Bêju — 2026-08-01

Checklist vivo. Atualizar sempre que mexer no bot da lancha (`bot/src/lanchaContent.js`, `bot/src/leadApi.js`, o bloco `LANCHA_INSTANCE_ID` em `bot/src/bot.js`, ou `bot/src/leadCrm.js`).

## Feito e verificado hoje

- [x] Instância registrada no servidor: `id: lanchareservas`, nome exibido "ParanoaPrime". Confirmado via SSH e painel.
- [x] Cérebro/prompt da IA (Groq) já configurado e funcionando — testado ao vivo no WhatsApp (respondeu "Opa" corretamente, mencionou a lancha "Evolution").
- [x] Sessão do WhatsApp pareada e conectada (via `bot/gerar-sessao.js` + `.\scripts\deploy-session.ps1 lanchareservas`, workaround pro loop de erro 401 ao parear direto da VPS).
- [x] `bot/src/lanchaContent.js` criado: menu determinístico (1 informações, 2 disponibilidade, 3 reserva, 4 valores, 5 atendente, 6 FAQ), só ativa para `instanceId === "lanchareservas"`.
- [x] Captura de lead de reserva: `createLanchaLead()` em `leadApi.js` tenta postar no backend novo (`POST /leads` em `lancha-reservas/server`) e cai pra arquivo local (`bot/db/lancha_leads.jsonl`) se a API não estiver no ar — nenhum lead se perde.
- [x] Alerta P2P pro admin (`5561996940065`) quando alguém pede reserva ou fala "atendente".
- [x] Backend `lancha-reservas/server`: campo `notes`/`source` adicionado em `Lead` (entity, DTO, service) pra guardar a mensagem crua capturada no WhatsApp.
- [x] Bug de marca cruzada corrigido: `leadCrm.js` mandava follow-up automático citando "Laboratório Viver Bem" e o link do Grupo VIP do Laboratório pra QUALQUER instância. Agora só aplica isso pra `viverbem-ana`.
- [x] Mistério do card "Mmr Advocacia" aparecendo como `pink_booster`: **não é mistura entre empresas.** A coluna `interest` no banco é "sticky" (mantém o valor antigo se a mensagem atual não bater em nenhuma regra) e não existia regra de detecção pra "lancha". Adicionada a regra `lancha_beju` em `INTEREST_RULES`. Confirmado lendo `db.js` (`COALESCE(excluded.interest, lead_crm.interest)`) — o isolamento por `instance_id` em si sempre esteve correto (chave composta `UNIQUE(instance_id, jid)`, todas as queries filtram por instância).
- [x] `adminPhone` da instância corrigido no painel (`5561996940065`, com os dois "9" — antes estava faltando um dígito).

## Pendente / precisa de ação

- [ ] **Rodar `.\scripts\deploy-bot.ps1` de novo pra garantir.** O primeiro deploy mostrou "Connection closed" no passo de SCP mas terminou com mensagem de sucesso mesmo assim (o script não checa erro por etapa) — não temos certeza de que todo o código novo chegou no servidor.
- [ ] Confirmar que a instância `viverbem-ana` (Laboratório) segue "Conectado e Operante" depois do episódio do `deploy-session.ps1` sem parâmetro (foi cancelado a tempo, mas vale checar no painel).
- [ ] Pedido em aberto: melhorar a imagem do anúncio (flyer "Aluguel de Lancha") e programar disparo diário no grupo VIP. Preciso saber: (1) o que "melhorar" significa — remake do design com o mesmo conteúdo, texto/copy diferente, ou foto nova (não tenho ferramenta de geração de imagem aqui, só consigo mexer em texto/layout); (2) qual grupo é o "grupo VIP" da lancha (nome ou link) — o painel tem uma seção "Imagens de Campanha" que já faz esse disparo automático por dia, é só cadastrar lá.
- [ ] Considerar: hoje nenhum "follow-up automático" dispara pra clientes da lancha, porque os detectores de `checkout_sent`/`link_sent` em `leadCrm.js` (`detectLeadStatusFromBot`) só reconhecem o domínio/URL do Laboratório. Não é bug — só significa que esse recurso específico ainda não foi ligado pra lancha. Baixa prioridade por enquanto.
- [ ] Painel admin próprio do `lancha-reservas` (login + lista de bookings/leads) ainda não tem frontend — os endpoints já existem (`POST /auth/login`, `GET /bookings`, `GET /leads`).
- [ ] Banco de produção (Neon/Postgres) ainda não provisionado — API roda com fallback SQLite local até isso ser feito.

## Como verificar rápido (sem esperar cliente real)

1. Painel: `http://168.231.100.16:3003/painel` — os dois cards ("Viver Bem - Ana" e "ParanoaPrime") devem estar "Conectado e Operante".
2. Manda uma mensagem de teste de um número desconhecido pro WhatsApp da lancha (`61 99694-0065`) e confere: (a) apareceu só no card "ParanoaPrime", não no da Ana; (b) se pedir "reserva", chega alerta no seu WhatsApp.

# Backlog inicial

## P0 - Fundacao

### E1. Inventario da API existente

Como arquiteto do projeto, quero conhecer a API atual para decidir o reuso sem acoplar o dominio nautico ao SaaS existente.

Aceite:

- Stack, banco, auth, deploy e estrutura mapeados.
- Decisao A/B/C registrada.
- Riscos de acoplamento documentados.

### E2. Contrato `POST /v1/leads`

Como visitante interessado, quero enviar meu contato para consultar disponibilidade ou receber retorno.

Aceite:

- Endpoint versionado.
- Valida nome e telefone.
- Registra origem, UTM, pagina, consentimento e `correlationId`.
- Nao grava lead duplicado sem regra clara.
- Retorna erro padronizado.

### E3. Consentimento de grupo/lista

Como visitante sem data definida, quero entrar voluntariamente na lista/clube com clareza sobre finalidade.

Aceite:

- Opt-in explicito.
- Texto de consentimento versionado.
- Timestamp e origem registrados.
- Link do grupo aparece somente depois do consentimento.

## P1 - Site, SEO e conversao

### E4. Mapa de paginas P0

Aceite:

- Home.
- `/passeio-de-lancha-brasilia`.
- `/passeio-lago-paranoa`.
- `/a-lancha`.
- `/seguranca-e-regras`.
- `/perguntas-frequentes`.
- `/clube`.

### E5. CTAs rastreaveis

Aceite:

- CTA WhatsApp passa por `/go/falar`.
- CTA clube passa por `/clube`.
- CTA reserva registra `booking_requested` ou `lead_submitted`.
- UTMs preservadas.

## P1 - Reservas

### E6. Disponibilidade

Aceite:

- `GET /v1/availability?date=YYYY-MM-DD`.
- Nao revela dados internos.
- Considera bloqueios operacionais.
- Sem promessa automatica de disponibilidade nao confirmada.

### E7. Solicitacao de reserva

Aceite:

- `POST /v1/booking-requests`.
- Usa `Idempotency-Key`.
- Valida data, experiencia, quantidade de pessoas e contato.
- Gera status inicial auditavel.

## P2 - QR, indicacao e pontos

### E8. QR pessoal

Aceite:

- Link unico por cliente.
- Landing rastreavel.
- `referral_opened` registrado.
- Nao credita pontos por clique.

### E9. Ledger de pontos

Aceite:

- Credito somente por evento qualificado.
- Estorno possivel por transacao inversa.
- Nenhuma alteracao manual de saldo sem auditoria.

## P2 - Tour 360

### E10. Pagina e fallback do tour

**Status (2026-08-02): ainda nao construido. Reconfirmado pelo Alvaro como prioridade - falta captura em 360 (camera propria ou profissional, ver secao 11 do Plano Mestre) antes de dar pra implementar a pagina.**

Aceite:

- `/tour-360` indexavel com conteudo textual.
- Tour carrega somente apos interacao.
- Fallback com galeria/texto quando 360 nao carregar.
- Evento `tour_started`.

## P1 - Atendimento e checkout conversacional no site

### E11. Assistente de vendas no site (chat -> checkout)

**Adicionado 2026-08-02, pedido do Alvaro: "falta um atendimento com o bot no site para ja coletar as informacoes e finalizar o pagamento so conversando pelo site".**

**Status (2026-08-02): CONSTRUIDO.** `app/components/chat/SiteChatWidget.tsx`, montado globalmente em `app/layout.tsx`.

**Atualizado 2026-08-02, pedido do Alvaro: "eu quero o bot no site, como um atendente funcional, igual no whatsapp, ja finalizando e link de pagamento, pelo site ele confirma o pagamento, manda link agenda, etc"** - o escopo original (chat abre o `CheckoutModal` em popup) evoluiu para o chat conduzir a reserva INTEIRA dentro da propria conversa (nome -> email -> whatsapp -> data -> ocasiao -> aceite de termos -> codigo de verificacao -> forma de pagamento -> CPF/CNPJ -> link/QR Pix), sem abrir nenhum popup - mesmo espirito do bot de WhatsApp.

Como visitante do site, quero poder conversar com um assistente (sem sair pro WhatsApp) que entende meu interesse, coleta os dados da reserva e me leva ate o pagamento do sinal, tudo na mesma pagina.

Nao e um bot novo do zero: quem chama a API continua sendo o `checkoutApi` (`/checkout/start`, `/checkout/verify-email`, `/checkout/pay`, os MESMOS 3 endpoints que o `CheckoutModal` usa) - so ganhou uma segunda superficie de UI (bolhas de chat) alem do formulario em popup, que continua existindo e funcionando (usado por quem chega direto no botao "Reservar" da pagina, fora do chat).

Aceite:

- [x] Widget de chat no site (canto inferior direito), disponivel em toda pagina publica.
- [x] Avatar do assistente (mascote capitao-robo gerado por IA, `call_Ja9znCNySUBrdm8z7Wz2jW4V.png`) no botao flutuante e no cabecalho do chat - pedido do Alvaro ("essa e a imagem do atendente que deve ficar no site").
- [x] Balao de convite ("Tire suas duvidas 💬") aparece 4s depois do carregamento da pagina se o chat ainda nao foi aberto - pedido do Alvaro ("deixe uma mensagem").
- [x] Consegue responder duvidas basicas (preco, capacidade, horario, politica de cancelamento, embarque) usando o mesmo classificador de palavra-chave do bot de WhatsApp (`bot/src/lanchaContent.js`).
- [x] Quando o visitante decide reservar, o chat coleta nome/email/whatsapp/data/ocasiao E conduz aceite de termos, verificacao de email, escolha de forma de pagamento (Pix/cartao/boleto) e CPF/CNPJ direto na conversa, sem sair da pagina.
- [x] Ao final, mostra o link de pagamento (`invoiceUrl`) e o QR Code Pix (quando aplicavel) direto na bolha do chat.
- [x] Nunca confirma reserva sozinho - a mensagem final e explicita ("assim que o pagamento cair, sua reserva e confirmada automaticamente"), nunca "pagamento confirmado". Confirmacao real continua sendo so o webhook do Asaas (`checkout.service.ts`), mesma regra do bot de WhatsApp e do `CheckoutModal`.
- [x] Se o visitante preferir, pode trocar pra WhatsApp a qualquer momento (botao "Falar no WhatsApp" sempre disponivel no menu principal e nas telas de erro).
- [x] Erros de API (start/verify/pay) mostram mensagem clara e oferecem tentar de novo ou cair pro WhatsApp, nunca travam o chat sem saida.

Risco evitado (ver secao 22 do Plano Mestre, "riscos e anti-padroes"): nao reconstruiu a logica de pagamento dentro do chat - o chat so aciona os mesmos 3 endpoints que o `CheckoutModal` ja usava, entao continua existindo uma fonte de verdade so sobre reserva/pagamento (o `server/`).

**Atualizado 2026-08-02 de novo, pedido do Alvaro: "cade a ia? cade a simulação de digitação? tem que ser o bot integrado 100%, automatico! cade a opção agendar?"** - 3 ajustes:

- [x] IA de verdade (Groq, mesma API do bot de WhatsApp) responde perguntas livres que não batem com nenhuma regra determinística - novo `server/src/modules/chat/` (`POST /chat/message`), `app/lib/chatApi.ts`. Requer `GROQ_API_KEY` configurada em `server/.env` na VPS (ver `server/.env.example`) - sem a chave, o chat cai num fallback educado pedindo pra ir pro WhatsApp, não quebra.
- [x] Indicador de "digitando..." (3 bolinhas pulsando) enquanto espera qualquer resposta (IA ou checkout).
- [x] Botão principal renomeado de "Reservar agora" pra "Agendar agora"; "agendar"/"marcar"/"equipe"/"atendente"/"humano" viraram sinônimos reconhecidos.

**Corrigido 2026-08-02 (achado ao investigar o "???" do Alvaro sobre uma tela antiga):** a página `/passeio-de-lancha-brasilia` - destino do botão "Ver Passeios" da hero, ou seja, a página de MAIOR intenção de compra do site - ainda usava o `<WhatsAppLeadForm>` antigo ("reserva assistida primeiro, automação depois"), escrito em 2026-08-01 ANTES do checkout de verdade existir. Trocado pelo mesmo `<ReserveButton>`/`<CheckoutModal>` já usado no resto do site. Vale conferir se as outras 6 páginas SEO antigas (`/a-lancha`, `/seguranca-e-regras`, `/perguntas-frequentes`, `/clube`, `/tour-360`) têm o mesmo tipo de defasagem - só `/passeio-lago-paranoa` foi conferida e está OK.

**Pendencias que ficaram de fora deste epico (nao pedidas explicitamente, mas relacionadas):**

- "Link de agenda": nao existe integracao de calendario (.ics/Google Calendar) no backend hoje - o email de confirmacao (ja existente) e o unico artefato de "agenda" que o cliente recebe por enquanto. Se o Alvaro quiser um evento de calendario de verdade, e tarefa nova (endpoint novo no `server/`).
- Painel gestor (admin) pra visualizar quem aceitou os termos (`termsAcceptedVersion`/`termsAcceptedAt`, ja gravados no banco desde 2026-08-02) - o dado ja e coletado tanto pelo `CheckoutModal` quanto pelo `SiteChatWidget`, mas ainda nao ha tela de admin pra ler isso (ver pendencia #154 / provisionar banco de producao).

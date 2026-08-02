# Estado atual do site e como rodar localmente

Documento de estudo do projeto na versão atual (2026-07-31), para orientar marketing e próximos passos técnicos.

## Stack real (não é um Next.js puro)

- Base: template `vinext` (Next.js App Router rodando sobre Vite + Cloudflare Workers).
- `vite.config.ts` carrega o plugin `vinext()`, o plugin interno `sites()` e `@cloudflare/vite-plugin`, que sobe um Worker local (`worker/index.ts`) via Miniflare.
- `worker/index.ts` é o entrypoint do Worker: trata otimização de imagem em `/_vinext/image` e repassa o resto para o handler do App Router (`vinext/server/app-router-entry`).
- Banco (D1) e storage (R2) existem na stack mas estão **desligados**: `.openai/hosting.json` tem `d1: null` e `r2: null`, e `db/schema.ts` está vazio ("Add Drizzle tables here when the site actually needs a database"). Ou seja, hoje não há persistência real — o "banco" é só andaime pronto para ativar depois.
- `next.config.ts` está no padrão, sem customização.
- Não há testes de UI automatizados além de `tests/rendered-html.test.mjs` (roda `npm run build` e checa o HTML renderizado).

Isso explica por que `npm ci`/build falhou no ambiente anterior (Codex/CLI): esse template espera Node ≥ 22.13 e acesso de rede ao registro npm, que o sandbox anterior bloqueou por permissão. No seu computador local isso tende a funcionar normalmente, desde que o Node seja recente o suficiente.

## O que já está implementado

- **Home** (`app/page.tsx`): hero com imagem (`public/hero-lancha-beju.png`), blocos de diferenciais, grade de "experiências" (SEO), seção de reserva assistida com formulário, preview do tour 360, FAQ resumido, CTA final. Todo o conteúdo/copy vem de `app/lib/site.ts`.
- **Config central** (`app/lib/site.ts`): marca, telefone (`(61) 99694-0065` / `5561996940065`), link de WhatsApp pré-preenchido, listas de benefícios, experiências, FAQ, links de navegação e o JSON-LD (`schema.org/Service`) usado na Home.
- **Header/Footer** (`app/components/`): navegação com os mesmos `pageLinks`, CTA de WhatsApp no header.
- **Formulário de lead** (`app/components/WhatsAppLeadForm.tsx`): formulário HTML puro (sem JS de validação), método `GET` para `/go/falar`, campos nome/data/ocasião/mensagem.
- **Redirecionador `/go/falar`** (`app/go/falar/page.tsx`): monta a mensagem final a partir da query string e faz `redirect()` para `wa.me/5561983728950?text=...`. Não grava nada ainda — é só um montador de link.
- **Páginas de SEO/institucionais**: `/passeio-de-lancha-brasilia`, `/passeio-lago-paranoa`, `/a-lancha`, `/seguranca-e-regras`, `/perguntas-frequentes`, `/clube`, `/tour-360` — criadas como primeira versão, listadas no `README.md`.
- **`robots.ts` e `sitemap.ts`**: geração automática de robots/sitemap pelo App Router.
- **Visual**: design system próprio em `app/globals.css` (tokens de cor `--ink/--muted/--paper/--gold/--teal`, tipografia Inter, componentes de botão, cards, hero).

## O que ainda não existe

- Nenhuma integração com API própria (o `POST /v1/leads` mencionado no changelog anterior **não está implementado** — o formulário hoje só monta um link de WhatsApp).
- Sem banco de dados ativo (D1 desligado).
- Sem autenticação/área do cliente.
- Sem tour 360 real (a página é um placeholder, conforme o próprio FAQ do site admite).
- Sem testes de build validados neste ambiente ainda (não consegui rodar `npm install`/`npm run build` — ver seção abaixo).

## Como rodar localmente (no seu Windows)

Não tenho permissão para digitar comandos no seu Terminal por segurança — só consigo ler/editar arquivos e, se quiser, abrir o navegador depois que o servidor estiver no ar. Rode você mesmo estes comandos no Terminal, dentro da pasta do projeto:

```powershell
cd "C:\Users\alvar\OneDrive\Documentos\LANCHA RESERVAS"
node -v
```

Confirme que a versão do Node é **22.13.0 ou mais recente** (o `package.json` exige isso). Se for menor, instale/atualize o Node antes de continuar.

```powershell
npm install
npm run dev
```

`npm run dev` chama `vinext dev`, que sobe Vite + o Worker local (Miniflare) juntos em um único processo. O terminal vai mostrar a URL local (normalmente algo como `http://localhost:5173`) — use exatamente a URL impressa no terminal, a porta pode variar.

Quando o servidor estiver rodando, me avise (ou cole a URL/porta que apareceu) que eu abro pelo Chrome para a gente visualizar junto.

## Próximos passos técnicos sugeridos

1. Validar `npm install` / `npm run build` neste ambiente real (Windows) — ainda não validado.
2. Revisar visual fino em desktop/mobile depois do preview.
3. Decidir se `POST /v1/leads` vai para uma API própria (conforme `docs/02-arquitetura-alvo.md`) antes de trocar o formulário atual.
4. Ativar D1 (`.openai/hosting.json`) só quando houver necessidade real de persistência, para não carregar complexidade cedo demais.

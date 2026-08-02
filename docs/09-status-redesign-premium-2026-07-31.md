# Status do site - 31/07/2026 (redesign premium)

Este documento substitui `06-estado-atual-e-como-rodar.md` como fonte da verdade sobre o estado atual. O site foi completamente reconstruído hoje no estilo "premium/Apple/DTC" pedido pelo Alvaro (referência: landing page privada dele no Wix Studio). Os docs `00` a `08` continuam valendo como histórico de planejamento (arquitetura de API, backlog, etc.) mas descrevem uma versão anterior do visual.

## Guia rápido de pastas

```
app/
  page.tsx                  → Home (monta os 9 blocos abaixo)
  layout.tsx                → <html>/<head> raiz - fontes Google carregadas aqui
  globals.css                → SÓ Tailwind v4 (@theme com cores/fontes). Sem CSS a mão.

  components/landing/        → Componentes exclusivos da Home (Hero, Header, Footer, etc.)
  components/content/        → Componentes reutilizados pelas 7 páginas internas (PageHero, InfoPanel, FaqAccordion)
  components/WhatsAppLeadForm.tsx → formulário de lead (usado em /passeio-de-lancha-brasilia)
  components/Header.tsx e Footer.tsx → MORTOS, não usados por nenhuma página. Pode apagar.

  lib/site.ts                 → todo dado real do negócio (telefone, WhatsApp, FAQ, JSON-LD)
  lib/landing-content.ts       → conteúdo da Home (carrossel, checklist, depoimentos placeholder)

  a-lancha/, clube/, tour-360/, perguntas-frequentes/,
  seguranca-e-regras/, passeio-de-lancha-brasilia/,
  passeio-lago-paranoa/, go/falar/                    → as 8 rotas do site (7 páginas + 1 redirect)

docs/  → este arquivo + histórico de planejamento (00-08)
public/hero-lancha-beju.png → ÚNICA foto real do produto que existe hoje
```

## O que está pronto

- Home totalmente redesenhada: hero com foto real + overlay, carrossel, seção "a bordo", CTA de lançamento, checklist de segurança, depoimentos, "em breve", newsletter, footer - tudo animado (Framer Motion) e no padrão de cor/tipografia novo (`--color-abyss/neon/sand`, fontes Archivo + Inter).
- As 7 páginas internas reconstruídas com o mesmo padrão visual (`PageHero` + `InfoPanel` + `FaqAccordion`), mantendo o texto honesto que já existia - nada de spec/preço inventado.
- Fontes Archivo/Inter carregando de verdade (bug de `next/font` que as travava foi corrigido - ver seção Bugs).
- Sem overflow horizontal no mobile (bug do carrossel corrigido - ver seção Bugs).
- CSS morto removido - o projeto é 100% Tailwind v4 agora, zero classe CSS escrita à mão.

## O que é placeholder - NÃO mostrar como definitivo pro investidor

Isso é crítico pra apresentação. Estes pontos são honestos de propósito (o próprio FAQ do site já assume que specs não estão confirmadas):

- **Depoimentos** (`testimonialsPlaceholder` em `landing-content.ts`): são fictícios, marcados no código com aviso. Trocar por avaliações reais antes de qualquer publicação.
- **Carrossel "Cada Detalhe a Bordo"**: são cards com texto + ícone, não fotos/vídeos reais (só existe 1 foto real do produto hoje, usada na Home e em `/a-lancha`).
- **Preço, duração, capacidade, itens inclusos**: nenhuma página publica esses números - todas dizem "a confirmar" de propósito, porque ainda não foram validados operacionalmente.
- **Tour 360**: página é só uma promessa/fallback editorial, não existe captura 360 real ainda.
- **`/a-lancha`**: mesma coisa - espera fotos reais da embarcação (hoje só reusa a única foto que existe).

## Bugs reais encontrados e corrigidos hoje

1. **Fontes não carregavam**: `next/font/google` gerava URL local quebrada (`file://...`, 503) nesse ambiente `vinext`. Trocado para `<link>` clássico do Google Fonts em `layout.tsx`. Confirmado ao vivo no navegador (fonte + contraste corretos).
2. **Scroll horizontal no mobile**: grid da seção "a bordo" sem `min-w-0` deixava a largura interna do carrossel vazar e empurrar a página inteira. Corrigido e confirmado ao vivo (testei rolando a página pros lados).
3. **Contraste da hero**: texto pequeno ficava ilegível quando caía sobre a parte clara (pôr do sol) da foto. Adicionada camada escura uniforme.
4. **Botão outline "Consultar Disponibilidade"**: baixo contraste, corrigido (borda mais grossa + fundo sutil).
5. **Cards do carrossel quase invisíveis**: gradiente ia até preto puro sobre fundo já escuro. Trocado por fundo mais claro + brilho.

## O que falta (specs/tasks pendentes)

- [ ] Rodar `npm run build` local pra confirmar zero erro de compilação (nunca rodei build nesta sessão, só dev).
- [ ] Testar ao vivo as 6 páginas internas restantes em mobile+desktop (só Home e `/a-lancha` foram testadas ao vivo até agora).
- [ ] Decidir fotos/vídeo reais da lancha (ver seção de vídeo abaixo) antes de trocar os placeholders.
- [ ] Confirmar preço/duração/capacidade operacionalmente antes de publicar.
- [ ] Apagar `Header.tsx`/`Footer.tsx` (mortos) - não consigo deletar arquivo por aqui, só editar; apagar manualmente quando quiser.
- [ ] Decidir sobre a API própria / persistência (D1 hoje desligado - ver `docs/02-arquitetura-alvo.md`) - fora de escopo pra apresentação, é fase 2.
- [ ] Publicar/hospedar o site de verdade (hoje só existe local, `npm run dev`) - ver próximos passos na resposta do chat.

# Plano: migrar identidade/conteúdo do lanchabeju.lovable.app + painel gestor (Firebase)

Pesquisa feita ao vivo em https://lanchabeju.lovable.app (01/08/2026) via navegador conectado. Documento cobre: o que existe lá, o que vamos puxar, o que falta decidir antes de eu sair implementando, e as fases de execução.

## 1. O que existe no site de referência

Site feito 100% no Lovable (React + Vite + Tailwind + shadcn, confirmado pelo link do badge no rodapé), página única, sem backend, sem login, sem admin — todo CTA é um link `wa.me` com mensagem pré-preenchida. Ou seja: o "fluxo" de lá é simples (ver → escolher data no calendário decorativo → WhatsApp), o painel gestor/Firebase que você pediu **não existe lá**, é escopo novo que vamos construir do zero no nosso projeto.

### Tipografia (confirmado via computed style, não achismo)

- Títulos/display: **Playfair Display** (serifada, alto contraste, a mesma família do "ALUGUEL DE LANCHA")
- Destaque/assinatura: **Great Vibes** (script/caligráfica, usada em "Navegue. Relaxe. Aproveite.")
- Corpo de texto: **Montserrat**

Isso é uma dupla completamente diferente da nossa atual (Archivo + Inter). Dá pra trocar via Google Fonts `<link>` do mesmo jeito que já corrigimos o bug de fonte quebrada.

### Identidade visual

Fundo azul-marinho escuro + dourado/mostarda como cor de destaque (o "LANCHA" do título, bordas, botão). Isso é **diferente** da nossa paleta atual (`abyss` quase preto + `neon` verde-água). Ponto de decisão no item 3.

### Conteúdo real encontrado lá (não é placeholder)

- Preço: **R$ 2.500 a diária**
- Horário: **10h às 20h** (10 horas)
- Capacidade: **até 9 pessoas**
- Incluso: piloto, combustível, churrasqueiro a bordo
- Sinal: **50% via Pix ou cartão**, reembolso integral até 7 dias antes, crédito entre 7-2 dias
- Local de embarque: **Motonáutica, Vila Planalto, ao lado do Life Resort**
- "Mais de 300 passeios realizados"
- 4 depoimentos com nome e ocasião: Rafaela M. (aniversário 30 anos), Diego e Camila (passeio em família), Lucas F. (confraternização empresa), Marina S. (ensaio fotográfico)
- **10 fotos reais** da lancha (nomes de arquivo `IMG-20260612-WA00XX.jpg` — fotos exportadas do WhatsApp em 12/06/2026, não são banco de imagens)

### Ponto crítico — preciso que você confirme antes de eu publicar isso

O nosso site atual marca preço/capacidade/depoimentos como "a confirmar" de propósito, e eu venho seguindo a regra a sessão inteira de nunca inventar fato de negócio. O site do Lovable tem esses dados preenchidos — mas preciso que você confirme que **R$ 2.500, 9 pessoas, os 4 depoimentos com nome e "300+ passeios" são reais e autorizados pra publicar**, e não também um preenchimento de exemplo que você (ou quem montou o Lovable) usou pra ver o layout. Se forem reais, uso tudo. Se algum for só exemplo, me diz qual pra eu manter como placeholder marcado.

## 2. Escopo novo: painel gestor + Firebase

Isso não existe em lugar nenhum ainda (nem no site atual, nem no de referência) — é 100% construção nova. Proposta:

- **Firebase Auth** pro login do painel (e-mail/senha ou Google) — só pra equipe, não pro cliente final.
- **Custom claims** (`role: "gestor"` etc.) pra controlar quem entra no painel — checado tanto no client quanto nas regras do Firestore/Storage (nunca só no front).
- **Firestore** como banco dos leads: toda vez que alguém manda o formulário de newsletter, clica em "Consultar disponibilidade" ou escolhe uma data no calendário, grava um lead (nome, contato, origem, data de interesse, status) em vez de só abrir o WhatsApp e perder o registro — hoje isso não é guardado em lugar nenhum.
- **Firebase Storage** pra anexos (ex: comprovante de sinal, foto de documento se precisar).
- Painel roda dentro do próprio Next.js/vinext em `/admin/*`, protegido por Firebase Auth.

### Por que Firebase e não Supabase (que o Viver Bem já usa)

Você pediu Firebase explicitamente, então vou nessa. Só registrando a troca: são dois projetos separados (Lancha Bêju não compartilha banco com o Laboratório Viver Bem), então não há conflito técnico em usar provedores diferentes — só significa mais uma conta/console pra gerenciar.

## 3. Decisão que preciso antes de sair mexendo no visual

"Gostei muito da fonte" pode significar duas coisas bem diferentes de trabalho:

**A) Só trocar a tipografia** — manter nosso fundo escuro/verde-água atual, só entrar com Playfair Display + Great Vibes nos títulos. Risco baixo, mantém o que já testamos essa sessão inteira (contraste, responsivo).

**B) Adotar a identidade inteira** — fundo azul-marinho + dourado, igual ao site de referência. É essencialmente um rebrand visual completo por cima do que construímos (teríamos que reconferir contraste, responsivo, tudo de novo).

## 4. Fases de execução (depois de eu ter as respostas acima)

1. Fontes: trocar `<link>` do Google Fonts + tokens `--font-display`/`--font-script`/`--font-body` no `globals.css`.
2. Paleta (se for opção B): novos tokens `--color-navy`/`--color-gold` no `@theme`, revisão de contraste em cada página redesenhada.
3. Conteúdo: atualizar `lib/landing-content.ts`/`lib/site.ts` com preço, capacidade, horário, política de cancelamento, depoimentos reais, endereço de embarque — tudo com fonte confirmada por você.
4. Fotos: baixar as 10 fotos reais do Lovable, otimizar e subir em `public/gallery/`, montar seção de galeria (hoje só existe 1 foto real no projeto).
5. Firebase: criar projeto, configurar Auth + Firestore + Storage + regras de segurança, tela de login `/admin/login`, dashboard básico de leads em `/admin/leads`.
6. Instrumentar captura de lead: formulário de newsletter e cliques de "consultar disponibilidade"/calendário passam a gravar no Firestore antes (ou além) de abrir o WhatsApp.
7. Verificação final: build, revisão de contraste/responsivo, teste do fluxo de login e captura de lead.

## 5. Falhas/riscos observados (cérebro sênior, não só o pedido literal)

- **Autenticidade do conteúdo** (item 1) — maior risco, pode comprometer a apresentação se eu publicar algo não autorizado.
- **Duas identidades visuais concorrentes** — precisa decidir A ou B antes, senão retrabalho.
- **Painel gestor sem regra de acesso no backend é uma falha de segurança clássica** — vou implementar as Firestore Security Rules com o mesmo cuidado de RBAC que já existe no Viver Bem, não só esconder o link no front.
- **Firestore sem índice/estrutura pensada faz o painel ficar lento e caro rápido** — vou desenhar a coleção de leads com os campos certos desde o início (não é "salvar tudo solto").
- **Nenhuma dessas mudanças tem teste automatizado hoje** (projeto não tem suíte de testes) — vou seguir validando via build + verificação ao vivo no navegador, como fizemos até aqui.

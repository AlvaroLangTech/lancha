# SEO e conversao inicial

## Objetivo

Construir paginas indexaveis que convertam sem criar conteudo fino, duplicado ou artificial.

## URLs P0 recomendadas

| URL | Intencao | Papel |
| --- | --- | --- |
| `/` | Marca e experiencia premium | Home |
| `/passeio-de-lancha-brasilia` | passeio de lancha em Brasilia | Servico principal |
| `/passeio-lago-paranoa` | passeio no Lago Paranoa | Pagina local |
| `/a-lancha` | conhecer embarcacao | Prova/produto |
| `/seguranca-e-regras` | confianca, preparo e regras | Reducao de risco |
| `/perguntas-frequentes` | duvidas comerciais | FAQ |
| `/clube` | lista de interesse | Captacao consentida |

## URLs P1

| URL | Intencao | Observacao |
| --- | --- | --- |
| `/sunset-lago-paranoa` | passeio ao por do sol | Depende de horarios e regras reais |
| `/lancha-aniversario-brasilia` | aniversario/comemoracao | Precisa confirmar capacidade e regras |
| `/ensaio-fotografico-lancha-brasilia` | ensaio fotografico | Precisa validar permissao, tempo e uso de imagem |
| `/tour-360` | exploracao virtual | Publicar com fallback e lazy loading |

## Regras de SEO

- Uma intencao principal por pagina.
- H1 unico.
- Title com servico + local + marca.
- Meta description feita para clique, nao para repetir palavra-chave.
- Conteudo real sobre experiencia, seguranca, roteiro, preparo e processo.
- Imagens reais, otimizadas e com alt util.
- Links internos entre Home, servicos, FAQ, seguranca, clube e tour.
- App, convites pessoais, checkout, estados de pagamento e conta com `noindex`.

## Funil principal

```text
Trafego
  -> landing por intencao
  -> experiencia e prova visual
  -> confianca e regras claras
  -> consulta de disponibilidade
  -> WhatsApp ou solicitacao de reserva
  -> confirmacao
  -> experiencia realizada
  -> avaliacao
  -> indicacao
  -> pontos
  -> recompra
```

## CTAs

- Primario: consultar disponibilidade.
- Secundario: falar no WhatsApp.
- Terciario: entrar no Clube/Grupo de Interesse.

## Conteudos P0

- Passeio de lancha em Brasilia: como funciona, o que inclui e como reservar.
- Passeio no Lago Paranoa: experiencia, horarios e orientacoes.
- O que levar para um passeio de lancha.
- Seguranca, regras e preparo.
- FAQ comercial.

## Dados estruturados

Usar JSON-LD somente quando o conteudo estiver visivel na pagina.

Tipos candidatos:

- `Organization`
- `LocalBusiness`
- `Service`
- `BreadcrumbList`
- `FAQPage`, apenas quando perguntas e respostas estiverem visiveis e fizer sentido.

## Eventos minimos

- `page_view`
- `view_service`
- `click_whatsapp`
- `lead_started`
- `lead_submitted`
- `group_optin`
- `booking_requested`
- `tour_started`
- `referral_opened`

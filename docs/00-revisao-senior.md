# Revisao senior do Plano Mestre

Fonte analisada: `C:\Users\alvar\Downloads\Plano_Mestre_Reserva_de_Lancha_FINAL.docx`, versao 1.1 de 31/07/2026.

## Diagnostico executivo

O plano esta bem direcionado: separa marketing/SEO no Wix Studio do core operacional na API propria, evita lock-in, trata SEO como arquitetura e coloca seguranca, LGPD, indicacoes e pontos desde o desenho. A direcao e senior.

A principal melhoria agora e transformar o plano em governanca executavel: inventario da API existente, decisao clara de reuso, contratos versionados, ambientes separados, backlog priorizado e criterios de aceite por entrega.

## Decisoes fortes que devem permanecer

- Wix Studio com template 3540 para site publico, SEO, landing pages, conteudo, formularios e entrada do funil.
- API propria como fonte de verdade para leads, reservas, consentimentos, indicacoes, pontos, auditoria e integracoes.
- App proprio em subdominio para area logada, perfil, reservas, QR pessoal e beneficios.
- Tour 360 fora da Home, com pagina dedicada, carregamento sob demanda e hospedagem propria ou controlada.
- Uma identidade principal para area logada; evitar Wix Members e login proprio simultaneos em producao.
- Ledger de pontos imutavel; nunca tratar pontos como simples saldo editavel.
- QR individual sempre rastreavel, com codigo de indicacao, UTM, antifraude e evento qualificado.
- Grupo/lista de interesse com opt-in explicito e evidencia de consentimento.

## Riscos e ajustes obrigatorios

### Risco P0 - API existente sem inventario

O plano assume que a API atual pode ser reutilizada, mas ainda faltam dados sobre stack, autenticacao, banco, multi-tenancy, pagamentos, notificacoes, deploy e documentacao. Sem isso, qualquer implementacao pode acoplar o dominio nautico ao SaaS atual de forma ruim.

Resposta: concluir o inventario tecnico antes de criar tabelas, endpoints definitivos ou app logado.

### Risco P0 - informacoes comerciais ainda pendentes

Preco, duracao, capacidade, local de embarque, itens inclusos, politica de clima/cancelamento e documentacao da embarcacao ainda precisam de validacao. Publicar essas informacoes sem confirmacao cria risco comercial, juridico e reputacional.

Resposta: marcar tudo como `a confirmar` ate validacao operacional.

### Risco P0 - autenticacao duplicada

Usar Wix Members para parte dos clientes e login proprio para outra parte aumenta suporte, risco de autorizacao e duplicidade de dados.

Resposta: para o alvo, a identidade da area logada deve ficar no app/API propria. Wix coleta leads publicos e redireciona para fluxos controlados.

### Risco P1 - React dentro do Wix sem criterio

React e excelente para app proprio e widgets ricos, mas usar React para tudo dentro do Wix prejudica edicao de conteudo, SEO e simplicidade operacional.

Resposta: React/TypeScript deve entrar em componentes isolados: calendario, painel do cliente, QR/indicacao, widget de reserva, launcher do tour e app logado.

### Risco P1 - SEO com paginas demais cedo demais

O mapa de URLs e bom, mas precisa evitar conteudo fino. Cada URL deve ter uma intencao real, conteudo unico, prova visual e CTA proprio.

Resposta: lancar primeiro paginas P0 e P1 com conteudo real; expandir blog e clusters depois de medir impressoes, CTR e leads.

### Risco P1 - tour 360 antes de ativos reais

O plano descreve um tour tipo Street View, mas isso depende de captura 360 adequada. Fotos comuns nao entregam a experiencia prometida.

Resposta: criar primeiro uma pagina dedicada preparada para o tour, com fallback visual; publicar o tour completo apenas apos captura correta.

### Risco P1 - bot prometendo informacao nao confirmada

O prompt do bot esta bom ao proibir invencoes, mas precisa de base de conhecimento versionada e lista explicita de campos confirmados.

Resposta: bot deve consultar dados confirmados e transferir para humano quando faltar preco, regra, capacidade ou disponibilidade.

## Pontos a corrigir no Plano Mestre

- Padronizar nomes de eventos: o documento usa `view_service`, enquanto o prompt original previa `view_experience`. Escolher uma taxonomia unica.
- Separar `BookingRequest` de `Booking` com estados bem definidos.
- Definir dono de identidade: app/API propria no alvo; Wix apenas lead publico.
- Definir `noindex` para app, convites pessoais, estados de pagamento e area logada.
- Registrar explicitamente que o valor de R$ 2.500 por diaria esta sujeito a validacao antes de publicar.
- Transformar referencias de seguranca em checklist tecnico testavel.

## Confirmacao externa relevante

- OWASP Top 10:2025 existe e a lista do plano esta alinhada em alto nivel com a versao oficial.
- Wix Studio permite dados estruturados JSON-LD por pagina, com limite informado pela propria documentacao do Wix.
- Custom elements no Wix podem carregar JavaScript hospedado no Wix/Velo ou servidor HTTPS, o que viabiliza widgets customizados, mas com cuidado de performance.

## Decisao recomendada agora

Prosseguir com a Fase 1 antes de codar produto: inventario da API, contrato minimo, repositorio organizado, criterios de aceite e primeira historia tecnica pronta para implementacao (`POST /v1/leads` com consentimento e origem).

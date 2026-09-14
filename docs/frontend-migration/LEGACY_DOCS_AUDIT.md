# Auditoria da documentação existente

## Decisão resumida

A documentação antiga não deve ser apagada agora, porque ainda registra intenção
de produto, convenções visuais e regras do frontend Next durante a transição. Ela
também não pode continuar sendo tratada como fonte de verdade da migração.

Ação aplicada nesta auditoria:

- `README.md` recebeu aviso de conteúdo desatualizado e link para este conjunto;
- `CLAUDE.md` recebeu aviso de escopo: manutenção Next, não arquitetura SvelteKit;
- `docs/patterns.md` recebeu aviso de legado e da incompatibilidade do padrão de
  escrita de ref durante render com o lint atual;
- as convenções visuais dispersas nesses arquivos foram consolidadas no
  [design system](DESIGN_SYSTEM.md), que passa a ser a referência para paridade;
- nenhum conteúdo histórico foi excluído ou movido;
- `docs/` deixou de ser ignorado para a nova documentação ser versionada.

Ação planejada após o corte para SvelteKit:

- reescrever o README com setup e arquitetura reais;
- arquivar o `CLAUDE.md` atual como documento histórico do Next ou substituí-lo
  por regras SvelteKit revisadas;
- consolidar a documentação de API a partir de uma especificação executável;
- remover arquivos legados apenas em PR separado e revisável.

## 1. `levity-web/README.md`

Status: **obsoleto como documentação técnica; útil apenas como visão histórica de
produto**.

### Informações incorretas ou não confirmadas

| README antigo                                       | Código atual                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| Next.js 15+                                         | package instala Next 16.2.4                                        |
| backend Supabase Auth + PostgreSQL                  | frontend chama API Fastify separada com JWT; não importa Supabase  |
| Backblaze B2 integrado diretamente ao Next          | storage pertence ao backend e pode ser Backblaze, S3 ou Cloudinary |
| proxy `/app/file/...` no Next                       | não existe route handler assim; backend expõe `/api/files/...`     |
| pastas `actions`, `components`, `interfaces`, `lib` | estrutura real é `app`, `contracts`, `features`, `infra`, `ui`     |
| env de Supabase/Backblaze no web                    | web usa apenas `EXTERNAL_API_URL` e `NODE_ENV`                     |
| interações em tempo real                            | não há WebSocket/SSE; notificações atualizam no mount/focus        |
| storage aceita arquivos de forma ampla              | backend aceita somente quatro MIME types de imagem                 |

### O que vale preservar

- descrição de Kanban/workspaces;
- intenção de rich text, Markdown, comentários, menções, DnD e diagramas;
- identidade visual, logo e stack histórica;
- comandos npm, depois de corrigidos para requisitos reais.

### Plano

Durante a migração, manter o aviso no topo. Quando o SvelteKit assumir produção,
substituir todo o corpo por:

- stack SvelteKit e versão mínima do Node;
- relação com `levity-api`;
- setup local dos dois repositórios;
- `.env.example` real;
- comandos dev/build/test/lint;
- visão da arquitetura BFF e links para docs;
- política de contrato snake_case/mappers;
- estado do deploy.

O texto atual pode então ser movido para
`docs/legacy/README.next-legacy.md`. Não recomendo simplesmente deletá-lo no mesmo
commit da migração, pois isso dificulta investigar decisões antigas.

## 2. `levity-web/CLAUDE.md`

Status: **parcialmente útil no Next; inadequado como instrução SvelteKit**.

### Partes ainda úteis

- separação UI → action → use-case → repository → HTTP;
- Zod na borda e tipos explícitos;
- tratamento consistente de erro;
- imports por alias;
- evitar `any`, warnings e APIs deprecated;
- componentes pequenos e sem regra de negócio de infraestrutura.

### Partes exclusivas do framework atual

- `'use server'`/`'use client'`;
- Server Actions e `revalidatePath`;
- App Router e `next/*`;
- `forwardRef`, React hooks, `displayName`;
- regras de JSX/React e hidratação Next;
- layout de pastas específico do Next.

### Divergências entre as regras e o código

O arquivo exige zero warnings e proíbe `any`, mas a auditoria encontrou 234
ocorrências de lint (164 erros e 70 warnings), muitos `any` e build quebrado. Ele
afirma boundaries “invioláveis”, enquanto upload/logout e algumas pages fogem do
fluxo. Portanto ele descreve um ideal, não o estado real.

### Plano

Manter durante a coexistência para alterações no Next. No início da implementação
SvelteKit, criar instruções próprias baseadas em:

- route groups, loads, actions, hooks e server-only modules;
- Svelte 5 runes e estado por instância;
- wire contracts/mappers;
- testes e critérios definidos no plano.

No corte, mover o atual para `docs/legacy/CLAUDE.next-legacy.md`. Se o time usa
outro arquivo de instrução (`AGENTS.md`, por exemplo), consolidar em um único
arquivo para evitar regras contraditórias.

## 3. `levity-web/docs/patterns.md`

Status: **legado React e parcialmente contraditório com o lint atual**.

O documento registra decisões reais de `useBoardData`, `useDiagram` e
`useCardModal`, mas chama escrita em `ref.current` durante render de “padrão
correto”. O ESLint atual acusa exatamente esse uso com `react-hooks/refs`.

Plano: manter como explicação histórica enquanto o Next existir. Na migração,
portar a intenção (callbacks sem stale closure, cleanup e autosave) para estado
por instância Svelte, validado por testes, e arquivar o arquivo no corte.

## 4. `levity-api/docs/API.md`

Status: **reconciliado em 2026-09-14 com `levity-api@2eef9c7`**.

### O que foi corrigido

- inventário completo das 63 rotas `/api`;
- separação workspace → boards → columns/issues e sprints por board;
- roles de workspace e board, status e demais enums uppercase;
- convites com `board_grants`, novos DTOs, WIP e prioridade de sistema;
- contratos atuais de users, comments, notifications, diagrams e files;
- matriz de permissões correspondente aos guards atuais.

### Limitação restante

- Swagger registra bem paths e request schemas, mas quase nenhuma rota declara
  response schema. O Markdown ainda é necessário para shapes e regras de negócio;
  contract tests continuam obrigatórios.

### Plano

Não copiar tipos manualmente desse arquivo para o SvelteKit. Usá-lo como
referência humana enquanto `API_CONTRACTS.md` registra o recorte e as divergências
do frontend. Evoluir o OpenAPI para incluir responses e manter:

- documentação humana para regras e exemplos;
- especificação gerada para paths/schemas;
- testes de contrato no frontend.

## 5. `rename-snake-case.js`

Status: **script perigoso e desnecessário para a migração**.

Ele substitui tokens snake_case por camelCase em todos os arquivos de código sem
entender se o token é identificador interno, propriedade de wire, query param ou
conteúdo. Isso explica várias divergências atuais e pode corromper contratos de
API novamente.

Plano: não executar. Após os mappers e testes da Fase 0, remover em PR separado ou
arquivar com uma nota explícita de “não usar”. A conversão deve ser semântica e
localizada nos mappers.

## 6. Dependências legadas no `package.json`

Status: **não são documentação, mas contam uma história técnica falsa**.

AWS SDK, Supabase, Backblaze, bcrypt, jose, sharp e TanStack Query estão instalados
sem import em `src`. Isso reforça o README antigo, embora a aplicação atual não os
use. Não copiá-los para SvelteKit.

Plano: retirar somente quando o novo package estiver estabilizado ou em limpeza
separada do Next, sempre validando build e comportamento.

## 7. `levity-api/docs/boas-praticas-node.md`

Status: **arquitetura de referência, não descrição do backend atual**.

O guia propõe monorepo npm, packages, Redis, filas, worker e `node:test`. O
backend atual é um package único, não possui Redis/worker e usa Vitest + Postgres.
Foi adicionado um aviso de escopo com link para `API.md`; os exemplos aspiracionais
foram preservados, pois reescrevê-los como inventário eliminaria a finalidade do
guia.

## 8. `levity-api/docs/schema-alterations.json`

Status: **plano histórico implementado e parcialmente supersedido**.

O arquivo ainda se declarava `specified_not_applied` e fonte de verdade, embora
o baseline, a camada de aplicação e uma migração posterior de enums uppercase já
tenham sido entregues. Ele agora começa por `current_state`, impede reexecução do
plano antigo e registra as duas migrations efetivas. O bloco `target_schema`
lowercase foi preservado como fotografia do baseline anterior à migração
`UppercaseEnumValues`.

## 9. Política de remoção

Uma documentação/arquivo legado só deve ser apagado quando:

1. a informação ainda válida foi incorporada ao documento novo;
2. não existe mais implementação Next em produção nem branch de manutenção ativa;
3. links internos e onboarding foram atualizados;
4. a remoção aparece isolada e clara no diff;
5. o histórico continua acessível no Git ou em `docs/legacy`.

Até lá, avisos de obsolescência são mais seguros do que exclusão silenciosa.

# Auditoria da documentação existente

## Decisão resumida

A documentação antiga não deve ser apagada agora, porque ainda registra intenção
de produto, convenções visuais e regras do frontend Next durante a transição. Ela
também não pode continuar sendo tratada como fonte de verdade da migração.

Ação aplicada nesta auditoria:

- `README.md` recebeu aviso de conteúdo desatualizado e link para este conjunto;
- `CLAUDE.md` recebeu aviso de escopo: manutenção Next, não arquitetura SvelteKit;
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

## 3. `levity-api/docs/API.md`

Status: **referência útil, mas incompleta e parcialmente divergente do backend**.

### O que está bom

- base `/api`, JWT Bearer e códigos HTTP;
- grande parte das rotas de auth, users, workspaces, board, comments,
  notifications, diagrams e files;
- exemplos de payload snake_case;
- notas de bulk update, cursor, users/members e storage key.

### O que precisa ser corrigido

- resumo lista 45 rotas, enquanto os controllers atuais expõem 59;
- não cobre sprints, histórico de card, replies e download assinado;
- resposta de comments descrita não coincide com o service atual;
- notificações são descritas principalmente como paginação offset, mas o backend
  também aceita cursor;
- detalhes de validação estruturados não são enviados pelo error handler atual;
- tabela de roles não corresponde ao enforcement: board/sprint usam apenas
  membership; create/delete de tag/priority exigem owner/admin;
- exemplos de alguns modelos ficaram atrás de campos novos como story points e
  estimated hours.

### Plano

Não duplicar manualmente esse arquivo no SvelteKit. Usá-lo como material de apoio
enquanto `API_CONTRACTS.md` registra o que o front realmente precisa. Depois,
gerar OpenAPI/JSON Schema a partir dos schemas/controllers do backend e manter:

- documentação humana para regras e exemplos;
- especificação gerada para paths/schemas;
- testes de contrato no frontend.

## 4. `rename-snake-case.js`

Status: **script perigoso e desnecessário para a migração**.

Ele substitui tokens snake_case por camelCase em todos os arquivos de código sem
entender se o token é identificador interno, propriedade de wire, query param ou
conteúdo. Isso explica várias divergências atuais e pode corromper contratos de
API novamente.

Plano: não executar. Após os mappers e testes da Fase 0, remover em PR separado ou
arquivar com uma nota explícita de “não usar”. A conversão deve ser semântica e
localizada nos mappers.

## 5. Dependências legadas no `package.json`

Status: **não são documentação, mas contam uma história técnica falsa**.

AWS SDK, Supabase, Backblaze, bcrypt, jose, sharp e TanStack Query estão instalados
sem import em `src`. Isso reforça o README antigo, embora a aplicação atual não os
use. Não copiá-los para SvelteKit.

Plano: retirar somente quando o novo package estiver estabilizado ou em limpeza
separada do Next, sempre validando build e comportamento.

## 6. Política de remoção

Uma documentação/arquivo legado só deve ser apagado quando:

1. a informação ainda válida foi incorporada ao documento novo;
2. não existe mais implementação Next em produção nem branch de manutenção ativa;
3. links internos e onboarding foram atualizados;
4. a remoção aparece isolada e clara no diff;
5. o histórico continua acessível no Git ou em `docs/legacy`.

Até lá, avisos de obsolescência são mais seguros do que exclusão silenciosa.

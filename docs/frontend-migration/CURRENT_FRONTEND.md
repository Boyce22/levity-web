# Arquitetura atual do frontend

## 1. Visão geral

O frontend atual é um servidor Next.js 16.2.4 com App Router e React 19.2.4.
Ele atua como Backend for Frontend (BFF): o navegador chama Server Actions do
Next; essas ações chamam uma API Fastify separada. O token JWT não é exposto ao
JavaScript do navegador.

```text
Navegador
  -> páginas e componentes React
  -> Next Server Actions
  -> use-cases do frontend
  -> repositories do frontend
  -> ServerApiClient + cookie "token"
  -> HTTP Authorization: Bearer <JWT>
  -> Fastify em EXTERNAL_API_URL/api
  -> PostgreSQL + provedor de storage
```

Não há conexão WebSocket, SSE, Supabase ou banco direto no código atual do
frontend. “Tempo real” no README antigo não existe: notificações são buscadas ao
montar o sino e quando a janela recupera foco.

## 2. Fronteiras dos repositórios

O diretório pai contém dois repositórios Git independentes:

- `levity-web`: frontend Next/React e esta documentação;
- `levity-api`: API Fastify, domínio, aplicação, persistência e storage.

Não existe workspace npm compartilhado entre os dois. Tipos e schemas são
duplicados. Essa duplicação está divergente e é hoje o maior risco funcional.

## 3. Rotas da aplicação

| URL                                 | Arquivo atual                                       | Renderização e dados                                                                                        | Equivalência SvelteKit                                                     |
| ----------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `/`                                 | `src/app/page.tsx`                                  | Server Component dinâmico. Carrega board, perfil e usuários; entrega tudo a `Board`. Usa `?workspace=<id>`. | `src/routes/+page.server.ts` + `+page.svelte`                              |
| `/login`                            | `src/app/login/page.tsx`                            | Página estática que monta formulário client-side; login ocorre por Server Action.                           | `src/routes/login/+page.svelte` + `+page.server.ts`                        |
| `/register`                         | `src/app/register/page.tsx`                         | Mesmo componente de auth em modo register.                                                                  | `src/routes/register/+page.svelte` + `+page.server.ts`                     |
| `/invite/[workspaceId]/[token]`     | `src/app/invite/[workspaceId]/[token]/page.tsx`     | Busca convite no servidor, verifica cookie, aceita via form action inline.                                  | `src/routes/invite/[workspaceId]/[token]/+page.server.ts` + `+page.svelte` |
| `/sprints/[workspaceId]/[sprintId]` | `src/app/sprints/[workspaceId]/[sprintId]/page.tsx` | Carrega sprint, lista de sprints, board, perfil e usuários em paralelo.                                     | mesma árvore em `src/routes`, com `+page.server.ts`                        |
| `/sprints/[workspaceId]/new`        | `src/app/sprints/[workspaceId]/new/page.tsx`        | Redireciona para sprint planning/primeira sprint ou monta estado vazio.                                     | mesma árvore em `src/routes`, com `+page.server.ts`                        |
| qualquer rota inválida              | `src/app/not-found.tsx`                             | 404 client-side animada.                                                                                    | `src/routes/+error.svelte`                                                 |

`src/app/layout.tsx` define metadata, idioma `en`, fontes Geist e importa
`globals.css`. `loading.tsx` e o loading de sprint usam `ProgressLoader`.

Há duas formas de acessar sprints: rotas dedicadas e o estado local
`activeView === "sprints"` dentro de `Board`. A migração deve escolher uma única
fonte de navegação; a recomendação é URL real, preservando deep links, histórico
do navegador e recarregamento.

## 4. Proteção de rotas e sessão

`src/proxy.ts` funciona como middleware do Next:

- `/login` e `/register`: redireciona usuário com token estruturalmente válido
  para `/`;
- todas as demais rotas: redireciona para `/login` se o cookie não existir ou não
  parecer um JWT com três partes;
- ignora apenas `_next/static`, `_next/image` e `favicon.ico`.

`src/infra/auth/session.ts`:

- lê/escreve cookie `token`;
- atributos: `httpOnly`, `sameSite=lax`, `secure` em produção, `path=/`, 24 h;
- decodifica o payload JWT sem verificar assinatura nem expiração;
- `requireSession()` só confirma existência/estrutura local; a API é quem valida
  criptograficamente o Bearer token;
- `logoutAction()` apaga o cookie e redireciona para `/login`.

Defeitos atuais relevantes:

- a rota de convite também é bloqueada pelo proxy antes de poder mostrar o
  preview público planejado;
- o backend também exige Bearer no GET de detalhes do convite, apesar de o
  use-case do frontend declará-lo público;
- o regex de `callbackUrl` no login aceita apenas `/invite/<um-segmento>`, mas a
  URL real possui `workspaceId` e `token`;
- vida do cookie é fixa em 24 h, enquanto a expiração do JWT é configurável por
  `JWT_EXPIRES_IN` no backend.

## 5. Camadas do código atual

O desenho nominal é:

```text
app/features components -> actions -> use-cases -> repositories -> HTTP client
```

### 5.1 UI e componentes

- `src/app`: rotas e carregamento inicial;
- `src/features/*/components`: UI de domínio;
- `src/features/*/hooks`: estado e orquestração client-side;
- `src/ui/primitives`: `Button`, `Card`, `Input` genéricos;
- `src/ui/components`: seleção, modal de confirmação, loader, logo, campo e editor;
- `src/ui/utils`: composição de classes, datas e parsing de anexos.

### 5.2 Actions

Arquivos `features/*/server/actions/*.actions.ts` usam `'use server'`. Queries
delegam para use-cases; mutações normalmente chamam `revalidatePath('/')`.

Exceções importantes:

- `uploadImageAction` e `deleteFileAction` vivem em `infra/storage/upload.ts`, não
  na feature de arquivos;
- `logoutAction` chama infraestrutura diretamente;
- atualizações de posição não revalidam porque a UI mantém estado otimista;
- a ação inline de aceitar convite mistura tratamento de erro e redirect na page.

### 5.3 Use-cases

Validam sessão e, em alguns fluxos, entrada com Zod. Também fazem orquestração:

- `getBoardUseCase` cria automaticamente “My Workspace” se o usuário não tiver
  workspace, escolhe o workspace ativo, busca board e convites e calcula role;
- `getAllUsersUseCase` ordena usuários para exibição;
- `uploadAvatarUseCase` converte base64 em `Blob/FormData`;
- `saveDiagramUseCase` limita o JSON a 256 KiB e valida até 1.000 elementos;
- auth cria a sessão após login/register.

Nem todos os inputs externos são validados e vários use-cases só encaminham
objetos camelCase incompatíveis com a API.

### 5.4 Repositories

São adaptadores HTTP, mas hoje não adaptam o wire format. Alguns validam respostas
com schemas Zod camelCase; outros retornam `any`. O novo frontend deve concentrar
conversão snake_case ↔ camelCase aqui e nunca deixá-la espalhada pela UI.

### 5.5 Clientes HTTP

- `serverApiClient.ts`: usado por todos os repositories; base
  `${EXTERNAL_API_URL || "http://localhost:3001"}/api`; injeta Bearer lido do
  cookie; serializa JSON ou preserva `FormData`; retorna JSON, texto ou `undefined`
  para 204; não define timeout/retry/cache.
- `browserApiClient.ts`: não possui consumidores. Monta `/api/v1<path>`, porém não
  há route handler/rewrite correspondente no projeto. Não deve ser portado sem um
  caso de uso comprovado.
- `apiClient.ts`: somente barrel dos dois clientes e tipos de erro.

## 6. Inventário funcional por feature

### 6.1 Auth

Arquivos principais: `AuthContainer`, `AuthBackground`, `AuthForm`, `AuthHeader`,
`AuthInputs`, `AuthFooter` e a cadeia action/use-case/repository.

Fluxo:

1. usuário informa username/password;
2. register confirma senha apenas no cliente; email não é coletado;
3. Server Action chama `/auth/login` ou `/auth/register`;
4. `accessToken` vira cookie HttpOnly;
5. navegador faz hard navigation para callback ou `/`.

Estado local: modo, campos, visibilidade de senha, erro e loading. Não há reset de
senha, refresh token, logout na API nem persistência client-side do token.

### 6.2 Board

`Board.tsx` é o shell client-side. Controla view ativa, modais e card selecionado.
Compõe:

- `Sidebar`: seleção de workspace, board/sprints/management, perfil e logout;
- `BoardHeader`: nome, contadores, share e notificações;
- `BoardFiltersBar`: busca, membros, prioridade e label;
- `BoardCanvas`: listas horizontais e inclusão de lista;
- `List`: header, tipo, WIP, cards droppable e inclusão de card;
- `Card`: preview, badges, progresso, capa e abertura do modal;
- `BoardModals`: perfil, settings, criação/share e edição do card.

`useBoardData` guarda `lists`, `cards`, contadores e readiness. Criação de lista e
card usa ID `temp-<timestamp>`; exclusão e alterações são otimistas. Falhas de
create/delete não possuem rollback confiável em todos os caminhos.

`useFilters` deriva cards por texto em content/description, assignee (inclui
`unassigned`), priority e label.

`useDragDrop`:

- reordena listas e envia o array completo `{id, position}`;
- reordena cards e envia cards de origem/destino com `{id, listId, position}`;
- atualiza a UI antes da API e não restaura o snapshot em erro;
- não aplica WIP/role no cliente antes de arrastar.

`useWorkspaceResolution` persiste `last-workspace-id` em `localStorage`, usa o
query param `workspace` como prioridade e força loader mínimo de 1,2 s.

### 6.3 Modal do card

`CardModal` reúne description, comments e diagram. `useCardModal` concentra:

- estado editável de título, descrição, capa, data, label, priority e assignee;
- autosave da descrição após debounce de 3 s;
- cálculo de progresso a partir de checkboxes Markdown;
- updates rápidos otimistas para assignee/label/priority/due date/cover;
- carregamento lazy de histórico, comentários e diagrama por aba;
- comentários em páginas de 3, usando `createdAt` do último comentário pai como
  cursor;
- save do diagrama otimista, sem rollback;
- atalho Escape para salvar/fechar no componente modal.

Componentes internos:

- header/breadcrumbs/status/checklist/cover/tabs;
- pickers de membro, label, prioridade e data;
- descrição com preview React Markdown e editor TipTap;
- thread de comentários, reply, edit/delete e anexos;
- diagrama com toolbar, SVG/canvas, formas RoughJS e traço Perfect Freehand.

O editor TipTap suporta Markdown/GFM, imagens, tabelas e task lists. Drag/drop,
paste e seletor enviam arquivos. A UI limita imagens a 3 MiB e outros arquivos a
10 MiB, mas o backend aceita somente MIME de imagem; “outros arquivos” falharão.

Anexos são embutidos no Markdown como URLs. `attachments.ts` reconhece links
Markdown e considera imagem apenas URLs contendo `/file/` ou `backblazeb2.com`,
uma regra acoplada a storage legado e incompatível com URLs de outros providers.
Ao excluir, `DescriptionTab` envia a própria URL assinada como `key`; o backend
exige a key iniciada por `<workspaceId>/`, portanto o delete também precisa de um
modelo que preserve `publicId` separadamente.

### 6.4 Diagramas

O estado é mantido por `useDiagram`:

- ferramentas path, rect, circle, db, cloud, server, user, arrow, line e eraser;
- UUID client-side;
- undo/redo, seleção, drag, resize, pan e zoom;
- divisão de paths longos para respeitar 2.500 pontos;
- limite contratual de 1.000 elementos e 256 KiB no frontend.

A UI usa propriedades `w`/`h`, mas o backend documenta/valida `width`/`height`.
Essa decisão deve ser unificada antes de portar a renderização.

### 6.5 Comentários e notificações

Comentários suportam Markdown, anexos, replies e menções visuais. O backend
detecta `@username`, mas o método de resolução de usuários está apenas registrado
em log; criação real de notificações de mention ainda não está ligada. Replies
podem gerar notificação ao autor do comentário pai.

Notificações:

- fetch ao montar `NotificationBell`;
- novo fetch no evento `window.focus`;
- ao abrir, marca todas como lidas de forma otimista;
- não usa `markNotificationReadAction` individualmente;
- clique procura o card apenas no snapshot local e abre a aba comments.

Não há polling contínuo nem push.

### 6.6 Workspaces, membros e settings

- cria workspace e navega com `?workspace=<id>`;
- renomeia e exclui workspace;
- cria/revoga convites e copia link;
- altera role e remove membro;
- cria/exclui labels e prioridades dentro dos pickers do card;
- management recebe `allUsers`, não o resultado de GET `/members`.

O parâmetro chamado `memberId` pelo frontend/backend controller é, no repository
de persistência, tratado como `user_id`. Manter esse detalhe explícito na nova UI.

No shell atual, `createWorkspaceAction` recebe diretamente uma string, mas o
use-case valida um objeto `{ name }`; a criação iniciada por `Board` falha antes
da chamada HTTP. A normalização de membros também consulta `raw.userId`, enquanto
o board real retorna `user_id`, fazendo a role cair no fallback `member` caso o
restante do snapshot fosse aceito.

### 6.7 Perfil

`ProfileModal` edita display name, bio, email e avatar. O avatar é convertido para
base64 no browser, reconstruído como upload multipart no servidor Next e depois a
UI tenta salvar a URL no perfil. O caminho, o campo e a resposta atuais não
coincidem com a API; consultar `API_CONTRACTS.md`.

### 6.8 Sprints

Conceitos: planning/active/completed; tracking por points/count/hours; capacidade,
velocity, progresso, cards e carry-over ao completar.

`SprintPanel` também busca dados após montar, mesmo quando existem rotas SSR.
`useSprints` e `useSprintCards` oferecem atualizações otimistas com rollback em
alguns erros. Há duplicação entre esses hooks e callbacks internos do painel.

Regras confirmadas no backend:

- só sprint planning pode ser excluída ou ativada;
- apenas uma sprint ativa por workspace;
- só sprint ativa pode ser concluída;
- card não pode estar em outra sprint ativa;
- concluir pode mover cards incompletos para `to_sprint_id`;
- velocity usa pontos, horas ou quantidade de cards 100% completos.

## 7. Estado, cache e sincronização

Não há Redux, Zustand ou TanStack Query em uso. Estado remoto é copiado para
`useState` e atualizado manualmente. `revalidatePath('/')` invalida o cache Next,
mas componentes já montados continuam dependendo do estado local otimista.

Tabela de migração conceitual:

| Estado atual      | Dono atual                 | Requisito no novo front                                        |
| ----------------- | -------------------------- | -------------------------------------------------------------- |
| sessão/token      | cookie Next + API          | cookie HttpOnly no servidor SvelteKit e `locals.user`          |
| workspace ativo   | query param + localStorage | URL como fonte; localStorage apenas preferência/fallback       |
| board/lists/cards | page SSR + `useBoardData`  | `load` server-side + estado local otimista isolado             |
| filtros           | `useFilters`               | `$state` local e `$derived` para resultado filtrado            |
| card modal        | `useCardModal`             | módulo de estado por instância; cancelar timers ao desmontar   |
| notificações      | `NotificationBell`         | dado inicial do layout e refresh explícito/focus               |
| sprints           | page/panel + dois hooks    | store/controlador único por rota/workspace                     |
| tema              | atributo CSS esperado      | persistir e aplicar no layout; hoje não há controlador central |

## 8. CSS, assets e acessibilidade

- Tailwind CSS 4 via `@import "tailwindcss"` e plugin typography;
- tokens semânticos CSS para temas `dark`, `artic` e `omni`;
- Geist carregada por `next/font/google`;
- `levity_logo.png`, favicon e SVGs default do Next em `public`;
- 404 carrega textura remota de `grainy-gradients.vercel.app`;
- avatares sem URL usam `api.dicebear.com`;
- várias animações dependem de Framer Motion;
- há uso intenso de portais/DOM direto, selection/range, contenteditable, clipboard,
  keyboard handlers, canvas/SVG e file inputs.

A migração deve preservar focus management, teclado, composição IME, reduced
motion, labels/alt e cleanup de listeners. O lint atual já acusa problemas de
acessibilidade em imagens e markup; não considerar o HTML atual como baseline
automaticamente aprovado.

## 9. Dependências

### Confirmadas em uso

| Categoria       | Pacotes/função                                                                             |
| --------------- | ------------------------------------------------------------------------------------------ |
| framework       | `next`, `react`, `react-dom`                                                               |
| estilo          | `tailwindcss`, `@tailwindcss/typography`, `clsx`, `tailwind-merge`                         |
| animação/ícones | `framer-motion`, `lucide-react`                                                            |
| drag/drop       | `@hello-pangea/dnd`                                                                        |
| rich text       | TipTap React, StarterKit, image, placeholder, markdown, table, task list/item, ProseMirror |
| Markdown        | `marked`, `react-markdown`, `remark-gfm`                                                   |
| diagrama        | `perfect-freehand`, `roughjs`, `uuid`                                                      |
| validação       | `zod`                                                                                      |

### Sem import em `src` ou suspeitas de legado

`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`,
`@supabase/supabase-js`, `@tanstack/react-query`, `backblaze-b2`, `bcryptjs`,
`jose` e `sharp` não são importados pelo frontend atual. Não devem entrar no novo
package.json sem um uso comprovado. Os subpacotes TipTap de table row/cell/header
também não são importados diretamente, pois a versão instalada os reexporta a
partir de `@tiptap/extension-table`.

## 10. Variáveis de ambiente do frontend

| Variável           | Onde                 | Uso                                                                                   |
| ------------------ | -------------------- | ------------------------------------------------------------------------------------- |
| `EXTERNAL_API_URL` | `serverApiClient.ts` | origem privada da API; default `http://localhost:3001`; recebe `/api` automaticamente |
| `NODE_ENV`         | sessão               | habilita `secure` no cookie em produção                                               |

Não existe `.env.example` no frontend. A migração deve criar um exemplo sem
segredos e mapear a URL privada por `$env/static/private` ou `$env/dynamic/private`.
Não criar variável `PUBLIC_` para a API enquanto o padrão BFF for mantido.

## 11. Pontos específicos do Next/React a remover

- `src/app/**`, `layout.tsx`, `loading.tsx`, `not-found.tsx`;
- `'use client'` e `'use server'`;
- `next/navigation`: `redirect`, `useRouter` e `isRedirectError` interno;
- `next/headers`: `cookies()`;
- `next/cache`: `revalidatePath`;
- `next/font/google`;
- `next/link`;
- `src/proxy.ts` e matcher;
- tipos JSX/React, hooks e `forwardRef`;
- Server Action imports dentro de componentes.

Não fazer conversão mecânica arquivo por arquivo. Primeiro estabilizar o contrato
HTTP; depois migrar verticalmente por fluxo, usando as equivalências documentadas
em `SVELTEKIT_PLAN.md`.

## 12. Critérios de preservação funcional

Antes de retirar o Next, o SvelteKit deve provar:

- login, register, logout e retorno correto ao convite;
- seleção/persistência de workspace e criação automática do primeiro workspace;
- board, filtros, CRUD, DnD entre listas e rollback em falha;
- modal com autosave, histórico, comments/replies/mentions e anexos;
- diagrama completo com limites, undo/redo, pan/zoom e persistência;
- sprints e suas regras de estado/carry-over;
- perfil/avatar, membros, convites, labels e prioridades;
- notificações no load/focus e navegação ao card;
- temas, responsividade, teclado e acessibilidade;
- ausência de token no JavaScript e de chamadas diretas não autorizadas à API.

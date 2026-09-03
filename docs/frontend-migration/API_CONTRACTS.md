# Contratos HTTP e integrações

## 1. Contrato de transporte confirmado

Fonte deste capítulo: controllers, schemas Zod e services do `levity-api`, não a
forma esperada pelos contracts do frontend.

| Item                       | Valor implementado                                                     |
| -------------------------- | ---------------------------------------------------------------------- |
| origem default no frontend | `http://localhost:3001`                                                |
| prefixo da API             | `/api`                                                                 |
| autenticação               | `Authorization: Bearer <accessToken>`                                  |
| token                      | JWT com payload `{ id, username }`; expiração default 24 h             |
| request JSON               | `Content-Type: application/json`                                       |
| upload                     | `multipart/form-data`; boundary gerado pela runtime                    |
| sucesso sem corpo          | HTTP 204                                                               |
| erro conhecido             | `{ "error": "mensagem", "code": "CODIGO" }`                            |
| erro inesperado            | HTTP 500, `{ "error": "Internal server error" }`                       |
| limite global de body      | 10 MiB                                                                 |
| CORS                       | origens de `CORS_ORIGIN`, credentials habilitados                      |
| rate limit                 | somente produção; default 100 requests/15 min por configuração Fastify |

O `ServerApiClient` do Next é o único cliente usado. Ele lê o cookie HttpOnly,
injeta Bearer e chama a API server-to-server. O frontend não implementa refresh
token, retry, timeout, abort, deduplicação ou idempotency key.

## 2. Regra de casing

O wire format real da API é **snake_case**. A UI atual modela entidades em
**camelCase**, porém não existe mapper entre os dois formatos. O script
`rename-snake-case.js` aparentemente converteu identificadores de forma global e
acabou alterando também payloads que deveriam continuar iguais ao contrato HTTP.

Arquitetura obrigatória no novo frontend:

```text
API JSON snake_case
  <-> schemas Wire* (validação na borda)
  <-> funções explícitas fromWire/toWire
  <-> modelos de UI camelCase
```

Não usar conversor recursivo genérico: campos como conteúdo Markdown, keys de
storage, propriedades de diagramas e payloads externos não podem ser renomeados
às cegas.

## 3. Inventário completo dos endpoints expostos

Legenda da coluna “front atual”:

- `usa`: há chamada e o método/caminho coincidem;
- `quebrado`: há chamada, mas caminho, payload ou schema não coincide;
- `não usa`: disponível na API, sem consumidor atual.

### 3.1 Auth e usuários

| Método e rota             | Auth | Função                          | Front atual                  |
| ------------------------- | ---: | ------------------------------- | ---------------------------- |
| `POST /api/auth/login`    |  não | autentica username/password     | usa                          |
| `POST /api/auth/register` |  não | cria usuário e autentica        | usa                          |
| `GET /api/users/me`       |  sim | perfil privado                  | quebrado na resposta         |
| `PATCH /api/users/me`     |  sim | atualiza perfil                 | quebrado no payload/resposta |
| `GET /api/users/`         |  sim | usuários de workspace por query | quebrado na query/resposta   |

### 3.2 Workspaces, convites, membros e settings

| Método e rota                                       | Regra implementada | Função                       | Front atual                        |
| --------------------------------------------------- | ------------------ | ---------------------------- | ---------------------------------- |
| `GET /api/workspaces/`                              | autenticado        | listar workspaces do usuário | usa; campos extras são descartados |
| `POST /api/workspaces/`                             | autenticado        | criar workspace e owner      | usa                                |
| `PATCH /api/workspaces/:id`                         | owner/admin        | renomear                     | usa                                |
| `DELETE /api/workspaces/:id`                        | owner              | excluir                      | usa                                |
| `GET /api/workspaces/:id/invites`                   | owner/admin        | listar convites              | usa, sem schema                    |
| `POST /api/workspaces/:id/invites`                  | owner/admin        | gerar convite                | quebrado parcialmente no payload   |
| `GET /api/workspaces/:id/invites/:token`            | autenticado        | detalhes pelo token          | quebrado no fluxo/resposta         |
| `POST /api/workspaces/:id/invites/:token/accept`    | autenticado        | consumir convite             | quebrado na resposta               |
| `DELETE /api/workspaces/:id/invites/:inviteId`      | owner/admin        | revogar                      | usa                                |
| `GET /api/workspaces/:id/members`                   | membro             | listar memberships           | não usa diretamente                |
| `PATCH /api/workspaces/:id/members/:memberId/role`  | owner/admin        | alterar role                 | usa                                |
| `DELETE /api/workspaces/:id/members/:memberId`      | owner/admin        | remover                      | usa                                |
| `GET /api/workspaces/:id/tags`                      | membro             | listar labels                | não usa diretamente; vêm no board  |
| `POST /api/workspaces/:id/tags`                     | owner/admin        | criar label                  | usa                                |
| `DELETE /api/workspaces/:id/tags/:tagId`            | owner/admin        | excluir label                | usa                                |
| `GET /api/workspaces/:id/priorities`                | membro             | listar prioridades           | não usa diretamente; vêm no board  |
| `POST /api/workspaces/:id/priorities`               | owner/admin        | criar prioridade             | usa                                |
| `DELETE /api/workspaces/:id/priorities/:priorityId` | owner/admin        | excluir prioridade           | usa                                |

Em update/remove member, `:memberId` é passado a métodos que pesquisam
`user_id`, não o UUID da entidade membership. O nome do parâmetro é enganoso.

### 3.3 Board, listas, cards e histórico

| Método e rota                                            | Regra implementada | Função                | Front atual                         |
| -------------------------------------------------------- | ------------------ | --------------------- | ----------------------------------- |
| `GET /api/workspaces/:workspaceId/board`                 | membro             | snapshot do board     | quebrado na resposta                |
| `POST /api/workspaces/:workspaceId/lists`                | membro             | criar lista           | resposta quebrada                   |
| `PATCH /api/workspaces/:workspaceId/lists/positions`     | membro             | reordenar listas      | usa                                 |
| `PATCH /api/workspaces/:workspaceId/lists/:listId`       | membro             | atualizar lista       | parcial; campos camel são ignorados |
| `DELETE /api/workspaces/:workspaceId/lists/:listId`      | membro             | excluir lista/cards   | usa                                 |
| `POST /api/workspaces/:workspaceId/cards`                | membro             | criar card            | quebrado no payload                 |
| `PATCH /api/workspaces/:workspaceId/cards/positions`     | membro             | mover/reordenar cards | parcial; mudança de lista quebra    |
| `PATCH /api/workspaces/:workspaceId/cards/:cardId`       | membro             | atualizar card        | parcial; vários campos ignorados    |
| `DELETE /api/workspaces/:workspaceId/cards/:cardId`      | membro             | excluir card          | usa                                 |
| `GET /api/workspaces/:workspaceId/cards/:cardId/history` | membro             | histórico do card     | quebrado na resposta                |

Apesar de existir `Role` com viewer/editor/member/admin/owner, o `BoardService`
usa somente `assertMember` para todas as mutações. Portanto a tabela de permissões
do `levity-api/docs/API.md` não corresponde ao enforcement atual: um viewer que
seja membro passa pelos guards de CRUD do board.

### 3.4 Sprints

| Método e rota                                                         | Função                 | Front atual                |
| --------------------------------------------------------------------- | ---------------------- | -------------------------- |
| `GET /api/workspaces/:workspaceId/sprints`                            | listar sprints         | resposta quebrada          |
| `GET /api/workspaces/:workspaceId/sprints/active`                     | sprint ativa ou `null` | resposta quebrada          |
| `GET /api/workspaces/:workspaceId/sprints/:sprintId`                  | sprint com cards       | resposta quebrada          |
| `POST /api/workspaces/:workspaceId/sprints`                           | criar                  | payload/resposta quebrados |
| `PATCH /api/workspaces/:workspaceId/sprints/:sprintId`                | editar                 | payload/resposta quebrados |
| `DELETE /api/workspaces/:workspaceId/sprints/:sprintId`               | excluir planning       | usa                        |
| `POST /api/workspaces/:workspaceId/sprints/:sprintId/activate`        | ativar                 | resposta quebrada          |
| `POST /api/workspaces/:workspaceId/sprints/:sprintId/complete`        | concluir/carry-over    | payload/resposta quebrados |
| `POST /api/workspaces/:workspaceId/sprints/:sprintId/cards`           | adicionar card         | payload/resposta quebrados |
| `DELETE /api/workspaces/:workspaceId/sprints/:sprintId/cards/:cardId` | remover card           | usa                        |
| `PATCH /api/workspaces/:workspaceId/sprints/:sprintId/cards/reorder`  | reordenar sprint cards | usa                        |

Todos exigem membership; o backend não diferencia role nas rotas de sprint.

### 3.5 Comentários, notificações e diagramas

| Método e rota                       | Regra                       | Função                  | Front atual                              |
| ----------------------------------- | --------------------------- | ----------------------- | ---------------------------------------- |
| `GET /api/comments/:id/replies`     | membro do workspace do card | listar replies          | não usa; agrupa resposta da listagem     |
| `GET /api/comments/`                | membro                      | paginar comentários     | query/resposta quebradas                 |
| `POST /api/comments/`               | membro                      | criar comment/reply     | payload/resposta quebrados               |
| `PATCH /api/comments/:id`           | autor                       | editar                  | request usa; resposta quebrada           |
| `DELETE /api/comments/:id`          | autor                       | excluir                 | usa                                      |
| `GET /api/notifications/`           | próprio usuário             | paginação cursor/offset | resposta quebrada                        |
| `PATCH /api/notifications/:id/read` | próprio usuário             | marcar uma              | implementado no front, sem consumidor UI |
| `POST /api/notifications/read-all`  | próprio usuário             | marcar todas            | usa                                      |
| `GET /api/diagrams/:cardId`         | membro                      | diagrama ou `null`      | resposta/null quebrados                  |
| `PUT /api/diagrams/`                | membro                      | upsert                  | payload/resposta quebrados               |
| `DELETE /api/diagrams/:cardId`      | membro                      | excluir                 | não usa; UI salva estado vazio           |

### 3.6 Arquivos

| Método e rota                                                    | Regra                                    | Função                       | Front atual                              |
| ---------------------------------------------------------------- | ---------------------------------------- | ---------------------------- | ---------------------------------------- |
| `POST /api/files/attachments`                                    | membro do workspace                      | upload de imagem             | chama rota errada `/api/attachments`     |
| `POST /api/files/avatar`                                         | autenticado                              | resize 256×256 WebP e upload | chama rota errada `/api/users/me/avatar` |
| `DELETE /api/files/attachments`                                  | membro + key dentro do workspace         | excluir                      | chama rota errada `/api/attachments`     |
| `GET /api/files/:workspaceName/:workspaceId/:category/:fileName` | autenticado; membership para attachments | URL assinada                 | não usa                                  |

MIME aceitos: `image/jpeg`, `image/png`, `image/webp`, `image/gif`. O backend não
aceita documentos genéricos, embora o editor atual permita selecioná-los até
10 MiB.

## 4. Wire contracts por domínio

Campos `?` são opcionais; `null` aparece apenas onde indicado.

### 4.1 Auth

```ts
type LoginBody = { username: string; password: string };
// backend: username >= 3, password >= 5

type RegisterBody = {
  username: string; // 3..30
  password: string; // >= 5
  email?: string;
};

type AuthResponse = {
  accessToken: string;
  user: { id: string; username: string };
};
```

O schema do front aceita username/password com 1 caractere; a validação do
backend é mais restritiva. Alinhar a validação para feedback imediato, sem
remover a validação server-side.

### 4.2 Usuário

```ts
type UpdateUserBody = {
  display_name?: string; // 1..50
  avatar_url?: string;
  bio?: string; // <= 500
  email?: string;
};

type UserResponse = {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  email?: string;
  created_at: string;
};

type UserPublicResponse = Pick<
  UserResponse,
  "id" | "username" | "display_name" | "avatar_url"
>;
```

GET users usa `?workspace_id=<uuid>&search=<texto opcional>`. Sem workspace_id o
controller retorna `[]`.

### 4.3 Workspace

```ts
type WorkspaceResponse = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type WorkspaceMemberResponse = {
  id: string;
  workspace_id: string;
  user_id: string;
  role: "owner" | "admin" | "member" | "editor" | "viewer";
  joined_at: string;
};

type GenerateInviteBody = {
  max_uses?: number; // default 1, max 100
  expires_in_hours?: number; // max 720
  role?: WorkspaceMemberResponse["role"]; // default member
};

type WorkspaceInviteResponse = {
  id: string;
  workspace_id: string;
  token: string;
  created_by: string;
  max_uses: number;
  current_uses: number;
  expires_at?: string;
  revoked_at?: string;
  role: WorkspaceMemberResponse["role"];
  created_at: string;
};
```

Requests simples:

- create/rename workspace: `{ name }`, API aceita 1..100 caracteres;
- update member role: `{ role }`;
- create tag: `{ name, color }`, color `#RRGGBB`;
- create priority: `{ name, color, icon, position? }`.

O frontend espera detalhes derivados de convite (`workspaceName`, `isExpired`,
`isFull`) que a API não retorna. Eles devem ser derivados de
`expires_at/current_uses/max_uses`; o nome do workspace exigirá expansão do
backend ou outra leitura autorizada.

### 4.4 Board

```ts
type CreateListBody = { title: string; position?: number };
type UpdateListBody = {
  title?: string;
  position?: number;
  wip_limit?: number | null;
  list_type?: "todo" | "in_progress" | "review" | "done" | null;
};
type ListPosition = { id: string; position: number };

type CreateCardBody = {
  content: string;
  list_id: string;
  position?: number;
};
type UpdateCardBody = {
  content?: string;
  description?: string | null;
  cover_url?: string | null;
  assignee_id?: string | null;
  priority?: string | null;
  label?: string | null;
  progress?: number | null; // inteiro 0..100
  due_date?: string | null; // ISO datetime
  list_id?: string;
  position?: number;
  story_points?: number | null;
  estimated_hours?: number | null;
};
type CardPosition = { id: string; position: number; list_id?: string };
```

Snapshot:

```ts
type BoardResponse = {
  workspace: WorkspaceResponse;
  lists: Array<{
    id: string;
    title: string;
    position: number;
    wip_limit?: number;
    list_type?: string;
    workspace_id: string;
    created_at: string;
    cards: CardResponse[];
  }>;
  members: WorkspaceMemberResponse[];
  tags: Array<{
    id: string;
    workspace_id: string;
    name: string;
    color: string;
    created_at: string;
  }>;
  priorities: Array<{
    id: string;
    workspace_id: string;
    name: string;
    color: string;
    icon: string;
    position: number;
    created_at: string;
  }>;
};

type CardResponse = {
  id: string;
  content: string;
  position: number;
  description?: string;
  cover_url?: string; // URL assinada resolvida no read
  assignee_id?: string;
  priority?: string;
  label?: string;
  progress?: number;
  due_date?: string;
  list_id: string;
  created_by: string;
  created_at: string;
  comment_count: number;
  story_points?: number;
  estimated_hours?: number;
};
```

A resposta não tem `cards` no topo. Cards ficam aninhados em `lists[].cards`.
O `BoardDataSchema` atual exige top-level `cards` (com default vazio) e exige
campos camelCase nas listas, por isso falha antes mesmo de achatar cards.

Histórico:

```ts
type CardHistoryResponse = {
  id: string;
  created_by: string;
  action_type: string;
  field: string;
  old_val?: string;
  new_val?: string;
  created_at: string;
  users?: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
};
```

### 4.5 Sprint

```ts
type CreateSprintBody = {
  name: string;
  goal?: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  tracking_mode: "points" | "count" | "hours";
  capacity_points?: number;
};
type UpdateSprintBody = Partial<CreateSprintBody> & {
  goal?: string | null;
  capacity_points?: number | null;
};
type CompleteSprintBody = { to_sprint_id?: string };
type AddSprintCardBody = { card_id: string; position?: number };
type ReorderSprintCardBody = Array<{ id: string; position: number }>;

type SprintResponse = {
  id: string;
  workspace_id: string;
  name: string;
  goal?: string;
  start_date: string;
  end_date: string;
  status: "planning" | "active" | "completed";
  tracking_mode: "points" | "count" | "hours";
  capacity_points?: number;
  velocity_points?: number;
  created_by: string;
  created_at: string;
  cards?: SprintCardResponse[];
  total_cards: number;
  completed_cards: number;
  progress_percent: number;
};
```

### 4.6 Comentário

```ts
type QueryComments = {
  card_id: string;
  limit?: number; // default 20, max 50
  cursor?: string; // timestamp ISO
};
type CreateCommentBody = {
  card_id: string;
  content: string; // 1..5000
  parent_id?: string | null;
};
type CommentResponse = {
  id: string;
  card_id: string;
  created_by: string;
  parent_id?: string | null;
  content: string;
  created_at: string;
};
type CommentsPage = { data: CommentResponse[]; nextCursor?: string };
```

O frontend exige `updatedAt` e `users` em cada comentário; o service atual não os
retorna. Replies na listagem dependem de `parent_id`; o endpoint dedicado também
existe, mas não é chamado.

### 4.7 Notificação

GET aceita `read?`, `cursor?`, `page?` e `limit?`. Com cursor retorna
`{items, limit, nextCursor?}`; sem cursor retorna paginação por página.

```ts
type NotificationResponse = {
  id: string;
  user_id: string;
  actor_id: string;
  card_id: string;
  type: string;
  content: string;
  read: boolean;
  created_at: string;
};
```

Não existe `workspace_id` na resposta, mas o schema do frontend exige
`workspaceId`. Navegar para um card de outro workspace precisará desse campo ou
de um endpoint que resolva card → workspace.

### 4.8 Diagrama

```ts
type DiagramElementWire = {
  id: string;
  type:
    | "path"
    | "rect"
    | "circle"
    | "db"
    | "cloud"
    | "server"
    | "user"
    | "arrow"
    | "line"
    | "eraser";
  points?: Array<{ x: number; y: number }>;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  size?: number;
};
type SaveDiagramBody = {
  card_id: string;
  data: { elements: DiagramElementWire[] };
};
type DiagramResponse = {
  id: string;
  card_id: string;
  data: SaveDiagramBody["data"];
  created_at: string;
  updated_at: string;
};
```

GET retorna `null` com 200 quando não há diagrama. O frontend atual só converte
404 em `null`, tenta validar o `null` e falha. O modelo UI usa `w/h` e pressure em
points; o wire usa `width/height` e descarta pressure.

### 4.9 Upload

Attachment multipart:

- campo de arquivo `file`;
- campo texto `workspace_id`;
- resposta `{ url, publicId }`;
- key interna `${workspaceId}/attachments/${userId}_${uuid}.${ext}`.

Avatar multipart:

- campo de arquivo `file`;
- resposta `{ url, publicId }`;
- arquivo convertido para `avatars/<userId>.webp`;
- o upload sozinho não atualiza `users.avatar_url`; é preciso persistir a key/URL
  pelo fluxo de perfil, conforme decisão de contrato.

Delete attachment JSON: `{ workspace_id, key }`. A key precisa começar com
`<workspaceId>/`.

URLs de leitura são assinadas no backend. O board e os endpoints de usuário já
resolvem keys em URLs temporárias. Guardar a URL assinada como identidade do
arquivo impede exclusão futura; persistir `publicId`/key separadamente.

## 5. Matriz de divergências comprovadas

| Área                 | Front envia/espera                                 | API aceita/retorna                | Efeito                                 |
| -------------------- | -------------------------------------------------- | --------------------------------- | -------------------------------------- |
| create workspace UI  | action recebe string                               | use-case do front exige `{name}`  | Zod falha antes do HTTP                |
| users query          | `workspaceId`                                      | `workspace_id`                    | retorna `[]`                           |
| perfil               | `displayName`, `avatarUrl`                         | `display_name`, `avatar_url`      | campos ignorados pelo Zod              |
| user response        | camelCase                                          | snake_case                        | opcionais somem após parse             |
| invite body          | `maxUses`, `expiresInHours`                        | `max_uses`, `expires_in_hours`    | defaults do backend substituem escolha |
| invite details       | `workspaceName`, `isExpired`, `isFull`             | campos wire crus                  | UI não recebe o necessário             |
| accept invite        | `{workspaceId}`                                    | membership snake_case             | redirect vira objeto/string inválida   |
| board response       | listas/cards camel e cards no topo                 | snake e cards aninhados           | Zod falha/carregamento quebra          |
| list update          | `listType`, `wipLimit`                             | `list_type`, `wip_limit`          | update não aplicado                    |
| list enum            | `inProgress`                                       | `in_progress`                     | valor rejeitado/ignorado               |
| create card          | `listId`                                           | `list_id` obrigatório             | HTTP 422                               |
| update card          | `coverUrl`, `assigneeId`, `dueDate`, `listId`      | equivalentes snake                | campos não aplicados                   |
| move card            | `listId`                                           | `list_id`                         | posição muda, lista não                |
| history              | `createdBy/actionType/oldValue/newValue/createdAt` | snake com `old_val/new_val`       | Zod falha                              |
| sprint               | requests/responses camel                           | snake                             | create 422; reads falham no parse      |
| comment query/body   | `cardId`, `parentId`                               | `card_id`, `parent_id`            | HTTP 422                               |
| comment response     | camel + `updatedAt/users`                          | snake sem esses campos            | Zod falha                              |
| notification         | camel + workspace                                  | snake sem workspace               | Zod falha                              |
| diagram save         | `cardId`, `w/h`                                    | `card_id`, `width/height`         | 422/perda de geometria                 |
| diagram vazio        | captura 404                                        | API retorna 200 `null`            | Zod falha                              |
| attachment path      | `/api/attachments`                                 | `/api/files/attachments`          | HTTP 404                               |
| attachment field     | `workspaceId`                                      | `workspace_id`                    | HTTP 422 após corrigir path            |
| delete attachment    | URL assinada usada como `key`                      | storage key `<workspaceId>/...`   | HTTP 400 após corrigir path/casing     |
| avatar path/response | `/users/me/avatar`, `{avatarUrl}`                  | `/files/avatar`, `{url,publicId}` | HTTP 404/schema incorreto              |
| browser client       | `/api/v1`                                          | sem proxy/rewrite no Next         | rota inexistente; cliente sem uso      |

## 6. Erros e validação

`parseApiError` do front aceita dois formatos, inclusive o formato real plano.
Entretanto, o backend não envia `traceId` nem detalhes estruturados de campo.
`validateDto` junta issues do Zod numa única mensagem e o error handler responde:

```json
{
  "error": "campo: mensagem, outro_campo: mensagem",
  "code": "UNPROCESSABLE_ENTITY"
}
```

No novo frontend:

- preservar `status`, `code` e mensagem;
- mapear 401 para limpeza de cookie + redirect seguro;
- tratar 403, 404, 409, 422 e 429 explicitamente;
- não depender de `traceId` até o backend realmente fornecê-lo;
- não inventar field errors: ou alterar o backend para enviá-los, ou mostrar erro
  de formulário geral;
- usar `AbortSignal` e timeout server-side para evitar requests penduradas.

## 7. Decisões necessárias antes de implementar a UI Svelte

1. Confirmar snake_case como contrato externo e criar mappers testados.
2. Decidir se invite preview será público; hoje front e backend se contradizem.
3. Definir resposta de invite com nome do workspace e flags, ou derivação oficial.
4. Corrigir retorno do accept invite para fornecer `workspace_id` consumível.
5. Definir o modelo canônico do diagrama (`width/height` recomendado no wire).
6. Definir armazenamento de `publicId` para capa/anexo e avatar.
7. Acrescentar `workspace_id` à notificação ou endpoint de resolução.
8. Alinhar enforcement de roles do backend à política do produto.
9. Decidir se comentários retornam autor/updated timestamp ou se a UI deixa de
   exigir esses campos.
10. Gerar OpenAPI ou pacote compartilhado a partir dos schemas do backend para
    impedir nova divergência.

Sem essas decisões, portar o comportamento atual literalmente produzirá um novo
frontend que compila, mas falha nos mesmos fluxos em runtime.

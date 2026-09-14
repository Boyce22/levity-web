# Contratos HTTP e integrações

> Revisado em **2026-09-14** contra `levity-web@754e9ac` e
> `levity-api@2eef9c7`. A fonte de verdade executável é o código do backend;
> `levity-api/docs/API.md` foi reconciliado na mesma revisão.

## 1. Contrato de transporte confirmado

| Item | Valor implementado |
| --- | --- |
| origem default no frontend | `http://localhost:3001` |
| prefixo da API | `/api` |
| autenticação | `Authorization: Bearer <accessToken>` |
| token | JWT `{ id, username }`; expiração default `24h` |
| schemas HTTP | TypeBox nos controllers, compilado pelo Fastify/AJV |
| validação inválida | HTTP 422, `{ error, code: "UNPROCESSABLE_ENTITY" }` |
| erro conhecido | `{ error: "mensagem", code: "CODIGO" }` |
| erro inesperado | HTTP 500, `{ error: "Internal server error" }` |
| rota inexistente | HTTP 404, `{ message, path }` — formato diferente dos demais erros |
| sucesso sem corpo | HTTP 204 |
| upload | `multipart/form-data`; boundary gerado pela runtime |
| limite de body/arquivo | 10 MiB |
| CORS | allow-list em `CORS_ORIGIN`, credentials habilitados |
| rate limit | somente produção; default 100 requests/15 min |
| documentação interativa | Swagger UI em `/docs` |

Existem **63 rotas sob `/api`**: login e registro são públicas; as outras 61
exigem Bearer. `GET /`, `GET /health` e `/docs` ficam fora do prefixo.

O `ServerApiClient` do Next continua sendo o único cliente em uso. Ele lê o
cookie HttpOnly e chama a API server-to-server, mas não implementa refresh,
timeout, retry, abort, deduplicação ou idempotency key.

## 2. Mudança estrutural desde o levantamento original

O domínio deixou de tratar workspace como sinônimo de board:

```text
Workspace
  ├─ WorkspaceMember (OWNER | ADMIN | MEMBER)
  ├─ Board 1..n
  │   ├─ BoardMember (ADMIN | EDITOR | VIEWER)
  │   ├─ Column 1..n
  │   │   └─ Issue 0..n
  │   └─ Sprint 0..n
  ├─ Tag catalog
  └─ Priority catalog
```

Consequências para a migração:

- rotas de board e sprint agora usam `boardId`, não `workspaceId`;
- `list` virou `column` e `card` virou `issue` no contrato externo;
- criar workspace também cria um board, quatro colunas e prioridades de sistema;
- o snapshot do board não inclui membros, tags ou prioridades; são leituras
  separadas;
- o frontend precisa manter workspace ativo **e** board ativo na URL/estado;
- convite exige grants de um ou mais boards.

## 3. Casing e enums

JSON continua em **snake_case**. A UI pode usar camelCase, desde que schemas wire
e mappers explícitos isolem a borda:

```text
API snake_case + UPPER_SNAKE_CASE
  <-> WireSchema
  <-> fromWire/toWire
  <-> modelo de UI camelCase
```

Enums atuais:

```ts
type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";
type BoardRole = "ADMIN" | "EDITOR" | "VIEWER";
type MembershipStatus = "ACTIVE" | "LEFT" | "REMOVED";
type ResourceStatus = "ACTIVE" | "ARCHIVED";
type ColumnType = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
type SprintStatus = "PLANNING" | "ACTIVE" | "COMPLETED";
type SprintTrackingMode = "POINTS" | "COUNT" | "HOURS";
type NotificationType = "MENTION" | "ASSIGNMENT" | "REPLY" | "COMMENT";
```

Não usar conversor recursivo genérico: Markdown, storage keys e payloads de
diagrama não podem ser renomeados às cegas.

## 4. Inventário de endpoints e compatibilidade do Next atual

Legenda: `ok` significa que caminho e payload usados hoje são compatíveis;
`parcial` exige mapper/schema ou tem comportamento faltante; `quebrado` não
chega ao resultado pretendido; `novo` não tem consumidor no frontend atual.

### 4.1 Auth e usuários

| Método e rota | Permissão | Front atual |
| --- | --- | --- |
| `POST /api/auth/login` | pública | ok; validação client-side é mais permissiva |
| `POST /api/auth/register` | pública | ok; validação client-side é mais permissiva |
| `GET /api/users/me` | autenticado | quebrado no schema da resposta |
| `PATCH /api/users/me` | próprio usuário | quebrado no payload e na resposta |
| `GET /api/users/?workspace_id=` | membro do workspace | quebrado na query e na resposta |

Registro cria um avatar externo DiceBear. `GET /users/me` resolve tanto URL
absoluta quanto storage key; `PATCH /users/me` retorna o valor persistido sem
resolvê-lo novamente.

### 4.2 Workspaces, boards de navegação, convites, membros e catálogos

| Método e rota | Permissão | Front atual |
| --- | --- | --- |
| `GET /api/workspaces/` | autenticado | ok; descarta campos novos |
| `POST /api/workspaces/` | autenticado | HTTP compatível; UI falha antes no use-case |
| `PATCH /api/workspaces/:id` | workspace OWNER/ADMIN | ok |
| `DELETE /api/workspaces/:id` | workspace OWNER | ok |
| `GET /api/workspaces/:id/boards` | membro do workspace | novo; obrigatório para a nova navegação |
| `POST /api/workspaces/:id/boards` | workspace OWNER/ADMIN | novo |
| `PATCH /api/workspaces/:id/boards/:boardId` | workspace OWNER/ADMIN | novo |
| `POST /api/workspaces/:id/boards/:boardId/self-grant` | workspace OWNER/ADMIN | novo |
| `GET /api/workspaces/:id/invites` | workspace OWNER/ADMIN | parcial; retorna `any` no front |
| `POST /api/workspaces/:id/invites` | workspace OWNER/ADMIN | quebrado: casing antigo e sem `board_grants` |
| `GET /api/workspaces/:id/invites/:token` | autenticado | parcial; `:id` não é validado pelo service |
| `POST /api/workspaces/:id/invites/:token/accept` | autenticado | quebrado na resposta esperada |
| `DELETE /api/workspaces/:id/invites/:inviteId` | workspace OWNER/ADMIN | ok |
| `GET /api/workspaces/:id/members` | membro do workspace | novo para a UI; front usa `/users` |
| `PATCH /api/workspaces/:id/members/:memberId/role` | workspace OWNER/ADMIN | quebrado: envia role lowercase/legada |
| `DELETE /api/workspaces/:id/members/:memberId` | workspace OWNER/ADMIN | ok se `memberId` for `user_id` |
| `GET /api/workspaces/:id/tags` | membro do workspace | novo; não vem mais no board |
| `POST /api/workspaces/:id/tags` | workspace OWNER/ADMIN | caminho/payload básico ok |
| `DELETE /api/workspaces/:id/tags/:tagId` | workspace OWNER/ADMIN | caminho ok |
| `GET /api/workspaces/:id/priorities` | membro do workspace | novo; não vem mais no board |
| `POST /api/workspaces/:id/priorities` | workspace OWNER/ADMIN | caminho/payload básico ok |
| `DELETE /api/workspaces/:id/priorities/:priorityId` | workspace OWNER/ADMIN | parcial; prioridade de sistema retorna 409 |

Em update/remove member, `:memberId` significa **ID do usuário**, não o UUID da
membership. Admin não pode alterar owner, promover para admin/owner, nem agir
sobre si mesmo nos casos bloqueados pelo service.

### 4.3 Board, colunas, issues e histórico

| Método e rota | Permissão | Front atual |
| --- | --- | --- |
| `GET /api/boards/:boardId` | board ADMIN/EDITOR/VIEWER | quebrado: front chama rota antiga |
| `POST /api/boards/:boardId/columns` | board ADMIN/EDITOR | quebrado: rota/nome antigos |
| `PATCH /api/boards/:boardId/columns/positions` | board ADMIN/EDITOR | quebrado: rota antiga |
| `PATCH /api/boards/:boardId/columns/:columnId` | board ADMIN/EDITOR | quebrado: rota/casing/enums antigos |
| `DELETE /api/boards/:boardId/columns/:columnId` | board ADMIN/EDITOR | quebrado: rota antiga |
| `POST /api/boards/:boardId/issues` | board ADMIN/EDITOR | quebrado: rota e payload antigos |
| `PATCH /api/boards/:boardId/issues/positions` | board ADMIN/EDITOR | quebrado: rota e payload antigos |
| `PATCH /api/boards/:boardId/issues/:issueId` | board ADMIN/EDITOR | quebrado: rota e payload antigos |
| `DELETE /api/boards/:boardId/issues/:issueId` | board ADMIN/EDITOR | quebrado: rota antiga |
| `GET /api/boards/:boardId/issues/:issueId/history` | qualquer membro do board | quebrado: rota/schema antigos |

WIP é aplicado na criação, no move individual e no bulk move. Tag e prioridade
precisam pertencer ao workspace do board. A prioridade é obrigatória na resposta;
se omitida na criação, o backend usa a prioridade de sistema de código `medium`.

### 4.4 Sprints

Todas as rotas usam `/api/boards/:boardId/sprints`. Leitura aceita VIEWER;
mutações exigem ADMIN ou EDITOR.

| Método e rota | Front atual |
| --- | --- |
| `GET /api/boards/:boardId/sprints` | quebrado: rota/schema antigos |
| `GET /api/boards/:boardId/sprints/active` | quebrado: rota/schema antigos |
| `GET /api/boards/:boardId/sprints/:sprintId` | quebrado: rota/schema antigos |
| `POST /api/boards/:boardId/sprints` | quebrado: rota/payload/enums antigos |
| `PATCH /api/boards/:boardId/sprints/:sprintId` | quebrado: rota/payload/enums antigos |
| `DELETE /api/boards/:boardId/sprints/:sprintId` | quebrado: rota antiga |
| `POST /api/boards/:boardId/sprints/:sprintId/activate` | quebrado: rota/schema antigos |
| `POST /api/boards/:boardId/sprints/:sprintId/complete` | quebrado: rota/payload antigos |
| `POST /api/boards/:boardId/sprints/:sprintId/issues` | quebrado: `cards` virou `issues` |
| `PATCH /api/boards/:boardId/sprints/:sprintId/issues/reorder` | quebrado: rota antiga |
| `DELETE /api/boards/:boardId/sprints/:sprintId/issues/:issueId` | quebrado: rota antiga |

O backend garante uma sprint ativa **por board**, não por workspace.

### 4.5 Comentários, notificações e diagramas

| Método e rota | Permissão | Front atual |
| --- | --- | --- |
| `GET /api/comments/:id/replies` | membro do board da issue | novo |
| `GET /api/comments/` | membro do board da issue | quebrado: envia `cardId`, API exige `issue_id` |
| `POST /api/comments/` | board ADMIN/EDITOR | quebrado: envia `cardId/parentId` |
| `PATCH /api/comments/:id` | board ADMIN/EDITOR + autor | resposta quebra o schema atual |
| `DELETE /api/comments/:id` | board ADMIN/EDITOR + autor | ok |
| `GET /api/notifications/` | próprio usuário | quebrado no schema da resposta |
| `PATCH /api/notifications/:id/read` | próprio usuário | ok; sem consumidor UI atual |
| `POST /api/notifications/read-all` | próprio usuário | ok |
| `GET /api/diagrams/:issueId` | membro do board | quebrado no schema/null |
| `PUT /api/diagrams/` | board ADMIN/EDITOR | quebrado: envia `cardId` e `w/h` |
| `DELETE /api/diagrams/:issueId` | board ADMIN/EDITOR | novo |

Menções e atribuições agora geram notificações, mas a resposta de notificação
tem apenas `issue_id`; não traz `workspace_id`, `board_id`, ator expandido ou
conteúdo. A navegação do sino continua bloqueada sem resolução adicional.

### 4.6 Arquivos

| Método e rota | Permissão | Front atual |
| --- | --- | --- |
| `POST /api/files/attachments` | membro do workspace | quebrado: usa `/api/attachments` e `workspaceId` |
| `POST /api/files/avatar` | autenticado | quebrado: usa `/api/users/me/avatar` |
| `DELETE /api/files/attachments` | membro + key do workspace | quebrado: rota/casing/key incorretos |
| `GET /api/files/:workspaceName/:workspaceId/:category/:fileName` | autenticado; membership para attachment | novo |

MIME aceitos: JPEG, PNG, WebP e GIF. Avatar é convertido para WebP 256×256 e a
key `avatars/<userId>.webp` é persistida no usuário. Isso corrige a premissa
antiga de que o frontend precisaria salvar o avatar em um segundo request.

## 5. Wire contracts essenciais

Campos `?` podem ser omitidos. `null` aparece apenas onde explicitado.

### 5.1 Usuário

```ts
type UpdateUserBody = {
  first_name?: string; // até 50; vazio é aceito
  last_name?: string;  // até 50; vazio é aceito
  avatar_url?: string;
  bio?: string;        // até 500
  email?: string;
};

type UserResponse = {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  email?: string;
  account_status: "ACTIVE" | "SUSPENDED";
  updated_at: string;
  last_login_at?: string;
  created_at: string;
};
```

Não existe mais `display_name`; a UI precisa definir como compor primeiro nome,
sobrenome e fallback para username.

### 5.2 Workspace, board e membership

```ts
type WorkspaceResponse = {
  id: string;
  name: string;
  status: "ACTIVE" | "ARCHIVED";
  created_by: string;
  created_at: string;
  updated_at: string;
};

type HomeBoardResponse = {
  id: string;
  workspace_id: string;
  name: string;
  position: number;
  role: BoardRole;
};

type WorkspaceMemberResponse = {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  membership_status: MembershipStatus;
  joined_at: string;
  left_at?: string;
  last_accessed_at?: string;
  user?: { username: string; first_name?: string; last_name?: string; avatar_url?: string };
};

type GenerateInviteBody = {
  max_uses?: number; // default 1, máximo 100
  expires_in_hours?: number; // máximo 720
  workspace_role?: WorkspaceRole; // default MEMBER
  board_grants: Array<{ board_id: string; board_role: BoardRole }>; // mínimo 1
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
  workspace_role: WorkspaceRole;
  created_at: string;
  grants: Array<{ board_id: string; board_role: BoardRole }>;
};
```

### 5.3 Board

```ts
type CreateColumnBody = {
  title: string;
  position?: number; // default 0
  wip_limit?: number | null; // inteiro > 0
  column_type?: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | null;
};
type ColumnPosition = { id: string; position: number };

type CreateIssueBody = {
  content: string; // 1..500
  column_id: string;
  position?: number; // default 0
  description?: string | null; // até 10.000
  priority_id?: string;
  tag_id?: string;
  assignee_id?: string;
  story_points?: number; // inteiro >= 0
  estimated_hours?: number; // > 0
};

type UpdateIssueBody = {
  content?: string;
  description?: string | null;
  cover_url?: string | null;
  assignee_id?: string | null;
  priority_id?: string; // não aceita null
  tag_id?: string | null;
  progress?: number | null; // inteiro 0..100
  due_date?: string | null; // date-time
  column_id?: string;
  position?: number;
  story_points?: number | null;
  estimated_hours?: number | null;
};
type IssuePosition = { id: string; position: number; column_id?: string };

type BoardDataResponse = {
  board: {
    id: string; workspace_id: string; name: string; position: number;
    created_by: string; created_at: string; updated_at: string;
  };
  columns: Array<{
    id: string; board_id: string; title: string; position: number;
    wip_limit?: number; column_type?: ColumnType;
    created_by: string; created_at: string; issues: IssueResponse[];
  }>;
};

type IssueResponse = {
  id: string;
  content: string;
  position: number;
  description?: string;
  cover_url?: string; // URL resolvida/assinada
  assignee_id?: string;
  priority_id: string;
  tag_id?: string;
  progress?: number;
  due_date?: string;
  column_id: string;
  created_by: string;
  created_at: string;
  comment_count: number;
  story_points?: number;
  estimated_hours?: number;
};
```

### 5.4 Sprint

```ts
type CreateSprintBody = {
  name: string;
  goal?: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  tracking_mode: "POINTS" | "COUNT" | "HOURS";
  capacity_points?: number; // > 0
};
type CompleteSprintBody = { to_sprint_id?: string };
type AddIssueToSprintBody = { issue_id: string; position?: number };

type SprintResponse = {
  id: string;
  board_id: string;
  name: string;
  goal?: string;
  start_date: string;
  end_date: string;
  status: "PLANNING" | "ACTIVE" | "COMPLETED";
  tracking_mode: "POINTS" | "COUNT" | "HOURS";
  capacity_points?: number;
  velocity_points?: number;
  created_by: string;
  created_at: string;
  issues?: SprintIssueResponse[];
  total_issues: number;
  completed_issues: number;
  progress_percent: number;
};
```

### 5.5 Comentário, notificação e diagrama

```ts
type QueryComments = { issue_id: string; limit: number; cursor?: string };
type CreateCommentBody = { issue_id: string; content: string; parent_id?: string | null };
type CommentResponse = {
  id: string; issue_id: string; created_by: string; parent_id?: string | null;
  content: string; created_at: string;
};
type CommentsPage = { data: CommentResponse[]; nextCursor?: string };

type NotificationResponse = {
  id: string; user_id: string; actor_id?: string; issue_id?: string;
  type: NotificationType; read: boolean; created_at: string;
};

type SaveDiagramBody = {
  issue_id: string;
  data: { elements: Array<{
    id: string; type: string; points?: Array<{ x: number; y: number }>;
    x?: number; y?: number; width?: number; height?: number;
    color?: string; size?: number;
  }> };
};
```

`GET /diagrams/:issueId` retorna `200 null` quando vazio. O frontend usa `w/h` e
pressure; o wire usa `width/height` e não aceita pressure.

### 5.6 Paginação e upload

- comentários: `{ data, nextCursor? }`, `limit` 1..50;
- notificações com cursor: `{ items, limit, nextCursor? }`;
- notificações sem cursor: `{ items, total, page, limit, totalPages }`;
- attachment multipart: `file` + `workspace_id`, resposta `{ url, publicId }`;
- avatar multipart: `file`, resposta `{ url, publicId }`;
- delete attachment JSON: `{ workspace_id, key }`.

A URL assinada não é identidade persistente. O frontend deve guardar a storage
key/`publicId` separadamente para conseguir excluir um anexo depois.

## 6. Matriz de divergências comprovadas

| Área | Front atual | Backend atual | Efeito |
| --- | --- | --- | --- |
| hierarquia | um board implícito por workspace | vários boards e membership própria | navegação/modelo insuficientes |
| board e sprint | `/workspaces/:id/...` | `/boards/:boardId/...` | 404 em todos esses fluxos |
| vocabulário | list/card | column/issue | paths e payloads inválidos |
| enums | lowercase/camel | UPPER_SNAKE_CASE | 422 ou parse inválido |
| roles | enum único com 5 valores | workspace role + board role | autorização/UI incorretas |
| board snapshot | lists/cards/members/tags/priorities | board + columns[].issues | parse falha e dados faltam |
| perfil | `displayName` | `first_name` + `last_name` | edição/nome quebrados |
| users query | `workspaceId` | `workspace_id` | API retorna `[]` |
| convite | camelCase e role única | snake_case + `board_grants` | HTTP 422 |
| accept invite | `{ workspaceId }` | membership snake_case | redirect inválido |
| notificação | exige workspace/card/content | retorna apenas IDs básicos da issue | parse/navegação quebrados |
| comentário | `cardId`, `updatedAt`, `users` | `issue_id`, sem update/user no mapper | 422 ou parse inválido |
| diagrama | `cardId`, `w/h`, captura 404 | `issue_id`, `width/height`, `200 null` | 422/perda de geometria |
| attachment | `/attachments`, `workspaceId` | `/files/attachments`, `workspace_id` | 404; depois 400/422 |
| avatar | `/users/me/avatar`, `{avatarUrl}` | `/files/avatar`, `{url,publicId}` | 404/schema inválido |

Os 53 métodos de integração existentes no Next continuam inventariados, mas só
uma minoria permanece utilizável. A superfície atual tem 63 rotas: além de ser
dez rotas maior em contagem, substitui toda a família antiga de board/sprint e
adiciona multi-board, catálogos, replies, delete de diagrama e download.

## 7. Erros e validação

O Fastify/AJV aplica defaults e coerção de query. Erros de schema retornam 422
com mensagem agregada. Erros de domínio usam 400, 401, 403, 404, 409, 422 ou
429 com `{ error, code }`. O not-found global usa `{ message, path }`.

No SvelteKit:

- preservar `status`, `code` e mensagem nos dois formatos;
- em 401, apagar cookie e redirecionar somente no ponto de navegação adequado;
- tratar 403, 404, 409, 422 e 429 explicitamente;
- não depender de `traceId` ou field errors, pois não existem;
- usar timeout/`AbortSignal` server-side;
- nunca repetir mutação automaticamente sem idempotência definida.

## 8. Decisões e correções antes da implementação

### Bloqueantes para o frontend

1. Definir URLs canônicas com `workspaceId` e `boardId`; recomendação:
   `/w/[workspaceId]/b/[boardId]` e `/w/[workspaceId]/b/[boardId]/sprints/...`.
2. Definir seleção/fallback do board ativo e comportamento quando OWNER/ADMIN do
   workspace ainda não possui membership no board (`self-grant`).
3. Decidir se o produto precisa excluir boards; não existe endpoint de delete.
4. Definir APIs para listar/alterar/remover memberships de board. Hoje só existe
   a role do próprio usuário em home boards, grants de convite e `self-grant`.
5. Escolher UX de nome de usuário com `first_name`, `last_name` e username.
6. Ajustar convite para roles separadas e seleção obrigatória de board grants.
7. Decidir se preview de convite será público; hoje exige autenticação.
8. Fornecer contexto navegável em notificações (`board_id`/`workspace_id`) ou um
   endpoint de resolução de issue.
9. Definir o modelo canônico do diagrama e round-trip de pressure/geometria.
10. Definir representação persistente de attachment: URL + storage key.

### Gaps do backend a corrigir ou testar explicitamente

- `GET/accept invite` ignora o `:id` da URL ao buscar pelo token;
- delete de tag/prioridade autoriza o workspace da URL, mas o service não
  confirma que o recurso pertence a esse workspace;
- `workspaceName` do download é decorativo; o service usa apenas o workspace ID;
- notificação não carrega ator, texto nem contexto de board/workspace;
- comentário declara `user?` no DTO, mas o mapper atual não o preenche;
- `priority_id` não aceita `null`, portanto prioridade não pode ser removida;
- OpenAPI registra request schemas, mas quase nenhuma rota declara schema de
  resposta; testes de contrato ainda são necessários.

## 9. Regra de manutenção

Toda alteração em controller, schema, DTO, enum ou regra de acesso do backend
deve atualizar, no mesmo PR:

1. `levity-api/docs/API.md`;
2. este arquivo;
3. fixtures/mappers de contrato do frontend;
4. critérios afetados em `SVELTEKIT_PLAN.md`.

Sem esse gate, portar o JSX para Svelte apenas transfere as falhas de runtime.

## 10. Camada BFF e Resolução no SvelteKit (Implementada)

A migração para SvelteKit resolveu as lacunas contratuais através de uma camada BFF explícita em `src/routes/api/`:

### Estabilização de 2026-09-14

- Comentários usam BFFs explícitos para listagem por issue, replies (`GET /api/comments/:commentId/replies`), atualização e exclusão; não há proxy catch-all.
- Anexos enviam o `publicId` retornado no upload como `key` no delete. A URL assinada é apenas endereço de exibição e nunca é reconstruída para identificar o objeto.

- **Validação de Entrada e Saída**: Todos os payloads enviados ao `levity-api` são validados com Zod schemas em snake_case estrito, e todas as respostas são mapeadas explicitamente para modelos UI em camelCase (`src/lib/contracts/mappers.ts`). Não há conversão implícita espalhada.
- **Grants de Convite**: `POST /api/workspaces/:id/invites` inclui `board_grants` obrigatórios (minItems: 1) associando permissões (`ADMIN`, `EDITOR`, `VIEWER`) aos boards do workspace.
- **Uploads Estritos**: `POST /api/files/attachments` e `POST /api/files/avatar` aceitam exclusivamente imagens MIME (`image/jpeg`, `image/png`, `image/webp`, `image/gif`) com teto de 10 MiB, rejeitando qualquer outro tipo de arquivo.
- **Diagramas Vetoriais**: O BFF valida elementos conforme o contrato `width/height` esperado pela API Fastify (`DiagramWire`).
- **Posicionamento e WIP Limits**: O BFF suporta `PATCH /api/boards/:boardId/issues/positions` e `PATCH /api/boards/:boardId/columns/positions`, respeitando limites WIP com rollback otimista no cliente.

### Gestão de workspace e boards (2026-09-14)

- `POST /api/workspaces` valida `{ name }`, cria o workspace no backend e busca o
  primeiro board antes de responder ao navegador com modelos UI mapeados.
- Ações de servidor da rota de gestão validam nomes, UUIDs e papéis antes de
  chamar `PATCH /workspaces/:id`, `POST/PATCH /workspaces/:id/boards` e
  `POST /workspaces/:id/boards/:boardId/self-grant`.
- A alteração de papel usa o path canônico
  `PATCH /workspaces/:id/members/:memberId/role`.

### Perfil e notificações (2026-09-14)

- `PATCH /api/users/me` valida `first_name` e `last_name` em até 50 caracteres,
  `bio` em até 500, `email` válido e `avatar_url` como URL.
- O avatar é enviado como multipart para `POST /api/files/avatar` somente com
  JPEG, PNG, WebP ou GIF de no máximo 10 MiB.
- `GET /api/notifications`, `PATCH /api/notifications/:id/read` e
  `POST /api/notifications/read-all` são BFFs explícitos. As respostas de
  mutação são confirmadas antes de consolidar o estado otimista.
- `NotificationWire` não inclui workspace ou board; o cliente nunca constrói uma
  rota com base apenas em `issue_id`.

### Sprints e diagramas (2026-09-14)

- Actions de sprint validam UUID, datas e `tracking_mode` (`POINTS`, `COUNT` ou
  `HOURS`) antes dos endpoints de board; conclusão envia somente o
  `to_sprint_id` opcional.
- O BFF de diagramas aceita somente o schema documentado, com no máximo 1000
  elementos e 2500 pontos por elemento. GET aceita `null` em 200 e DELETE
  responde 204.

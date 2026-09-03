# Inventário do código frontend

Este inventário serve de checklist: um arquivo marcado como “portar” contém
comportamento de produto; “reescrever” contém comportamento útil acoplado a
React/Next; “reusar” é TypeScript/CSS agnóstico; “remover” não possui consumidor
ou representa infraestrutura substituída.

## 1. Raiz e configuração

| Arquivo                | Responsabilidade                     | Destino                                             |
| ---------------------- | ------------------------------------ | --------------------------------------------------- |
| `package.json`         | scripts e dependências Next/React    | reescrever para SvelteKit; usar a matriz do plano   |
| `next.config.ts`       | limite de 10 MiB para Server Actions | remover; configurar limites no adapter/proxy alvo   |
| `tsconfig.json`        | strict TS, JSX e alias `@/*`         | reescrever com config gerada pelo SvelteKit         |
| `postcss.config.mjs`   | integração Tailwind/PostCSS          | adaptar à integração Vite/Tailwind escolhida        |
| `eslint.config.mjs`    | ESLint Next                          | trocar por config Svelte/TypeScript                 |
| `.gitignore`           | ignores Next/env/build               | atualizar quando Next sair; `docs/` já foi liberado |
| `rename-snake-case.js` | replace textual snake → camel        | não executar; remover/arquivar após mappers         |
| `levity_logo.png`      | logo usada no README                 | preservar ou mover para assets/static               |
| `README.md`            | documentação histórica desatualizada | reescrever no corte                                 |
| `CLAUDE.md`            | regras de manutenção Next/React      | substituir/arquivar no corte                        |

`public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg` e `window.svg` são assets
do scaffold Next sem uso encontrado; validar e remover, não portar por padrão.

## 2. App Router

| Arquivo                                                | Responsabilidade                                               | Destino                                                  |
| ------------------------------------------------------ | -------------------------------------------------------------- | -------------------------------------------------------- |
| `src/app/layout.tsx`                                   | html/body, metadata, Geist, CSS global                         | `+layout.svelte` e `<svelte:head>`                       |
| `src/app/globals.css`                                  | Tailwind 4, tokens dos 3 temas, body/scrollbar/autofill/canvas | portar e validar visualmente                             |
| `src/app/page.tsx`                                     | load do board/perfil/users e shell principal                   | `+page.server.ts` + `+page.svelte`                       |
| `src/app/login/page.tsx`                               | entrada do login                                               | rota Svelte pública                                      |
| `src/app/register/page.tsx`                            | entrada do register                                            | rota Svelte pública                                      |
| `src/app/invite/[workspaceId]/[token]/page.tsx`        | preview/accept/redirect de convite                             | reescrever após contrato de invite                       |
| `src/app/sprints/[workspaceId]/[sprintId]/page.tsx`    | load SSR paralelo de sprint                                    | rota Svelte autenticada                                  |
| `src/app/sprints/[workspaceId]/new/page.tsx`           | resolução de sprint ou empty state                             | rota Svelte autenticada                                  |
| `src/app/loading.tsx`                                  | loader global                                                  | loading/layout Svelte                                    |
| `src/app/sprints/[workspaceId]/[sprintId]/loading.tsx` | loader sprint                                                  | loading local                                            |
| `src/app/not-found.tsx`                                | 404 animada                                                    | `+error.svelte`; remover textura remota ou CSP explícita |
| `src/app/favicon.ico`                                  | favicon                                                        | mover para `static/`                                     |
| `src/proxy.ts`                                         | guard e redirects por cookie                                   | `hooks.server.ts` + route groups                         |

## 3. Contracts

| Arquivo                     | Conteúdo                             | Situação                                                               |
| --------------------------- | ------------------------------------ | ---------------------------------------------------------------------- |
| `contracts/Auth.ts`         | login/register e resposta auth       | parcialmente correto; alinhar mínimos                                  |
| `contracts/User.ts`         | perfil/update                        | camelCase diverge do wire; avatar comentado                            |
| `contracts/Workspace.ts`    | workspace/member/invite/tag/priority | campos/defaults divergem; separar wire/model                           |
| `contracts/Board.ts`        | list/card/board                      | incompatível com resposta API e incompleto para sprint fields          |
| `contracts/CardHistory.ts`  | histórico                            | nomes divergem (`oldValue` vs `old_val`)                               |
| `contracts/Comment.ts`      | comment/page/create                  | exige campos que API não retorna                                       |
| `contracts/Diagram.ts`      | elementos/limites                    | modelo usa `w/h`; API usa `width/height`                               |
| `contracts/Notification.ts` | notification/page                    | exige workspace ausente na API                                         |
| `contracts/Sprint.ts`       | sprint/card/create/update/complete   | todo camelCase; wire é snake_case                                      |
| `contracts/Storage.ts`      | opções/provider de storage           | abstração de backend indevidamente no web; UI só precisa upload result |

Destino: nenhum deve ser copiado sem revisão. Criar `wire`, `models` e `mappers`
com testes, conforme Fase 0.

## 4. Infraestrutura

| Arquivo                          | Responsabilidade                                       | Destino                                                |
| -------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| `infra/http/serverApiClient.ts`  | HTTP server-to-server, Bearer, JSON/FormData/204/error | reescrever com `RequestEvent`/env privado              |
| `infra/http/browserApiClient.ts` | cliente `/api/v1` sem consumidores nem proxy real      | remover                                                |
| `infra/http/apiClient.ts`        | barrel                                                 | recriar apenas se houver valor                         |
| `infra/http/errors.ts`           | `ApiError`, `DomainError`, parser                      | reusar conceito, corrigir tipo `any`/shape real        |
| `infra/auth/session.ts`          | cookie, decode JWT, require/create/clear               | reescrever para `event.cookies`/locals                 |
| `infra/storage/upload.ts`        | Server Actions de upload/delete                        | reescrever como BFF; paths/campos atuais estão errados |
| `infra/rate-limit/index.ts`      | Map em memória sem consumidores                        | remover; rate limit pertence ao gateway/backend        |
| `infra/observability/logger.ts`  | wrapper de console sem consumidores encontrados        | definir observabilidade alvo antes de portar           |
| `infra/cache/tags.ts`            | constantes de tags de cache                            | revisar; sem integração relevante encontrada           |

## 5. UI compartilhada

| Arquivo                               | Responsabilidade                                | Destino                                       |
| ------------------------------------- | ----------------------------------------------- | --------------------------------------------- |
| `ui/primitives/Button.tsx`            | botão com variants/sizes/loading                | portar para `Button.svelte`                   |
| `ui/primitives/Input.tsx`             | input visual                                    | portar                                        |
| `ui/primitives/Card.tsx`              | container visual genérico                       | portar se ainda usado                         |
| `ui/components/SimpleField.tsx`       | label/erro/children                             | portar                                        |
| `ui/components/Select.tsx`            | select/dropdown animado e portal                | reescrever; focus/SSR                         |
| `ui/components/ConfirmationModal.tsx` | confirmação animada                             | reescrever com acessibilidade/focus trap      |
| `ui/components/ProgressLoader.tsx`    | loader com progress artificial                  | reescrever e remover setState-in-effect       |
| `ui/components/LevityLogo.tsx`        | logo vetorial/animada                           | portar                                        |
| `ui/components/RichTextEditor.tsx`    | TipTap Markdown, paste/drop/upload/tables/tasks | spike e reescrita de alto risco               |
| `ui/utils/cn.ts`                      | clsx + tailwind-merge                           | reusar ou simplificar conforme classes Svelte |
| `ui/utils/date.ts`                    | relative time e formatação de mentions          | reusar com testes/i18n                        |
| `ui/utils/attachments.ts`             | extrai/limpa links Markdown e detecta imagens   | reusar após remover regra Backblaze hardcoded |

## 6. Feature auth

| Módulo                                   | Responsabilidade                      | Destino                                 |
| ---------------------------------------- | ------------------------------------- | --------------------------------------- |
| `components/AuthContainer.tsx`           | compõe fundo e form                   | portar                                  |
| `components/AuthBackground.tsx`          | fundo animado por modo                | portar/simplificar                      |
| `components/AuthForm.tsx`                | estado, validação, action e redirects | reescrever como form action/enhancement |
| `components/AuthHeader.tsx`              | título/ícone por modo                 | portar                                  |
| `components/AuthInputs.tsx`              | username, senha e confirmação         | portar; alinhar constraints             |
| `components/AuthFooter.tsx`              | submit e troca de modo                | portar; preferir links de rota          |
| `server/actions/auth.actions.ts`         | Server Actions                        | substituir por actions SvelteKit        |
| `server/use-cases/auth.use-cases.ts`     | valida, autentica, cria cookie        | dividir repository/action/session       |
| `server/repositories/auth-repository.ts` | POST login/register + parse           | portar com cliente novo                 |
| `server/actions/index.ts`                | exports                               | revisar após estrutura-alvo             |

## 7. Feature board — shell, filtros e estado

| Módulo                            | Responsabilidade                             | Destino                                  |
| --------------------------------- | -------------------------------------------- | ---------------------------------------- |
| `components/Board.tsx`            | shell, views, modais e composição            | dividir entre layout/page/state          |
| `components/BoardHeader.tsx`      | título, contagem, share, notification        | portar                                   |
| `components/BoardCanvas.tsx`      | canvas horizontal de listas                  | portar                                   |
| `components/BoardFiltersBar.tsx`  | compõe filtros                               | portar                                   |
| `components/BoardModals.tsx`      | compõe modais                                | portar depois das features               |
| `components/SearchFilter.tsx`     | busca textual                                | portar                                   |
| `components/MemberFilters.tsx`    | filtro por assignee                          | portar                                   |
| `components/PriorityFilters.tsx`  | filtro por prioridade                        | portar                                   |
| `components/LabelFilters.tsx`     | filtro por label                             | portar                                   |
| `components/layout/Sidebar.tsx`   | navegação/workspaces/profile/logout/theme UI | mover ao layout autenticado              |
| `hooks/useBoardData.ts`           | estado remoto local + CRUD otimista          | reescrever como board state `.svelte.ts` |
| `hooks/useDragDrop.ts`            | reorder/move e persistência                  | reescrever com rollback                  |
| `hooks/useFilters.ts`             | filtros derivados                            | `$state` + `$derived`                    |
| `hooks/useWorkspaceResolution.ts` | query/localStorage/loader                    | reescrever URL-first                     |

## 8. Feature board — listas

| Módulo                                | Responsabilidade            | Destino                        |
| ------------------------------------- | --------------------------- | ------------------------------ |
| `list/components/List.tsx`            | draggable/droppable e cards | portar após spike DnD          |
| `list/components/ListHeader.tsx`      | rename, tipo, WIP, delete   | portar                         |
| `list/components/ListAddCard.tsx`     | criação inline              | portar                         |
| `list/components/ListTypePicker.tsx`  | enum visual da lista        | portar e mapear `in_progress`  |
| `list/components/WipLimitPicker.tsx`  | edição de WIP               | portar                         |
| `list/components/DeleteListModal.tsx` | confirmação/loading         | portar via modal compartilhado |
| `list/utils/listType.ts`              | metadados por tipo          | reusar após enum canônico      |

## 9. Feature board — card e modal

### Preview do card

`Card.tsx`, `CardCover.tsx`, `CardDueDate.tsx`, `CardFooter.tsx`,
`CardLabel.tsx`, `CardPriority.tsx` e `CardProgress.tsx` renderizam o card e seus
badges. Portar depois do modelo Card estar validado.

### Estado e utilidades

| Módulo                         | Responsabilidade                        | Destino                                       |
| ------------------------------ | --------------------------------------- | --------------------------------------------- |
| `card/hooks/useCardModal.ts`   | estado, autosave, lazy loads e mutações | decompor em estados por aba                   |
| `card/hooks/useComments.ts`    | helper alternativo de comments          | verificar duplicação; consolidar              |
| `card/hooks/useCardHistory.ts` | helper alternativo de history           | verificar duplicação; consolidar              |
| `card/hooks/useMentions.ts`    | busca/posição de mention em textarea    | adaptar ou remover se contenteditable dominar |
| `card/utils/parseProgress.ts`  | progresso/checklist Markdown            | reusar com testes                             |
| `card/utils/historyUtils.tsx`  | formatação visual do histórico          | separar lógica de JSX e portar                |
| `card/constants/card.ts`       | constantes de card                      | reusar se consistentes                        |

### Estrutura do modal

| Módulo                       | Responsabilidade                  |
| ---------------------------- | --------------------------------- |
| `card-modal/CardModal.tsx`   | shell, Escape e composição        |
| `CardModalHeader.tsx`        | título auto-resize/edição         |
| `CardModalCover.tsx`         | capa                              |
| `CardModalTabs.tsx`          | tabs description/comments/diagram |
| `HeaderActions.tsx`          | copy link, pickers, upload        |
| `Breadcrumbs.tsx`            | localização do card               |
| `StatusBadges.tsx`           | status visual                     |
| `ChecklistProgress.tsx`      | progresso da checklist            |
| `AttachmentCard.tsx`         | preview/download de anexo         |
| `pickers/DueDatePicker.tsx`  | input de data                     |
| `pickers/LabelPicker.tsx`    | select/create/delete label        |
| `pickers/MemberPicker.tsx`   | assignee                          |
| `pickers/PriorityPicker.tsx` | select/create/delete prioridade   |

Todos são “portar/reescrever”; não há componente React reaproveitável diretamente.

### Aba description

- `DescriptionTab.tsx`: alterna preview/editor, anexos e histórico;
- `DescriptionEditor.tsx`: integra RichTextEditor;
- `HistorySection.tsx`: accordion e timeline.

### Aba comments

- `CommentsTab.tsx`: agrupa pais/replies e load more;
- `CommentThread.tsx`: thread colapsável;
- `CommentItem.tsx`: Markdown, edit/delete/anexos;
- `CommentInput.tsx`: contenteditable, mentions, clipboard, upload e submit.

São módulos de alto risco por DOM direto. Criar testes de interação antes do port.

## 10. Feature board — diagramas

| Módulo                                  | Responsabilidade                         | Destino                                  |
| --------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| `components/diagram/DiagramEditor.tsx`  | modal/editor e toolbar                   | portar                                   |
| `DiagramCanvas.tsx`                     | pointer events, SVG/freehand e interação | portar após spike                        |
| `DiagramToolbar.tsx`                    | ferramentas, cor/tamanho, undo/redo      | portar                                   |
| `RoughShape.tsx`                        | render de shapes RoughJS                 | adaptar para Svelte                      |
| `card-modal/diagram-tab/DiagramTab.tsx` | preview/abrir/clear                      | portar; usar DELETE real quando definido |
| `hooks/useDiagram.ts`                   | modelo, comandos e geometry              | extrair funções puras e reusar           |

## 11. Server da feature board

| Grupo        | Arquivos                                                                             | Destino                                                |
| ------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| actions      | `board`, `list`, `card`, `comment`, `diagram`, `index`                               | loads/actions/endpoints BFF                            |
| use-cases    | `board`, `list`, `card`, `comment`, `diagram`                                        | manter regras úteis, remover wrapper 1:1 desnecessário |
| repositories | `board-repository`, `comment-repository`, `diagram-repository`, `history-repository` | portar com wire schemas/mappers                        |

`board.use-cases.ts` também acessa workspace repository e cria workspace default;
essa orquestração deve permanecer server-side e ser coberta por teste.

## 12. Feature workspaces

| Módulo                                                              | Responsabilidade              | Destino                              |
| ------------------------------------------------------------------- | ----------------------------- | ------------------------------------ |
| `CreateWorkspaceModal.tsx`                                          | form de criação               | portar/form action                   |
| `WorkspaceSettingsModal.tsx`                                        | rename/delete                 | portar/form actions                  |
| `ShareWorkspaceModal.tsx`                                           | opções de invite e copy link  | reescrever após contrato             |
| `MembersManagement.tsx`                                             | members/roles/invites         | portar; corrigir tipo member vs user |
| `server/repositories/workspace-repository.ts`                       | 15 integrações de workspace   | dividir por domínio e tipar          |
| use-cases `workspace`, `invite`, `member`, `tag`, `priority`        | sessão/validação/orquestração | portar regras, corrigir casing       |
| actions `workspace`, `invite`, `member`, `tag`, `priority`, `index` | mutations/queries Next        | actions/endpoints SvelteKit          |

## 13. Feature users

| Módulo                       | Responsabilidade               | Destino                                           |
| ---------------------------- | ------------------------------ | ------------------------------------------------- |
| `ProfileModal.tsx`           | edição e coordenação do avatar | portar depois do contrato storage                 |
| `AvatarUploadSection.tsx`    | file input/preview/remove      | portar                                            |
| `user-repository.ts`         | perfil, users e avatar         | portar; corrigir três integrações quebradas       |
| `user.use-cases.ts`          | sessão, sort, base64→multipart | evitar base64; enviar File ao BFF quando possível |
| `user.actions.ts`/`index.ts` | queries/mutations/logout       | layout load/form actions/BFF                      |

## 14. Feature notifications

| Módulo                            | Responsabilidade                         | Destino                                 |
| --------------------------------- | ---------------------------------------- | --------------------------------------- |
| `NotificationBell.tsx`            | fetch em mount/focus, dropdown, mark-all | portar com rollback                     |
| `NotificationHeader.tsx`          | header/mark-all                          | portar                                  |
| `NotificationItem.tsx`            | item/click/avatar/content                | portar e corrigir a11y                  |
| repository/use-case/actions/index | três endpoints                           | portar com mapper e workspace resolvido |

## 15. Feature sprints

| Módulo                           | Responsabilidade                        | Destino                                           |
| -------------------------------- | --------------------------------------- | ------------------------------------------------- |
| `SprintView.tsx`                 | shell de rota completa                  | consolidar com layout autenticado                 |
| `SprintPanel.tsx`                | fetch/estado/composição dentro do board | consolidar com rota; evitar segunda implementação |
| `SprintSidebar.tsx`              | navegação de workspace/sprint           | integrar ao shell comum                           |
| `SprintHeader.tsx`               | status/progresso/actions                | portar                                            |
| `SprintCardList.tsx`             | DnD de sprint cards                     | portar após spike                                 |
| `SprintCardItem.tsx`             | card/resumo/métricas                    | portar                                            |
| `modals/CreateSprintModal.tsx`   | create + validação                      | portar; corrigir Zod `issues`                     |
| `modals/EditSprintModal.tsx`     | edit                                    | portar                                            |
| `modals/CompleteSprintModal.tsx` | complete/carry-over                     | portar                                            |
| `modals/AddCardModal.tsx`        | selecionar/criar/adicionar card         | portar                                            |
| `hooks/useSprints.ts`            | optimistic CRUD/state                   | consolidar em sprint state                        |
| `hooks/useSprintCards.ts`        | optimistic add/remove/reorder           | consolidar em sprint state                        |
| `sprint-repository.ts`           | 11 endpoints                            | portar com casing correto                         |
| `sprint.use-cases.ts`            | guards/wrappers                         | portar só regras úteis                            |
| `sprint.actions.ts`/`index.ts`   | Next actions                            | loads/actions/endpoints BFF                       |

## 16. Prioridade técnica

| Prioridade | Módulos                                                        |
| ---------- | -------------------------------------------------------------- |
| P0         | wire contracts/mappers, API client, auth/session, board load   |
| P1         | CRUD/DnD do board, perfil/users, workspace selection           |
| P2         | card modal, comments/history, uploads/storage                  |
| P3         | members/invites/settings/notifications                         |
| P4         | sprints                                                        |
| P5         | diagrama e refinamentos de animação, se não bloquearem produto |

Essa prioridade é técnica, não uma decisão de produto. Se o diagrama ou sprint
for requisito de lançamento, mover a fatia inteira para cima sem pular contratos
e testes.

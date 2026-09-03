# Plano de migração para SvelteKit

## 1. Decisão arquitetural

A migração recomendada é para **Svelte 5 + SvelteKit 2**, mantendo SSR e o padrão
BFF. O navegador não deve receber o JWT nem chamar o Fastify diretamente.

Para manter a aparência atual durante essa troca, a implementação visual deve
seguir o [design system e contrato de preservação visual](DESIGN_SYSTEM.md).

```text
Browser
  -> Svelte components
  -> form actions ou endpoints +server explícitos
  -> apiFetch(event, ...)
  -> Fastify /api com Bearer
```

Essa escolha preserva a propriedade de segurança mais importante do frontend
atual: token HttpOnly e chamadas autenticadas feitas pelo servidor da aplicação.
Também evita depender de CORS para cada operação client-side.

Referências oficiais usadas para a arquitetura-alvo:

- [routing e arquivos `+page`, `+page.server`, `+layout`, `+server`](https://svelte.dev/docs/kit/routing);
- [server load e invalidação de dados](https://svelte.dev/docs/kit/load);
- [form actions e progressive enhancement](https://svelte.dev/docs/kit/form-actions);
- [hooks](https://svelte.dev/docs/kit/hooks) e [auth](https://svelte.dev/docs/kit/auth);
- [variáveis privadas](https://svelte.dev/docs/kit/$env-static-private);
- [deploy como Node server](https://svelte.dev/docs/kit/adapter-node);
- reatividade Svelte 5 com [`$state`](https://svelte.dev/docs/svelte/$state),
  [`$derived`](https://svelte.dev/docs/svelte/$derived) e
  [`$effect`](https://svelte.dev/docs/svelte/$effect).

## 2. Princípios que evitam repetir os defeitos atuais

1. **Wire contract primeiro.** Antes de converter JSX, fazer o cliente SvelteKit
   passar em testes contra payloads reais snake_case.
2. **Migração vertical.** Entregar um fluxo completo por vez, da rota ao backend,
   em vez de converter todas as views e conectar APIs no final.
3. **URL é estado navegável.** Workspace, sprint e entidade selecionada que
   precisa de deep link devem estar na URL; estado efêmero permanece local.
4. **Estado por request/componente.** Nunca colocar estado mutável de usuário em
   módulo global do servidor, pois SSR pode compartilhá-lo entre requests.
5. **Mappers explícitos.** Validar snake_case na borda e expor camelCase à UI.
6. **Otimismo com rollback.** Toda mutação otimista guarda snapshot, exibe estado
   pending e restaura dados em erro.
7. **Dependência só com necessidade.** Não portar bibliotecas React/legado por
   equivalência de nome; cada uma precisa de spike e caso de uso.

## 3. Estrutura-alvo

```text
src/
├── app.d.ts                         # App.Locals: token/user/session
├── hooks.server.ts                  # leitura do cookie e guard central
├── lib/
│   ├── contracts/
│   │   ├── wire/                    # schemas exatamente snake_case
│   │   ├── models/                  # modelos camelCase da UI
│   │   └── mappers/                 # fromWire/toWire testados
│   ├── server/
│   │   ├── api-client.ts            # aceita RequestEvent/fetch/cookies
│   │   ├── auth.ts                  # session helpers server-only
│   │   └── repositories/            # chamadas por domínio
│   ├── features/
│   │   ├── auth/
│   │   ├── board/
│   │   ├── comments/
│   │   ├── diagrams/
│   │   ├── notifications/
│   │   ├── sprints/
│   │   ├── users/
│   │   └── workspaces/
│   ├── state/                       # classes/factories .svelte.ts por instância
│   └── ui/                          # primitives e componentes compartilhados
└── routes/
    ├── +layout.svelte
    ├── +error.svelte
    ├── (public)/
    │   ├── login/+page.svelte
    │   ├── login/+page.server.ts
    │   ├── register/+page.svelte
    │   ├── register/+page.server.ts
    │   └── invite/[workspaceId]/[token]/...
    └── (app)/
        ├── +layout.server.ts         # sessão/perfil compartilhados
        ├── +layout.svelte            # shell/sidebar/header
        ├── +page.server.ts           # board por ?workspace
        ├── +page.svelte
        ├── sprints/[workspaceId]/[sprintId]/...
        └── api/                      # BFF JSON explícito para interações ricas
```

Route groups não mudam a URL. Eles permitem separar layout/guard público e
autenticado sem duplicar lógica.

## 4. Equivalências Next → SvelteKit

| Next/React atual               | SvelteKit/Svelte alvo                            | Observação                                             |
| ------------------------------ | ------------------------------------------------ | ------------------------------------------------------ |
| `app/**/page.tsx`              | `routes/**/+page.svelte`                         | markup da rota                                         |
| async Server Component         | `+page.server.ts`/`+layout.server.ts` `load`     | dados privados server-side                             |
| Server Action de formulário    | `actions` em `+page.server.ts`                   | usar `use:enhance` quando fizer sentido                |
| Server Action chamada como RPC | endpoint BFF `+server.ts` explícito              | indicado para autosave, DnD, canvas e modais           |
| `proxy.ts`                     | `hooks.server.ts` + layout guard                 | separar rotas públicas                                 |
| `cookies()`                    | `event.cookies`                                  | definir os mesmos atributos do cookie                  |
| `redirect()`                   | `redirect(...)` de `@sveltejs/kit`               | não importar internals para detectar redirect          |
| `revalidatePath('/')`          | retorno de action + `invalidate`/`invalidateAll` | invalidar dependências declaradas, não tudo por padrão |
| `useRouter().push/replace`     | `goto(..., {replaceState})`                      | usar `<a>` para navegação normal                       |
| `next/link`                    | `<a href>`                                       | o router intercepta navegação interna                  |
| `loading.tsx`                  | loading local ou navegação via `$app/state`      | evitar loader mínimo artificial em todo fluxo          |
| `not-found.tsx`                | `+error.svelte`                                  | cobre 404 e erros de load                              |
| `useState`                     | `$state`                                         | estado mutável local                                   |
| `useMemo`                      | `$derived`                                       | filtros e contadores                                   |
| `useEffect`                    | `$effect`/`onMount`                              | `$effect` só para sincronização externa                |
| callbacks passados em props    | callback props Svelte 5                          | não usar dispatcher legado sem necessidade             |
| `forwardRef`                   | `bind:this`/element prop                         | somente onde o consumidor precisa do nó                |
| React portals                  | snippets/portal action/dialog nativo             | validar focus trap e stacking                          |
| `next/font`                    | font estática/preload/CSS                        | evitar request externo em runtime                      |

## 5. Cliente HTTP server-side

Criar uma única função server-only com estes requisitos:

- base URL privada lida de `$env/static/private` (ou dynamic quando a plataforma
  realmente exigir configuração em runtime);
- recebe o `fetch` do `RequestEvent`/load/action;
- lê `event.cookies.get('token')` e envia Bearer;
- serializa JSON e FormData sem definir boundary manual;
- retorna `undefined` em 204;
- valida resposta wire com Zod no repository;
- converte erros para um tipo `ApiError {status, code, message}`;
- ao receber 401, apaga cookie no ponto apropriado e redireciona no load/action;
- suporta `AbortSignal`/timeout e preserva headers úteis de observabilidade;
- não faz log do JWT, senha, FormData ou conteúdo privado.

Interface sugerida, sem impor implementação:

```ts
apiRequest<T>(event, path, {
  method,
  query,
  body,
  schema,
  signal
}): Promise<T>
```

Não criar proxy catch-all que encaminhe qualquer path/método fornecido pelo
browser. Endpoints BFF devem ser explícitos para manter autorização, validação e
limite de payload auditáveis.

## 6. Sessão e guards

### 6.1 Login/register

Implementar como form actions:

1. ler `request.formData()`;
2. validar com schema alinhado ao backend (username >= 3, password >= 5);
3. chamar auth repository sem Bearer;
4. gravar `token` com `httpOnly`, `sameSite=lax`, `secure` em produção e `path=/`;
5. validar `callbackUrl` como caminho interno permitido;
6. redirecionar.

Não confiar em regex parcial. Fazer parse de URL relativa e aceitar explicitamente
`/invite/<uuid>/<token>`; rejeitar origem externa e `//host` para evitar open
redirect.

### 6.2 Hook

O `handle` deve ler o cookie e preencher `event.locals`. O token pode ser
decodificado apenas para informação não sensível, mas validade/expiração deve ser
confirmada pela API em rotas protegidas. Rotas públicas explícitas:

- `/login`;
- `/register`;
- preview de convite, somente se o backend também o tornar público;
- assets estáticos.

### 6.3 Layout autenticado

`(app)/+layout.server.ts` deve confirmar perfil/sessão. Em 401, apagar cookie e
redirecionar. Dados compartilhados estáveis como perfil podem vir do layout; board
e sprint ficam nos loads das páginas para não recarregar tudo em toda navegação.

### 6.4 Logout

Form action que apaga cookie com o mesmo `path` e redireciona. Não precisa chamar
o backend porque não há revogação de token implementada.

## 7. Contratos e mappers

Implementar primeiro os schemas wire descritos em `API_CONTRACTS.md`. Exemplo de
limite de responsabilidade:

```text
BoardWireSchema.parse(response)
  -> mapBoardFromWire(wire)
  -> { workspace, lists, cards, members, tags, priorities }
```

O mapper do board deve:

- converter campos snake_case;
- converter `in_progress` para o enum de UI escolhido;
- achatar `lists[].cards` somente se a UI continuar precisando de arrays separados;
- preservar `publicId`/storage key quando disponível;
- manter datas como string ISO na borda; converter para `Date` somente em APIs que
  realmente precisem;
- não usar `any` ou schemas com `z.any()` para members/tags/priorities.

Requests precisam de mappers inversos, especialmente card, sprint, comentário,
diagrama, invite, perfil e upload.

## 8. Estratégia por tipo de interação

### Form actions

Usar em login, register, criação/rename de workspace, perfil, convite e forms de
settings. São operações orientadas a formulário e se beneficiam de validação e
progressive enhancement.

### Endpoints BFF JSON

Usar em:

- autosave do card;
- reorder/move por DnD;
- comentários carregados dentro do modal;
- load/save/delete de diagrama;
- notificações em focus;
- operações rápidas de sprint dentro do painel;
- uploads iniciados pelo editor/contenteditable.

Cada endpoint deve validar params e body antes de chamar o backend.

### Load functions

- board inicial, perfil e usuários em `+page.server.ts`/layout;
- sprint e dependências em paralelo no load da rota;
- convite no load público/protegido conforme contrato decidido;
- declarar dependências (`depends`) para invalidação granular quando útil.

## 9. Estado Svelte por domínio

### Board

Uma factory/classe `createBoardState(initial)` em arquivo `.svelte.ts` por
instância deve expor:

- `$state` para lists/cards/pending/errors;
- `$derived` para cards filtrados, comment counts e agrupamento por lista;
- métodos add/update/delete/reorder com snapshot e rollback;
- geração de temp IDs sem colisão;
- reconciliação com resultado do servidor;
- proteção contra respostas fora de ordem.

### Modal do card

Estado criado ao abrir o modal, nunca singleton global. Preservar debounce de 3 s,
mas também:

- cancelar timer ao fechar/trocar card;
- fazer flush explícito quando necessário;
- impedir que resposta antiga sobrescreva card novo;
- exibir erro e permitir retry;
- separar estado de comentários, histórico e diagrama.

### Filtros

Filtros são bons candidatos a `$state` + `$derived`, sem `$effect`. Se precisarem
ser compartilháveis, serializar no query string; caso contrário ficam locais.

### Workspace ativo

Prioridade:

1. `?workspace=` válido;
2. preferência `localStorage` após mount;
3. primeiro workspace retornado;
4. criação do workspace default no servidor.

Evitar loop de navegação e loader mínimo fixo. A preferência local não deve
substituir uma URL explícita.

### Notificações

Dado inicial pode vir do layout. O refresh em `window.focus` usa `onMount` com
cleanup. Marcar como lida deve aguardar/registrar erro ou restaurar o estado.

## 10. Migração dos componentes

### Shell e rotas

1. layout, tokens CSS, font e error page;
2. auth;
3. sidebar/header/navigation;
4. page do board;
5. rotas de sprint;
6. invite.

### Board

Converter nesta ordem para limitar dependências:

1. primitives (`Button`, `Input`, `Card`, `SimpleField`, `ConfirmationModal`);
2. cards de leitura e badges;
3. list e canvas;
4. filtros;
5. criação/edição/exclusão;
6. DnD;
7. modais e management.

### Card modal

Converter por aba: shell/header → description preview → editor/upload → history →
comments/replies → diagram. O editor e o contenteditable de comentários exigem
spikes isolados porque manipulam DOM, clipboard, selection, IME e upload.

### Diagrama

Preservar a matemática/funções puras de `useDiagram`, mas separar:

- modelo e reducers puros testáveis;
- bindings de pointer/keyboard;
- render SVG/canvas;
- persistência wire.

Antes da conversão visual, resolver `w/h` vs `width/height` e o tratamento de
pressure. Testes de serialização devem usar diagramas reais.

## 11. Bibliotecas: manter, trocar ou remover

| Atual                                                          | Decisão de migração                                                                                             |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| React/ReactDOM/Next                                            | remover quando a rota equivalente estiver entregue                                                              |
| Framer Motion                                                  | reimplementar transições simples com Svelte/CSS; avaliar biblioteca apenas para gestos/layout complexos         |
| lucide-react                                                   | trocar por build Svelte equivalente, mantendo nomes/aria                                                        |
| `@hello-pangea/dnd`                                            | spike com solução Svelte acessível; validar teclado, touch, listas horizontais e rollback                       |
| TipTap React                                                   | manter o core TipTap se o spike confirmar integração Svelte; remover apenas o binding React                     |
| React Markdown                                                 | renderizador Markdown compatível com Svelte ou pipeline sanitizado; nunca usar HTML sem política de sanitização |
| `marked`                                                       | pode permanecer para parsing se sanitização e tipos forem definidos                                             |
| RoughJS / Perfect Freehand / UUID                              | agnósticos de framework; reutilizar após testes                                                                 |
| Zod                                                            | manter para wire/form contracts                                                                                 |
| Tailwind 4 + typography                                        | manter tokens/classes após configurar integração Vite                                                           |
| Supabase/AWS/Backblaze/bcrypt/jose/sharp/TanStack Query no web | remover; não têm imports atuais                                                                                 |

Antes de escolher pacote de DnD/editor/Markdown, criar uma página de laboratório
com os casos difíceis e só então fixar dependência/versão.

## 12. Fases entregáveis

### Fase 0 — contrato executável

Entregas:

- schemas wire e mappers de todos os domínios;
- fixtures reais ou capturadas sem dados sensíveis;
- testes para todos os casos da matriz de divergências;
- decisão documentada para invite, notification workspace, comments e storage.

Aceite: payloads válidos do backend viram modelos UI; payloads incompatíveis
falham com erro descritivo; requests gerados possuem snake_case correto.

### Fase 1 — fundação SvelteKit e auth

Entregas:

- projeto SvelteKit, Tailwind/tokens, env example e adapter do ambiente alvo;
- API client, erros, hook, locals, layouts público/autenticado;
- login, register e logout;
- health/smoke page.

Aceite: token nunca aparece em bundle/localStorage; 401 limpa sessão; callback de
convite não permite open redirect; refresh preserva sessão.

### Fase 2 — board somente leitura

Entregas: workspaces, perfil, users, board snapshot, sidebar/header, listas/cards,
filtros e 404/loading.

Aceite: todos os campos snake viram dados visíveis corretos; URLs diretas e
troca de workspace funcionam; zero erro de hidratação.

### Fase 3 — mutações do board

Entregas: CRUD de workspace/list/card, tipos/WIP, DnD e settings.

Aceite: optimistic update com rollback testado para 403/409/422/500; move entre
listas envia `list_id`; roles da UI correspondem ao backend decidido.

### Fase 4 — card avançado

Entregas: modal, autosave, Markdown/TipTap, upload/delete, comments/replies,
history e diagram.

Aceite: nenhum save perdido ao trocar/fechar card; paginação sem duplicação;
anexos mantêm key; diagrama round-trip não perde geometria.

### Fase 5 — colaboração e perfil

Entregas: members, invites, profile/avatar e notifications.

Aceite: invite anônimo/autenticado segue contrato; avatar persiste após novo
login; notificação abre workspace/card correto; falha de mark-all faz rollback.

### Fase 6 — sprints

Entregas: rotas, lista/detalhe, create/edit/delete/activate/complete, cards,
reorder e carry-over.

Aceite: regras de estado são testadas, requests usam snake_case e deep links
funcionam após refresh.

### Fase 7 — corte e remoção

Entregas: testes de regressão completos, observabilidade, deploy paralelo,
switch de tráfego, remoção de dependências/Next e atualização das docs legadas.

Aceite: nenhum fluxo depende do servidor Next; rollback de deploy foi testado;
README aponta apenas para SvelteKit; documentação antiga é arquivada.

## 13. Estratégia de testes

### Unitários

- todos os mappers snake/camel;
- schemas de form/wire;
- filtros, progresso/checklist e parsing de anexos;
- reducers/geometry/undo-redo do diagrama;
- lógica de reorder e rollback.

### Integração

- API client: headers, FormData, 204, JSON/texto e erros;
- form actions de auth e cookies;
- loads com 401/403/404;
- endpoints BFF e validação;
- mocks baseados em fixtures reais do Fastify.

### Contrato

Preferencialmente subir o `levity-api` em ambiente de teste e validar todos os
endpoints consumidos. Alternativa transitória: exportar OpenAPI/JSON Schema a
partir dos schemas do domínio e testar o cliente contra os artefatos.

### Componentes/E2E

- Vitest + ferramentas Svelte para componentes e estado;
- Playwright para auth, workspace, board DnD, card/modal, uploads, invite e sprint;
- testes de teclado/touch para DnD e modal;
- viewport desktop e mobile;
- checagem de acessibilidade automatizada e manual nos fluxos críticos.

## 14. Deploy e corte

O ambiente de hospedagem atual não está documentado. Para paridade com o servidor
Next, `adapter-node` é o default operacional mais simples, mas precisa ser trocado
se a infraestrutura real for serverless/edge específica.

Estratégia segura:

1. deploy SvelteKit em host/subdomínio interno;
2. apontar para a mesma API de staging;
3. rodar E2E e contrato;
4. liberar por grupo/ambiente, sem compartilhar cookies entre origens por acidente;
5. monitorar 4xx/5xx por endpoint e falhas de parsing;
6. manter artefato Next disponível para rollback durante uma janela definida;
7. somente depois remover o Next e arquivar suas instruções.

## 15. Riscos e mitigação

| Risco                            | Mitigação verificável                                  |
| -------------------------------- | ------------------------------------------------------ |
| copiar contratos camel quebrados | Fase 0 obrigatória e fixtures Fastify                  |
| vazamento de JWT                 | BFF, cookie HttpOnly, teste no bundle/storage/devtools |
| estado SSR compartilhado         | factories por request/componente, teste concorrente    |
| autosave fora de ordem           | abort/versionamento de request e testes com latência   |
| DnD inacessível                  | spike teclado/touch + E2E                              |
| perda de Markdown/anexos         | fixtures round-trip e storage key separada             |
| perda de geometria               | unificar width/height e snapshot de diagramas          |
| duplicação sprint/board          | URL como fonte e controller único                      |
| permissões apenas na UI          | corrigir enforcement no backend; E2E por role          |
| biblioteca inadequada            | spikes antes de comprometer package.json               |

## 16. Definition of Done da migração

- todas as fases aceitas e CI verde;
- `npm run build`/equivalente SvelteKit sem erro ou warning não justificado;
- todos os 53 pontos de integração tentados pelo front têm teste ou foram
  explicitamente removidos;
- nenhum `any` nos wire contracts;
- cookie/JWT e redirects auditados;
- comportamento de erro/rollback visível ao usuário;
- documentação atualizada para o commit final;
- Next, React e dependências legadas ausentes do artefato de produção;
- `README.md` reescrito e `CLAUDE.md` Next arquivado conforme auditoria.

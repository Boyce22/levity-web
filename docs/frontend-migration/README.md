# Migração do frontend Levity: Next.js para SvelteKit

## Objetivo

Este conjunto documenta o frontend existente, as integrações realmente expostas
pelo backend e o plano de migração para SvelteKit. Ele foi produzido por leitura
do código, não apenas pela documentação anterior.

Data do levantamento: **2026-09-03**.

Revisões analisadas:

- `levity-web`: branch `develop`, commit `19decb3d89633f7cf3f5c75389bce6f28b924c3b`;
- `levity-api`: branch `develop`, commit `d5d54bed6e364dbe62ffc8416b3158027094d730`.

Se os commits mudarem, revalidar principalmente as matrizes de rotas e contratos.

## Ordem de leitura

1. [Arquitetura atual](CURRENT_FRONTEND.md): rotas, camadas, estado, módulos,
   fluxos de usuário, dependências e pontos específicos do Next/React.
2. [Inventário de código](CODE_INVENTORY.md): responsabilidade de cada módulo e
   prioridade de migração.
3. [Design system](DESIGN_SYSTEM.md): tokens, temas, componentes, estados,
   responsividade, acessibilidade e contrato de preservação visual no Svelte.
4. [Contratos e integrações](API_CONTRACTS.md): autenticação, cliente HTTP,
   endpoints, payloads, respostas e divergências comprovadas entre front e API.
5. [Plano SvelteKit](SVELTEKIT_PLAN.md): arquitetura-alvo, estrutura de pastas,
   ordem de implementação, estratégia de testes e critérios de aceite.
6. [Auditoria da documentação antiga](LEGACY_DOCS_AUDIT.md): o que ainda é útil,
   o que está errado e quando arquivar ou substituir cada arquivo.

## Fontes de verdade

Durante a migração, usar esta precedência:

1. controllers, schemas Zod e services em `../levity-api`;
2. comportamento observado e testes de contrato;
3. arquivos em `src/contracts` e repositories do frontend;
4. esta documentação;
5. `levity-api/docs/API.md`;
6. o `README.md` e o `CLAUDE.md` legados do frontend.

Essa ordem é necessária porque os contratos do frontend estão em camelCase,
enquanto a API implementada usa snake_case, e a documentação anterior não cobre
todos os endpoints atuais.

## Escopo coberto

- 6 rotas de aplicação, layout, loading e página 404;
- 173 arquivos TypeScript/TSX sob `src` (aproximadamente 13.983 linhas);
- 40 módulos explicitamente marcados como client-side;
- autenticação JWT, cookie, proteção de rotas e redirecionamentos;
- todos os endpoints consumidos pelo frontend e todos os endpoints expostos pelo
  backend que afetam o front;
- board, listas, cards, comentários, histórico, diagramas, workspaces, membros,
  convites, perfil, notificações, upload e sprints;
- estado local, atualizações otimistas, cache/revalidação e acesso ao DOM;
- bibliotecas React/Next que precisam ser substituídas ou removidas;
- falhas de contrato e baseline de qualidade antes da migração.

## Situação do baseline

Comandos executados sem modificar código de produto:

| Verificação                     | Resultado em 2026-09-03                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| `levity-web: npm run build`     | Falha no typecheck: uso de `ZodError.errors` em `CreateSprintModal.tsx`; Zod 4 expõe `issues`. |
| `levity-web: npm run lint`      | Falha com 234 ocorrências: 164 erros e 70 avisos.                                              |
| `levity-api: npm run typecheck` | Passou.                                                                                        |
| `levity-api: npm test`          | 7 testes passaram e 1 falhou ao referenciar `userName` em vez de `username`.                   |

Não se deve usar “o projeto compila” como critério de equivalência da migração.
O novo frontend precisa começar com testes de contrato e fluxos críticos, pois o
baseline atual já contém falhas de build e incompatibilidades de runtime.

## Decisões já tomadas para a documentação

- A documentação nova fica isolada da implementação para não misturar correções
  funcionais com o levantamento.
- O README antigo não foi apagado; recebeu um aviso de obsolescência.
- O `CLAUDE.md` continua disponível para manutenção do Next durante a transição,
  mas recebeu um aviso de que não define a arquitetura SvelteKit.
- O `levity-api/docs/API.md` não será copiado literalmente: ele omite endpoints
  novos e contém diferenças em relação às permissões realmente implementadas.

## Como manter este material correto

Toda alteração de endpoint deve atualizar `API_CONTRACTS.md` no mesmo pull
request. Toda nova rota ou fluxo de UI deve atualizar `CURRENT_FRONTEND.md`. Uma
fase de migração só pode ser marcada como concluída quando os critérios de aceite
correspondentes em `SVELTEKIT_PLAN.md` estiverem automatizados ou registrados com
evidência manual reproduzível. Alterações visuais, tokens ou novas variantes de
componente também devem atualizar `DESIGN_SYSTEM.md` e sua matriz de regressão.

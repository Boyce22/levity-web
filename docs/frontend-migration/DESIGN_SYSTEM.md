# Design system e contrato de preservação visual

## 1. Objetivo

Este documento transforma a estilização existente do frontend Next/React em uma
especificação reproduzível para a migração a SvelteKit. A meta não é redesenhar o
produto: é manter sua identidade visual e seu comportamento perceptível enquanto
se elimina a duplicação de estilos que hoje dificulta a manutenção.

Data do levantamento: **2026-09-03**.

Fontes inspecionadas:

- `src/app/globals.css` e `src/app/layout.tsx`;
- primitivas em `src/ui/primitives` e compartilhados em `src/ui/components`;
- telas de autenticação, convite, board, cards, comentários, diagramas, sprints,
  workspaces, perfil e notificações;
- valores padrão da versão de Tailwind instalada no projeto.

As regras abaixo usam três classificações:

| Classificação     | Significado na migração                                                          |
| ----------------- | -------------------------------------------------------------------------------- |
| **Preservar**     | Faz parte da identidade ou da hierarquia visual observada.                       |
| **Normalizar**    | A aparência deve continuar igual, mas o valor deve virar token/componente único. |
| **Não perpetuar** | É uma exceção, inconsistência ou defeito da implementação atual.                 |

## 2. Assinatura visual do Levity

O frontend tem aparência de ferramenta SaaS técnica e densa, com estas
características dominantes:

- superfícies grafite quase pretas, separadas por pequenas variações de luminosidade;
- bordas brancas translúcidas e sombras pretas suaves para criar profundidade;
- indigo como ação, seleção, foco e progresso principal;
- verde, âmbar e vermelho reservados a estados semânticos;
- tipografia Geist compacta, títulos fortes e metadados pequenos em caixa alta;
- cantos predominantemente discretos nos controles e modais;
- cartões do kanban mais arredondados que o restante da interface;
- movimentos curtos de fade, translate e scale, com springs nos elementos flutuantes;
- glassmorphism apenas em contextos especiais, como autenticação, overlays e toolbar.

Esses pontos são **preservar**. Gradientes, brilhos, ruído e cantos muito grandes
aparecem nas telas de entrada/erro e não devem ser espalhados para a área operacional.

## 3. Estado real do sistema atual

O projeto já possui uma boa base semântica no CSS global, mas ainda não possui um
design system fechado:

- há 12 tokens semânticos de cor `--app-*`;
- `Button`, `Input` e `Card` existem como primitivas, porém muitos componentes
  recriam os mesmos controles localmente;
- uma varredura mecânica dos 93 arquivos TSX encontrou 366 usos de `var(--app-*)`,
  mas também 127 cores hexadecimais e 90 ocorrências `rgb/rgba` no JSX;
- `rounded-sm` aparece 170 vezes e é a linguagem dominante, mas há pelo menos 100
  usos de outros raios, incluindo `14px`, `18px`, `24px` e `32px`;
- existem temas `dark`, `artic` e `omni`, mas não existe código que aplique ou
  persista `data-theme`; na prática, somente o tema escuro padrão está ativo;
- notificações, algumas primitivas, autenticação e páginas especiais ignoram
  parcialmente os tokens de tema.

Portanto, o código React atual é a fonte da aparência, mas não deve ser copiado
classe por classe. O Svelte deve reproduzir o resultado por meio dos tokens e
contratos deste documento.

## 4. Fundações

### 4.1 Temas e superfícies

Os nomes das variáveis e seus valores atuais devem ser preservados no primeiro
release Svelte:

| Token                 | Dark                    | Artic                   | Omni                    | Uso                          |
| --------------------- | ----------------------- | ----------------------- | ----------------------- | ---------------------------- |
| `--app-bg`            | `#151515`               | `#2e3440`               | `#191622`               | canvas e fundo raiz          |
| `--app-header`        | `#1c1c1e`               | `#3b4252`               | `#211c2e`               | header e áreas estruturais   |
| `--app-panel`         | `#212124`               | `#434c5e`               | `#282a36`               | listas, inputs, painéis      |
| `--app-elevated`      | `#1a1a1c`               | `#4c566a`               | `#303342`               | cards e menus elevados       |
| `--app-hover`         | `rgba(255,255,255,.05)` | `rgba(255,255,255,.10)` | `rgba(255,255,255,.05)` | hover neutro                 |
| `--app-border`        | `rgba(255,255,255,.10)` | `#4c566a`               | `#44475a`               | borda visível                |
| `--app-border-faint`  | `rgba(255,255,255,.05)` | `#3b4252`               | `rgba(68,71,90,.50)`    | divisores e bordas discretas |
| `--app-primary`       | `#818cf8`               | `#88c0d0`               | `#ff79c6`               | seleção, foco e destaque     |
| `--app-primary-hover` | `#6366f1`               | `#81a1c1`               | `#bd93f9`               | ação principal em hover      |
| `--app-primary-muted` | `rgba(99,102,241,.20)`  | `rgba(136,192,208,.20)` | `rgba(255,121,198,.20)` | fundos selecionados          |
| `--app-text`          | `#ffffff`               | `#eceff4`               | `#f8f8f2`               | texto principal              |
| `--app-text-muted`    | `rgba(255,255,255,.50)` | `#d8dee9`               | `#8be9fd`               | texto secundário             |

O identificador atual é literalmente `artic`, sem o segundo “c”. Para não quebrar
preferências futuras ou links existentes, o Svelte deve aceitar `artic` como chave
canônica nesta migração. Uma renomeação para `arctic` só deve ocorrer com alias e
migração explícita de preferência.

Regras:

1. `dark` permanece o padrão quando não houver preferência.
2. Aplicar o tema em `document.documentElement.dataset.theme` antes da primeira
   pintura para evitar flash de cores.
3. Se um seletor de tema for criado, persistir apenas `dark | artic | omni` e
   validar o valor lido do storage/cookie.
4. Até existir esse seletor, não apresentar os dois temas alternativos como
   funcionalidade já entregue.
5. Componentes nunca devem fixar `#151515`, `#1c1c1e`, branco translúcido ou
   indigo quando o significado já estiver coberto por `--app-*`.

Há duas intensidades de ação principal no dark atual. Controles compactos usam
`--app-primary` em alguns pontos, enquanto a primitiva e CTAs de sprint usam
Tailwind `indigo-600` (`#4f46e5`) com hover `indigo-700` (`#4338ca`). Ações de
conclusão em modal usam gradiente `#4f46e5 → #312e81`. Para paridade sem perder
essa hierarquia, criar tokens `--action-primary-solid`, `--action-primary-hover`,
`--action-emphasis-start` e `--action-emphasis-end`. Definir os valores acima no
dark; antes de habilitar `artic` e `omni`, escolher equivalentes com contraste AA
e aprovar capturas. Não tratar os indigos fixos como cor estrutural universal.

### 4.2 Tokens semânticos adicionais

Os seguintes valores aparecem repetidamente no produto e devem ser consolidados:

```css
:root {
  --action-primary-solid: #4f46e5;
  --action-primary-hover: #4338ca;
  --action-emphasis-start: #4f46e5;
  --action-emphasis-end: #312e81;

  --color-success: #34d399;
  --color-success-strong: #10b981;
  --color-warning: #fbbf24;
  --color-warning-strong: #f59e0b;
  --color-danger: #f87171;
  --color-danger-strong: #ef4444;
  --color-info: #60a5fa;
  --color-neutral: #94a3b8;

  --overlay-standard: rgb(0 0 0 / 0.6);
  --overlay-strong: rgb(0 0 0 / 0.75);
  --focus-ring: color-mix(in srgb, var(--app-primary) 20%, transparent);
}
```

Uso semântico obrigatório:

| Estado                      | Cor base          | Fundo recomendado     | Borda recomendada |
| --------------------------- | ----------------- | --------------------- | ----------------- |
| sucesso, concluído, salvo   | `--color-success` | cor a 10–15%          | cor a 20–30%      |
| atenção, prazo próximo      | `--color-warning` | cor a 10–15%          | cor a 20–30%      |
| erro, atrasado, destrutivo  | `--color-danger`  | cor a 10–15%          | cor a 20–30%      |
| informação não selecionável | `--color-info`    | cor a 10–15%          | cor a 20–30%      |
| seleção/ação/foco           | `--app-primary`   | `--app-primary-muted` | primary a 20–40%  |

Cor nunca deve ser o único indicador de estado: manter ícone, texto, forma ou
rótulo junto à cor.

### 4.3 Cores de domínio

#### Tipo de lista

| Tipo         | Cor       | Progresso implícito |
| ------------ | --------- | ------------------- |
| `todo`       | `#6b7280` | 0%                  |
| `inProgress` | `#818cf8` | 50%                 |
| `review`     | `#f59e0b` | 75%                 |
| `done`       | `#34d399` | 100%                |

Essas cores são informação de domínio e permanecem estáveis entre temas. O tema
`artic` ou `omni` muda a cor primária da interface, mas não deve mudar o significado
de review/done. O tipo `inProgress` usa hoje indigo fixo; normalizar como token
`--list-in-progress`, não como `--app-primary`, para preservar essa decisão.

#### Prioridade

| Prioridade | Cor       | Rótulo |
| ---------- | --------- | ------ |
| alta       | `#f87171` | High   |
| média      | `#fbbf24` | Medium |
| baixa      | `#34d399` | Low    |

#### Labels padrão

| Label        | Texto/ponto           | Fundo atual             |
| ------------ | --------------------- | ----------------------- |
| Feature      | primary / `#818cf8`   | `rgba(99,102,241,.15)`  |
| Bug          | `#f87171` / `#ef4444` | `rgba(239,68,68,.15)`   |
| Infra        | muted / `#888`        | `rgba(255,255,255,.08)` |
| Design       | `#c084fc` / `#a855f7` | `rgba(168,85,247,.15)`  |
| Research     | `#2dd4bf` / `#14b8a6` | `rgba(20,184,166,.15)`  |
| desconhecida | muted / `#9ca3af`     | `rgba(255,255,255,.05)` |

Labels e prioridades recebidas do backend podem trazer cor própria. Validar o
formato antes de usá-la em `style`; aplicar a cor apenas a texto, ponto, borda e
fundo translúcido, mantendo contraste mínimo.

### 4.4 Tipografia

Famílias atuais:

- interface: `Geist`, fallback `sans-serif`;
- dados técnicos: `Geist Mono`, fallback `monospace`;
- antialiasing aplicado no elemento `html`.

No SvelteKit, servir as fontes localmente e declarar `font-display: swap`. Não
depender de `next/font`. Os arquivos de fonte e suas licenças devem entrar no
repositório ou no pipeline de assets antes do corte.

Escala canônica, baseada no uso atual:

| Papel                         | Tamanho   | Peso    | Observação                             |
| ----------------------------- | --------- | ------- | -------------------------------------- |
| display de exceção            | 36px      | 700     | 404; não usar na aplicação operacional |
| título de página/card grande  | 24px      | 700     | gestão, convite                        |
| título de seção               | 20px      | 700     | sprints e estados vazios               |
| título de modal/card editável | 18px      | 700     | modal detalhado                        |
| título compacto               | 16px      | 700     | cabeçalho de modal                     |
| corpo padrão                  | 14px      | 400–600 | inputs, tabelas e navegação            |
| corpo denso                   | 13–13.5px | 400–700 | cards, descrições e ações              |
| legenda                       | 12px      | 400–600 | ajuda e timestamp                      |
| metadado                      | 10–11px   | 600–900 | badges, contadores e labels            |
| microtexto                    | 9px       | 700–900 | tooltip/estado muito compacto          |

Regras:

- títulos usam `letter-spacing: -0.025em` (`tracking-tight`) quando já ocorre;
- metadados em caixa alta usam espaçamento de `0.05em` a `0.1em`; o loader é a
  exceção de marca com `0.4em`;
- corpo longo usa `line-height` de 1.45 a 1.625;
- `font-mono` fica reservado a token, atalho, identificador e valor técnico;
- evitar criar novos tamanhos fracionários além de 13px e 13.5px.

### 4.5 Espaçamento e densidade

O projeto usa a base Tailwind instalada de `0.25rem` (4px). Manter esta grade.

| Token sugerido | Valor | Uso observado                              |
| -------------- | ----- | ------------------------------------------ |
| `space-1`      | 4px   | separação mínima, ícone/rótulo             |
| `space-1.5`    | 6px   | badges e controles densos                  |
| `space-2`      | 8px   | ações, linhas e grupos pequenos            |
| `space-2.5`    | 10px  | cards em lista e botões compactos          |
| `space-3`      | 12px  | padding de card e gaps padrão              |
| `space-4`      | 16px  | gap entre listas e padding de tela pequeno |
| `space-5`      | 20px  | canvas do board                            |
| `space-6`      | 24px  | cabeçalhos, modais e conteúdo desktop      |
| `space-8`      | 32px  | separação de blocos maiores                |
| `space-10`     | 40px  | cards de convite/estado especial           |

Não introduzir uma segunda grade. Valores fora dela só são aceitos quando
registram dimensões estruturais ou ajuste ótico já comprovado.

### 4.6 Raios

Os raios atuais têm dois dialetos. O operacional é compacto; as páginas de
convite/404 e alguns componentes antigos são mais arredondados.

| Token sugerido     | Valor  | Aplicação canônica                                             |
| ------------------ | ------ | -------------------------------------------------------------- |
| `--radius-micro`   | 2px    | teclas e indicadores mínimos                                   |
| `--radius-control` | 4px    | botões, selects, tabs, menus, modais e painéis operacionais    |
| `--radius-input`   | 8px    | inputs legados e pequenos editores quando a paridade exigir    |
| `--radius-panel`   | 12px   | lista do board e editor rico                                   |
| `--radius-card`    | 14px   | card do kanban e sua capa                                      |
| `--radius-float`   | 18px   | popover de notificação atual                                   |
| `--radius-pill`    | 9999px | avatar circular, progresso, contador e chips em formato pílula |

`24px` e `32px` são exceções visuais das telas de convite, erro e do modal antigo
de exclusão de lista. Preservar nessas telas durante a paridade, mas não usá-los
em novos componentes operacionais.

### 4.7 Bordas, sombras e blur

Bordas:

- divisores: `1px solid var(--app-border-faint)`;
- controle/painel: `1px solid var(--app-border)`;
- foco: borda primary + halo de 2–3px a 20% de opacidade;
- drag ativo: borda primary e segundo contorno sutil;
- drop zone e criação: borda tracejada de 1–1.5px.

Sombras canônicas:

```css
:root {
  --shadow-card: 0 1px 3px rgb(0 0 0 / 0.2);
  --shadow-list: 0 2px 8px rgb(0 0 0 / 0.15);
  --shadow-popover: 0 12px 40px rgb(0 0 0 / 0.5);
  --shadow-drag: 0 20px 60px rgb(0 0 0 / 0.5);
  --shadow-modal: 0 32px 80px rgb(0 0 0 / 0.6);
}
```

Blur:

- backdrop de modal comum: `backdrop-filter: blur(8px)`;
- modal de card: overlay forte com `blur(12px)`;
- autenticação: painel com `blur(20px)`;
- toolbar flutuante: blur médio de 12px;
- glows de 60px/140px são decorativos e exclusivos das telas atmosféricas.

### 4.8 Iconografia e marca

- biblioteca atual: Lucide, normalmente 13–20px e `stroke-width` padrão;
- ícone em botão compacto: 14–16px;
- ícone de título/estado vazio: 20–40px;
- ícones sem texto precisam de `aria-label` e tooltip/title quando o significado
  não for universal;
- o logo é SVG próprio, viewBox `0 0 100 100`, gradiente `#818cf8 → #c084fc`,
  detalhe branco a 15% e ponto `#10b981`;
- a animação de desenho do logo dura 1s; barra entra após 0.5s por 0.8s e o ponto
  usa spring após 1s.

No Svelte, portar o SVG como componente nativo. IDs de `linearGradient` e `filter`
devem ser únicos por instância para evitar colisão quando houver mais de um logo
na página.

## 5. Estrutura e dimensões principais

| Elemento                 | Contrato visual atual                                                |
| ------------------------ | -------------------------------------------------------------------- |
| viewport autenticado     | `height: 100vh`, sem overflow no shell                               |
| sidebar                  | 72px recolhida, 260px expandida no hover, altura 100vh               |
| sidebar/header principal | 64px de altura                                                       |
| barra de filtros         | padding horizontal 24px, vertical 8px, conteúdo em uma linha         |
| canvas do board          | overflow nos dois eixos, padding 20px/24px, gap entre listas de 16px |
| lista kanban             | largura fixa de 280px                                                |
| card kanban              | padding interno 14px, raio 14px                                      |
| modal compacto           | 380–448px de largura máxima, padding horizontal 24px                 |
| modal de settings/perfil | 400–420px de largura máxima                                          |
| modal de card mobile     | largura total, máximo 95vw e 92vh                                    |
| modal de card desktop    | 68rem × 48rem a partir de 640px                                      |
| dropdown de notificação  | 300px de largura, 380px de altura máxima                             |
| dropdown/select          | lista até 300px de altura; mínimo de 130px/180px conforme tamanho    |

A expansão da sidebar em hover faz parte do comportamento atual, mas é inadequada
para touch. Na migração, preserve 72/260px no desktop e implemente um drawer
acionado por botão abaixo do breakpoint de 768px. Não dependa de hover para acesso
a navegação ou ações essenciais.

## 6. Contratos dos componentes

### 6.1 Button

Variantes mínimas:

| Variante  | Visual                                                          |
| --------- | --------------------------------------------------------------- |
| primary   | fundo sólido de ação, texto branco, hover mais escuro/luminoso  |
| emphasis  | gradiente usado em conclusão e salvamento de modal              |
| secondary | fundo neutro translúcido/panel, texto principal, borda discreta |
| danger    | vermelho sólido ou tint de danger conforme a criticidade        |
| ghost     | transparente, texto muted, hover com `--app-hover`              |

Tamanhos atuais:

- `sm`: `12px 6px`, texto 12px;
- `md`: `16px 8px`, texto 14px;
- `lg`: `24px 12px`, texto 16px.

Estados obrigatórios: default, hover, active, focus-visible, disabled e loading.
Loading mantém a largura, desabilita interação e mostra spinner de 16px. Em Svelte,
usar `aria-busy`, preservar o rótulo acessível e não remover o conteúdo de modo que
o botão mude de largura.

O `Button.tsx` atual fixa indigo, branco e `#1c1c1e`; isso deve ser **normalizado**
para tokens sem mudar a aparência no tema dark.

### 6.2 Input, textarea e field

- label normal: 14px/500; label densa: 11px/700/uppercase;
- fundo `--app-panel` ou `--app-header` conforme a tela;
- texto `--app-text`, placeholder muted a 50%;
- padding predominante `12px 8px`;
- borda padrão faint; foco primary com halo de 2–3px a 20%;
- erro usa borda e mensagem danger de 12px;
- disabled usa opacidade de 50% e cursor coerente;
- autofill deve manter fundo e texto do tema.

Unificar `Input`, `SimpleField` e os campos reescritos dentro dos modais. O
componente Svelte deve aceitar `label`, `error`, `hint`, `required` e repassar os
atributos nativos, associando label/erro por `id` e `aria-describedby`.

### 6.3 Select e popover

- trigger `--app-panel`, borda faint, raio 4px e sombra pequena;
- `sm`: `8px 4px`, texto visual de 11px; `md`: `12px 8px`, 13px;
- rótulo selecionado em 10px/uppercase/600;
- menu usa `--app-bg`, padding 6px, sombra popover e z-index acima do modal;
- item selecionado recebe primary a 10% e texto primary;
- opção disabled: 50% de opacidade, cursor bloqueado e dessaturação;
- seta gira em 300ms; menu entra em 150ms com opacity/translate/scale.

O port Svelte deve implementar teclado completo: setas, Home/End, Enter/Space,
Escape e typeahead; restaurar foco ao trigger; reposicionar em resize/scroll; e
usar portal/floating layer que não seja cortado pelo overflow. O `role=listbox`
atual sem esse teclado não é paridade acessível suficiente.

### 6.4 Card de superfície

Usar duas variantes:

- `surface`: fundo da superfície e borda faint;
- `glass`: branco a 5%, blur médio e borda branca a 10%.

Não transportar literalmente o `Card.tsx` atual, que fixa fundo dark e usa raio
12px para todos os contextos. O card de domínio do kanban tem contrato próprio.

### 6.5 Card do kanban

- fundo `--app-elevated`, borda faint, raio 14px e `--shadow-card`;
- capa, quando presente, tem 96px de altura e raio superior de 14px;
- conteúdo: 13px/500, line-height 1.45;
- badges aparecem antes do título, com wrap e gap de 8px;
- progresso: trilho de 3px; warning abaixo de 40%, primary de 40–79%, success a
  partir de 80%; transição de largura em 500ms;
- rodapé inclui prazo, indicadores de descrição/comentário e avatar de 24px;
- ação de excluir surge no hover desktop, mas deve ficar acessível por foco e por
  menu no touch;
- drag: scale 1.03, rotação 1°, borda primary e sombra elevada; o placeholder deve
  conservar o tamanho original.

### 6.6 Lista kanban

- 280px fixos, fundo panel, raio inferior 12px e sombra de lista;
- barra superior de 3px com a cor do tipo da lista a 70%;
- header com padding `14px 16px 12px`, título 14px/600;
- cards separados por 10px, padding lateral de 12px;
- drop target usa tint do accent e raio 12px;
- WIP atingido troca barra/borda por danger e mostra aviso textual de 11px;
- adicionar tarefa é ação ghost; adicionar lista é bloco de 260px com borda
  tracejada e raio 18px.

### 6.7 Shell, header e filtros

- shell e conteúdo usam `--app-bg`; header usa `--app-header`;
- sidebar tem borda direita faint e sombra preta a 15%;
- item ativo recebe `--app-primary-muted`, texto primary e barra direita de 4px;
- navegação disabled usa 40% de opacidade e badge “Soon”;
- breadcrumb do header limita workspace a 150px e trunca;
- filtros formam uma barra densa, com gaps de 24px e divisores de 18px;
- “Clear filters” é uma ação danger em 10px/uppercase;
- progresso geral aparece somente em desktop (`>= 768px`).

As implementações duplicadas de `Sidebar` e `SprintSidebar` devem virar um shell
único com slots/snippets para navegação contextual.

### 6.8 Modal e dialog

Modal operacional compacto:

- overlay `--overlay-standard`, blur 8px;
- container em `--app-bg`, borda `--app-border`, raio 4–6px;
- sombra modal;
- header `24px 24px 20px`, título 16px/700 e ícone 20px;
- body `20px 24px 24px`;
- entrada: opacity 0 → 1, scale .95/.98 → 1 e y 10px → 0 em 200–250ms;
- saída simétrica;
- confirmação destrutiva apresenta ação danger primeiro e cancelar abaixo.

Modal de card:

- bottom sheet no mobile e diálogo central a partir de 640px;
- overlay forte a 75% com blur 12px;
- dimensões descritas na seção 5;
- header e footer fixos, conteúdo central com scroll;
- tabs sticky, separadas por underline primary animado;
- footer oferece Close e Done, com atalhos exibidos somente em desktop.

Todo dialog Svelte deve bloquear scroll do fundo, manter foco dentro dele, fechar
com Escape, restaurar foco ao opener, ter `aria-labelledby` e impedir fechamento
acidental enquanto uma operação crítica está pendente.

### 6.9 Tabs, badges e status

- tab: 13–14px/700, muted quando inativa e texto principal quando ativa;
- underline active: 2px, primary, movimento spring;
- badge denso: 10px/700–900, uppercase, padding horizontal de 6–8px e vertical
  de 2px;
- badge de sprint: planning=warning, active=success, completed=neutral;
- contador pode ser pill; status operacional usa raio 4px;
- pulsar é aceito apenas em estado realmente vivo/ativo, nunca como decoração geral.

### 6.10 Notificações

Preservar o formato compacto e elevado: botão 36×36px, contador 16×16px, popover
300px/380px, itens com avatar de 28px e tipografia 10–12.5px. Normalizar todas as
cores hoje fixadas em `#151515`, branco e indigo para tokens do tema. Item não lido
usa fundo primary muito sutil e um ponto de 8px; item lido fica a 60%.

### 6.11 Editor rico, comentários e anexos

- editor rico usa panel, borda padrão, raio 12px e área mínima de 160px;
- comentário novo usa campo mínimo de 100px e máximo de 180px antes de scroll;
- bolha de comentário usa 13.5px, line-height relaxado, raio 4px e canto superior
  esquerdo reto;
- ações de editar/excluir devem aparecer em hover **e** `focus-within`;
- anexos ocupam largura total no mobile e até metade da linha a partir de 640px;
- markdown/prose deve manter o tema invertido, mas links, foco e código devem usar
  tokens em vez de cores fixas.

### 6.12 Diagrama

- canvas usa `--app-bg`, grid pontilhado discreto e cursor de ferramenta;
- toolbar flutuante usa fundo de app a 80%, blur médio de 12px, borda faint e
  sombra;
- ferramentas ativas usam primary a 10%; inativas usam muted e hover panel;
- cores de desenho são uma paleta de domínio, não cores estruturais do tema;
- seleção de cor combina escala, borda principal e ring;
- manipulação direta no canvas não deve receber transição CSS.

### 6.13 Estados vazios, loading e páginas atmosféricas

Estados vazios operacionais usam ícone em caixa primary a 10%, título 20px e corpo
14px muted. O loader global e a página 404 usam fundo especial `#050507`, glows
indigo, logo animado e textura de ruído. Preservar o resultado visual, mas hospedar
a textura localmente; hoje ela é carregada de `grainy-gradients.vercel.app`.

O loader simula avanço até 94% e finaliza em 100%. A barra tem 160px × 1px e usa
spring lento. Em `prefers-reduced-motion`, mostrar progresso sem respiração, blur
animado ou movimento contínuo.

## 7. Movimento

Tokens recomendados a partir dos padrões atuais:

```css
:root {
  --motion-fast: 150ms;
  --motion-base: 200ms;
  --motion-panel: 250ms;
  --motion-slow: 500ms;
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}
```

| Interação            | Receita                                                    |
| -------------------- | ---------------------------------------------------------- |
| hover/focus          | cores/opacidade, 150ms                                     |
| menu/select          | fade + y de 4–8px + scale .95–.98, 150ms                   |
| modal compacto       | fade + y 10px + scale .95/.98, 200–250ms                   |
| troca de view/tab    | fade + x/y 10–20px, 150–500ms                              |
| modal grande/popover | spring, damping 28, stiffness 320–340                      |
| auth layout          | spring, damping 25, stiffness 200                          |
| drag card            | transformação controlada pela biblioteca, sem easing extra |
| progresso            | largura 500–700ms; loader spring damping 30/stiffness 35   |

No Svelte, CSS transitions resolvem hover, focus, dropdowns simples e tabs. Usar
`transition:fade`, `fly`, `scale` ou uma biblioteca de motion somente quando houver
spring/layout compartilhado. Não adicionar dependência apenas para reproduzir um
fade de 150ms.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }
}
```

## 8. Responsividade

Breakpoints da instalação atual:

| Nome  | Valor  |
| ----- | ------ |
| `sm`  | 640px  |
| `md`  | 768px  |
| `lg`  | 1024px |
| `xl`  | 1280px |
| `2xl` | 1536px |

O frontend atual usa poucos modificadores responsivos: é majoritariamente desktop
e permite scroll horizontal no board. Isso é limitação conhecida, não princípio do
design system.

Contrato mínimo da migração:

- `< 640px`: modais compactos com margem 16px; modal de card como bottom sheet;
  anexos em uma coluna; ações essenciais sempre visíveis;
- `640–767px`: modal de card central pode assumir tamanho desktop limitado ao viewport;
- `< 768px`: sidebar como drawer controlado; progresso do header oculto; tabelas de
  gestão precisam de scroll horizontal ou representação em cards;
- `>= 768px`: shell 72/260px, barra de filtros e atalhos de teclado completos;
- board mantém colunas de 280px e scroll horizontal em todos os tamanhos, sem
  comprimi-las a ponto de alterar legibilidade.

Validar pelo menos 360×800, 768×1024, 1280×800 e 1440×900. Também testar zoom de
200%, nomes longos, 9+ notificações, lista vazia, lista WIP cheia e cards com todos
os metadados.

## 9. Acessibilidade como parte da paridade

Manter a aparência não significa manter falhas atuais. O release Svelte deve:

- usar `:focus-visible` consistente em toda interação;
- assegurar alvo de toque de pelo menos 40×40px para ações isoladas; ícones visuais
  podem continuar com 14–20px;
- manter contraste WCAG AA para texto funcional; `--app-text-muted` com opacidades
  adicionais de 30–60% exige teste e não deve conter informação essencial;
- dar nome acessível a botões de ícone e `alt` informativo a avatares/capas;
- implementar dialogs, listboxes, menus, tabs e drag-and-drop com teclado;
- oferecer alternativa de reorder por teclado/botões ao gesto de drag;
- anunciar loading, erro, salvamento e atualizações otimistas com região apropriada;
- respeitar `prefers-reduced-motion`;
- não esconder a única ação disponível atrás de hover;
- definir corretamente o idioma da página. Hoje o layout usa `lang="en"`, enquanto
  há textos em inglês e português; a decisão de idioma deve ser explícita por rota
  ou por internacionalização.

## 10. Implementação recomendada em SvelteKit

Estrutura:

```text
src/lib/styles/
├── tokens.css             # cores, tipografia, spacing, raios, sombras e motion
├── themes.css             # dark, artic e omni
├── base.css               # reset, body, focus, scrollbar, autofill e reduced motion
└── prose.css              # conteúdo rico/markdown

src/lib/ui/
├── Button.svelte
├── Field.svelte
├── Input.svelte
├── Select.svelte
├── Surface.svelte
├── Badge.svelte
├── Tabs.svelte
├── Modal.svelte
├── Popover.svelte
├── Avatar.svelte
├── Spinner.svelte
└── LevityLogo.svelte
```

Ordem:

1. copiar os tokens de tema e configurar Geist local;
2. implementar base, focus, scrollbar, autofill e reduced motion;
3. construir as primitivas isoladamente com todos os estados;
4. portar shell/sidebar/header;
5. portar lista e card do board;
6. portar dialogs, pickers e notificações;
7. portar editor, comentários, diagrama e sprints;
8. comparar visualmente todas as rotas antes de remover o React.

O design system pode continuar usando Tailwind 4 no SvelteKit para reduzir risco
de paridade. Os tokens, entretanto, devem ser CSS custom properties independentes
do Tailwind. Classes utilitárias ficam para composição; decisões de marca ficam nos
tokens/componentes.

Contrato de tema inicial:

```html
<html lang="en" data-theme="dark"></html>
```

```css
@import "./tokens.css";
@import "./themes.css";
@import "./base.css";

body {
  min-height: 100%;
  color: var(--app-text);
  background: var(--app-bg);
  font-family: var(--font-sans), sans-serif;
  transition:
    background-color var(--motion-base) ease,
    color var(--motion-base) ease;
}
```

Cada componente Svelte deve expor propriedades de significado (`variant="danger"`,
`size="sm"`, `loading`) em vez de receber strings de classes como API principal.
Aceitar `class` para composição externa, mas manter estados e anatomia dentro do
componente.

## 11. O que preservar, normalizar e não perpetuar

### Preservar

- tema dark como padrão e os valores dos três temas;
- Geist/Geist Mono, densidade e hierarquia tipográfica;
- shell 64px, sidebar 72/260px, listas 280px e cards 14px;
- primary indigo no dark e paleta semântica de status;
- modal operacional compacto, modal de card amplo e páginas atmosféricas;
- microinterações e springs que comunicam abertura, seleção e drag;
- logo, iconografia Lucide e comportamento visual de loading.

### Normalizar sem alteração visual no dark

- todos os hardcodes estruturais para tokens;
- botões, campos, selects, modais, popovers, badges e tooltips duplicados;
- sidebars de board e sprint;
- focus ring, disabled, loading, erro e hover;
- raios e sombras conforme o contexto;
- stacking em uma escala documentada, em vez de `z-40`, `z-50`, `z-100`,
  `z-150`, `z-200`, `z-999`, `z-1000` e `z-99999` dispersos.

Escala de stacking sugerida:

| Camada       | Token               | Valor |
| ------------ | ------------------- | ----- |
| conteúdo     | `--z-content`       | 0     |
| sticky       | `--z-sticky`        | 20    |
| dropdown     | `--z-dropdown`      | 40    |
| overlay      | `--z-overlay`       | 60    |
| modal        | `--z-modal`         | 70    |
| nested layer | `--z-modal-popover` | 80    |
| loader       | `--z-loader`        | 100   |

### Não perpetuar

- `--app-panel-hover` usado no erro de convite, pois o token não existe;
- tema alternativo “aparente” sem código de seleção/aplicação;
- notificações fixas no dark que quebram `artic` e `omni`;
- cores estruturais fixas nas primitivas `Button`, `Input` e `Card`;
- dependência remota para a textura de ruído;
- ações essenciais disponíveis apenas em hover;
- listbox sem navegação de teclado, modal sem focus trap e foco removido sem
  substituição visível;
- novos raios arbitrários ou novos tamanhos fracionários;
- uso de `transition-all` quando apenas cor, opacidade ou transform muda;
- portar Framer Motion ou componentes React por compatibilidade de nome.

## 12. Matriz de regressão visual

Capturar o Next atual e o Svelte com os mesmos dados, viewport, tema e estado.
Comparar com tolerância pequena para rasterização de fonte, mas não aceitar mudança
de geometria, cor, overflow ou hierarquia.

| Área            | Estados mínimos                                                        |
| --------------- | ---------------------------------------------------------------------- |
| login/register  | login, register, erro, loading, autofill e password visível            |
| convite         | válido, inválido, expirado e limite atingido                           |
| shell           | sidebar recolhida/expandida, nav ativa/disabled, nome longo            |
| board           | vazio, múltiplas listas, filtros ativos e scroll horizontal            |
| lista/card      | hover, focus, drag, drop target, WIP cheio, capa, prazo e progresso    |
| card modal      | três tabs, edição, loading/saved/error, picker e conteúdo com overflow |
| comentários     | vazio, thread, edição, menção, anexos e erro                           |
| diagrama        | vazio, desenhando, toolbar, undo/redo e saving                         |
| sprints         | vazio, planning, active, completed, reorder e todos os modais          |
| gestão          | cards-resumo, members, invites, tabelas cheias e vazias                |
| perfil/settings | default, validação, upload, saving/saved e confirmação destrutiva      |
| notificações    | zero, não lidas, lidas, `9+`, item hover/focus                         |
| global          | loader, 404, scrollbar, reduced motion, zoom 200%                      |

Executar a matriz primeiro no tema dark. Depois que houver seletor real, repetir
os estados estruturais em `artic` e `omni`, procurando especialmente hardcodes de
branco, grafite e indigo.

## 13. Critérios de aceite do design system Svelte

- tokens de todos os temas existem em um único lugar;
- nenhuma primitiva contém cor estrutural hexadecimal ou `rgba` hardcoded;
- componentes de domínio usam apenas tokens de status/label documentados;
- Button, Field/Input, Select, Modal, Popover, Badge, Tabs, Avatar, Spinner e Logo
  cobrem os estados descritos e possuem exemplos/testes;
- dark reproduz geometria e cores das capturas de referência;
- `artic` e `omni` não exibem superfícies ou textos presos ao dark;
- foco, teclado, screen reader e reduced motion passam nos fluxos principais;
- layout funciona nos quatro viewports definidos;
- nenhuma ação essencial depende apenas de hover;
- textura, fonte e demais assets visuais são locais ou possuem fallback controlado;
- a matriz de regressão foi registrada com evidência antes do corte do Next.

## 14. Referências internas do levantamento

- temas e base: `src/app/globals.css`, `src/app/layout.tsx`;
- primitivas: `src/ui/primitives/Button.tsx`, `Input.tsx`, `Card.tsx`;
- compartilhados: `src/ui/components/Select.tsx`, `ConfirmationModal.tsx`,
  `ProgressLoader.tsx`, `LevityLogo.tsx`, `RichTextEditor.tsx`;
- shell: `src/features/board/components/layout/Sidebar.tsx`, `BoardHeader.tsx`,
  `BoardFiltersBar.tsx`;
- kanban: `src/features/board/components/BoardCanvas.tsx` e subpastas `list`/`card`;
- modal de card: `src/features/board/components/card/components/card-modal`;
- diagrama: `src/features/board/components/diagram`;
- sprints: `src/features/sprints/components`;
- gestão/perfil/notificações: `src/features/workspaces/components`,
  `src/features/users/components`, `src/features/notifications/components`;
- páginas especiais: `src/features/auth/components`, `src/app/invite`,
  `src/app/not-found.tsx`.

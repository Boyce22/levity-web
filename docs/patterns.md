# Padrões de Desenvolvimento

Decisões de design não óbvias que se repetem no codebase. Leia antes de abrir um PR.

---

## 1. Ref-espelho para callbacks estáveis

### Problema

`useCallback` recria a função toda vez que uma dependência muda. Quando a dependência é um estado que muda com frequência (ex: lista de cards durante drag-and-drop, elemento de diagrama em cada mousemove), o callback é recriado dezenas de vezes por segundo — causando re-renders em cascata nos filhos que o recebem como prop.

### Solução: ref atualizado sincronamente no render

```ts
// ✅ Padrão correto
const itemsRef = useRef(items);
itemsRef.current = items; // atualizado a cada render, sem useEffect (sem delay de 1 frame)

const handleAction = useCallback(() => {
  // lê o valor mais recente via ref — sem stale closure
  const latest = itemsRef.current;
  // ...
}, []); // items removido das deps
```

```ts
// ❌ Padrão problemático
const handleAction = useCallback(() => {
  const position = items.filter(...).length;
  // ...
}, [items]); // recriado em todo drag, update, abertura de modal
```

### Quando usar

- O estado é lido **dentro** do callback mas não determina **se** o callback deve ser recriado.
- O estado muda com alta frequência (mousemove, input, scroll, drag-and-drop).
- O callback é passado para componentes filhos ou registrado como listener global.

### Quando NÃO usar

- O estado define **comportamento diferente** entre renders (ex: modo de edição on/off que muda o que o handler faz).
- O componente não tem problemas de performance observáveis.

### Exemplos no codebase

| Hook | Ref | Motivo |
|---|---|---|
| `useBoardData.ts` | `cardsRef` | `addCard` calcula posição sem recriar em cada drag |
| `useDiagram.ts` | `elementsRef`, `currentElementRef` | `updateElement`, `undo`, `redo` estáveis durante desenho (60fps) |
| `useCardModal.ts` | `latestValuesRef`, `handleSaveRef` | `handleSave` modo completo e debounce de 3s sem stale closure |

---

## 2. Cleanup de useEffect antes de early returns

### Problema

Em um `useEffect` com early returns, o cleanup (função retornada) só é registrado se o código alcança o `return () => cleanup`. Se um `return` antecipado for atingido antes, o cleanup nunca é registrado — timers, intervals e listeners vazam.

```ts
// ❌ Bug: timer vaza quando o if redireciona
useEffect(() => {
  const timer = setTimeout(fn, 1200);
  if (condition) {
    doSomething();
    return; // ← cleanup não registrado, timer vaza
  }
  return () => clearTimeout(timer); // ← nunca alcançado neste caminho
}, [deps]);
```

### Solução: atribuir cleanup a uma const antes de qualquer if

```ts
// ✅ Cleanup sempre registrado
useEffect(() => {
  const timer = setTimeout(fn, 1200);
  const cleanup = () => clearTimeout(timer);

  if (condition) {
    doSomething();
    return cleanup; // ← timer limpo em qualquer caminho
  }

  return cleanup;
}, [deps]);
```

### Exemplos no codebase

| Hook | Local |
|---|---|
| `useWorkspaceResolution.ts` | Cleanup do timer de `minTimeReached` antes do redirect |
| `useCardModal.ts` | Cleanup do `debounceTimerRef` no auto-save |

---

## 3. Importar tipos de `@/types/`, funções de `@/modules/*/actions/`

### Motivação

Os tipos de domínio (`Card`, `Comment`, `Notification`, etc.) viviam dentro de server actions marcadas com `"use server"`. Componentes de UI importavam tipos de arquivos de actions, criando acoplamento desnecessário: uma mudança na assinatura de uma action forçava atualização nos tipos usados por componentes.

### Convenção

```ts
// ✅ Tipos de @/types/, funções de actions
import type { Card, List } from "@/types/board";
import { updateCardDetailsAction } from "@/modules/board/actions/board";

// ❌ Tipos acoplados à action
import { Card, updateCardDetailsAction } from "@/modules/board/actions/board";
```

### Tipos disponíveis

| Arquivo | Tipos exportados |
|---|---|
| `@/types/board` | `Card`, `List`, `ListType` |
| `@/types/comments` | `Comment` |
| `@/types/notifications` | `Notification` |
| `@/types/workspace` | `Workspace` |

Os arquivos de action re-exportam os tipos para compatibilidade com código legado, mas **novos arquivos devem importar de `@/types/`**.

---

## 4. handleDescriptionChange em vez de setDescription puro

### Motivação

`setDescription` retornado pelo `useCardModal` é na verdade um `handleDescriptionChange` que além de atualizar o estado local, chama `onUpdate` imediatamente para sincronizar o board (optimistic update). Isso elimina a necessidade de um `useEffect` com múltiplas dependências para esse fim.

Se você precisar adicionar novos campos ao card que requerem sync imediata com o board, siga o mesmo padrão: crie um handler que chama `setField` + `onUpdate({ ...card, field: newValue })` e retorne-o com o nome da setter original na interface pública do hook.

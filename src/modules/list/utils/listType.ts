import { List, ListType } from "@/modules/board/actions/board";

/** Progresso padrão por tipo de lista (fallback quando card não tem checklist) */
export const LIST_TYPE_PROGRESS: Record<ListType, number> = {
  todo: 0,
  inProgress: 50,
  review: 75,
  done: 100,
};

/** Cores de accent por tipo */
export const LIST_TYPE_COLOR: Record<ListType, string> = {
  todo: "#6b7280",       // cinza
  inProgress: "#818cf8", // indigo / var(--app-primary) no dark
  review: "#f59e0b",     // âmbar
  done: "#34d399",       // verde
};

/** Labels por tipo */
export const LIST_TYPE_LABEL: Record<ListType, string> = {
  todo: "To Do",
  inProgress: "In Progress",
  review: "In Review",
  done: "Done",
};

/**
 * Infere o listType a partir da posição quando não está salvo no banco.
 * Regra:
 *   - índice 0           → todo
 *   - índice N-1 (last)  → done
 *   - índice N-2         → review (se totalLists >= 3)
 *   - demais             → inProgress
 */
export function inferListType(index: number, totalLists: number): ListType {
  if (totalLists === 1) return "todo";
  if (index === 0) return "todo";
  if (index === totalLists - 1) return "done";
  if (index === totalLists - 2 && totalLists >= 3) return "review";
  return "inProgress";
}

/**
 * Retorna o tipo efetivo da lista: salvo no banco se existir, inferido por posição caso contrário.
 */
export function getListType(list: List, index: number, totalLists: number): ListType {
  return list.listType ?? inferListType(index, totalLists);
}

/**
 * Calcula o progresso efetivo de um card:
 * - Se o card tem checklist (progress > 0) → usa card.progress
 * - Caso contrário → usa o progresso padrão do tipo da lista
 */
export function getCardEffectiveProgress(
  cardProgress: number | null | undefined,
  listType: ListType,
): number {
  if (cardProgress != null && cardProgress > 0) return cardProgress;
  return LIST_TYPE_PROGRESS[listType];
}

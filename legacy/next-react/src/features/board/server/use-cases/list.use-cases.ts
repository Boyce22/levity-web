import { boardRepository } from '../repositories/board-repository';
import { requireSession } from '@/infra/auth/session';
import { List, ListType } from '@/contracts/Board';

// ─── CREATE ───────────────────────────────────────────────────────────────────

export async function createListUseCase(
  title: string,
  position: number,
  workspaceId: string,
): Promise<List> {
  await requireSession();
  return boardRepository.createList(workspaceId, title, position);
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export async function renameListUseCase(
  listId: string,
  title: string,
  workspaceId: string,
): Promise<void> {
  await requireSession();
  return boardRepository.updateList(workspaceId, listId, { title });
}

export async function updateListTypeUseCase(
  listId: string,
  listType: ListType | null,
  workspaceId: string,
): Promise<void> {
  await requireSession();
  return boardRepository.updateList(workspaceId, listId, { listType });
}

export async function updateListWipLimitUseCase(
  listId: string,
  wipLimit: number | null,
  workspaceId: string,
): Promise<void> {
  await requireSession();
  return boardRepository.updateList(workspaceId, listId, { wipLimit });
}

export async function updateListPositionsUseCase(
  updates: { id: string; position: number }[],
  workspaceId: string,
): Promise<void> {
  await requireSession();
  return boardRepository.updateListPositions(workspaceId, updates);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteListUseCase(
  listId: string,
  workspaceId: string,
): Promise<void> {
  await requireSession();
  return boardRepository.deleteList(workspaceId, listId);
}

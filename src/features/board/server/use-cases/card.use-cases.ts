import { boardRepository } from '../repositories/board-repository';
import { historyRepository } from '../repositories/history-repository';
import { requireSession } from '@/infra/auth/session';
import { List, Card, ListType } from '@/contracts/Board';

// ─── CREATE ───────────────────────────────────────────────────────────────────

export async function createCardUseCase(
  listId: string,
  content: string,
  position: number,
  workspaceId: string,
): Promise<Card> {
  await requireSession();
  return boardRepository.createCard(workspaceId, listId, content, position);
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export async function updateCardDetailsUseCase(
  cardId: string,
  updates: Partial<Card>,
  workspaceId: string,
): Promise<void> {
  await requireSession();
  return boardRepository.updateCard(workspaceId, cardId, updates);
}

export async function updateCardPositionsUseCase(
  updates: { id: string; listId: string; position: number }[],
  workspaceId: string,
): Promise<void> {
  await requireSession();
  return boardRepository.updateCardPositions(workspaceId, updates);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteCardUseCase(
  cardId: string,
  workspaceId: string,
): Promise<void> {
  await requireSession();
  return boardRepository.deleteCard(workspaceId, cardId);
}

// ─── QUERIES ──────────────────────────────────────────────────────────────────

export async function getCardHistoryUseCase(workspaceId: string, cardId: string) {
  await requireSession();
  return historyRepository.getCardHistory(workspaceId, cardId);
}

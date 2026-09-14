'use server';

import { revalidatePath } from 'next/cache';
import {
  createCardUseCase,
  deleteCardUseCase,
  updateCardDetailsUseCase,
  updateCardPositionsUseCase,
  getCardHistoryUseCase,
} from '../use-cases/card.use-cases';

export async function createCardAction(
  listId: string,
  content: string,
  position: number,
  workspaceId: string,
) {
  const card = await createCardUseCase(listId, content, position, workspaceId);
  revalidatePath('/');
  return card;
}

export async function deleteCardAction(id: string, workspaceId: string) {
  await deleteCardUseCase(id, workspaceId);
  revalidatePath('/');
}

export async function updateCardDetailsAction(
  id: string,
  updates: Parameters<typeof updateCardDetailsUseCase>[1],
  workspaceId: string,
) {
  await updateCardDetailsUseCase(id, updates, workspaceId);
  revalidatePath('/');
}

export async function updateCardPositionsAction(
  updates: Parameters<typeof updateCardPositionsUseCase>[0],
  workspaceId: string,
) {
  await updateCardPositionsUseCase(updates, workspaceId);
}

export async function getCardHistoryAction(workspaceId: string, cardId: string) {
  return getCardHistoryUseCase(workspaceId, cardId);
}

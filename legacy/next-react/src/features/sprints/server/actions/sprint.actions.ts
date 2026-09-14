'use server';

import { revalidatePath } from 'next/cache';
import {
  getSprintsByWorkspaceUseCase,
  getSprintByIdUseCase,
  getActiveSprintUseCase,
  createSprintUseCase,
  updateSprintUseCase,
  deleteSprintUseCase,
  activateSprintUseCase,
  completeSprintUseCase,
  addCardToSprintUseCase,
  removeCardFromSprintUseCase,
  reorderSprintCardsUseCase,
} from '../use-cases/sprint.use-cases';
import { Sprint, SprintCard, CreateSprint, UpdateSprint, CompleteSprint } from '@/contracts/Sprint';

export async function getSprintsByWorkspaceAction(workspaceId: string): Promise<Sprint[]> {
  return getSprintsByWorkspaceUseCase(workspaceId);
}

export async function getSprintByIdAction(workspaceId: string, sprintId: string): Promise<Sprint> {
  return getSprintByIdUseCase(workspaceId, sprintId);
}

export async function getActiveSprintAction(workspaceId: string): Promise<Sprint | null> {
  return getActiveSprintUseCase(workspaceId);
}

export async function createSprintAction(workspaceId: string, data: CreateSprint): Promise<Sprint> {
  const sprint = await createSprintUseCase(workspaceId, data);
  revalidatePath('/');
  return sprint;
}

export async function updateSprintAction(
  workspaceId: string,
  sprintId: string,
  data: UpdateSprint,
): Promise<Sprint> {
  const sprint = await updateSprintUseCase(workspaceId, sprintId, data);
  revalidatePath('/');
  return sprint;
}

export async function deleteSprintAction(workspaceId: string, sprintId: string): Promise<void> {
  await deleteSprintUseCase(workspaceId, sprintId);
  revalidatePath('/');
}

export async function activateSprintAction(workspaceId: string, sprintId: string): Promise<Sprint> {
  const sprint = await activateSprintUseCase(workspaceId, sprintId);
  revalidatePath('/');
  return sprint;
}

export async function completeSprintAction(
  workspaceId: string,
  sprintId: string,
  data: CompleteSprint,
): Promise<Sprint> {
  const sprint = await completeSprintUseCase(workspaceId, sprintId, data);
  revalidatePath('/');
  return sprint;
}

export async function addCardToSprintAction(
  workspaceId: string,
  sprintId: string,
  cardId: string,
): Promise<SprintCard> {
  const sprintCard = await addCardToSprintUseCase(workspaceId, sprintId, cardId);
  revalidatePath('/');
  return sprintCard;
}

export async function removeCardFromSprintAction(
  workspaceId: string,
  sprintId: string,
  cardId: string,
): Promise<void> {
  await removeCardFromSprintUseCase(workspaceId, sprintId, cardId);
  revalidatePath('/');
}

export async function reorderSprintCardsAction(
  workspaceId: string,
  sprintId: string,
  updates: { id: string; position: number }[],
): Promise<void> {
  await reorderSprintCardsUseCase(workspaceId, sprintId, updates);
}

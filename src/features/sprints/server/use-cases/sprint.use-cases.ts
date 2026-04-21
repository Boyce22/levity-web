import { requireSession } from '@/infra/auth/session';
import { sprintRepository } from '../repositories/sprint-repository';
import { Sprint, SprintCard, CreateSprint, UpdateSprint, CompleteSprint } from '@/contracts/Sprint';

export async function getSprintsByWorkspaceUseCase(workspaceId: string): Promise<Sprint[]> {
  await requireSession();
  return sprintRepository.getSprintsByWorkspace(workspaceId);
}

export async function getSprintByIdUseCase(workspaceId: string, sprintId: string): Promise<Sprint> {
  await requireSession();
  return sprintRepository.getSprintById(workspaceId, sprintId);
}

export async function getActiveSprintUseCase(workspaceId: string): Promise<Sprint | null> {
  await requireSession();
  return sprintRepository.getActiveSprint(workspaceId);
}

export async function createSprintUseCase(workspaceId: string, data: CreateSprint): Promise<Sprint> {
  await requireSession();
  return sprintRepository.createSprint(workspaceId, data);
}

export async function updateSprintUseCase(
  workspaceId: string,
  sprintId: string,
  data: UpdateSprint,
): Promise<Sprint> {
  await requireSession();
  return sprintRepository.updateSprint(workspaceId, sprintId, data);
}

export async function deleteSprintUseCase(workspaceId: string, sprintId: string): Promise<void> {
  await requireSession();
  return sprintRepository.deleteSprint(workspaceId, sprintId);
}

export async function activateSprintUseCase(workspaceId: string, sprintId: string): Promise<Sprint> {
  await requireSession();
  return sprintRepository.activateSprint(workspaceId, sprintId);
}

export async function completeSprintUseCase(
  workspaceId: string,
  sprintId: string,
  data: CompleteSprint,
): Promise<Sprint> {
  await requireSession();
  return sprintRepository.completeSprint(workspaceId, sprintId, data);
}

export async function addCardToSprintUseCase(
  workspaceId: string,
  sprintId: string,
  cardId: string,
): Promise<SprintCard> {
  await requireSession();
  return sprintRepository.addCardToSprint(workspaceId, sprintId, cardId);
}

export async function removeCardFromSprintUseCase(
  workspaceId: string,
  sprintId: string,
  cardId: string,
): Promise<void> {
  await requireSession();
  return sprintRepository.removeCardFromSprint(workspaceId, sprintId, cardId);
}

export async function reorderSprintCardsUseCase(
  workspaceId: string,
  sprintId: string,
  updates: { id: string; position: number }[],
): Promise<void> {
  await requireSession();
  return sprintRepository.reorderSprintCards(workspaceId, sprintId, updates);
}

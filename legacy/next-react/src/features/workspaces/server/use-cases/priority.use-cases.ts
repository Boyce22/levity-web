import { requireSession } from '@/infra/auth/session';
import { workspaceRepository } from '../repositories/workspace-repository';
import { CreatePriorityDTOSchema } from '@/contracts/Workspace';

// ─── CREATE ───────────────────────────────────────────────────────────────────

export async function createPriorityUseCase(workspaceId: string, payload: unknown) {
  await requireSession();
  const data = CreatePriorityDTOSchema.parse(payload);
  return workspaceRepository.createPriority(workspaceId, data);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deletePriorityUseCase(workspaceId: string, priorityId: string) {
  await requireSession();
  return workspaceRepository.deletePriority(workspaceId, priorityId);
}

import { requireSession } from '@/infra/auth/session';
import { workspaceRepository } from '../repositories/workspace-repository';
import { CreateTagDTOSchema } from '@/contracts/Workspace';

// ─── CREATE ───────────────────────────────────────────────────────────────────

export async function createTagUseCase(workspaceId: string, payload: unknown) {
  await requireSession();
  const data = CreateTagDTOSchema.parse(payload);
  return workspaceRepository.createTag(workspaceId, data);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteTagUseCase(workspaceId: string, tagId: string) {
  await requireSession();
  return workspaceRepository.deleteTag(workspaceId, tagId);
}

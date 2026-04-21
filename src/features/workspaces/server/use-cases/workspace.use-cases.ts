import { requireSession } from '@/infra/auth/session';
import { workspaceRepository } from '../repositories/workspace-repository';
import { CreateWorkspaceDTOSchema, UpdateWorkspaceDTOSchema } from '@/contracts/Workspace';

// ─── QUERIES ──────────────────────────────────────────────────────────────────

export async function getWorkspacesUseCase() {
  await requireSession();
  return workspaceRepository.getWorkspaces();
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

export async function createWorkspaceUseCase(payload: unknown) {
  await requireSession();
  const data = CreateWorkspaceDTOSchema.parse(payload);
  return workspaceRepository.createWorkspace(data.name);
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export async function updateWorkspaceUseCase(id: string, payload: unknown) {
  await requireSession();
  const data = UpdateWorkspaceDTOSchema.parse(payload);
  return workspaceRepository.updateWorkspace(id, data.name);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteWorkspaceUseCase(id: string) {
  await requireSession();
  return workspaceRepository.deleteWorkspace(id);
}

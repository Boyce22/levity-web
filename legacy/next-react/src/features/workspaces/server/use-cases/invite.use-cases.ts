import { requireSession } from '@/infra/auth/session';
import { workspaceRepository } from '../repositories/workspace-repository';
import { CreateInviteDTOSchema } from '@/contracts/Workspace';

// ─── QUERIES ──────────────────────────────────────────────────────────────────

export async function getWorkspaceInvitesUseCase(workspaceId: string) {
  await requireSession();
  return workspaceRepository.getWorkspaceInvites(workspaceId);
}

/**
 * Intentionally public — no session required.
 * Called during the invite landing page flow before the user authenticates.
 * Do NOT add requireSession() here.
 */
export async function getInviteDetailsUseCase(workspaceId: string, token: string) {
  return workspaceRepository.getInviteDetails(workspaceId, token);
}

// ─── MUTATIONS ────────────────────────────────────────────────────────────────

export async function generateInviteUseCase(workspaceId: string, payload: unknown) {
  await requireSession();
  const data = CreateInviteDTOSchema.parse(payload);
  const result = await workspaceRepository.generateInvite(workspaceId, data);
  return `${workspaceId}/${result.token}`;
}

export async function acceptInviteUseCase(workspaceId: string, token: string) {
  await requireSession();
  return workspaceRepository.acceptInvite(workspaceId, token);
}

export async function revokeInviteUseCase(workspaceId: string, inviteId: string) {
  await requireSession();
  return workspaceRepository.revokeInvite(workspaceId, inviteId);
}

import { requireSession } from '@/infra/auth/session';
import { workspaceRepository } from '../repositories/workspace-repository';

// ─── MUTATIONS ────────────────────────────────────────────────────────────────

export async function removeMemberUseCase(workspaceId: string, memberId: string) {
  await requireSession();
  return workspaceRepository.removeMember(workspaceId, memberId);
}

export async function updateMemberRoleUseCase(
  workspaceId: string,
  memberId: string,
  role: string,
) {
  await requireSession();
  return workspaceRepository.updateMemberRole(workspaceId, memberId, role);
}

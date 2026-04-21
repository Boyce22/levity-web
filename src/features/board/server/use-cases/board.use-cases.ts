import { requireSession } from '@/infra/auth/session';
import { boardRepository } from '../repositories/board-repository';
import { workspaceRepository } from '@/features/workspaces/server/repositories/workspace-repository';
import { DomainError } from '@/infra/http/errors';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Normalizes the raw workspace member shape returned by the API into a flat,
 * UI-consumable representation. Kept here because the upstream API shape is
 * an implementation detail of the board data contract.
 */
function normalizeMember(raw: any) {
  return {
    ...(raw.user || {}),
    id: raw.userId || raw.id,
    role: raw.role,
    joinedAt: raw.createdAt,
  };
}

// ─── QUERIES ──────────────────────────────────────────────────────────────────

export async function getBoardUseCase(workspaceIdParam?: string) {
  const session = await requireSession();
  const userId = session.id;

  let workspaces = await workspaceRepository.getWorkspaces();

  if (workspaces.length === 0) {
    const defaultWs = await workspaceRepository.createWorkspace('My Workspace');
    workspaces = [defaultWs];
  }

  const currentWsId = workspaceIdParam || workspaces[0]?.id;
  if (!currentWsId) {
    throw new DomainError('NO_ACTIVE_WORKSPACE', 'Could not determine active workspace ID.');
  }

  const boardData = await boardRepository.getBoardByWorkspace(currentWsId);

  const normalizedMembers = (boardData.members || []).map(normalizeMember);
  const currentMember = normalizedMembers.find((m: any) => m.id === userId);
  const userRole = currentMember?.role ?? 'member';

  const invites = await workspaceRepository.getWorkspaceInvites(currentWsId);

  return {
    lists: boardData.lists,
    cards: boardData.cards,
    workspaces,
    tags: boardData.tags,
    priorities: boardData.priorities,
    members: normalizedMembers,
    userRole,
    invites,
    currentWorkspaceId: currentWsId,
  };
}

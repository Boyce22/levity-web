import { error } from '@sveltejs/kit';
import { ApiError, apiRequest } from '$lib/server/api-client';
import { HomeBoardWire, UserWire, WorkspaceMemberWire, WorkspaceWire } from '$lib/contracts/wire';
import {
  homeBoardFromWire,
  userFromWire,
  workspaceFromWire,
  workspaceMemberFromWire,
} from '$lib/contracts/mappers';

export async function load(event) {
  if (!event.locals.token) error(401, 'Sessão necessária.');
  const { workspaceId, boardId } = event.params;

  try {
    const [currentUserWire, workspacesWire, boardsWire, membersWire] = await Promise.all([
      apiRequest(event, '/users/me', { schema: UserWire }),
      apiRequest(event, '/workspaces/', { schema: WorkspaceWire.array() }),
      apiRequest(event, `/workspaces/${workspaceId}/boards`, { schema: HomeBoardWire.array() }),
      apiRequest(event, `/workspaces/${workspaceId}/members`, { schema: WorkspaceMemberWire.array() }).catch(() => []),
    ]);

    const currentUser = userFromWire(currentUserWire);
    const members = membersWire.map(workspaceMemberFromWire);
    const workspaceAvatarUrl = members.find((member) => member.userId === currentUser.id)?.user?.avatarUrl;

    return {
      currentUser,
      workspaceAvatarUrl: workspaceAvatarUrl ?? currentUser.avatarUrl,
      workspaces: workspacesWire.map(workspaceFromWire),
      boards: boardsWire.map(homeBoardFromWire),
      members,
      workspaceId,
      boardId,
    };
  } catch (cause) {
    if (cause instanceof ApiError) error(cause.status, cause.message);
    throw cause;
  }
}

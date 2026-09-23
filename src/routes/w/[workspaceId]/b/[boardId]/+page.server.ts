import { error, fail } from '@sveltejs/kit';
import { z } from 'zod';
import { apiRequest, ApiError } from '$lib/server/api-client';
import {
  BoardSnapshotWire,
  HomeBoardWire,
  PriorityWire,
  TagWire,
  UserWire,
  WorkspaceMemberWire,
  WorkspaceWire,
} from '$lib/contracts/wire';
import {
  boardFromWire,
  userFromWire,
  workspaceFromWire,
  homeBoardFromWire,
  tagFromWire,
  priorityFromWire,
  workspaceMemberFromWire,
} from '$lib/contracts/mappers';

export async function load(event) {
  if (!event.locals.token) error(401, 'Sessão necessária.');
  const { workspaceId, boardId } = event.params;
  try {
    const [currentUserWire, workspacesWire, boardsWire, snapshot, usersWire, tagsWire, prioritiesWire, membersWire] =
      await Promise.all([
        apiRequest(event, '/users/me', { schema: UserWire }),
        apiRequest(event, '/workspaces/', { schema: WorkspaceWire.array() }),
        apiRequest(event, `/workspaces/${workspaceId}/boards`, { schema: HomeBoardWire.array() }),
        apiRequest(event, `/boards/${boardId}`, { schema: BoardSnapshotWire }),
        apiRequest(event, `/users/?workspace_id=${workspaceId}`, { schema: UserWire.array() }),
        apiRequest(event, `/workspaces/${workspaceId}/tags`, { schema: TagWire.array() }),
        apiRequest(event, `/workspaces/${workspaceId}/priorities`, { schema: PriorityWire.array() }),
        apiRequest(event, `/workspaces/${workspaceId}/members`, { schema: WorkspaceMemberWire.array() }).catch(() => []),
      ]);

    if (snapshot.board.workspace_id !== workspaceId || !boardsWire.some((board) => board.id === boardId)) {
      error(404, 'Board não encontrado.');
    }

    const currentUser = userFromWire(currentUserWire);
    const workspaceMembers = membersWire.map(workspaceMemberFromWire);
    const workspaceAvatars = new Map(
      workspaceMembers
        .filter((member) => member.user?.avatarUrl)
        .map((member) => [member.userId, member.user?.avatarUrl as string]),
    );

    return {
      currentUser,
      workspaceAvatarUrl: workspaceAvatars.get(currentUser.id) ?? currentUser.avatarUrl,
      workspaces: workspacesWire.map(workspaceFromWire),
      boards: boardsWire.map(homeBoardFromWire),
      board: boardFromWire(snapshot),
      users: usersWire.map((wire) => {
        const user = userFromWire(wire);
        const workspaceAvatarUrl = workspaceAvatars.get(user.id);
        return workspaceAvatarUrl ? { ...user, avatarUrl: workspaceAvatarUrl } : user;
      }),
      tags: tagsWire.map(tagFromWire),
      priorities: prioritiesWire.map(priorityFromWire),
    };
  } catch (cause) {
    if (cause instanceof ApiError) error(cause.status, cause.message);
    throw cause;
  }
}

const columnInput = z.object({ title: z.string().trim().min(1, 'Informe o título da coluna.').max(100) });
const issueInput = z.object({ content: z.string().trim().min(1, 'Informe o título da issue.').max(500), columnId: z.string().uuid() });
const idInput = z.object({ id: z.string().uuid() });
const updateIssueInput = z.object({ id: z.string().uuid(), content: z.string().trim().min(1).max(500), description: z.string().max(10000).optional(), tag_id: z.string().uuid().nullable().optional(), priority_id: z.string().uuid().optional(), assignee_id: z.string().uuid().nullable().optional() });

export const actions = {
  createColumn: async (event) => {
    const input = columnInput.safeParse(Object.fromEntries(await event.request.formData()));
    if (!input.success) return fail(400, { action: 'column', error: input.error.issues[0]?.message });
    try {
      await apiRequest(event, `/boards/${event.params.boardId}/columns`, { method: 'POST', body: { title: input.data.title } });
      return { success: 'Coluna criada.' };
    } catch (cause) { if (cause instanceof ApiError) return fail(cause.status, { action: 'column', error: cause.message }); throw cause; }
  },
  createIssue: async (event) => {
    const input = issueInput.safeParse(Object.fromEntries(await event.request.formData()));
    if (!input.success) return fail(400, { action: 'issue', error: input.error.issues[0]?.message });
    try {
      await apiRequest(event, `/boards/${event.params.boardId}/issues`, { method: 'POST', body: { content: input.data.content, column_id: input.data.columnId } });
      return { success: 'Issue criada.' };
    } catch (cause) { if (cause instanceof ApiError) return fail(cause.status, { action: 'issue', error: cause.message }); throw cause; }
  },
  deleteColumn: async (event) => {
    const input = idInput.safeParse(Object.fromEntries(await event.request.formData()));
    if (!input.success) return fail(400, { action: 'column', error: 'Coluna inválida.' });
    try { await apiRequest(event, `/boards/${event.params.boardId}/columns/${input.data.id}`, { method: 'DELETE' }); return { success: 'Coluna excluída.' }; }
    catch (cause) { if (cause instanceof ApiError) return fail(cause.status, { action: 'column', error: cause.message }); throw cause; }
  },
  deleteIssue: async (event) => {
    const input = idInput.safeParse(Object.fromEntries(await event.request.formData()));
    if (!input.success) return fail(400, { action: 'issue', error: 'Issue inválida.' });
    try { await apiRequest(event, `/boards/${event.params.boardId}/issues/${input.data.id}`, { method: 'DELETE' }); return { success: 'Issue excluída.' }; }
    catch (cause) { if (cause instanceof ApiError) return fail(cause.status, { action: 'issue', error: cause.message }); throw cause; }
  },
  updateIssue: async (event) => {
    const raw = Object.fromEntries(await event.request.formData());
    const input = updateIssueInput.safeParse({ ...raw, description: raw.description || null, tag_id: raw.tag_id || null, assignee_id: raw.assignee_id || null });
    if (!input.success) return fail(400, { action: 'update-issue', error: input.error.issues[0]?.message });
    const { id, ...body } = input.data;
    try { await apiRequest(event, `/boards/${event.params.boardId}/issues/${id}`, { method: 'PATCH', body }); return { success: 'Issue atualizada.' }; }
    catch (cause) { if (cause instanceof ApiError) return fail(cause.status, { action: 'update-issue', error: cause.message }); throw cause; }
  }
};

import { error, fail } from '@sveltejs/kit';
import { z } from 'zod';
import { ApiError, apiRequest } from '$lib/server/api-client';
import {
  WorkspaceMemberWire,
  TagWire,
  PriorityWire,
  WorkspaceWire,
  HomeBoardWire,
  UserWire,
} from '$lib/contracts/wire';
import {
  workspaceMemberFromWire,
  tagFromWire,
  priorityFromWire,
  workspaceFromWire,
  homeBoardFromWire,
  userFromWire,
} from '$lib/contracts/mappers';

const tagInput = z.object({
  name: z.string().trim().min(1, 'Nome obrigatório.').max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor hexadecimal inválida.'),
});

const priorityInput = tagInput.extend({
  icon: z.string().trim().min(1).max(10),
});
const nameInput = z.object({ name: z.string().trim().min(1).max(100) });
const boardIdInput = z.object({ id: z.string().uuid() });
const memberRoleInput = z.object({
  id: z.string().uuid(),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER'])
});

export async function load(event) {
  if (!event.locals.token) error(401, 'Sessão necessária.');
  const { workspaceId, boardId } = event.params;

  try {
    const [currentUserWire, workspacesWire, boardsWire, membersWire, tagsWire, prioritiesWire, invites] =
      await Promise.all([
        apiRequest(event, '/users/me', { schema: UserWire }),
        apiRequest(event, '/workspaces/', { schema: WorkspaceWire.array() }),
        apiRequest(event, `/workspaces/${workspaceId}/boards`, { schema: HomeBoardWire.array() }),
        apiRequest(event, `/workspaces/${workspaceId}/members`, { schema: WorkspaceMemberWire.array() }),
        apiRequest(event, `/workspaces/${workspaceId}/tags`, { schema: TagWire.array() }),
        apiRequest(event, `/workspaces/${workspaceId}/priorities`, { schema: PriorityWire.array() }),
        apiRequest(event, `/workspaces/${workspaceId}/invites`).catch(() => []),
      ]);

    return {
      currentUser: userFromWire(currentUserWire),
      workspaces: workspacesWire.map(workspaceFromWire),
      boards: boardsWire.map(homeBoardFromWire),
      members: membersWire.map(workspaceMemberFromWire),
      tags: tagsWire.map(tagFromWire),
      priorities: prioritiesWire.map(priorityFromWire),
      invites: Array.isArray(invites) ? invites : [],
      workspaceId,
      boardId,
    };
  } catch (cause) {
    if (cause instanceof ApiError) error(cause.status, cause.message);
    throw cause;
  }
}

function apiFailure(cause: unknown) {
  if (cause instanceof ApiError) return fail(cause.status, { error: cause.message });
  throw cause;
}

export const actions = {
  renameWorkspace: async (event) => {
    const input = nameInput.safeParse(Object.fromEntries(await event.request.formData()));
    if (!input.success) return fail(400, { error: 'Nome de workspace inválido.' });
    try {
      await apiRequest(event, `/workspaces/${event.params.workspaceId}`, { method: 'PATCH', body: input.data, schema: WorkspaceWire });
      return { success: 'Workspace renomeado.' };
    } catch (cause) { return apiFailure(cause); }
  },

  createBoard: async (event) => {
    const input = nameInput.safeParse(Object.fromEntries(await event.request.formData()));
    if (!input.success) return fail(400, { error: 'Nome de board inválido.' });
    try {
      await apiRequest(event, `/workspaces/${event.params.workspaceId}/boards`, { method: 'POST', body: input.data, schema: HomeBoardWire });
      return { success: 'Board criado.' };
    } catch (cause) { return apiFailure(cause); }
  },

  renameBoard: async (event) => {
    const data = Object.fromEntries(await event.request.formData());
    const id = boardIdInput.safeParse({ id: data.id });
    const name = nameInput.safeParse({ name: data.name });
    if (!id.success || !name.success) return fail(400, { error: 'Dados de board inválidos.' });
    try {
      await apiRequest(event, `/workspaces/${event.params.workspaceId}/boards/${id.data.id}`, { method: 'PATCH', body: name.data, schema: HomeBoardWire });
      return { success: 'Board renomeado.' };
    } catch (cause) { return apiFailure(cause); }
  },

  selfGrantBoard: async (event) => {
    const input = boardIdInput.safeParse(Object.fromEntries(await event.request.formData()));
    if (!input.success) return fail(400, { error: 'Board inválido.' });
    try {
      await apiRequest(event, `/workspaces/${event.params.workspaceId}/boards/${input.data.id}/self-grant`, { method: 'POST' });
      return { success: 'Acesso ao board restaurado.' };
    } catch (cause) { return apiFailure(cause); }
  },

  createTag: async (event) => {
    const input = tagInput.safeParse(Object.fromEntries(await event.request.formData()));
    if (!input.success) return fail(400, { error: input.error.issues[0]?.message });
    try {
      await apiRequest(event, `/workspaces/${event.params.workspaceId}/tags`, {
        method: 'POST',
        body: input.data,
        schema: TagWire,
      });
      return { success: 'Tag criada com sucesso.' };
    } catch (cause) {
      return apiFailure(cause);
    }
  },

  deleteTag: async (event) => {
    const id = String((await event.request.formData()).get('id'));
    try {
      await apiRequest(event, `/workspaces/${event.params.workspaceId}/tags/${id}`, {
        method: 'DELETE',
      });
      return { success: 'Tag excluída com sucesso.' };
    } catch (cause) {
      return apiFailure(cause);
    }
  },

  createPriority: async (event) => {
    const input = priorityInput.safeParse(Object.fromEntries(await event.request.formData()));
    if (!input.success) return fail(400, { error: input.error.issues[0]?.message });
    try {
      await apiRequest(event, `/workspaces/${event.params.workspaceId}/priorities`, {
        method: 'POST',
        body: input.data,
        schema: PriorityWire,
      });
      return { success: 'Prioridade criada com sucesso.' };
    } catch (cause) {
      return apiFailure(cause);
    }
  },

  deletePriority: async (event) => {
    const id = String((await event.request.formData()).get('id'));
    try {
      await apiRequest(event, `/workspaces/${event.params.workspaceId}/priorities/${id}`, {
        method: 'DELETE',
      });
      return { success: 'Prioridade excluída com sucesso.' };
    } catch (cause) {
      return apiFailure(cause);
    }
  },

  revokeInvite: async (event) => {
    const id = String((await event.request.formData()).get('id'));
    try {
      await apiRequest(event, `/workspaces/${event.params.workspaceId}/invites/${id}`, {
        method: 'DELETE',
      });
      return { success: 'Convite revogado.' };
    } catch (cause) {
      return apiFailure(cause);
    }
  },

  removeMember: async (event) => {
    const id = String((await event.request.formData()).get('id'));
    try {
      await apiRequest(event, `/workspaces/${event.params.workspaceId}/members/${id}`, {
        method: 'DELETE',
      });
      return { success: 'Membro removido.' };
    } catch (cause) {
      return apiFailure(cause);
    }
  },

  updateRole: async (event) => {
    const input = memberRoleInput.safeParse(Object.fromEntries(await event.request.formData()));
    if (!input.success) return fail(400, { error: 'Membro ou papel inválido.' });
    try {
      await apiRequest(event, `/workspaces/${event.params.workspaceId}/members/${input.data.id}/role`, {
        method: 'PATCH',
        body: { role: input.data.role },
      });
      return { success: 'Permissão atualizada.' };
    } catch (cause) {
      return apiFailure(cause);
    }
  },
};

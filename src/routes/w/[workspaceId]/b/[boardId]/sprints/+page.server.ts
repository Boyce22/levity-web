import { error, fail } from '@sveltejs/kit';
import { z } from 'zod';
import { ApiError, apiRequest } from '$lib/server/api-client';
import { SprintWire, UserWire, WorkspaceWire, HomeBoardWire } from '$lib/contracts/wire';
import {
  sprintFromWire,
  userFromWire,
  workspaceFromWire,
  homeBoardFromWire,
} from '$lib/contracts/mappers';

const sprintInput = z.object({
    name: z.string().trim().min(1, 'Nome obrigatório.').max(100),
    goal: z.string().trim().max(500).optional(),
    start_date: z.string().date(),
    end_date: z.string().date(),
    tracking_mode: z.enum(['POINTS', 'COUNT', 'HOURS']),
    capacity_points: z.coerce.number().positive().optional(),
  });

const createSprint = sprintInput
  .refine((value) => value.end_date >= value.start_date, {
    message: 'A data final precisa ser igual ou posterior à inicial.',
  });

const sprintIdInput = z.object({ id: z.string().uuid() });
const updateSprint = sprintInput.partial().extend({ id: z.string().uuid() });
const completeSprint = z.object({
  id: z.string().uuid(),
  to_sprint_id: z.string().uuid().optional(),
});

export async function load(event) {
  if (!event.locals.token) error(401, 'Sessão necessária.');
  const { workspaceId, boardId } = event.params;

  try {
    const [currentUserWire, workspacesWire, boardsWire, sprintsWire] = await Promise.all([
      apiRequest(event, '/users/me', { schema: UserWire }),
      apiRequest(event, '/workspaces/', { schema: WorkspaceWire.array() }),
      apiRequest(event, `/workspaces/${workspaceId}/boards`, { schema: HomeBoardWire.array() }),
      apiRequest(event, `/boards/${boardId}/sprints`, { schema: SprintWire.array() }),
    ]);

    return {
      currentUser: userFromWire(currentUserWire),
      workspaces: workspacesWire.map(workspaceFromWire),
      boards: boardsWire.map(homeBoardFromWire),
      sprints: sprintsWire.map(sprintFromWire),
      boardId,
      workspaceId,
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
  create: async (event) => {
    const input = createSprint.safeParse(Object.fromEntries(await event.request.formData()));
    if (!input.success) return fail(400, { error: input.error.issues[0]?.message });
    try {
      await apiRequest(event, `/boards/${event.params.boardId}/sprints`, {
        method: 'POST',
        body: input.data,
        schema: SprintWire,
      });
      return { success: 'Sprint criada com sucesso.' };
    } catch (cause) {
      return apiFailure(cause);
    }
  },

  activate: async (event) => {
    const input = sprintIdInput.safeParse(Object.fromEntries(await event.request.formData()));
    if (!input.success) return fail(400, { error: 'Sprint inválida.' });
    try {
      await apiRequest(event, `/boards/${event.params.boardId}/sprints/${input.data.id}/activate`, {
        method: 'POST',
        schema: SprintWire,
      });
      return { success: 'Sprint ativada com sucesso.' };
    } catch (cause) {
      return apiFailure(cause);
    }
  },

  delete: async (event) => {
    const input = sprintIdInput.safeParse(Object.fromEntries(await event.request.formData()));
    if (!input.success) return fail(400, { error: 'Sprint inválida.' });
    try {
      await apiRequest(event, `/boards/${event.params.boardId}/sprints/${input.data.id}`, {
        method: 'DELETE',
      });
      return { success: 'Sprint excluída com sucesso.' };
    } catch (cause) {
      return apiFailure(cause);
    }
  },

  update: async (event) => {
    const input = updateSprint.safeParse(Object.fromEntries(await event.request.formData()));
    if (!input.success) return fail(400, { error: input.error.issues[0]?.message ?? 'Dados de sprint inválidos.' });
    const { id, ...body } = input.data;
    try {
      await apiRequest(event, `/boards/${event.params.boardId}/sprints/${id}`, {
        method: 'PATCH',
        body,
        schema: SprintWire,
      });
      return { success: 'Sprint atualizada com sucesso.' };
    } catch (cause) {
      return apiFailure(cause);
    }
  },

  complete: async (event) => {
    const input = completeSprint.safeParse(Object.fromEntries(await event.request.formData()));
    if (!input.success) return fail(400, { error: 'Dados de conclusão inválidos.' });
    try {
      await apiRequest(event, `/boards/${event.params.boardId}/sprints/${input.data.id}/complete`, {
        method: 'POST',
        body: input.data.to_sprint_id ? { to_sprint_id: input.data.to_sprint_id } : {},
        schema: SprintWire,
      });
      return { success: 'Sprint concluída com sucesso.' };
    } catch (cause) {
      return apiFailure(cause);
    }
  },
};

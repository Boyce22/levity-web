import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { ApiError, apiRequest } from '$lib/server/api-client';

const updateColumnSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  wip_limit: z.number().int().min(1).nullable().optional(),
  column_type: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).nullable().optional(),
});

export async function PATCH(event) {
  const parsed = updateColumnSchema.safeParse(await event.request.json().catch(() => ({})));
  if (!parsed.success) {
    return json({ error: parsed.error.issues[0]?.message ?? 'Dados de coluna inválidos.' }, { status: 400 });
  }

  try {
    const data = await apiRequest(
      event,
      `/boards/${event.params.boardId}/columns/${event.params.columnId}`,
      {
        method: 'PATCH',
        body: parsed.data,
      },
    );
    return json(data);
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

export async function DELETE(event) {
  try {
    await apiRequest(
      event,
      `/boards/${event.params.boardId}/columns/${event.params.columnId}`,
      {
        method: 'DELETE',
      },
    );
    return new Response(null, { status: 204 });
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { ApiError, apiRequest } from '$lib/server/api-client';

const updatePositionsSchema = z
  .array(
    z.object({
      id: z.string().uuid(),
      position: z.number().int().min(0),
    }),
  )
  .min(1);

export async function PATCH(event) {
  const parsed = updatePositionsSchema.safeParse(await event.request.json().catch(() => ({})));
  if (!parsed.success) {
    return json({ error: 'Posições inválidas de coluna.' }, { status: 400 });
  }

  try {
    await apiRequest(event, `/boards/${event.params.boardId}/columns/positions`, {
      method: 'PATCH',
      body: parsed.data,
    });
    return new Response(null, { status: 204 });
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

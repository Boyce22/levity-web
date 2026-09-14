import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { ApiError, apiRequest } from '$lib/server/api-client';

const body = z.array(z.object({ id: z.string().uuid(), position: z.number().int().min(0), column_id: z.string().uuid().optional() })).min(1);
export async function PATCH(event) {
  const parsed = body.safeParse(await event.request.json());
  if (!parsed.success) return json({ error: 'Posições inválidas.' }, { status: 400 });
  try { await apiRequest(event, `/boards/${event.params.boardId}/issues/positions`, { method: 'PATCH', body: parsed.data }); return new Response(null, { status: 204 }); }
  catch (cause) { if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status }); throw cause; }
}

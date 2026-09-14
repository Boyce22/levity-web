import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { ApiError, apiRequest } from '$lib/server/api-client';

const createColumnSchema = z.object({
  title: z.string().trim().min(1, 'Informe o título da coluna.').max(100),
});

export async function POST(event) {
  const parsed = createColumnSchema.safeParse(await event.request.json().catch(() => ({})));
  if (!parsed.success) {
    return json({ error: parsed.error.issues[0]?.message ?? 'Título inválido.' }, { status: 400 });
  }

  try {
    const data = await apiRequest(event, `/boards/${event.params.boardId}/columns`, {
      method: 'POST',
      body: parsed.data,
    });
    return json(data, { status: 201 });
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

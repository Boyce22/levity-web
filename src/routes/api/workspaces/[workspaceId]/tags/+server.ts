import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { ApiError, apiRequest } from '$lib/server/api-client';
import { TagWire } from '$lib/contracts/wire';
import { tagFromWire } from '$lib/contracts/mappers';

const createTagSchema = z.object({
  name: z.string().trim().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export async function POST(event) {
  const parsed = createTagSchema.safeParse(await event.request.json().catch(() => ({})));
  if (!parsed.success) return json({ error: 'Dados de etiqueta inválidos.' }, { status: 400 });

  try {
    const tag = await apiRequest(event, `/workspaces/${event.params.workspaceId}/tags`, {
      method: 'POST', body: parsed.data, schema: TagWire,
    });
    return json(tagFromWire(tag), { status: 201 });
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

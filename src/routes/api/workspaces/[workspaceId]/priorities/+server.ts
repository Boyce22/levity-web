import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { ApiError, apiRequest } from '$lib/server/api-client';
import { PriorityWire } from '$lib/contracts/wire';
import { priorityFromWire } from '$lib/contracts/mappers';

const createPrioritySchema = z.object({
  name: z.string().trim().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  icon: z.string().min(1).max(10),
  position: z.number().int().min(0).optional(),
});

export async function POST(event) {
  const parsed = createPrioritySchema.safeParse(await event.request.json().catch(() => ({})));
  if (!parsed.success) return json({ error: 'Dados de prioridade inválidos.' }, { status: 400 });

  try {
    const priority = await apiRequest(event, `/workspaces/${event.params.workspaceId}/priorities`, {
      method: 'POST', body: parsed.data, schema: PriorityWire,
    });
    return json(priorityFromWire(priority), { status: 201 });
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

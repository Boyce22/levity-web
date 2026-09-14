import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { ApiError, apiRequest } from '$lib/server/api-client';
import { DiagramDataWire, DiagramWire } from '$lib/contracts/wire';
import { diagramFromWire } from '$lib/contracts/mappers';

const saveDiagramBody = z.object({
  issue_id: z.string().uuid(),
  data: DiagramDataWire,
});

export async function PUT(event) {
  const parsed = saveDiagramBody.safeParse(await event.request.json().catch(() => ({})));
  if (!parsed.success) {
    return json({ error: parsed.error.issues[0]?.message ?? 'Dados de diagrama inválidos.' }, { status: 400 });
  }

  try {
    const raw = await apiRequest(event, '/diagrams/', {
      method: 'PUT',
      body: parsed.data,
      schema: DiagramWire,
    });
    return json(diagramFromWire(raw));
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

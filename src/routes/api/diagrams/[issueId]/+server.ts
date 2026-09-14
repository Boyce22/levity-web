import { json } from '@sveltejs/kit';
import { ApiError, apiRequest } from '$lib/server/api-client';
import { DiagramWire } from '$lib/contracts/wire';
import { diagramFromWire } from '$lib/contracts/mappers';

export async function GET(event) {
  try {
    const raw = await apiRequest(event, `/diagrams/${event.params.issueId}`, {
      schema: DiagramWire.nullable(),
    });
    return json(raw ? diagramFromWire(raw) : null);
  } catch (cause) {
    if (cause instanceof ApiError) {
      if (cause.status === 404) {
        return json(null, { status: 404 });
      }
      return json({ error: cause.message, code: cause.code }, { status: cause.status });
    }
    throw cause;
  }
}

export async function DELETE(event) {
  try {
    await apiRequest(event, `/diagrams/${event.params.issueId}`, {
      method: 'DELETE',
    });
    return new Response(null, { status: 204 });
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

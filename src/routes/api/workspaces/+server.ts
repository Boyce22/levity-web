import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { ApiError, apiRequest } from '$lib/server/api-client';
import { HomeBoardWire, WorkspaceWire } from '$lib/contracts/wire';
import { homeBoardFromWire, workspaceFromWire } from '$lib/contracts/mappers';

const workspaceSchema = z.object({ name: z.string().trim().min(1).max(100) });

export async function POST(event) {
  const parsed = workspaceSchema.safeParse(await event.request.json().catch(() => ({})));
  if (!parsed.success) return json({ error: 'Informe um nome entre 1 e 100 caracteres.' }, { status: 400 });
  try {
    const workspace = await apiRequest(event, '/workspaces/', {
      method: 'POST', body: parsed.data, schema: WorkspaceWire,
    });
    const boards = await apiRequest(event, `/workspaces/${workspace.id}/boards`, { schema: HomeBoardWire.array() });
    if (!boards[0]) return json({ error: 'Workspace criado sem board inicial.' }, { status: 500 });
    return json({ workspace: workspaceFromWire(workspace), board: homeBoardFromWire(boards[0]) }, { status: 201 });
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

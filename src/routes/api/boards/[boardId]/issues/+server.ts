import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { ApiError, apiRequest } from '$lib/server/api-client';
import { IssueWire } from '$lib/contracts/wire';
import { issueFromWire } from '$lib/contracts/mappers';

const createIssueSchema = z.object({
  content: z.string().trim().min(1, 'Informe o conteúdo da issue.').max(500),
  column_id: z.string().uuid('ID de coluna inválido.'),
});

export async function POST(event) {
  const parsed = createIssueSchema.safeParse(await event.request.json().catch(() => ({})));
  if (!parsed.success) {
    return json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }, { status: 400 });
  }

  try {
    const raw = await apiRequest(event, `/boards/${event.params.boardId}/issues`, {
      method: 'POST',
      body: parsed.data,
      schema: IssueWire,
    });
    return json(issueFromWire(raw), { status: 201 });
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

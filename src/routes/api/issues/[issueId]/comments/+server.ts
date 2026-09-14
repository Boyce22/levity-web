import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { ApiError, apiRequest } from '$lib/server/api-client';
import { CommentsPageWire, CommentWire } from '$lib/contracts/wire';

function responseError(cause: unknown) {
  if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
  throw cause;
}

export async function GET(event) {
  try { return json(await apiRequest(event, `/comments/?issue_id=${event.params.issueId}&limit=20`, { schema: CommentsPageWire })); }
  catch (cause) { return responseError(cause); }
}

export async function POST(event) {
  const input = z.object({ content: z.string().trim().min(1).max(5000), parent_id: z.string().uuid().optional() }).safeParse(await event.request.json());
  if (!input.success) return json({ error: input.error.issues[0]?.message ?? 'Comentário inválido.' }, { status: 400 });
  try { return json(await apiRequest(event, '/comments/', { method: 'POST', body: { issue_id: event.params.issueId, ...input.data }, schema: CommentWire }), { status: 201 }); }
  catch (cause) { return responseError(cause); }
}

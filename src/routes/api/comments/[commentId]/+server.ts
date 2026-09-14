import { json } from '@sveltejs/kit';
import { ApiError, apiRequest } from '$lib/server/api-client';
import { CommentWire } from '$lib/contracts/wire';
import { z } from 'zod';

const updateCommentSchema = z.object({ content: z.string().trim().min(1).max(5000) });

export async function PATCH(event) {
  const parsed = updateCommentSchema.safeParse(await event.request.json().catch(() => ({})));
  if (!parsed.success) return json({ error: 'Comentário inválido.' }, { status: 400 });

  try {
    const comment = await apiRequest(event, `/comments/${event.params.commentId}`, {
      method: 'PATCH',
      body: parsed.data,
      schema: CommentWire,
    });
    return json(comment);
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

export async function DELETE(event) {
  try {
    await apiRequest(event, `/comments/${event.params.commentId}`, {
      method: 'DELETE',
    });
    return new Response(null, { status: 204 });
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

import { json } from '@sveltejs/kit';
import { ApiError, apiRequest } from '$lib/server/api-client';
import { CommentWire } from '$lib/contracts/wire';

export async function GET(event) {
  try {
    const replies = await apiRequest(event, `/comments/${event.params.commentId}/replies`, {
      schema: CommentWire.array(),
    });
    return json(replies);
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

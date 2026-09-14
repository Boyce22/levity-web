import { json } from '@sveltejs/kit';
import { ApiError, apiRequest } from '$lib/server/api-client';

export async function POST(event) {
  try {
    await apiRequest(event, '/notifications/read-all', {
      method: 'POST',
    });
    return json({ success: true });
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

import { json } from '@sveltejs/kit';
import { ApiError, apiRequest } from '$lib/server/api-client';
import { NotificationsPageWire } from '$lib/contracts/wire';
import { notificationsPageFromWire } from '$lib/contracts/mappers';

export async function GET(event) {
  try {
    const raw = await apiRequest(event, '/notifications/', {
      schema: NotificationsPageWire,
    });
    return json(notificationsPageFromWire(raw));
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

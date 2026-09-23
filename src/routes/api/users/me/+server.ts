import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { ApiError, apiRequest } from '$lib/server/api-client';
import { UserWire } from '$lib/contracts/wire';
import { userFromWire } from '$lib/contracts/mappers';

const updateProfileSchema = z.object({
  first_name: z.string().trim().max(50).optional(),
  last_name: z.string().trim().max(50).optional(),
  bio: z.string().trim().max(500).optional(),
  avatar_url: z.string().url().nullable().optional(),
  email: z.string().trim().email().optional(),
});

export async function GET(event) {
  try {
    const raw = await apiRequest(event, '/users/me', {
      schema: UserWire,
    });
    return json(userFromWire(raw));
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

export async function PATCH(event) {
  const parsed = updateProfileSchema.safeParse(await event.request.json().catch(() => ({})));
  if (!parsed.success) {
    return json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }, { status: 400 });
  }

  try {
    await apiRequest(event, '/users/me', {
      method: 'PATCH',
      body: parsed.data,
      schema: UserWire,
    });

    const refreshed = await apiRequest(event, '/users/me', {
      schema: UserWire,
    });
    return json(userFromWire(refreshed));
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

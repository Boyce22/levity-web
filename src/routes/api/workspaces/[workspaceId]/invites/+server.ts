import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { ApiError, apiRequest } from '$lib/server/api-client';

const createInviteSchema = z.object({
  max_uses: z.number().int().min(1).max(100).optional(),
  expires_in_hours: z.number().int().min(1).max(720).optional(),
  workspace_role: z.enum(['ADMIN', 'MEMBER']).optional(),
  board_grants: z
    .array(
      z.object({
        board_id: z.string().uuid(),
        board_role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']),
      }),
    )
    .min(1, 'Pelo menos uma permissão de board é necessária.'),
});

export async function POST(event) {
  const parsed = createInviteSchema.safeParse(await event.request.json().catch(() => ({})));
  if (!parsed.success) {
    return json({ error: parsed.error.issues[0]?.message ?? 'Dados de convite inválidos.' }, { status: 400 });
  }

  try {
    const data = await apiRequest(event, `/workspaces/${event.params.workspaceId}/invites`, {
      method: 'POST',
      body: parsed.data,
    });
    return json(data, { status: 201 });
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

export async function GET(event) {
  try {
    const data = await apiRequest(event, `/workspaces/${event.params.workspaceId}/invites`);
    return json(data);
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { ApiError, apiRequest } from '$lib/server/api-client';
import { IssueWire } from '$lib/contracts/wire';
import { issueFromWire } from '$lib/contracts/mappers';

const updateIssueSchema = z.object({
  content: z.string().trim().min(1).max(500).optional(),
  description: z.string().max(10000).nullable().optional(),
  cover_url: z.string().url().nullable().optional(),
  due_date: z.string().nullable().optional(),
  tag_id: z.string().uuid().nullable().optional(),
  priority_id: z.string().uuid().optional(),
  assignee_id: z.string().uuid().nullable().optional(),
  progress: z.number().int().min(0).max(100).nullable().optional(),
  story_points: z.number().int().min(0).nullable().optional(),
  estimated_hours: z.number().int().min(0).nullable().optional(),
});

export async function PATCH(event) {
  const parsed = updateIssueSchema.safeParse(await event.request.json().catch(() => ({})));
  if (!parsed.success) {
    return json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }, { status: 400 });
  }

  try {
    const raw = await apiRequest(
      event,
      `/boards/${event.params.boardId}/issues/${event.params.issueId}`,
      {
        method: 'PATCH',
        body: parsed.data,
        schema: IssueWire,
      },
    );
    return json(issueFromWire(raw));
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

export async function DELETE(event) {
  try {
    await apiRequest(
      event,
      `/boards/${event.params.boardId}/issues/${event.params.issueId}`,
      {
        method: 'DELETE',
      },
    );
    return new Response(null, { status: 204 });
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

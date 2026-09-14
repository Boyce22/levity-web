import { json } from '@sveltejs/kit';
import { ApiError, apiRequest } from '$lib/server/api-client';
import { IssueEventWire } from '$lib/contracts/wire';
import { issueEventFromWire } from '$lib/contracts/mappers';

export async function GET(event) {
  try {
    const raw = await apiRequest(
      event,
      `/boards/${event.params.boardId}/issues/${event.params.issueId}/history`,
      {
        schema: IssueEventWire.array(),
      },
    );
    return json(raw.map(issueEventFromWire));
  } catch (cause) {
    if (cause instanceof ApiError) return json({ error: cause.message, code: cause.code }, { status: cause.status });
    throw cause;
  }
}

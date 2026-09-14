import { describe, expect, it } from 'vitest';
import { apiRequest } from './api-client';

type ApiRequestEvent = Parameters<typeof apiRequest>[0];

function eventWith(response: Response) {
  let request: Request | undefined;
  return {
    event: {
      locals: { token: 'server-only-token' },
      cookies: { get: () => undefined },
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        request = new Request(input, init);
        return response;
      },
    } as unknown as ApiRequestEvent,
    request: () => request,
  };
}

describe('apiRequest', () => {
  it('keeps the JWT server-side and serializes snake_case JSON', async () => {
    const fixture = eventWith(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await expect(apiRequest(fixture.event, '/workspaces/id/tags', {
      method: 'POST', body: { tag_id: 'tag-id' }, schema: undefined,
    })).resolves.toEqual({ ok: true });

    const request = fixture.request();
    expect(request?.headers.get('authorization')).toBe('Bearer server-only-token');
    expect(request?.headers.get('content-type')).toContain('application/json');
    await expect(request?.json()).resolves.toEqual({ tag_id: 'tag-id' });
  });

  it('forwards FormData without a manually authored multipart boundary', async () => {
    const fixture = eventWith(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const formData = new FormData();
    formData.set('workspace_id', 'workspace-id');
    await apiRequest(fixture.event, '/files/attachments', { method: 'POST', body: formData });
    expect(fixture.request()?.headers.get('content-type')).toMatch(/^multipart\/form-data; boundary=/);
  });

  it('normalizes API errors', async () => {
    const fixture = eventWith(new Response(JSON.stringify({ error: 'Forbidden', code: 'FORBIDDEN' }), { status: 403 }));
    await expect(apiRequest(fixture.event, '/boards/id')).rejects.toMatchObject({
      status: 403, code: 'FORBIDDEN', message: 'Forbidden',
    });
  });
});

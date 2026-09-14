import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) { super(message); }
}
type Options<T> = { method?: string; body?: unknown; schema?: z.ZodType<T>; signal?: AbortSignal; authenticated?: boolean };

export async function apiRequest<T>(event: Pick<RequestEvent, 'fetch' | 'cookies' | 'locals'>, path: string, options: Options<T> = {}): Promise<T> {
  const url = `${(env.EXTERNAL_API_URL || 'http://localhost:3001').replace(/\/$/, '')}/api${path}`;
  const headers = new Headers({ Accept: 'application/json' });
  const token = event.locals.token ?? event.cookies.get('token');
  if (options.authenticated !== false && token) headers.set('Authorization', `Bearer ${token}`);
  let body: BodyInit | undefined;
  if (options.body instanceof FormData) body = options.body;
  else if (options.body !== undefined) { headers.set('Content-Type', 'application/json'); body = JSON.stringify(options.body); }
  const response = await event.fetch(url, { method: options.method ?? 'GET', headers, body, signal: options.signal });
  if (response.status === 204) return undefined as T;
  const payload: unknown = await response.json().catch(() => ({ error: response.statusText }));
  if (!response.ok) {
    const detail = payload as { error?: string; message?: string; code?: string };
    throw new ApiError(response.status, detail.code ?? 'API_ERROR', detail.error ?? detail.message ?? 'Request failed');
  }
  return options.schema ? options.schema.parse(payload) : payload as T;
}

export function requireApiAccess(apiError: unknown): never {
  if (apiError instanceof ApiError) error(apiError.status, apiError.message);
  throw apiError;
}

/**
 * Server-side HTTP client for the external API.
 * Automatically reads the auth token from cookies and adds it as Bearer header.
 */

import { cookies } from 'next/headers';

const API_BASE = (process.env.EXTERNAL_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');

async function getToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get('token')?.value;
}

export async function serverFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE}${path}`, { ...init, headers });
}

async function assertOk(res: Response): Promise<void> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`[API ${res.status}] ${text || res.statusText}`);
  }
}

export async function httpGet<T = unknown>(path: string): Promise<T> {
  const res = await serverFetch(path);
  await assertOk(res);
  return res.json();
}

export async function httpPost<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await serverFetch(path, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  await assertOk(res);
  return res.json();
}

export async function httpPatch<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await serverFetch(path, {
    method: 'PATCH',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  await assertOk(res);
  return res.json();
}

export async function httpPut<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await serverFetch(path, {
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  await assertOk(res);
  return res.json();
}

export async function httpDelete(path: string, body?: unknown): Promise<void> {
  const res = await serverFetch(path, {
    method: 'DELETE',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  await assertOk(res);
}

/**
 * Upload a file as multipart/form-data using POST.
 * Does NOT set Content-Type (browser/fetch will set it with boundary automatically).
 */
export async function serverFetchFormData(path: string, formData: FormData): Promise<Response> {
  return serverFetchWithFormData(path, formData, 'POST');
}

/**
 * Upload a file as multipart/form-data using PATCH.
 */
export async function serverPatchFormData(path: string, formData: FormData): Promise<Response> {
  return serverFetchWithFormData(path, formData, 'PATCH');
}

/**
 * Shared helper for multipart/form-data.
 */
async function serverFetchWithFormData(path: string, formData: FormData, method: string): Promise<Response> {
  const token = await getToken();

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: formData,
  });
}

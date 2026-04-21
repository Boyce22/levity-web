import { parseApiError } from './errors';

type QueryParams = Record<string, string | number | boolean | undefined | null>;

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  query?: QueryParams;
}

export class BrowserApiClient {
  private buildUrl(path: string, query?: QueryParams): string {
    // browser calls generally hit Next.js API routes or need rewrites
    // if calling backend directly, they would need the proxy rewrite set up.
    // Assuming relative path hits the frontend proxy or rewrite:
    const url = new URL(path.startsWith('http') ? path : `/api/v1${path}`, window.location.origin);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async execute<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const { body, query, headers: customHeaders, ...rest } = options;

    const headers = new Headers(customHeaders);

    let fetchBody: BodyInit | undefined;

    if (body instanceof FormData) {
      fetchBody = body;
    } else if (body !== undefined) {
      headers.set('Content-Type', 'application/json');
      fetchBody = JSON.stringify(body);
    }

    const res = await fetch(this.buildUrl(path, query), {
      ...rest,
      headers,
      body: fetchBody,
    });

    if (!res.ok) {
      throw await parseApiError(res);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    }

    const text = await res.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  public get<T = unknown>(path: string, query?: QueryParams, options?: Omit<FetchOptions, 'query' | 'method'>) {
    return this.execute<T>(path, { ...options, query, method: 'GET' });
  }

  public post<T = unknown>(path: string, body?: unknown, options?: Omit<FetchOptions, 'body' | 'method'>) {
    return this.execute<T>(path, { ...options, body, method: 'POST' });
  }

  public patch<T = unknown>(path: string, body?: unknown, options?: Omit<FetchOptions, 'body' | 'method'>) {
    return this.execute<T>(path, { ...options, body, method: 'PATCH' });
  }

  public put<T = unknown>(path: string, body?: unknown, options?: Omit<FetchOptions, 'body' | 'method'>) {
    return this.execute<T>(path, { ...options, body, method: 'PUT' });
  }

  public delete<T = unknown>(path: string, body?: unknown, options?: Omit<FetchOptions, 'body' | 'method'>) {
    return this.execute<T>(path, { ...options, body, method: 'DELETE' });
  }
}

export const browserApiClient = new BrowserApiClient();

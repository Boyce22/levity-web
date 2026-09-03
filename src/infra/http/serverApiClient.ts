import { parseApiError } from "./errors";
import { getAccessToken } from "@/infra/auth/session";

type QueryParams = Record<string, string | number | boolean | undefined | null>;

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: QueryParams;
}

const API_BASE =
  (process.env.EXTERNAL_API_URL ?? "http://localhost:3001").replace(/\/$/, "") +
  "/api";

export class ServerApiClient {
  private buildUrl(path: string, query?: QueryParams): string {
    const url = new URL(`${API_BASE}${path}`);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async execute<T>(
    path: string,
    options: FetchOptions = {},
  ): Promise<T> {
    const { body, query, headers: customHeaders, ...rest } = options;
    const token = await getAccessToken();

    const headers = new Headers(customHeaders);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    let fetchBody: BodyInit | undefined;

    // Lida com JSON vs FormData
    if (body instanceof FormData) {
      fetchBody = body;
      // O browser/node já insere o multipart/form-data + boundary adequadamente
    } else if (body !== undefined) {
      headers.set("Content-Type", "application/json");
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

    // Suporte para No Content
    if (res.status === 204) {
      return undefined as T;
    }

    // Suporte para download/tipos strings.
    // Pode expandir baseando no Content-Type se necessário
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return res.json();
    }

    // Fallback pra texto (ex: retorno da signedURL presign no file upload)
    const text = await res.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  public get<T = unknown>(
    path: string,
    query?: QueryParams,
    options?: Omit<FetchOptions, "query" | "method">,
  ) {
    return this.execute<T>(path, { ...options, query, method: "GET" });
  }

  public post<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<FetchOptions, "body" | "method">,
  ) {
    return this.execute<T>(path, { ...options, body, method: "POST" });
  }

  public patch<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<FetchOptions, "body" | "method">,
  ) {
    return this.execute<T>(path, { ...options, body, method: "PATCH" });
  }

  public put<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<FetchOptions, "body" | "method">,
  ) {
    return this.execute<T>(path, { ...options, body, method: "PUT" });
  }

  public delete<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<FetchOptions, "body" | "method">,
  ) {
    return this.execute<T>(path, { ...options, body, method: "DELETE" });
  }
}

export const serverApiClient = new ServerApiClient();

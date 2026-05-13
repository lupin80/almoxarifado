export const API_URL = 'http://localhost:3000/api';

export type ApiErrorPayload = {
  error?: string;
  message?: string;
};

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  const { timeoutMs = 60000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_URL}${path.startsWith('/') ? '' : '/'}${path}`, {
      ...fetchOptions,
      signal: controller.signal,
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!res.ok) {
      let payload: ApiErrorPayload | undefined;
      if (isJson) {
        payload = await res.json().catch(() => undefined);
      }

      const msg = payload?.error || payload?.message || `Request failed with status ${res.status}`;
      throw new Error(msg);
    }

    if (res.status === 204) return undefined as T;

    if (isJson) {
      return (await res.json()) as T;
    }

    // fallback: text
    const text = await res.text();
    return text as unknown as T;
  } finally {
    window.clearTimeout(timeout);
  }
}


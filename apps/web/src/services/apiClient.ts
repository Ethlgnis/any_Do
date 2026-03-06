const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers && typeof options.headers === 'object' && !Array.isArray(options.headers) && !(options.headers instanceof Headers)
      ? (options.headers as Record<string, string>)
      : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let message = `Request failed with status ${res.status}`;
    try {
      const body = JSON.parse(text) as { message?: string; error?: string };
      if (body.message) message = body.message;
      else if (body.error) message = body.error;
    } catch {
      if (text) message = text;
    }
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  return (await res.json()) as T;
}

export const apiClient = {
  get: <T>(path: string, accessToken?: string | null) =>
    apiRequest<T>(path, { method: 'GET' }, accessToken),
  post: <T>(path: string, body: any, accessToken?: string | null) =>
    apiRequest<T>(
      path,
      { method: 'POST', body: JSON.stringify(body) },
      accessToken,
    ),
  patch: <T>(path: string, body: any, accessToken?: string | null) =>
    apiRequest<T>(
      path,
      { method: 'PATCH', body: JSON.stringify(body) },
      accessToken,
    ),
  del: <T>(path: string, accessToken?: string | null) =>
    apiRequest<T>(path, { method: 'DELETE' }, accessToken),
};

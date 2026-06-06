const envBase = import.meta.env.VITE_API_URL as string | undefined;
const BASE = envBase ?? (import.meta.env.DEV ? 'http://localhost:8000' : '/api');

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details: unknown[];

  constructor(
    code: string,
    message: string,
    status: number,
    details: unknown[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const err = body?.error;
    throw new ApiError(
      err?.code ?? 'unknown_error',
      err?.message ?? `HTTP ${res.status}`,
      res.status,
      err?.details ?? [],
    );
  }
  return body as T;
}

export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  return handleResponse<T>(res);
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function del(path: string): Promise<void> {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' });
  await handleResponse<void>(res);
}

import type { ApiResponse, ValidationIssue } from '@/types/api';

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    const firstIssue = Array.isArray(details)
      ? (details[0] as ValidationIssue | undefined)
      : undefined;
    super(code === 'VALIDATION_ERROR' && firstIssue?.message ? firstIssue.message : message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Pesan validasi per-field dari backend (Zod). */
  get fieldErrors(): Record<string, string> {
    if (!Array.isArray(this.details)) return {};
    return this.details.reduce<Record<string, string>>((acc, issue) => {
      const item = issue as ValidationIssue;
      if (item?.path && item.message && !acc[item.path]) acc[item.path] = item.message;
      return acc;
    }, {});
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
};

type ServerIssueHandler = (status: number) => void;

let serverIssueHandler: ServerIssueHandler | null = null;

/** Dipanggil router untuk menampilkan halaman error saat backend bermasalah. */
export function setServerIssueHandler(handler: ServerIssueHandler | null) {
  serverIssueHandler = handler;
}

function reportServerIssue(status: number) {
  serverIssueHandler?.(status);
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api${path}`, {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(isFormData || body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: isFormData ? body : body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (cause) {
    if (signal?.aborted) throw cause;
    // Backend mati / tidak terjangkau.
    reportServerIssue(503);
    throw new ApiError(
      503,
      'BACKEND_UNAVAILABLE',
      'Server tidak dapat dijangkau. Coba lagi sebentar.',
    );
  }

  if (response.status >= 500) {
    reportServerIssue(response.status);
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload || payload.success !== true) {
    const error = payload && payload.success === false ? payload.error : null;
    throw new ApiError(
      response.status,
      error?.code ?? 'UNKNOWN_ERROR',
      error?.message ?? 'Terjadi kesalahan jaringan. Coba lagi sebentar.',
      error?.details,
    );
  }

  return payload.data;
}

/** Cek apakah backend hidup, tanpa memicu halaman error. */
export async function pingServer(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/health`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });
    return response.ok;
  } catch {
    return false;
  }
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { method: 'GET', signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

/** URL absolut untuk aset yang disimpan server (foto profil, cover, galeri). */
export function assetUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/uploads')) return `${API_BASE}${url}`;
  return url;
}

export function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

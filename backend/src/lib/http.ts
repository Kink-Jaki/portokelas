export type ApiErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  error: null;
};

export type ApiFailure = {
  success: false;
  data: null;
  error: ApiErrorPayload;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/** Bentuk sukses: `{ success, data, error }`. Status HTTP diatur di route. */
export const ok = <T>(data: T): ApiSuccess<T> => ({
  success: true,
  data,
  error: null,
});

/** Bentuk gagal: `{ success, data, error }`. */
export const fail = (code: string, message: string, details?: unknown): ApiFailure => ({
  success: false,
  data: null,
  error: { code, message, ...(details === undefined ? {} : { details }) },
});

/**
 * Ambil path parameter yang wajib ada. Membantu narrowing tipe `string | undefined`
 * menjadi `string` dan gagal dengan pesan yang jelas bila route dipanggil tanpa param.
 */
export function requireParam(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Path parameter "${name}" tidak tersedia.`);
  }
  return value;
}

/** Error domain dengan HTTP status + kode mesin-terbaca. */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message = 'Permintaan tidak valid', details?: unknown) {
    return new AppError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message = 'Anda harus masuk terlebih dahulu') {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'Anda tidak memiliki akses ke sumber daya ini', details?: unknown) {
    return new AppError(403, 'FORBIDDEN', message, details);
  }

  static notFound(message = 'Data tidak ditemukan') {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static conflict(message = 'Data sudah ada') {
    return new AppError(409, 'CONFLICT', message);
  }

  static unprocessable(message = 'Data tidak lolos validasi', details?: unknown) {
    return new AppError(422, 'VALIDATION_ERROR', message, details);
  }

  static tooManyRequests(message = 'Terlalu banyak permintaan. Coba lagi nanti.') {
    return new AppError(429, 'RATE_LIMITED', message);
  }

  static serviceUnavailable(message = 'Layanan sedang tidak tersedia.') {
    return new AppError(503, 'SERVICE_UNAVAILABLE', message);
  }

  static internal(message = 'Terjadi kesalahan pada server') {
    return new AppError(500, 'INTERNAL_ERROR', message);
  }
}

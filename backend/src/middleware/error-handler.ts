import type { Context, ErrorHandler, NotFoundHandler } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { ZodError } from 'zod';

import { AppError } from '../lib/errors.js';
import { fail } from '../lib/http.js';

interface PostgresLikeError {
  code?: string;
  constraint?: string;
}

function zodDetails(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

export const onError: ErrorHandler = (error: Error, c: Context) => {
  if (error instanceof AppError) {
    return c.json(
      fail(error.code, error.message, error.details),
      error.statusCode as ContentfulStatusCode,
    );
  }

  if (error instanceof ZodError) {
    return c.json(fail('VALIDATION_ERROR', 'Data tidak lolos validasi', zodDetails(error)), 422);
  }

  const dbError = error as PostgresLikeError;

  if (dbError.code === '23505') {
    return c.json(
      fail('CONFLICT', 'Data sudah terdaftar (duplikat).', { constraint: dbError.constraint }),
      409,
    );
  }

  if (dbError.code === '23503') {
    return c.json(fail('BAD_REQUEST', 'Relasi data tidak valid.'), 400);
  }

  if (dbError.code === '22P02' || dbError.code === '22007') {
    return c.json(fail('BAD_REQUEST', 'Format nilai yang dikirim tidak valid.'), 400);
  }

  console.error('[error]', error);

  return c.json(fail('INTERNAL_ERROR', 'Terjadi kesalahan pada server.'), 500);
};

export const notFound: NotFoundHandler = (c) =>
  c.json(fail('NOT_FOUND', `Endpoint ${c.req.method} ${c.req.path} tidak ditemukan.`), 404);

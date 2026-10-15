import { createMiddleware } from 'hono/factory';

import { AppError } from '../lib/errors.js';

type RateLimitOptions = {
  /** Nama endpoint agar message error informatif. */
  name: string;
  /** Jumlah request yang diizinkan dalam satu jendela waktu. */
  limit: number;
  /** Panjang jendela waktu dalam milidetik. */
  windowMs: number;
  /** Fungsi kunci (default: IP). */
  key?: (c: { req: { header: (name: string) => string | undefined } }) => string;
};

type Bucket = { count: number; resetAt: number };

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter: number;
};

const store = new Map<string, Bucket>();
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key);
  }
}

/**
 * Catat satu hit untuk `key` dan evaluasi batasnya. Dipakai middleware
 * berbasis header maupun handler yang butuh kunci khusus (mis. `ip_hash`).
 */
export function consumeLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = store.get(key);
  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    bucket.count += 1;
  }

  const active = store.get(key)!;
  const remaining = Math.max(0, limit - active.count);
  return {
    allowed: active.count <= limit,
    limit,
    remaining,
    resetAt: active.resetAt,
    retryAfter: Math.max(0, Math.ceil((active.resetAt - now) / 1000)),
  };
}

/**
 * Rate limiter in-memory berbasis fixed window. Cukup untuk instance tunggal;
 * untuk multi-instance ganti dengan store terpusat (mis. Redis).
 */
export function rateLimit({ name, limit, windowMs, key }: RateLimitOptions) {
  const resolveKey =
    key ??
    ((c: { req: { header: (h: string) => string | undefined } }) =>
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
      c.req.header('x-real-ip') ??
      'unknown');

  return createMiddleware(async (c, next) => {
    const result = consumeLimit(`${name}:${resolveKey(c)}`, limit, windowMs);

    c.header('X-RateLimit-Limit', String(result.limit));
    c.header('X-RateLimit-Remaining', String(result.remaining));
    c.header('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));

    if (!result.allowed) {
      c.header('Retry-After', String(result.retryAfter));
      throw AppError.tooManyRequests(
        `Terlalu banyak percobaan ${name}. Coba lagi dalam ${result.retryAfter} detik.`,
      );
    }

    await next();
  });
}

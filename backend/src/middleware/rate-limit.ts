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
    const now = Date.now();
    sweep(now);

    const bucketKey = `${name}:${resolveKey(c)}`;
    const bucket = store.get(bucketKey);

    if (!bucket || bucket.resetAt <= now) {
      store.set(bucketKey, { count: 1, resetAt: now + windowMs });
    } else {
      bucket.count += 1;
    }

    const active = store.get(bucketKey)!;
    const remaining = Math.max(0, limit - active.count);

    c.header('X-RateLimit-Limit', String(limit));
    c.header('X-RateLimit-Remaining', String(remaining));
    c.header('X-RateLimit-Reset', String(Math.ceil(active.resetAt / 1000)));

    if (active.count > limit) {
      const retryAfter = Math.ceil((active.resetAt - now) / 1000);
      c.header('Retry-After', String(retryAfter));
      throw AppError.tooManyRequests(
        `Terlalu banyak percobaan ${name}. Coba lagi dalam ${retryAfter} detik.`,
      );
    }

    await next();
  });
}

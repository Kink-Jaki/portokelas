import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';

import { eq } from 'drizzle-orm';

import { db } from '../db/index.js';
import { users, type UserRole, type UserStatus } from '../db/schema.js';
import { env } from '../env.js';
import { AppError } from '../lib/errors.js';
import { verifySession } from '../lib/jwt.js';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  slug: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl: string | null;
  rejectionReason: string | null;
};

export type AppEnv = {
  Variables: {
    user: AuthUser | null;
  };
};

/** Baca sesi dari cookie lalu sinkronkan dengan kondisi terbaru di database. */
async function resolveUser(token: string | undefined): Promise<AuthUser | null> {
  if (!token) return null;

  const payload = await verifySession(token);
  if (!payload) return null;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      slug: users.slug,
      role: users.role,
      status: users.status,
      avatarUrl: users.avatarUrl,
      rejectionReason: users.rejectionReason,
    })
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1);

  return rows[0] ?? null;
}

/** Wajib login. Memasang `c.get('user')`. */
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const user = await resolveUser(getCookie(c, env.COOKIE_NAME));

  if (!user) {
    throw AppError.unauthorized('Sesi tidak ditemukan atau sudah berakhir. Silakan masuk kembali.');
  }

  c.set('user', user);
  await next();
});

/** Wajib punya role admin. Dipasangkan setelah `requireAuth`. */
export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get('user');
  if (!user) throw AppError.unauthorized();
  if (user.role !== 'admin') {
    throw AppError.forbidden('Hanya admin yang dapat mengakses sumber daya ini.');
  }
  await next();
});

/** Wajib berstatus approved (admin otomatis lolos). */
export const requireApproved = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get('user');
  if (!user) throw AppError.unauthorized();

  if (user.role === 'admin') {
    await next();
    return;
  }

  switch (user.status) {
    case 'pending':
      throw AppError.forbidden('Menunggu konfirmasi admin.', { status: user.status });
    case 'rejected':
      throw AppError.forbidden(user.rejectionReason ?? 'Pendaftaran ditolak oleh admin.', {
        status: user.status,
        reason: user.rejectionReason,
      });
    case 'suspended':
      throw AppError.forbidden('Akun Anda dinonaktifkan oleh admin.', { status: user.status });
    default:
      await next();
  }
});

export function getCurrentUser(c: { get: (key: 'user') => AuthUser | null }): AuthUser {
  const user = c.get('user');
  if (!user) throw AppError.unauthorized();
  return user;
}

/** Resolusi sesi opsional (untuk `GET /auth/me`). */
export async function resolveUserFromCookie(c: Context): Promise<AuthUser | null> {
  return resolveUser(getCookie(c, env.COOKIE_NAME));
}

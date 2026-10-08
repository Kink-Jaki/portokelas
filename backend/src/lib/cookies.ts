import { deleteCookie, setCookie } from 'hono/cookie';
import type { Context } from 'hono';

import { env } from '../env.js';

/** Cookie sesi: httpOnly + sameSite; `secure` otomatis di production. */
export function setSessionCookie(c: Context, token: string): void {
  setCookie(c, env.COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: env.isProduction,
    path: '/',
    maxAge: env.sessionMaxAge,
  });
}

export function clearSessionCookie(c: Context): void {
  deleteCookie(c, env.COOKIE_NAME, {
    path: '/',
    ...(env.isProduction ? { secure: true, sameSite: 'Lax' as const } : {}),
  });
}

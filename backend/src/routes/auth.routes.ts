import { Hono } from 'hono';
import { clearSessionCookie, setSessionCookie } from '../lib/cookies.js';
import { ok } from '../lib/http.js';
import { zJson } from '../lib/validate.js';
import { resolveUserFromCookie, type AppEnv } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rate-limit.js';
import { getProfile, loginMember, registerMember } from '../services/auth.service.js';
import { loginSchema, registerSchema } from '../validators/auth.js';

export const authRoutes = new Hono<AppEnv>()
  .post(
    '/register',
    rateLimit({ name: 'register', limit: 5, windowMs: 60 * 60 * 1000 }),
    zJson(registerSchema),
    async (c) => {
      const input = c.req.valid('json');
      const { token, user } = await registerMember(input);
      setSessionCookie(c, token);
      return c.json(ok({ user }), 201);
    },
  )
  .post(
    '/login',
    rateLimit({ name: 'login', limit: 10, windowMs: 15 * 60 * 1000 }),
    zJson(loginSchema),
    async (c) => {
      const input = c.req.valid('json');
      const { token, user } = await loginMember(input);
      setSessionCookie(c, token);
      return c.json(ok({ user }));
    },
  )
  .post('/logout', (c) => {
    clearSessionCookie(c);
    return c.json(ok({ message: 'Berhasil keluar.' }));
  })
  .get('/me', async (c) => {
    const sessionUser = await resolveUserFromCookie(c);
    if (!sessionUser) return c.json(ok({ user: null }));

    const profile = await getProfile(sessionUser.id);
    return c.json(ok({ user: profile }));
  });

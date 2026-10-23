import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { env } from './env.js';
import { fail, ok } from './lib/http.js';
import { type AppEnv } from './middleware/auth.js';
import { notFound, onError } from './middleware/error-handler.js';
import { adminRoutes } from './routes/admin.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { meRoutes } from './routes/me.routes.js';
import { projectInteractionRoutes } from './routes/project-interaction.routes.js';
import {
  adminNglRoutes,
  adminNglSettingsRoutes,
  nglRoutes,
  nglSettingsRoutes,
} from './routes/ngl.routes.js';
import { publicRoutes } from './routes/public.routes.js';
import { uploadRoutes } from './routes/upload.routes.js';
import { readUpload } from './services/upload.service.js';

export const app = new Hono<AppEnv>();

app.use('*', logger());

app.use(
  '/api/*',
  cors({
    origin: (origin) => (origin && env.corsOrigins.includes(origin) ? origin : env.corsOrigins[0]),
    credentials: true,
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  }),
);

// Respons API memakai data autentik: jangan pernah di-cache browser/proxy.
app.use('/api/*', async (c, next) => {
  await next();
  c.res.headers.set('Cache-Control', 'no-store');
});

// Penyimpanan file (R2 di Workers, filesystem saat dev lokal).
app.get('/uploads/*', async (c) => {
  const object = await readUpload(c.req.path);
  if (!object) {
    return c.json(fail('NOT_FOUND', 'Berkas tidak ditemukan.'), 404);
  }

  return new Response(object.body, {
    headers: {
      'Content-Type': object.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
});

app.get('/api/health', (c) =>
  c.json(ok({ status: 'ok', env: env.NODE_ENV, time: new Date().toISOString() })),
);

app.route('/api/auth', authRoutes);
app.route('/api/me', meRoutes);
app.route('/api/upload', uploadRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/admin/ngl', adminNglRoutes);
app.route('/api/admin/settings', adminNglSettingsRoutes);
app.route('/api/ngl', nglRoutes);
app.route('/api/settings', nglSettingsRoutes);
app.route('/api/projects', projectInteractionRoutes);
// Rute publik (members, projects, stats).
app.route('/api', publicRoutes);

app.onError(onError);
app.notFound(notFound);

export default app;

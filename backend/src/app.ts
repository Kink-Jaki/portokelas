import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { env } from './env.js';
import { ok } from './lib/http.js';
import { type AppEnv } from './middleware/auth.js';
import { notFound, onError } from './middleware/error-handler.js';
import { adminRoutes } from './routes/admin.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { meRoutes } from './routes/me.routes.js';
import { publicRoutes } from './routes/public.routes.js';
import { uploadRootRelative } from './services/upload.service.js';

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

// Penyimpanan file lokal.
app.use(
  '/uploads/*',
  serveStatic({
    root: uploadRootRelative,
    rewriteRequestPath: (requestPath) => requestPath.replace(/^\/uploads/, ''),
    onFound: (_path, c) => {
      c.header('Cache-Control', 'public, max-age=31536000, immutable');
    },
  }),
);

app.get('/api/health', (c) =>
  c.json(ok({ status: 'ok', env: env.NODE_ENV, time: new Date().toISOString() })),
);

app.route('/api/auth', authRoutes);
app.route('/api/me', meRoutes);
app.route('/api/admin', adminRoutes);
// Rute publik (members, projects, stats).
app.route('/api', publicRoutes);

app.onError(onError);
app.notFound(notFound);

export default app;

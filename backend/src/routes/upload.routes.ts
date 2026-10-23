import { Hono } from 'hono';

import { ok } from '../lib/http.js';
import { zJson } from '../lib/validate.js';
import { requireAdmin, requireAuth, type AppEnv } from '../middleware/auth.js';
import { createVideoUploadTicket } from '../services/index.js';
import { videoUploadUrlSchema } from '../validators/upload.js';

/**
 * Presigned upload langsung ke Cloudflare R2. Khusus admin karena saat ini
 * hanya video kenangan (single row) yang memakai alur ini.
 */
export const uploadRoutes = new Hono<AppEnv>()
  .use('*', requireAuth, requireAdmin)

  .post('/video-url', zJson(videoUploadUrlSchema), async (c) => {
    const { contentType } = c.req.valid('json');
    const ticket = await createVideoUploadTicket(contentType);
    return c.json(ok(ticket));
  });

import { Hono, type Context } from 'hono';

import {
  NGL_DISABLED_MESSAGE,
  NGL_HONEYPOT_FIELD,
  NGL_IMAGE_MAX_BYTES,
  NGL_RATE_LIMIT,
  containsProfanity,
} from '../config/ngl.js';
import { AppError } from '../lib/errors.js';
import { ok, requireParam } from '../lib/http.js';
import { zJson, zQuery } from '../lib/validate.js';
import { consumeLimit } from '../middleware/rate-limit.js';
import { getCurrentUser, requireAdmin, requireAuth, type AppEnv } from '../middleware/auth.js';
import {
  countUnreadNglMessages,
  createNglMessage,
  deleteNglMessage,
  getNglMessageById,
  hashIp,
  isNglEnabled,
  listNglMessagesForAdmin,
  listNglMessagesForUser,
  listNglReportsForAdmin,
  markNglMessageRead,
  reportNglMessage,
  setNglEnabled,
  unmarkNglMessageRead,
  updateNglReportStatus,
} from '../services/index.js';
import { parseNglSpotifyUrl } from '../services/spotify.service.js';
import { deleteStoredFile, saveImageBytes } from '../services/upload.service.js';
import {
  nglAdminListQuerySchema,
  nglContentSchema,
  nglListQuerySchema,
  nglReportSchema,
  nglReportStatusSchema,
  nglSettingSchema,
} from '../validators/ngl.js';

type FormValues = Record<string, string | File | (string | File)[]>;

function formText(form: FormValues, field: string): string | undefined {
  const value = form[field];
  const candidate = Array.isArray(value) ? value[0] : value;
  return typeof candidate === 'string' ? candidate : undefined;
}

function formFile(form: FormValues, fields: string[]): File | null {
  for (const field of fields) {
    const value = form[field];
    const candidate = Array.isArray(value) ? value[0] : value;
    if (candidate instanceof File && candidate.size > 0) return candidate;
  }
  return null;
}

/** IP dari header proxy — dipakai hanya untuk di-hash, tidak pernah disimpan mentah. */
function clientIp(c: Context): string {
  return (
    c.req.header('cf-connecting-ip') ??
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
    c.req.header('x-real-ip') ??
    'unknown'
  );
}

async function assertNglEnabled(): Promise<void> {
  if (!(await isNglEnabled())) throw AppError.serviceUnavailable(NGL_DISABLED_MESSAGE);
}

/** Endpoint publik pengiriman pesan anonim. */
export const nglRoutes = new Hono<AppEnv>()
  .post('/', async (c) => {
    await assertNglEnabled();

    const form = (await c.req.parseBody({ all: true })) as FormValues;

    // Honeypot: field tersembunyi ini harus kosong untuk pengirim manusia.
    const honeypot = formText(form, NGL_HONEYPOT_FIELD);
    if (honeypot && honeypot.trim().length > 0) {
      return c.json(ok({ received: true }), 201);
    }

    const ip = clientIp(c);
    const ipHash = await hashIp(ip);
    const rate = consumeLimit(`ngl:${ipHash}`, NGL_RATE_LIMIT.limit, NGL_RATE_LIMIT.windowMs);
    c.header('X-RateLimit-Limit', String(rate.limit));
    c.header('X-RateLimit-Remaining', String(rate.remaining));
    c.header('X-RateLimit-Reset', String(Math.ceil(rate.resetAt / 1000)));
    if (!rate.allowed) {
      c.header('Retry-After', String(rate.retryAfter));
      throw AppError.tooManyRequests(
        `Terlalu banyak mengirim pesan. Coba lagi dalam ${rate.retryAfter} detik.`,
      );
    }

    const parsedContent = nglContentSchema.safeParse(formText(form, 'content') ?? undefined);
    if (!parsedContent.success) {
      throw AppError.unprocessable(
        'Data tidak lolos validasi.',
        parsedContent.error.issues.map((issue) => ({
          path: issue.path.join('.') || 'content',
          message: issue.message,
        })),
      );
    }
    const content = parsedContent.data ?? null;

    const rawSpotify = formText(form, 'spotify') ?? formText(form, 'spotifyUrl');
    let spotifyType: string | null = null;
    let spotifyId: string | null = null;
    if (rawSpotify && rawSpotify.trim()) {
      const parsed = parseNglSpotifyUrl(rawSpotify);
      if (!parsed) {
        throw AppError.unprocessable('Data tidak lolos validasi.', [
          {
            path: 'spotify',
            message:
              'Hanya tautan Spotify track, album, playlist, atau episode dari open.spotify.com yang diterima.',
          },
        ]);
      }
      spotifyType = parsed.type;
      spotifyId = parsed.id;
    }

    const file = formFile(form, ['image', 'photo', 'file']);
    if (!content && !spotifyId && !file) {
      throw AppError.badRequest(
        'Minimal salah satu harus diisi: pesan, tautan Spotify, atau foto.',
      );
    }

    let imagePath: string | null = null;
    if (file) {
      if (file.size > NGL_IMAGE_MAX_BYTES) {
        throw AppError.badRequest('Ukuran foto maksimal 3MB.');
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      imagePath = await saveImageBytes(bytes, 'ngl');
    }

    const isHidden = content ? containsProfanity(content) : false;

    try {
      const message = await createNglMessage({
        content,
        spotifyType,
        spotifyId,
        imagePath,
        ipHash,
        isHidden,
      });
      return c.json(ok({ received: true, message: { id: message.id } }), 201);
    } catch (error) {
      if (imagePath) await deleteStoredFile(imagePath);
      throw error;
    }
  })

  /** Jumlah pesan belum dibaca — dipakai badge sidebar "Kotak NGL". */
  .get('/messages/unread-count', requireAuth, async (c) => {
    await assertNglEnabled();
    const user = getCurrentUser(c);
    return c.json(ok({ count: await countUnreadNglMessages(user.id) }));
  })

  .get('/messages', requireAuth, zQuery(nglListQuerySchema), async (c) => {
    await assertNglEnabled();
    const user = getCurrentUser(c);
    const result = await listNglMessagesForUser(user.id, c.req.valid('query'));
    const unread = await countUnreadNglMessages(user.id);
    return c.json(ok({ ...result, unread }));
  })

  .post('/messages/:id/read', requireAuth, async (c) => {
    await assertNglEnabled();
    const user = getCurrentUser(c);
    const id = requireParam(c.req.param('id'), 'id');

    const message = await getNglMessageById(id);
    if (!message) throw AppError.notFound('Pesan tidak ditemukan');

    await markNglMessageRead(id, user.id);
    return c.json(ok({ id, read: true }));
  })

  .post('/messages/:id/unread', requireAuth, async (c) => {
    await assertNglEnabled();
    const user = getCurrentUser(c);
    const id = requireParam(c.req.param('id'), 'id');

    const message = await getNglMessageById(id);
    if (!message) throw AppError.notFound('Pesan tidak ditemukan');

    await unmarkNglMessageRead(id, user.id);
    return c.json(ok({ id, read: false }));
  })

  .post('/messages/:id/report', requireAuth, zJson(nglReportSchema), async (c) => {
    await assertNglEnabled();
    const user = getCurrentUser(c);
    const id = requireParam(c.req.param('id'), 'id');

    const message = await getNglMessageById(id);
    if (!message) throw AppError.notFound('Pesan tidak ditemukan');

    const input = c.req.valid('json');
    const result = await reportNglMessage(id, user.id, input.reason, input.note ?? null);
    return c.json(ok({ id, reported: true, ...result }));
  });

/** Pengaturan publik NGL. */
export const nglSettingsRoutes = new Hono().get('/ngl', async (c) =>
  c.json(ok({ enabled: await isNglEnabled() })),
);

/** Moderasi NGL khusus admin. */
export const adminNglRoutes = new Hono<AppEnv>()
  .use('*', requireAuth, requireAdmin)

  .get('/messages', zQuery(nglAdminListQuerySchema), async (c) => {
    const result = await listNglMessagesForAdmin(c.req.valid('query'));
    return c.json(ok(result));
  })

  .delete('/messages/:id', async (c) => {
    const id = requireParam(c.req.param('id'), 'id');
    const removed = await deleteNglMessage(id);
    await deleteStoredFile(removed.imagePath);
    return c.json(ok({ id, deleted: true }));
  })

  .get('/reports', async (c) => {
    const reports = await listNglReportsForAdmin();
    return c.json(ok({ reports }));
  })

  .patch('/reports/:id', zJson(nglReportStatusSchema), async (c) => {
    const id = requireParam(c.req.param('id'), 'id');
    const status = await updateNglReportStatus(id, c.req.valid('json').status);
    return c.json(ok({ id, status }));
  });

/** Pengaturan NGL khusus admin. */
export const adminNglSettingsRoutes = new Hono<AppEnv>()
  .use('*', requireAuth, requireAdmin)
  .patch('/ngl', zJson(nglSettingSchema), async (c) => {
    const enabled = await setNglEnabled(c.req.valid('json').enabled);
    return c.json(ok({ enabled }));
  });

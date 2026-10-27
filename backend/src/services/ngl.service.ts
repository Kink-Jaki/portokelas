import { and, count, desc, eq, inArray, isNull } from 'drizzle-orm';

import { db } from '../db/index.js';
import {
  appSettings,
  messageReads,
  messageReports,
  nglMessages,
  MESSAGE_REPORT_STATUSES,
  type MessageReportStatus,
  type NglMessage,
} from '../db/schema.js';
import { NGL_REPORT_AUTOHIDE_THRESHOLD } from '../config/ngl.js';
import { env } from '../env.js';
import { AppError } from '../lib/errors.js';
import { buildNglSpotifyEmbedUrl, resolveSpotifyEmbed } from './spotify.service.js';
import type { Paginated } from './user.service.js';

export const NGL_SETTING_KEY = 'ngl_enabled';

const toPaginated = <T>(items: T[], total: number, page: number, limit: number): Paginated<T> => ({
  items,
  meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
});

/* ------------------------------- Settings ------------------------------- */

/** Apakah fitur NGL aktif. Bila baris belum ada, dianggap nonaktif. */
export async function isNglEnabled(): Promise<boolean> {
  const rows = await db
    .select({ value: appSettings.value })
    .from(appSettings)
    .where(eq(appSettings.key, NGL_SETTING_KEY))
    .limit(1);
  return rows[0]?.value === true;
}

export async function setNglEnabled(enabled: boolean): Promise<boolean> {
  await db
    .insert(appSettings)
    .values({ key: NGL_SETTING_KEY, value: enabled, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value: enabled, updatedAt: new Date() },
    });
  return enabled;
}

/* --------------------------------- IP hash -------------------------------- */

/** SHA-256(IP + salt dari env). Tidak pernah menyimpan IP mentah. */
export async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(`${ip}:${env.NGL_IP_SALT}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/* ------------------------------- Serialisasi ------------------------------ */

export type SerializedNglMessage = {
  id: string;
  content: string | null;
  imagePath: string | null;
  isHidden: boolean;
  createdAt: string;
  spotify: {
    type: string;
    id: string;
    embedUrl: string;
    title: string | null;
    artistName: string | null;
  } | null;
  isRead?: boolean;
  isReported?: boolean;
};

function serializeMessage(
  message: NglMessage,
  flags: { isRead?: boolean; isReported?: boolean } = {},
): SerializedNglMessage {
  return {
    id: message.id,
    content: message.content,
    imagePath: message.imagePath,
    isHidden: message.isHidden,
    createdAt: message.createdAt.toISOString(),
    spotify:
      message.spotifyType && message.spotifyId
        ? {
            type: message.spotifyType,
            id: message.spotifyId,
            embedUrl: buildNglSpotifyEmbedUrl(
              message.spotifyType as 'track' | 'album' | 'playlist' | 'episode',
              message.spotifyId,
            ),
            title: message.spotifyTitle,
            artistName: message.spotifyArtist,
          }
        : null,
    ...flags,
  };
}

/* -------------------------------- Messages -------------------------------- */

export type CreateNglMessageInput = {
  content: string | null;
  spotifyType: string | null;
  spotifyId: string | null;
  imagePath: string | null;
  ipHash: string;
  isHidden: boolean;
};

/** Ambil judul & penyanyi dari Spotify agar badge di kartu bisa menampilkannya. */
async function resolveNglSpotifyMeta(
  type: string | null,
  id: string | null,
): Promise<{ title: string | null; artistName: string | null }> {
  if (!type || !id) return { title: null, artistName: null };
  const info = await resolveSpotifyEmbed(`https://open.spotify.com/${type}/${id}`);
  return { title: info?.title ?? null, artistName: info?.artistName ?? null };
}

/** Isi metadata Spotify yang masih kosong (pesan lama) lalu simpan hasilnya. */
async function backfillSpotifyMeta(messages: NglMessage[]): Promise<void> {
  const targets = messages.filter((message) => message.spotifyId && !message.spotifyTitle);
  if (targets.length === 0) return;

  await Promise.all(
    targets.map(async (message) => {
      const meta = await resolveNglSpotifyMeta(message.spotifyType, message.spotifyId);
      if (!meta.title && !meta.artistName) return;
      message.spotifyTitle = meta.title;
      message.spotifyArtist = meta.artistName;
      await db
        .update(nglMessages)
        .set({ spotifyTitle: meta.title, spotifyArtist: meta.artistName })
        .where(eq(nglMessages.id, message.id));
    }),
  );
}

export async function createNglMessage(input: CreateNglMessageInput): Promise<NglMessage> {
  const meta = await resolveNglSpotifyMeta(input.spotifyType, input.spotifyId);
  const rows = await db
    .insert(nglMessages)
    .values({
      content: input.content,
      spotifyType: input.spotifyType,
      spotifyId: input.spotifyId,
      spotifyTitle: meta.title,
      spotifyArtist: meta.artistName,
      imagePath: input.imagePath,
      ipHash: input.ipHash,
      isHidden: input.isHidden,
    })
    .returning();
  const created = rows[0];
  if (!created) throw AppError.internal('Gagal menyimpan pesan.');
  return created;
}

/** Daftar pesan NGL untuk user login (hanya yang tidak disembunyikan). */
export async function listNglMessagesForUser(
  userId: string,
  query: { page: number; limit: number },
): Promise<Paginated<SerializedNglMessage>> {
  const { page, limit } = query;

  const rows = await db
    .select({
      message: nglMessages,
      readId: messageReads.id,
      reportId: messageReports.id,
    })
    .from(nglMessages)
    .leftJoin(
      messageReads,
      and(eq(messageReads.messageId, nglMessages.id), eq(messageReads.userId, userId)),
    )
    .leftJoin(
      messageReports,
      and(eq(messageReports.messageId, nglMessages.id), eq(messageReports.reporterUserId, userId)),
    )
    .where(eq(nglMessages.isHidden, false))
    .orderBy(desc(nglMessages.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const totals = await db
    .select({ value: count() })
    .from(nglMessages)
    .where(eq(nglMessages.isHidden, false));

  await backfillSpotifyMeta(rows.map((row) => row.message));

  const items = rows.map((row) =>
    serializeMessage(row.message, {
      isRead: row.readId !== null,
      isReported: row.reportId !== null,
    }),
  );

  return toPaginated(items, totals[0]?.value ?? 0, page, limit);
}

export async function getNglMessageById(id: string): Promise<NglMessage | null> {
  const rows = await db.select().from(nglMessages).where(eq(nglMessages.id, id)).limit(1);
  return rows[0] ?? null;
}

/** Tandai pesan sudah dibaca oleh seorang user (idempoten). */
export async function markNglMessageRead(messageId: string, userId: string): Promise<void> {
  await db
    .insert(messageReads)
    .values({ messageId, userId })
    .onConflictDoNothing({ target: [messageReads.messageId, messageReads.userId] });
}

/** Tandai pesan kembali belum dibaca oleh seorang user (hapus riwayat baca). */
export async function unmarkNglMessageRead(messageId: string, userId: string): Promise<void> {
  await db
    .delete(messageReads)
    .where(and(eq(messageReads.messageId, messageId), eq(messageReads.userId, userId)));
}

/* --------------------------------- Reports -------------------------------- */

function isUniqueViolation(error: unknown): boolean {
  return (error as { code?: string } | undefined)?.code === '23505';
}

/**
 * Simpan laporan. Satu user hanya boleh melaporkan satu pesan sekali.
 * Bila jumlah pelapor berbeda mencapai ambang, pesan otomatis disembunyikan.
 */
export async function reportNglMessage(
  messageId: string,
  userId: string,
  reason: string,
  note: string | null,
): Promise<{ reportCount: number; hidden: boolean }> {
  try {
    await db.insert(messageReports).values({ messageId, reporterUserId: userId, reason, note });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw AppError.conflict('Anda sudah melaporkan pesan ini.');
    }
    throw error;
  }

  const totals = await db
    .select({ value: count() })
    .from(messageReports)
    .where(eq(messageReports.messageId, messageId));
  const reportCount = totals[0]?.value ?? 0;

  let hidden = false;
  if (reportCount >= NGL_REPORT_AUTOHIDE_THRESHOLD) {
    await db.update(nglMessages).set({ isHidden: true }).where(eq(nglMessages.id, messageId));
    hidden = true;
  }

  return { reportCount, hidden };
}

/* ------------------------------ Admin queries ----------------------------- */

export type AdminNglMessage = SerializedNglMessage & { readCount: number; reportCount: number };

export async function listNglMessagesForAdmin(query: {
  page: number;
  limit: number;
}): Promise<Paginated<AdminNglMessage>> {
  const { page, limit } = query;

  const rows = await db
    .select()
    .from(nglMessages)
    .orderBy(desc(nglMessages.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const ids = rows.map((row) => row.id);

  const readCounts = new Map<string, number>();
  const reportCounts = new Map<string, number>();

  if (ids.length > 0) {
    const reads = await db
      .select({ messageId: messageReads.messageId, value: count() })
      .from(messageReads)
      .where(inArray(messageReads.messageId, ids))
      .groupBy(messageReads.messageId);
    for (const row of reads) readCounts.set(row.messageId, row.value);

    const reports = await db
      .select({ messageId: messageReports.messageId, value: count() })
      .from(messageReports)
      .where(inArray(messageReports.messageId, ids))
      .groupBy(messageReports.messageId);
    for (const row of reports) reportCounts.set(row.messageId, row.value);
  }

  const items = rows.map((message) => ({
    ...serializeMessage(message),
    readCount: readCounts.get(message.id) ?? 0,
    reportCount: reportCounts.get(message.id) ?? 0,
  }));

  const totals = await db.select({ value: count() }).from(nglMessages);

  return toPaginated(items, totals[0]?.value ?? 0, page, limit);
}

export async function deleteNglMessage(id: string): Promise<NglMessage> {
  const rows = await db.delete(nglMessages).where(eq(nglMessages.id, id)).returning();
  const removed = rows[0];
  if (!removed) throw AppError.notFound('Pesan tidak ditemukan');
  return removed;
}

export type AdminNglReport = {
  id: string;
  messageId: string;
  reason: string;
  note: string | null;
  status: MessageReportStatus;
  createdAt: string;
  reporterCount: number;
  message: { content: string | null; imagePath: string | null; isHidden: boolean } | null;
};

/** Semua laporan dengan jumlah pelapor berbeda per pesan. */
export async function listNglReportsForAdmin(): Promise<AdminNglReport[]> {
  const rows = await db
    .select({ report: messageReports, message: nglMessages })
    .from(messageReports)
    .leftJoin(nglMessages, eq(messageReports.messageId, nglMessages.id))
    .orderBy(desc(messageReports.createdAt))
    .limit(500);

  const ids = [...new Set(rows.map((row) => row.report.messageId))];
  const reporterCounts = new Map<string, number>();
  if (ids.length > 0) {
    const counts = await db
      .select({ messageId: messageReports.messageId, value: count() })
      .from(messageReports)
      .where(inArray(messageReports.messageId, ids))
      .groupBy(messageReports.messageId);
    for (const row of counts) reporterCounts.set(row.messageId, row.value);
  }

  return rows.map((row) => ({
    id: row.report.id,
    messageId: row.report.messageId,
    reason: row.report.reason,
    note: row.report.note,
    status: row.report.status as MessageReportStatus,
    createdAt: row.report.createdAt.toISOString(),
    reporterCount: reporterCounts.get(row.report.messageId) ?? 0,
    message: row.message
      ? {
          content: row.message.content,
          imagePath: row.message.imagePath,
          isHidden: row.message.isHidden,
        }
      : null,
  }));
}

export async function updateNglReportStatus(
  id: string,
  status: MessageReportStatus,
): Promise<AdminNglReport['status']> {
  if (!(MESSAGE_REPORT_STATUSES as readonly string[]).includes(status)) {
    throw AppError.unprocessable('Status laporan tidak valid.');
  }
  const rows = await db
    .update(messageReports)
    .set({ status })
    .where(eq(messageReports.id, id))
    .returning({ status: messageReports.status });
  const updated = rows[0];
  if (!updated) throw AppError.notFound('Laporan tidak ditemukan');
  return updated.status as MessageReportStatus;
}

/** Jumlah pesan yang belum dibaca oleh seorang user (indikator kotak). */
export async function countUnreadNglMessages(userId: string): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(nglMessages)
    .leftJoin(
      messageReads,
      and(eq(messageReads.messageId, nglMessages.id), eq(messageReads.userId, userId)),
    )
    .where(and(eq(nglMessages.isHidden, false), isNull(messageReads.id)));
  return rows[0]?.value ?? 0;
}

/** Jumlah pesan yang disembunyikan (perlu ditinjau admin). */
export async function countHiddenNglMessages(): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(nglMessages)
    .where(eq(nglMessages.isHidden, true));
  return rows[0]?.value ?? 0;
}

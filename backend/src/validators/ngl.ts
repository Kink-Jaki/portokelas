import { z } from 'zod';

import { NGL_REPORT_NOTE_MAX, NGL_REPORT_REASONS, NGL_TEXT_MAX } from '../config/ngl.js';

/** Kunci pesan NGL (hanya key `ngl_enabled` yang dikenal). */
export const nglSettingSchema = z.object({
  enabled: z.boolean({ required_error: 'Nilai enabled wajib diisi' }),
});

/** Teks pesan: opsional (boleh kosong bila ada Spotify/foto), maks 300 karakter. */
export const nglContentSchema = z
  .string()
  .trim()
  .max(NGL_TEXT_MAX, `Pesan maksimal ${NGL_TEXT_MAX} karakter`)
  .transform((value) => (value.length === 0 ? null : value))
  .nullable()
  .optional();

/** Query daftar pesan (kotak & admin). */
export const nglListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const nglAdminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
});

/** Laporan pesan. */
export const nglReportSchema = z.object({
  reason: z.enum(NGL_REPORT_REASONS, { errorMap: () => ({ message: 'Alasan tidak valid' }) }),
  note: z
    .string()
    .trim()
    .max(NGL_REPORT_NOTE_MAX, `Catatan maksimal ${NGL_REPORT_NOTE_MAX} karakter`)
    .optional()
    .transform((value) => (value ? value : null)),
});

export const nglReportStatusSchema = z.object({
  status: z.enum(['pending', 'resolved', 'dismissed']),
});

export type NglReportInput = z.infer<typeof nglReportSchema>;

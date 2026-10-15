import type { NglReportReason } from '@/types/api';

/** Teks persis yang ditampilkan saat fitur NGL belum aktif. */
export const NGL_DISABLED_MESSAGE =
  'Maaf, fitur sedang dalam tahap pengembangan. Hubungi developer untuk info lebih lanjut.';

export const NGL_TEXT_MAX = 300;
export const NGL_IMAGE_MAX_MB = 3;

/** Nama kolom honeypot — harus sama dengan backend. */
export const NGL_HONEYPOT_FIELD = 'website';

export const NGL_REPORT_REASONS: { value: NglReportReason; label: string }[] = [
  { value: 'bullying', label: 'Perundungan / bullying' },
  { value: 'sara', label: 'Ujaran kebencian (SARA)' },
  { value: 'spam', label: 'Spam / promosi' },
  { value: 'inappropriate', label: 'Konten tidak pantas' },
  { value: 'other', label: 'Lainnya' },
];

export const NGL_REPORT_STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu',
  resolved: 'Selesai',
  dismissed: 'Diabaikan',
};

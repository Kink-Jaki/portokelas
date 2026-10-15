/**
 * Konfigurasi fitur Craftly NGL (pesan anonim).
 * Semua batasan & daftar kata ada di sini agar mudah ditinjau.
 */

/** Teks persis yang dikembalikan/ditampilkan saat fitur nonaktif. */
export const NGL_DISABLED_MESSAGE =
  'Maaf, fitur sedang dalam tahap pengembangan. Hubungi developer untuk info lebih lanjut.';

/** Panjang maksimal teks pesan. */
export const NGL_TEXT_MAX = 300;

/** Ukuran maksimal foto unggahan (3 MB). */
export const NGL_IMAGE_MAX_BYTES = 3 * 1024 * 1024;

/** Nama field honeypot anti-bot — harus kosong pada kiriman manusia. */
export const NGL_HONEYPOT_FIELD = 'website';

/** Batas kirim: maksimal 3 pesan per 10 menit per `ip_hash`. */
export const NGL_RATE_LIMIT = { limit: 3, windowMs: 10 * 60 * 1000 } as const;

/** Jumlah pelapor berbeda sebelum pesan otomatis disembunyikan. */
export const NGL_REPORT_AUTOHIDE_THRESHOLD = 3;

/** Panjang maksimal catatan pada laporan. */
export const NGL_REPORT_NOTE_MAX = 200;

/** Alasan laporan yang diizinkan (label di frontend). */
export const NGL_REPORT_REASONS = ['bullying', 'sara', 'spam', 'inappropriate', 'other'] as const;
export type NglReportReason = (typeof NGL_REPORT_REASONS)[number];

/**
 * Filter kata kasar sederhana. Pesan yang cocok tetap disimpan tetapi
 * ditandai `is_hidden = true` agar ditinjau admin lebih dulu.
 */
export const NGL_PROFANITY: readonly string[] = [
  'anjing',
  'anjir',
  'bangsat',
  'bajingan',
  'brengsek',
  'kontol',
  'memek',
  'ngentot',
  'ngehe',
  'pepek',
  'tolol',
  'goblok',
  'idiot',
  'kampret',
  'keparat',
  'pantek',
  'fuck',
  'shit',
  'bitch',
  'bastard',
  'asshole',
  'dick',
  'pussy',
  'cunt',
];

/** Normalisasi untuk pencocokan kasar: huruf kecil, tanpa pemisah non-alfanumerik. */
function normalizeForFilter(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/(.)\1{2,}/g, '$1$1')
    .trim();
}

/** Apakah teks memuat salah satu kata terlarang. */
export function containsProfanity(value: string): boolean {
  if (!value) return false;
  const normalized = ` ${normalizeForFilter(value)} `;
  return NGL_PROFANITY.some((word) => normalized.includes(` ${word} `));
}

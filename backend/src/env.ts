import { z } from 'zod';

/**
 * Durasi dalam detik dari format ringkas (30s, 15m, 12h, 7d).
 */
function parseDuration(input: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(input.trim());
  if (!match) {
    throw new Error(
      `JWT_EXPIRES_IN tidak valid: "${input}". Gunakan format misal 30s, 15m, 12h, 7d.`,
    );
  }
  const [, value = '0', unit = 's'] = match;
  const amount = Number(value);
  const multiplier: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  const seconds = amount * (multiplier[unit] ?? 1);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error(`JWT_EXPIRES_IN harus bernilai positif: "${input}".`);
  }
  return seconds;
}

const booleanish = z
  .string()
  .transform((value) => ['1', 'true', 'yes', 'on'].includes(value.toLowerCase()));

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(8787),

    DATABASE_URL: z.string().min(1, 'DATABASE_URL wajib diisi'),
    DATABASE_SSL: booleanish.default('false'),

    JWT_SECRET: z
      .string()
      .min(32, 'JWT_SECRET minimal 32 karakter. Generate dengan: openssl rand -base64 48'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    COOKIE_NAME: z.string().min(1).default('pk_session'),

    CORS_ORIGIN: z.string().default('http://localhost:5173'),

    UPLOAD_DIR: z.string().min(1).default('uploads'),
    PUBLIC_URL: z.string().url().default('http://localhost:8787'),
    MAX_UPLOAD_SIZE_MB: z.coerce.number().positive().max(20).default(2),

    ADMIN_NAME: z.string().min(2).default('Admin Kelas'),
    ADMIN_EMAIL: z.string().email().default('admin@portofolio.test'),
    ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD minimal 8 karakter').default('Admin12345'),
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV === 'production' && value.JWT_SECRET.includes('ganti-dengan')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET bawaan dari .env.example tidak boleh dipakai di production.',
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || 'ENV'}: ${issue.message}`)
    .join('\n');
  console.error(
    `\n[env] Konfigurasi .env tidak valid:\n${details}\n\n` +
      'Salin backend/.env.example menjadi backend/.env lalu lengkapi.\n',
  );
  throw new Error('Konfigurasi environment tidak valid');
}

const raw = parsed.data;

export const env = {
  ...raw,
  isProduction: raw.NODE_ENV === 'production',
  isDevelopment: raw.NODE_ENV === 'development',
  corsOrigins: raw.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  maxUploadBytes: Math.round(raw.MAX_UPLOAD_SIZE_MB * 1024 * 1024),
  sessionMaxAge: parseDuration(raw.JWT_EXPIRES_IN),
} as const;

export type Env = typeof env;

import { z } from 'zod';

import { getBindings } from './runtime.js';

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

    // Opsional bila memakai binding Hyperdrive (produksi Workers).
    DATABASE_URL: z.string().min(1, 'DATABASE_URL wajib diisi').optional(),
    DATABASE_SSL: booleanish.default('false'),

    JWT_SECRET: z
      .string()
      .min(32, 'JWT_SECRET minimal 32 karakter. Generate dengan: openssl rand -base64 48'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    COOKIE_NAME: z.string().min(1).default('craftly_session'),

    CORS_ORIGIN: z.string().default('http://localhost:5173'),

    UPLOAD_DIR: z.string().min(1).default('uploads'),
    PUBLIC_URL: z.string().url().default('http://localhost:8787'),
    MAX_UPLOAD_SIZE_MB: z.coerce.number().positive().max(20).default(2),

    ADMIN_NAME: z.string().min(2).default('Admin Craftly'),
    ADMIN_EMAIL: z.string().email().default('admin@craftly.test'),
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

export type Env = {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  DATABASE_URL?: string | undefined;
  DATABASE_SSL: boolean;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  COOKIE_NAME: string;
  CORS_ORIGIN: string;
  UPLOAD_DIR: string;
  PUBLIC_URL: string;
  MAX_UPLOAD_SIZE_MB: number;
  ADMIN_NAME: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  isProduction: boolean;
  isDevelopment: boolean;
  corsOrigins: string[];
  maxUploadBytes: number;
  sessionMaxAge: number;
};

let cached: Env | null = null;
let cachedSource: unknown = null;

function readSource(): Record<string, unknown> {
  const bindings = getBindings();
  if (bindings) return bindings;
  return process.env as Record<string, unknown>;
}

function resolveEnv(): Env {
  const source = readSource();
  if (cached && cachedSource === source) return cached;

  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || 'ENV'}: ${issue.message}`)
      .join('\n');
    console.error(
      `\n[env] Konfigurasi environment tidak valid:\n${details}\n\n` +
        'Lokal: salin backend/.env.example menjadi backend/.env lalu lengkapi.\n' +
        'Deploy: atur vars di wrangler.jsonc dan secret via `wrangler secret put`.\n',
    );
    throw new Error('Konfigurasi environment tidak valid');
  }

  const raw = parsed.data;

  const resolved: Env = {
    ...raw,
    isProduction: raw.NODE_ENV === 'production',
    isDevelopment: raw.NODE_ENV === 'development',
    corsOrigins: raw.CORS_ORIGIN.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    maxUploadBytes: Math.round(raw.MAX_UPLOAD_SIZE_MB * 1024 * 1024),
    sessionMaxAge: parseDuration(raw.JWT_EXPIRES_IN),
  };
  cached = resolved;
  cachedSource = source;
  return resolved;
}

/**
 * Proxy lazy: resolusi environment ditunda sampai akses pertama, sehingga
 * binding runtime Workers (`c.env`) sudah tersedia saat nilainya dibutuhkan.
 */
export const env = new Proxy({} as Env, {
  get(_target, property) {
    return resolveEnv()[property as keyof Env];
  },
  has(_target, property) {
    return property in resolveEnv();
  },
  ownKeys() {
    return Reflect.ownKeys(resolveEnv());
  },
  getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  },
});

export function getEnv(): Env {
  return resolveEnv();
}

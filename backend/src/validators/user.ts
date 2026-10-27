import { z } from 'zod';

import { passwordSchema } from './auth.js';

const nullableText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} maksimal ${max} karakter`)
    .transform((value) => (value.length === 0 ? null : value))
    .nullable();

const urlField = z
  .string()
  .trim()
  .max(255, 'Tautan terlalu panjang')
  .refine(
    (value) => value.length === 0 || /^https?:\/\/[^\s]+$/i.test(value),
    'Tautan harus diawali http:// atau https://',
  )
  .transform((value) => (value.length === 0 ? null : value))
  .nullable();

const spotifyUrlField = z
  .string()
  .trim()
  .max(255, 'Tautan terlalu panjang')
  .refine(
    (value) =>
      value.length === 0 ||
      (/^https:\/\/open\.spotify\.com\//i.test(value) &&
        /\/(track|playlist|album|artist|episode|show)\//i.test(value)),
    'URL harus tautan Spotify (lagu, playlist, album, atau artis)',
  )
  .transform((value) => (value.length === 0 ? null : value))
  .nullable();

const themePresets = [
  'editorial',
  'midnight',
  'forest',
  'burgundy',
  'mono',
  'ocean',
  'sunset',
  'sakura',
] as const;

const hexColor = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Warna harus format hex #rrggbb');

const themeSchema = z
  .object({
    preset: z.enum(themePresets),
    accent: hexColor.optional(),
    bg: hexColor.optional(),
    surface: hexColor.optional(),
    fg: hexColor.optional(),
  })
  .strict();

/** Buang konstruksi berbahaya dari HTML/CSS kustom anggota (sandbox, tanpa JS). */
function sanitizeCustomHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*>/gi, '')
    .replace(/<\s*\/?\s*(iframe|object|embed|link|meta|base|form|template)[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/@import[^;]*;?/gi, '')
    .replace(/\bexpression\s*\(/gi, '')
    .replace(/javascript:/gi, '');
}

const htmlField = (label: string) =>
  z
    .string()
    .trim()
    .max(12000, `${label} maksimal 12000 karakter`)
    .nullable()
    .transform((value) => {
      if (!value) return null;
      const cleaned = sanitizeCustomHtml(value).trim();
      return cleaned.length === 0 ? null : cleaned;
    });

const cardHtmlField = htmlField('Kode HTML kartu');

const profileFields = {
  name: z.string().trim().min(3, 'Nama minimal 3 karakter').max(80).optional(),
  alias: nullableText(40, 'Alias').optional(),
  nim: z.string().trim().max(20, 'NIS maksimal 20 karakter').optional().nullable(),
  spotifyUrl: spotifyUrlField.optional(),
  headline: nullableText(120, 'Headline').optional(),
  bio: nullableText(1500, 'Bio').optional(),
  githubUrl: urlField.optional(),
  linkedinUrl: urlField.optional(),
  instagramUrl: urlField.optional(),
  websiteUrl: urlField.optional(),
  cvUrl: urlField.optional(),
  theme: themeSchema.nullable().optional(),
  cardHtml: cardHtmlField.optional(),
};

export const updateProfileSchema = z
  .object(profileFields)
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Tidak ada perubahan yang dikirim');

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const roleEnum = z.enum(['member', 'admin']);

export const adminUpdateUserSchema = z
  .object({ ...profileFields, role: roleEnum.optional() })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Tidak ada perubahan yang dikirim');

export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;

export const updateEmailSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Format email tidak valid').max(160),
    password: z.string().min(1, 'Password wajib diisi').max(128),
  })
  .strict();

export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password saat ini wajib diisi').max(128),
    newPassword: passwordSchema,
  })
  .strict()
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: 'Password baru harus berbeda dari password lama',
    path: ['newPassword'],
  });

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

export const memberQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(80).optional(),
});

export type MemberQuery = z.infer<typeof memberQuerySchema>;

export const adminUserQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(80).optional(),
});

export type AdminUserQuery = z.infer<typeof adminUserQuerySchema>;

import { z } from 'zod';

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

const profileFields = {
  name: z.string().trim().min(3, 'Nama minimal 3 karakter').max(80).optional(),
  alias: nullableText(40, 'Alias').optional(),
  spotifyUrl: spotifyUrlField.optional(),
  headline: nullableText(120, 'Headline').optional(),
  bio: nullableText(1500, 'Bio').optional(),
  githubUrl: urlField.optional(),
  linkedinUrl: urlField.optional(),
  instagramUrl: urlField.optional(),
  websiteUrl: urlField.optional(),
  cvUrl: urlField.optional(),
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

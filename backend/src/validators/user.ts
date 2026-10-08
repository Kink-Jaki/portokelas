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

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(3, 'Nama minimal 3 karakter').max(80).optional(),
    headline: nullableText(120, 'Headline').optional(),
    bio: nullableText(1500, 'Bio').optional(),
    githubUrl: urlField.optional(),
    linkedinUrl: urlField.optional(),
    instagramUrl: urlField.optional(),
    websiteUrl: urlField.optional(),
    cvUrl: urlField.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Tidak ada perubahan yang dikirim');

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

export const memberQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(80).optional(),
});

export type MemberQuery = z.infer<typeof memberQuerySchema>;

export const statusEnum = z.enum(['pending', 'approved', 'rejected', 'suspended']);

export const adminUserQuerySchema = paginationSchema.extend({
  status: statusEnum.optional(),
  search: z.string().trim().max(80).optional(),
});

export type AdminUserQuery = z.infer<typeof adminUserQuerySchema>;

export const updateUserStatusSchema = z
  .object({
    status: statusEnum,
    reason: z.string().trim().max(300, 'Alasan maksimal 300 karakter').optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.status === 'rejected' && !value.reason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reason'],
        message: 'Alasan wajib diisi saat menolak pendaftaran',
      });
    }
  });

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;

export const roleEnum = z.enum(['member', 'admin']);

export const updateUserRoleSchema = z
  .object({
    role: roleEnum,
  })
  .strict();

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

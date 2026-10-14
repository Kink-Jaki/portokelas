import { z } from 'zod';

import { normalizeStoredImage } from '../services/upload.service.js';

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

/**
 * Gambar harus berasal dari storage server. Menerima path relatif
 * (`/uploads/...`) maupun URL absolut dari endpoint yang sama, lalu
 * disimpan sebagai path relatif.
 */
const storedImageField = z
  .string()
  .trim()
  .max(300)
  .refine(
    (value) => value.length === 0 || normalizeStoredImage(value) !== null,
    'Gambar harus berasal dari storage server (unggah lewat form project).',
  )
  .transform((value) => (value.length === 0 ? null : normalizeStoredImage(value)))
  .nullable();

export const createProjectSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'Judul minimal 3 karakter')
      .max(120, 'Judul maksimal 120 karakter'),
    shortDescription: nullableText(240, 'Deskripsi singkat').optional(),
    description: nullableText(20_000, 'Deskripsi').optional(),
    techStack: z
      .array(z.string().trim().min(1).max(30))
      .max(20, 'Maksimal 20 teknologi')
      .default([]),
    demoUrl: urlField.optional(),
    repoUrl: urlField.optional(),
    coverImageUrl: storedImageField.optional(),
    collaboratorIds: z
      .array(z.string().uuid('ID kolaborator tidak valid'))
      .max(20, 'Maksimal 20 kolaborator')
      .default([]),
  })
  .strict();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z
  .object({
    title: z.string().trim().min(3, 'Judul minimal 3 karakter').max(120).optional(),
    shortDescription: nullableText(240, 'Deskripsi singkat').optional(),
    description: nullableText(20_000, 'Deskripsi').optional(),
    techStack: z.array(z.string().trim().min(1).max(30)).max(20).optional(),
    demoUrl: urlField.optional(),
    repoUrl: urlField.optional(),
    coverImageUrl: storedImageField.optional(),
    collaboratorIds: z
      .array(z.string().uuid('ID kolaborator tidak valid'))
      .max(20, 'Maksimal 20 kolaborator')
      .optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Tidak ada perubahan yang dikirim');

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const projectImagesSchema = z.object({
  images: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(300)
        .refine(
          (value) => normalizeStoredImage(value)?.startsWith('/uploads/projects/') === true,
          'Gambar tidak valid',
        )
        .transform((value) => normalizeStoredImage(value)!),
    )
    .min(1, 'Minimal satu gambar')
    .max(10, 'Maksimal 10 gambar per unggahan'),
});

export type ProjectImagesInput = z.infer<typeof projectImagesSchema>;

export const adminProjectQuerySchema = z.object({
  search: z.string().trim().max(80).optional(),
  hidden: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

export type AdminProjectQuery = z.infer<typeof adminProjectQuerySchema>;

export const hideProjectSchema = z
  .object({
    isHidden: z.boolean({ required_error: 'isHidden wajib diisi' }),
  })
  .strict();

export type HideProjectInput = z.infer<typeof hideProjectSchema>;

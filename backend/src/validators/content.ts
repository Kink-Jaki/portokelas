import { z } from 'zod';

/** Nilai dari multipart form selalu berupa string. */
const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} maksimal ${max} karakter`)
    .transform((value) => (value.length === 0 ? null : value));

export const aboutFormSchema = z.object({
  title: optionalText(120, 'Judul')
    .optional()
    .transform((value) => value ?? null),
  description: z
    .string({ required_error: 'Deskripsi wajib diisi' })
    .trim()
    .min(1, 'Deskripsi wajib diisi')
    .max(2000, 'Deskripsi maksimal 2000 karakter'),
});

export type AboutFormInput = z.infer<typeof aboutFormSchema>;

export const teacherFormSchema = z.object({
  name: z
    .string({ required_error: 'Nama wajib diisi' })
    .trim()
    .min(1, 'Nama wajib diisi')
    .max(120, 'Nama maksimal 120 karakter'),
  description: z
    .string({ required_error: 'Deskripsi wajib diisi' })
    .trim()
    .min(1, 'Deskripsi wajib diisi')
    .max(1000, 'Deskripsi maksimal 1000 karakter'),
  sortOrder: z.coerce.number().int().min(0, 'Urutan tidak valid').max(999).default(0),
});

export type TeacherFormInput = z.infer<typeof teacherFormSchema>;

export const teacherUpdateFormSchema = teacherFormSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'Tidak ada perubahan yang dikirim');

export type TeacherUpdateInput = z.infer<typeof teacherUpdateFormSchema>;

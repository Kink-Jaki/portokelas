import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .max(128, 'Password terlalu panjang')
  .regex(/[A-Za-z]/, 'Password harus mengandung minimal satu huruf')
  .regex(/[0-9]/, 'Password harus mengandung minimal satu angka');

export const loginSchema = z.object({
  identity: z.string().trim().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, 'Nama lengkap minimal 3 karakter')
      .max(80, 'Nama terlalu panjang'),
    email: z.string().trim().min(1, 'Email wajib diisi').email('Format email tidak valid'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Konfirmasi password tidak sama',
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(3, 'Nama minimal 3 karakter').max(80, 'Nama terlalu panjang'),
  headline: z.string().trim().max(120, 'Headline maksimal 120 karakter'),
  bio: z.string().trim().max(1500, 'Bio maksimal 1500 karakter'),
  githubUrl: z.string().trim().url('Tautan tidak valid').or(z.literal('')),
  linkedinUrl: z.string().trim().url('Tautan tidak valid').or(z.literal('')),
  instagramUrl: z.string().trim().url('Tautan tidak valid').or(z.literal('')),
  websiteUrl: z.string().trim().url('Tautan tidak valid').or(z.literal('')),
  cvUrl: z.string().trim().url('Tautan tidak valid').or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const projectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Judul minimal 3 karakter')
    .max(120, 'Judul maksimal 120 karakter'),
  shortDescription: z.string().trim().max(240, 'Deskripsi singkat maksimal 240 karakter'),
  description: z.string().trim().max(20000, 'Deskripsi terlalu panjang'),
  demoUrl: z.string().trim().url('Tautan demo tidak valid').or(z.literal('')),
  repoUrl: z.string().trim().url('Tautan repositori tidak valid').or(z.literal('')),
  techStack: z
    .string()
    .max(400, 'Daftar teknologi terlalu panjang')
    .refine(
      (value) =>
        value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean).length <= 20,
      'Maksimal 20 teknologi',
    ),
});

/** Pisahkan input tech stack (dipisah koma) menjadi array tag. */
export function parseTechStack(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export type ProjectFormValues = z.infer<typeof projectSchema>;

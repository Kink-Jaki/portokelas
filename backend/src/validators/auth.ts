import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .max(128, 'Password terlalu panjang')
  .regex(/[A-Za-z]/, 'Password harus mengandung minimal satu huruf');

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, 'Nama lengkap minimal 3 karakter')
      .max(80, 'Nama terlalu panjang'),
    email: z.string().trim().toLowerCase().email('Format email tidak valid').max(160),
    password: passwordSchema,
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z
  .object({
    identity: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, 'NIS atau email wajib diisi')
      .max(160, 'Input terlalu panjang'),
    password: z.string().min(1, 'Password wajib diisi').max(128),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;

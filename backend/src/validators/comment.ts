import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Komentar tidak boleh kosong.').max(2000, 'Komentar terlalu panjang (maksimal 2000 karakter).'),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Komentar tidak boleh kosong.').max(2000, 'Komentar terlalu panjang (maksimal 2000 karakter).'),
});

export const commentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CommentQuery = z.infer<typeof commentQuerySchema>;
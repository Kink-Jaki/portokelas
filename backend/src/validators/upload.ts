import { z } from 'zod';

import { memoryCaption } from './memory.js';

export const VIDEO_CONTENT_TYPES = ['video/mp4', 'video/webm'] as const;

export type VideoContentType = (typeof VIDEO_CONTENT_TYPES)[number];

/** Hanya dua format video yang diizinkan untuk kenangan. */
export const videoContentTypeSchema = z.enum(VIDEO_CONTENT_TYPES, {
  errorMap: () => ({ message: 'Format video harus MP4 atau WEBM.' }),
});

export const videoUploadUrlSchema = z.object({
  contentType: videoContentTypeSchema,
});

export type VideoUploadUrlInput = z.infer<typeof videoUploadUrlSchema>;

export const saveVideoUrlSchema = z.object({
  videoUrl: z.string().trim().url('URL video tidak valid.'),
  caption: memoryCaption,
});

export type SaveVideoUrlInput = z.infer<typeof saveVideoUrlSchema>;

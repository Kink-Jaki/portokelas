import { z } from 'zod';

export const memoryCaption = z
  .string()
  .trim()
  .max(280, 'Caption maksimal 280 karakter')
  .optional();

export type MemoryCaptionInput = z.infer<typeof memoryCaption>;

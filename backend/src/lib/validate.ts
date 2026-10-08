import { zValidator } from '@hono/zod-validator';
import type { Context } from 'hono';
import type { ZodSchema, ZodError } from 'zod';

import { AppError } from '../lib/errors.js';

/**
 * Hook validasi yang seragam: error dilempar sebagai AppError sehingga
 * response memakai envelope `{ success, data, error }` dengan status 422.
 */
const validationHook = <T extends ZodSchema>(
  result: { success: true; data: T } | { success: false; error: ZodError },
  _c: Context,
): void => {
  if (!result.success) {
    throw AppError.unprocessable(
      'Data tidak lolos validasi.',
      result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    );
  }
};

export const zJson = <T extends ZodSchema>(schema: T) => zValidator('json', schema, validationHook);
export const zQuery = <T extends ZodSchema>(schema: T) =>
  zValidator('query', schema, validationHook);

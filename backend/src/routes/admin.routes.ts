import { Hono, type Context } from 'hono';
import { eq } from 'drizzle-orm';
import type { ZodTypeAny } from 'zod';

import { db } from '../db/index.js';
import { projectImages, teachers, users } from '../db/schema.js';
import { AppError } from '../lib/errors.js';
import { ok, requireParam } from '../lib/http.js';
import { zJson, zQuery } from '../lib/validate.js';
import { getCurrentUser, requireAdmin, requireAuth, type AppEnv } from '../middleware/auth.js';
import {
  createTeacher,
  deleteMemoryAsAdmin,
  deleteProjectAsAdmin,
  deleteStoredFile,
  deleteTeacher,
  getAbout,
  getProjectAuthor,
  listAllProjects,
  listMemoriesForAdmin,
  listTeachers,
  listUsersForAdmin,
  saveImage,
  setProjectHidden,
  updateProfile,
  updateTeacher,
  upsertAbout,
} from '../services/index.js';
import { aboutFormSchema, teacherFormSchema, teacherUpdateFormSchema } from '../validators/content.js';
import { adminProjectQuerySchema, hideProjectSchema } from '../validators/project.js';
import { adminUpdateUserSchema, adminUserQuerySchema } from '../validators/user.js';

type FormValues = Record<string, string | File | (string | File)[]>;

function formText(form: FormValues, field: string): string | undefined {
  const value = form[field];
  const candidate = Array.isArray(value) ? value[0] : value;
  return typeof candidate === 'string' ? candidate : undefined;
}

function formFile(form: FormValues, fields: string[]): File | null {
  for (const field of fields) {
    const value = form[field];
    const candidate = Array.isArray(value) ? value[0] : value;
    if (candidate instanceof File && candidate.size > 0) return candidate;
  }
  return null;
}

function parseForm<S extends ZodTypeAny>(schema: S, raw: unknown): S['_output'] {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw AppError.unprocessable(
      'Data tidak lolos validasi.',
      result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    );
  }
  return result.data;
}

/** Terima multipart (untuk unggah foto) maupun JSON biasa. */
async function readForm(c: Context): Promise<FormValues> {
  const contentType = c.req.header('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const body = await c.req.json<Record<string, unknown>>();
    const form: FormValues = {};
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') form[key] = value;
    }
    return form;
  }
  return (await c.req.parseBody({ all: true })) as FormValues;
}

/** Endpoint khusus admin. */
export const adminRoutes = new Hono<AppEnv>()
  .use('*', requireAuth, requireAdmin)

  .get('/users', zQuery(adminUserQuerySchema), async (c) => {
    const result = await listUsersForAdmin(c.req.valid('query'));
    return c.json(ok(result));
  })

  .patch('/users/:id', zJson(adminUpdateUserSchema), async (c) => {
    const admin = getCurrentUser(c);
    const targetId = requireParam(c.req.param('id'), 'id');
    const input = c.req.valid('json');

    if (targetId === admin.id && input.role && input.role !== admin.role) {
      throw AppError.badRequest('Anda tidak dapat mengubah role akun sendiri.');
    }

    const patch: Partial<typeof users.$inferInsert> = { ...input };

    const updated = await updateProfile(targetId, patch);
    if (!updated) throw AppError.notFound('Kreator tidak ditemukan');

    return c.json(ok({ user: updated }));
  })

  .get('/projects', zQuery(adminProjectQuerySchema), async (c) => {
    const result = await listAllProjects(c.req.valid('query'));
    const withAuthor = await Promise.all(
      result.items.map(async (project) => ({
        ...project,
        author: await getProjectAuthor(project.id),
      })),
    );
    return c.json(ok({ ...result, items: withAuthor }));
  })

  .patch('/projects/:id/hide', zJson(hideProjectSchema), async (c) => {
    const project = await setProjectHidden(
      requireParam(c.req.param('id'), 'id'),
      c.req.valid('json').isHidden,
    );
    return c.json(ok({ project }));
  })

  .delete('/projects/:id', async (c) => {
    const projectId = c.req.param('id');

    const images = await db
      .select({ imageUrl: projectImages.imageUrl })
      .from(projectImages)
      .where(eq(projectImages.projectId, projectId));

    const project = await deleteProjectAsAdmin(projectId);

    await deleteStoredFile(project.coverImageUrl);
    for (const image of images) await deleteStoredFile(image.imageUrl);

    return c.json(ok({ id: project.id, deleted: true }));
  })

  /* --------------------------------- Kenangan --------------------------------- */

  .get('/memories', async (c) => {
    const result = await listMemoriesForAdmin();
    return c.json(ok({ memories: result }));
  })

  .delete('/memories/:id', async (c) => {
    const memoryId = c.req.param('id');
    const removed = await deleteMemoryAsAdmin(memoryId);
    await deleteStoredFile(removed.imageUrl);
    return c.json(ok({ id: removed.id, deleted: true }));
  })

  /* ------------------------------ Konten landing ------------------------------ */

  .get('/content', async (c) => {
    const [about, teacherList] = await Promise.all([getAbout(), listTeachers()]);
    return c.json(ok({ about, teachers: teacherList }));
  })

  .patch('/about', async (c) => {
    const form = await readForm(c);
    const input = parseForm(aboutFormSchema, {
      title: formText(form, 'title'),
      description: formText(form, 'description'),
    });

    const file = formFile(form, ['image', 'photo', 'file']);
    const removeImage = formText(form, 'removeImage') === 'true';

    const previous = await getAbout();
    let imageUrl: string | null | undefined;
    if (file) imageUrl = await saveImage(file, 'content');
    else if (removeImage) imageUrl = null;

    const about = await upsertAbout({
      title: input.title ?? null,
      description: input.description,
      ...(imageUrl === undefined ? {} : { imageUrl }),
    });

    if (previous?.imageUrl && imageUrl !== undefined && previous.imageUrl !== imageUrl) {
      await deleteStoredFile(previous.imageUrl);
    }

    return c.json(ok({ about }));
  })

  .get('/teachers', async (c) => {
    return c.json(ok({ teachers: await listTeachers() }));
  })

  .post('/teachers', async (c) => {
    const form = await readForm(c);
    const input = parseForm(teacherFormSchema, {
      name: formText(form, 'name'),
      description: formText(form, 'description'),
      sortOrder: formText(form, 'sortOrder'),
    });

    const file = formFile(form, ['photo', 'file', 'image']);
    const photoUrl = file ? await saveImage(file, 'content') : null;

    try {
      const teacher = await createTeacher({ ...input, photoUrl });
      return c.json(ok({ teacher }), 201);
    } catch (error) {
      if (photoUrl) await deleteStoredFile(photoUrl);
      throw error;
    }
  })

  .patch('/teachers/:id', async (c) => {
    const teacherId = requireParam(c.req.param('id'), 'id');
    const form = await readForm(c);

    const raw: Record<string, unknown> = {};
    const name = formText(form, 'name');
    const description = formText(form, 'description');
    const sortOrder = formText(form, 'sortOrder');
    if (name !== undefined) raw.name = name;
    if (description !== undefined) raw.description = description;
    if (sortOrder !== undefined) raw.sortOrder = sortOrder;

    const input = parseForm(teacherUpdateFormSchema, raw);

    const existing = await db
      .select({ photoUrl: teachers.photoUrl })
      .from(teachers)
      .where(eq(teachers.id, teacherId))
      .limit(1);
    const current = existing[0];
    if (!current) throw AppError.notFound('Mentor tidak ditemukan');

    const file = formFile(form, ['photo', 'file', 'image']);
    const removePhoto = formText(form, 'removePhoto') === 'true';

    let photoUrl: string | null | undefined;
    if (file) photoUrl = await saveImage(file, 'content');
    else if (removePhoto) photoUrl = null;

    const teacher = await updateTeacher(teacherId, {
      ...input,
      ...(photoUrl === undefined ? {} : { photoUrl }),
    });

    if (current.photoUrl && photoUrl !== undefined && current.photoUrl !== photoUrl) {
      await deleteStoredFile(current.photoUrl);
    }

    return c.json(ok({ teacher }));
  })

  .delete('/teachers/:id', async (c) => {
    const teacherId = requireParam(c.req.param('id'), 'id');

    const existing = await db
      .select({ photoUrl: teachers.photoUrl })
      .from(teachers)
      .where(eq(teachers.id, teacherId))
      .limit(1);
    if (existing.length === 0) throw AppError.notFound('Mentor tidak ditemukan');

    const removed = await deleteTeacher(teacherId);
    await deleteStoredFile(existing[0]?.photoUrl ?? null);

    return c.json(ok({ id: removed.id, deleted: true }));
  });

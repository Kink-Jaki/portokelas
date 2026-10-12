import { Hono } from 'hono';
import { and, eq } from 'drizzle-orm';

import { db } from '../db/index.js';
import { projectImages, projects } from '../db/schema.js';
import { AppError } from '../lib/errors.js';
import { ok, requireParam } from '../lib/http.js';
import { zJson } from '../lib/validate.js';
import { getCurrentUser, requireAuth, type AppEnv } from '../middleware/auth.js';
import {
  addProjectImages,
  createMemory,
  createProject,
  deleteMemoryForUser,
  deleteProjectForUser,
  deleteStoredFile,
  listMemoriesForUser,
  listProjectsByUser,
  saveImage,
  updateProfile,
  updateProjectForUser,
} from '../services/index.js';
import { createProjectSchema, updateProjectSchema } from '../validators/project.js';
import { memoryCaption } from '../validators/memory.js';
import { updateProfileSchema } from '../validators/user.js';

type FormValues = Record<string, string | File | (string | File)[]>;

function formText(form: FormValues, field: string): string | undefined {
  const value = form[field];
  const candidate = Array.isArray(value) ? value[0] : value;
  return typeof candidate === 'string' ? candidate : undefined;
}

function pickFile(form: FormValues, fields: string[]): File | null {
  for (const field of fields) {
    const value = form[field];
    const candidate = Array.isArray(value) ? value[0] : value;
    if (candidate instanceof File && candidate.size > 0) return candidate;
  }
  return null;
}

function pickFiles(form: FormValues, fields: string[]): File[] {
  const files: File[] = [];
  for (const field of fields) {
    const value = form[field];
    const candidates = Array.isArray(value) ? value : [value];
    for (const candidate of candidates) {
      if (candidate instanceof File && candidate.size > 0) files.push(candidate);
    }
  }
  return files;
}

/** Endpoint profil & project milik sendiri. Profil boleh diedit siapa pun yang sudah login. */
export const meRoutes = new Hono<AppEnv>()
  .use('*', requireAuth)

  .patch('/profile', zJson(updateProfileSchema), async (c) => {
    const user = getCurrentUser(c);
    const input = c.req.valid('json');
    const updated = await updateProfile(user.id, { ...input, name: input.name ?? user.name });
    if (!updated) throw AppError.internal('Gagal memperbarui profil');
    return c.json(ok({ user: updated }));
  })

  .post('/avatar', async (c) => {
    const user = getCurrentUser(c);
    const form = (await c.req.parseBody({ all: true })) as FormValues;
    const file = pickFile(form, ['avatar', 'file', 'photo']);

    if (!file) throw AppError.badRequest('File foto profil wajib diunggah (field "avatar").');

    const relativePath = await saveImage(file, 'avatars');
    const previous = user.avatarUrl;

    const updated = await updateProfile(user.id, { avatarUrl: relativePath });
    if (!updated) {
      await deleteStoredFile(relativePath);
      throw AppError.internal('Gagal menyimpan foto profil');
    }

    await deleteStoredFile(previous);
    return c.json(ok({ user: updated }));
  })

  .get('/memories', async (c) => {
    const user = getCurrentUser(c);
    const data = await listMemoriesForUser(user.id);
    return c.json(ok({ memories: data }));
  })

  .post('/memories', async (c) => {
    const user = getCurrentUser(c);
    const form = (await c.req.parseBody({ all: true })) as FormValues;
    const file = pickFile(form, ['image', 'file', 'photo']);
    if (!file) throw AppError.badRequest('File gambar kenangan wajib diunggah (field "image").');

    const rawCaption = formText(form, 'caption');
    const parsed = memoryCaption.safeParse(rawCaption ?? undefined);
    if (!parsed.success) {
      throw AppError.unprocessable(
        'Data tidak lolos validasi.',
        parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      );
    }
    const caption = parsed.data?.trim() ? parsed.data.trim() : null;

    const imageUrl = await saveImage(file, 'memories');
    try {
      const memory = await createMemory(user.id, imageUrl, caption);
      return c.json(ok({ memory }), 201);
    } catch (error) {
      await deleteStoredFile(imageUrl);
      throw error;
    }
  })

  .delete('/memories/:id', async (c) => {
    const user = getCurrentUser(c);
    const memoryId = c.req.param('id');
    const removed = await deleteMemoryForUser(user.id, memoryId);
    await deleteStoredFile(removed.imageUrl);
    return c.json(ok({ id: removed.id, deleted: true }));
  })

  .get('/projects', async (c) => {
    const user = getCurrentUser(c);
    const data = await listProjectsByUser(user.id);
    return c.json(ok({ projects: data }));
  })

  .post('/projects', zJson(createProjectSchema), async (c) => {
    const user = getCurrentUser(c);
    const project = await createProject(user.id, c.req.valid('json'));
    return c.json(ok({ project }), 201);
  })

  .patch('/projects/:id', zJson(updateProjectSchema), async (c) => {
    const user = getCurrentUser(c);
    const projectId = requireParam(c.req.param('id'), 'id');
    const input = c.req.valid('json');

    const existing = await db
      .select({ coverImageUrl: projects.coverImageUrl })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
      .limit(1);

    const project = await updateProjectForUser(projectId, user.id, input);

    if (input.coverImageUrl !== undefined && input.coverImageUrl !== existing[0]?.coverImageUrl) {
      await deleteStoredFile(existing[0]?.coverImageUrl ?? null);
    }

    return c.json(ok({ project }));
  })

  .delete('/projects/:id', async (c) => {
    const user = getCurrentUser(c);
    const projectId = c.req.param('id');

    const existing = await db
      .select({ coverImageUrl: projects.coverImageUrl })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
      .limit(1);

    const images = await db
      .select({ imageUrl: projectImages.imageUrl })
      .from(projectImages)
      .where(eq(projectImages.projectId, projectId));

    const project = await deleteProjectForUser(projectId, user.id);

    await deleteStoredFile(project.coverImageUrl ?? existing[0]?.coverImageUrl ?? null);
    for (const image of images) await deleteStoredFile(image.imageUrl);

    return c.json(ok({ id: project.id, deleted: true }));
  })

  .post('/projects/:id/images', async (c) => {
    const user = getCurrentUser(c);
    const projectId = c.req.param('id');

    const form = (await c.req.parseBody({ all: true })) as FormValues;
    const files = pickFiles(form, ['images', 'file', 'files']);

    if (files.length === 0) {
      throw AppError.badRequest('Tidak ada file gambar yang valid diunggah (field "images").');
    }

    const urls: string[] = [];
    for (const file of files) {
      urls.push(await saveImage(file, 'projects'));
    }

    const images = await addProjectImages(projectId, user.id, urls);
    return c.json(ok({ images }), 201);
  })

  .delete('/projects/:projectId/images/:imageId', async (c) => {
    const user = getCurrentUser(c);
    const projectId = c.req.param('projectId');
    const imageId = c.req.param('imageId');

    const owned = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
      .limit(1);
    if (owned.length === 0) throw AppError.notFound('Project tidak ditemukan');

    const rows = await db
      .delete(projectImages)
      .where(and(eq(projectImages.id, imageId), eq(projectImages.projectId, projectId)))
      .returning();

    const removed = rows[0];
    if (!removed) throw AppError.notFound('Gambar tidak ditemukan');

    await deleteStoredFile(removed.imageUrl);
    return c.json(ok({ id: removed.id, deleted: true }));
  });

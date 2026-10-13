import { asc, eq } from 'drizzle-orm';

import { db } from '../db/index.js';
import { abouts, teachers, type About, type NewTeacher, type Teacher } from '../db/schema.js';
import { AppError } from '../lib/errors.js';

/* --------------------------------- About --------------------------------- */

export async function getAbout(): Promise<About | null> {
  const rows = await db.select().from(abouts).orderBy(asc(abouts.id)).limit(1);
  return rows[0] ?? null;
}

export type AboutInput = {
  title: string | null;
  description: string;
  imageUrl?: string | null;
};

/** Simpan konten "Tentang" — hanya ada satu baris. */
export async function upsertAbout(input: AboutInput): Promise<About> {
  const existing = await getAbout();

  if (existing) {
    const rows = await db
      .update(abouts)
      .set({
        title: input.title,
        description: input.description,
        ...(input.imageUrl === undefined ? {} : { imageUrl: input.imageUrl }),
        updatedAt: new Date(),
      })
      .where(eq(abouts.id, existing.id))
      .returning();
    return rows[0]!;
  }

  const rows = await db
    .insert(abouts)
    .values({
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl ?? null,
    })
    .returning();
  return rows[0]!;
}

/* -------------------------------- Teachers -------------------------------- */

export async function listTeachers(): Promise<Teacher[]> {
  return db.select().from(teachers).orderBy(asc(teachers.sortOrder), asc(teachers.name));
}

export async function createTeacher(input: NewTeacher): Promise<Teacher> {
  const rows = await db.insert(teachers).values(input).returning();
  return rows[0]!;
}

export async function updateTeacher(id: string, input: Partial<NewTeacher>): Promise<Teacher> {
  const rows = await db
    .update(teachers)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(teachers.id, id))
    .returning();

  const updated = rows[0];
  if (!updated) throw AppError.notFound('Mentor tidak ditemukan');
  return updated;
}

export async function deleteTeacher(id: string): Promise<Teacher> {
  const rows = await db.delete(teachers).where(eq(teachers.id, id)).returning();
  const removed = rows[0];
  if (!removed) throw AppError.notFound('Mentor tidak ditemukan');
  return removed;
}

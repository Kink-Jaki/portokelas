import { and, count, desc, eq, ilike, or, type SQL } from 'drizzle-orm';

import { db } from '../db/index.js';
import {
  memberProfileColumns,
  projects,
  publicUserColumns,
  users,
  type MemberProfile,
  type PublicUser,
} from '../db/schema.js';
import { slugify } from '../lib/slug.js';
import type { MemberQuery } from '../validators/user.js';

export type Paginated<T> = {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

const toPaginated = <T>(items: T[], total: number, page: number, limit: number): Paginated<T> => ({
  items,
  meta: {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  },
});

export async function findUserById(id: string): Promise<MemberProfile | null> {
  const rows = await db.select(memberProfileColumns).from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function findUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);
  return rows[0] ?? null;
}

export async function findUserByNim(nim: string) {
  const normalized = nim.trim();
  const rows = await db.select().from(users).where(eq(users.nim, normalized)).limit(1);
  return rows[0] ?? null;
}

export async function emailTaken(email: string): Promise<boolean> {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return rows.length > 0;
}



/** Slug portofolio unik berdasarkan nama; suffix numerik bila bentrok. */
export async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || 'kreator';

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const rows = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.slug, candidate))
      .limit(1);
    if (rows.length === 0) return candidate;
  }

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function listMembers(query: MemberQuery): Promise<Paginated<PublicUser>> {
  const { search, page, limit } = query;

  const conditions: SQL[] = [];
  if (search) {
    const pattern = `%${search}%`;
    const searchCondition = or(
      ilike(users.name, pattern),
      ilike(users.headline, pattern),
      ilike(users.bio, pattern),
    );
    if (searchCondition) conditions.push(searchCondition);
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select(publicUserColumns)
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const totals = await db.select({ value: count() }).from(users).where(where);

  return toPaginated(rows, totals[0]?.value ?? 0, page, limit);
}

export async function getMemberBySlug(slug: string): Promise<PublicUser | null> {
  const rows = await db
    .select(publicUserColumns)
    .from(users)
    .where(eq(users.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getAdminProfileBySlug(slug: string): Promise<MemberProfile | null> {
  const rows = await db
    .select(memberProfileColumns)
    .from(users)
    .where(eq(users.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function listUsersForAdmin(query: {
  search?: string;
  page: number;
  limit: number;
}): Promise<Paginated<MemberProfile>> {
  const { search, page, limit } = query;

  const conditions: SQL[] = [];
  if (search) {
    const pattern = `%${search}%`;
    const searchCondition = or(
      ilike(users.name, pattern),
      ilike(users.email, pattern),
      ilike(users.nim, pattern),
    );
    if (searchCondition) conditions.push(searchCondition);
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select(memberProfileColumns)
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const totals = await db.select({ value: count() }).from(users).where(where);

  return toPaginated(rows, totals[0]?.value ?? 0, page, limit);
}

export async function updateProfile(userId: string, data: Partial<typeof users.$inferInsert>) {
  const rows = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning(memberProfileColumns);
  return rows[0] ?? null;
}

export async function getPublicStats(): Promise<{ members: number; projects: number }> {
  const [memberTotals, projectTotals] = await Promise.all([
    db.select({ value: count() }).from(users),
    db
      .select({ value: count() })
      .from(projects)
      .innerJoin(users, eq(projects.userId, users.id))
      .where(eq(projects.isHidden, false)),
  ]);

  return {
    members: memberTotals[0]?.value ?? 0,
    projects: projectTotals[0]?.value ?? 0,
  };
}

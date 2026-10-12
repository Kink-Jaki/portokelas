import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { memories, users, type Memory } from '../db/schema.js';
import { AppError } from '../lib/errors.js';

export type MemoryWithAuthor = Memory & {
  author: {
    id: string;
    name: string;
    alias: string | null;
    slug: string;
    avatarUrl: string | null;
    role: 'member' | 'admin';
  } | null;
};

const authorColumns = {
  id: users.id,
  name: users.name,
  alias: users.alias,
  slug: users.slug,
  avatarUrl: users.avatarUrl,
  role: users.role,
};

export async function listMemoriesForUser(userId: string): Promise<Memory[]> {
  return db
    .select()
    .from(memories)
    .where(eq(memories.userId, userId))
    .orderBy(desc(memories.createdAt));
}

export async function createMemory(userId: string, imageUrl: string, caption: string | null): Promise<Memory> {
  const rows = await db.insert(memories).values({ userId, imageUrl, caption }).returning();
  const memory = rows[0];
  if (!memory) throw AppError.internal('Gagal menyimpan kenangan');
  return memory;
}

export async function deleteMemoryForUser(userId: string, memoryId: string): Promise<Memory> {
  const rows = await db
    .delete(memories)
    .where(and(eq(memories.id, memoryId), eq(memories.userId, userId)))
    .returning();
  const removed = rows[0];
  if (!removed) throw AppError.notFound('Kenangan tidak ditemukan');
  return removed;
}

export async function deleteMemoryAsAdmin(memoryId: string): Promise<Memory> {
  const rows = await db.delete(memories).where(eq(memories.id, memoryId)).returning();
  const removed = rows[0];
  if (!removed) throw AppError.notFound('Kenangan tidak ditemukan');
  return removed;
}

export async function listMemoriesRandom(limit = 16): Promise<MemoryWithAuthor[]> {
  const rows = await db
    .select({ memory: memories, author: authorColumns })
    .from(memories)
    .innerJoin(users, eq(memories.userId, users.id))
    .orderBy(sql`random()`)
    .limit(limit);
  return rows.map((row) => ({ ...row.memory, author: row.author }));
}

export async function listMemoriesForAdmin(limit = 100): Promise<MemoryWithAuthor[]> {
  const rows = await db
    .select({ memory: memories, author: authorColumns })
    .from(memories)
    .innerJoin(users, eq(memories.userId, users.id))
    .orderBy(desc(memories.createdAt))
    .limit(limit);
  return rows.map((row) => ({ ...row.memory, author: row.author }));
}

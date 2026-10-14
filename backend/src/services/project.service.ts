import { and, asc, count, desc, eq, ilike, inArray, ne, or, type SQL } from 'drizzle-orm';

import { db } from '../db/index.js';
import {
  projectCollaborators,
  projectImages,
  projects,
  users,
  type Project,
  type ProjectImage,
  type UserRole,
} from '../db/schema.js';
import { AppError } from '../lib/errors.js';
import { slugify } from '../lib/slug.js';
import type {
  AdminProjectQuery,
  CreateProjectInput,
  UpdateProjectInput,
} from '../validators/project.js';
import type { Paginated } from './user.service.js';

/** Ringkasan kreator yang ikut mengerjakan project (tanpa kredensial). */
export type CollaboratorUser = {
  id: string;
  name: string;
  alias: string | null;
  slug: string;
  avatarUrl: string | null;
  headline: string | null;
  role: UserRole;
};

const collaboratorColumns = {
  id: users.id,
  name: users.name,
  alias: users.alias,
  slug: users.slug,
  avatarUrl: users.avatarUrl,
  headline: users.headline,
  role: users.role,
};

export type ProjectWithImages = Project & {
  images: ProjectImage[];
  collaborators: CollaboratorUser[];
};

function groupImages(rows: ProjectImage[]): Map<string, ProjectImage[]> {
  const grouped = new Map<string, ProjectImage[]>();
  for (const image of rows) {
    const list = grouped.get(image.projectId);
    if (list) list.push(image);
    else grouped.set(image.projectId, [image]);
  }
  return grouped;
}

async function groupCollaborators(rows: Project[]): Promise<Map<string, CollaboratorUser[]>> {
  if (rows.length === 0) return new Map();

  const records = await db
    .select({ projectId: projectCollaborators.projectId, user: collaboratorColumns })
    .from(projectCollaborators)
    .innerJoin(users, eq(projectCollaborators.userId, users.id))
    .where(inArray(projectCollaborators.projectId, rows.map((row) => row.id)))
    .orderBy(asc(projectCollaborators.createdAt));

  const grouped = new Map<string, CollaboratorUser[]>();
  for (const record of records) {
    const list = grouped.get(record.projectId);
    if (list) list.push(record.user);
    else grouped.set(record.projectId, [record.user]);
  }
  return grouped;
}

/** Lampirkan gambar galeri + daftar kolaborator ke tiap project. */
export async function hydrateProjects(rows: Project[]): Promise<ProjectWithImages[]> {
  if (rows.length === 0) return [];

  const projectIds = rows.map((row) => row.id);
  const [images, collaborators] = await Promise.all([
    db
      .select()
      .from(projectImages)
      .where(inArray(projectImages.projectId, projectIds))
      .orderBy(asc(projectImages.sortOrder)),
    groupCollaborators(rows),
  ]);

  const imagesByProject = groupImages(images);

  return rows.map((row) => ({
    ...row,
    images: imagesByProject.get(row.id) ?? [],
    collaborators: collaborators.get(row.id) ?? [],
  }));
}

/** Buang duplikat, pemilik sendiri, dan id yang bukan user valid. */
async function sanitizeCollaboratorIds(ids: string[], ownerId: string): Promise<string[]> {
  const unique = [...new Set(ids)].filter((id) => id && id !== ownerId);
  if (unique.length === 0) return [];

  const found = await db
    .select({ id: users.id })
    .from(users)
    .where(inArray(users.id, unique));
  const valid = new Set(found.map((row) => row.id));
  return unique.filter((id) => valid.has(id));
}

async function setProjectCollaborators(projectId: string, collaboratorIds: string[]): Promise<void> {
  await db
    .delete(projectCollaborators)
    .where(eq(projectCollaborators.projectId, projectId));

  if (collaboratorIds.length === 0) return;

  await db
    .insert(projectCollaborators)
    .values(collaboratorIds.map((userId) => ({ projectId, userId })));
}

async function uniqueProjectSlug(
  userId: string,
  title: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(title) || 'project';

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const conditions: SQL[] = [eq(projects.userId, userId), eq(projects.slug, candidate)];
    if (excludeId) conditions.push(ne(projects.id, excludeId));
    const rows = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(...conditions))
      .limit(1);
    if (rows.length === 0) return candidate;
  }

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function createProject(userId: string, input: CreateProjectInput) {
  const slug = await uniqueProjectSlug(userId, input.title);
  const rows = await db
    .insert(projects)
    .values({
      userId,
      title: input.title,
      slug,
      shortDescription: input.shortDescription ?? null,
      description: input.description ?? null,
      techStack: input.techStack ?? [],
      demoUrl: input.demoUrl ?? null,
      repoUrl: input.repoUrl ?? null,
      coverImageUrl: input.coverImageUrl ?? null,
    })
    .returning();

  const project = rows[0];
  if (!project) throw AppError.internal('Gagal membuat project');

  const collaboratorIds = await sanitizeCollaboratorIds(input.collaboratorIds ?? [], userId);
  if (collaboratorIds.length > 0) {
    await db
      .insert(projectCollaborators)
      .values(collaboratorIds.map((collaboratorId) => ({ projectId: project.id, userId: collaboratorId })));
  }

  const [hydrated] = await hydrateProjects([project]);
  return hydrated ?? { ...project, images: [], collaborators: [] };
}

/**
 * Kumpulkan project yang melibatkan seorang kreator — baik sebagai pemilik
 * maupun sebagai kolaborator.
 */
async function collectProjectsForUser(userId: string, onlyVisible: boolean): Promise<Project[]> {
  const [ownerRows, collaboratorRows] = await Promise.all([
    db.select().from(projects).where(eq(projects.userId, userId)),
    db
      .select({ project: projects })
      .from(projectCollaborators)
      .innerJoin(projects, eq(projectCollaborators.projectId, projects.id))
      .where(eq(projectCollaborators.userId, userId)),
  ]);

  const byId = new Map<string, Project>();
  for (const row of ownerRows) byId.set(row.id, row);
  for (const row of collaboratorRows) byId.set(row.project.id, row.project);

  return [...byId.values()]
    .filter((project) => !onlyVisible || !project.isHidden)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function listProjectsByUser(userId: string): Promise<ProjectWithImages[]> {
  return hydrateProjects(await collectProjectsForUser(userId, false));
}

export async function listProjectsByMemberSlug(slug: string): Promise<ProjectWithImages[]> {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.slug, slug))
    .limit(1);

  const member = rows[0];
  if (!member) return [];

  return hydrateProjects(await collectProjectsForUser(member.id, true));
}

export async function listAllProjects(
  query: AdminProjectQuery,
): Promise<Paginated<ProjectWithImages>> {
  const { search, hidden, page, limit } = query;

  const conditions: SQL[] = [];
  if (hidden !== undefined) conditions.push(eq(projects.isHidden, hidden));
  if (search) {
    const pattern = `%${search}%`;
    const searchCondition = or(
      ilike(projects.title, pattern),
      ilike(projects.shortDescription, pattern),
      ilike(users.name, pattern),
    );
    if (searchCondition) conditions.push(searchCondition);
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({ project: projects })
    .from(projects)
    .innerJoin(users, eq(projects.userId, users.id))
    .where(where)
    .orderBy(desc(projects.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const totals = await db
    .select({ value: count() })
    .from(projects)
    .innerJoin(users, eq(projects.userId, users.id))
    .where(where);

  const projectsOnly = rows.map((row) => row.project);
  const withRelations = await hydrateProjects(projectsOnly);

  return {
    items: withRelations,
    meta: {
      page,
      limit,
      total: totals[0]?.value ?? 0,
      totalPages: Math.max(1, Math.ceil((totals[0]?.value ?? 0) / limit)),
    },
  };
}

/** Project yang bisa diakses user — sebagai pemilik maupun kolaborator. */
export async function getProjectForUser(
  projectId: string,
  userId: string,
): Promise<Project | null> {
  const ownerRows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);
  if (ownerRows[0]) return ownerRows[0];

  const collaboratorRows = await db
    .select({ project: projects })
    .from(projectCollaborators)
    .innerJoin(projects, eq(projectCollaborators.projectId, projects.id))
    .where(
      and(
        eq(projectCollaborators.projectId, projectId),
        eq(projectCollaborators.userId, userId),
      ),
    )
    .limit(1);

  return collaboratorRows[0]?.project ?? null;
}

async function getAccessibleProject(projectId: string, userId: string): Promise<Project> {
  const project = await getProjectForUser(projectId, userId);
  if (!project) throw AppError.notFound('Project tidak ditemukan');
  return project;
}

/** Khusus pemilik — dipakai untuk operasi yang tidak boleh dilakukan kolaborator. */
async function getOwnedProject(projectId: string, userId: string): Promise<Project> {
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);
  const project = rows[0];
  if (!project) throw AppError.notFound('Project tidak ditemukan');
  return project;
}

export async function updateProjectForUser(
  projectId: string,
  userId: string,
  input: UpdateProjectInput,
): Promise<Project> {
  const project = await getAccessibleProject(projectId, userId);
  const isOwner = project.userId === userId;

  const { collaboratorIds, ...fields } = input;

  if (collaboratorIds !== undefined && !isOwner) {
    throw AppError.forbidden('Hanya pemilik project yang dapat mengubah kolaborator.');
  }

  const patch: Partial<typeof projects.$inferInsert> = { ...fields, updatedAt: new Date() };
  if (fields.title) {
    patch.slug = await uniqueProjectSlug(project.userId, fields.title, projectId);
  }

  const rows = await db.update(projects).set(patch).where(eq(projects.id, projectId)).returning();
  const updated = rows[0];
  if (!updated) throw AppError.internal('Gagal memperbarui project');

  if (collaboratorIds !== undefined) {
    const sanitized = await sanitizeCollaboratorIds(collaboratorIds, project.userId);
    await setProjectCollaborators(projectId, sanitized);
  }

  return updated;
}

export async function deleteProjectImages(projectId: string): Promise<ProjectImage[]> {
  const rows = await db
    .delete(projectImages)
    .where(eq(projectImages.projectId, projectId))
    .returning();
  return rows;
}

export async function deleteProjectForUser(projectId: string, userId: string): Promise<Project> {
  const project = await getOwnedProject(projectId, userId);
  await deleteProjectImages(projectId);
  await db.delete(projects).where(eq(projects.id, projectId));
  return project;
}

export async function addProjectImages(
  projectId: string,
  userId: string,
  urls: string[],
): Promise<ProjectImage[]> {
  await getAccessibleProject(projectId, userId);

  const existing = await db
    .select({ sortOrder: projectImages.sortOrder })
    .from(projectImages)
    .where(eq(projectImages.projectId, projectId))
    .orderBy(desc(projectImages.sortOrder))
    .limit(1);

  const startOrder = (existing[0]?.sortOrder ?? -1) + 1;

  return db
    .insert(projectImages)
    .values(urls.map((imageUrl, index) => ({ projectId, imageUrl, sortOrder: startOrder + index })))
    .returning();
}

export async function getPublicProject(idOrSlug: string): Promise<ProjectWithImages | null> {
  const condition = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
    ? eq(projects.id, idOrSlug)
    : eq(projects.slug, idOrSlug);

  const rows = await db
    .select({ project: projects })
    .from(projects)
    .innerJoin(users, eq(projects.userId, users.id))
    .where(
      and(
        condition,
        eq(projects.isHidden, false),
      ),
    )
    .limit(1);

  const project = rows[0]?.project;
  if (!project) return null;

  const [withRelations] = await hydrateProjects([project]);
  return withRelations ?? null;
}

export async function getProjectAuthor(projectId: string) {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      slug: users.slug,
      role: users.role,
      avatarUrl: users.avatarUrl,
      headline: users.headline,
    })
    .from(projects)
    .innerJoin(users, eq(projects.userId, users.id))
    .where(eq(projects.id, projectId))
    .limit(1);

  return rows[0] ?? null;
}

export async function setProjectHidden(projectId: string, isHidden: boolean): Promise<Project> {
  const rows = await db
    .update(projects)
    .set({ isHidden, updatedAt: new Date() })
    .where(eq(projects.id, projectId))
    .returning();
  const updated = rows[0];
  if (!updated) throw AppError.notFound('Project tidak ditemukan');
  return updated;
}

export async function deleteProjectAsAdmin(projectId: string): Promise<Project> {
  const rows = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  const project = rows[0];
  if (!project) throw AppError.notFound('Project tidak ditemukan');

  await deleteProjectImages(projectId);
  await db.delete(projects).where(eq(projects.id, projectId));
  return project;
}

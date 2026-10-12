import { and, asc, count, desc, eq, ilike, ne, or, type SQL } from 'drizzle-orm';

import { db } from '../db/index.js';
import { projectImages, projects, users, type Project, type ProjectImage } from '../db/schema.js';
import { AppError } from '../lib/errors.js';
import { slugify } from '../lib/slug.js';
import type {
  AdminProjectQuery,
  CreateProjectInput,
  UpdateProjectInput,
} from '../validators/project.js';
import type { Paginated } from './user.service.js';

export type ProjectWithImages = Project & { images: ProjectImage[] };

export async function attachImages(rows: Project[]): Promise<ProjectWithImages[]> {
  if (rows.length === 0) return [];

  const images = await db
    .select()
    .from(projectImages)
    .where(or(...rows.map((row) => eq(projectImages.projectId, row.id))))
    .orderBy(asc(projectImages.sortOrder));

  const grouped = new Map<string, ProjectImage[]>();
  for (const image of images) {
    const list = grouped.get(image.projectId);
    if (list) list.push(image);
    else grouped.set(image.projectId, [image]);
  }

  return rows.map((row) => ({ ...row, images: grouped.get(row.id) ?? [] }));
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
  return { ...project, images: [] as ProjectImage[] };
}

export async function listProjectsByUser(userId: string): Promise<ProjectWithImages[]> {
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt));
  return attachImages(rows);
}

export async function listProjectsByMemberSlug(slug: string): Promise<ProjectWithImages[]> {
  const rows = await db
    .select({ project: projects })
    .from(projects)
    .innerJoin(users, eq(projects.userId, users.id))
    .where(
      and(
        eq(users.slug, slug),
        eq(projects.isHidden, false),
      ),
    )
    .orderBy(desc(projects.createdAt));

  const projectsOnly = rows.map((row) => row.project);
  return attachImages(projectsOnly);
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
  const withImages = await attachImages(projectsOnly);

  return {
    items: withImages,
    meta: {
      page,
      limit,
      total: totals[0]?.value ?? 0,
      totalPages: Math.max(1, Math.ceil((totals[0]?.value ?? 0) / limit)),
    },
  };
}

export async function getProjectForUser(projectId: string, userId: string) {
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

async function getOwnedProject(projectId: string, userId: string): Promise<Project> {
  const project = await getProjectForUser(projectId, userId);
  if (!project) throw AppError.notFound('Project tidak ditemukan');
  return project;
}

export async function updateProjectForUser(
  projectId: string,
  userId: string,
  input: UpdateProjectInput,
): Promise<Project> {
  await getOwnedProject(projectId, userId);

  const patch: Partial<typeof projects.$inferInsert> = { ...input, updatedAt: new Date() };
  if (input.title) {
    patch.slug = await uniqueProjectSlug(userId, input.title, projectId);
  }

  const rows = await db.update(projects).set(patch).where(eq(projects.id, projectId)).returning();
  const updated = rows[0];
  if (!updated) throw AppError.internal('Gagal memperbarui project');
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
  await getOwnedProject(projectId, userId);

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

  const [withImages] = await attachImages([project]);
  return withImages ?? null;
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

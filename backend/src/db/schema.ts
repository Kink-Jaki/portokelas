import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['member', 'admin']);
export const userStatus = pgEnum('user_status', ['pending', 'approved', 'rejected', 'suspended']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    alias: text('alias'),
    email: text('email').notNull(),
    nim: text('nim'),
    spotifyUrl: text('spotify_url'),
    passwordHash: text('password_hash').notNull(),
    role: userRole('role').notNull().default('member'),
    status: userStatus('status').notNull().default('pending'),
    rejectionReason: text('rejection_reason'),
    slug: text('slug').notNull(),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    headline: text('headline'),
    githubUrl: text('github_url'),
    linkedinUrl: text('linkedin_url'),
    instagramUrl: text('instagram_url'),
    websiteUrl: text('website_url'),
    cvUrl: text('cv_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('users_email_unique').on(table.email),
    uniqueIndex('users_nim_unique').on(table.nim),
    uniqueIndex('users_slug_unique').on(table.slug),
    index('users_status_idx').on(table.status),
    index('users_role_idx').on(table.role),
    index('users_created_at_idx').on(table.createdAt),
  ],
);

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    shortDescription: text('short_description'),
    description: text('description'),
    coverImageUrl: text('cover_image_url'),
    techStack: text('tech_stack')
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    demoUrl: text('demo_url'),
    repoUrl: text('repo_url'),
    isHidden: boolean('is_hidden').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('projects_user_id_slug_unique').on(table.userId, table.slug),
    index('projects_user_id_idx').on(table.userId),
    index('projects_slug_idx').on(table.slug),
    index('projects_is_hidden_idx').on(table.isHidden),
    index('projects_created_at_idx').on(table.createdAt),
  ],
);

export const projectImages = pgTable(
  'project_images',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    imageUrl: text('image_url').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [
    index('project_images_project_id_idx').on(table.projectId),
    index('project_images_sort_order_idx').on(table.sortOrder),
  ],
);

/** Konten statis halaman landing — baris "Tentang" (single row). */
export const abouts = pgTable('abouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title'),
  description: text('description').notNull(),
  imageUrl: text('image_url'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Wali kelas yang tampil di carousel landing page. */
export const teachers = pgTable(
  'teachers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    photoUrl: text('photo_url'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('teachers_sort_order_idx').on(table.sortOrder)],
);

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  author: one(users, { fields: [projects.userId], references: [users.id] }),
  images: many(projectImages),
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(projects, { fields: [projectImages.projectId], references: [projects.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectImage = typeof projectImages.$inferSelect;
export type NewProjectImage = typeof projectImages.$inferInsert;
export type About = typeof abouts.$inferSelect;
export type NewAbout = typeof abouts.$inferInsert;
export type Teacher = typeof teachers.$inferSelect;
export type NewTeacher = typeof teachers.$inferInsert;

export type UserRole = User['role'];
export type UserStatus = User['status'];

/** Kolom yang boleh dikirim klien saat membuat project. */
export const publicUserColumns = {
  id: users.id,
  name: users.name,
  alias: users.alias,
  role: users.role,
  slug: users.slug,
  spotifyUrl: users.spotifyUrl,
  avatarUrl: users.avatarUrl,
  headline: users.headline,
  bio: users.bio,
  githubUrl: users.githubUrl,
  linkedinUrl: users.linkedinUrl,
  instagramUrl: users.instagramUrl,
  websiteUrl: users.websiteUrl,
  cvUrl: users.cvUrl,
  createdAt: users.createdAt,
} as const;

/** User tanpa kredensial — aman dikirim ke klien. */
export type PublicUser = Pick<
  User,
  | 'id'
  | 'name'
  | 'alias'
  | 'role'
  | 'slug'
  | 'spotifyUrl'
  | 'avatarUrl'
  | 'headline'
  | 'bio'
  | 'githubUrl'
  | 'linkedinUrl'
  | 'instagramUrl'
  | 'websiteUrl'
  | 'cvUrl'
  | 'createdAt'
>;

export const memberProfileColumns = {
  ...publicUserColumns,
  email: users.email,
  nim: users.nim,
  role: users.role,
  status: users.status,
  rejectionReason: users.rejectionReason,
  updatedAt: users.updatedAt,
} as const;

export type MemberProfile = PublicUser &
  Pick<User, 'email' | 'nim' | 'role' | 'status' | 'rejectionReason' | 'updatedAt'>;

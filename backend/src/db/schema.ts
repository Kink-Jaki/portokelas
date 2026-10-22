import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['member', 'admin']);

/** Preset tema tampilan card & portofolio anggota. */
export const THEME_PRESETS = [
  'editorial',
  'midnight',
  'forest',
  'burgundy',
  'mono',
  'ocean',
  'sunset',
  'sakura',
] as const;

export type ThemePreset = (typeof THEME_PRESETS)[number];

/** Kustomisasi tampilan card & portofolio anggota. */
export type MemberTheme = {
  preset: ThemePreset;
  /** Warna aksen (hex #rrggbb), menimpa preset bila diisi. */
  accent?: string;
  /** Warna latar halaman (hex #rrggbb). */
  bg?: string;
  /** Warna permukaan card (hex #rrggbb). */
  surface?: string;
  /** Warna teks utama (hex #rrggbb). */
  fg?: string;
};

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
    slug: text('slug').notNull(),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    headline: text('headline'),
    githubUrl: text('github_url'),
    linkedinUrl: text('linkedin_url'),
    instagramUrl: text('instagram_url'),
    websiteUrl: text('website_url'),
    cvUrl: text('cv_url'),
    theme: jsonb('theme').$type<MemberTheme>(),
    cardHtml: text('card_html'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('users_email_unique').on(table.email),
    uniqueIndex('users_nim_unique').on(table.nim),
    uniqueIndex('users_slug_unique').on(table.slug),
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

/** Kolaborator project — anggota lain yang ikut mengerjakan project bersama. */
export const projectCollaborators = pgTable(
  'project_collaborators',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('project_collaborators_project_user_unique').on(table.projectId, table.userId),
    index('project_collaborators_project_id_idx').on(table.projectId),
    index('project_collaborators_user_id_idx').on(table.userId),
  ],
);

/** Like project — satu user hanya bisa like sekali per project. */
export const projectLikes = pgTable(
  'project_likes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('project_likes_project_user_unique').on(table.projectId, table.userId),
    index('project_likes_project_id_idx').on(table.projectId),
    index('project_likes_user_id_idx').on(table.userId),
  ],
);

/** Komentar/feedback pada project — thread flat, tanpa reply nested. */
export const projectComments = pgTable(
  'project_comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    isHidden: boolean('is_hidden').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('project_comments_project_id_idx').on(table.projectId),
    index('project_comments_user_id_idx').on(table.userId),
    index('project_comments_created_at_idx').on(table.createdAt),
    index('project_comments_is_hidden_idx').on(table.isHidden),
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

/** Konten statis hero landing — kolase tiga gambar (single row). */
export const heroes = pgTable('heroes', {
  id: uuid('id').primaryKey().defaultRandom(),
  image1Url: text('image1_url'),
  image2Url: text('image2_url'),
  image3Url: text('image3_url'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Wali Kelas yang tampil di carousel landing page. */
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

/** Kenangan/album foto yang diunggah anggota untuk carousel landing page. */
export const memories = pgTable(
  'memories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    imageUrl: text('image_url').notNull(),
    caption: text('caption'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('memories_user_id_idx').on(table.userId),
    index('memories_created_at_idx').on(table.createdAt),
  ],
);

/** Video kenangan pada section landing (single row, khusus admin). */
export const memoryVideos = pgTable('memory_videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  videoUrl: text('video_url').notNull(),
  caption: text('caption'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------- Craftly NGL ------------------------------- */

/** Status laporan pesan NGL. */
export const MESSAGE_REPORT_STATUSES = ['pending', 'resolved', 'dismissed'] as const;
export type MessageReportStatus = (typeof MESSAGE_REPORT_STATUSES)[number];

/** Pengaturan aplikasi global (key/value JSON) — mis. `ngl_enabled`. */
export const appSettings = pgTable('app_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').$type<unknown>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Pesan anonim Craftly NGL. Tidak pernah menyimpan identitas pengirim —
 * `ip_hash` = SHA-256(IP + salt) dan hanya dipakai untuk rate limit.
 */
export const nglMessages = pgTable(
  'ngl_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    content: text('content'),
    spotifyType: text('spotify_type'),
    spotifyId: text('spotify_id'),
    spotifyTitle: text('spotify_title'),
    spotifyArtist: text('spotify_artist'),
    imagePath: text('image_path'),
    isHidden: boolean('is_hidden').notNull().default(false),
    ipHash: text('ip_hash'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'ngl_messages_has_payload',
      sql`${table.content} is not null or ${table.spotifyId} is not null or ${table.imagePath} is not null`,
    ),
    index('ngl_messages_created_at_idx').on(table.createdAt),
    index('ngl_messages_is_hidden_idx').on(table.isHidden),
  ],
);

/** Penanda pesan sudah dibaca — unik per kombinasi pesan + user. */
export const messageReads = pgTable(
  'message_reads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    messageId: uuid('message_id')
      .notNull()
      .references(() => nglMessages.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    readAt: timestamp('read_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('message_reads_message_user_unique').on(table.messageId, table.userId),
    index('message_reads_message_id_idx').on(table.messageId),
    index('message_reads_user_id_idx').on(table.userId),
  ],
);

/** Laporan pesan NGL — satu user hanya boleh melaporkan satu pesan sekali. */
export const messageReports = pgTable(
  'message_reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    messageId: uuid('message_id')
      .notNull()
      .references(() => nglMessages.id, { onDelete: 'cascade' }),
    reporterUserId: uuid('reporter_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    reason: text('reason').notNull(),
    note: text('note'),
    status: text('status').notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('message_reports_message_reporter_unique').on(table.messageId, table.reporterUserId),
    index('message_reports_message_id_idx').on(table.messageId),
    index('message_reports_reporter_user_id_idx').on(table.reporterUserId),
    index('message_reports_status_idx').on(table.status),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  memories: many(memories),
  collaborations: many(projectCollaborators),
  projectLikes: many(projectLikes),
  projectComments: many(projectComments),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  author: one(users, { fields: [projects.userId], references: [users.id] }),
  images: many(projectImages),
  collaborators: many(projectCollaborators),
  likes: many(projectLikes),
  comments: many(projectComments),
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(projects, { fields: [projectImages.projectId], references: [projects.id] }),
}));

export const projectCollaboratorsRelations = relations(projectCollaborators, ({ one }) => ({
  project: one(projects, { fields: [projectCollaborators.projectId], references: [projects.id] }),
  user: one(users, { fields: [projectCollaborators.userId], references: [users.id] }),
}));

export const projectLikesRelations = relations(projectLikes, ({ one }) => ({
  project: one(projects, { fields: [projectLikes.projectId], references: [projects.id] }),
  user: one(users, { fields: [projectLikes.userId], references: [users.id] }),
}));

export const projectCommentsRelations = relations(projectComments, ({ one }) => ({
  project: one(projects, { fields: [projectComments.projectId], references: [projects.id] }),
  user: one(users, { fields: [projectComments.userId], references: [users.id] }),
}));

export const memoriesRelations = relations(memories, ({ one }) => ({
  author: one(users, { fields: [memories.userId], references: [users.id] }),
}));

export const nglMessagesRelations = relations(nglMessages, ({ many }) => ({
  reads: many(messageReads),
  reports: many(messageReports),
}));

export const messageReadsRelations = relations(messageReads, ({ one }) => ({
  message: one(nglMessages, { fields: [messageReads.messageId], references: [nglMessages.id] }),
  user: one(users, { fields: [messageReads.userId], references: [users.id] }),
}));

export const messageReportsRelations = relations(messageReports, ({ one }) => ({
  message: one(nglMessages, { fields: [messageReports.messageId], references: [nglMessages.id] }),
  reporter: one(users, { fields: [messageReports.reporterUserId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectImage = typeof projectImages.$inferSelect;
export type NewProjectImage = typeof projectImages.$inferInsert;
export type ProjectCollaborator = typeof projectCollaborators.$inferSelect;
export type NewProjectCollaborator = typeof projectCollaborators.$inferInsert;
export type ProjectLike = typeof projectLikes.$inferSelect;
export type NewProjectLike = typeof projectLikes.$inferInsert;
export type ProjectComment = typeof projectComments.$inferSelect;
export type NewProjectComment = typeof projectComments.$inferInsert;
export type About = typeof abouts.$inferSelect;
export type NewAbout = typeof abouts.$inferInsert;
export type Hero = typeof heroes.$inferSelect;
export type NewHero = typeof heroes.$inferInsert;
export type Teacher = typeof teachers.$inferSelect;
export type NewTeacher = typeof teachers.$inferInsert;
export type Memory = typeof memories.$inferSelect;
export type NewMemory = typeof memories.$inferInsert;
export type MemoryVideo = typeof memoryVideos.$inferSelect;
export type NewMemoryVideo = typeof memoryVideos.$inferInsert;
export type AppSetting = typeof appSettings.$inferSelect;
export type NewAppSetting = typeof appSettings.$inferInsert;
export type NglMessage = typeof nglMessages.$inferSelect;
export type NewNglMessage = typeof nglMessages.$inferInsert;
export type MessageRead = typeof messageReads.$inferSelect;
export type NewMessageRead = typeof messageReads.$inferInsert;
export type MessageReport = typeof messageReports.$inferSelect;
export type NewMessageReport = typeof messageReports.$inferInsert;

export type UserRole = User['role'];

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
  theme: users.theme,
  cardHtml: users.cardHtml,
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
  | 'theme'
  | 'cardHtml'
  | 'createdAt'
>;

export const memberProfileColumns = {
  ...publicUserColumns,
  email: users.email,
  nim: users.nim,
  role: users.role,
  updatedAt: users.updatedAt,
} as const;

export type MemberProfile = PublicUser & Pick<User, 'email' | 'nim' | 'role' | 'updatedAt'>;

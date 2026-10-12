/**
 * Seed data dummy untuk testing UI.
 *
 *   bun run src/db/seed-dummy.ts
 *
 * Membuat user dummy dengan URL sosial, serta 1 project dummy.
 * Aman dijalankan berkali-kali (akan update jika sudah ada).
 */
import 'dotenv/config';

import { and, eq } from 'drizzle-orm';

import { db, pool } from './index.js';
import { projects, users } from './schema.js';
import { hashPassword } from '../lib/password.js';
import { slugify } from '../lib/slug.js';

async function main() {
  const dummyEmail = 'dummy@kelas.local';
  const dummyName = 'Dummy Anggota';
  const dummyPassword = 'Dummy1234';
  const dummySlug = slugify(dummyName) || 'dummy-anggota';

  const passwordHash = await hashPassword(dummyPassword);

  // Upsert user dummy
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, dummyEmail))
    .limit(1);

  let userId: string;

  if (existingUser[0]) {
    userId = existingUser[0].id;
    await db
      .update(users)
      .set({
        name: dummyName,
        passwordHash,
        role: 'member',
        slug: dummySlug,
        avatarUrl: null,
        headline: 'Frontend Developer · Mahasiswa',
        bio: 'User dummy untuk keperluan testing tampilan portofolio kelas.',
        githubUrl: 'https://github.com/octocat',
        instagramUrl: 'https://instagram.com/github',
        websiteUrl: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    console.info(`✔ User dummy diperbarui: ${dummyEmail}`);
  } else {
    const inserted = await db
      .insert(users)
      .values({
        name: dummyName,
        email: dummyEmail,
        passwordHash,
        role: 'member',
        slug: dummySlug,
        headline: 'Frontend Developer · Mahasiswa',
        bio: 'User dummy untuk keperluan testing tampilan portofolio kelas.',
        githubUrl: 'https://github.com/octocat',
        instagramUrl: 'https://instagram.com/github',
        websiteUrl: null,
      })
      .returning({ id: users.id });

    const insertedUser = inserted[0];
    if (!insertedUser) throw new Error('Gagal membuat user dummy');
    userId = insertedUser.id;
    console.info('✔ User dummy dibuat:');
    console.info(`   email    : ${dummyEmail}`);
    console.info(`   password : ${dummyPassword}`);
  }

  // Upsert project dummy
  const projectTitle = 'Project Dummy Portfolio';
  const projectSlug = slugify(projectTitle);

  const existingProject = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.userId, userId), eq(projects.slug, projectSlug)))
    .limit(1);

  if (existingProject[0]) {
    await db
      .update(projects)
      .set({
        title: projectTitle,
        shortDescription: 'Contoh project dummy untuk testing card anggota.',
        description:
          '# Project Dummy\n\nIni adalah project contoh untuk melihat tampilan portofolio.',
        techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
        demoUrl: 'https://example.com',
        repoUrl: 'https://github.com/octocat/Hello-World',
        isHidden: false,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, existingProject[0].id));

    console.info('✔ Project dummy diperbarui');
  } else {
    await db.insert(projects).values({
      userId,
      title: projectTitle,
      slug: projectSlug,
      shortDescription: 'Contoh project dummy untuk testing card anggota.',
      description:
        '# Project Dummy\n\nIni adalah project contoh untuk melihat tampilan portofolio.',
      techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
      demoUrl: 'https://example.com',
      repoUrl: 'https://github.com/octocat/Hello-World',
      isHidden: false,
    });

    console.info('✔ Project dummy dibuat');
  }
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error('✖ Gagal menjalankan seed dummy:', error);
    await pool.end().catch(() => undefined);
    process.exit(1);
  });

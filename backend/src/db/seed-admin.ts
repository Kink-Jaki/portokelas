/**
 * Seed akun admin kelas.
 *
 *   bun run seed:admin
 *
 * Kredensial dibaca dari backend/.env (ADMIN_NAME, ADMIN_NIM, ADMIN_EMAIL,
 * ADMIN_PASSWORD). Akun dibuat sebagai role `admin` dengan status `approved`.
 * Aman dijalankan berkali-kali: bila email sudah ada, kredensial diperbarui.
 */
import 'dotenv/config';

import { eq } from 'drizzle-orm';

import { db, pool } from './index.js';
import { users } from './schema.js';
import { env } from '../env.js';
import { hashPassword } from '../lib/password.js';
import { slugify } from '../lib/slug.js';

async function main() {
  const email = env.ADMIN_EMAIL.toLowerCase();
  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
  const slug = slugify(env.ADMIN_NAME) || 'admin';

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const current = existing[0];

  if (current) {
    await db
      .update(users)
      .set({
        name: env.ADMIN_NAME,
        passwordHash,
        role: 'admin',
        status: 'approved',
        rejectionReason: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, current.id));

    console.info(`Akun admin diperbarui: ${email}`);
  } else {
    await db.insert(users).values({
      name: env.ADMIN_NAME,
      email,
      passwordHash,
      role: 'admin',
      status: 'approved',
      slug,
    });

    console.info('Akun admin dibuat:');
    console.info(`   email    : ${email}`);
    console.info(`   password : ${env.ADMIN_PASSWORD}`);
  }
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error('✖ Gagal menjalankan seed admin:', error);
    await pool.end().catch(() => undefined);
    process.exit(1);
  });

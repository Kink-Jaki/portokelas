/**
 * Migrasi hash password lama (argon2id, hasil `Bun.password`) ke format
 * `pbkdf2-sha256$...` milik `lib/password.ts` (Web Crypto — jalan di runtime
 * Bun maupun Cloudflare Workers).
 *
 *   bun run migrate:passwords
 *
 * Hanya baris argon2id yang berhasil diverifikasi terhadap kandidat password
 * yang diketahui (default seed) yang ditulis ulang. Baris lain dibiarkan utuh
 * agar akun tidak terkunci.
 */
import 'dotenv/config';
import { eq } from 'drizzle-orm';

import { closePool, db } from './index.js';
import { users } from './schema.js';
import { hashPassword, verifyPassword } from '../lib/password.js';

const LEGACY_PREFIX = '$argon2id$';
const KNOWN_PASSWORDS = ['password', 'Dummy1234'];

/** Kandidat: default seed + password admin dari environment. */
function candidates(): string[] {
  const fromEnv = process.env.ADMIN_PASSWORD ?? '';
  return [...new Set([...KNOWN_PASSWORDS, fromEnv].filter(Boolean))];
}

async function main() {
  const rows = await db
    .select({ id: users.id, nim: users.nim, email: users.email, passwordHash: users.passwordHash })
    .from(users);

  const legacy = rows.filter((row) => row.passwordHash.startsWith(LEGACY_PREFIX));
  console.info(`✔ ${rows.length} akun diperiksa, ${legacy.length} masih memakai hash argon2id`);

  if (legacy.length === 0) {
    console.info('  Tidak ada hash lama — tidak ada yang perlu dimigrasikan.');
    return;
  }

  const known = candidates();
  let migrated = 0;
  const skipped: string[] = [];

  for (const row of legacy) {
    const plain = known.find((candidate) => {
      try {
        return Bun.password.verifySync(candidate, row.passwordHash);
      } catch {
        return false;
      }
    });

    if (!plain) {
      skipped.push(row.nim ?? row.email);
      continue;
    }

    const passwordHash = await hashPassword(plain);
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, row.id));

    if (!(await verifyPassword(plain, passwordHash))) {
      throw new Error(`Verifikasi ulang gagal setelah migrasi: ${row.nim ?? row.email}`);
    }

    migrated += 1;
  }

  console.info(`✔ ${migrated} hash dimigrasikan ke pbkdf2-sha256`);

  if (skipped.length > 0) {
    console.warn(`✖ ${skipped.length} akun passwordnya tidak dikenali, hash lama dibiarkan utuh:`);
    console.warn(`  ${skipped.join(', ')}`);
    console.warn('  Ubah password lewat profil, atau tambahkan kandidat di KNOWN_PASSWORDS.');
  }
}

main()
  .then(async () => {
    await closePool();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error('✖ Gagal migrasi hash password:', error);
    await closePool();
    process.exit(1);
  });

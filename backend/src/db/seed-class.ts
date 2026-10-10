/**
 * Seed akun kelas.
 *
 *   bun run seed:class
 *
 * Menghapus SELURUH akun yang ada lalu membuat ulang 31 akun anggota kelas.
 * Login memakai NIS (kolom `nim`) dengan password default "password".
 * Akun MUHAMMAD FAIRUZ ZAKY dibuat dengan role `admin` (badge "Dev").
 */
import 'dotenv/config';

import { db, pool } from './index.js';
import { users } from './schema.js';
import { hashPassword } from '../lib/password.js';
import { slugify } from '../lib/slug.js';

const DEFAULT_PASSWORD = 'password';

type ClassMember = { nim: string; name: string; admin?: boolean };

const MEMBERS: ClassMember[] = [
  { nim: '17858', name: 'KEYLA RANI AZAHRA' },
  { nim: '17851', name: 'FITRA BIMA SAKTI' },
  { nim: '17848', name: 'FADHEELA MAIZA GIANA PUTRI' },
  { nim: '17882', name: 'ZAHRA ARUM SANJAYA' },
  { nim: '17861', name: 'MARISKA YULIANA SARI' },
  { nim: '17853', name: 'HEYSELL RAMADHANI' },
  { nim: '17865', name: 'MUHAMMAD FAIRUZ ZAKY', admin: true },
  { nim: '17854', name: 'INDI ALVIN FADHOILLAH' },
  { nim: '17864', name: 'MUHAMMAD AZHAR RAFIF' },
  { nim: '17881', name: 'YULIANA KRISTIYANINGSIH' },
  { nim: '17874', name: 'SHELA ANTIKA APRILIYA' },
  { nim: '178581', name: 'KHIMBERLY NIKEN AYUNI' },
  { nim: '17879', name: 'WIJI ASTUTIK' },
  { nim: '17872', name: 'RINDIVA AULIA PUTRI AZHARY' },
  { nim: '17868', name: 'NATANIA NAZWA GISELLA NASYAHRANI' },
  { nim: '17852', name: 'FITRI OKTAVIA' },
  { nim: '17873', name: 'ROGHIBAH KHANIFAH' },
  { nim: '17849', name: 'FATIMAH NURUL SIVA FAUZIAH' },
  { nim: '17850', name: 'FIKA FEBRIYANTI' },
  { nim: '17862', name: 'MOHAMAD HENANTYO ADHI PRAMANA' },
  { nim: '17870', name: 'PUTRI EKA LIANA' },
  { nim: '17875', name: 'VEMA ARNANDHA' },
  { nim: '17884', name: 'ZAHROTUL SALSABILA' },
  { nim: '17866', name: 'NANCY MEYLA PUTRI' },
  { nim: '17860', name: 'MALIKUS SALEH CAHYA RAMADHAN' },
  { nim: '17863', name: 'MUAHAMMAD ALVYAN CHOIRURROZIQIN' },
  { nim: '17877', name: 'WAHYU TEGUH SATRIYA' },
  { nim: '17856', name: 'JONATHAN ADY SURYA PRATAMA' },
  { nim: '17869', name: 'NAUFAL ADINATA' },
  { nim: '17855', name: 'IRMA AURA SAUDYA MECCA' },
  { nim: '17871', name: 'RAFA ABIMANYU' },
];

/** Slug unik dari nama; tambah suffix angka bila bentrok. */
function uniqueSlug(name: string, used: Set<string>): string {
  const base = slugify(name) || 'anggota';
  let candidate = base;
  let attempt = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${attempt}`;
    attempt += 1;
  }
  used.add(candidate);
  return candidate;
}

async function main() {
  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  const deleted = await db.delete(users).returning({ id: users.id });
  console.info(`✔ Menghapus ${deleted.length} akun sebelumnya`);

  const usedSlugs = new Set<string>();
  const values = MEMBERS.map((member) => ({
    name: member.name,
    email: `${member.nim}@kelas.local`,
    nim: member.nim,
    passwordHash,
    role: member.admin ? ('admin' as const) : ('member' as const),
    status: 'approved' as const,
    slug: uniqueSlug(member.name, usedSlugs),
  }));

  await db.insert(users).values(values);

  console.info(`✔ Membuat ${values.length} akun kelas (password: ${DEFAULT_PASSWORD})`);
  console.info('  Login memakai NIS, contoh: 17858');
  console.info('  Dev/admin: MUHAMMAD FAIRUZ ZAKY (NIS 17865)');
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error('✖ Gagal menjalankan seed kelas:', error);
    await pool.end().catch(() => undefined);
    process.exit(1);
  });

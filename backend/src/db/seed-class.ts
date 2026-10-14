/**
 * Seed akun awal Craftly.
 *
 *   bun run seed:class
 *
 * Menghapus SELURUH akun yang ada lalu membuat ulang 31 akun kreator awal.
 * Login memakai NIS (kolom `nim`) dengan password default "password".
 * Akun MUHAMMAD FAIRUZ ZAKY dibuat dengan role `admin` (badge "Dev").
 *
 * Field profil bersifat opsional: alias, headline, bio, media sosial, website,
 * CV, dan tautan lagu Spotify.
 */
import 'dotenv/config';

import { closePool, db } from './index.js';
import { users } from './schema.js';
import { hashPassword } from '../lib/password.js';
import { slugify } from '../lib/slug.js';

const DEFAULT_PASSWORD = 'password';

type ClassMember = {
  nim: string;
  name: string;
  admin?: boolean;
  alias?: string;
  headline?: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  cvUrl?: string;
  spotifyUrl?: string;
};

const MEMBERS: ClassMember[] = [
  { nim: '17858', name: 'KEYLA RANI AZAHRA' },
  { nim: '17851', name: 'FITRA BIMA SAKTI' },
  { nim: '17848', name: 'FADHEELA MAIZA GIANA PUTRI' },
  { nim: '17882', name: 'ZAHRA ARUM SANJAYA' },
  { nim: '17861', name: 'MARISKA YULIANA SARI' },
  { nim: '17853', name: 'HEYSELL RAMADHANI' },
  {
    nim: '17865',
    name: 'MUHAMMAD FAIRUZ ZAKY',
    admin: true,
    alias: 'ZAKYY',
    headline: 'Backend Dev - Prompt Engineer',
    bio: 'im fish',
    githubUrl: 'https://github.com/Kink-Jaki',
    instagramUrl: 'https://instagram.com/fzaky.13',
    websiteUrl: 'https://fzaky.my.id',
    spotifyUrl: 'https://open.spotify.com/track/4qqMPUmuvVukyvFHHPty2H?si=0c25cf20a85140c5',
  },
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
  const base = slugify(name) || 'kreator';
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
    email: `${member.nim}@craftly.local`,
    nim: member.nim,
    passwordHash,
    role: member.admin ? ('admin' as const) : ('member' as const),
    slug: uniqueSlug(member.name, usedSlugs),
    alias: member.alias ?? null,
    headline: member.headline ?? null,
    bio: member.bio ?? null,
    githubUrl: member.githubUrl ?? null,
    linkedinUrl: member.linkedinUrl ?? null,
    instagramUrl: member.instagramUrl ?? null,
    websiteUrl: member.websiteUrl ?? null,
    cvUrl: member.cvUrl ?? null,
    spotifyUrl: member.spotifyUrl ?? null,
  }));

  await db.insert(users).values(values);

  console.info(`✔ Membuat ${values.length} akun Craftly (password: ${DEFAULT_PASSWORD})`);
  console.info('  Login memakai NIS, contoh: 17858');
  console.info('  Dev/admin: MUHAMMAD FAIRUZ ZAKY (NIS 17865)');
}

main()
  .then(async () => {
    await closePool();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error('✖ Gagal menjalankan seed Craftly:', error);
    await closePool();
    process.exit(1);
  });

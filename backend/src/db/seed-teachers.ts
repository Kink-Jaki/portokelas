/**
 * Seed wali kelas (Kelas 10, 11, 12).
 *
 *   bun run seed:teachers
 *
 * Menghapus SELURUH data wali kelas lalu membuat ulang 3 entri:
 *   - urutan 0 → Kelas 10
 *   - urutan 1 → Kelas 11
 *   - urutan 2 → Kelas 12
 *
 * Label kelas & jabatan di halaman publik diturunkan dari `sortOrder`,
 * sedangkan kolom di sini mengikuti model backend: name, description,
 * photoUrl, sortOrder. Foto memakai placeholder portrait publik; ganti
 * dengan URL foto asli bila sudah tersedia.
 */
import 'dotenv/config';

import { closePool, db } from './index.js';
import { teachers } from './schema.js';

type TeacherSeed = {
  sortOrder: number;
  name: string;
  description: string;
  photoUrl: string;
};

const TEACHERS: TeacherSeed[] = [
  {
    sortOrder: 0,
    name: 'Ibu Siti Nurhaliza, S.Pd',
    description:
      'Selalu mendampingi dan memberikan arahan agar setiap siswa kelas 10 dapat beradaptasi, berkembang, dan meraih potensi terbaiknya.',
    photoUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
  },
  {
    sortOrder: 1,
    name: 'Bapak Ahmad Fauzi, S.Pd',
    description:
      'Membimbing dan memotivasi siswa kelas 11 untuk lebih mandiri, disiplin, dan siap menghadapi tantangan di jenjang selanjutnya.',
    photoUrl:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop',
  },
  {
    sortOrder: 2,
    name: 'Ibu Dewi Lestari, S.Pd',
    description:
      'Dengan sepenuh hati mendampingi siswa kelas 12 dalam mempersiapkan diri menuju jenjang pendidikan selanjutnya dan meraih cita-cita.',
    photoUrl:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop',
  },
];

async function main() {
  const deleted = await db.delete(teachers).returning({ id: teachers.id });
  console.info(`✔ Menghapus ${deleted.length} wali kelas sebelumnya`);

  const values = TEACHERS.map(({ sortOrder, name, description, photoUrl }) => ({
    name,
    description,
    photoUrl,
    sortOrder,
  }));

  await db.insert(teachers).values(values);

  console.info(`✔ Membuat ${values.length} wali kelas:`);
  for (const teacher of TEACHERS) {
    console.info(`   Kelas ${teacher.sortOrder + 10} → ${teacher.name}`);
  }
}

main()
  .then(async () => {
    await closePool();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error('✖ Gagal menjalankan seed wali kelas:', error);
    await closePool();
    process.exit(1);
  });

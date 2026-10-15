import type { PublicUser } from '@/types/api';

/**
 * Field profil yang menandakan sebuah card "sudah terisi".
 * Semakin banyak field terisi, semakin tinggi prioritas tampilnya.
 */
const SCORE_FIELDS: Array<(member: PublicUser) => string | null | undefined> = [
  (member) => member.avatarUrl,
  (member) => member.alias,
  (member) => member.headline,
  (member) => member.bio,
  (member) => member.githubUrl,
  (member) => member.linkedinUrl,
  (member) => member.instagramUrl,
  (member) => member.websiteUrl,
  (member) => member.cvUrl,
  (member) => member.spotifyUrl,
  (member) => member.cardHtml,
  (member) => (member.theme ? member.theme.preset : null),
];

/** Hitung skor kelengkapan profil anggota (jumlah field yang terisi). */
export function memberCompletenessScore(member: PublicUser): number {
  let score = 0;
  for (const read of SCORE_FIELDS) {
    const value = read(member);
    if (typeof value === 'string' ? value.trim().length > 0 : Boolean(value)) {
      score += 1;
    }
  }
  return score;
}

/** PRNG deterministik (mulberry32) — sama seed, sama urutan. */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates dengan PRNG seeded (tidak memutasi array asal). */
function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const current = result[i];
    const target = result[j];
    if (current !== undefined && target !== undefined) {
      result[i] = target;
      result[j] = current;
    }
  }
  return result;
}

/**
 * Urutkan card landing: kelompok skor kelengkapan tertinggi lebih dulu,
 * lalu acak anggota di dalam kelompok skor yang sama.
 */
export function orderLandingMembers(members: PublicUser[], seed: number): PublicUser[] {
  const random = createRandom(seed);
  const groups = new Map<number, PublicUser[]>();

  for (const member of members) {
    const score = memberCompletenessScore(member);
    const bucket = groups.get(score);
    if (bucket) bucket.push(member);
    else groups.set(score, [member]);
  }

  return [...groups.keys()]
    .sort((a, b) => b - a)
    .flatMap((score) => shuffle(groups.get(score) ?? [], random));
}

const SEED_STORAGE_KEY = 'craftly:landing-members-seed';

/**
 * Seed acak yang disimpan per sesi browser; urutan tidak berubah saat
 * navigasi maupun reload, tetapi acak lagi pada sesi/tab baru.
 */
export function getLandingOrderSeed(): number {
  try {
    const existing = window.sessionStorage.getItem(SEED_STORAGE_KEY);
    if (existing !== null) {
      const parsed = Number(existing);
      if (Number.isFinite(parsed)) return parsed;
    }
    const seed = (Math.random() * 0xffffffff) >>> 0;
    window.sessionStorage.setItem(SEED_STORAGE_KEY, String(seed));
    return seed;
  } catch {
    return (Math.random() * 0xffffffff) >>> 0;
  }
}

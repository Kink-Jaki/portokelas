import { assetUrl } from './api';
import type { PublicUser } from '@/types/api';

/**
 * Token yang bisa dipakai di HTML kartu direktori. D Render saat kartu
 * ditampilkan di landing / halaman members, jadi satu template berlaku
 * untuk data anggota yang sedang login maupun pengunjung lain.
 *
 * Daftar token: {{name}} {{alias}} {{headline}} {{bio}} {{photo}}
 * {{github}} {{instagram}} {{website}} {{url}} {{slug}}
 */
const TOKEN_PATTERN =
  /\{\{\s*(name|alias|headline|bio|photo|github|instagram|website|url|slug)\s*\}\}/g;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Panjang kutipan bio untuk kartu direktori (±3 baris).
 * Kartu (standar maupun HTML kustom) tidak boleh ikut melar saat bio panjang —
 * yang tampil hanya sebagian, bio lengkap tetap ada di halaman portofolio.
 */
export const CARD_BIO_EXCERPT_LENGTH = 120;

/** Potong bio menjadi kutipan satu baris logis, dipotong di batas kata + elipsis. */
export function excerptBio(value: string, max = CARD_BIO_EXCERPT_LENGTH): string {
  const text = value.trim().replace(/\s+/g, ' ');
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  const head = lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut;
  return `${head.trimEnd()}…`;
}

type CardMember = Pick<
  PublicUser,
  | 'name'
  | 'alias'
  | 'slug'
  | 'avatarUrl'
  | 'headline'
  | 'bio'
  | 'githubUrl'
  | 'instagramUrl'
  | 'websiteUrl'
>;

/** Ganti token {{...}} dengan data anggota (di-escape agar tidak merusak markup). */
export function fillCardTemplate(template: string, member: CardMember): string {
  const values: Record<string, string> = {
    name: member.alias || member.name,
    alias: member.alias ?? '',
    headline: member.headline?.trim() || 'Anggota',
    bio: excerptBio(member.bio?.trim() || 'Belum menambahkan deskripsi singkat.'),
    photo: assetUrl(member.avatarUrl) ?? '',
    github: member.githubUrl ?? '',
    instagram: member.instagramUrl ?? '',
    website: member.websiteUrl ?? '',
    url: `/m/${member.slug}`,
    slug: member.slug,
  };

  return template.replace(TOKEN_PATTERN, (_, key: string) => escapeHtml(values[key] ?? ''));
}

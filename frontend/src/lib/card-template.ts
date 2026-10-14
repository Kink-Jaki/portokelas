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
const TOKEN_PATTERN = /\{\{\s*(name|alias|headline|bio|photo|github|instagram|website|url|slug)\s*\}\}/g;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
    headline: member.headline?.trim() || 'Anggota Kelas',
    bio: member.bio?.trim() || 'Belum menambahkan deskripsi singkat.',
    photo: assetUrl(member.avatarUrl) ?? '',
    github: member.githubUrl ?? '',
    instagram: member.instagramUrl ?? '',
    website: member.websiteUrl ?? '',
    url: `/m/${member.slug}`,
    slug: member.slug,
  };

  return template.replace(TOKEN_PATTERN, (_, key: string) => escapeHtml(values[key] ?? ''));
}

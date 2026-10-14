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

/** Contoh kartu electric border siap tempel — tinggal ganti teks/tautan bila perlu. */
export const CARD_HTML_EXAMPLE = `<!-- Kartu direktori kustom: token {{...}} diisi otomatis -->
<div class="eb-wrap">
  <svg class="eb-svg" aria-hidden="true">
    <defs>
      <filter id="eb-displace" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="4" result="noise1" seed="1" />
        <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
          <animate attributeName="dy" values="700; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
        </feOffset>
        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="4" result="noise2" seed="1" />
        <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
          <animate attributeName="dy" values="0; -700" dur="6s" repeatCount="indefinite" calcMode="linear" />
        </feOffset>
        <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
        <feDisplacementMap in="SourceGraphic" in2="part1" scale="30" xChannelSelector="R" yChannelSelector="B" />
      </filter>
    </defs>
  </svg>
  <div class="eb-card">
    <div class="eb-frame" aria-hidden="true"></div>
    <div class="eb-content">
      <img class="eb-photo" src="{{photo}}" alt="{{name}}" />
      <span class="eb-pill">Featured</span>
      <h2 class="eb-name">{{name}}</h2>
      <p class="eb-head">{{headline}}</p>
      <p class="eb-bio">{{bio}}</p>
      <div class="eb-btns">
        <a href="{{github}}" target="_blank" rel="noreferrer">GitHub</a>
        <a href="{{instagram}}" target="_blank" rel="noreferrer">Instagram</a>
      </div>
      <a class="eb-more" href="{{url}}" target="_blank" rel="noreferrer">Buka portofolio</a>
    </div>
  </div>
</div>

<style>
  .eb-wrap { display: flex; justify-content: center; padding: 8px; }
  .eb-svg { position: absolute; width: 0; height: 0; overflow: hidden; }
  .eb-card {
    position: relative; width: 100%; padding: 2px; border-radius: 20px;
    background: linear-gradient(-30deg, rgba(221,132,72,.45), transparent, rgba(221,132,72,.45)),
      linear-gradient(to bottom, #1c1917, #1c1917);
  }
  .eb-frame {
    position: absolute; inset: 2px; border-radius: 18px; pointer-events: none;
    border: 2px solid #dd8448; filter: url(#eb-displace);
  }
  .eb-content { position: relative; z-index: 1; padding: 28px 24px; color: #fafaf9; }
  .eb-photo { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 12px; background: #292524; }
  .eb-pill {
    display: inline-block; margin-top: 14px; padding: 6px 14px; border-radius: 14px;
    font: 700 12px/1 system-ui, sans-serif; letter-spacing: .08em; text-transform: uppercase;
    color: rgba(255,255,255,.85); border: 1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.06);
  }
  .eb-name { margin: 12px 0 0; font-size: 26px; line-height: 1.2; }
  .eb-head { margin: 6px 0 0; font: 600 12px/1.5 system-ui, sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #f3b57e; }
  .eb-bio { margin: 10px 0 0; font: 400 14px/1.65 system-ui, sans-serif; color: rgba(255,255,255,.65); }
  .eb-btns { display: flex; gap: 10px; margin-top: 18px; }
  .eb-btns a {
    flex: 1; display: inline-flex; align-items: center; justify-content: center; height: 40px;
    border-radius: 10px; font: 500 14px/1 system-ui, sans-serif; color: #fafaf9; text-decoration: none;
    border: 1px solid rgba(255,255,255,.25);
  }
  .eb-btns a:hover { background: rgba(255,255,255,.1); }
  .eb-more { display: inline-block; margin-top: 14px; font: 500 13px/1 system-ui, sans-serif; color: #f3b57e; }
</style>`;

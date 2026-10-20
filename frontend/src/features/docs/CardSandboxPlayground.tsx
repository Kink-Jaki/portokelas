import { useEffect, useMemo, useState } from 'react';

import { Textarea } from '@/components/ui/Field';
import { MemberCustomHtml } from '@/components/ui/MemberCustomHtml';
import { fillCardTemplate } from '@/lib/card-template';
import { sanitizeCustomHtml } from '@/lib/theme';
import type { PublicUser } from '@/types/api';

const SAMPLE_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23cd4520'/%3E%3Cstop offset='1' stop-color='%23193d32'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23g)'/%3E%3Ccircle cx='100' cy='82' r='34' fill='%23f7f3e8'/%3E%3Cpath d='M40 190c0-38 27-62 60-62s60 24 60 62z' fill='%23f7f3e8'/%3E%3C/svg%3E";

const SAMPLE_MEMBER: PublicUser = {
  id: 'sample',
  name: 'Nadia Prameswari',
  alias: 'Nadia',
  role: 'member',
  slug: 'nadia-prameswari',
  spotifyUrl: null,
  avatarUrl: SAMPLE_AVATAR,
  headline: 'Frontend Developer & UI Designer',
  bio: 'Suka membangun antarmuka yang bersih, cepat, dan menyenangkan untuk dipakai.',
  githubUrl: 'https://github.com/example',
  linkedinUrl: null,
  instagramUrl: 'https://instagram.com/example',
  websiteUrl: 'https://example.com',
  cvUrl: null,
  theme: { preset: 'editorial' },
  cardHtml: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const SAMPLE_CARD_HTML = `<div class="kartu">
  <div class="kartu-avatar">
    <img src="{{photo}}" alt="{{name}}" />
  </div>
  <div class="kartu-body">
    <p class="kartu-eyebrow">{{headline}}</p>
    <h2 class="kartu-nama">{{name}}</h2>
    <p class="kartu-bio">{{bio}}</p>
    <div class="kartu-aksi">
      <a class="tombol" href="{{url}}">Lihat Portofolio</a>
      <a class="tombol tombol-ghost" href="{{github}}">GitHub</a>
    </div>
  </div>
</div>

<style>
  .kartu {
    display: flex;
    gap: 1rem;
    padding: 1.25rem;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: var(--bg-elevated);
    color: var(--fg);
  }
  .kartu-avatar {
    flex: 0 0 auto;
    width: 84px;
    height: 84px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid var(--accent);
  }
  .kartu-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .kartu-eyebrow {
    margin: 0;
    font-size: 0.7rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .kartu-nama { margin: 0.25rem 0 0; font-size: 1.5rem; }
  .kartu-bio { margin: 0.5rem 0 0; color: var(--fg-muted); font-size: 0.9rem; }
  .kartu-aksi { margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .tombol {
    padding: 0.5rem 0.9rem;
    border-radius: 999px;
    background: var(--accent);
    color: var(--accent-fg);
    text-decoration: none;
    font-size: 0.8rem;
    font-weight: 600;
  }
  .tombol-ghost {
    background: transparent;
    color: var(--accent);
    border: 1px solid var(--accent);
  }
</style>`;

/**
 * Playground interaktif untuk tutorial kartu direktori kustom.
 * Sama persis dengan yang dipakai di dashboard: HTML dibersihkan lalu
 * dirender di dalam iframe sandbox (tanpa JavaScript).
 */
export function CardSandboxPlayground() {
  const [code, setCode] = useState(SAMPLE_CARD_HTML);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const safeHtml = useMemo(() => sanitizeCustomHtml(code), [code]);
  const previewHtml = useMemo(() => {
    if (!safeHtml.trim()) return '';
    const filled = fillCardTemplate(safeHtml, SAMPLE_MEMBER);
    if (!isMobile) return filled;
    return `${filled}
<style>
  .kartu { flex-direction: column; align-items: center; text-align: center; }
  .kartu-aksi { justify-content: center; }
</style>`;
  }, [safeHtml, isMobile]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <label className="block text-xs font-medium uppercase tracking-[0.16em] text-muted">
            HTML + CSS
          </label>
          <button
            type="button"
            onClick={() => setCode(SAMPLE_CARD_HTML)}
            className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-muted transition-colors hover:text-fg"
          >
            Reset contoh
          </button>
        </div>
        <Textarea
          aria-label="Editor HTML kartu"
          rows={22}
          spellCheck={false}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="mt-2 font-mono text-xs"
        />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
          Hasil di sandbox
        </p>
        <div className="mt-2 min-h-[30rem] rounded-md border border-line bg-subtle p-4">
          {previewHtml ? (
            <MemberCustomHtml
              html={previewHtml}
              theme={SAMPLE_MEMBER.theme}
              title="Pratinjau kartu direktori"
            />
          ) : (
            <p className="py-10 text-center text-xs text-muted">
              Kode kosong. Tempel HTML dan CSS untuk melihat hasilnya.
            </p>
          )}
        </div>
        <p className="mt-2 text-xs text-muted">
          Pratinjau memakai data anggota contoh: <strong>{SAMPLE_MEMBER.name}</strong>.
        </p>
      </div>
    </div>
  );
}

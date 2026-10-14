import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { assetUrl } from '@/lib/api';
import { cn, initials } from '@/lib/utils';
import { themeToCssVars } from '@/lib/theme';
import type { PublicUser } from '@/types/api';

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden>
      <rect
        x="3.2"
        y="3.2"
        width="17.6"
        height="17.6"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

const socialBaseClasses =
  'h-[42px] shrink-0 flex-1 inline-flex items-center justify-center gap-2 rounded-[10px] ' +
  'text-[0.8125rem] font-medium tracking-[-0.01em] transition-[background-color,border-color,color,transform] ' +
  'duration-200 ease-out active:translate-y-px select-none';

function SocialButton({
  href,
  label,
  icon,
  tone,
}: {
  href: string | null;
  label: string;
  icon: ReactNode;
  tone: 'filled' | 'outline';
}) {
  if (!href) {
    return (
      <span
        aria-disabled="true"
        aria-label={`${label} belum tersedia`}
        title={`${label} belum tersedia`}
        className={cn(
          socialBaseClasses,
          'cursor-not-allowed border border-line bg-transparent text-muted opacity-45',
        )}
      >
        {icon}
        {label}
      </span>
    );
  }

  const toneClasses =
    tone === 'filled'
      ? 'border border-forest bg-forest text-ivory-warm hover:border-forest hover:bg-forest hover:opacity-90'
      : 'border border-forest bg-transparent text-forest hover:border-forest hover:bg-forest hover:text-ivory-warm';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={cn(socialBaseClasses, toneClasses)}
    >
      {icon}
      {label}
    </a>
  );
}

/**
 * Kartu anggota bernuansa editorial — foto portrait dominan, nomor urut,
 * badge posisi/keahlian, deskripsi singkat, dan tombol media sosial.
 * Seluruh kartu dapat diklik menuju portofolio tanpa mengganggu tombol sosial.
 */
export function ClassMemberCard({ member, index }: { member: PublicUser; index?: number }) {
  const name = member.alias || member.name;
  const photo = assetUrl(member.avatarUrl);
  const roleLabel =
    member.headline?.trim() || (member.role === 'admin' ? 'Developer' : 'Anggota Kelas');
  const description =
    member.bio?.trim() || member.headline?.trim() || 'Belum menambahkan deskripsi singkat.';

  const accent = (index ?? 0) % 2 === 0 ? 'bg-maroon' : 'bg-forest';
  const badgeTone = (index ?? 0) % 2 === 0 ? 'bg-maroon' : 'bg-forest';

  return (
    <article
      className="member-card group relative flex h-full flex-col rounded-2xl border border-line bg-elevated p-5 text-fg outline-none transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-forest/50 hover:shadow-[0_26px_48px_-36px_rgba(24,51,40,0.5)] motion-reduce:transform-none motion-reduce:transition-none sm:p-6"
      style={themeToCssVars(member.theme)}
    >
      <Link
        to={`/m/${member.slug}`}
        aria-label={`Buka portofolio ${name}`}
        className="absolute inset-0 z-10 rounded-2xl"
      />

      {/* Nomor urut editorial — sudut kanan atas kartu */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-4 top-4 z-20 rounded-lg border border-line bg-elevated/95 px-2 py-1 font-mono text-[0.6875rem] tabular-nums tracking-[0.14em] text-maroon"
      >
        {String(index ?? '').padStart(2, '0')}
      </span>

      {/* Foto portrait 4:3 dengan aksen sudut geometris */}
      <div className="relative">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-[13px] bg-subtle">
          {photo ? (
            <img
              src={photo}
              alt={`Foto ${name}`}
              loading="lazy"
              className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transform-none"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 bg-gradient-to-b from-elevated to-ivory-alt">
              <span aria-hidden className="font-display text-5xl font-medium text-forest/50">
                {initials(name)}
              </span>
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted">
                Belum ada foto
              </span>
            </div>
          )}
        </div>
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute -bottom-2.5 -left-2.5 h-6 w-6 rotate-45 rounded-[4px] opacity-70',
            accent,
          )}
        />
      </div>

      {/* Nama & badge posisi */}
      <div className="mt-6 min-w-0">
        <h3 className="font-display text-[1.375rem] font-semibold leading-tight tracking-[-0.01em] text-forest sm:text-[1.5rem]">
          {name}
        </h3>
        <span
          className={cn(
            'mt-3 inline-block rounded-md px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ivory-warm',
            badgeTone,
          )}
        >
          {roleLabel}
        </span>
      </div>

      {/* Deskripsi + tombol sosial — menempel di dasar agar tinggi kartu sejajar */}
      <div className="mt-auto pt-5">
        <p className="min-h-[4.4rem] text-[0.9375rem] leading-[1.68] text-muted">{description}</p>
        <span aria-hidden className="mt-4 block h-px w-11 bg-maroon/70" />

        <div className="relative z-20 mt-4 flex gap-3">
          <SocialButton
            href={member.githubUrl}
            label="GitHub"
            icon={<GitHubIcon />}
            tone="filled"
          />
          <SocialButton
            href={member.instagramUrl}
            label="Instagram"
            icon={<InstagramIcon />}
            tone="outline"
          />
        </div>
      </div>
    </article>
  );
}

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { DevBadge } from '@/components/ui/Badge';
import { assetUrl } from '@/lib/api';
import { cn, initials } from '@/lib/utils';
import { themeToCssVars } from '@/lib/theme';
import type { PublicUser } from '@/types/api';

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="15"
      height="15"
      className="h-3.5 w-3.5 sm:h-[15px] sm:w-[15px]"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      className="h-3.5 w-3.5 sm:h-[15px] sm:w-[15px]"
      fill="none"
      aria-hidden
    >
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
  'h-8 min-w-0 shrink-0 flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg ' +
  'text-[0.6875rem] font-medium tracking-[-0.01em] transition-[background-color,border-color,color,transform] ' +
  'duration-200 ease-out active:translate-y-px select-none ' +
  'min-[360px]:gap-2 min-[360px]:text-[0.75rem] min-[390px]:h-9 ' +
  'sm:h-[42px] sm:gap-2 sm:rounded-[10px] sm:text-[0.8125rem]';

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
        <span className="hidden min-[430px]:inline sm:inline">{label}</span>
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
      aria-label={label}
      title={label}
      className={cn(socialBaseClasses, toneClasses)}
    >
      {icon}
      <span className="hidden min-[430px]:inline sm:inline">{label}</span>
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
    member.headline?.trim() || (member.role === 'admin' ? 'Developer' : 'Anggota');
  const description =
    member.bio?.trim() || member.headline?.trim() || 'Belum menambahkan deskripsi singkat.';

  const accent = (index ?? 0) % 2 === 0 ? 'bg-maroon' : 'bg-forest';
  const badgeTone = (index ?? 0) % 2 === 0 ? 'bg-maroon' : 'bg-forest';

  return (
    <article
      className="member-card group relative flex h-full min-w-0 flex-col rounded-2xl border border-line bg-elevated p-2 text-fg outline-none transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-forest/50 hover:shadow-[0_26px_48px_-36px_rgba(24,51,40,0.5)] motion-reduce:transform-none motion-reduce:transition-none min-[360px]:p-2.5 min-[390px]:p-3 sm:p-6"
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
        className="pointer-events-none absolute right-2 top-2 z-20 rounded-lg border border-line bg-elevated/95 px-1.5 py-0.5 font-mono text-[0.5625rem] tabular-nums tracking-[0.1em] text-maroon min-[390px]:right-3 min-[390px]:top-3 min-[390px]:px-2 min-[390px]:py-1 min-[390px]:text-[0.625rem] sm:right-4 sm:top-4 sm:px-2 sm:py-1 sm:text-[0.6875rem] sm:tracking-[0.14em]"
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
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-b from-elevated to-ivory-alt sm:gap-2.5">
              <span
                aria-hidden
                className="font-display text-2xl font-medium text-forest/50 min-[390px]:text-3xl sm:text-5xl"
              >
                {initials(name)}
              </span>
              <span className="hidden font-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted min-[390px]:inline sm:inline">
                Belum ada foto
              </span>
            </div>
          )}
        </div>
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute -bottom-1.5 -left-1.5 h-4 w-4 rotate-45 rounded-[4px] opacity-70 sm:-bottom-2.5 sm:-left-2.5 sm:h-6 sm:w-6',
            accent,
          )}
        />
      </div>

      {/* Nama & badge posisi — maksimal 2 baris agar tinggi card terkendali */}
      <div className="mt-3 min-w-0 sm:mt-6">
        <div className="flex min-w-0 items-center gap-2">
          <h3
            title={name}
            className="min-w-0 line-clamp-2 font-display text-[0.875rem] font-semibold leading-tight tracking-[-0.01em] text-forest min-[360px]:text-[0.9375rem] min-[390px]:text-[1.0625rem] sm:text-[1.5rem]"
          >
            {name}
          </h3>
          {member.role === 'admin' && (
            <span className="shrink-0">
              <DevBadge />
            </span>
          )}
        </div>
        {member.name !== name && (
          <p
            title={member.name}
            className="mt-0.5 truncate text-[0.6875rem] font-medium text-muted sm:mt-1 sm:text-[0.8125rem]"
          >
            {member.name}
          </p>
        )}
        <span
          title={roleLabel}
          className={cn(
            'mt-2 inline-block max-w-full truncate align-top rounded-md px-1.5 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-ivory-warm min-[390px]:mt-3 min-[390px]:px-2 min-[390px]:py-1 min-[390px]:text-[0.625rem] sm:mt-3 sm:px-2.5 sm:py-1 sm:text-[0.6875rem] sm:tracking-[0.15em]',
            badgeTone,
          )}
        >
          {roleLabel}
        </span>
      </div>

      {/* Deskripsi + tombol sosial — tombol menempel di bawah via mt-auto */}
      <div className="mt-auto pt-4 sm:pt-5">
        <p
          title={description}
          style={{ overflowWrap: 'anywhere' }}
          className="line-clamp-2 break-words text-[0.75rem] leading-[1.5] text-muted min-[390px]:text-[0.8125rem] sm:line-clamp-3 sm:text-[0.9375rem] sm:leading-[1.68]"
        >
          {description}
        </p>
        <span aria-hidden className="mt-3 block h-px w-8 bg-maroon/70 sm:mt-4 sm:w-11" />

        <div className="relative z-20 mt-3 flex gap-1.5 min-[390px]:mt-4 sm:mt-4 sm:gap-3">
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

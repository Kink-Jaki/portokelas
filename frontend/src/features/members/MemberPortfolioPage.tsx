import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';

import { DevBadge } from '@/components/ui/Badge';
import { AnimatedRule, Reveal } from '@/components/ui/Reveal';
import { CardSkeletonGrid, Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { buttonClasses } from '@/components/ui/Button';
import { ProjectCardGrid } from '@/components/domain/ProjectCard';
import { SpotifyPlayer } from '@/components/domain/SpotifyPlayer';
import { useMember, useMemberProjects } from '@/hooks/usePublic';
import { assetUrl } from '@/lib/api';
import { fadeUp } from '@/lib/motion';
import { cn, formatDate, initials, userRoleLabel } from '@/lib/utils';

/** Cadangan deskripsi bila member belum mengisi bio — bukan fakta profil. */
const ABOUT_FALLBACK = 'Tulisan tentang diri belum diisi. Bagian ini menyusul.';

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function CvIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden>
      <path
        d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M14 3v5h5M9 13h6M9 17h6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M5 20c.6-3.6 3.4-5.5 7-5.5s6.4 1.9 7 5.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect
        x="4"
        y="5.5"
        width="16"
        height="14.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M4 10h16M8 3.5v4M16 3.5v4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5 19C5 11 11 5 20 5c0 9-6 15-14 15Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M5 19c2-5 6-9 11-11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2c.4 5.3 4.7 9.6 10 10-5.3.4-9.6 4.7-10 10-.4-5.3-4.7-9.6-10-10 5.3-.4 9.6-4.7 10-10Z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 7a4 4 0 0 1 7 3.5C19 15.6 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FlowerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <g stroke="currentColor" strokeWidth="1.15">
        <circle cx="12" cy="6.6" r="2.7" />
        <circle cx="16.8" cy="9.6" r="2.7" />
        <circle cx="16.8" cy="14.4" r="2.7" />
        <circle cx="12" cy="17.4" r="2.7" />
        <circle cx="7.2" cy="14.4" r="2.7" />
        <circle cx="7.2" cy="9.6" r="2.7" />
      </g>
      <circle cx="12" cy="12" r="2" className="fill-maroon-soft" />
    </svg>
  );
}

function Squiggle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 10"
      className={className}
      fill="none"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M2 7c13-6 26 4 39-2s26 4 39-2 26 4 39-2 26 4 39-2 26 4 39-2 12 3 13 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BotanicalSprig({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 108 C 46 92, 78 70, 102 34" strokeWidth="1.4" />
      <g strokeWidth="1.1">
        <g transform="translate(26 94) rotate(-38)">
          <path d="M0 0c-8 9-6 24 0 32 6-8 8-23 0-32Z" />
          <path d="M0 4v26" />
        </g>
        <g transform="translate(48 78) rotate(24)">
          <path d="M0 0c-7 8-5 21 0 28 5-7 7-20 0-28Z" />
          <path d="M0 3v23" />
        </g>
        <g transform="translate(66 58) rotate(-30)">
          <path d="M0 0c-7 8-5 21 0 28 5-7 7-20 0-28Z" />
          <path d="M0 3v23" />
        </g>
        <g transform="translate(84 42) rotate(18)">
          <path d="M0 0c-5 6-4 16 0 21 4-5 5-15 0-21Z" />
          <path d="M0 2v17" />
        </g>
        <g transform="translate(98 28) rotate(-12)">
          <path d="M0 0c-4 5-3 13 0 17 3-4 4-12 0-17Z" />
          <path d="M0 2v13" />
        </g>
      </g>
    </svg>
  );
}

function ColorBand() {
  return (
    <span aria-hidden className="absolute inset-x-0 top-0 z-20 flex h-1">
      <span className="h-full flex-[2.2] bg-maroon" />
      <span className="h-full flex-1 bg-sage" />
      <span className="h-full flex-1 bg-maroon-soft" />
    </span>
  );
}

/** Bentuk organik + botanikal di latar halaman (tidak menyentuh teks). */
function PortfolioOrnaments() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <span className="absolute -right-32 -top-28 h-80 w-80 rounded-[58%_42%_46%_54%] bg-sage-soft/70" />
      {/* Lingkaran tepi: di mobile diperkecil dan didorong keluar layar
          sehingga hanya menyembul di balik padding container — tidak
          menutupi teks. Mulai sm kembali ke ukuran penuh. */}
      <span className="absolute -left-36 top-1/3 h-40 w-40 rounded-full bg-maroon sm:-left-28 sm:h-64 sm:w-64" />
      <span className="absolute -right-36 top-3/4 h-40 w-40 -translate-y-1/2 rounded-full bg-sage sm:-right-20 sm:h-44 sm:w-44" />
      <span className="absolute -right-[9.75rem] top-3/4 h-44 w-44 -translate-y-1/2 rounded-full border border-forest/40 sm:-right-28 sm:h-60 sm:w-60" />
      <span className="absolute bottom-24 right-10 hidden h-56 w-56 rounded-[52%_48%_38%_62%] bg-sage-soft/50 lg:block" />
      <FlowerIcon className="absolute -left-6 top-24 h-12 w-12 text-sage/35 sm:h-20 sm:w-20" />
      <FlowerIcon className="absolute -right-4 bottom-52 hidden h-14 w-14 text-maroon-soft/25 lg:block" />
      <BotanicalSprig className="absolute -left-10 bottom-40 hidden h-36 w-36 rotate-[14deg] text-sage/45 lg:block" />
      <SparkIcon className="absolute right-1/4 top-40 hidden h-3.5 w-3.5 text-gold/60 lg:block" />
    </div>
  );
}

/** Eyebrow: "01 — PORTOFOLIO MEMBER". */
function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 font-mono text-[0.6875rem] uppercase tracking-[0.28em] text-muted">
      <span className="tnum text-maroon-soft">{index}</span>
      <span aria-hidden className="text-line-strong">
        —
      </span>
      <span className="text-accent sm:text-muted">{children}</span>
    </p>
  );
}

/** Tombol sosial/CV: link aktif bila URL tersedia, tombol nonaktif bila kosong. */
function PortfolioAction({
  href,
  label,
  variant = 'outline',
  children,
}: {
  href: string | null;
  label: string;
  variant?: 'primary' | 'outline';
  children: ReactNode;
}) {
  const base =
    'inline-flex h-11 items-center gap-2.5 rounded-full border px-5 text-sm font-medium tracking-tight transition-[background-color,border-color,color,transform] duration-300 ease-editorial';

  if (!href) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        aria-label={`${label} tidak tersedia`}
        className={cn(base, 'cursor-not-allowed border-line bg-elevated/50 text-muted/60')}
      >
        {children}
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      aria-label={label}
      className={cn(
        base,
        'group active:translate-y-px',
        variant === 'primary'
          ? 'border-maroon-soft bg-maroon-soft text-ivory-warm hover:border-maroon hover:bg-maroon'
          : 'border-forest/50 bg-bg/70 text-forest hover:border-forest hover:bg-forest hover:text-ivory-warm',
      )}
    >
      {children}
    </a>
  );
}

/** Foto profil ditempel seperti pada scrapbook: bingkai tipis + selotip sage. */
function PortraitCard({ name, src }: { name: string; src: string | null }) {
  const url = assetUrl(src);

  return (
    <div className="relative mx-auto w-full max-w-[19rem] lg:ml-auto lg:max-w-[20.5rem]">
      <span
        aria-hidden
        className="absolute -left-3 -top-3 hidden h-full w-full -rotate-2 rounded-[10px] border border-line bg-sage-soft/70 sm:block"
      />

      <figure className="relative rounded-[10px] border border-line bg-elevated p-2 shadow-[0_22px_44px_-34px_rgba(104,43,34,0.65)]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-subtle">
          {url ? (
            <img
              src={url}
              alt={`Foto ${name}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <span className="font-display text-6xl font-semibold tracking-[0.06em] text-maroon/70">
                {initials(name)}
              </span>
            </div>
          )}
        </div>
      </figure>

      {/* Selotip dekoratif di bagian atas frame. */}
      <span
        aria-hidden
        className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3 border-y border-sage/60 bg-sage/70 sm:w-28"
      />

      {/* Daun kecil di sudut bawah foto. */}
      <LeafIcon className="pointer-events-none absolute -bottom-5 -left-5 h-11 w-11 rotate-[18deg] text-forest/75" />
      <SparkIcon className="pointer-events-none absolute -bottom-3 right-6 h-3.5 w-3.5 text-maroon-soft/70" />
    </div>
  );
}

/** Satu kolom pada panel informasi member (`dl > div > dt/dd`). */
function InfoColumn({
  icon,
  iconClassName,
  label,
  value,
  note,
  className,
}: {
  icon: ReactNode;
  iconClassName: string;
  label: string;
  value: ReactNode;
  note?: ReactNode;
  className?: string;
}) {
  return (
    /* Mobile (<640px): satu baris grid — ikon di kiri (memanjang dua baris),
       label + isi di kanan. Mulai sm kembali ke tata letak desktop. */
    <div
      className={cn(
        'relative grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1 p-4 sm:block sm:p-5',
        className,
      )}
    >
      <dt className="contents sm:flex sm:items-center sm:gap-3">
        <span
          aria-hidden
          className={cn(
            'row-span-2 grid h-9 w-9 shrink-0 place-items-center self-center rounded-full border border-line/70',
            iconClassName,
          )}
        >
          {icon}
        </span>
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.26em] text-muted">
          {label}
        </span>
      </dt>
      <dd className="col-start-2 mt-1 font-display text-lg leading-snug break-words text-maroon sm:col-start-auto sm:mt-2.5 sm:text-xl">
        {value}
        {note ? (
          <span className="mt-0.5 block font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted sm:mt-1">
            {note}
          </span>
        ) : null}
      </dd>
    </div>
  );
}

function PortfolioSkeleton() {
  return (
    <section className="section-portfolio relative isolate overflow-hidden">
      <ColorBand />
      <div className="container-page py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          <div className="order-2 space-y-5 lg:order-1 lg:col-span-7 xl:col-span-8">
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-20 w-3/5" />
            <Skeleton className="h-3 w-52" />
            <Skeleton className="mt-6 h-11 w-72 rounded-full" />
          </div>
          <div className="order-1 flex justify-start lg:order-2 lg:col-span-5 lg:justify-end xl:col-span-4">
            <Skeleton className="aspect-[4/5] w-full max-w-[17rem] rounded-[10px] lg:max-w-[20.5rem]" />
          </div>
        </div>
        <Skeleton className="mt-14 h-32 w-full rounded-[14px]" />
        <div className="mt-14">
          <CardSkeletonGrid count={3} />
        </div>
      </div>
    </section>
  );
}

export default function MemberPortfolioPage() {
  const { slug = '' } = useParams();
  const memberQuery = useMember(slug);
  const projectsQuery = useMemberProjects(slug);

  const member = memberQuery.data?.member;
  const projects = projectsQuery.data?.projects ?? [];

  if (memberQuery.isLoading) {
    return <PortfolioSkeleton />;
  }

  if (memberQuery.isError || !member) {
    return (
      <section className="section-portfolio relative isolate overflow-hidden">
        <ColorBand />
        <div className="container-page py-20">
          <div className="mx-auto max-w-2xl overflow-hidden rounded-[14px] border border-line bg-elevated">
            <EmptyState
              title="Portofolio tidak ditemukan"
              description={
                memberQuery.isError
                  ? memberQuery.error.message
                  : 'Kreator ini belum tersedia atau tautannya salah.'
              }
              action={
                <Link to="/members" className={buttonClasses('outline')}>
                  Kembali ke direktori
                </Link>
              }
            />
          </div>
        </div>
      </section>
    );
  }

  const projectCountLabel = projectsQuery.isLoading ? '—' : String(projects.length);
  const headline = member.headline?.trim() || null;
  const roleTitle = headline ?? (member.role === 'admin' ? 'Admin / Developer' : 'Kreator');
  const roleNote = headline ? (userRoleLabel[member.role] ?? null) : null;
  const aboutText = member.bio?.trim() || ABOUT_FALLBACK;
  const displayName = (member.alias || member.name).trim();
  const nameSizeClass =
    displayName.length > 20
      ? 'text-[clamp(2rem,7vw,4.4rem)]'
      : displayName.length > 10
        ? 'text-[clamp(2.6rem,9vw,5.8rem)]'
        : 'text-[clamp(3.1rem,11vw,7.5rem)]';

  return (
    <section className="member-portfolio section-portfolio relative isolate overflow-hidden">
      <ColorBand />
      <PortfolioOrnaments />

      <div className="container-page relative z-10 py-14 sm:py-16 lg:py-20">
        <motion.header variants={fadeUp} initial="hidden" animate="show">
          {/* Eyebrow khusus mobile: label muncul sebelum foto agar urutannya
              label → foto → nama → tombol seperti desain referensi. */}
          <div className="mb-7 flex flex-wrap items-center gap-3 sm:hidden">
            <SectionLabel index="01">Portofolio Member</SectionLabel>
            {member.role === 'admin' ? <DevBadge /> : null}
          </div>

          <div className="grid gap-8 sm:gap-12 lg:grid-cols-12 lg:items-center lg:gap-10 xl:gap-16">
            {/* ——— Kolom kiri: judul + tautan ——— */}
            <div className="order-2 min-w-0 lg:order-1 lg:col-span-7 xl:col-span-8">
              <div className="hidden flex-wrap items-center gap-3 sm:flex">
                <SectionLabel index="01">Portofolio Member</SectionLabel>
                {member.role === 'admin' ? <DevBadge /> : null}
              </div>

              <div className="relative mt-9 sm:mt-15">
                <LeafIcon className="pointer-events-none absolute -left-1 -top-9 h-5 w-5 -rotate-12 text-forest/75 sm:-top-14 sm:h-7 sm:w-7" />
                <FlowerIcon className="pointer-events-none absolute -top-9 right-3 h-5 w-5 text-maroon-soft/45 sm:-top-14 sm:right-6 sm:h-8 sm:w-8" />
                <HeartIcon className="pointer-events-none absolute -top-8 right-14 h-4 w-4 text-maroon-soft/70 sm:-top-11 sm:right-24 sm:h-5 sm:w-5" />
                <SparkIcon className="pointer-events-none absolute -top-9 right-24 h-3 w-3 text-gold sm:-top-12 sm:right-40 sm:h-4 sm:w-4" />

                <h1
                  className={cn(
                    'text-balance break-words font-display font-semibold uppercase leading-[0.94] tracking-[-0.035em] text-maroon [overflow-wrap:anywhere]',
                    nameSizeClass,
                  )}
                >
                  {displayName}
                </h1>

                <Squiggle className="mt-3 h-3 w-full max-w-[26rem] text-forest" />
              </div>

              {member.alias ? (
                <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-muted sm:text-sm">
                  {member.name}
                </p>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center gap-2.5 sm:mt-9 sm:gap-3">
                <PortfolioAction href={member.instagramUrl} label="Instagram">
                  <InstagramIcon />
                  Instagram
                </PortfolioAction>
                <PortfolioAction href={member.githubUrl} label="GitHub">
                  <GitHubIcon />
                  GitHub
                </PortfolioAction>
                <PortfolioAction href={member.cvUrl} label="Buka CV" variant="primary">
                  <CvIcon />
                  Buka CV
                </PortfolioAction>
              </div>
            </div>

            {/* ——— Kolom kanan: foto seperti ditempel ——— */}
            <div className="order-1 flex justify-center lg:order-2 lg:col-span-5 lg:justify-end xl:col-span-4">
              <PortraitCard name={member.name} src={member.avatarUrl} />
            </div>
          </div>

          {/* ——— Panel informasi member ——— */}
          <div className="relative mt-10 overflow-hidden rounded-[14px] border border-line bg-elevated/70 sm:mt-12 lg:mt-16">
            <dl className="grid sm:grid-cols-3">
              <InfoColumn
                className="border-b border-line sm:border-b-0 sm:border-r"
                icon={<UserIcon className="h-5 w-5" />}
                iconClassName="bg-blush text-maroon-soft"
                label="Peran"
                value={roleTitle}
                note={roleNote}
              />
              <InfoColumn
                className="border-b border-line sm:border-b-0 sm:border-r"
                icon={<CalendarIcon className="h-5 w-5" />}
                iconClassName="bg-sage/55 text-forest"
                label="Bergabung"
                value={formatDate(member.createdAt)}
              />
              <InfoColumn
                icon={<FolderIcon className="h-5 w-5" />}
                iconClassName="bg-sage-soft text-forest"
                label="Project tayang"
                value={<span className="tnum">{projectCountLabel}</span>}
                note={projectsQuery.isLoading ? undefined : 'Karya yang dipublikasikan'}
              />
            </dl>
            <LeafIcon className="pointer-events-none absolute bottom-4 right-5 hidden h-7 w-7 rotate-[24deg] text-sage/80 lg:block" />
          </div>
        </motion.header>

        {/* ——— Pemisah ——— */}
        <div className="mt-14 lg:mt-16">
          <AnimatedRule className="bg-line" />
        </div>

        {/* ——— 02 — Tentang saya ——— */}
        <section className="relative mt-12 sm:mt-14" aria-label="Tentang Saya">
          <Reveal>
            <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:gap-10 lg:gap-14">
              <div className="relative shrink-0">
                <SectionLabel index="02">Tentang Saya</SectionLabel>

                <div className="relative mt-7 inline-block">
                  <h2 className="font-display text-4xl font-semibold leading-none tracking-[-0.03em] text-maroon sm:text-5xl lg:text-[3.4rem]">
                    About
                  </h2>
                  <Squiggle className="mt-3 h-2.5 w-40 text-forest sm:w-56" />
                </div>
              </div>

              <Reveal delay={0.06} className="min-w-0 max-w-3xl sm:mt-11">
                <p
                  className={cn(
                    'whitespace-pre-line text-base leading-[1.9] text-muted sm:text-lg',
                    member.bio ? '' : 'italic text-muted/80',
                  )}
                >
                  {aboutText}
                </p>
              </Reveal>
            </div>
          </Reveal>

          {member.spotify ? (
            <Reveal className="mt-10">
              <div className="overflow-hidden rounded-[14px] border border-line bg-elevated">
                <div className="flex items-center justify-between gap-4 bg-maroon px-5 py-3">
                  <p className="flex items-center gap-2.5 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-ivory-warm">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sage" />
                    Sedang didengar
                  </p>
                  <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ivory-warm/70">
                    Spotify
                  </p>
                </div>
                <div className="p-3 sm:p-4">
                  <SpotifyPlayer spotify={member.spotify} />
                </div>
              </div>
            </Reveal>
          ) : null}
        </section>

        {/* ——— Pemisah + 03 — Karya ——— */}
        <div className="mt-14 lg:mt-16">
          <AnimatedRule className="bg-line" />
        </div>

        <section className="relative mt-12 sm:mt-14" aria-label="Project">
          <BotanicalSprig className="pointer-events-none absolute -bottom-8 right-0 hidden h-24 w-24 rotate-12 text-sage opacity-25 lg:block" />

          <Reveal>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
              <div>
                <SectionLabel index="03">Karya</SectionLabel>
                <h2 className="mt-4 flex items-center gap-3 font-display text-4xl font-semibold leading-none tracking-[-0.03em] text-maroon sm:text-5xl lg:text-[3.4rem]">
                  Project
                  <FlowerIcon className="h-6 w-6 shrink-0 text-sage sm:h-7 sm:w-7" />
                </h2>
              </div>
              <p className="inline-flex items-center gap-2 self-start rounded-full border border-line-strong bg-elevated/70 px-4 py-2 font-mono text-[0.6875rem] uppercase tracking-[0.24em] text-maroon">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-maroon-soft" />
                <span className="tnum">{projectCountLabel}</span> Project tayang
              </p>
            </div>
          </Reveal>

          <div className="mt-8 h-px w-full bg-line" />

          <div className="mt-10">
            {projectsQuery.isLoading ? (
              <CardSkeletonGrid count={3} />
            ) : projectsQuery.isError ? (
              <ErrorState
                error={projectsQuery.error}
                onRetry={() => void projectsQuery.refetch()}
              />
            ) : projects.length === 0 ? (
              <div className="relative overflow-hidden rounded-[14px] border border-dashed border-sage/60 bg-sage-soft/30 [&>div]:py-10 sm:[&>div]:py-16">
                <span
                  aria-hidden
                  className="absolute -right-6 -top-6 h-24 w-24 rounded-[48%_52%_60%_40%] bg-sage-soft/70"
                />
                <span
                  aria-hidden
                  className="absolute -bottom-8 -left-8 h-28 w-28 rounded-[55%_45%_40%_60%] bg-maroon-tint"
                />
                <EmptyState
                  title="Belum ada project"
                  description={`${member.name} belum menambahkan project yang publik.`}
                  icon={<FlowerIcon className="h-9 w-9 text-sage" />}
                />
              </div>
            ) : (
              <ProjectCardGrid projects={projects} ownerSlug={member.slug} featured />
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

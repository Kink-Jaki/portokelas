import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Avatar } from '@/components/ui/Avatar';
import { DevBadge } from '@/components/ui/Badge';
import { AnimatedRule, Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CardSkeletonGrid, Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { buttonClasses } from '@/components/ui/Button';
import { ProjectCardGrid } from '@/components/domain/ProjectCard';
import { SpotifyPlayer } from '@/components/domain/SpotifyPlayer';
import { useMember, useMemberProjects } from '@/hooks/usePublic';
import { fadeUp } from '@/lib/motion';
import { formatDate } from '@/lib/utils';

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

/** Tombol yang menjadi link bila ada URL, atau tombol nonaktif bila kosong. */
function ActionButton({
  href,
  variant = 'outline',
  children,
}: {
  href: string | null;
  variant?: 'primary' | 'outline';
  children: ReactNode;
}) {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={buttonClasses(variant, 'sm')}
      >
        {children}
      </a>
    );
  }

  return (
    <button type="button" disabled className={buttonClasses(variant, 'sm')}>
      {children}
    </button>
  );
}

export default function MemberPortfolioPage() {
  const { slug = '' } = useParams();
  const memberQuery = useMember(slug);
  const projectsQuery = useMemberProjects(slug);

  const member = memberQuery.data?.member;
  const projects = projectsQuery.data?.projects ?? [];

  if (memberQuery.isLoading) {
    return (
      <div className="container-page py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-8">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-4 w-full max-w-xl" />
            <Skeleton className="h-4 w-2/3 max-w-md" />
          </div>
          <div className="lg:col-span-4 lg:flex lg:justify-end">
            <Skeleton className="h-40 w-40" />
          </div>
        </div>
        <div className="mt-14">
          <CardSkeletonGrid count={3} />
        </div>
      </div>
    );
  }

  if (memberQuery.isError || !member) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto max-w-2xl border border-line">
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
    );
  }

  const projectCountLabel = projectsQuery.isLoading ? '—' : String(projects.length);

  return (
    <div className="container-page py-16 lg:py-20">
      <motion.header variants={fadeUp} initial="hidden" animate="show">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="order-2 min-w-0 lg:order-1 lg:col-span-8">
            <p className="eyebrow flex items-center gap-3">
              <span className="index-num">01</span>
              <span aria-hidden className="h-px w-6 bg-line-strong" />
              Portofolio Kreator
            </p>

            <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-3">
              <h1 className="text-balance font-display text-[clamp(2.75rem,7vw,5.25rem)] leading-[0.95] tracking-[-0.035em]">
                {member.alias || member.name}
              </h1>
              {member.role === 'admin' ? <DevBadge /> : null}
            </div>

            {member.alias ? (
              <p className="mt-3 font-mono text-sm uppercase tracking-[0.16em] text-muted">
                {member.name}
              </p>
            ) : null}

            {member.headline ? (
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fg sm:text-xl">
                {member.headline}
              </p>
            ) : null}

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ActionButton href={member.instagramUrl}>
                <InstagramIcon />
                Instagram
              </ActionButton>
              <ActionButton href={member.githubUrl}>
                <GitHubIcon />
                GitHub
              </ActionButton>
              <ActionButton href={member.cvUrl} variant="primary">
                <CvIcon />
                Buka CV
              </ActionButton>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-4 lg:flex lg:justify-end">
            <div className="relative">
              <span
                aria-hidden
                className="absolute -left-3 -top-3 hidden h-full w-full border border-line-strong lg:block"
              />
              <Avatar
                name={member.name}
                src={member.avatarUrl}
                size="xl"
                className="relative border-line-strong"
              />
            </div>
          </div>
        </div>

        <dl className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
          <div className="bg-bg p-6">
            <dt className="eyebrow">Peran</dt>
            <dd className="mt-3 font-display text-lg">
              {member.role === 'admin' ? 'Admin / Developer' : 'Kreator'}
            </dd>
          </div>
          <div className="bg-bg p-6">
            <dt className="eyebrow">Bergabung</dt>
            <dd className="mt-3 font-display text-lg">{formatDate(member.createdAt)}</dd>
          </div>
          <div className="bg-bg p-6">
            <dt className="eyebrow">Project tayang</dt>
            <dd className="mt-3 font-display text-lg tabular-nums">{projectCountLabel}</dd>
          </div>
        </dl>
      </motion.header>

      {member.spotify ? (
        <Reveal className="mt-12">
          <div className="overflow-hidden border border-line">
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
              <p className="eyebrow flex items-center gap-2.5">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
                Sedang didengar
              </p>
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
                Spotify
              </p>
            </div>
            <div className="p-3 sm:p-4">
              <SpotifyPlayer spotify={member.spotify} />
            </div>
          </div>
        </Reveal>
      ) : null}

      {member.bio ? (
        <Reveal className={member.spotify ? 'mt-10' : 'mt-12'}>
          <div className="grid gap-4 lg:grid-cols-12 lg:gap-8">
            <p className="eyebrow lg:col-span-2">Bio</p>
            <p className="whitespace-pre-line text-base leading-relaxed text-muted lg:col-span-10 lg:max-w-3xl lg:text-lg lg:leading-[1.75]">
              {member.bio}
            </p>
          </div>
        </Reveal>
      ) : null}

      <AnimatedRule className="mt-16" />

      <section className="mt-12" aria-label="Project">
        <Reveal>
          <SectionHeader
            index="02"
            eyebrow="Karya"
            title="Project"
            description={
              projects.length > 0
                ? 'Kumpulan project yang dikerjakan dan dibagikan secara publik.'
                : undefined
            }
            action={
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
                {projects.length} project
              </p>
            }
          />
        </Reveal>

        <div className="mt-10">
          {projectsQuery.isLoading ? (
            <CardSkeletonGrid count={3} />
          ) : projectsQuery.isError ? (
            <ErrorState error={projectsQuery.error} onRetry={() => void projectsQuery.refetch()} />
          ) : projects.length === 0 ? (
            <div className="border border-line">
              <EmptyState
                title="Belum ada project"
                description={`${member.name} belum menambahkan project yang publik.`}
              />
            </div>
          ) : (
            <ProjectCardGrid projects={projects} ownerSlug={member.slug} featured />
          )}
        </div>
      </section>
    </div>
  );
}

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Avatar } from '@/components/ui/Avatar';
import { AnimatedRule, Reveal, Stagger } from '@/components/ui/Reveal';
import { CardSkeletonGrid, Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { buttonClasses } from '@/components/ui/Button';
import { ProjectCardGrid } from '@/components/domain/ProjectCard';
import { useMember, useMemberProjects } from '@/hooks/usePublic';
import { fadeUp } from '@/lib/motion';

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
      <div className="container-page py-16">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
          <Skeleton className="h-32 w-32 sm:h-40 sm:w-40" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-full max-w-xl" />
            <Skeleton className="h-3 w-2/3 max-w-md" />
          </div>
        </div>
        <div className="mt-16">
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
                : 'Anggota ini belum disetujui atau tautannya salah.'
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

  return (
    <div className="container-page py-14">
      <motion.header
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12"
      >
        <Avatar name={member.name} src={member.avatarUrl} size="xl" />

        <div className="min-w-0 flex-1">
          <p className="eyebrow">Portofolio Anggota</p>
          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">{member.name}</h1>

          {member.headline ? (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fg">{member.headline}</p>
          ) : null}

          {member.bio ? (
            <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-muted">
              {member.bio}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
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
      </motion.header>

      <AnimatedRule className="mt-14" />

      <section className="mt-12" aria-labelledby="projects-heading">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="projects-heading" className="font-display text-3xl">
              Project
            </h2>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
              {projects.length} project
            </p>
          </div>
        </Reveal>

        <div className="mt-8">
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
            <Stagger>
              <ProjectCardGrid projects={projects} ownerSlug={member.slug} />
            </Stagger>
          )}
        </div>
      </section>
    </div>
  );
}

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { ProjectCover, TechStack } from './shared';
import { buttonClasses } from '@/components/ui/Button';
import { staggerItem } from '@/lib/motion';
import { formatDate } from '@/lib/utils';
import type { Project } from '@/types/api';

export function projectHref(project: Project, ownerSlug?: string): string {
  return ownerSlug ? `/m/${ownerSlug}/${project.slug}` : `/project/${project.slug}`;
}

/** Tombol project: link bila URL ada, tombol nonaktif bila kosong. */
function ProjectAction({
  href,
  variant,
  children,
}: {
  href: string | null;
  variant: 'primary' | 'outline';
  children: ReactNode;
}) {
  const className = buttonClasses(variant, 'sm', 'flex-1');

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <button type="button" disabled className={className}>
      {children}
    </button>
  );
}

export function ProjectCard({
  project,
  href,
  meta,
}: {
  project: Project;
  href?: string;
  meta?: string;
}) {
  return (
    <motion.div variants={staggerItem} className="h-full">
      <div className="group flex h-full flex-col border border-line bg-bg transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]">
        <Link to={href ?? projectHref(project)} className="flex flex-1 flex-col">
          <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-subtle">
            <div className="absolute inset-0 [&>img]:grayscale [&>img]:opacity-90 transition-all duration-500 group-hover:[&>img]:grayscale-0 group-hover:[&>img]:opacity-100">
              <ProjectCover project={project} />
            </div>
            {project.isHidden ? (
              <span className="absolute left-3 top-3 rounded-sm bg-invert px-2 py-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-invert-fg">
                Disembunyikan
              </span>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col gap-4 p-6">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg leading-snug">{project.title}</h3>
                <span
                  aria-hidden
                  className="mt-1 shrink-0 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                    <path d="M5 19L19 5M9 5h10v10" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </span>
              </div>
              <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-muted">
                {project.shortDescription || 'Tanpa deskripsi singkat.'}
              </p>
            </div>

            <TechStack items={project.techStack ?? []} className="mt-auto" />

            <div className="flex items-center justify-between gap-3 border-t border-line pt-3 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
              <span className="truncate">{meta ?? project.slug}</span>
              <span>{formatDate(project.createdAt)}</span>
            </div>
          </div>
        </Link>

        <div className="flex flex-wrap gap-2 border-t border-line p-4">
          <ProjectAction href={project.demoUrl} variant="primary">
            Live Demo
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
              <path d="M5 19L19 5M9 5h10v10" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </ProjectAction>
          <ProjectAction href={project.repoUrl} variant="outline">
            Source Code
          </ProjectAction>
        </div>
      </div>
    </motion.div>
  );
}

export function ProjectCardGrid({
  projects,
  ownerSlug,
}: {
  projects: Project[];
  ownerSlug?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} href={projectHref(project, ownerSlug)} />
      ))}
    </div>
  );
}

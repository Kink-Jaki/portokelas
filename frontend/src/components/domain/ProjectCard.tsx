import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { ProjectCover, TechStack } from './shared';
import { buttonClasses } from '@/components/ui/Button';
import { Stagger } from '@/components/ui/Reveal';
import { staggerItem } from '@/lib/motion';
import { formatDate } from '@/lib/utils';
import type { Project } from '@/types/api';

export function projectHref(project: Project, ownerSlug?: string): string {
  return ownerSlug ? `/m/${ownerSlug}/${project.slug}` : `/project/${project.slug}`;
}

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden className={className}>
      <path d="M5 19L19 5M9 5h10v10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
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
  const className = buttonClasses(variant, 'sm');

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer nofollow" className={className}>
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

function ProjectMeta({ project, meta }: { project: Project; meta?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line pt-4 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
      <span className="truncate">{meta ?? project.slug}</span>
      <span className="shrink-0">{formatDate(project.createdAt)}</span>
    </div>
  );
}

export function ProjectCard({
  project,
  href,
  meta,
  index,
}: {
  project: Project;
  href?: string;
  meta?: string;
  index?: number;
}) {
  return (
    <motion.article variants={staggerItem} className="group flex h-full flex-col bg-bg">
      <Link to={href ?? projectHref(project)} className="flex flex-1 flex-col">
        <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-subtle">
          <div className="absolute inset-0 transition-transform duration-700 ease-editorial group-hover:scale-[1.04] [&>img]:opacity-90 [&>img]:grayscale group-hover:[&>img]:opacity-100 group-hover:[&>img]:grayscale-0">
            <ProjectCover project={project} />
          </div>
          {index !== undefined ? (
            <span className="absolute left-4 top-4 border border-line bg-bg/85 px-2 py-1 font-mono text-[0.625rem] tracking-[0.14em] text-muted backdrop-blur">
              {String(index).padStart(2, '0')}
            </span>
          ) : null}
          {project.isHidden ? (
            <span className="absolute right-4 top-4 bg-invert px-2 py-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-invert-fg">
              Disembunyikan
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-xl leading-snug">{project.title}</h3>
            <ArrowUpRight className="mt-1 shrink-0 -translate-x-1 text-muted opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100" />
          </div>
          <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-muted">
            {project.shortDescription || 'Tanpa deskripsi singkat.'}
          </p>

          <TechStack items={project.techStack ?? []} className="mt-5" />

          <div className="mt-auto pt-6">
            <ProjectMeta project={project} meta={meta} />
          </div>
        </div>
      </Link>

      <div className="flex flex-wrap gap-2 border-t border-line p-4">
        <ProjectAction href={project.demoUrl} variant="primary">
          Live Demo
          <ArrowUpRight className="h-3.5 w-3.5" />
        </ProjectAction>
        <ProjectAction href={project.repoUrl} variant="outline">
          Source Code
        </ProjectAction>
      </div>
    </motion.article>
  );
}

/** Sorotan project pertama: komposisi dua kolom asimetris, lebih besar. */
export function ProjectSpotlight({
  project,
  href,
}: {
  project: Project;
  href?: string;
}) {
  const target = href ?? projectHref(project);

  return (
    <motion.article
      variants={staggerItem}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-10% 0px' }}
      className="group grid overflow-hidden border border-line bg-bg lg:grid-cols-2"
    >
      <Link
        to={target}
        className="relative block min-h-64 overflow-hidden border-b border-line bg-subtle lg:min-h-full lg:border-b-0 lg:border-r"
      >
        <div className="absolute inset-0 transition-transform duration-700 ease-editorial group-hover:scale-[1.03] [&>img]:opacity-90 [&>img]:grayscale group-hover:[&>img]:opacity-100 group-hover:[&>img]:grayscale-0">
          <ProjectCover project={project} />
        </div>
        <span className="absolute left-4 top-4 border border-line bg-bg/85 px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted backdrop-blur">
          Project unggulan
        </span>
      </Link>

      <div className="flex flex-col p-8 lg:p-12">
        <p className="eyebrow flex items-center gap-3">
          <span className="index-num">01</span>
          <span aria-hidden className="h-px w-6 bg-line-strong" />
          Sorotan
        </p>
        <h3 className="mt-5 font-display text-3xl leading-[1.08] tracking-[-0.02em] sm:text-4xl">
          {project.title}
        </h3>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
          {project.shortDescription || 'Tanpa deskripsi singkat.'}
        </p>

        <TechStack items={project.techStack ?? []} className="mt-6" />

        <ProjectMeta project={project} />

        <div className="mt-auto flex flex-wrap gap-3 pt-8">
          <Link to={target} className={buttonClasses('primary', 'sm')}>
            Selengkapnya
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          {project.demoUrl ? (
            <ProjectAction href={project.demoUrl} variant="outline">
              Live Demo
            </ProjectAction>
          ) : null}
          {project.repoUrl ? (
            <ProjectAction href={project.repoUrl} variant="outline">
              Source Code
            </ProjectAction>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

export function ProjectCardGrid({
  projects,
  ownerSlug,
  featured = false,
}: {
  projects: Project[];
  ownerSlug?: string;
  /** Tampilkan project pertama sebagai sorotan dua kolom. */
  featured?: boolean;
}) {
  if (featured && projects.length > 0) {
    const [first, ...rest] = projects;
    if (!first) return null;
    return (
      <div className="space-y-px">
        <ProjectSpotlight project={first} href={projectHref(first, ownerSlug)} />
        {rest.length > 0 ? (
          <Stagger className="mt-px grid grid-cols-1 gap-px overflow-hidden border border-line bg-line md:grid-cols-2 xl:grid-cols-3">
            {rest.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                href={projectHref(project, ownerSlug)}
                index={index + 2}
              />
            ))}
          </Stagger>
        ) : null}
      </div>
    );
  }

  return (
    <Stagger className="grid grid-cols-1 gap-px overflow-hidden border border-line bg-line md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          href={projectHref(project, ownerSlug)}
          index={index + 1}
        />
      ))}
    </Stagger>
  );
}

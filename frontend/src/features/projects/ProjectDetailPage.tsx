import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Avatar } from '@/components/ui/Avatar';
import { DevBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Markdown } from '@/components/ui/Markdown';
import { Skeleton } from '@/components/ui/Skeleton';
import { buttonClasses } from '@/components/ui/Button';
import { SocialLinks, TechStack } from '@/components/domain/shared';
import { useProject } from '@/hooks/usePublic';
import { assetUrl } from '@/lib/api';
import { fadeUp } from '@/lib/motion';
import { formatDate } from '@/lib/utils';
import { LikeButton } from '@/components/project/LikeButton';
import { CommentForm } from '@/components/project/CommentForm';
import { CommentList } from '@/components/project/CommentList';
import { useAuth } from '@/providers/AuthProvider';

function Gallery({ images, title }: { images: string[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <section className="mt-12 space-y-4" aria-label={`Galeri ${title}`}>
      <div className="grid grid-cols-2 gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative aspect-[4/3] overflow-hidden bg-subtle"
          >
            <img
              src={assetUrl(image) ?? ''}
              alt={`${title} — gambar ${index + 1}`}
              loading="lazy"
              className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
            />
            <span className="absolute inset-0 bg-fg/0 transition-colors duration-300 group-hover:bg-fg/10" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activeIndex !== null ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-fg/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Pratinjau gambar ${title}`}
          >
            <motion.img
              src={assetUrl(images[activeIndex]) ?? ''}
              alt={`${title} — pratinjau`}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="max-h-[88vh] max-w-full border border-line object-contain"
            />
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              aria-label="Tutup pratinjau"
              className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-sm border border-line bg-bg text-fg"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

export default function ProjectDetailPage() {
  const { projectSlug = '' } = useParams();
  const { data, isLoading, isError, error } = useProject(projectSlug);
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="container-page py-16 lg:py-20">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-6 h-14 w-2/3" />
        <Skeleton className="mt-5 h-4 w-full max-w-2xl" />
        <Skeleton className="mt-10 aspect-[16/9] w-full" />
      </div>
    );
  }

  if (isError || !data?.project) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto max-w-2xl border border-line">
          <EmptyState
            title="Project tidak ditemukan"
            description={error?.message ?? 'Project ini mungkin disembunyikan atau dihapus.'}
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

  const { project, author } = data;
  const gallery = [
    ...(project.coverImageUrl ? [project.coverImageUrl] : []),
    ...project.images.map((image) => image.imageUrl),
  ].filter((value, index, list) => list.indexOf(value) === index);

  const backHref = author ? `/m/${author.slug}` : '/members';

  return (
    <article className="container-page py-16 lg:py-20">
      <motion.nav variants={fadeUp} initial="hidden" animate="show" className="mb-10">
        <Link
          to={backHref}
          className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted transition-colors hover:text-fg"
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            aria-hidden
            className="transition-transform duration-300 group-hover:-translate-x-1"
          >
            <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          {author ? author.name : 'Direktori anggota'}
        </Link>
      </motion.nav>

      <motion.header variants={fadeUp} initial="hidden" animate="show" className="max-w-3xl">
        <p className="eyebrow flex items-center gap-3">
          <span className="index-num">01</span>
          <span aria-hidden className="h-px w-6 bg-line-strong" />
          Project
        </p>
        <h1 className="mt-5 text-balance font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.98] tracking-[-0.03em]">
          {project.title}
        </h1>
        {project.shortDescription ? (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            {project.shortDescription}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-6">
          {author ? (
            <Link to={`/m/${author.slug}`} className="group flex items-center gap-3">
              <Avatar name={author.name} src={author.avatarUrl} size="sm" muted />
              <div>
                <p className="flex flex-wrap items-center gap-2 text-sm transition-colors group-hover:text-fg">
                  {author.name}
                  {author.role === 'admin' ? <DevBadge /> : null}
                </p>
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
                  {author.headline ?? 'Anggota'}
                </p>
              </div>
            </Link>
          ) : null}
          {project.collaborators.length > 0 ? (
            <div className="flex items-center gap-3">
              <p className="eyebrow">Bersama</p>
              <div className="flex flex-wrap items-center gap-3">
                {project.collaborators.map((member) => (
                  <Link
                    key={member.id}
                    to={`/m/${member.slug}`}
                    className="group flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
                  >
                    <Avatar
                      name={member.name}
                      src={member.avatarUrl}
                      size="sm"
                      muted
                      className="h-6 w-6"
                    />
                    {member.alias || member.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          <div>
            <p className="eyebrow">Diperbarui</p>
            <p className="mt-1 text-sm text-muted">{formatDate(project.updatedAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.demoUrl ? (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className={buttonClasses('primary', 'sm')}
              >
                Buka demo
              </a>
            ) : null}
            {project.repoUrl ? (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className={buttonClasses('outline', 'sm')}
              >
                Kode sumber
              </a>
            ) : null}
          </div>
        </div>
      </motion.header>

      {gallery.length > 0 ? <Gallery images={gallery} title={project.title} /> : null}

      <section className="mt-16 max-w-3xl" aria-labelledby="interactions-heading">
        <h2 id="interactions-heading" className="eyebrow">
          Interaksi
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line pt-6">
          <LikeButton
            projectId={project.id}
            initialLiked={project.userLiked ?? false}
            initialCount={project.likeCount ?? 0}
          />
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted hover:text-fg hover:bg-muted/30 transition-colors"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.514 15.418 3 14.628 3 13.695a9 9 0 0118 0z" />
            </svg>
            <span className="tabular-nums">{project.commentCount ?? 0}</span>
          </button>
        </div>
      </section>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_18rem]">
        <div>
          {project.description ? (
            <Markdown>{project.description}</Markdown>
          ) : (
            <EmptyState
              title="Deskripsi belum tersedia"
              description="Pemilik project belum menambahkan deskripsi lengkap."
            />
          )}
        </div>

        <aside className="space-y-8 lg:border-l lg:border-line lg:pl-8">
          <div>
            <p className="eyebrow">Teknologi</p>
            <TechStack items={project.techStack ?? []} className="mt-4" />
            {!project.techStack?.length ? (
              <p className="mt-4 text-sm text-muted">Tidak ada data teknologi.</p>
            ) : null}
          </div>

          {author ? (
            <div>
              <p className="eyebrow">Kontak</p>
              <SocialLinks profile={author} size="sm" className="mt-4" />
            </div>
          ) : null}

          <div>
            <p className="eyebrow">Tautan</p>
            <ul className="mt-4 space-y-2 text-sm">
              {project.demoUrl ? (
                <li>
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="link-underline text-muted transition-colors hover:text-fg"
                  >
                    {project.demoUrl}
                  </a>
                </li>
              ) : null}
              {project.repoUrl ? (
                <li>
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="link-underline text-muted transition-colors hover:text-fg"
                  >
                    {project.repoUrl}
                  </a>
                </li>
              ) : null}
              {!project.demoUrl && !project.repoUrl ? (
                <li className="text-muted">Belum ada tautan.</li>
              ) : null}
            </ul>
          </div>
        </aside>
      </div>

      <section className="mt-20 max-w-3xl" aria-labelledby="comments-heading">
        <h2 id="comments-heading" className="eyebrow">
          Komentar & Feedback
        </h2>
        <div className="mt-6">
          <CommentForm projectId={project.id} />
        </div>
        <div className="mt-10 border-t border-line pt-6">
          <CommentList
            projectId={project.id}
            currentUserId={user?.id}
            isAdmin={user?.role === 'admin'}
          />
        </div>
      </section>
    </article>
  );
}

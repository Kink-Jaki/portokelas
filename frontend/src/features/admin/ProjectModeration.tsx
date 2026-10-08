import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProjectCover, TechStack } from '@/components/domain/shared';
import { useAdminDeleteProject, useAdminProjects, useToggleProjectHidden } from '@/hooks/useApi';
import { formatDate } from '@/lib/utils';
import type { Project, PublicUser } from '@/types/api';

type AdminProject = Project & { author: PublicUser | null };

export function ProjectModerationRow({ project }: { project: AdminProject }) {
  const toggleHidden = useToggleProjectHidden();
  const deleteProject = useAdminDeleteProject();
  const [pendingDelete, setPendingDelete] = useState(false);

  return (
    <>
      <article className="grid gap-6 border border-line p-5 sm:grid-cols-[10rem_1fr_auto]">
        <div className="aspect-[4/3] overflow-hidden border border-line bg-subtle">
          <ProjectCover project={project} />
        </div>

        <div className="min-w-0 space-y-3">
          <div>
            <h3 className="font-display text-lg">{project.title}</h3>
            <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
              {project.author ? (
                <a
                  href={`/m/${project.author.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 hover:text-fg"
                >
                  {project.author.name}
                </a>
              ) : (
                'Anggota dihapus'
              )}{' '}
              · {formatDate(project.createdAt)}
            </p>
          </div>

          <p className="line-clamp-2 text-sm text-muted">
            {project.shortDescription || 'Tanpa deskripsi singkat.'}
          </p>

          <TechStack items={project.techStack ?? []} />
        </div>

        <div className="flex flex-row flex-wrap items-start gap-2 sm:flex-col">
          <Button
            variant={project.isHidden ? 'outline' : 'subtle'}
            size="sm"
            isLoading={toggleHidden.isPending && toggleHidden.variables?.id === project.id}
            onClick={() => toggleHidden.mutate({ id: project.id, isHidden: !project.isHidden })}
          >
            {project.isHidden ? 'Tampilkan' : 'Sembunyikan'}
          </Button>
          <Button variant="danger" size="sm" onClick={() => setPendingDelete(true)}>
            Hapus
          </Button>
        </div>
      </article>

      <ConfirmDialog
        open={pendingDelete}
        onClose={() => setPendingDelete(false)}
        onConfirm={() => deleteProject.mutate(project.id)}
        isLoading={deleteProject.isPending}
        title="Hapus project?"
        description={`Project “${project.title}” akan dihapus permanen dari portofolio ${
          project.author?.name ?? 'anggota'
        }.`}
        confirmLabel="Hapus permanen"
      />
    </>
  );
}

export function ProjectModerationList() {
  const [search, setSearch] = useState('');
  const [hiddenFilter, setHiddenFilter] = useState<'all' | 'true' | 'false'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch, isFetching } = useAdminProjects(
    search,
    hiddenFilter,
    page,
  );
  const projects = data?.items ?? [];
  const meta = data?.meta;

  const filters: { id: typeof hiddenFilter; label: string }[] = [
    { id: 'all', label: 'Semua' },
    { id: 'false', label: 'Tayang' },
    { id: 'true', label: 'Disembunyikan' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Cari judul project atau nama anggota…"
          aria-label="Cari project"
          className="w-full rounded-sm border border-line bg-bg py-2.5 pl-3.5 pr-3 text-sm placeholder:text-muted/70 focus:border-line-strong focus:outline-none focus:ring-1 focus:ring-line-strong sm:max-w-sm"
        />
        <div className="inline-flex border border-line">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => {
                setHiddenFilter(filter.id);
                setPage(1);
              }}
              className={`px-3.5 py-2 text-xs transition-colors duration-200 ${
                hiddenFilter === filter.id ? 'bg-invert text-invert-fg' : 'text-muted hover:text-fg'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse border border-line bg-subtle" />
          ))}
        </div>
      ) : isError ? (
        <div className="border border-line">
          <EmptyState
            title="Gagal memuat project"
            description={error?.message}
            action={
              <Button variant="outline" onClick={() => void refetch()}>
                Coba lagi
              </Button>
            }
          />
        </div>
      ) : projects.length === 0 ? (
        <div className="border border-line">
          <EmptyState
            title="Tidak ada project"
            description="Belum ada project yang cocok dengan filter ini."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectModerationRow key={project.id} project={project} />
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 ? (
        <nav
          className="flex items-center justify-between gap-4"
          aria-label="Navigasi halaman project"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={meta.page <= 1}
          >
            Sebelumnya
          </Button>
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
            {isFetching ? 'Memuat…' : `Halaman ${meta.page} / ${meta.totalPages}`}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => Math.min(meta.totalPages, current + 1))}
            disabled={meta.page >= meta.totalPages}
          >
            Berikutnya
          </Button>
        </nav>
      ) : null}
    </div>
  );
}

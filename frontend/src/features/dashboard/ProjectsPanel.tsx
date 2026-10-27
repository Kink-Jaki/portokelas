import { useRef, useState } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { TechStack } from '@/components/domain/shared';
import { ProjectCover } from '@/components/domain/shared';
import {
  useDeleteProject,
  useDeleteProjectImage,
  useMyProjects,
  useUploadProjectCover,
  useUploadProjectImages,
} from '@/hooks/useApi';
import { assetUrl } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import type { Project } from '@/types/api';
import { ProjectDialog } from './ProjectDialog';

function ProjectRow({ project, onEdit }: { project: Project; onEdit: () => void }) {
  const { user } = useAuth();
  const isOwner = project.userId === user?.id;
  const [pendingDelete, setPendingDelete] = useState(false);
  const deleteProject = useDeleteProject();
  const uploadImages = useUploadProjectImages();
  const uploadCover = useUploadProjectCover();
  const deleteImage = useDeleteProjectImage();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  return (
    <article className="grid gap-6 border border-line p-5 sm:grid-cols-[12rem_1fr]">
      <div className="aspect-[4/3] overflow-hidden border border-line bg-subtle">
        <ProjectCover project={project} />
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-xl">{project.title}</h3>
              {project.isHidden ? (
                <span className="rounded-sm border border-line-strong px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted">
                  Disembunyikan admin
                </span>
              ) : null}
              {!isOwner ? (
                <span className="rounded-sm border border-line-strong px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted">
                  Project bersama
                </span>
              ) : null}
            </div>
            <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
              {project.slug} · {formatDate(project.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
            {isOwner ? (
              <Button variant="danger" size="sm" onClick={() => setPendingDelete(true)}>
                Hapus
              </Button>
            ) : null}
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted">
          {project.shortDescription || 'Tanpa deskripsi singkat.'}
        </p>

        <TechStack items={project.techStack ?? []} />

        {project.collaborators.length > 0 ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
            <span className="font-mono uppercase tracking-[0.14em]">Bersama</span>
            <div className="flex flex-wrap items-center gap-3">
              {project.collaborators.map((member) => (
                <span key={member.id} className="inline-flex items-center gap-2">
                  <Avatar name={member.name} src={member.avatarUrl} size="sm" className="h-6 w-6" />
                  {member.alias || member.name}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) uploadCover.mutate({ projectId: project.id, file });
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            isLoading={uploadCover.isPending}
            onClick={() => coverInputRef.current?.click()}
          >
            {project.coverImageUrl ? 'Ganti cover' : 'Unggah cover'}
          </Button>

          <input
            ref={imageInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = '';
              if (files.length > 0) uploadImages.mutate({ projectId: project.id, files });
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            isLoading={uploadImages.isPending}
            onClick={() => imageInputRef.current?.click()}
          >
            Tambah gambar ({project.images.length})
          </Button>

          {project.demoUrl ? (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center px-1 text-sm text-muted transition-colors hover:text-fg"
            >
              Lihat demo
            </a>
          ) : null}
        </div>

        {project.images.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {project.images.map((image) => (
              <li key={image.id} className="relative">
                <img
                  src={assetUrl(image.imageUrl) ?? ''}
                  alt={`Gambar project ${project.title}`}
                  className="h-16 w-24 border border-line object-cover grayscale"
                />
                <button
                  type="button"
                  aria-label="Hapus gambar"
                  onClick={() => deleteImage.mutate({ projectId: project.id, imageId: image.id })}
                  className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-sm border border-line bg-bg text-muted transition-colors hover:text-danger"
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <ConfirmDialog
        open={pendingDelete}
        onClose={() => setPendingDelete(false)}
        onConfirm={() => deleteProject.mutate(project.id)}
        isLoading={deleteProject.isPending}
        title="Hapus project?"
        description={`Project “${project.title}” beserta gambarnya akan dihapus permanen.`}
        confirmLabel="Hapus permanen"
      />
    </article>
  );
}

export function ProjectsPanel() {
  const { data, isLoading, isError, error, refetch } = useMyProjects();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const projects = data?.projects ?? [];

  return (
    <div className="space-y-6">
      <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-full">
          <h2 className="font-display text-2xl">Project saya</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Project yang Anda buat atau ikut kerjakan tampil di portofolio publik (kecuali
            disembunyikan admin).
          </p>
        </div>
        <Button
          className="max-w-full"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          Tambah project
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="grid gap-6 border border-line p-5 sm:grid-cols-[12rem_1fr]">
              <Skeleton className="aspect-[4/3]" />
              <div className="space-y-3">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="border border-line p-6">
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
            title="Belum ada project"
            description="Tambahkan project pertama Anda agar portofolio terlihat hidup."
            action={<Button onClick={() => setDialogOpen(true)}>Tambah project</Button>}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              onEdit={() => {
                setEditing(project);
                setDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <ProjectDialog
        open={dialogOpen}
        project={editing}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
      />
    </div>
  );
}

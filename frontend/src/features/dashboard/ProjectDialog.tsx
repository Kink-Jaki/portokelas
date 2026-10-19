import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { useCreateProject, useUpdateProject } from '@/hooks/useApi';
import { useAuth } from '@/providers/AuthProvider';
import type { CollaboratorUser, Project } from '@/types/api';
import { projectSchema, parseTechStack, type ProjectFormValues } from '@/features/auth/schemas';
import { CollaboratorPicker } from './CollaboratorPicker';

type ProjectDialogProps = {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
};

export function ProjectDialog({ open, onClose, project = null }: ProjectDialogProps) {
  const { user } = useAuth();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const [collaborators, setCollaborators] = useState<CollaboratorUser[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const canManageCollaborators = !project || project.userId === user?.id;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      shortDescription: '',
      description: '',
      demoUrl: '',
      repoUrl: '',
      techStack: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      title: project?.title ?? '',
      shortDescription: project?.shortDescription ?? '',
      description: project?.description ?? '',
      demoUrl: project?.demoUrl ?? '',
      repoUrl: project?.repoUrl ?? '',
      techStack: (project?.techStack ?? []).join(', '),
    });
    setCollaborators(project?.collaborators ?? []);
    setPickerOpen(false);
    const timer = window.setTimeout(() => firstFieldRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, [open, project, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      title: values.title,
      shortDescription: values.shortDescription || null,
      description: values.description || null,
      demoUrl: values.demoUrl || null,
      repoUrl: values.repoUrl || null,
      techStack: parseTechStack(values.techStack),
      ...(canManageCollaborators
        ? { collaboratorIds: collaborators.map((member) => member.id) }
        : {}),
    };

    if (project) {
      await updateProject.mutateAsync({ id: project.id, payload });
    } else {
      await createProject.mutateAsync(payload);
    }

    onClose();
  });

  const titleField = register('title');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={project ? 'Edit project' : 'Tambah project'}
      description="Deskripsi mendukung markdown. Tautan demo dan repositori boleh dikosongkan."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button onClick={() => void onSubmit()} isLoading={isSubmitting}>
            {project ? 'Simpan perubahan' : 'Tambah project'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Input
          label="Judul project"
          placeholder="Sistem Reservasi Ruangan"
          error={errors.title?.message}
          {...titleField}
          ref={(element) => {
            titleField.ref(element);
            firstFieldRef.current = element;
          }}
        />

        <Input
          label="Deskripsi singkat"
          placeholder="Satu kalimat yang menjelaskan project's value."
          hint="Tampil di kartu project."
          error={errors.shortDescription?.message}
          {...register('shortDescription')}
        />

        <Textarea
          label="Deskripsi lengkap (markdown)"
          rows={8}
          placeholder={'## Latar belakang\n\nTulis detail projektemu di sini…'}
          error={errors.description?.message}
          {...register('description')}
        />

        <Input
          label="Tech stack"
          placeholder="React, TypeScript, Bun"
          hint="Pisahkan dengan koma (maksimal 20)."
          error={errors.techStack?.message}
          {...register('techStack')}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Tautan demo"
            placeholder="https://demo.example.com"
            error={errors.demoUrl?.message}
            {...register('demoUrl')}
          />
          <Input
            label="Tautan repositori"
            placeholder="https://github.com/user/repo"
            error={errors.repoUrl?.message}
            {...register('repoUrl')}
          />
        </div>

        <div className="space-y-2">
          <span className="block text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Kolaborator
          </span>
          <div className="flex flex-wrap items-center gap-2 rounded-sm border border-line p-3">
            {collaborators.length > 0 ? (
              collaborators.map((member) => (
                <span
                  key={member.id}
                  className="inline-flex items-center gap-2 rounded-sm border border-line-strong bg-subtle py-1 pl-1.5 pr-2 text-xs text-fg"
                >
                  <Avatar name={member.name} src={member.avatarUrl} size="sm" className="h-5 w-5" />
                  {member.alias || member.name}
                  {canManageCollaborators ? (
                    <button
                      type="button"
                      onClick={() =>
                        setCollaborators((current) =>
                          current.filter((item) => item.id !== member.id),
                        )
                      }
                      aria-label={`Hapus kolaborator ${member.name}`}
                      className="text-muted transition-colors hover:text-danger"
                    >
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" aria-hidden>
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                    </button>
                  ) : null}
                </span>
              ))
            ) : (
              <span className="px-1 text-xs text-muted">
                Project pribadi — belum ada kolaborator.
              </span>
            )}
            {canManageCollaborators ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPickerOpen(true)}
              >
                {collaborators.length > 0 ? 'Ubah kolaborator' : 'Pilih kolaborator'}
              </Button>
            ) : null}
          </div>
          <p className="text-xs text-muted">
            {canManageCollaborators
              ? 'Anggota terpilih ikut menampilkan project ini di portofolionya.'
              : 'Hanya pemilik project yang dapat mengubah daftar kolaborator.'}
          </p>
        </div>

        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>

      {canManageCollaborators ? (
        <CollaboratorPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          selected={collaborators}
          onChange={setCollaborators}
        />
      ) : null}
    </Modal>
  );
}

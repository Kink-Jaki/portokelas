import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { useCreateProject, useUpdateProject } from '@/hooks/useApi';
import type { Project } from '@/types/api';
import { projectSchema, parseTechStack, type ProjectFormValues } from '@/features/auth/schemas';

type ProjectDialogProps = {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
};

export function ProjectDialog({ open, onClose, project = null }: ProjectDialogProps) {
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const firstFieldRef = useRef<HTMLInputElement>(null);

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
    };

    if (project) {
      await updateProject.mutateAsync({ id: project.id, payload });
    } else {
      await createProject.mutateAsync(payload);
    }

    onClose();
  });

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
          {...register('title')}
          ref={firstFieldRef}
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

        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Modal>
  );
}

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { ApiError } from '@/lib/api';
import { useAdminUpdateUser } from '@/hooks/useApi';
import { profileSchema } from '@/features/auth/schemas';
import type { MemberProfile } from '@/types/api';

const adminUserSchema = profileSchema.extend({
  role: z.enum(['member', 'admin']),
});

type AdminUserFormValues = z.infer<typeof adminUserSchema>;

export function AdminUserDialog({
  open,
  user,
  onClose,
}: {
  open: boolean;
  user: MemberProfile | null;
  onClose: () => void;
}) {
  const updateUser = useAdminUpdateUser();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminUserFormValues>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: {
      name: '',
      alias: '',
      spotifyUrl: '',
      headline: '',
      bio: '',
      githubUrl: '',
      linkedinUrl: '',
      instagramUrl: '',
      websiteUrl: '',
      cvUrl: '',
      role: 'member',
    },
  });

  useEffect(() => {
    if (!open || !user) return;
    reset({
      name: user.name,
      alias: user.alias ?? '',
      spotifyUrl: user.spotifyUrl ?? '',
      headline: user.headline ?? '',
      bio: user.bio ?? '',
      githubUrl: user.githubUrl ?? '',
      linkedinUrl: user.linkedinUrl ?? '',
      instagramUrl: user.instagramUrl ?? '',
      websiteUrl: user.websiteUrl ?? '',
      cvUrl: user.cvUrl ?? '',
      role: user.role,
    });
  }, [open, user, reset]);

  if (!user) return null;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateUser.mutateAsync({
        id: user.id,
        payload: {
          name: values.name,
          alias: values.alias || null,
          spotifyUrl: values.spotifyUrl || null,
          headline: values.headline || null,
          bio: values.bio || null,
          githubUrl: values.githubUrl || null,
          linkedinUrl: values.linkedinUrl || null,
          instagramUrl: values.instagramUrl || null,
          websiteUrl: values.websiteUrl || null,
          cvUrl: values.cvUrl || null,
          role: values.role,
        },
      });
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors = error.fieldErrors;
        if (fieldErrors.name) setError('name', { message: fieldErrors.name });
        if (fieldErrors.alias) setError('alias', { message: fieldErrors.alias });
        if (fieldErrors.spotifyUrl)
          setError('spotifyUrl', { message: fieldErrors.spotifyUrl });
        if (fieldErrors.bio) setError('bio', { message: fieldErrors.bio });
        if (fieldErrors.headline) setError('headline', { message: fieldErrors.headline });
      }
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit profil kreator"
      description={`${user.name} · ${user.nim ? `NIS ${user.nim}` : user.email}`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" form="admin-user-form" isLoading={isSubmitting}>
            Simpan perubahan
          </Button>
        </>
      }
    >
      <form
        id="admin-user-form"
        onSubmit={onSubmit}
        className="space-y-5"
        noValidate
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Nama lengkap"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Alias (nama tampilan)"
            placeholder="Nama panggilan / nama tampilan"
            hint="Nama tampilan di landing page, nama lengkap tampil di bawahnya."
            error={errors.alias?.message}
            {...register('alias')}
          />
        </div>

        <Input
          label="Spotify"
          placeholder="https://open.spotify.com/track/... atau /playlist/..."
          hint="Tautan lagu, playlist, album, atau artis Spotify. Diputar otomatis di halaman portofolio."
          error={errors.spotifyUrl?.message}
          {...register('spotifyUrl')}
        />

        <Select
          label="Role"
          options={[
            { value: 'member', label: 'Kreator' },
            { value: 'admin', label: 'Admin (Dev)' },
          ]}
          {...register('role')}
        />

        <Input
          label="Headline"
          placeholder="Frontend Developer · Peminat UI"
          error={errors.headline?.message}
          {...register('headline')}
        />

        <Textarea
          label="Bio"
          rows={5}
          placeholder="Ceritakan sedikit tentang latar belakang dan fokusnya."
          error={errors.bio?.message}
          {...register('bio')}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="GitHub"
            placeholder="https://github.com/username"
            error={errors.githubUrl?.message}
            {...register('githubUrl')}
          />
          <Input
            label="LinkedIn"
            placeholder="https://linkedin.com/in/username"
            error={errors.linkedinUrl?.message}
            {...register('linkedinUrl')}
          />
          <Input
            label="Instagram"
            placeholder="https://instagram.com/username"
            error={errors.instagramUrl?.message}
            {...register('instagramUrl')}
          />
          <Input
            label="Website"
            placeholder="https://portofolio.dev"
            error={errors.websiteUrl?.message}
            {...register('websiteUrl')}
          />
        </div>

        <Input
          label="Tautan CV"
          placeholder="https://drive.google.com/..."
          error={errors.cvUrl?.message}
          {...register('cvUrl')}
        />
      </form>
    </Modal>
  );
}
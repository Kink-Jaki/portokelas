import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';
import { Avatar } from '@/components/ui/Avatar';
import { ApiError } from '@/lib/api';
import { useUpdateProfile, useUploadAvatar } from '@/hooks/useApi';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { profileSchema, type ProfileFormValues } from '@/features/auth/schemas';
import type { ProfilePayload } from '@/types/api';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export function ProfilePanel() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      headline: '',
      bio: '',
      githubUrl: '',
      linkedinUrl: '',
      instagramUrl: '',
      websiteUrl: '',
      cvUrl: '',
    },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name,
      headline: user.headline ?? '',
      bio: user.bio ?? '',
      githubUrl: user.githubUrl ?? '',
      linkedinUrl: user.linkedinUrl ?? '',
      instagramUrl: user.instagramUrl ?? '',
      websiteUrl: user.websiteUrl ?? '',
      cvUrl: user.cvUrl ?? '',
    });
  }, [user, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile.mutateAsync({
        name: values.name,
        headline: values.headline || null,
        bio: values.bio || null,
        githubUrl: values.githubUrl || null,
        linkedinUrl: values.linkedinUrl || null,
        instagramUrl: values.instagramUrl || null,
        websiteUrl: values.websiteUrl || null,
        cvUrl: values.cvUrl || null,
      } satisfies ProfilePayload);
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors = error.fieldErrors;
        if (fieldErrors.name) setError('name', { message: fieldErrors.name });
        if (fieldErrors.bio) setError('bio', { message: fieldErrors.bio });
        if (fieldErrors.headline) setError('headline', { message: fieldErrors.headline });
      }
    }
  });

  const onAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setAvatarError('Format harus JPG, PNG, atau WEBP.');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('Ukuran maksimal 2MB.');
      return;
    }

    setAvatarError(null);
    uploadAvatar.mutate(file);
  };

  if (!user) return null;

  return (
    <div className="grid gap-8 lg:grid-cols-[20rem_1fr]">
      <div className="space-y-6 border border-line p-6">
        <div className="flex flex-col items-start gap-4">
          <Avatar name={user.name} src={user.avatarUrl} size="xl" />
          <div className="w-full space-y-2">
            <label className="block text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Foto profil
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onAvatarChange}
              disabled={uploadAvatar.isPending}
              className="block w-full text-xs text-muted file:mr-3 file:rounded-sm file:border file:border-line-strong file:bg-subtle file:px-3 file:py-1.5 file:text-xs file:text-fg hover:file:border-fg"
            />
            <p className="text-xs text-muted">JPG/PNG/WEBP, maksimal 2MB.</p>
            {avatarError ? (
              <p className="text-xs text-danger" role="alert">
                {avatarError}
              </p>
            ) : null}
          </div>
        </div>

        <dl className="space-y-3 border-t border-line pt-5 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Email</dt>
            <dd className="truncate font-mono text-xs">{user.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">URL portofolio</dt>
            <dd className="truncate font-mono text-xs">/m/{user.slug}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Bergabung</dt>
            <dd className="text-xs">{formatDate(user.createdAt)}</dd>
          </div>
        </dl>

        {user.slug ? (
          <a
            href={`/m/${user.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs text-muted underline underline-offset-4 transition-colors hover:text-fg"
          >
            Lihat halaman publik saya
          </a>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="space-y-5 border border-line p-6" noValidate>
        <div>
          <h2 className="font-display text-2xl">Profil publik</h2>
          <p className="mt-1 text-sm text-muted">
            Data ini yang tampil di halaman portofolio kamu.
          </p>
        </div>

        <Input label="Nama lengkap" error={errors.name?.message} {...register('name')} />

        <Input
          label="Headline"
          placeholder="Frontend Developer · Peminat UI"
          hint="Satu kalimat singkat tentang kamu."
          error={errors.headline?.message}
          {...register('headline')}
        />

        <Textarea
          label="Bio"
          rows={6}
          placeholder="Ceritakan sedikit tentang latar belakang dan fokusmu."
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
          hint="Tautan ke file CV (PDF/Google Drive). Tampil sebagai tombol Buka CV di halaman portofolio."
          error={errors.cvUrl?.message}
          {...register('cvUrl')}
        />

        <div className="flex items-center gap-3 border-t border-line pt-5">
          <Button type="submit" isLoading={updateProfile.isPending} disabled={!isDirty}>
            Simpan perubahan
          </Button>
          {isDirty ? (
            <Button type="button" variant="ghost" onClick={() => reset()}>
              Batal
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';
import { Avatar } from '@/components/ui/Avatar';
import { ImageCropDialog } from '@/components/ui/ImageCropDialog';
import { ApiError } from '@/lib/api';
import { isSupportedImage, SUPPORTED_IMAGE_TYPES } from '@/lib/image';
import { useUpdateProfile, useUploadAvatar } from '@/hooks/useApi';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { profileSchema, type ProfileFormValues } from '@/features/auth/schemas';
import type { ProfilePayload } from '@/types/api';

const AVATAR_ACCEPT = SUPPORTED_IMAGE_TYPES.join(',');

export function ProfilePanel() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);

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
      alias: '',
      spotifyUrl: '',
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
      alias: user.alias ?? '',
      spotifyUrl: user.spotifyUrl ?? '',
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
        alias: values.alias || null,
        spotifyUrl: values.spotifyUrl || null,
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
        if (fieldErrors.spotifyUrl) setError('spotifyUrl', { message: fieldErrors.spotifyUrl });
      }
    }
  });

  const onAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!isSupportedImage(file)) {
      setAvatarError('Format harus JPG, PNG, atau WEBP.');
      return;
    }

    setAvatarError(null);
    setCropFile(file);
  };

  const onCropConfirm = (cropped: File) => {
    setCropFile(null);
    uploadAvatar.mutate(cropped);
  };

  if (!user) return null;

  return (
    <div className="grid min-w-0 gap-6 sm:gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <div className="w-full min-w-0 space-y-6 border border-line p-5 sm:p-6">
        <div className="flex flex-col items-start gap-4">
          <Avatar name={user.name} src={user.avatarUrl} size="xl" />
          <div className="w-full min-w-0 space-y-2">
            <label className="block text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Foto profil
            </label>
            <input
              type="file"
              accept={AVATAR_ACCEPT}
              onChange={onAvatarChange}
              disabled={uploadAvatar.isPending}
              className="block w-full min-w-0 max-w-full text-xs text-muted file:mr-3 file:rounded-sm file:border file:border-line-strong file:bg-subtle file:px-3 file:py-1.5 file:text-xs file:text-fg hover:file:border-fg"
            />
            <p className="text-xs text-muted">
              JPG/PNG/WEBP. Foto bisa dipotong lalu otomatis dikonversi ke WEBP.
            </p>
            {avatarError ? (
              <p className="text-xs text-danger" role="alert">
                {avatarError}
              </p>
            ) : null}
          </div>
        </div>

        <dl className="space-y-3 border-t border-line pt-5 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <dt className="shrink-0 text-muted">Email</dt>
            <dd className="min-w-0 break-all font-mono text-xs sm:truncate">{user.email}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <dt className="shrink-0 text-muted">URL portofolio</dt>
            <dd className="min-w-0 break-all font-mono text-xs sm:truncate">/m/{user.slug}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <dt className="shrink-0 text-muted">Bergabung</dt>
            <dd className="min-w-0 text-xs sm:truncate">{formatDate(user.createdAt)}</dd>
          </div>
        </dl>

        {user.slug ? (
          <a
            href={`/m/${user.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-w-0 max-w-full items-center gap-2 text-xs text-muted underline underline-offset-4 transition-colors hover:text-fg"
          >
            Lihat halaman publik saya
          </a>
        ) : null}
      </div>

      <form
        onSubmit={onSubmit}
        className="w-full min-w-0 space-y-5 border border-line p-5 sm:p-6"
        noValidate
      >
        <div className="min-w-0">
          <h2 className="font-display text-2xl leading-tight">Profil publik</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Data ini yang tampil di halaman portofolio kamu.
          </p>
        </div>

        <Input label="Nama lengkap" error={errors.name?.message} {...register('name')} />

        <Input
          label="Alias"
          placeholder="Nama panggilan / nama tampilan"
          hint="Nama yang tampil di landing page. Nama lengkap tampil di bawahnya sebagai subheadline."
          error={errors.alias?.message}
          {...register('alias')}
        />

        <Input
          label="Spotify"
          placeholder="https://open.spotify.com/track/... atau /playlist/..."
          hint="Tautan lagu, playlist, album, atau artis Spotify. Pemutar berputar otomatis di halaman portofoliomu."
          error={errors.spotifyUrl?.message}
          {...register('spotifyUrl')}
        />

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

        <div className="grid min-w-0 gap-5 sm:grid-cols-2">
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

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
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

      <ImageCropDialog
        open={cropFile !== null}
        file={cropFile}
        onCancel={() => setCropFile(null)}
        onConfirm={onCropConfirm}
      />
    </div>
  );
}

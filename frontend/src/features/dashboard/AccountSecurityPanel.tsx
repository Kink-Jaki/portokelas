import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { ApiError } from '@/lib/api';
import { useUpdateEmail, useUpdatePassword } from '@/hooks/useApi';
import { useAuth } from '@/providers/AuthProvider';
import {
  accountEmailSchema,
  accountPasswordSchema,
  type AccountEmailFormValues,
  type AccountPasswordFormValues,
} from '@/features/auth/schemas';

/** Form ganti email & password akun pada halaman profil. */
export function AccountSecurityPanel() {
  const { user } = useAuth();
  const updateEmail = useUpdateEmail();
  const updatePassword = useUpdatePassword();

  const emailForm = useForm<AccountEmailFormValues>({
    resolver: zodResolver(accountEmailSchema),
    defaultValues: { email: '', password: '' },
  });

  const passwordForm = useForm<AccountPasswordFormValues>({
    resolver: zodResolver(accountPasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const { reset: resetEmail } = emailForm;

  useEffect(() => {
    resetEmail({ email: user?.email ?? '', password: '' });
  }, [user?.email, resetEmail]);

  const onSubmitEmail = emailForm.handleSubmit(async (values) => {
    try {
      await updateEmail.mutateAsync({ email: values.email, password: values.password });
      emailForm.reset({ email: values.email, password: '' });
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors = error.fieldErrors;
        if (fieldErrors.email) emailForm.setError('email', { message: fieldErrors.email });
        if (fieldErrors.password) emailForm.setError('password', { message: fieldErrors.password });
        if (!fieldErrors.email && !fieldErrors.password) {
          emailForm.setError('root', { message: error.message });
        }
      }
    }
  });

  const onSubmitPassword = passwordForm.handleSubmit(async (values) => {
    try {
      await updatePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      passwordForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors = error.fieldErrors;
        if (fieldErrors.currentPassword) {
          passwordForm.setError('currentPassword', { message: fieldErrors.currentPassword });
        }
        if (fieldErrors.newPassword) {
          passwordForm.setError('newPassword', { message: fieldErrors.newPassword });
        }
        if (!fieldErrors.currentPassword && !fieldErrors.newPassword) {
          passwordForm.setError('root', { message: error.message });
        }
      }
    }
  });

  if (!user) return null;

  return (
    <section className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={onSubmitEmail} className="space-y-5 border border-line p-6" noValidate>
        <div>
          <h2 className="font-display text-2xl">Ubah email</h2>
          <p className="mt-1 text-sm text-muted">
            Email bisa dipakai untuk masuk selain NIS. Konfirmasi dengan password saat ini.
          </p>
        </div>

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={emailForm.formState.errors.email?.message}
          {...emailForm.register('email')}
        />

        <Input
          label="Password saat ini"
          type="password"
          autoComplete="current-password"
          error={emailForm.formState.errors.password?.message}
          {...emailForm.register('password')}
        />

        {emailForm.formState.errors.root ? (
          <p className="text-xs text-danger" role="alert">
            {emailForm.formState.errors.root.message}
          </p>
        ) : null}

        <div className="border-t border-line pt-5">
          <Button
            type="submit"
            isLoading={updateEmail.isPending}
            disabled={!emailForm.formState.isDirty}
          >
            Simpan email
          </Button>
        </div>
      </form>

      <form onSubmit={onSubmitPassword} className="space-y-5 border border-line p-6" noValidate>
        <div>
          <h2 className="font-display text-2xl">Ubah password</h2>
          <p className="mt-1 text-sm text-muted">
            Minimal 8 karakter dan mengandung huruf. Gunakan password baru untuk masuk berikutnya.
          </p>
        </div>

        <Input
          label="Password saat ini"
          type="password"
          autoComplete="current-password"
          error={passwordForm.formState.errors.currentPassword?.message}
          {...passwordForm.register('currentPassword')}
        />

        <Input
          label="Password baru"
          type="password"
          autoComplete="new-password"
          error={passwordForm.formState.errors.newPassword?.message}
          {...passwordForm.register('newPassword')}
        />

        <Input
          label="Konfirmasi password baru"
          type="password"
          autoComplete="new-password"
          error={passwordForm.formState.errors.confirmPassword?.message}
          {...passwordForm.register('confirmPassword')}
        />

        {passwordForm.formState.errors.root ? (
          <p className="text-xs text-danger" role="alert">
            {passwordForm.formState.errors.root.message}
          </p>
        ) : null}

        <div className="border-t border-line pt-5">
          <Button
            type="submit"
            isLoading={updatePassword.isPending}
            disabled={!passwordForm.formState.isDirty}
          >
            Simpan password
          </Button>
        </div>
      </form>
    </section>
  );
}

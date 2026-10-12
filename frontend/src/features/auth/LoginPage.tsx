import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { AnimatedRule } from '@/components/ui/Reveal';
import { ApiError } from '@/lib/api';
import { fadeUp } from '@/lib/motion';
import { useAuth } from '@/providers/AuthProvider';
import { loginSchema, type LoginFormValues } from './schemas';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identity: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await login(values);
      if (user.role === 'admin') navigate('/admin', { replace: true });
      else navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors = error.fieldErrors;
        const identityKey = fieldErrors.identity ? 'identity' : undefined;
        const passwordKey = fieldErrors.password ? 'password' : undefined;
        if (identityKey) setError('identity', { message: fieldErrors.identity });
        if (passwordKey) setError('password', { message: fieldErrors.password });
        if (!identityKey && !passwordKey) {
          setError('root', { message: error.message });
        }
        return;
      }
      throw error;
    }
  });

  return (
    <div className="container-page py-16">
      <div className="mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-2 lg:gap-20">
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <p className="eyebrow">Masuk</p>
          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
            Selamat datang kembali.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
            Masuk memakai NIS untuk mengelola profil dan project Anda. Halaman portofolio publik
            tersedia untuk siapa saja tanpa login.
          </p>
          <AnimatedRule className="mt-8 max-w-md" />
          <p className="mt-8 text-sm text-muted">
            Pendaftaran akun ditutup. Akun dibagikan oleh pengurus kelas.
          </p>
        </motion.div>

        <motion.form
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
          onSubmit={onSubmit}
          className="space-y-5 border border-line p-6 sm:p-8"
          noValidate
        >
          <Input
            label="NIS"
            placeholder="Contoh: 17858"
            autoComplete="username"
            error={errors.identity?.message}
            {...register('identity')}
          />

          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
            Masuk
          </Button>

          <p className="text-xs leading-relaxed text-muted">
            Gunakan NIS yang terdaftar. Hubungi pengurus kelas bila belum memiliki akun.
          </p>
        </motion.form>
      </div>
    </div>
  );
}

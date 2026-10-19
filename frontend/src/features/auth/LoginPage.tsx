import { useState } from 'react';
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

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden>
      <path
        d="M2.5 12S6 5.75 12 5.75 21.5 12 21.5 12 18 18.25 12 18.25 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden>
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M10.7 6.15A10.6 10.6 0 0 1 12 6c6 0 9.5 6 9.5 6a17.9 17.9 0 0 1-3.35 3.95M6.35 7.9A17.7 17.7 0 0 0 2.5 12S6 18 12 18c1.45 0 2.75-.35 3.9-.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 9.9a3 3 0 0 0 4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

  const [showPassword, setShowPassword] = useState(false);

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
            Pendaftaran akun ditutup. Akun dibagikan oleh tim Craftly.
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
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            error={errors.password?.message}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                aria-pressed={showPassword}
                className="grid h-7 w-7 place-items-center rounded-full text-muted transition-colors duration-200 hover:text-fg"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
            {...register('password')}
          />

          <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
            Masuk
          </Button>

          <p className="text-xs leading-relaxed text-muted">
            Gunakan NIS yang terdaftar. Hubungi tim Craftly bila belum memiliki akun.
          </p>
        </motion.form>
      </div>
    </div>
  );
}

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { AnimatedRule } from '@/components/ui/Reveal';
import { ApiError } from '@/lib/api';
import { fadeUp } from '@/lib/motion';
import { useAuth } from '@/providers/AuthProvider';
import { registerSchema, type RegisterFormValues } from './schemas';

export default function RegisterPage() {
  const { register: registerMember } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerMember({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      navigate('/pending', { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors = error.fieldErrors;
        const keys = ['name', 'email', 'password'] as const;
        const hasFieldError = keys.some((key) => fieldErrors[key]);

        for (const key of keys) {
          if (fieldErrors[key]) setError(key, { message: fieldErrors[key] });
        }

        if (!hasFieldError) {
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
          <p className="eyebrow">Pendaftaran</p>
          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
            Buat portofolio kamu.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
            Isi data berikut. Akun akan berstatus <strong className="text-fg">menunggu</strong>{' '}
            sampai admin menyetujui, baru profil dan project kamu tampil di halaman publik.
          </p>
          <AnimatedRule className="mt-8 max-w-md" />
          <ul className="mt-8 max-w-md space-y-3 text-sm text-muted">
            <li className="border-t border-line pt-3">Satu akun per anggota kelas.</li>
            <li className="border-t border-line pt-3">
              Foto profil bisa ditambahkan setelah masuk.
            </li>
            <li className="border-t border-line pt-3">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-fg underline underline-offset-4">
                Masuk
              </Link>
            </li>
          </ul>
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
            label="Nama lengkap"
            placeholder="Budi Santoso"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="nama@kampus.ac.id"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            hint="Minimal 8 karakter, mengandung huruf dan angka."
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Konfirmasi password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
            Kirim pendaftaran
          </Button>
        </motion.form>
      </div>
    </div>
  );
}

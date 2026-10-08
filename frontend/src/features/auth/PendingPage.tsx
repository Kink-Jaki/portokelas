import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

import { buttonClasses } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { AnimatedRule } from '@/components/ui/Reveal';
import { fadeUp, stagger, staggerItem } from '@/lib/motion';
import { useAuth } from '@/providers/AuthProvider';

export default function PendingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container-page py-20">
      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-3xl"
      >
        <motion.p variants={staggerItem} className="eyebrow">
          Status pendaftaran
        </motion.p>

        <motion.h1
          variants={fadeUp}
          className="mt-4 font-display text-4xl leading-tight sm:text-5xl"
        >
          Menunggu konfirmasi admin.
        </motion.h1>

        <AnimatedRule className="mt-10" />

        <motion.div variants={staggerItem} className="mt-10 space-y-6">
          <p className="max-w-2xl text-base leading-relaxed text-muted">
            Terima kasih sudah mendaftar. Data Anda sudah masuk ke antrean verifikasi admin. Profil
            dan project baru tampil di halaman publik setelah akun disetujui.
          </p>

          <div className="grid gap-px border border-line bg-line sm:grid-cols-2">
            <div className="bg-bg p-6">
              <p className="eyebrow">Akun</p>
              <p className="mt-3 font-display text-lg">{user?.name ?? '—'}</p>
              <p className="mt-1 text-sm text-muted">{user?.email}</p>
            </div>
            <div className="bg-bg p-6">
              <p className="eyebrow">Status</p>
              <div className="mt-3">{user ? <StatusBadge status={user.status} /> : null}</div>
              {user?.rejectionReason ? (
                <p className="mt-3 text-sm text-danger">Alasan: {user.rejectionReason}</p>
              ) : (
                <p className="mt-3 text-sm text-muted">
                  Anda belum bisa membuka dashboard sampai disetujui.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <p className="eyebrow">Setelah disetujui</p>
            <ol className="space-y-3 text-sm text-muted">
              <li className="border-t border-line pt-3">1. Login ke dashboard anggota.</li>
              <li className="border-t border-line pt-3">2. Lengkapi profil dan tautan sosial.</li>
              <li className="border-t border-line pt-3">3. Tambahkan project beserta gambarnya.</li>
            </ol>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              className={buttonClasses('outline')}
              onClick={() => void logout().then(() => navigate('/', { replace: true }))}
            >
              Keluar
            </button>
            <Link to="/members" className={buttonClasses('primary')}>
              Lihat direktori anggota
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

import { motion } from 'framer-motion';

import { ProfilePanel } from './ProfilePanel';
import { AccountSecurityPanel } from './AccountSecurityPanel';
import { AnimatedRule } from '@/components/ui/Reveal';
import { fadeUp } from '@/lib/motion';

/** Halaman profil mandiri, bisa diakses semua pengguna yang sudah login (termasuk admin). */
export default function ProfilePage() {
  return (
    <div className="container-page py-14">
      <motion.header variants={fadeUp} initial="hidden" animate="show" className="max-w-2xl">
        <p className="eyebrow">Profil akun</p>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Edit profil.</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Data berikut yang tampil di halaman portofolio publik Anda. Lengkapi agar kreator lain
          lebih mudah mengenal Anda — perubahan langsung tersimpan di dashboard.
        </p>
      </motion.header>

      <AnimatedRule className="mt-10" />

      <div className="mt-10">
        <ProfilePanel />
      </div>

      <AnimatedRule className="mt-14" />

      <div className="mt-10">
        <h2 className="font-display text-3xl leading-tight">Keamanan akun</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Perbarui email dan password untuk menjaga keamanan akun Anda.
        </p>
        <div className="mt-8">
          <AccountSecurityPanel />
        </div>
      </div>
    </div>
  );
}
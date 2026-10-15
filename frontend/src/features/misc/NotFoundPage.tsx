import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { buttonClasses } from '@/components/ui/Button';
import { fadeUp, stagger, staggerItem } from '@/lib/motion';

export default function NotFoundPage() {
  return (
    <div className="container-page py-24">
      <motion.div variants={stagger(0.1)} initial="hidden" animate="show" className="max-w-2xl">
        <motion.p
          variants={staggerItem}
          className="font-mono text-[4rem] leading-none sm:text-[6rem]"
        >
          404
        </motion.p>
        <motion.div variants={fadeUp} className="mt-6 space-y-4">
          <h1 className="font-display text-3xl leading-tight sm:text-4xl">
            Halaman ini tidak ditemukan.
          </h1>
          <p className="text-sm leading-relaxed text-muted">
            Tautan mungkin sudah berubah, atau portofolio yang Anda cari belum dipublikasikan oleh
            admin.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/" className={buttonClasses('primary')}>
              Kembali ke beranda
            </Link>
            <Link to="/members" className={buttonClasses('outline')}>
              Direktori anggota
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

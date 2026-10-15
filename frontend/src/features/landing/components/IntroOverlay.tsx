import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useEffect, useState } from 'react';

import { ease } from '@/lib/motion';

/** Batas aman bila animasi garis tak selesai — layar tetap bergeser ke atas (ms). */
const FALLBACK_MS = 7000;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.2 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const logoVariant: Variants = {
  hidden: { opacity: 0, scale: 0.82, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease } },
};

/**
 * Layar pembuka "Welcome" halaman landing. Menampilkan logo, wordmark,
 * garis animasi, dan tagline di atas latar ivory agar menyatu dengan Hero,
 * lalu bergeser ke atas untuk menampilkan konten setelah beberapa detik.
 */
export function IntroOverlay({ onDone }: { onDone: () => void }) {
  const reduceMotion = useReducedMotion();
  const [leaving, setLeaving] = useState(false);

  // Lewati layar pembuka untuk pengguna yang memilih mengurangi gerak.
  useEffect(() => {
    if (reduceMotion) onDone();
  }, [reduceMotion, onDone]);

  // Kunci scroll selama welcome tampil.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setLeaving(true), FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (reduceMotion) return null;

  return (
    <motion.div
      role="presentation"
      aria-hidden
      className="paper fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-ivory text-forest"
      initial={false}
      animate={leaving ? { y: '-100%' } : { y: 0 }}
      transition={{ duration: 1, ease }}
      onAnimationComplete={() => {
        if (leaving) onDone();
      }}
    >
      {/* Ornamen latar tipis agar seirama dengan Hero. */}
      <span className="pointer-events-none absolute -left-[7.5rem] -top-[8.5rem] h-72 w-72 rounded-full border border-forest/30" />
      <span className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full border border-forest/20" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center px-6 text-center"
      >
        {/* Logo */}
        <motion.div variants={logoVariant}>
          <img
            src="/craftly-mark.png"
            alt=""
            className="h-20 w-20 object-contain drop-shadow-[0_18px_30px_rgba(25,61,50,0.35)]"
          />
        </motion.div>

        {/* Wordmark */}
        <motion.h1
          variants={item}
          className="mt-8 font-display text-[clamp(2.5rem,9vw,5rem)] font-semibold leading-none tracking-[-0.03em] text-forest"
        >
          Craftly
        </motion.h1>

        {/* Garis animasi */}
        <motion.span
          aria-hidden
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 3.4, ease, delay: 0.5 }}
          onAnimationComplete={() => setLeaving(true)}
          className="mt-7 h-px w-44 origin-center bg-burgundy sm:w-64"
        />

        {/* Tagline */}
        <motion.p
          variants={item}
          className="mt-7 max-w-xl text-sm leading-[1.7] text-forest-soft sm:text-base"
        >
          Craftly, Beragam Anggota, Sejuta Karya.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

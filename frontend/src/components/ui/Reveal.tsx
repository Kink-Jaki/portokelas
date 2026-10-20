import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

import { ease } from '@/lib/motion';
import { cn } from '@/lib/utils';

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  once?: boolean;
  className?: string;
};

/** Muncul perlahan saat elemen masuk viewport (scroll reveal). */
export function Reveal({ children, delay = 0, y = 24, once = true, className }: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-12% 0px -8% 0px' }}
      transition={{ duration: 0.65, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Pembungkus stagger untuk daftar kartu. */
export function Stagger({
  children,
  className,
  delayChildren = 0,
  staggerChildren = 0.07,
}: {
  children: ReactNode;
  className?: string;
  delayChildren?: number;
  staggerChildren?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      // State "show" disimpan permanen setelah masuk viewport agar kartu yang
      // dipasang belakangan (mis. saat pindah halaman pagination) tetap terlihat
      // dan ikut dianimasikan, bukan berhenti di opacity 0.
      animate={inView ? 'show' : 'hidden'}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren, delayChildren } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  slide = 'up',
}: {
  children: ReactNode;
  className?: string;
  /** Arah masuk: 'up' (default), 'left', atau 'right'. */
  slide?: 'up' | 'left' | 'right';
}) {
  const hidden =
    slide === 'left'
      ? { opacity: 0, y: 18, x: -40 }
      : slide === 'right'
        ? { opacity: 0, y: 18, x: 40 }
        : { opacity: 0, y: 18 };

  return (
    <motion.div
      variants={{
        hidden,
        show: { opacity: 1, y: 0, x: 0, transition: { duration: 0.55, ease } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Garis tipis yang tumbuh saat masuk viewport. */
export function AnimatedRule({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={cn('h-px w-full origin-left bg-line', className)}
      initial={reduceMotion ? undefined : { scaleX: 0 }}
      whileInView={reduceMotion ? undefined : { scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease }}
    />
  );
}

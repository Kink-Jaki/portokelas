import type { Variants } from 'framer-motion';

/** Stagger untuk grid kartu NGL. */
export const nglGridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

/** Kartu muncul dengan spring + sedikit pop. */
export const nglCardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 24, mass: 0.8 },
  },
};

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { fadeUp, staggerItem, stagger } from '@/lib/motion';

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <motion.div
      variants={stagger(0.06)}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-center gap-4 px-4 py-6 text-center sm:px-6 sm:py-16"
    >
      {icon ? (
        <motion.div variants={staggerItem} className="text-muted">
          {icon}
        </motion.div>
      ) : null}
      <motion.div variants={fadeUp} className="max-w-md space-y-2">
        <p className="font-display text-2xl text-fg">{title}</p>
        {description ? <p className="text-sm leading-relaxed text-muted">{description}</p> : null}
      </motion.div>
      {action ? <motion.div variants={fadeUp}>{action}</motion.div> : null}
    </motion.div>
  );
}

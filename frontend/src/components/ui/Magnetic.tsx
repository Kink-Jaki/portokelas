import { useEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/utils';

/**
 * Efek magnetik halus pada elemen: elemen sedikit mengikuti kursor.
 * Dinonaktifkan otomatis untuk pengguna yang meminta reduced motion.
 */
export function Magnetic({
  children,
  strength = 0.28,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || reduceMotion) return undefined;

    if (window.matchMedia('(hover: none)').matches) return undefined;

    const onMove = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      element.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
    };

    const onLeave = () => {
      element.style.transform = 'translate3d(0, 0, 0)';
    };

    element.addEventListener('mousemove', onMove);
    element.addEventListener('mouseleave', onLeave);

    return () => {
      element.removeEventListener('mousemove', onMove);
      element.removeEventListener('mouseleave', onLeave);
      element.style.transform = '';
    };
  }, [reduceMotion, strength]);

  return (
    <span
      ref={ref}
      className={cn('inline-block will-change-transform', className)}
      style={{
        transition: reduceMotion ? undefined : 'transform 220ms cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {children}
    </span>
  );
}

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type SectionHeaderProps = {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  /** Elemen judul; h2 secara default. */
  as?: 'h1' | 'h2';
};

/**
 * Kepala section editorial: nomor indeks + eyebrow mono, judul display,
 * deskripsi pendukung, dan slot aksi di kanan. Dipakai lintas halaman agar
 * ritme tipografi dan penomoran section konsisten.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  action,
  className,
  as: Heading = 'h2',
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10',
        className,
      )}
    >
      <div className="max-w-2xl">
        <p className="eyebrow flex items-center gap-3">
          {index ? (
            <>
              <span className="index-num">{index}</span>
              <span aria-hidden className="h-px w-6 bg-line-strong" />
            </>
          ) : null}
          {eyebrow}
        </p>
        <Heading className="mt-5 text-balance font-display text-3xl leading-[1.05] tracking-[-0.025em] sm:text-4xl lg:text-[2.75rem]">
          {title}
        </Heading>
        {description ? (
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

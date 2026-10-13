import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { buttonClasses } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePublicMemories } from '@/hooks/usePublic';
import { assetUrl } from '@/lib/api';
import { ease } from '@/lib/motion';
import { useAuth } from '@/providers/AuthProvider';

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <path
        d={direction === 'left' ? 'M19 12H5M11 6l-6 6 6 6' : 'M5 12h14M13 6l6 6-6 6'}
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function shuffleArray<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = array[i];
    const target = array[j];
    if (current === undefined || target === undefined) continue;
    array[i] = target;
    array[j] = current;
  }
  return array;
}

export function MemoriesSection() {
  const { data, isLoading } = usePublicMemories();
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();

  const memories = useMemo(() => {
    return shuffleArray(data?.memories ?? []).slice(0, 12);
  }, [data?.memories]);

  const total = memories.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setActive(0);
  }, [memories]);

  useEffect(() => {
    if (total <= 1 || paused || reduceMotion) return;

    const timer = window.setTimeout(() => {
      setActive((current) => (current >= total - 1 ? 0 : current + 1));
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [active, total, paused, reduceMotion]);

  const goTo = (index: number) => {
    const bounded = Math.min(Math.max(index, 0), total - 1);
    setActive(bounded);
  };

  const current = memories[active] ?? memories[0] ?? null;

  const carousel = (
    <div
      className="relative overflow-hidden border border-line bg-subtle"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onPointerDown={() => setPaused(true)}
    >
      <div className="relative aspect-[4/3] w-full">
        <AnimatePresence mode="wait" initial={false}>
          {current ? (
            <motion.div
              key={current.id}
              className="absolute inset-0"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.15 : 0.4, ease }}
            >
              <img
                src={assetUrl(current.imageUrl) ?? ''}
                alt={current.caption ?? 'Kenangan'}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {total > 0 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <span className="pointer-events-auto border border-line bg-bg/90 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.2em] text-muted backdrop-blur">
            {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>

          <div className="pointer-events-auto flex gap-2">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              disabled={active <= 0}
              aria-label="Foto kenangan sebelumnya"
              className="grid h-10 w-10 place-items-center border border-line bg-bg/90 text-fg backdrop-blur transition-colors duration-200 hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              disabled={active >= total - 1}
              aria-label="Foto kenangan berikutnya"
              className="grid h-10 w-10 place-items-center border border-line bg-bg/90 text-fg backdrop-blur transition-colors duration-200 hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <section id="memories" className="section-light paper border-b border-line">
      <div className="container-page py-20 lg:py-28">
        <Reveal>
          <SectionHeader
            index="05"
            eyebrow="Memories"
            title="Kenangan komunitas"
            description="Foto-foto kenangan dari seluruh kreator. Carousel menampilkan kiriman secara acak — setiap kunjungan urutannya bisa berbeda."
          />
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-12">
          <Reveal>
            {isLoading ? (
              <div className="aspect-[4/3] animate-pulse border border-line bg-subtle" />
            ) : total === 0 ? (
              <div className="grid min-h-64 place-items-center border border-line bg-subtle px-6 text-center">
                <div className="space-y-3 text-muted">
                  <p className="font-display text-2xl text-fg">
                    Belum ada kenangan
                  </p>
                  <p className="max-w-sm text-sm leading-relaxed">
                    Jadilah yang pertama mengunggah foto.
                  </p>
                </div>
              </div>
            ) : (
              carousel
            )}
          </Reveal>

          <Reveal delay={0.08}>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="mt-4 h-10 w-full" />
              </div>
            ) : current ? (
              <div className="space-y-4">
                <div>
                  <p className="eyebrow">Kenangan saat ini</p>
                  <p className="mt-2 text-base leading-relaxed text-fg">
                    {current.caption ?? 'Tanpa keterangan'}
                  </p>
                  {current.author ? (
                    <p className="mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
                      Oleh{' '}
                      <Link
                        to={`/m/${current.author.slug}`}
                        className="text-fg hover:text-accent"
                      >
                        {current.author.alias ?? current.author.name}
                      </Link>
                    </p>
                  ) : null}
                </div>

                {total > 1 ? (
                  <div className="flex flex-wrap gap-2">
                    {memories.slice(0, 6).map((memory, index) => (
                      <button
                        key={memory.id}
                        type="button"
                        onClick={() => goTo(index)}
                        aria-label={`Tampilkan foto kenangan ${index + 1}`}
                        className={`h-1.5 transition-all duration-300 ${
                          index === active ? 'w-8 bg-fg' : 'w-4 bg-line-strong hover:bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3 pt-2">
                  {user ? (
                    <Link
                      to="/dashboard?tab=memories"
                      className={buttonClasses('primary', 'lg')}
                    >
                      Unggah kenangan
                    </Link>
                  ) : (
                    <Link to="/login" className={buttonClasses('primary', 'lg')}>
                      Masuk & unggah
                    </Link>
                  )}
                  <Link to="/members" className={buttonClasses('outline', 'lg')}>
                    Lihat kreator
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="eyebrow">Kenangan</p>
                <p className="text-sm leading-relaxed text-muted">
                  Belum ada kenangan. Jadilah yang pertama mengunggah foto.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  {user ? (
                    <Link
                      to="/dashboard?tab=memories"
                      className={buttonClasses('primary', 'lg')}
                    >
                      Unggah kenangan
                    </Link>
                  ) : (
                    <Link to="/login" className={buttonClasses('primary', 'lg')}>
                      Masuk & unggah
                    </Link>
                  )}
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { Reveal } from '@/components/ui/Reveal';
import { useTeachers } from '@/hooks/usePublic';
import { assetUrl } from '@/lib/api';
import { ease } from '@/lib/motion';
import { cn, initials } from '@/lib/utils';
import type { Teacher } from '@/types/api';

function TeacherPhoto({ teacher }: { teacher: Teacher }) {
  const src = assetUrl(teacher.photoUrl);

  if (src) {
    return (
      <img
        src={src}
        alt={`Foto ${teacher.name}`}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div
      aria-hidden
      className="grid h-full w-full place-items-center bg-subtle text-muted"
    >
      <span className="font-display text-6xl">{initials(teacher.name)}</span>
    </div>
  );
}

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

export function TeacherSection() {
  const { data, isLoading } = useTeachers();
  const teachers = data?.teachers ?? [];
  const total = teachers.length;

  const trackRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(1);
  const reduceMotion = useReducedMotion();

  const maxIndex = Math.max(total - visible, 0);
  const positions = maxIndex + 1;

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  /** Ukur lebar satu kartu dan jumlah kartu yang tampil (responsif). */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || total === 0) return;

    const recompute = () => {
      const first = track.firstElementChild as HTMLElement | null;
      if (!first) return;

      const second = first.nextElementSibling as HTMLElement | null;
      const measuredStep = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
      if (measuredStep <= 0) return;

      const gap = measuredStep - first.offsetWidth;
      const measuredVisible = Math.max(
        1,
        Math.round((track.clientWidth + gap) / measuredStep),
      );

      setStep(measuredStep);
      setVisible(measuredVisible);
      setActive((previous) => Math.min(previous, Math.max(total - measuredVisible, 0)));
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(track);
    return () => observer.disconnect();
  }, [total]);

  /** Index slide aktif dihitung dari posisi scroll (dibungkus rAF agar ringan). */
  const handleScroll = useCallback(() => {
    if (frameRef.current !== null) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const track = trackRef.current;
      if (!track || step <= 0) return;

      const index = Math.round(track.scrollLeft / step);
      setActive((previous) => {
        const next = Math.min(Math.max(index, 0), maxIndex);
        return previous === next ? previous : next;
      });
    });
  }, [step, maxIndex]);

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      const bounded = Math.min(Math.max(index, 0), maxIndex);

      setActive(bounded);
      if (!track) return;
      track.scrollTo({
        left: bounded * step,
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    },
    [step, maxIndex, reduceMotion],
  );

  /** Geser otomatis ke posisi berikutnya setiap beberapa detik. */
  useEffect(() => {
    if (positions <= 1 || paused || reduceMotion) return;

    const timer = window.setTimeout(() => {
      goTo(active >= maxIndex ? 0 : active + 1);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [active, maxIndex, positions, paused, reduceMotion, goTo]);

  const current = teachers[active] ?? teachers[0] ?? null;

  const carousel =
    total === 0 ? (
      <div
        className={`grid place-items-center border border-line bg-subtle px-6 text-center ${
          isLoading ? 'aspect-[4/3] lg:aspect-[4/5]' : 'min-h-64 py-16'
        }`}
      >
        <div className="space-y-3 text-muted">
          <p className="font-display text-2xl text-fg">
            {isLoading ? 'Memuat mentor…' : 'Belum ada data mentor'}
          </p>
          {!isLoading ? (
            <p className="max-w-sm text-sm leading-relaxed">
              Tambahkan mentor lewat panel admin agar carousel ini tampil.
            </p>
          ) : null}
        </div>
      </div>
    ) : (
      <div
        className="relative overflow-hidden border border-line bg-subtle"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onPointerDown={() => setPaused(true)}
      >
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex w-full snap-x snap-mandatory items-start gap-3 overflow-x-auto"
          role="group"
          aria-label="Carousel foto mentor"
        >
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="aspect-[4/5] w-full shrink-0 snap-start"
            >
              <TeacherPhoto teacher={teacher} />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <span className="pointer-events-auto border border-line bg-bg/90 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.2em] text-muted backdrop-blur">
            {String(active + 1).padStart(2, '0')} / {String(positions).padStart(2, '0')}
          </span>

          <div className="pointer-events-auto flex gap-2">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              disabled={active <= 0}
              aria-label="Foto mentor sebelumnya"
              className="grid h-10 w-10 place-items-center border border-line bg-bg/90 text-fg backdrop-blur transition-colors duration-200 hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              disabled={active >= maxIndex}
              aria-label="Foto mentor berikutnya"
              className="grid h-10 w-10 place-items-center border border-line bg-bg/90 text-fg backdrop-blur transition-colors duration-200 hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <section id="mentor" className="section-dark border-b border-line">
      <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-16 lg:py-24">
        <Reveal>{carousel}</Reveal>

        <Reveal delay={0.08}>
          <p className="eyebrow flex items-center gap-3">
            <span className="index-num">02</span>
            <span aria-hidden className="h-px w-6 bg-line-strong" />
            Mentor
          </p>

          <div className="mt-6 min-h-56 sm:min-h-52">
            {current ? (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                  transition={{ duration: reduceMotion ? 0.15 : 0.4, ease }}
                >
                  <h2 className="font-display text-3xl leading-[1.08] tracking-[-0.02em] sm:text-4xl lg:text-[2.75rem]">
                    {current.name}
                  </h2>
                  <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
                    {current.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            ) : (
              <p className="max-w-xl text-base leading-relaxed text-muted">
                {isLoading
                  ? 'Memuat data mentor…'
                  : 'Nama dan deskripsi mentor akan tampil di sini setelah ditambahkan lewat panel admin.'}
              </p>
            )}
          </div>

          {total > 0 ? (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {positions > 1 ? (
                <div className="flex items-center gap-2" role="tablist" aria-label="Pilih mentor">
                  {Array.from({ length: positions }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      role="tab"
                      aria-selected={index === active}
                      aria-label={`Tampilkan ${teachers[index]?.name ?? `mentor ${index + 1}`}`}
                      onClick={() => goTo(index)}
                      className={cn(
                        'h-1.5 transition-all duration-300',
                        index === active ? 'w-8 bg-fg' : 'w-4 bg-line-strong hover:bg-muted',
                      )}
                    />
                  ))}
                </div>
              ) : null}
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted">
                Slide otomatis · geser foto untuk memilih
              </p>
            </div>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

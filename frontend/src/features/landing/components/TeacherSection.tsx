import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { Reveal } from '@/components/ui/Reveal';
import { useTeachers } from '@/hooks/usePublic';
import { assetUrl } from '@/lib/api';
import { ease } from '@/lib/motion';
import { cn, initials } from '@/lib/utils';
import type { Teacher } from '@/types/api';

import { LeafSprig } from './ornaments';

function TeacherPhoto({ teacher }: { teacher: Teacher }) {
  const src = assetUrl(teacher.photoUrl);

  if (src) {
    return (
      <img
        src={src}
        alt={`Foto ${teacher.name}`}
        loading="lazy"
        className="h-full w-full object-cover object-center"
      />
    );
  }

  return (
    <div aria-hidden className="grid h-full w-full place-items-center bg-subtle text-maroon-soft">
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

/** Nama guru dipecah warna: bagian sebelum koma (maroon) & gelar (forest). */
function TeacherName({ name }: { name: string }) {
  const commaIndex = name.indexOf(',');

  if (commaIndex === -1) {
    return <span className="text-maroon">{name}</span>;
  }

  return (
    <>
      <span className="text-maroon">{name.slice(0, commaIndex + 1)}</span>
      <span className="text-pine">{name.slice(commaIndex + 1)}</span>
    </>
  );
}

/** Ornamen botanical sudut section — selalu di belakang konten. */
function TeacherOrnaments() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      {/* Kiri atas — lengkung organik maroon (mobile: kecil & samar di sudut) */}
      <svg
        viewBox="0 0 260 260"
        fill="none"
        className="absolute -left-14 -top-16 h-40 w-40 text-maroon opacity-[0.08] sm:-left-24 sm:-top-28 sm:h-72 sm:w-72 sm:opacity-[0.12]"
      >
        <path d="M8 250C-6 130 60 24 200 8" stroke="currentColor" strokeWidth="2.5" />
        <path
          d="M40 250C34 150 92 60 214 44"
          stroke="currentColor"
          strokeWidth="1.4"
          opacity="0.7"
        />
      </svg>

      {/* Kiri atas — garis tipis soft gold */}
      <svg
        viewBox="0 0 220 200"
        fill="none"
        className="absolute -left-6 -top-6 hidden h-44 w-48 text-gold opacity-70 sm:block"
      >
        <path d="M6 150C58 128 118 96 176 42" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Kiri atas — ranting daun forest green (dihapus sesuai permintaan) */}

      {/* Titik dekoratif gold & maroon */}
      <span className="absolute left-[12%] top-24 hidden h-1.5 w-1.5 rounded-full bg-gold/80 lg:block" />
      <span className="absolute left-[7%] top-40 hidden h-1 w-1 rounded-full bg-maroon/50 lg:block" />

      {/* Kanan bawah — lengkung organik forest green (mobile: kecil & samar) */}
      <svg
        viewBox="0 0 260 260"
        fill="none"
        className="absolute -bottom-16 -right-14 h-40 w-40 text-pine opacity-[0.08] sm:-bottom-28 sm:-right-24 sm:h-72 sm:w-72 sm:opacity-[0.13]"
      >
        <path d="M252 8C266 130 200 236 60 252" stroke="currentColor" strokeWidth="2.5" />
        <path
          d="M220 8C226 108 168 198 46 214"
          stroke="currentColor"
          strokeWidth="1.4"
          opacity="0.7"
        />
      </svg>

      {/* Kanan bawah — aksen maroon kecil */}
      <svg
        viewBox="0 0 120 120"
        fill="none"
        className="absolute -bottom-4 right-8 hidden h-28 w-28 text-maroon opacity-25 lg:block"
      >
        <path d="M6 114C40 110 78 92 108 58" stroke="currentColor" strokeWidth="2" />
      </svg>

      {/* Kanan bawah — garis tipis soft gold */}
      <svg
        viewBox="0 0 220 160"
        fill="none"
        className="absolute -bottom-4 -right-4 hidden h-36 w-48 text-gold opacity-60 sm:block"
      >
        <path d="M214 6C170 34 108 70 50 128" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Kanan bawah — ranting daun forest green */}
      <LeafSprig className="absolute -right-6 bottom-4 hidden h-36 w-36 rotate-180 text-pine opacity-30 sm:block" />
    </div>
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
      const measuredVisible = Math.max(1, Math.round((track.clientWidth + gap) / measuredStep));

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
        className={`grid place-items-center rounded-[14px] border border-line bg-subtle px-6 text-center sm:rounded-[6px] ${
          isLoading ? 'aspect-[4/3] lg:aspect-[4/5]' : 'min-h-64 py-16'
        }`}
      >
        <div className="space-y-3 text-muted">
          <p className="font-display text-2xl text-pine">
            {isLoading ? 'Memuat wali kelas…' : 'Belum ada data wali kelas'}
          </p>
          {!isLoading ? (
            <p className="max-w-sm text-sm leading-relaxed">
              Tambahkan wali kelas lewat panel admin agar carousel ini tampil.
            </p>
          ) : null}
        </div>
      </div>
    ) : (
      <div
        className="relative overflow-hidden rounded-[14px] border border-line bg-subtle shadow-[0_28px_55px_-40px_rgba(32,75,59,0.55)] sm:rounded-[6px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onPointerDown={() => setPaused(true)}
      >
        {/* Ornamen foto — lengkung maroon kiri atas & daun forest kanan atas */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <span className="absolute inset-2 rounded-[3px] border border-gold/40" />
          <svg
            viewBox="0 0 120 120"
            fill="none"
            className="absolute -left-3 -top-3 h-20 w-20 text-maroon opacity-45"
          >
            <path d="M4 104C8 54 42 16 104 6" stroke="currentColor" strokeWidth="2" />
          </svg>
          <svg
            viewBox="0 0 120 120"
            fill="none"
            className="absolute -right-2 -top-2 h-16 w-16 rotate-90 text-pine opacity-45"
          >
            <path d="M14 106C46 92 76 66 104 30" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M30 88c-6 7-4 18 0 24 4-6 6-17 0-24Z"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M56 66c-5 6-3 16 0 21 3-5 5-15 0-21Z"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
        </div>

        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex w-full snap-x snap-mandatory items-start gap-3 overflow-x-auto"
          role="group"
          aria-label="Carousel foto wali kelas"
        >
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="h-[17.5rem] w-full shrink-0 snap-start min-[360px]:h-[20rem] min-[390px]:h-[22rem] sm:aspect-[4/5] sm:h-auto"
            >
              <TeacherPhoto teacher={teacher} />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-4">
          <span className="pointer-events-auto rounded-[3px] bg-pine px-3.5 py-2.5 font-mono text-[0.6875rem] tracking-[0.2em] text-ivory-warm sm:px-3 sm:py-1.5">
            {String(active + 1).padStart(2, '0')} / {String(positions).padStart(2, '0')}
          </span>

          <div className="pointer-events-auto flex gap-2">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              disabled={active <= 0}
              aria-label="Foto wali kelas sebelumnya"
              className="grid h-11 w-11 place-items-center rounded-[3px] border border-line bg-bg text-maroon transition-colors duration-200 hover:border-maroon hover:bg-maroon hover:text-ivory-warm disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              disabled={active >= maxIndex}
              aria-label="Foto wali kelas berikutnya"
              className="grid h-11 w-11 place-items-center rounded-[3px] border border-pine bg-pine text-ivory-warm transition-colors duration-200 hover:border-pine-deep hover:bg-pine-deep disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <section id="wali-kelas" className="section-teacher relative isolate overflow-visible">
      <TeacherOrnaments />

      <div className="container-page section-pad relative z-10 flex min-w-0 flex-col gap-8 px-4 min-[360px]:px-5 md:px-10 xl:px-14 lg:grid lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:grid-rows-[auto_auto] lg:items-center lg:gap-x-16 lg:gap-y-0">
        {/* Carousel foto — mobile: urutan pertama (foto dulu); lg: kolom kiri */}
        <Reveal className="min-w-0 lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:self-center">
          {carousel}
        </Reveal>

        {/* Indikator slide + petunjuk — mobile: tepat di bawah foto; lg: bawah kolom kanan */}
        {total > 0 ? (
          <Reveal className="min-w-0 lg:col-start-2 lg:row-start-2 lg:mt-8 lg:self-start">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
              {positions > 1 ? (
                <div
                  className="flex items-center gap-2.5 sm:gap-2"
                  role="tablist"
                  aria-label="Pilih wali kelas"
                >
                  {Array.from({ length: positions }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      role="tab"
                      aria-selected={index === active}
                      aria-label={`Tampilkan ${teachers[index]?.name ?? `wali kelas ${index + 1}`}`}
                      onClick={() => goTo(index)}
                      className={cn(
                        'h-1.5 transition-all duration-300',
                        index === active ? 'w-8 bg-maroon' : 'w-4 bg-line-strong hover:bg-gold',
                      )}
                    />
                  ))}
                </div>
              ) : null}
              <span aria-hidden className="hidden h-px w-8 bg-gold sm:block" />
              <p className="hidden font-mono text-[0.625rem] uppercase leading-relaxed tracking-[0.24em] text-pine sm:block sm:text-[0.6875rem] sm:tracking-[0.2em]">
                {positions > 1 && !reduceMotion
                  ? 'Slide otomatis · geser foto untuk memilih'
                  : 'Geser foto untuk memilih'}
              </p>
            </div>
          </Reveal>
        ) : null}

        {/* Label, nama, deskripsi — mobile: di bawah indikator; lg: kolom kanan atas */}
        <Reveal className="min-w-0 lg:col-start-2 lg:row-start-1 lg:self-end">
          <p className="eyebrow flex items-center gap-3 tracking-[0.28em] text-pine sm:tracking-[0.22em]">
            <span className="index-num tracking-[0.3em] sm:tracking-[0.18em]">02</span>
            <span aria-hidden className="h-px w-6 bg-gold" />
            Wali Kelas
          </p>

          <div className="mt-5 min-h-44 sm:mt-6 sm:min-h-52">
            {current ? (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                  transition={{ duration: reduceMotion ? 0.15 : 0.4, ease }}
                >
                  <h2 className="min-w-0 break-words font-display text-[1.9375rem] leading-[1.12] tracking-[-0.02em] min-[360px]:text-[2rem] min-[390px]:text-[2.1875rem] sm:text-4xl lg:text-[2.75rem]">
                    <TeacherName name={current.name} />
                  </h2>
                  <p className="mt-4 max-w-xl text-[0.9375rem] leading-[1.7] text-moss sm:mt-6 sm:text-base sm:leading-[1.75]">
                    {current.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            ) : (
              <p className="max-w-xl text-[0.9375rem] leading-[1.7] text-moss sm:text-base sm:leading-[1.75]">
                {isLoading
                  ? 'Memuat data wali kelas…'
                  : 'Nama dan deskripsi wali kelas akan tampil di sini setelah ditambahkan lewat panel admin.'}
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

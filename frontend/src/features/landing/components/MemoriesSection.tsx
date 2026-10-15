import { useMemo } from 'react';

import { Reveal } from '@/components/ui/Reveal';
import { usePublicMemories as _usePublicMemories } from '@/hooks/usePublic';
import { assetUrl } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

import { HeartDoodle, LeafSprig, PaperPlane, PenCurve, Sparkle } from './ornaments';

/** Variasi kemiringan kartu polaroid (deterministik agar marquee tetap stabil). */
const TILT_TOP = [
  '-rotate-2',
  'rotate-1',
  '-rotate-1',
  'rotate-2',
  '-rotate-1',
  'rotate-2',
  '-rotate-2',
  'rotate-1',
  '-rotate-1',
  'rotate-2',
];
const TILT_BOTTOM = [
  'rotate-1',
  '-rotate-2',
  'rotate-2',
  '-rotate-1',
  'rotate-1',
  '-rotate-2',
  'rotate-2',
  '-rotate-1',
  '-rotate-2',
  'rotate-1',
];

/** Warna pita perekat: maroon, forest, mustard, sage, dan beige. */
const TAPE_TONES = [
  'bg-[#76263d]/45',
  'bg-[#174638]/40',
  'bg-[#d7ad5d]/65',
  'bg-[#a1b29a]/70',
  'bg-[#d8c6a2]/85',
];

/** Nada kertas placeholder supaya baris marquee tidak seragam. */
const PLACEHOLDER_TONES = ['bg-[#f2ead9]', 'bg-[#f3e7e2]', 'bg-[#e9eee2]'];

type MarqueeItem = {
  id: string;
  src: string | null;
  caption: string | null;
};

/* ------------------------------ Ikon kecil ------------------------------ */

function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2.4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="10" r="1.7" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M4 17l4.6-4.2a1.6 1.6 0 0 1 2.2.05L14 16l1.6-1.5a1.6 1.6 0 0 1 2.2 0L20 16.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

/**
 * Ornamen kecil yang ditempel pada sebagian kartu saja — sengaja tidak seragam
 * supaya galeri terasa personal seperti album yang ditata tangan.
 */
function FrameOrnament({ index }: { index: number }) {
  switch (index % 5) {
    case 0:
      return (
        <LeafSprig className="pointer-events-none absolute -right-4 -top-5 h-11 w-11 -rotate-12 text-sage/80" />
      );
    case 1:
      return (
        <Sparkle className="pointer-events-none absolute -left-3 -bottom-3 h-4 w-4 text-[#d7ad5d]" />
      );
    case 2:
      return (
        <HeartDoodle className="pointer-events-none absolute -right-3 -bottom-4 h-7 w-7 -rotate-6 text-maroon/55" />
      );
    case 3:
      return (
        <span
          aria-hidden
          className="pointer-events-none absolute -left-5 top-6 hidden h-10 w-8 border-l border-dashed border-sage/70 sm:block"
        />
      );
    default:
      return (
        <Sparkle className="pointer-events-none absolute -right-3 top-4 h-3.5 w-3.5 text-maroon/50" />
      );
  }
}

/* ------------------------------ Kartu foto ------------------------------ */

/**
 * Satu bingkai kenangan bergaya polaroid: bingkai kertas ivory, pita perekat,
 * nomor foto, dan keterangan tulisan tangan. Foto asli dipakai bila ada,
 * jika tidak memakai placeholder kertas.
 */
function MemoryFrame({
  item,
  index,
  variant,
}: {
  item: MarqueeItem;
  index: number;
  variant: 'top' | 'bottom';
}) {
  const src = item.src ? assetUrl(item.src) : null;
  const tilt = (variant === 'top' ? TILT_TOP : TILT_BOTTOM)[index % TILT_TOP.length];
  const tone = TAPE_TONES[(index + (variant === 'top' ? 0 : 1)) % TAPE_TONES.length];
  const placeholderTone = PLACEHOLDER_TONES[index % PLACEHOLDER_TONES.length];
  const number = String(index + 1).padStart(2, '0');

  return (
    <figure className="group/frame relative w-36 shrink-0 sm:w-44 lg:w-52">
      <FrameOrnament index={index} />

      <div
        className={cn(
          'relative rounded-[10px] border border-[#e0d4bd] bg-ivory-warm p-2 pb-10',
          'shadow-[0_24px_44px_-32px_rgba(84,32,42,0.55)]',
          'transition-[transform,box-shadow] duration-300 ease-out',
          'group-hover/frame:-translate-y-1 group-hover/frame:rotate-0 group-hover/frame:shadow-[0_34px_56px_-32px_rgba(84,32,42,0.62)]',
          'motion-reduce:transform-none',
          tilt,
        )}
      >
        {/* Pita perekat — potongan selotip kertas yang ditempel manual */}
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute -top-2.5 left-1/2 z-20 h-[18px] w-14 -translate-x-1/2 -rotate-[6deg] rounded-[2px]',
            'border border-white/35 shadow-[0_2px_6px_-3px_rgba(84,32,42,0.45)]',
            tone,
          )}
        />

        {/* Foto */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3px] bg-subtle">
          {src ? (
            <img
              src={src}
              alt={item.caption ?? `Kenangan ${index + 1}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/frame:scale-[1.04] motion-reduce:transform-none"
            />
          ) : (
            <div
              className={cn(
                'relative flex h-full w-full items-center justify-center',
                placeholderTone,
              )}
            >
              <span
                aria-hidden
                className="absolute inset-2 rounded-[2px] border border-dashed border-[#d8c6a2]"
              />
              <PhotoIcon className="h-7 w-7 text-sage" />
            </div>
          )}
          {/* Vignette halus agar terasa seperti cetakan analog */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 shadow-[inset_0_0_30px_rgba(84,32,42,0.16)]"
          />
        </div>

        {/* Margin bawah: nomor + keterangan tulisan tangan */}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 px-3 pb-3">
          <span className="font-mono text-[0.5625rem] font-medium tracking-[0.24em] text-maroon">
            {number}
          </span>
          <span aria-hidden className="h-px w-4 bg-[#d8c6a2]" />
          {item.caption ? (
            <span className="truncate font-hand text-[0.8125rem] leading-none text-maroon-deep/80">
              {item.caption}
            </span>
          ) : (
            <PhotoIcon className="ml-auto h-3.5 w-3.5 text-sage" />
          )}
        </div>
      </div>
    </figure>
  );
}

/**
 * Baris marquee horizontal. Dua salinan daftar yang identik dirender berdampingan
 * lalu digeser -50% agar loop tanpa jeda. `direction` adalah arah gerak visual
 * foto ("right" = kiri→kanan, "left" = kanan→kiri), sedangkan hover/focus
 * menjeda animasi agar pengunjung bisa mengamati foto.
 */
function MarqueeRow({
  items,
  direction,
  variant,
}: {
  items: MarqueeItem[];
  direction: 'left' | 'right';
  variant: 'top' | 'bottom';
}) {
  return (
    <div className="group relative w-full overflow-hidden py-6 [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]">
      <div
        className={cn(
          'flex w-max',
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right',
          'group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]',
        )}
      >
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex gap-4 pr-4 sm:gap-5 sm:pr-5">
            {items.map((item, index) => (
              <li key={`${copy}-${item.id}`}>
                <MemoryFrame item={item} index={index} variant={variant} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Judul section ---------------------------- */

/**
 * Heading editorial dua baris: "Kenangan" serif forest green bertumpu di atas
 * "kelas" tulisan tangan maroon, dikelilingi coretan pensil, sapuan sage,
 * dan satu sparkle.
 */
function MemoriesHeading() {
  return (
    <div className="relative max-w-2xl">
      <p className="eyebrow flex items-center gap-3">
        <span className="index-num">05</span>
        <span aria-hidden className="h-px w-6 bg-line-strong" />
        Memories
      </p>

      <h2 className="relative mt-6">
        <span className="relative z-10 block font-display text-[2.4rem] font-semibold leading-[0.98] tracking-[-0.03em] text-forest sm:text-[3.2rem] lg:text-[3.75rem]">
          Kenangan
        </span>
        <span className="relative z-10 -mt-0.5 block pl-1 font-hand text-[2.6rem] font-semibold leading-[1] text-maroon sm:pl-4 sm:text-[3.4rem] lg:text-[4rem]">
          kelas
          <Sparkle className="ml-3 inline-block h-4 w-4 align-[0.35em] text-[#d7ad5d] sm:h-5 sm:w-5" />
        </span>

        {/* Coretan pensil di samping judul */}
        <span
          aria-hidden
          className="pointer-events-none absolute right-0 top-3 hidden items-center gap-2 lg:flex"
        >
          <span className="h-px w-8 -rotate-[5deg] bg-maroon/50" />
          <span className="h-px w-5 rotate-[4deg] bg-[#d7ad5d]" />
          <span className="h-px w-4 -rotate-[8deg] bg-maroon/40" />
        </span>
      </h2>

      {/* Sapuan lengkung sage + sorotan maroon/mustard di bawah judul */}
      <svg
        viewBox="0 0 240 18"
        fill="none"
        aria-hidden="true"
        className="mt-3 h-4 w-44 text-sage sm:w-56 lg:w-64"
      >
        <path
          d="M4 11c34-7 68-7 102-3 34 4 74 3 130-5"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M16 15c30-5 60-5 88-2"
          stroke="var(--color-maroon)"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M150 14c22-2 44-4 64-8"
          stroke="#d7ad5d"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.9"
        />
      </svg>

      {/* Jejak putus-putus di ruang kosong sebelah kanan judul */}
      <svg
        viewBox="0 0 320 90"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-[100px] hidden h-14 w-40 text-sage/70 lg:block"
      >
        <path
          d="M4 74C70 46 140 66 200 34 250 8 286 18 316 8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeDasharray="5 10"
          strokeLinecap="round"
        />
      </svg>

      {/* Deskripsi hangat agar section terasa personal, bukan teknis */}
      <p className="mt-6 max-w-xl text-[0.9375rem] leading-[1.75] text-[#3c4b43] sm:text-base">
        Setiap foto menyimpan cerita, setiap momen punya arti. Dari tawa dalam kebersamaan hingga
        momen yang tak terlupakan, semuanya menjadi bagian dari perjalanan kita.
      </p>

      {/* Tagline: potongan kertas bertuliskan tulisan tangan */}
      <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-4">
        <div className="inline-block -rotate-2">
          <p className="relative rounded-[6px] border border-[#e6d6c9] bg-[#f6ebdd] px-4 py-2.5 shadow-[0_18px_30px_-24px_rgba(84,32,42,0.6)] paper">
            <span className="font-hand text-[1.35rem] leading-none text-maroon sm:text-[1.55rem]">
              Satu komunitas,
            </span>{' '}
            <span className="font-hand text-[1.35rem] leading-none text-forest sm:text-[1.55rem]">
              sejuta cerita
            </span>
            <HeartDoodle className="ml-1.5 inline-block h-4 w-4 -translate-y-0.5 text-maroon/70" />
          </p>
        </div>

        <PenCurve className="hidden h-8 w-20 text-sage/80 sm:block" />
      </div>
    </div>
  );
}

/* ---------------------------- Latar dekoratif ---------------------------- */

/** Lapisan ornamen scrapbook: bentuk organik, pesawat kertas, bintang, hati. */
function MemoriesOrnaments() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      {/* Bentuk organik opacity rendah di balik konten */}
      <span className="absolute -left-32 top-24 h-80 w-80 rounded-[58%_42%_47%_53%/46%_56%_44%_54%] bg-sage/15" />
      <span className="absolute -right-24 top-[45%] h-72 w-72 rounded-[46%_54%_58%_42%/52%_44%_56%_48%] bg-maroon/[0.07]" />
      <span className="absolute -left-20 bottom-10 h-64 w-64 rounded-[52%_48%_40%_60%/54%_46%_54%_46%] bg-[#d7ad5d]/15" />

      {/* Lanjutan jembatan dari section Anggota — melintasi batas teratas. */}
      <LeafSprig className="absolute -top-12 left-[16%] hidden h-24 w-24 -rotate-[18deg] text-sage/70 sm:block" />

      {/* Ranting kecil di pojok kiri atas section */}
      <LeafSprig className="absolute left-0 top-1 hidden h-14 w-14 -rotate-12 text-sage/70 sm:block lg:h-16 lg:w-16" />

      {/* Pesawat kertas: sudut kanan atas saat layout bertumpuk (sm/md),
          pita bawah saat panel video menempati kanan (lg+). */}
      <PaperPlane className="absolute right-6 top-8 hidden h-20 w-20 sm:block lg:hidden" />
      <PaperPlane className="absolute bottom-3 right-5 hidden h-16 w-16 lg:block xl:h-20 xl:w-20" />

      {/* Aksen kecil pada ruang kosong: sisi judul, tepi video, pita bawah */}
      <Sparkle className="absolute right-[26%] top-[7%] hidden h-4 w-4 text-maroon/45 sm:block" />
      <Sparkle className="absolute left-1 top-[46%] hidden h-3.5 w-3.5 text-[#d7ad5d]/80 lg:block" />
      <Sparkle className="absolute bottom-4 right-[7%] hidden h-4 w-4 text-maroon/40 sm:block lg:hidden" />
      <HeartDoodle className="absolute bottom-4 left-[6%] hidden h-7 w-7 -rotate-[10deg] text-maroon/40 sm:block" />
    </div>
  );
}

/* ------------------------------ Panel video ----------------------------- */

/** Panel video persegi panjang (16:9) sebagai focal point section kenangan. */
function VideoPanel() {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      {/* Lapisan organik sage & maroon di belakang panel */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-4 -top-7 -z-10 h-36 w-56 rounded-[58%_42%_47%_53%/46%_56%_44%_54%] bg-sage/30 sm:-left-8 sm:h-44 sm:w-72"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-8 -right-4 -z-10 h-32 w-52 rounded-[46%_54%_58%_42%/52%_44%_56%_48%] bg-maroon/15 sm:-right-8 sm:h-40 sm:w-64"
      />

      {/* Bingkai ivory + border beige, panel terangkat dari kertas */}
      <div className="rounded-[18px] border border-[#d8c6a2] bg-ivory-warm p-2.5 shadow-[0_50px_90px_-52px_rgba(23,70,56,0.85)] sm:rounded-[22px] sm:p-3">
        <div className="group/video relative aspect-video w-full overflow-hidden rounded-[14px] border border-[#d8c6a2] bg-forest sm:rounded-[18px]">
          {/* Inner border sage halus + vignette lembut */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-2.5 rounded-[10px] border border-sage/30 sm:inset-3"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 shadow-[inset_0_0_70px_rgba(9,32,25,0.55)]"
          />
          <Sparkle className="pointer-events-none absolute right-5 top-4 h-4 w-4 text-[#d7ad5d]/70" />
          <HeartDoodle className="pointer-events-none absolute bottom-4 left-5 h-6 w-6 -rotate-6 text-ivory-warm/35" />

          {/* Tombol play + teks */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2.5 px-5 text-center sm:gap-3.5 sm:px-8">
            <div className="relative">
              <span className="relative z-10 grid h-14 w-14 place-items-center rounded-full border border-[#d7ad5d] bg-maroon text-ivory-warm shadow-[0_18px_40px_-16px_rgba(118,38,61,0.95)] transition duration-300 ease-out group-hover/video:scale-105 group-hover/video:bg-[#8b2f49] motion-reduce:transform-none sm:h-[4.5rem] sm:w-[4.5rem]">
                <PlayIcon />
              </span>

              {/* Tiga garis pendek seperti sinar di sekitar tombol */}
              <span
                aria-hidden
                className="absolute left-1/2 top-[-14px] h-1.5 w-5 -translate-x-1/2 rounded-full bg-ivory-warm/60"
              />
              <span
                aria-hidden
                className="absolute -left-7 top-1/2 hidden h-1.5 w-5 -translate-y-1/2 -rotate-12 rounded-full bg-[#d7ad5d]/80 sm:block"
              />
              <span
                aria-hidden
                className="absolute -right-7 top-1/2 hidden h-1.5 w-5 -translate-y-1/2 rotate-12 rounded-full bg-[#d7ad5d]/80 sm:block"
              />
            </div>

            <p className="font-hand text-[1.5rem] leading-none text-ivory-warm sm:text-[2rem]">
              Video Kenangan
            </p>

            <p className="hidden max-w-md font-display text-[0.9375rem] italic leading-snug text-ivory-warm/80 sm:block">
              “Potongan cerita yang akan selalu kita ingat.”
            </p>

            <div className="mt-0.5 flex items-center gap-2.5 sm:mt-1">
              <span aria-hidden className="h-px w-7 bg-[#d7ad5d]/80 sm:w-10" />
              <span className="font-mono text-[0.5625rem] uppercase tracking-[0.34em] text-ivory-warm sm:text-[0.625rem]">
                Segera Hadir
              </span>
              <span aria-hidden className="h-px w-7 bg-[#d7ad5d]/80 sm:w-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Section ------------------------------- */

export function MemoriesSection() {
  void _usePublicMemories();
  void useAuth().user;

  /** Baris bawah: masih memakai gambar fallback sampai foto berikutnya tersedia. */
  const bottomItems = useMemo<MarqueeItem[]>(
    () =>
      Array.from({ length: 10 }, (_, index) => ({
        id: `fallback-bottom-${index}`,
        src: null,
        caption: null,
      })),
    [],
  );

  return (
    <section
      id="memories"
      className="section-memories relative isolate overflow-visible"
    >
      <MemoriesOrnaments />

      {/* Desktop: teks di kiri, panel video di kanan sejajar eyebrow 05. */}
      <div className="container-page section-pad-top relative z-10 pb-4 lg:pb-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,44fr)_minmax(0,56fr)] lg:items-center lg:gap-12 xl:gap-16">
          <div className="min-w-0">
            <Reveal>
              <MemoriesHeading />
            </Reveal>

            {/* Pembatas tipis — garis bersih di bawah tagline */}
            <Reveal delay={0.05}>
              <div className="mt-8 flex items-center justify-center gap-3 sm:gap-4">
                <span
                  aria-hidden
                  className="h-px w-16 bg-gradient-to-r from-transparent to-maroon/40 sm:w-28"
                />
                <Sparkle className="h-3 w-3 text-[#d7ad5d]" />
                <span
                  aria-hidden
                  className="h-px w-16 bg-gradient-to-l from-transparent to-maroon/40 sm:w-28"
                />
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <VideoPanel />
          </Reveal>
        </div>
      </div>

      <div className="section-pad-bottom relative z-10 mt-10 lg:mt-14">
        {/* Lapisan bentuk organik + jejak putus-putus di balik galeri */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-[8%] top-4 -z-10 h-40 rounded-[50%_50%_46%_54%/60%_40%_60%_40%] bg-sage/15"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-12 right-[6%] -z-10 h-32 w-44 rounded-[46%_54%_58%_42%/52%_44%_56%_48%] bg-maroon/10"
        />
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-6 -z-10 h-24 w-[calc(100%-3rem)] text-sage/70"
          fill="none"
        >
          <path
            d="M0 88C160 28 320 108 480 58 640 8 800 88 960 38 1060 6 1140 28 1200 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 11"
            strokeLinecap="round"
          />
        </svg>

        <Reveal>
          <MarqueeRow items={bottomItems} direction="left" variant="bottom" />
        </Reveal>
      </div>
    </section>
  );
}

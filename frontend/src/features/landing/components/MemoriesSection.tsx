import { useMemo } from 'react';

import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { usePublicMemories as _usePublicMemories } from '@/hooks/usePublic';
import { assetUrl } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

/** Jumlah bingkai foto pada setiap baris marquee. */


/** Variasi kemiringan kartu polaroid (deterministik agar marquee tetap stabil). */
const TILT_TOP = [
  '-rotate-3',
  'rotate-2',
  '-rotate-2',
  'rotate-3',
  '-rotate-1',
  'rotate-1',
  '-rotate-2',
  'rotate-2',
  '-rotate-3',
  'rotate-1',
];
const TILT_BOTTOM = [
  'rotate-2',
  '-rotate-3',
  'rotate-1',
  '-rotate-2',
  'rotate-3',
  '-rotate-1',
  'rotate-2',
  '-rotate-3',
  '-rotate-1',
  'rotate-2',
];

/** Warna pita perekat: beige, sage, dan maroon untuk variasi scrapbook. */
const TAPE_TONES = ['bg-[#e7dcc4]/85', 'bg-sage/40', 'bg-maroon/25'];

type MarqueeItem = {
  id: string;
  src: string | null;
  caption: string | null;
};



// function shuffleArray removed



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

/* ------------------------------ Kartu foto ------------------------------ */

/**
 * Satu bingkai kenangan bergaya polaroid: bingkai kertas cream, pita perekat,
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
  const number = String(index + 1).padStart(2, '0');

  return (
    <figure className="group/frame relative w-36 shrink-0 sm:w-44 lg:w-52">
      <div
        className={cn(
          'relative rounded-[9px] border border-line bg-elevated p-2 pb-10',
          'shadow-[0_24px_42px_-32px_rgba(84,32,42,0.6)]',
          'transition-[transform,box-shadow] duration-300 ease-out',
          'group-hover/frame:-translate-y-1.5 group-hover/frame:rotate-0 group-hover/frame:shadow-[0_36px_58px_-34px_rgba(84,32,42,0.65)]',
          'motion-reduce:transform-none',
          tilt,
        )}
      >
        {/* Pita perekat */}
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute -top-3 left-1/2 z-20 h-5 w-14 -translate-x-1/2 -rotate-[5deg] rounded-[2px] border border-white/40 shadow-[0_2px_6px_-2px_rgba(84,32,42,0.4)]',
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
            <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-subtle via-bg to-sage-soft">
              <span
                aria-hidden
                className="absolute inset-2 rounded-[2px] border border-dashed border-line-strong/70"
              />
              <PhotoIcon className="h-7 w-7 text-sage/80" />
            </div>
          )}
          {/* Vignette halus agar terasa seperti cetakan analog */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 shadow-[inset_0_0_30px_rgba(84,32,42,0.18)]"
          />
        </div>

        {/* Margin bawah: nomor + keterangan tulisan tangan */}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 px-3 pb-3">
          <span className="font-mono text-[0.5625rem] tracking-[0.24em] text-maroon">{number}</span>
          <span aria-hidden className="h-px w-4 bg-line" />
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

/* ------------------------------ Panel video ----------------------------- */

/** Panel video persegi panjang (16:9) sebagai focal point section kenangan. */
function VideoPanel() {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      {/* Bingkai warna maroon & gold di belakang panel */}
      <span
        aria-hidden
        className="absolute -inset-3 -z-10 rounded-[18px] border border-maroon/30 bg-gradient-to-br from-maroon/15 via-transparent to-sage/20"
      />

      <div className="group/video relative aspect-video w-full overflow-hidden rounded-[12px] border border-maroon/40 bg-gradient-to-br from-forest via-forest to-forest-soft shadow-[0_50px_95px_-52px_rgba(24,61,50,0.9)]">
        {/* Inner border + highlight atas */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-3 rounded-[8px] border border-ivory/15"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/10 to-transparent"
        />

        {/* Tombol play + teks */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full border border-gold/70 bg-maroon/70 text-ivory shadow-[0_18px_40px_-16px_rgba(112,31,53,0.9)] backdrop-blur-sm transition duration-300 ease-out group-hover/video:scale-105 group-hover/video:bg-maroon motion-reduce:transform-none sm:h-20 sm:w-20">
            <PlayIcon />
          </span>
          <p className="font-display text-[0.6875rem] uppercase tracking-[0.34em] text-ivory/90 sm:text-sm">
            Video Kenangan · Segera Hadir
          </p>
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
      className="section-memories relative isolate overflow-hidden border-b border-line"
    >
      <div className="container-page relative z-10 pt-16 pb-4 lg:pt-20 lg:pb-6">
        <Reveal>
          <SectionHeader
            index="05"
            eyebrow="Memories"
            title="Kenangan kelas"
            description="Jejak momen dari seluruh anggota kelas. Galeri bergulir di bawah menampilkan kiriman secara acak — setiap kunjungan urutannya bisa berbeda."
          />
        </Reveal>

        {/* Pembatas tipis — garis bersih di tengah */}
        <Reveal delay={0.05}>
          <div className="mt-7 flex items-center justify-center gap-3 sm:gap-4">
            <span
              aria-hidden
              className="h-px w-16 bg-gradient-to-r from-transparent to-maroon/40 sm:w-28"
            />
            <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-maroon/50" />
            <span
              aria-hidden
              className="h-px w-16 bg-gradient-to-l from-transparent to-maroon/40 sm:w-28"
            />
          </div>
        </Reveal>

      </div>

      <div className="container-page relative z-10 mt-8 lg:mt-10">
        <Reveal>
          <VideoPanel />
        </Reveal>
      </div>

      <div className="relative z-10 mt-10 pb-16 lg:mt-12 lg:pb-20">
        <Reveal>
          <MarqueeRow items={bottomItems} direction="left" variant="bottom" />
        </Reveal>
      </div>
    </section>
  );
}

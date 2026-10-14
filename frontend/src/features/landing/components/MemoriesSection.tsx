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

/* ------------------------------ Ornamen --------------------------------- */

/** Ranting botanical line-art — ornamen scrapbook sudut section. */
function LeafSprig({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 106C46 92 76 66 104 30" strokeWidth="1.3" />
      <g strokeWidth="1">
        <g transform="translate(30 88) rotate(-40)">
          <path d="M0 0c-7 8-5 22 0 30 5-8 7-22 0-30Z" />
          <path d="M0 4v24" />
        </g>
        <g transform="translate(52 70) rotate(20)">
          <path d="M0 0c-6 7-4 19 0 26 4-7 6-19 0-26Z" />
          <path d="M0 3v21" />
        </g>
        <g transform="translate(72 50) rotate(-28)">
          <path d="M0 0c-6 7-4 19 0 26 4-7 6-19 0-26Z" />
          <path d="M0 3v21" />
        </g>
        <g transform="translate(90 32) rotate(16)">
          <path d="M0 0c-4 5-3 15 0 19 3-4 4-14 0-19Z" />
          <path d="M0 2v15" />
        </g>
      </g>
    </svg>
  );
}

/** Coretan tangan berbentuk hati — aksen maroon. */
function HeartDoodle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path
        d="M32 52C18 42 8 33 8 23.5 8 16 13.8 11 20.5 11c4.6 0 8.4 2.6 11.5 7 3.1-4.4 6.9-7 11.5-7C50.2 11 56 16 56 23.5 56 33 46 42 32 52Z"
        strokeWidth="1.6"
      />
    </svg>
  );
}

/** Goresan pena pendek — garis dekoratif di sisi panel video. */
function PenCurve({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 60"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      aria-hidden
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M4 46C22 44 40 34 58 22 74 11 92 6 116 8" strokeWidth="1.4" />
      <path d="M10 54C30 50 50 40 68 30" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

/** Ornamen latar section — bentuk organik, ranting, hati, dan garis lengkung. */
function MemoryOrnaments() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Bentuk organik sage kiri atas */}
      <span className="absolute -left-24 -top-24 h-72 w-72 rounded-[58%_42%_47%_53%/46%_56%_44%_54%] bg-sage-soft/60" />

      {/* Semburat blush kanan bawah */}
      <span className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-blush/55" />

      {/* Ranting botanical */}
      <LeafSprig className="absolute -left-4 top-8 hidden h-40 w-40 -rotate-6 text-sage opacity-50 sm:block" />
      <LeafSprig className="absolute -right-4 bottom-10 hidden h-36 w-36 rotate-180 text-forest opacity-20 sm:block" />

      {/* Coretan hati maroon kanan atas */}
      <HeartDoodle className="absolute right-[9%] top-16 hidden h-9 w-9 rotate-6 text-maroon/45 lg:block" />

      {/* Garis lengkung maroon tipis kiri bawah */}
      <svg
        viewBox="0 0 220 220"
        fill="none"
        className="absolute -bottom-8 -left-10 hidden h-48 w-48 text-maroon/35 lg:block"
      >
        <path
          d="M8 150C72 166 148 158 212 92"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M6 202C96 212 178 186 216 124"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>

      {/* Titik dekoratif */}
      <span className="absolute left-[6%] top-[44%] hidden h-1.5 w-1.5 rounded-full bg-maroon/40 lg:block" />
      <span className="absolute right-[8%] top-[60%] hidden h-1 w-1 rounded-full bg-sage lg:block" />
    </div>
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
      {/* Goresan pena dekoratif di sisi panel (hanya layar lebar) */}
      <PenCurve className="absolute -left-14 top-1/2 hidden h-14 w-12 -translate-y-1/2 text-maroon/45 lg:block" />
      <PenCurve
        flip
        className="absolute -right-14 top-1/2 hidden h-14 w-12 -translate-y-1/2 text-maroon/45 lg:block"
      />

      <div className="group/video relative aspect-video w-full overflow-hidden rounded-[12px] border border-line bg-gradient-to-br from-forest via-forest to-forest-soft shadow-[0_50px_95px_-52px_rgba(24,61,50,0.9)]">
        {/* Inner border + highlight atas */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-3 rounded-[8px] border border-ivory/15"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/10 to-transparent"
        />

        {/* Semburat lembut + ornamen daun tipis */}
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-sage/25 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-sage-soft/15 blur-3xl"
        />
        <LeafSprig className="pointer-events-none absolute -right-3 top-4 h-20 w-20 rotate-12 text-ivory/10" />

        {/* Tombol play + teks */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full border border-ivory/60 bg-ivory/10 text-ivory backdrop-blur-sm transition duration-300 ease-out group-hover/video:scale-105 group-hover/video:bg-ivory/20 motion-reduce:transform-none sm:h-20 sm:w-20">
            <PlayIcon />
          </span>
          <p className="font-display text-[0.6875rem] uppercase tracking-[0.34em] text-ivory/85 sm:text-sm">
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
      <MemoryOrnaments />

      <div className="container-page relative z-10 py-20 lg:py-28">
        <Reveal>
          <SectionHeader
            index="05"
            eyebrow="Memories"
            title="Kenangan kelas"
            description="Jejak momen dari seluruh anggota kelas. Galeri bergulir di bawah menampilkan kiriman secara acak — setiap kunjungan urutannya bisa berbeda."
          />
        </Reveal>
      </div>

      {/* Marquee atas dihapus sesuai permintaan */}

      <div className="container-page relative z-10 mt-12 lg:mt-16">
        <Reveal>
          <VideoPanel />
        </Reveal>
      </div>

      <div className="relative z-10 mt-12 pb-20 lg:mt-16 lg:pb-28">
        <Reveal>
          <MarqueeRow items={bottomItems} direction="left" variant="bottom" />
        </Reveal>
      </div>
    </section>
  );
}

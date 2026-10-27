import { useState, type ReactNode } from 'react';

import { Reveal } from '@/components/ui/Reveal';
import { useAbout, usePublicStats } from '@/hooks/usePublic';
import { assetUrl } from '@/lib/api';

import { PaperPlane, Sparkle } from './ornaments';

const FALLBACK_TITLE = 'Satu ruang, seribu karya.';
const FALLBACK_DESCRIPTION =
  'Craftly menghimpun karya para anggota dalam satu halaman publik: cerita singkat tentang komunitas, lalu portofolio tiap anggota yang bisa dibagikan ke siapa saja.';
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D';

/* -------------------------------- Ikon kecil ------------------------------- */

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}

/* ------------------------------- Placeholder ------------------------------- */

function ImagePlaceholder() {
  return (
    <div className="grid h-full w-full place-items-center bg-parchment-alt text-sage">
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <svg viewBox="0 0 48 48" width="32" height="32" fill="none" aria-hidden="true">
          <rect x="8" y="12" width="32" height="24" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 30l8-7 6 5 7-6 11 9" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="31" cy="19" r="3" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em]">
          Foto belum tersedia
        </span>
      </div>
    </div>
  );
}

/* -------------------------- Ornamen latar section -------------------------- */

function AboutOrnaments() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Hiasan sudut kiri bawah dihapus sesuai permintaan */}

      {/* Sambungan dari Hero di pojok kanan atas: separuh bawah lingkaran
          maroon + garis hijau. Geometri dikunci lewat kelas .seam-* agar
          kurva bertemu mulus di batas section. */}
      <span aria-hidden className="seam-circle seam-circle--maroon seam--about" />
      <span aria-hidden className="seam-circle seam-circle--ring seam--about" />
      <span aria-hidden className="seam-circle seam-circle--dash seam--about" />

      <Sparkle className="absolute bottom-[16%] right-[7%] hidden h-3 w-3 text-pine/50 sm:block" />
      <Sparkle className="absolute left-[12%] top-[14%] h-4 w-4 text-maroon/60" />
    </div>
  );
}

/* ---------------------- Kartu gambar dokumentasi kelas ---------------------- */

function ScrapbookImage({ image }: { image: string | null }) {
  const [ratio, setRatio] = useState(4 / 3);

  return (
    <div className="relative mx-auto w-full max-w-[34rem] px-2 pb-12 pt-4 sm:px-4 lg:max-w-none lg:pb-14">
      {/* Bentuk organik hijau pastel di belakang kartu */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-1 -top-4 h-[66%] w-[72%] rounded-[58%_42%_47%_53%/46%_56%_44%_54%] bg-sage-soft/70 sm:-left-6 sm:h-[70%] sm:w-[78%]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-2 right-0 h-[50%] w-[56%] rounded-[46%_54%_58%_42%/52%_44%_56%_48%] bg-sage-tint sm:right-2"
      />

      {/* Lapisan maroon bergeser + garis emas tipis */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-3 bottom-12 h-[78%] w-[90%] -rotate-3 rounded-[30px] bg-maroon/85 sm:-left-6"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-3 top-8 h-[74%] w-[88%] rotate-3 rounded-[30px] border border-gold/60 sm:-right-5"
      />

      <figure
        className="relative z-10 mx-auto overflow-hidden rounded-[30px] border-[10px] border-cream-card bg-cream-card shadow-[0_40px_80px_-40px_rgba(33,77,61,0.45)] [--frame-h:340px] sm:[--frame-h:440px] lg:[--frame-h:520px]"
        style={{
          aspectRatio: String(ratio),
          width: `min(100%, calc(var(--frame-h) * ${ratio}))`,
        }}
      >
        {image ? (
          <>
            <img
              src={image}
              alt="Dokumentasi suasana kelas"
              loading="lazy"
              onLoad={(event) => {
                const el = event.currentTarget;
                if (el.naturalWidth && el.naturalHeight) {
                  setRatio(el.naturalWidth / el.naturalHeight);
                }
              }}
              className="h-full w-full object-cover"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(22,59,48,0) 46%, rgba(22,59,48,0.3) 100%)',
              }}
            />
          </>
        ) : (
          <ImagePlaceholder />
        )}
      </figure>

      {/* Label kertas bertumpuk di sudut kiri bawah foto */}
      <div className="pointer-events-none absolute bottom-5 left-4 z-20 max-w-[calc(100%-2rem)] -rotate-3 sm:left-10">
        <span
          aria-hidden
          className="absolute -top-2 left-6 h-4 w-11 -rotate-6 rounded-[2px] bg-maroon/70"
        />
        <span className="relative block rounded-[14px] border border-blush-edge bg-parchment-alt px-3.5 py-2 shadow-[0_18px_32px_-20px_rgba(78,23,40,0.5)] sm:px-4">
          <span className="font-hand text-[1.05rem] leading-none text-pine sm:text-[1.25rem]">
            Kreativitas tumbuh bersama
          </span>
        </span>
      </div>

      {/* Pesawat kertas dengan lintasan putus-putus */}
      <PaperPlane className="absolute -right-2 -top-4 z-20 h-20 w-20 sm:-right-6 sm:h-24 sm:w-24" />

      <Sparkle className="absolute -left-1 top-[24%] h-4 w-4 text-maroon/60" />
      <Sparkle className="absolute -right-1 bottom-[16%] h-3.5 w-3.5 text-pine/50" />
    </div>
  );
}

/* ------------------------------ Label section ------------------------------ */

function SectionEyebrow() {
  return (
    <p className="flex items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.32em] text-pine sm:text-[0.8125rem]">
      <span className="font-mono text-maroon">01</span>
      <span aria-hidden className="h-px w-10 bg-maroon-soft/60 sm:w-14" />
      <span>Tentang Kelas</span>
    </p>
  );
}

/* --------------------------------- Judul ----------------------------------- */

function AboutTitle({ title }: { title: string }) {
  const showFallback = title === FALLBACK_TITLE;

  return (
    <div>
      <h2 className="mt-7 font-display text-[1.9rem] font-medium leading-[1.08] tracking-[-0.02em] text-pine sm:text-[2.1rem] lg:text-[2.4rem] xl:text-[2.6rem]">
        {showFallback ? (
          <>
            Satu ruang,
            <br />
            <span className="text-maroon">seribu karya.</span>
          </>
        ) : (
          title
        )}
      </h2>

      {/* Sapuan dekoratif hijau pastel di bawah judul */}
      <svg
        viewBox="0 0 200 16"
        fill="none"
        aria-hidden="true"
        className="mt-5 h-3.5 w-44 text-sage"
      >
        <path
          d="M3 10c26-6 52-6 78-2 26 4 58 3 98-5"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M10 12c24-4 48-4 72 0"
          stroke="var(--color-maroon)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}

/* ------------------------------ Kartu info --------------------------------- */

function InfoCard({
  icon,
  value,
  label,
  accent = false,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="flex h-full flex-row items-center gap-3 rounded-[22px] border border-blush-edge bg-blush/45 p-3.5 sm:flex-col sm:items-start sm:gap-3 sm:p-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-maroon text-ivory-warm sm:h-10 sm:w-10">
        {icon}
      </span>
      <div className="min-w-0">
        <p
          className={
            accent
              ? 'font-display text-[1.4rem] leading-none text-maroon sm:text-3xl'
              : 'font-display text-[1.05rem] leading-tight text-pine-deep sm:text-[1.2rem]'
          }
        >
          {value}
        </p>
        <p className="mt-1.5 text-[0.625rem] font-medium uppercase tracking-[0.16em] text-moss sm:text-[0.6875rem]">
          {label}
        </p>
      </div>
    </div>
  );
}

/* --------------------------------- Section --------------------------------- */

export function AboutSection() {
  const { data } = useAbout();
  const { data: stats } = usePublicStats();

  const about = data?.about ?? null;
  const title = about?.title?.trim() || FALLBACK_TITLE;
  const description = about?.description?.trim() || FALLBACK_DESCRIPTION;
  const image = about?.imageUrl ? assetUrl(about.imageUrl) : FALLBACK_IMAGE;
  const memberLabel = stats?.members != null ? stats.members.toLocaleString('id-ID') : '31';

  return (
    <section id="tentang" className="relative isolate overflow-hidden text-pine">
      <AboutOrnaments />

      <div className="container-page section-pad relative z-10">
        <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-[47fr_53fr] lg:items-start lg:gap-x-14 lg:gap-y-0 xl:gap-x-20">
          <Reveal className="order-1 lg:col-start-2 lg:row-start-1">
            <SectionEyebrow />
          </Reveal>

          <Reveal delay={0.08} className="order-2 lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <ScrapbookImage image={image} />
          </Reveal>

          <div className="order-3 lg:col-start-2 lg:row-start-2 lg:pt-8">
            <Reveal>
              <AboutTitle title={title} />
            </Reveal>

            <Reveal delay={0.06}>
              <p className="mb-3 mt-7 text-[0.75rem] font-bold uppercase tracking-[0.3em] text-maroon sm:text-[0.8125rem]">
                Kenali Kelas Kami
              </p>
              <p className="max-w-[650px] text-[1.0625rem] leading-[1.8] text-moss sm:text-[1.125rem]">
                {description}
              </p>
            </Reveal>

            <Reveal delay={0.12} className="mt-10">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-4">
                <InfoCard icon={<UsersIcon />} value={memberLabel} label="Anggota" accent />
                <InfoCard icon={<ImageIcon />} value="Portofolio" label="Personal" />
                <InfoCard icon={<FileTextIcon />} value="Karya &" label="Dokumentasi" />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

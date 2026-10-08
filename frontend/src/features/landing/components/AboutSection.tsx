import { Link } from 'react-router-dom';

import { Reveal } from '@/components/ui/Reveal';
import { buttonClasses } from '@/components/ui/Button';
import { useAbout } from '@/hooks/usePublic';
import { assetUrl } from '@/lib/api';

const FALLBACK_TITLE = 'Satu kelas, satu etalase karya.';
const FALLBACK_DESCRIPTION =
  'Satu Kelas mengumpulkan karya para anggota kelas dalam satu halaman publik: deskripsi singkat tentang kelas, lalu portofolio tiap anggota yang bisa dibagikan ke siapa saja.';

function ImagePlaceholder() {
  return (
    <div
      aria-hidden
      className="grid h-full w-full place-items-center bg-subtle text-muted"
    >
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <svg viewBox="0 0 48 48" width="32" height="32" fill="none">
          <rect x="8" y="12" width="32" height="24" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 30l8-7 6 5 7-6 11 9" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="31" cy="19" r="3" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em]">
          Foto kelas belum tersedia
        </span>
      </div>
    </div>
  );
}

export function AboutSection() {
  const { data } = useAbout();
  const about = data?.about ?? null;

  const title = about?.title?.trim() || FALLBACK_TITLE;
  const description = about?.description?.trim() || FALLBACK_DESCRIPTION;
  const image = assetUrl(about?.imageUrl);

  return (
    <section id="tentang" className="section-light border-b border-line">
      <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <Reveal className="order-2 lg:order-1">
          <div className="relative aspect-[4/3] overflow-hidden border border-line bg-subtle">
            {image ? (
              <img
                src={image}
                alt="Tentang Satu Kelas"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImagePlaceholder />
            )}
            <span className="absolute bottom-4 left-4 border border-line bg-bg/90 px-3 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted backdrop-blur">
              Satu Kelas
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="order-1 lg:order-2">
          <p className="eyebrow">Tentang</p>
          <h2 className="mt-6 font-display text-3xl leading-[1.06] tracking-[-0.02em] sm:text-4xl lg:text-[2.75rem]">
            {title}
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">{description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/members" className={buttonClasses('outline', 'sm')}>
              Lihat anggota
            </Link>
            <Link to="/register" className={buttonClasses('ghost', 'sm')}>
              Gabung kelas
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

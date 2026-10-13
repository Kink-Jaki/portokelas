import { Link } from 'react-router-dom';

import { Reveal, AnimatedRule } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { buttonClasses } from '@/components/ui/Button';
import { useAbout } from '@/hooks/usePublic';
import { assetUrl } from '@/lib/api';

const FALLBACK_TITLE = 'Satu kelas, satu etalase karya.';
const FALLBACK_DESCRIPTION =
  'Satu Kelas mengumpulkan karya para anggota kelas dalam satu halaman publik: deskripsi singkat tentang kelas, lalu portofolio tiap anggota yang bisa dibagikan ke siapa saja.';
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D';

function ImagePlaceholder() {
  return (
    <div aria-hidden className="grid h-full w-full place-items-center bg-subtle text-muted">
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
  const image = about?.imageUrl ? assetUrl(about.imageUrl) : FALLBACK_IMAGE;

  return (
    <section id="tentang" className="section-light paper border-b border-line">
      <div className="container-page py-20 lg:py-28">
        <Reveal>
          <SectionHeader index="01" eyebrow="Tentang" title={title} />
        </Reveal>

        <AnimatedRule className="mt-10" />

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <p className="max-w-2xl text-lg leading-relaxed text-fg sm:text-xl sm:leading-[1.7]">
              {description}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/members" className={buttonClasses('primary')}>
                Lihat anggota
              </Link>
              <Link to="/login" className={buttonClasses('outline')}>
                Masuk
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-5">
            <figure className="relative aspect-[4/3] overflow-hidden border border-line bg-subtle lg:aspect-[4/5]">
              {image ? (
                <>
                  <img
                    src={image}
                    alt="Tentang Satu Kelas"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(23, 20, 15, 0.52) 0%, rgba(23, 20, 15, 0.22) 45%, rgba(23, 20, 15, 0) 100%), linear-gradient(0deg, rgba(15, 13, 12, 0.46) 0%, rgba(15, 13, 12, 0) 55%)',
                    }}
                  />
                </>
              ) : (
                <ImagePlaceholder />
              )}
            </figure>
            <figcaption className="mt-3 flex items-center justify-between font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted">
              <span>Gambar / Kelas</span>
              <span className="index-num">01</span>
            </figcaption>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

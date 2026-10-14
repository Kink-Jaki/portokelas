import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { buttonClasses } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import { useHero } from '@/hooks/usePublic';
import { assetUrl } from '@/lib/api';
import { fadeUp, stagger, staggerItem } from '@/lib/motion';

const headlineLines = ['Karya yang', 'dibangun', 'bersama'];

type CollageImage = { src: string; alt: string };
type Collage = [CollageImage, CollageImage, CollageImage];

/** Gambar bawaan bila admin belum menyetel kolase hero. */
const DEFAULT_COLLAGE: Collage = [
  {
    src: 'https://plus.unsplash.com/premium_photo-1682284353484-4e16001c58eb?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
    alt: 'Anggota kelas sedang menulis dan mengerjakan proyek di meja belajar',
  },
  {
    src: 'https://images.unsplash.com/photo-1581726707445-75cbe4efc586?q=80&w=1476&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
    alt: 'Suasana lingkungan sekolah bersama beberapa siswa dari belakang',
  },
  {
    src: 'https://plus.unsplash.com/premium_photo-1713296255442-e9338f42aad8?q=80&w=722&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
    alt: 'Buku dan laptop di atas meja belajar',
  },
];

/** Ornamen tepi halaman — aksen dekoratif ringan di belakang konten. */
function EdgeOrnaments() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Kiri atas: potongan lingkaran maroon + outline hijau.
          Di layar kecil ornamen digeser lebih jauh ke pojok agar tidak
          menabrak judul/eyebrow yang kini lebih rapat ke tepi. */}
      <span className="absolute -left-[13rem] -top-[11rem] h-56 w-56 rounded-full bg-burgundy sm:-left-24 sm:-top-28 sm:h-60 sm:w-60" />
      <span className="absolute -left-[13rem] -top-[11.5rem] h-56 w-56 rounded-full border border-forest/40 sm:-left-[7.5rem] sm:-top-[8.5rem] sm:h-72 sm:w-72" />

      {/* Kiri bawah: daun hijau sederhana */}
      <svg
        viewBox="0 0 64 64"
        className="absolute -bottom-4 left-4 h-20 w-20 text-forest sm:left-10 sm:h-24 sm:w-24"
      >
        <path
          d="M32 4C18 16 12 30 14 46c2 8 8 14 18 14 6 0 14-4 18-16 4-14-4-30-18-40Z"
          fill="currentColor"
        />
        <path d="M32 8v48" stroke="#f7f3e8" strokeWidth="1.4" />
      </svg>

      {/* Kanan atas: susunan titik maroon */}
      <div className="absolute right-8 top-10 hidden grid-cols-4 gap-3 text-burgundy/45 sm:grid">
        {Array.from({ length: 16 }).map((_, index) => (
          <span key={index} className="h-1 w-1 rounded-full bg-current" />
        ))}
      </div>

      {/* Sambungan ke section Tentang di pojok kanan bawah: separuh atas
          lingkaran maroon + garis hijau. Separuh bawah digambar oleh
          AboutSection dengan geometri yang sama. */}
      <span aria-hidden className="seam-circle seam-circle--maroon seam--hero" />
      <span aria-hidden className="seam-circle seam-circle--ring seam--hero" />
      <span aria-hidden className="seam-circle seam-circle--dash seam--hero" />
    </div>
  );
}

/** Kolase editorial tiga gambar yang saling bertumpuk secara terkontrol. */
function ImageCollage({ images }: { images: Collage }) {
  const [studyImage, schoolImage, deskImage] = images;

  return (
    <div className="relative mx-auto aspect-[5/6] w-full max-w-[24rem] sm:max-w-[26rem] lg:max-w-none">
      {/* Ornamen di belakang gambar */}
      <span className="absolute -left-8 -top-10 h-32 w-32 rounded-full border border-forest/40" />
      <span className="absolute -left-[14%] bottom-[16%] h-24 w-24 rounded-full bg-burgundy" />
      <span className="absolute right-[8%] bottom-[6%] h-44 w-28 bg-forest/[0.06]" />

      <figure className="absolute left-[9%] top-0 z-20 w-[74%] -rotate-2 rounded-md bg-ivory-warm p-1.5 shadow-[0_28px_50px_-30px_rgba(25,61,50,0.5)]">
        <img
          src={studyImage.src}
          alt={studyImage.alt}
          loading="lazy"
          className="aspect-[4/3] w-full rounded-[4px] object-cover"
        />
      </figure>

      <figure className="absolute left-0 top-[34%] z-10 w-[84%] -rotate-1 rounded-md bg-ivory-warm p-1.5 shadow-[0_28px_50px_-32px_rgba(25,61,50,0.45)]">
        <img
          src={schoolImage.src}
          alt={schoolImage.alt}
          loading="lazy"
          className="aspect-[4/3] w-full rounded-[4px] object-cover"
        />
      </figure>

      <figure className="absolute bottom-0 right-0 z-30 w-[52%] rotate-2 rounded-md bg-ivory-warm p-1.5 shadow-[0_28px_50px_-28px_rgba(122,36,53,0.4)]">
        <img
          src={deskImage.src}
          alt={deskImage.alt}
          loading="lazy"
          className="aspect-[4/5] w-full rounded-[4px] object-cover"
        />
      </figure>

      {/* Aksen bintang kecil */}
      <svg
        viewBox="0 0 24 24"
        className="absolute -left-2 top-[46%] h-4 w-4 text-forest/40"
      >
        <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" fill="currentColor" />
      </svg>
      <span className="absolute right-[4%] top-[18%] h-2 w-2 rounded-full bg-burgundy" />
    </div>
  );
}

export function Hero() {
  const { data } = useHero();
  const hero = data?.hero ?? null;

  const images: Collage = [
    {
      src: assetUrl(hero?.image1Url) ?? DEFAULT_COLLAGE[0].src,
      alt: DEFAULT_COLLAGE[0].alt,
    },
    {
      src: assetUrl(hero?.image2Url) ?? DEFAULT_COLLAGE[1].src,
      alt: DEFAULT_COLLAGE[1].alt,
    },
    {
      src: assetUrl(hero?.image3Url) ?? DEFAULT_COLLAGE[2].src,
      alt: DEFAULT_COLLAGE[2].alt,
    },
  ];

  return (
    <section className="paper relative isolate overflow-hidden bg-ivory text-forest">
      <EdgeOrnaments />

      <div className="container-wide relative z-10 py-20 lg:py-24">
        <motion.div
          variants={stagger(0.12, 0.1)}
          initial="hidden"
          animate="show"
          className="grid items-center gap-14 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16"
        >
          {/* Area teks utama */}
          <div>
            <motion.p
              variants={staggerItem}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-4"
            >
              <span aria-hidden className="h-px w-8 shrink-0 bg-burgundy sm:w-10" />
              <span className="text-[0.625rem] font-medium uppercase tracking-[0.2em] text-forest-soft sm:text-xs sm:tracking-[0.3em]">
                Satu Kelas · Portofolio Anggota
              </span>
            </motion.p>

            <h1 className="mt-6 max-w-[37rem] font-display text-[clamp(2.35rem,7.5vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-forest sm:mt-7 sm:leading-[0.92]">
              {headlineLines.map((line, index) => (
                <span key={line} className="block overflow-clip [overflow-clip-margin:0.22em]">
                  <motion.span variants={fadeUp} className="block">
                    {line}
                    {index === headlineLines.length - 1 ? (
                      <span className="text-burgundy">.</span>
                    ) : null}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              variants={staggerItem}
              className="mt-7 max-w-[34rem] text-[1.0625rem] leading-[1.65] text-forest-soft sm:text-[1.125rem]"
            >
              Setiap anggota kelas punya satu halaman portofolio pribadi. Daftar sekali, unggah
              project, lalu karya kamu tampil di halaman publik yang bisa dibagikan ke siapa saja.
            </motion.p>

            <motion.div variants={staggerItem} className="mt-9 flex flex-wrap items-center gap-4">
              <Magnetic>
                <Link to="/members" className={buttonClasses('burgundy', 'lg')}>
                  Lihat anggota
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    aria-hidden
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </Link>
              </Magnetic>
              <a href="#tentang" className={buttonClasses('forest', 'lg')}>
                Tentang kelas
              </a>
            </motion.div>
          </div>

          {/* Kolase gambar */}
          <motion.div variants={staggerItem}>
            <ImageCollage images={images} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

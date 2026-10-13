import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { buttonClasses } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import { fadeUp, stagger, staggerItem } from '@/lib/motion';

const headlineLines = ['Karya yang', 'dibangun', 'bersama'];

const collageImages = [
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
] as const;

const [studyImage, schoolImage, deskImage] = collageImages;

/** Ornamen tepi halaman — aksen dekoratif ringan di belakang konten. */
function EdgeOrnaments() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Kiri atas: potongan lingkaran maroon + outline hijau */}
      <span className="absolute -left-24 -top-28 h-60 w-60 rounded-full bg-burgundy" />
      <span className="absolute -left-[7.5rem] -top-[8.5rem] h-72 w-72 rounded-full border border-forest/40" />

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

      {/* Kanan atas: susunan titik terracotta */}
      <div className="absolute right-8 top-10 hidden grid-cols-4 gap-3 text-terracotta/50 sm:grid">
        {Array.from({ length: 16 }).map((_, index) => (
          <span key={index} className="h-1 w-1 rounded-full bg-current" />
        ))}
      </div>

      {/* Kanan bawah: lingkaran maroon + outline hijau (mirror kiri atas) */}
      <span className="absolute -bottom-28 -right-24 h-60 w-60 rounded-full bg-burgundy" />
      <span className="absolute -bottom-[8.5rem] -right-[7.5rem] h-72 w-72 rounded-full border border-forest/40" />
    </div>
  );
}

/** Kolase editorial tiga gambar yang saling bertumpuk secara terkontrol. */
function ImageCollage() {
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
      <span className="absolute right-[4%] top-[18%] h-2 w-2 rounded-full bg-terracotta" />
    </div>
  );
}

export function Hero() {
  return (
    <section className="paper relative isolate overflow-hidden border-b border-line-warm bg-ivory text-forest">
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
            <motion.p variants={staggerItem} className="flex items-center gap-4">
              <span aria-hidden className="h-px w-10 bg-burgundy" />
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.3em] text-forest-soft sm:text-xs">
                Satu Kelas · Portofolio Anggota
              </span>
            </motion.p>

            <h1 className="mt-7 max-w-[37rem] font-display text-[clamp(2.75rem,6.5vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.03em] text-forest">
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
            <ImageCollage />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

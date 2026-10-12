import { Link } from 'react-router-dom';

import { buttonClasses } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import { fadeUp, stagger, staggerItem } from '@/lib/motion';
import { motion } from 'framer-motion';

const headlineLines = ['Karya yang', 'dibangun', 'bersama.'];

const sectionIndex = [
  { num: '01', label: 'Tentang', href: '#tentang' },
  { num: '02', label: 'Wali Kelas', href: '#wali-kelas' },
  { num: '03', label: 'Anggota', href: '#anggota' },
  { num: '04', label: 'Statistik', href: '#statistik' },
  { num: '05', label: 'Memories', href: '#memories' },
];

export function Hero() {
  return (
    <section className="section-dark relative overflow-hidden border-b border-line">
      <div className="container-page py-20 lg:py-28">
        <motion.div
          variants={stagger(0.12, 0.1)}
          initial="hidden"
          animate="show"
          className="grid gap-14 lg:grid-cols-12 lg:gap-10"
        >
          <div className="lg:col-span-8">
            <motion.p variants={staggerItem} className="eyebrow">
              Satu Kelas · Portofolio Anggota
            </motion.p>

            <h1 className="mt-8 font-display text-[clamp(2.75rem,8.5vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.035em]">
              {headlineLines.map((line) => (
                <span key={line} className="block overflow-clip [overflow-clip-margin:0.22em]">
                  <motion.span variants={fadeUp} className="block">
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              variants={staggerItem}
              className="mt-8 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
            >
              Setiap anggota kelas punya satu halaman portofolio pribadi. Daftar sekali, unggah
              project, lalu karya kamu tampil di halaman publik yang bisa dibagikan ke siapa saja.
            </motion.p>

            <motion.div variants={staggerItem} className="mt-10 flex flex-wrap items-center gap-3">
              <Magnetic>
                <Link to="/members" className={buttonClasses('primary', 'lg')}>
                  Lihat anggota
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </Link>
              </Magnetic>
              <a href="#tentang" className={buttonClasses('outline', 'lg')}>
                Tentang kelas
              </a>
            </motion.div>
          </div>

          <motion.aside
            variants={staggerItem}
            className="lg:col-span-4 lg:border-l lg:border-line lg:pl-10"
          >
            <p className="eyebrow">Indeks halaman</p>
            <ol className="mt-6 border-t border-line">
              {sectionIndex.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="group flex items-center justify-between gap-4 border-b border-line py-3.5"
                  >
                    <span className="flex items-center gap-4">
                      <span className="index-num">{item.num}</span>
                      <span className="text-sm text-muted transition-colors duration-200 group-hover:text-fg">
                        {item.label}
                      </span>
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="none"
                      aria-hidden
                      className="-translate-x-1 text-muted opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </a>
                </li>
              ))}
            </ol>

            <p className="mt-8 flex items-center gap-2.5 text-xs text-muted">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Direktori terbuka untuk publik
            </p>
          </motion.aside>
        </motion.div>
      </div>
    </section>
  );
}

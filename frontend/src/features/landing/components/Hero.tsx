import { Link } from 'react-router-dom';

import { buttonClasses } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import { fadeUp, stagger, staggerItem } from '@/lib/motion';
import { motion } from 'framer-motion';

const headlineLines = ['Karya yang', 'dibangun', 'bersama.'];

export function Hero() {
  return (
    <section className="section-dark border-b border-line">
      <div className="container-page py-20 lg:py-28">
        <motion.div variants={stagger(0.12, 0.1)} initial="hidden" animate="show">
          <motion.p variants={staggerItem} className="eyebrow">
            Satu Kelas · Portofolio Anggota
          </motion.p>

          <h1 className="mt-8 font-display text-[clamp(2.75rem,9vw,6rem)] font-medium leading-[0.94] tracking-[-0.03em]">
            {headlineLines.map((line) => (
              <span key={line} className="block overflow-clip [overflow-clip-margin:0.2em]">
                <motion.span variants={fadeUp} className="block">
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            variants={staggerItem}
            className="mt-8 max-w-xl text-base leading-relaxed text-muted"
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
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

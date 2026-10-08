import { Link } from 'react-router-dom';

import { buttonClasses } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import { fadeUp, stagger, staggerItem } from '@/lib/motion';
import { motion } from 'framer-motion';

const headlineLines = ['Karya yang', 'dibangun', 'bersama.'];

export function Hero() {
  return (
    <section className="section-dark border-b border-line">
      <div className="container-page grid gap-12 py-20 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16 lg:py-28">
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
              <Link to="/register" className={buttonClasses('primary', 'lg')}>
                Daftar sebagai anggota
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </Link>
            </Magnetic>
            <Link to="/members" className={buttonClasses('outline', 'lg')}>
              Lihat anggota
            </Link>
          </motion.div>
        </motion.div>

        <motion.aside
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.35, duration: 0.7 }}
          className="flex flex-col justify-end"
          id="langkah"
        >
          <div className="border border-line p-6">
            <p className="eyebrow">Tiga langkah</p>
            <ol className="mt-6 space-y-6">
              {[
                { step: '01', title: 'Daftar', body: 'Isi nama, NIM, email, dan password.' },
                {
                  step: '02',
                  title: 'Disetujui admin',
                  body: 'Admin memverifikasi anggota kelas.',
                },
                { step: '03', title: 'Unggah project', body: 'Portofolio kamu tayang publik.' },
              ].map((item) => (
                <li
                  key={item.step}
                  className="flex gap-5 border-t border-line pt-5 first:border-t-0 first:pt-0"
                >
                  <span className="font-mono text-xs text-muted">{item.step}</span>
                  <div>
                    <p className="font-display text-lg">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

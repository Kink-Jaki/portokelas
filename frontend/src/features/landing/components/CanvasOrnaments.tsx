import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

import { Flower, LeafSprig, PenCurve, Sparkle } from './ornaments';

/**
 * Lapisan ornamen global untuk seluruh kanvas landing. Ditempatkan sekali di
 * wrapper utama (position: absolute, inset: 0) di belakang konten sehingga
 * ornamen tidak lagi terikat pada batas section dan bisa mengalir melewati
 * sambungan antar section. Posisi memakai persen terhadap tinggi seluruh
 * halaman; semua elemen murni dekoratif (aria-hidden, pointer-events: none).
 *
 * Diberi parallax scroll super halus: awan warna menjauh ke bawah (latar),
 * ornamen melayang sedikit ke atas (depan) agar scroll tidak terasa kaku.
 */
export function CanvasOrnaments() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const cloudsY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 96]);
  const decorY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -64]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      {/* will-change-transform: kedua layer ini `absolute inset-0` sehingga setinggi
          seluruh kanvas landing, dan lapisan clouds membawa gradien radial besar.
          Tanpa promosi ke composited layer, tiap update `y` saat scroll memaksa
          main-thread me-repaint layer utuh → frame drop → animasi terasa patah.
          Dengan promosi, gerakan ditangani kompositor (translate murni), tampilan
          dan parallax tetap identik. */}
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: cloudsY }}>
        {/* "Awan warna" lembut — blur radial tanpa tepi tajam, mengisi ruang kosong. */}
        <span className="absolute -left-[14%] top-[5%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(141,165,139,0.2),transparent_68%)]" />
        <span className="absolute -right-[16%] top-[26%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(201,165,106,0.14),transparent_68%)]" />
        <span className="absolute -left-[18%] top-[46%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(141,165,139,0.22),transparent_70%)]" />
        <span className="absolute -right-[14%] top-[64%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(112,31,53,0.08),transparent_70%)]" />
        <span className="absolute left-[28%] top-[86%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(215,173,93,0.14),transparent_70%)]" />
      </motion.div>

      <motion.div className="absolute inset-0 will-change-transform" style={{ y: decorY }}>
        {/* Ornamen tersebar merata dengan variasi ukuran, rotasi, dan opacity. */}
        <LeafSprig className="absolute left-[5%] top-[17%] h-24 w-24 -rotate-12 text-sage opacity-25" />
        <LeafSprig className="absolute right-[7%] top-[42%] h-20 w-20 rotate-[18deg] text-sage opacity-20" />
        <LeafSprig className="absolute left-[8%] top-[70%] h-28 w-28 rotate-[8deg] text-pine opacity-15" />
        <Flower className="absolute right-[12%] top-[30%] hidden h-8 w-8 text-maroon opacity-30 md:block" />
        <Flower className="absolute left-[14%] top-[58%] hidden h-7 w-7 text-pine opacity-25 lg:block" />
        <PenCurve className="absolute right-[6%] top-[76%] hidden h-10 w-28 text-sage opacity-30 md:block" />
        <Sparkle className="absolute left-[46%] top-[11%] h-4 w-4 text-maroon opacity-40" />
        <Sparkle className="absolute right-[24%] top-[56%] h-3.5 w-3.5 text-[#d7ad5d] opacity-50" />
        <Sparkle className="absolute left-[20%] top-[88%] h-4 w-4 text-maroon opacity-35" />
      </motion.div>
    </div>
  );
}

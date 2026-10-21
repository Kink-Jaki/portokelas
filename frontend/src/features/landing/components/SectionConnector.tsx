import { motion, useReducedMotion } from 'framer-motion';

import { ease } from '@/lib/motion';

import { Flower, LeafSprig, PaperPlane, Sparkle } from './ornaments';

/**
 * Palet dekorasi penghubung — cream, dark green, maroon, sage, beige.
 * Dipakai langsung sebagai nilai SVG agar komponen tetap mandiri.
 */
const palette = {
  cream: '#F5F0E5',
  forest: '#214F40',
  maroon: '#76263D',
  sage: '#8FA68F',
  beige: '#D8C6A2',
} as const;

/** Garis pita yang menggambar dirinya sendiri (pathLength) saat masuk viewport. */
function RibbonPath({
  d,
  stroke,
  strokeWidth,
  opacity,
  delay,
  animated,
  scaled = false,
}: {
  d: string;
  stroke: string;
  strokeWidth: number;
  opacity?: number;
  delay: number;
  animated: boolean;
  /** true = tanpa non-scaling-stroke (untuk salinan di dalam mask, sesuai desain asli). */
  scaled?: boolean;
}) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin={scaled ? undefined : 'round'}
      opacity={opacity}
      vectorEffect={scaled ? undefined : 'non-scaling-stroke'}
      initial={animated ? { pathLength: 0 } : undefined}
      whileInView={animated ? { pathLength: 1 } : undefined}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={animated ? { duration: 1.6, ease, delay } : undefined}
    />
  );
}

const RIBBONS = [
  {
    d: 'M -40 200 C 80 140 160 100 320 120 C 560 150 760 60 1000 80 C 1240 100 1400 40 1480 30',
    stroke: palette.sage,
    strokeWidth: 2.0,
  },
  {
    d: 'M -30 180 C 90 120 170 80 330 100 C 570 130 770 40 1010 60 C 1250 80 1410 20 1490 10',
    stroke: palette.maroon,
    strokeWidth: 1.6,
    opacity: 0.9,
  },
  {
    d: 'M -50 220 C 70 160 150 120 310 140 C 550 170 750 80 990 100 C 1230 120 1390 60 1470 50',
    stroke: palette.beige,
    strokeWidth: 1.8,
    opacity: 0.95,
  },
] as const;

/**
 * Dekorasi penghubung organic flowing ribbon — mengalir diagonal dan bergelombang
 * dari bagian bawah About menuju sekitar area foto Teacher. Tidak membentuk
 * divider horizontal penuh, biarkan ruang kosong dominan.
 */
export function SectionConnector() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative isolate h-24 w-full overflow-hidden sm:h-32 lg:h-40"
    >
      {/* Organic flowing ribbon — tiga garis tipis dengan arah diagonal+bergelombang.
          Setiap garis menggambar dirinya sendiri (pathLength) sekali saat masuk viewport. */}
      <svg
        viewBox="0 0 1440 280"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {/* Sage green — jalur utama: dari samping kiri foto About menuju pojok kanan Teacher */}
        <RibbonPath {...RIBBONS[0]} delay={0} animated={!reduceMotion} />
        {/* Maroon — aksen lengkung mengikuti jalur */}
        <RibbonPath {...RIBBONS[1]} delay={0.12} animated={!reduceMotion} />
        {/* Beige — garis pendamping */}
        <RibbonPath {...RIBBONS[2]} delay={0.24} animated={!reduceMotion} />
        {/* Fade out pada ujung kanan */}
        <defs>
          <linearGradient id="connectorFade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="70%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="connectorMask">
            <rect x="0" y="0" width="1440" height="280" fill="url(#connectorFade)" />
          </mask>
        </defs>
        <g mask="url(#connectorMask)">
          <RibbonPath {...RIBBONS[0]} delay={0} animated={!reduceMotion} />
          <RibbonPath {...RIBBONS[1]} delay={0.12} animated={!reduceMotion} />
          <RibbonPath {...RIBBONS[2]} delay={0.24} animated={!reduceMotion} />
        </g>
      </svg>

      {/* Botanical — kiri (dekat awal garis di bawah About) */}
      <LeafSprig className="absolute bottom-[2%] left-[4%] h-16 w-16 -rotate-12 text-[#8FA68F] opacity-90 sm:left-[6%] sm:h-20 sm:w-20 lg:h-24 lg:w-24" />
      {/* Tengah */}
      <LeafSprig className="absolute left-[42%] top-[4%] hidden h-14 w-14 rotate-[8deg] text-[#8FA68F] opacity-75 md:block lg:h-18 lg:w-18" />
      {/* Kanan — dekat ujung menuju Teacher (pojok kanan) */}
      <LeafSprig className="absolute -right-4 top-[2%] h-16 w-16 rotate-180 text-[#8FA68F] opacity-85 sm:right-[2%] sm:h-20 sm:w-20 lg:h-24 lg:w-24" />

      {/* Bunga menyebar di alur */}
      <Flower className="absolute left-[26%] bottom-[16%] hidden h-7 w-7 text-[#76263D] opacity-80 lg:block" />
      <Flower className="absolute right-[30%] top-[16%] hidden h-6 w-6 text-[#214F40] opacity-70 lg:block" />

      {/* Ornamen kecil */}
      <Sparkle className="absolute left-[16%] top-[18%] h-3.5 w-3.5 text-[#76263D] opacity-90 sm:h-4 sm:w-4" />
      <Sparkle className="absolute left-[54%] bottom-[16%] hidden h-3 w-3 text-[#76263D] opacity-85 md:block" />
      <span className="absolute left-[10%] top-[40%] h-2 w-2 rounded-full bg-[#8FA68F] opacity-90" />
      <span className="absolute left-[36%] top-[24%] h-1.5 w-1.5 rounded-full bg-[#214F40] opacity-80" />
      <span className="absolute right-[42%] bottom-[14%] h-1.5 w-1.5 rounded-full bg-[#8FA68F] opacity-80" />

      {/* Pesawat kertas — mengarah ke pojok kanan (area Teacher) */}
      <motion.div
        className="absolute right-[8%] top-[2%] h-14 w-14 sm:right-[10%] sm:top-[0%] sm:h-20 sm:w-20 lg:h-24 lg:w-24"
        animate={reduceMotion ? undefined : { y: [0, -6, 0], x: [0, 5, 0] }}
        transition={
          reduceMotion ? undefined : { duration: 6.5, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <PaperPlane className="h-full w-full" />
      </motion.div>
    </div>
  );
}

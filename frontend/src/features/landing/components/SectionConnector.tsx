import { motion, useReducedMotion } from 'framer-motion';

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

/** Ranting botanical line-art minimalis — menyatu dengan alur garis. */
function LeafSprig({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 104C46 92 76 66 104 30" strokeWidth="1.1" />
      <g strokeWidth="0.9">
        <g transform="translate(30 88) rotate(-42)">
          <path d="M0 0c-7 8-5 21 0 29 5-8 7-21 0-29Z" />
          <path d="M0 4v23" />
        </g>
        <g transform="translate(52 72) rotate(18)">
          <path d="M0 0c-6 7-4 18 0 25 4-7 6-18 0-25Z" />
          <path d="M0 3v20" />
        </g>
        <g transform="translate(74 50) rotate(-26)">
          <path d="M0 0c-6 7-4 18 0 25 4-7 6-18 0-25Z" />
          <path d="M0 3v20" />
        </g>
        <g transform="translate(92 32) rotate(14)">
          <path d="M0 0c-4 5-3 14 0 18 3-4 4-13 0-18Z" />
          <path d="M0 2v14" />
        </g>
      </g>
    </svg>
  );
}

/** Bintang empat sudut. */
function FourPointStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 1.6c.72 4.9 4.3 8.06 10.4 10.4-6.1 2.34-9.68 5.5-10.4 10.4-.72-4.9-4.3-8.06-10.4-10.4C7.7 9.66 11.28 6.5 12 1.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Pesawat kertas kecil. */
function PaperPlane({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 110" className={className} fill="none" aria-hidden="true">
      <path
        d="M8 96C30 84 44 62 52 34"
        stroke={palette.sage}
        strokeWidth="1.6"
        strokeDasharray="4 7"
        strokeLinecap="round"
      />
      <path d="M52 30 96 10 80 56 66 44 52 30Z" fill={palette.forest} />
      <path d="M52 30 66 44 60 60 52 30Z" fill={palette.maroon} />
    </svg>
  );
}

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
      style={{ backgroundColor: palette.cream }}
    >
      {/* Organic flowing ribbon — tiga garis tipis dengan arah diagonal+bergelombang. */}
      <svg
        viewBox="0 0 1440 280"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {/* Sage green — jalur utama */}
        {/* Sage green — jalur utama: dari samping kiri foto About menuju pojok kanan Teacher */}
        <path
          d="M -40 200 C 80 140 160 100 320 120 C 560 150 760 60 1000 80 C 1240 100 1400 40 1480 30"
          fill="none"
          stroke={palette.sage}
          strokeWidth="2.0"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
        {/* Maroon — aksen lengkung mengikuti jalur */}
        <path
          d="M -30 180 C 90 120 170 80 330 100 C 570 130 770 40 1010 60 C 1250 80 1410 20 1490 10"
          fill="none"
          stroke={palette.maroon}
          strokeWidth="1.6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          opacity="0.9"
        />
        {/* Beige — garis pendamping */}
        <path
          d="M -50 220 C 70 160 150 120 310 140 C 550 170 750 80 990 100 C 1230 120 1390 60 1470 50"
          fill="none"
          stroke={palette.beige}
          strokeWidth="1.8"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          opacity="0.95"
        />
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
          <path
            d="M -40 200 C 80 140 160 100 320 120 C 560 150 760 60 1000 80 C 1240 100 1400 40 1480 30"
            fill="none"
            stroke={palette.sage}
            strokeWidth="2.0"
            strokeLinecap="round"
          />
          <path
            d="M -30 180 C 90 120 170 80 330 100 C 570 130 770 40 1010 60 C 1250 80 1410 20 1490 10"
            fill="none"
            stroke={palette.maroon}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M -50 220 C 70 160 150 120 310 140 C 550 170 750 80 990 100 C 1230 120 1390 60 1470 50"
            fill="none"
            stroke={palette.beige}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.95"
          />
        </g>
      </svg>

      {/* Botanical — kiri (dekat awal garis di bawah About) */}
      <LeafSprig className="absolute bottom-[2%] left-[4%] h-16 w-16 -rotate-12 text-[#8FA68F] opacity-80 sm:left-[6%] sm:h-20 sm:w-20 lg:h-24 lg:w-24" />
      {/* Tengah */}
      <LeafSprig className="absolute left-[40%] top-[6%] hidden h-14 w-14 rotate-[10deg] text-[#8FA68F] opacity-70 md:block lg:h-18 lg:w-18" />
      {/* Kanan — dekat ujung menuju Teacher (pojok kanan) */}
      <LeafSprig className="absolute -right-4 top-[4%] h-16 w-16 rotate-180 text-[#8FA68F] opacity-75 sm:right-[2%] sm:h-20 sm:w-20 lg:h-24 lg:w-24" />

      {/* Ornamen kecil */}
      <FourPointStar className="absolute left-[16%] top-[18%] h-3.5 w-3.5 text-[#76263D] opacity-90 sm:h-4 sm:w-4" />
      <FourPointStar className="absolute right-[28%] top-[10%] hidden h-3 w-3 text-[#76263D] opacity-80 md:block" />
      <span className="absolute left-[10%] top-[40%] h-1.5 w-1.5 rounded-full bg-[#8FA68F] opacity-80" />
      <span className="absolute right-[36%] top-[16%] h-1 w-1 rounded-full bg-[#8FA68F] opacity-70" />

      {/* Pesawat kertas — lebih besar, mengarah ke pojok kanan (area Teacher) */}
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

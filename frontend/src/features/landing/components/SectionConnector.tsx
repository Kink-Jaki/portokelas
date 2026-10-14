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
        <path
          d="M -80 240 C 140 160 320 220 520 140 C 720 60 900 140 1120 80 C 1300 36 1480 80 1520 60"
          fill="none"
          stroke={palette.sage}
          strokeWidth="2.0"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
        {/* Maroon — aksen lengkung, lebih terlihat */}
        <path
          d="M -60 220 C 160 140 340 200 540 120 C 740 40 920 120 1140 60 C 1320 16 1500 60 1540 40"
          fill="none"
          stroke={palette.maroon}
          strokeWidth="1.6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          opacity="0.85"
        />
        {/* Beige — garis pendamping lebih tegas */}
        <path
          d="M -40 260 C 180 180 360 240 560 160 C 760 80 940 160 1160 100 C 1340 56 1520 100 1560 80"
          fill="none"
          stroke={palette.beige}
          strokeWidth="1.8"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          opacity="0.9"
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
            d="M -80 240 C 140 160 320 220 520 140 C 720 60 900 140 1120 80 C 1300 36 1480 80 1520 60"
            fill="none"
            stroke={palette.sage}
            strokeWidth="2.0"
            strokeLinecap="round"
          />
          <path
            d="M -60 220 C 160 140 340 200 540 120 C 740 40 920 120 1140 60 C 1320 16 1500 60 1540 40"
            fill="none"
            stroke={palette.maroon}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M -40 260 C 180 180 360 240 560 160 C 760 80 940 160 1160 100 C 1340 56 1520 100 1560 80"
            fill="none"
            stroke={palette.beige}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.9"
          />
        </g>
      </svg>

      {/* Botanical — kiri */}
      <LeafSprig className="absolute -bottom-1 left-[2%] h-14 w-14 -rotate-12 text-[#8FA68F] opacity-70 sm:left-[4%] sm:h-20 sm:w-20 lg:h-24 lg:w-24" />
      {/* Tengah */}
      <LeafSprig className="absolute left-[38%] top-[8%] hidden h-12 w-12 rotate-[8deg] text-[#8FA68F] opacity-60 md:block lg:h-16 lg:w-16" />
      {/* Kanan — dekat ujung, diperkecil */}
      <LeafSprig className="absolute -right-2 bottom-[10%] h-12 w-12 rotate-180 text-[#8FA68F] opacity-60 sm:right-[6%] sm:h-16 sm:w-16 lg:h-20 lg:w-20" />

      {/* Ornamen kecil */}
      <FourPointStar className="absolute left-[18%] top-[22%] h-3 w-3 text-[#76263D] opacity-80 sm:h-3.5 sm:w-3.5" />
      <FourPointStar className="absolute left-[52%] bottom-[28%] hidden h-2.5 w-2.5 text-[#76263D] opacity-70 md:block" />
      <span className="absolute left-[12%] top-[36%] h-1 w-1 rounded-full bg-[#8FA68F] opacity-70" />
      <span className="absolute left-[46%] bottom-[20%] h-1 w-1 rounded-full bg-[#8FA68F] opacity-60" />

      {/* Pesawat kertas — mengarahkan pandangan ke arah Teacher */}
      <motion.div
        className="absolute right-[14%] top-[10%] h-12 w-12 sm:right-[20%] sm:top-[6%] sm:h-16 sm:w-16 lg:h-18 lg:w-18"
        animate={reduceMotion ? undefined : { y: [0, -5, 0], x: [0, 4, 0] }}
        transition={
          reduceMotion ? undefined : { duration: 6.5, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <PaperPlane className="h-full w-full" />
      </motion.div>
    </div>
  );
}

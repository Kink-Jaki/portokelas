/**
 * Ornamen botanical bersama — bentuknya dibuat sekali di sini dan dipakai
 * lintas section agar gaya garis konsisten (delicate line-art editorial).
 * Semua ornamen memakai `currentColor` sehingga warna diatur lewat kelas.
 */

/** Lima kelopak mengelilingi pusat (0,0). */
function Petals() {
  return (
    <g strokeWidth="1.1">
      {[0, 72, 144, 216, 288].map((angle) => (
        <g key={angle} transform={`rotate(${angle})`}>
          <path d="M0 -3.5C-4.4 -8 -4.4 -16 0 -20.5 4.4 -16 4.4 -8 0 -3.5Z" />
          <path d="M0 -7V-17.5" opacity="0.5" />
        </g>
      ))}
    </g>
  );
}

/** Bunga line-art lima kelopak dengan inti kecil. */
export function Flower({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <g transform="translate(24 24)">
        <Petals />
      </g>
      <circle cx="24" cy="24" r="3.1" />
      <circle cx="24" cy="24" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Ranting daun: satu batang melengkung dengan daun bulat-telur menjari. */
export function LeafSprig({ className }: { className?: string }) {
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
      <path d="M16 108C48 96 80 70 106 30" strokeWidth="1.2" />
      <g strokeWidth="0.95">
        <g transform="translate(30 90) rotate(-40)">
          <path d="M0 0c-6.5 8-6.5 22 0 29 6.5-7 6.5-21 0-29Z" />
          <path d="M0 5v19" opacity="0.55" />
        </g>
        <g transform="translate(52 72) rotate(20)">
          <path d="M0 0c-6 7-6 20 0 26 6-6 6-19 0-26Z" />
          <path d="M0 5v17" opacity="0.55" />
        </g>
        <g transform="translate(74 50) rotate(-28)">
          <path d="M0 0c-5.5 6-5.5 18 0 24 5.5-6 5.5-18 0-24Z" />
          <path d="M0 4v20" opacity="0.55" />
        </g>
        <g transform="translate(92 32) rotate(16)">
          <path d="M0 0c-4 5-4 14 0 19 4-5 4-14 0-19Z" />
          <path d="M0 3v14" opacity="0.55" />
        </g>
      </g>
    </svg>
  );
}

/** Bintang empat sudut dengan sisi cekung — aksen kecil. */
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 1.4c.74 5 4.36 8.22 10.6 10.6-6.24 2.38-9.86 5.6-10.6 10.6-.74-5-4.36-8.22-10.6-10.6C7.64 9.62 11.26 6.4 12 1.4Z" />
    </svg>
  );
}

/** Coretan tangan berbentuk hati. */
export function HeartDoodle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d="M32 52C18 42 8 33 8 23.5 8 16 13.8 11 20.5 11c4.6 0 8.4 2.6 11.5 7 3.1-4.4 6.9-7 11.5-7C50.2 11 56 16 56 23.5 56 33 46 42 32 52Z"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/** Goresan pena pendek — garis lengkung dekoratif. */
export function PenCurve({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 60"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      aria-hidden="true"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M4 46C22 44 40 34 58 22 74 11 92 6 116 8" strokeWidth="1.3" />
      <path d="M10 54C30 50 50 40 68 30" strokeWidth="0.95" opacity="0.55" />
    </svg>
  );
}

/** Pesawat kertas dengan lintasan putus-putus — aksen mengarahkan pandangan. */
export function PaperPlane({
  className,
  forest = '#214F40',
  maroon = '#76263D',
  trail = '#8FA68F',
}: {
  className?: string;
  forest?: string;
  maroon?: string;
  trail?: string;
}) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" aria-hidden="true">
      <path
        d="M10 108C36 98 58 74 70 40"
        stroke={trail}
        strokeWidth="1.5"
        strokeDasharray="4 7"
        strokeLinecap="round"
      />
      <path d="M70 34 112 12 96 60 82 48 70 34Z" fill={forest} />
      <path d="M70 34 82 48 76 64 70 34Z" fill={maroon} />
    </svg>
  );
}

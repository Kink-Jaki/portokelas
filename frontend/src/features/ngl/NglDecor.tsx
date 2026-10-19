import type { CSSProperties } from 'react';

/** Bintang/sparkle kecil untuk aksen dekoratif pada kartu & template share. */
export function Sparkle({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden>
      <path d="M12 1.5c.7 3.9 3 6.2 6.9 6.9-3.9.7-6.2 3-6.9 6.9-.7-3.9-3-6.2-6.9-6.9 3.9-.7 6.2-3 6.9-6.9Z" />
      <path
        d="M19 14c.3 1.9 1.4 3 3.3 3.3-1.9.3-3 1.4-3.3 3.3-.3-1.9-1.4-3-3.3-3.3 1.9-.3 3-1.4 3.3-3.3Z"
        opacity=".65"
      />
    </svg>
  );
}

/** Squiggle/gelombang dekoratif. */
export function Squiggle({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 120 16"
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M3 9c9-9 18 9 27 0s18 9 27 0 18 9 27 0" />
    </svg>
  );
}

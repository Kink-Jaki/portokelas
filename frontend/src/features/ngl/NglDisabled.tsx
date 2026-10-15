import { NGL_DISABLED_MESSAGE } from './constants';

/** Panel editorial yang tampil saat fitur NGL belum diaktifkan admin. */
export function NglDisabled() {
  return (
    <div className="flex min-h-[24rem] flex-col items-center justify-center border border-line bg-ivory-warm px-8 py-20 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full border border-burgundy/25 text-burgundy">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden>
          <path
            d="M12 4a8 8 0 0 0-8 8v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a8 8 0 0 0-8-8Z"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path d="M9 11h6M9 15h4" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </span>
      <p className="eyebrow mt-8">Craftly NGL</p>
      <h2 className="mt-4 max-w-xl font-display text-2xl leading-snug text-forest sm:text-3xl">
        Fitur belum tersedia
      </h2>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">{NGL_DISABLED_MESSAGE}</p>
    </div>
  );
}

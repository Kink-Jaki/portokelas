import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { assetUrl } from '@/lib/api';
import { cn, formatDateTime } from '@/lib/utils';
import type { NglMessage } from '@/types/api';
import { Sparkle } from './NglDecor';
import { nglCardFontSize, nglDecorFor, nglThemeFor, type NglDecor } from './themes';
import { nglCardVariants } from './variants';

/** Event global supaya hanya satu pemutar Spotify yang aktif di Kotak NGL. */
const NGL_SPOTIFY_EVENT = 'ngl:spotify:play';

/** Pasang autoplay agar lagu langsung berputar tanpa pindah halaman. */
function withAutoplay(embedUrl: string): string {
  try {
    const url = new URL(embedUrl);
    url.searchParams.set('autoplay', '1');
    return url.toString();
  } catch {
    return embedUrl;
  }
}

type Props = {
  message: NglMessage;
  position: number;
  total: number;
  repostPending: boolean;
  onReveal: (message: NglMessage) => void;
  onReport: (message: NglMessage) => void;
  onRepost: (message: NglMessage) => void;
  /** Ubah status baca: `true` = tandai sudah dibaca, `false` = kembali belum dibaca. */
  onToggleRead: (message: NglMessage, read: boolean) => void;
};

function ReportIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d="M5 21V4m0 0h11l-2 3 2 3H5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d="M21 3 10.5 13.5M21 3l-6.5 18-4-8-8-4L21 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d="m4.5 12.5 5 5 10-11"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="m4 7 8 5.5L20 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Indikator posisi: dot untuk pesan sedikit, pill untuk koleksi besar. */
function PositionIndicator({
  position,
  total,
  decor,
}: {
  position: number;
  total: number;
  decor: NglDecor;
}) {
  if (total > 0 && total <= 7) {
    return (
      <span className="flex items-center gap-1.5" aria-label={`Pesan ${position} dari ${total}`}>
        {Array.from({ length: total }).map((_, index) => {
          const active = index === position - 1;
          return (
            <span
              key={index}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: active ? 18 : 6,
                background: 'currentColor',
                opacity: active ? 1 : 0.35,
              }}
            />
          );
        })}
      </span>
    );
  }

  return (
    <span
      className="rounded-full px-2.5 py-1 text-[0.6875rem] font-bold tabular-nums"
      style={{
        background: decor.chipBg,
        color: decor.chipInk,
        border: `1px solid ${decor.chipBorder}`,
      }}
    >
      {position} / {total}
    </span>
  );
}

/**
 * Kartu pesan anonim bergaya stiker/Instagram Story. Pesan jadi fokus utama,
 * berlatar gradient vibrant yang dipilih dari hash id pesan.
 */
export function NglBoxCard({
  message,
  position,
  total,
  repostPending,
  onReveal,
  onReport,
  onRepost,
  onToggleRead,
}: Props) {
  const reduceMotion = useReducedMotion();
  const theme = useMemo(() => nglThemeFor(message.id), [message.id]);
  const decor = useMemo(() => nglDecorFor(theme), [theme]);
  const [open, setOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const playerIdRef = useRef(
    `ngl-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`,
  );

  // Hanya satu kartu yang boleh memutar Spotify pada satu waktu.
  useEffect(() => {
    if (!playerOpen) return;
    const hide = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== playerIdRef.current) setPlayerOpen(false);
    };
    window.addEventListener(NGL_SPOTIFY_EVENT, hide);
    return () => window.removeEventListener(NGL_SPOTIFY_EVENT, hide);
  }, [playerOpen]);

  // Flashcard: mulai tertutup, diklik untuk membuka/menutup.
  // Membuka kartu yang belum dibaca otomatis menandainya sudah dibaca.
  const toggle = useCallback(() => {
    if (!open && !message.isRead) onReveal(message);
    if (open) setPlayerOpen(false);
    setOpen((prev) => !prev);
  }, [open, message, onReveal]);

  const text = message.content?.trim() ?? '';
  const hasContent = text.length > 0;
  const unread = !message.isRead;

  const shareStyle = theme.isDark
    ? { background: '#FFFFFF', color: '#1A0B26' }
    : { background: '#1A0B26', color: '#FFFFFF' };

  const chipStyle = {
    background: decor.chipBg,
    color: decor.chipInk,
    border: `1px solid ${decor.chipBorder}`,
  };

  return (
    <motion.article
      variants={reduceMotion ? undefined : nglCardVariants}
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      className="relative h-[16rem] w-full"
      style={{ perspective: 1400 }}
    >
      <motion.div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={open ? 'Tutup pesan anonim' : 'Buka pesan anonim'}
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle();
          }
        }}
        initial={false}
        animate={{ rotateY: open ? 0 : 180 }}
        transition={
          reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 190, damping: 24 }
        }
        className="relative h-full w-full cursor-pointer rounded-[1.5rem] outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Sisi depan — isi pesan (terlihat saat terbuka) */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.5rem] p-4"
          style={{
            backgroundImage: theme.gradient,
            color: theme.ink,
            boxShadow: decor.shadow,
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Dekorasi latar */}
          <span
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full blur-2xl"
            style={{ background: decor.glow }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full blur-3xl"
            style={{ background: decor.glow }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: decor.scrim }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'var(--grain)', backgroundSize: '140px 140px' }}
          />
          <Sparkle
            className="pointer-events-none absolute right-7 top-20 h-5 w-5"
            style={{ color: decor.decor }}
          />
          <Sparkle
            className="pointer-events-none absolute right-14 bottom-24 h-3.5 w-3.5"
            style={{ color: decor.decor }}
          />

          {/* Header */}
          <header className="relative flex items-start justify-end gap-2">
            {unread ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-wide"
                style={chipStyle}
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" aria-hidden />
                Baru
              </span>
            ) : message.isReported ? (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-wide"
                style={chipStyle}
              >
                ⚠️ Dilaporkan
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-wide opacity-80"
                style={chipStyle}
              >
                <span aria-hidden>✓</span> Sudah dibaca
              </span>
            )}
          </header>

          {/* Pesan — fokus utama */}
          <div className="@container relative flex min-h-0 flex-1 overflow-y-auto px-1 py-3">
            <div className="m-auto flex flex-col items-center gap-3 text-center">
              {hasContent ? (
                <p
                  className="font-pop font-extrabold leading-[1.14] tracking-tight [overflow-wrap:anywhere]"
                  style={{ fontSize: nglCardFontSize(text), textShadow: decor.textShadow }}
                >
                  {text}
                </p>
              ) : message.imagePath ? null : (
                <p className="font-pop text-2xl font-extrabold">📎 Pesan anonim</p>
              )}

              {message.imagePath ? (
                <img
                  src={assetUrl(message.imagePath) ?? ''}
                  alt="Lampiran pesan"
                  className="max-h-36 w-full rounded-2xl border-2 border-white/40 object-cover"
                  style={{ boxShadow: '0 12px 28px -16px rgba(0,0,0,0.5)' }}
                />
              ) : null}

              {message.spotify ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    window.dispatchEvent(
                      new CustomEvent(NGL_SPOTIFY_EVENT, { detail: playerIdRef.current }),
                    );
                    setPlayerOpen(true);
                  }}
                  className="inline-flex max-w-full flex-col items-start gap-0.5 rounded-2xl px-3 py-2 text-left backdrop-blur-sm transition-transform hover:scale-105"
                  style={chipStyle}
                >
                  <span className="inline-flex items-center gap-2">
                    <span aria-hidden>▶️</span>
                    <span className="truncate text-xs font-extrabold">
                      {message.spotify.title ?? 'Dengarkan di Spotify'}
                    </span>
                  </span>
                  {message.spotify.artistName ? (
                    <span className="truncate pl-6 text-[0.6875rem] font-medium opacity-75">
                      {message.spotify.artistName}
                    </span>
                  ) : null}
                </button>
              ) : null}
            </div>
          </div>

          {/* Footer & aksi */}
          <footer className="relative flex items-end justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <PositionIndicator position={position} total={total} decor={decor} />
              <span
                className="text-[0.625rem] font-medium tabular-nums"
                style={{ color: theme.ink, opacity: 0.62 }}
              >
                {formatDateTime(message.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleRead(message, !unread);
                }}
                aria-label={unread ? 'Tandai sudah dibaca' : 'Tandai belum dibaca'}
                title={unread ? 'Tandai sudah dibaca' : 'Tandai belum dibaca'}
                className="grid h-11 w-11 place-items-center rounded-full backdrop-blur-sm transition-transform hover:scale-105 active:scale-90"
                style={chipStyle}
              >
                {unread ? <CheckIcon /> : <MailIcon />}
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onReport(message);
                }}
                aria-label="Laporkan pesan"
                title="Laporkan"
                className="grid h-11 w-11 place-items-center rounded-full backdrop-blur-sm transition-transform hover:scale-105 active:scale-90"
                style={chipStyle}
              >
                <ReportIcon />
              </button>

              <button
                type="button"
                disabled={repostPending}
                onClick={(event) => {
                  event.stopPropagation();
                  onRepost(message);
                }}
                aria-label="Bagikan ke Instagram Story"
                title="Bagikan"
                className={cn(
                  'inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-extrabold',
                  'transition-transform hover:scale-105 active:scale-95 disabled:cursor-wait disabled:opacity-70',
                )}
                style={{ ...shareStyle, boxShadow: '0 12px 26px -12px rgba(0,0,0,0.5)' }}
              >
                {repostPending ? (
                  <span
                    aria-hidden
                    className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                  />
                ) : (
                  <SendIcon />
                )}
                Bagikan
              </button>
            </div>
          </footer>

          {/* Pemutar Spotify inline — musik berputar di dalam kartu, tanpa pindah halaman */}
          {open && playerOpen && message.spotify ? (
            <div
              className="absolute inset-0 z-20 flex flex-col gap-2 rounded-[1.5rem] p-3"
              style={{ backgroundImage: theme.gradient, color: theme.ink }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-wide"
                  style={chipStyle}
                >
                  <span aria-hidden>🎵</span>
                  Spotify · {message.spotify.type}
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setPlayerOpen(false);
                  }}
                  aria-label="Tutup pemutar Spotify"
                  className="grid h-8 w-8 place-items-center rounded-full text-sm font-extrabold backdrop-blur-sm transition-transform hover:scale-105 active:scale-90"
                  style={chipStyle}
                >
                  ✕
                </button>
              </div>

              <div
                className={cn(
                  'flex min-h-0 w-full flex-1',
                  message.spotify.type === 'track' && 'items-center',
                )}
              >
                <iframe
                  src={withAutoplay(message.spotify.embedUrl)}
                  title="Pemutar Spotify"
                  loading="eager"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  className={cn(
                    'w-full rounded-xl border-0 bg-black',
                    message.spotify.type === 'track' ? 'h-[9.5rem]' : 'h-full',
                  )}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Sisi belakang — tertutup (flashcard) */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-[1.5rem] p-5 text-center"
          style={{
            backgroundImage: theme.gradient,
            color: theme.ink,
            boxShadow: decor.shadow,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full blur-2xl"
            style={{ background: decor.glow }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full blur-3xl"
            style={{ background: decor.glow }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: decor.scrim }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'var(--grain)', backgroundSize: '140px 140px' }}
          />
          <Sparkle
            className="pointer-events-none absolute left-8 top-10 h-4 w-4"
            style={{ color: decor.decor }}
          />
          <Sparkle
            className="pointer-events-none absolute right-9 bottom-12 h-5 w-5"
            style={{ color: decor.decor }}
          />

          {unread ? (
            <span
              className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-wide"
              style={chipStyle}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" aria-hidden />
              Baru
            </span>
          ) : message.isRead ? (
            <span
              className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-wide opacity-80"
              style={chipStyle}
            >
              <span aria-hidden>✓</span> Dibaca
            </span>
          ) : null}

          <span
            aria-hidden
            className="grid h-16 w-16 place-items-center rounded-full text-3xl backdrop-blur-sm"
            style={{ ...chipStyle, boxShadow: '0 18px 40px -20px rgba(0,0,0,0.6)' }}
          >
            💌
          </span>

          <p className="relative mt-4 font-pop text-xl font-extrabold tracking-tight">
            Pesan anonim
          </p>
          <p className="relative mt-1 text-xs font-medium" style={{ opacity: 0.72 }}>
            Ketuk untuk membuka
          </p>

          <span
            className="relative mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold backdrop-blur-sm"
            style={{ ...shareStyle, boxShadow: '0 12px 26px -12px rgba(0,0,0,0.5)' }}
          >
            <span aria-hidden>👀</span> Buka
          </span>
        </div>
      </motion.div>
    </motion.article>
  );
}

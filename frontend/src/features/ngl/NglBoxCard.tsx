import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { assetUrl } from '@/lib/api';
import { cn, formatDateTime } from '@/lib/utils';
import type { NglMessage } from '@/types/api';
import { Sparkle } from './NglDecor';
import {
  nglCardFontSize,
  nglDecorFor,
  nglReadThemeFor,
  nglThemeFor,
  type NglDecor,
} from './themes';
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
  onRepost: (message: NglMessage) => void;
  /** Ubah status baca: `true` = tandai sudah dibaca, `false` = kembali belum dibaca. */
  onToggleRead: (message: NglMessage, read: boolean) => void;
};

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden>
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
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden>
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
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden>
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

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="12" cy="19" r="2.2" />
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
      <span className="flex items-center gap-1" aria-label={`Pesan ${position} dari ${total}`}>
        {Array.from({ length: total }).map((_, index) => {
          const active = index === position - 1;
          return (
            <span
              key={index}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: active ? 12 : 4,
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
      className="rounded-full px-2 py-0.5 text-[0.5625rem] font-bold tabular-nums sm:px-2.5 sm:py-1 sm:text-[0.6875rem]"
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
  onRepost,
  onToggleRead,
}: Props) {
  const reduceMotion = useReducedMotion();
  const baseTheme = useMemo(() => nglThemeFor(message.id), [message.id]);
  // Pesan yang sudah dibaca tampil abu-abu agar jelas bedanya dari yang baru.
  const theme = useMemo(
    () => (message.isRead ? nglReadThemeFor(baseTheme) : baseTheme),
    [baseTheme, message.isRead],
  );
  const decor = useMemo(() => nglDecorFor(theme), [theme]);
  const [open, setOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
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

  // Tutup menu titik-3 saat klik di luar kartu / Escape.
  useEffect(() => {
    if (!actionsOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const host = event.target as Node | null;
      if (host && articleRef.current && !articleRef.current.contains(host)) setActionsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActionsOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [actionsOpen]);

  // Flashcard: mulai tertutup, diklik untuk membuka/menutup.
  // Membuka kartu yang belum dibaca otomatis menandainya sudah dibaca.
  const toggle = useCallback(() => {
    setActionsOpen(false);
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
      ref={articleRef}
      variants={reduceMotion ? undefined : nglCardVariants}
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      className="relative aspect-square w-full min-w-0 sm:aspect-auto sm:h-[14.5rem] lg:h-[15.5rem]"
      style={{ perspective: 1400, boxSizing: 'border-box' }}
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
        className="relative h-full w-full min-w-0 cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 sm:rounded-[1.5rem]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Sisi depan — isi pesan (terlihat saat terbuka) */}
        <div
          className="absolute inset-0 box-border flex min-w-0 flex-col overflow-hidden rounded-2xl p-2 min-[360px]:p-2 min-[390px]:p-2.5 sm:rounded-[1.5rem] sm:p-3.5"
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
            className="pointer-events-none absolute right-5 top-14 h-3 w-3 min-[390px]:right-7 min-[390px]:top-20 min-[390px]:h-4 min-[390px]:w-4 sm:h-5 sm:w-5"
            style={{ color: decor.decor }}
          />
          <Sparkle
            className="pointer-events-none absolute right-8 bottom-16 h-2.5 w-2.5 min-[390px]:right-14 min-[390px]:bottom-24 min-[390px]:h-3 min-[390px]:w-3 sm:h-3.5 sm:w-3.5"
            style={{ color: decor.decor }}
          />

          {/* Header */}
          <header className="relative z-10 flex items-start justify-end gap-2">
            {unread ? (
              <span
                className="inline-flex items-center gap-1 rounded-full px-1 py-px text-[0.4375rem] font-bold uppercase tracking-wide min-[360px]:px-1.5 min-[360px]:py-0.5 min-[360px]:text-[0.5rem] sm:px-2 sm:py-1 sm:text-[0.5625rem] lg:text-[0.625rem]"
                style={chipStyle}
              >
                <span className="h-1 w-1 animate-pulse rounded-full bg-current sm:h-1.5 sm:w-1.5" aria-hidden />
                Baru
              </span>
            ) : message.isReported ? (
              <span
                className="inline-flex items-center gap-1 rounded-full px-1 py-px text-[0.4375rem] font-bold uppercase tracking-wide min-[360px]:px-1.5 min-[360px]:py-0.5 min-[360px]:text-[0.5rem] sm:px-2 sm:py-1 sm:text-[0.5625rem] lg:text-[0.625rem]"
                style={{
                  ...chipStyle,
                  background: theme.isDark ? 'rgba(220,38,38,0.2)' : 'rgba(220,38,38,0.12)',
                  color: theme.isDark ? '#FFC9C9' : '#8A1C1C',
                  border: '1px solid rgba(220,38,38,0.4)',
                }}
              >
                ⚠️ Dilaporkan
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 rounded-full px-1 py-px text-[0.4375rem] font-bold uppercase tracking-wide opacity-80 min-[360px]:px-1.5 min-[360px]:py-0.5 min-[360px]:text-[0.5rem] sm:px-2 sm:py-1 sm:text-[0.5625rem] lg:text-[0.625rem]"
                style={chipStyle}
              >
                <span aria-hidden>✓</span> Dibaca
              </span>
            )}
          </header>

          {/* Pesan — fokus utama */}
          <div className="@container relative z-10 flex min-h-0 min-w-0 flex-1 overflow-y-auto px-0 py-1.5 min-[390px]:py-2">
            <div className="m-auto flex w-full min-w-0 flex-col items-center gap-1.5 text-center min-[390px]:gap-2">
              {hasContent ? (
                <p
                  className="w-full min-w-0 font-pop font-extrabold leading-[1.14] tracking-tight [overflow-wrap:anywhere]"
                  style={{ fontSize: nglCardFontSize(text), textShadow: decor.textShadow }}
                >
                  {text}
                </p>
              ) : message.imagePath ? null : (
                <p className="font-pop text-sm font-extrabold min-[390px]:text-base sm:text-xl">
                  📎 Pesan anonim
                </p>
              )}

              {message.imagePath ? (
                <img
                  src={assetUrl(message.imagePath) ?? ''}
                  alt="Lampiran pesan"
                  className="max-h-16 w-full min-w-0 rounded-lg border-2 border-white/40 object-cover min-[390px]:max-h-24 min-[390px]:rounded-xl sm:max-h-32 sm:rounded-2xl"
                  style={{ boxShadow: '0 12px 28px -16px rgba(0,0,0,0.5)' }}
                />
              ) : null}

              {message.spotify ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setActionsOpen(false);
                    window.dispatchEvent(
                      new CustomEvent(NGL_SPOTIFY_EVENT, { detail: playerIdRef.current }),
                    );
                    setPlayerOpen(true);
                  }}
                  className="inline-flex max-w-full flex-col items-start gap-0.5 rounded-xl px-2 py-1.5 text-left backdrop-blur-sm transition-transform hover:scale-105 sm:rounded-2xl sm:px-3 sm:py-2"
                  style={chipStyle}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span aria-hidden>▶️</span>
                    <span className="truncate text-[0.625rem] font-extrabold sm:text-xs">
                      {message.spotify.title ?? 'Dengarkan di Spotify'}
                    </span>
                  </span>
                  {message.spotify.artistName ? (
                    <span className="truncate pl-5 text-[0.5625rem] font-medium opacity-75 sm:pl-6 sm:text-[0.6875rem]">
                      {message.spotify.artistName}
                    </span>
                  ) : null}
                </button>
              ) : null}
            </div>
          </div>

          {/* Footer & aksi */}
          <footer className="relative z-10 flex items-end justify-between gap-1.5 min-[390px]:gap-2">
            <div className="flex min-w-0 flex-col gap-0.5 sm:gap-1">
              <PositionIndicator position={position} total={total} decor={decor} />
              <span
                className="truncate text-[0.4375rem] font-medium tabular-nums min-[360px]:text-[0.5rem] sm:text-[0.625rem]"
                style={{ color: theme.ink, opacity: 0.62 }}
              >
                {formatDateTime(message.createdAt)}
              </span>
            </div>

            {/* Mobile: menu titik-3 — ketuk untuk buka aksi */}
            <div className="relative shrink-0 sm:hidden">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setActionsOpen((prev) => !prev);
                }}
                aria-label={actionsOpen ? 'Tutup menu aksi' : 'Buka menu aksi'}
                aria-expanded={actionsOpen}
                className="grid h-6 w-6 place-items-center rounded-full backdrop-blur-sm transition-transform hover:scale-105 active:scale-90 min-[360px]:h-7 min-[360px]:w-7"
                style={chipStyle}
              >
                <MoreIcon />
              </button>

              {actionsOpen ? (
                <div
                  className="absolute bottom-[calc(100%+0.4rem)] right-0 z-30 flex items-center gap-1 rounded-full p-1 backdrop-blur-md"
                  style={{
                    ...chipStyle,
                    background: theme.isDark ? 'rgba(20,10,40,0.88)' : 'rgba(255,255,255,0.88)',
                    boxShadow: '0 14px 32px -14px rgba(0,0,0,0.55)',
                  }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setActionsOpen(false);
                      onToggleRead(message, !unread);
                    }}
                    aria-label={unread ? 'Tandai sudah dibaca' : 'Tandai belum dibaca'}
                    title={unread ? 'Tandai sudah dibaca' : 'Tandai belum dibaca'}
                    className="grid h-7 w-7 place-items-center rounded-full transition-transform hover:scale-105 active:scale-90"
                    style={chipStyle}
                  >
                    {unread ? <CheckIcon /> : <MailIcon />}
                  </button>

                  <button
                    type="button"
                    disabled={repostPending}
                    onClick={(event) => {
                      event.stopPropagation();
                      setActionsOpen(false);
                      onRepost(message);
                    }}
                    aria-label="Bagikan ke Instagram Story"
                    title="Bagikan"
                    className="grid h-7 w-7 place-items-center rounded-full transition-transform hover:scale-105 active:scale-95 disabled:cursor-wait disabled:opacity-70"
                    style={{ ...shareStyle, boxShadow: '0 8px 18px -10px rgba(0,0,0,0.5)' }}
                  >
                    {repostPending ? (
                      <span
                        aria-hidden
                        className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
                      />
                    ) : (
                      <SendIcon />
                    )}
                  </button>
                </div>
              ) : null}
            </div>

            {/* sm+: 2 tombol aksi tampil langsung */}
            <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleRead(message, !unread);
                }}
                aria-label={unread ? 'Tandai sudah dibaca' : 'Tandai belum dibaca'}
                title={unread ? 'Tandai sudah dibaca' : 'Tandai belum dibaca'}
                className="grid h-9 w-9 place-items-center rounded-full backdrop-blur-sm transition-transform hover:scale-105 active:scale-90 lg:h-10 lg:w-10"
                style={chipStyle}
              >
                {unread ? <CheckIcon /> : <MailIcon />}
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
                  'inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-extrabold lg:h-10 lg:px-3.5',
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
                <span className="hidden lg:inline">Bagikan</span>
              </button>
            </div>
          </footer>

          {/* Pemutar Spotify inline — musik berputar di dalam kartu, tanpa pindah halaman */}
          {open && playerOpen && message.spotify ? (
            <div
              className="absolute inset-0 z-20 flex flex-col gap-1.5 rounded-2xl p-2 sm:rounded-[1.5rem] sm:p-3"
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
                    'w-full rounded-lg border-0 bg-black sm:rounded-xl',
                    message.spotify.type === 'track' ? 'h-[7rem] sm:h-[8.5rem]' : 'h-full',
                  )}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Sisi belakang — tertutup (flashcard) */}
        <div
          className="absolute inset-0 box-border flex min-w-0 flex-col items-center justify-evenly overflow-hidden rounded-2xl px-2 py-2 text-center min-[360px]:px-2.5 min-[360px]:py-2.5 min-[390px]:px-3 min-[390px]:py-3 sm:justify-center sm:gap-0 sm:rounded-[1.5rem] sm:p-4"
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
            className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full blur-2xl sm:h-44 sm:w-44"
            style={{ background: decor.glow }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-14 -left-10 h-40 w-40 rounded-full blur-3xl sm:-bottom-16 sm:-left-12 sm:h-48 sm:w-48"
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
            className="pointer-events-none absolute left-3 top-4 h-2.5 w-2.5 min-[390px]:left-5 min-[390px]:top-6 min-[390px]:h-3 min-[390px]:w-3 sm:left-8 sm:top-10 sm:h-4 sm:w-4"
            style={{ color: decor.decor }}
          />
          <Sparkle
            className="pointer-events-none absolute right-4 bottom-6 h-2.5 w-2.5 min-[390px]:right-6 min-[390px]:bottom-8 min-[390px]:h-3 min-[390px]:w-3 sm:right-9 sm:bottom-12 sm:h-5 sm:w-5"
            style={{ color: decor.decor }}
          />

          {unread ? (
            <span
              className="absolute right-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full px-1 py-px text-[0.4375rem] font-bold uppercase tracking-wide min-[360px]:right-2 min-[360px]:top-2 min-[360px]:px-1.5 min-[360px]:py-0.5 min-[360px]:text-[0.5rem] sm:right-5 sm:top-5 sm:px-2 sm:py-1 sm:text-[0.5625rem] lg:text-[0.625rem]"
              style={chipStyle}
            >
              <span className="h-1 w-1 animate-pulse rounded-full bg-current sm:h-1.5 sm:w-1.5" aria-hidden />
              Baru
            </span>
          ) : message.isRead ? (
            <span
              className="absolute right-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full px-1 py-px text-[0.4375rem] font-bold uppercase tracking-wide opacity-80 min-[360px]:right-2 min-[360px]:top-2 min-[360px]:px-1.5 min-[360px]:py-0.5 min-[360px]:text-[0.5rem] sm:right-5 sm:top-5 sm:px-2 sm:py-1 sm:text-[0.5625rem] lg:text-[0.625rem]"
              style={chipStyle}
            >
              <span aria-hidden>✓</span> Dibaca
            </span>
          ) : null}

          {/* Ikon amplop hati — disembunyikan di mobile, tampil di sm+ */}
          <span
            aria-hidden
            className="relative hidden h-14 w-14 shrink-0 place-items-center rounded-full text-3xl backdrop-blur-sm sm:grid"
            style={{ ...chipStyle, boxShadow: '0 14px 30px -18px rgba(0,0,0,0.6)' }}
          >
            💌
          </span>

          <p className="relative hidden w-full min-w-0 font-pop text-[clamp(0.625rem,2.8vw,0.8125rem)] font-extrabold leading-none tracking-tight min-[390px]:leading-tight sm:mt-4 sm:block sm:text-xl sm:leading-tight">
            Pesan anonim
          </p>
          <p
            className="relative mt-2 w-full min-w-0 max-w-[12ch] text-[clamp(0.5625rem,2.4vw,0.6875rem)] font-medium leading-[1.15] min-[390px]:mt-2.5 sm:mt-2 sm:max-w-none sm:text-xs sm:leading-normal"
            style={{ opacity: 0.72 }}
          >
            Ketuk untuk membuka
          </p>

          <span
            className="relative inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[clamp(0.5rem,2.1vw,0.625rem)] font-extrabold backdrop-blur-sm min-[390px]:px-2.5 min-[390px]:py-1 sm:mt-4 sm:gap-1.5 sm:px-4 sm:py-2 sm:text-xs"
            style={{ ...shareStyle, boxShadow: '0 12px 26px -12px rgba(0,0,0,0.5)' }}
          >
            <span aria-hidden>👀</span> Buka
          </span>
        </div>
      </motion.div>
    </motion.article>
  );
}

import { assetUrl } from '@/lib/api';
import type { NglMessage } from '@/types/api';
import { Sparkle, Squiggle } from './NglDecor';
import { nglDecorFor, nglShareFontSize, type NglTheme } from './themes';

type Props = {
  message: NglMessage;
  theme: NglTheme;
  /** Lebar & tinggi CSS node (dikali pixelRatio saat capture → 1080×1920). */
  width?: number;
  height?: number;
};

/**
 * Template khusus untuk gambar share 9:16 (bukan screenshot kartu yang tampil).
 * Di-mount off-screen lalu di-capture oleh `captureNglShareNode`.
 */
export function NglShareTemplate({ message, theme, width = 540, height = 960 }: Props) {
  const decor = nglDecorFor(theme);
  const content = message.content?.trim() ?? '';
  const text = content || 'Pesan anonim 💌';
  const showText = content.length > 0 || !message.imagePath;
  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/ngl` : 'craftly/ngl';

  return (
    <div
      style={{ width, height, backgroundImage: theme.gradient, color: theme.ink }}
      className="relative flex flex-col overflow-hidden font-pop"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
        style={{ background: decor.glow }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full blur-3xl"
        style={{ background: decor.glow }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: decor.scrim }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'var(--grain)', backgroundSize: '140px 140px' }}
      />
      <Sparkle
        className="pointer-events-none absolute right-12 top-28 h-7 w-7"
        style={{ color: decor.decor }}
      />
      <Sparkle
        className="pointer-events-none absolute left-10 top-1/2 h-5 w-5"
        style={{ color: decor.decor }}
      />
      <header className="relative flex items-center justify-end px-10 pt-10">
        <span className="font-pop text-lg font-extrabold tracking-tight">NGL by Craftly</span>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center px-12 text-center">
        {showText ? (
          <p
            className="font-pop font-extrabold leading-[1.12] tracking-tight"
            style={{ fontSize: nglShareFontSize(text), textShadow: decor.textShadow }}
          >
            {text}
          </p>
        ) : null}

        {message.imagePath ? (
          <img
            src={assetUrl(message.imagePath) ?? ''}
            alt=""
            crossOrigin="anonymous"
            className={`${showText ? 'mt-8 ' : ''}max-h-56 w-auto max-w-full rounded-[1.5rem] border-2 border-white/40 object-cover`}
          />
        ) : null}

        {message.spotify ? (
          <span
            className="mt-6 inline-flex max-w-full flex-col items-center gap-0.5 rounded-2xl px-5 py-3 backdrop-blur-sm"
            style={{
              background: decor.chipBg,
              color: decor.chipInk,
              border: `1px solid ${decor.chipBorder}`,
            }}
          >
            <span className="inline-flex max-w-full items-center gap-2">
              <span aria-hidden>🎵</span>
              <span className="truncate text-base font-extrabold">
                {message.spotify.title ?? 'Dengarkan juga di Spotify'}
              </span>
            </span>
            {message.spotify.artistName ? (
              <span className="truncate text-sm font-medium opacity-75">
                {message.spotify.artistName}
              </span>
            ) : null}
          </span>
        ) : null}
      </main>

      <footer className="relative px-10 pb-12">
        <div
          className="rounded-[2rem] px-6 py-7 text-center backdrop-blur-sm"
          style={{ background: decor.chipBg, border: `1px solid ${decor.chipBorder}` }}
        >
          <p className="font-pop text-2xl font-extrabold" style={{ color: decor.chipInk }}>
            Kirim pesan anonim ke aku 👀
          </p>
          <div
            className="mt-3 flex items-center justify-center gap-2"
            style={{ color: decor.chipInk }}
          >
            <Squiggle className="h-3 w-10 opacity-70" />
            <p className="font-mono text-sm opacity-90">{shareLink.replace(/^https?:\/\//, '')}</p>
            <Squiggle className="h-3 w-10 opacity-70" />
          </div>
        </div>
      </footer>
    </div>
  );
}

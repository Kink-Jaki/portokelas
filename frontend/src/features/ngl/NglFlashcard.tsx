import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { SpotifyPlayer } from '@/components/domain/SpotifyPlayer';
import { assetUrl } from '@/lib/api';
import { ease } from '@/lib/motion';
import { cn, formatDateTime } from '@/lib/utils';
import type { NglMessage } from '@/types/api';

const faceBase = 'absolute inset-0 flex flex-col overflow-hidden border border-line';

type Props = {
  message: NglMessage;
  position: number;
  total: number;
  repostPending: boolean;
  onReveal: () => void;
  onReport: (message: NglMessage) => void;
  onRepost: (message: NglMessage) => void;
};

export function NglFlashcard({
  message,
  position,
  total,
  repostPending,
  onReveal,
  onReport,
  onRepost,
}: Props) {
  const [flipped, setFlipped] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setFlipped(false);
  }, [message.id]);

  const reveal = () => {
    setFlipped((current) => {
      if (!current) onReveal();
      return true;
    });
  };

  return (
    <div className="[perspective:1800px]">
      <motion.div
        className="relative h-[30rem] w-full [transform-style:preserve-3d] sm:h-[32rem]"
        animate={reduceMotion ? undefined : { rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease }}
      >
        {/* Depan — hijau forest dengan aksen maroon */}
        <button
          type="button"
          onClick={reveal}
          aria-label="Buka pesan"
          className={cn(
            faceBase,
            'items-center justify-center bg-forest px-8 text-center transition-opacity duration-300',
            reduceMotion
              ? flipped
                ? 'pointer-events-none opacity-0'
                : 'opacity-100'
              : cn('[backface-visibility:hidden]', flipped && 'pointer-events-none'),
          )}
        >
          <span
            aria-hidden
            className="mb-8 h-px w-10 bg-ivory-warm/40"
          />
          <span className="font-display text-3xl tracking-tight text-ivory-warm sm:text-4xl">
            Craftly NGL<span className="text-gold">.</span>
          </span>
          <span className="mt-4 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-ivory-warm/60">
            Pesan anonim
          </span>
          <span className="mt-12 inline-flex items-center gap-2 border border-ivory-warm/25 px-4 py-2 text-xs uppercase tracking-[0.2em] text-ivory-warm/85">
            Ketuk untuk membuka
          </span>
          <span className="absolute bottom-5 right-5 font-mono text-[0.6875rem] text-ivory-warm/55">
            {message.isRead ? '' : '• baru '}
            {position}/{total}
          </span>
        </button>

        {/* Belakang — kertas ivory */}
        <div
          className={cn(
            faceBase,
            'bg-ivory-warm text-forest transition-opacity duration-300',
            reduceMotion
              ? flipped
                ? 'opacity-100'
                : 'pointer-events-none opacity-0'
              : cn('[backface-visibility:hidden] [transform:rotateY(180deg)]', !flipped && 'pointer-events-none'),
          )}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <span className="font-mono text-[0.625rem] uppercase tracking-[0.24em] text-muted">
              {position}/{total}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onReport(message)}
                className="text-[0.6875rem] uppercase tracking-[0.14em] text-muted transition-colors hover:text-danger"
              >
                Laporkan
              </button>
              <button
                type="button"
                disabled={repostPending}
                onClick={() => onRepost(message)}
                className="text-[0.6875rem] uppercase tracking-[0.14em] text-muted transition-colors hover:text-burgundy disabled:opacity-50"
              >
                {repostPending ? 'Menyiapkan…' : 'Bagikan'}
              </button>
              {!reduceMotion ? (
                <button
                  type="button"
                  onClick={() => setFlipped(false)}
                  className="text-[0.6875rem] uppercase tracking-[0.14em] text-muted transition-colors hover:text-forest"
                >
                  Tutup
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10">
            <div className="mx-auto flex h-full w-full max-w-md flex-col justify-center gap-6">
              {message.content ? (
                <p className="whitespace-pre-wrap break-words font-display text-2xl leading-snug text-forest sm:text-[1.75rem]">
                  {message.content}
                </p>
              ) : (
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                  Pesan berisi lampiran
                </p>
              )}

              {message.imagePath ? (
                <img
                  src={assetUrl(message.imagePath) ?? ''}
                  alt="Lampiran pesan"
                  className="max-h-72 w-full border border-line object-contain"
                />
              ) : null}

              {message.spotify ? (
                <SpotifyPlayer
                  spotify={{
                    type: message.spotify.type,
                    embedUrl: message.spotify.embedUrl,
                    title: null,
                    artistName: null,
                    thumbnailUrl: null,
                  }}
                />
              ) : null}

              <p className="mt-auto pt-4 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-muted">
                {formatDateTime(message.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';

import { Button, buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMarkNglRead, useNglInbox, useNglSettings } from '@/hooks/useNgl';
import { useAuth } from '@/providers/AuthProvider';
import { fadeUp, stagger, staggerItem } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { NglMessage } from '@/types/api';
import { captureNglShareNode } from './capture';
import { NglBoxCard } from './NglBoxCard';
import { NglDisabled } from './NglDisabled';
import { NglReportDialog } from './NglReportDialog';
import { NglShareTemplate } from './NglShareTemplate';
import { shareNglImage } from './share';
import { nglThemeFor } from './themes';
import { nglGridVariants } from './variants';

const SHARE_WIDTH = 540;
const SHARE_HEIGHT = 960;
const BOUNCE_EMOJI = ['💌', '✨', '💬', '🔥', '🫧', '💫'];

/** Grid skeleton playful saat memuat — kartu gradient berkedip dengan emoji. */
function NglLoadingGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="relative h-[16rem] overflow-hidden rounded-[1.5rem] border border-line bg-subtle"
        >
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-subtle via-line/30 to-subtle" />
          <div className="absolute inset-0 grid place-items-center text-4xl">
            <span className="animate-bounce" aria-hidden>
              {BOUNCE_EMOJI[index % BOUNCE_EMOJI.length]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Halaman kotak NGL — menampilkan banyak kartu pesan anonim sekaligus. */
export default function NglBoxPage() {
  const { user } = useAuth();
  const enabled = Boolean(user);
  const reduceMotion = useReducedMotion();
  const settings = useNglSettings();
  const [page, setPage] = useState(1);
  const [reportTarget, setReportTarget] = useState<NglMessage | null>(null);
  const [shareTarget, setShareTarget] = useState<NglMessage | null>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const revealed = useRef(new Set<string>());

  const inbox = useNglInbox(page, enabled);
  const markRead = useMarkNglRead();

  const messages = inbox.data?.items ?? [];
  const meta = inbox.data?.meta;
  const unread = inbox.data?.unread ?? 0;

  const handleReveal = (message: NglMessage) => {
    if (revealed.current.has(message.id)) return;
    revealed.current.add(message.id);
    markRead.mutate(message.id);
  };

  // Render template share off-screen → capture PNG 9:16 → Web Share / unduh.
  useEffect(() => {
    const host = shareRef.current;
    const node = host?.firstElementChild as HTMLElement | null;
    if (!shareTarget || !node) return undefined;

    let cancelled = false;
    void (async () => {
      try {
        if (document.fonts) await document.fonts.ready;
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        });
        const blob = await captureNglShareNode(node, SHARE_WIDTH, SHARE_HEIGHT);
        if (cancelled) return;
        const result = await shareNglImage(blob);
        if (!cancelled && result === 'downloaded') {
          toast.success('Kartu NGL diunduh 📥');
        }
      } catch (error) {
        if (!cancelled && (error as Error).name !== 'AbortError') {
          toast.error('Gagal membuat kartu NGL 😢');
        }
      } finally {
        if (!cancelled) setShareTarget(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shareTarget]);

  const settingsLoading = enabled && settings.isLoading;

  return (
    <div className="page-landing landing-canvas">
      <div className="container-wide section-pad">
        <motion.header
          variants={stagger(0.1, 0.05)}
          initial="hidden"
          animate="show"
          className="max-w-2xl"
        >
          <motion.p variants={staggerItem}>
            <Link
              to="/ngl"
              className="inline-flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.18em] text-muted transition-colors hover:text-burgundy"
            >
              <span aria-hidden>&larr;</span> Kirim pesan anonim
            </Link>
          </motion.p>

          <motion.p
            variants={staggerItem}
            className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2"
          >
            <span aria-hidden className="h-px w-8 shrink-0 bg-burgundy sm:w-10" />
            <span className="text-[0.625rem] font-medium uppercase tracking-[0.2em] text-forest-soft sm:text-xs sm:tracking-[0.3em]">
              Craftly · Kotak pesan
            </span>
          </motion.p>

          <motion.h1
            variants={staggerItem}
            className="mt-6 font-pop text-[clamp(2.35rem,7.5vw,4.75rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-forest"
          >
            Kotak NGL<span className="text-burgundy">.</span>
          </motion.h1>

          <motion.p
            variants={staggerItem}
            className="mt-6 max-w-[34rem] text-[1.0625rem] leading-[1.65] text-forest-soft"
          >
            Semua pesan anonim masuk ke sini sebagai kartu warna-warni. Ketuk{' '}
            <span className="font-semibold text-forest">Bagikan</span> buat posting ke Instagram
            Story-mu 💌
          </motion.p>
        </motion.header>

        <div className="mt-12">
          {settingsLoading ? (
            <NglLoadingGrid />
          ) : settings.isError ? (
            <div className="border border-line bg-ivory">
              <EmptyState
                title="Gagal memuat fitur NGL"
                description={settings.error?.message}
                action={
                  <Button variant="outline" onClick={() => void settings.refetch()}>
                    Coba lagi
                  </Button>
                }
              />
            </div>
          ) : !settings.data?.enabled ? (
            <NglDisabled />
          ) : !user ? (
            <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-[2rem] border border-line bg-ivory-warm px-8 py-16 text-center">
              <span className="text-5xl" aria-hidden>
                🔒
              </span>
              <h2 className="mt-5 font-pop text-2xl font-extrabold text-forest">
                Kotak masih terkunci
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
                Login dulu sebagai anggota buat buka kotak dan baca semua pesan anonim yang masuk 🫢
              </p>
              <Link to="/login" className={cn(buttonClasses('burgundy', 'md'), 'mt-8')}>
                Masuk untuk membuka
              </Link>
            </div>
          ) : (
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
                <div>
                  <p className="eyebrow">Kotak pesan</p>
                  <p className="mt-1 text-sm text-muted">
                    {meta ? `${meta.total} pesan tersimpan` : 'Memuat pesan…'}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em]',
                    unread > 0 ? 'bg-burgundy text-ivory-warm' : 'bg-subtle text-muted',
                  )}
                >
                  {unread > 0 ? `${unread} pesan baru 🔥` : 'Semua terbaca ✅'}
                </span>
              </div>

              {inbox.isLoading ? (
                <NglLoadingGrid />
              ) : inbox.isError ? (
                <div className="border border-line bg-ivory-warm">
                  <EmptyState
                    title="Gagal memuat kotak"
                    description={inbox.error?.message}
                    action={
                      <Button variant="outline" onClick={() => void inbox.refetch()}>
                        Coba lagi
                      </Button>
                    }
                  />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center rounded-[2rem] border border-line bg-ivory-warm px-6 py-16 text-center">
                  <span className="text-5xl" aria-hidden>
                    📭
                  </span>
                  <h3 className="mt-5 font-pop text-2xl font-extrabold text-forest">
                    Kotak kamu masih kosong nih
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                    Belum ada yang kirim pesan anonim. Share link NGL kamu ke temen-temen biar rame
                    🔥
                  </p>
                  <Link to="/ngl" className={cn(buttonClasses('burgundy', 'lg'), 'mt-8')}>
                    Ambil link NGL kamu
                  </Link>
                </div>
              ) : (
                <>
                  <motion.div
                    variants={reduceMotion ? undefined : nglGridVariants}
                    initial={reduceMotion ? false : 'hidden'}
                    animate={reduceMotion ? false : 'show'}
                    className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
                  >
                    {messages.map((message, index) => (
                      <NglBoxCard
                        key={message.id}
                        message={message}
                        position={(meta?.page ? (meta.page - 1) * meta.limit : 0) + index + 1}
                        total={meta?.total ?? messages.length}
                        repostPending={shareTarget?.id === message.id}
                        onReveal={handleReveal}
                        onReport={setReportTarget}
                        onRepost={setShareTarget}
                      />
                    ))}
                  </motion.div>

                  {meta && meta.totalPages > 1 ? (
                    <nav
                      className="flex items-center justify-between gap-3 border-t border-line pt-6"
                      aria-label="Navigasi halaman kotak"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={meta.page <= 1}
                        onClick={() => setPage((value) => Math.max(1, value - 1))}
                      >
                        Halaman sebelumnya
                      </Button>
                      <span className="rounded-full bg-subtle px-3 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted">
                        Hal. {meta.page} / {meta.totalPages}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={meta.page >= meta.totalPages}
                        onClick={() => setPage((value) => Math.min(meta.totalPages, value + 1))}
                      >
                        Halaman berikutnya
                      </Button>
                    </nav>
                  ) : null}
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <NglReportDialog message={reportTarget} onClose={() => setReportTarget(null)} />

      {shareTarget ? (
        <div ref={shareRef} aria-hidden className="pointer-events-none fixed left-[-30000px] top-0">
          <NglShareTemplate message={shareTarget} theme={nglThemeFor(shareTarget.id)} />
        </div>
      ) : null}
    </div>
  );
}

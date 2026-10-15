import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button, buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMarkNglRead, useNglInbox } from '@/hooks/useNgl';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';
import type { NglMessage } from '@/types/api';
import { NglFlashcard } from './NglFlashcard';
import { NglReportDialog } from './NglReportDialog';
import { renderNglStory, shareNglStory } from './repost';

export function NglInbox() {
  const { user } = useAuth();
  const enabled = Boolean(user);
  const [page, setPage] = useState(1);
  const [index, setIndex] = useState(0);
  const [reportTarget, setReportTarget] = useState<NglMessage | null>(null);
  const [repostId, setRepostId] = useState<string | null>(null);
  const revealed = useRef(new Set<string>());

  const inbox = useNglInbox(page, enabled);
  const markRead = useMarkNglRead();

  const messages = inbox.data?.items ?? [];
  const meta = inbox.data?.meta;
  const unread = inbox.data?.unread ?? 0;
  const current = messages[Math.min(index, Math.max(0, messages.length - 1))] ?? null;

  useEffect(() => {
    setIndex(0);
  }, [page]);

  const handleReveal = (message: NglMessage) => {
    if (revealed.current.has(message.id)) return;
    revealed.current.add(message.id);
    markRead.mutate(message.id);
  };

  const handleRepost = async (message: NglMessage) => {
    setRepostId(message.id);
    try {
      const blob = await renderNglStory(message);
      const result = await shareNglStory(blob);
      if (result === 'downloaded') toast.success('Kartu cerita diunduh.');
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error('Gagal membuat kartu cerita.');
      }
    } finally {
      setRepostId(null);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-[30rem] flex-col items-center justify-center border border-line bg-ivory-warm px-8 py-16 text-center">
        <p className="eyebrow">Kotak pesan</p>
        <h2 className="mt-4 font-display text-2xl text-forest">Kotak masih terkunci</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
          Masuk sebagai anggota untuk membuka kotak dan membaca semua pesan anonim yang masuk.
        </p>
        <Link to="/login" className={cn(buttonClasses('burgundy', 'md'), 'mt-8')}>
          Masuk untuk membuka
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Kotak pesan</p>
          <h2 className="mt-1 font-display text-2xl text-forest">Kotak NGL</h2>
        </div>
        <span
          className={cn(
            'border px-3 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.18em]',
            unread > 0 ? 'border-burgundy/30 text-burgundy' : 'border-line text-muted',
          )}
        >
          {unread > 0 ? `${unread} baru` : 'Semua terbaca'}
        </span>
      </div>

      {inbox.isLoading ? (
        <Skeleton className="h-[30rem] w-full sm:h-[32rem]" />
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
        <div className="border border-line bg-ivory-warm">
          <EmptyState
            title="Belum ada pesan"
            description="Bagikan tautan halaman ini ke teman-temanmu untuk mulai menerima pesan anonim."
          />
        </div>
      ) : (
        <>
          {current ? (
            <NglFlashcard
              key={current.id}
              message={current}
              position={index + 1}
              total={messages.length}
              repostPending={repostId === current.id}
              onReveal={() => handleReveal(current)}
              onReport={setReportTarget}
              onRepost={(message) => void handleRepost(message)}
            />
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={index <= 0}
              onClick={() => setIndex((value) => Math.max(0, value - 1))}
            >
              Sebelumnya
            </Button>
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted">
              {index + 1} / {messages.length}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={index >= messages.length - 1}
              onClick={() => setIndex((value) => Math.min(messages.length - 1, value + 1))}
            >
              Berikutnya
            </Button>
          </div>

          {meta && meta.totalPages > 1 ? (
            <nav
              className="flex items-center justify-between gap-3 border-t border-line pt-4"
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
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted">
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

      <NglReportDialog message={reportTarget} onClose={() => setReportTarget(null)} />
    </div>
  );
}

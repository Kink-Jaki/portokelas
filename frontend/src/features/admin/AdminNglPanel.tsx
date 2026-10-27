import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button, buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/Modal';
import {
  useAdminDeleteNglMessage,
  useAdminNglMessages,
  useNglSettings,
  useToggleNglEnabled,
} from '@/hooks/useNgl';
import { assetUrl } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

export function AdminNglPanel() {
  const [page, setPage] = useState(1);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const settings = useNglSettings();
  const toggle = useToggleNglEnabled();
  const messagesQuery = useAdminNglMessages(page);
  const del = useAdminDeleteNglMessage();

  const messages = messagesQuery.data?.items ?? [];
  const meta = messagesQuery.data?.meta;
  const enabled = settings.data?.enabled ?? false;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-6 border border-line p-6">
        <div>
          <p className="eyebrow">Fitur NGL</p>
          <h2 className="font-display text-2xl">Status fitur</h2>
          <p className="mt-1 max-w-md text-sm text-muted">
            Saat aktif, siapa pun dapat mengirim pesan anonim. Saat nonaktif, halaman menampilkan
            pesan pengembangan.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted">
            {settings.isLoading ? 'memuat…' : enabled ? 'Aktif' : 'Nonaktif'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label="Aktifkan fitur NGL"
            disabled={settings.isLoading || toggle.isPending}
            onClick={() => toggle.mutate(!enabled)}
            className={`relative h-6 w-11 rounded-full border transition-colors duration-200 disabled:opacity-50 ${
              enabled ? 'border-fg bg-fg' : 'border-line-strong bg-subtle'
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full transition-transform duration-200 ${
                enabled ? 'translate-x-[1.4rem] bg-bg' : 'translate-x-0.5 bg-muted'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Moderasi</p>
          <h2 className="font-display text-2xl">Pesan NGL</h2>
          <p className="mt-1 text-sm text-muted">
            Tinjau pesan masuk. Pesan dengan tanda “disembunyikan” sudah otomatis tersaring.
          </p>
        </div>
        <Link to="/admin/ngl/reports" className={buttonClasses('outline', 'sm')}>
          Lihat laporan
        </Link>
      </div>

      {messagesQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-4 border border-line p-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : messagesQuery.isError ? (
        <div className="border border-line">
          <EmptyState
            title="Gagal memuat pesan"
            description={messagesQuery.error?.message}
            action={
              <Button variant="outline" onClick={() => void messagesQuery.refetch()}>
                Coba lagi
              </Button>
            }
          />
        </div>
      ) : messages.length === 0 ? (
        <div className="border border-line">
          <EmptyState title="Belum ada pesan" description="Belum ada pesan NGL yang masuk." />
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <article key={message.id} className="flex flex-wrap gap-4 border border-line p-4">
              {message.imagePath ? (
                <div className="h-20 w-20 shrink-0 overflow-hidden border border-line bg-subtle">
                  <img
                    src={assetUrl(message.imagePath) ?? ''}
                    alt="Lampiran NGL"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}

              <div className="min-w-0 flex-1 space-y-2">
                <p className="break-words text-sm leading-relaxed text-fg">
                  {message.content ?? <span className="text-muted">(pesan berisi lampiran)</span>}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {message.isHidden ? (
                    <span className="border border-line-strong px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-danger">
                      Disembunyikan
                    </span>
                  ) : null}
                  {message.spotify ? (
                    <span className="border border-line px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted">
                      Spotify · {message.spotify.type}
                    </span>
                  ) : null}
                  {message.imagePath ? (
                    <span className="border border-line px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted">
                      Foto
                    </span>
                  ) : null}
                  <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted">
                    Dibaca {message.readCount}× · Dilaporkan {message.reportCount}×
                  </span>
                </div>
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
                  {formatDateTime(message.createdAt)}
                </p>
              </div>

              <div className="flex items-start">
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={del.isPending && pendingDeleteId === message.id}
                  onClick={() => setPendingDeleteId(message.id)}
                >
                  Hapus
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 ? (
        <nav
          className="flex flex-wrap items-center justify-between gap-3"
          aria-label="Navigasi halaman NGL"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={meta.page <= 1}
          >
            Sebelumnya
          </Button>
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
            Halaman {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => Math.min(meta.totalPages, current + 1))}
            disabled={meta.page >= meta.totalPages}
          >
            Berikutnya
          </Button>
        </nav>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) del.mutate(pendingDeleteId);
          setPendingDeleteId(null);
        }}
        isLoading={del.isPending}
        title="Hapus pesan NGL?"
        description="Pesan ini akan dihapus permanen beserta lampirannya."
        confirmLabel="Hapus permanen"
      />
    </div>
  );
}

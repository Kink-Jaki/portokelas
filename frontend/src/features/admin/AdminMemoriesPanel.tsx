import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useAdminDeleteMemory, useAdminMemories } from '@/hooks/useApi';
import { assetUrl } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

export function AdminMemoriesPanel() {
  const { data, isLoading } = useAdminMemories();
  const del = useAdminDeleteMemory();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const memories = data?.memories ?? [];
  const pendingMemory = pendingDeleteId
    ? memories.find((m) => m.id === pendingDeleteId) ?? null
    : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Kenangan</p>
        <h2 className="font-display text-2xl">Manajemen kenangan anggota</h2>
        <p className="mt-1 text-sm text-muted">
          Semua foto kenangan anggota. Anda dapat menghapus kiriman yang tidak pantas.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-4 border border-line p-4">
              <Skeleton className="h-20 w-20 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : memories.length === 0 ? (
        <div className="border border-line">
          <EmptyState title="Belum ada kenangan" description="Belum ada kenangan." />
        </div>
      ) : (
        <div className="space-y-3">
          {memories.map((memory) => (
            <article
              key={memory.id}
              className="flex flex-wrap gap-4 border border-line p-4"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden border border-line bg-subtle">
                <img
                  src={assetUrl(memory.imageUrl) ?? ''}
                  alt={memory.caption ?? 'Kenangan'}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm leading-relaxed text-fg">
                  {memory.caption ?? 'Tanpa keterangan'}
                </p>
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
                  {formatDateTime(memory.createdAt)}
                </p>
                <p className="text-sm text-muted">
                  Oleh{' '}
                  {memory.author ? (
                    <Link
                      to={`/m/${memory.author.slug}`}
                      className="text-fg hover:text-accent"
                    >
                      {memory.author.alias ?? memory.author.name}
                    </Link>
                  ) : (
                    'Anggota dihapus'
                  )}
                </p>
              </div>
              <div className="flex items-start">
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={del.isPending && pendingDeleteId === memory.id}
                  onClick={() => setPendingDeleteId(memory.id)}
                >
                  Hapus
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) {
            del.mutate(pendingDeleteId);
          }
          setPendingDeleteId(null);
        }}
        isLoading={del.isPending}
        title="Hapus kenangan?"
        description={
          pendingMemory?.caption
            ? `Kiriman dengan caption “${pendingMemory.caption}” akan dihapus permanen.`
            : 'Kiriman ini akan dihapus permanen.'
        }
        confirmLabel="Hapus permanen"
      />
    </div>
  );
}

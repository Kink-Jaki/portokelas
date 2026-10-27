import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDeleteMemory, useMyMemories, useUploadMemory } from '@/hooks/useApi';
import { assetUrl } from '@/lib/api';
import { isSupportedImage } from '@/lib/image';
import { formatDate } from '@/lib/utils';

export function MemoriesPanel() {
  const { data, isLoading } = useMyMemories();
  const upload = useUploadMemory();
  const del = useDeleteMemory();

  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    if (file) {
      const url = URL.createObjectURL(file);
      previewUrlRef.current = url;
      setPreview(url);
    } else {
      setPreview(null);
    }
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, [file]);

  const memories = data?.memories ?? [];

  const validateFile = (f: File | null) => {
    if (!f) return 'Pilih file gambar untuk diunggah.';
    if (!isSupportedImage(f)) {
      return 'Format gambar harus JPG/PNG/WEBP.';
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const validation = validateFile(file);
    if (validation) {
      setError(validation);
      return;
    }
    if (!file) return;
    try {
      await upload.mutateAsync({ image: file, caption: caption || undefined });
      setCaption('');
      setFile(null);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengunggah kenangan.';
      setError(message);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[24rem_1fr]">
      <div className="border border-line p-6">
        <div className="space-y-1">
          <p className="eyebrow">Unggah kenangan</p>
          <h2 className="font-display text-xl">Tambah foto kenangan</h2>
          <p className="text-sm text-muted">
            JPG/PNG/WEBP, otomatis dikompres ke WEBP. Caption opsional (maks 280 karakter).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Gambar
            </label>
            {preview ? (
              <div className="aspect-[4/3] overflow-hidden border border-line bg-subtle">
                <img
                  src={preview}
                  alt="Pratinjau kenangan"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setError(null);
              }}
              className="block w-full text-sm file:mr-4 file:rounded-sm file:border file:border-line file:bg-bg file:px-3 file:py-1.5 file:text-sm file:transition-colors hover:file:border-line-strong"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value.slice(0, 280))}
              maxLength={280}
              placeholder="Ceritakan momen ini..."
              rows={3}
              className="w-full border border-line bg-bg px-3 py-2 text-sm placeholder:text-muted/70 focus:border-line-strong focus:outline-none focus:ring-1 focus:ring-line-strong"
            />
            <p className="text-right font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
              {caption.length}/280
            </p>
          </div>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <Button type="submit" isLoading={upload.isPending} disabled={!file || upload.isPending}>
            Unggah kenangan
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <div>
          <p className="eyebrow">Kenangan saya</p>
          <h2 className="font-display text-xl">Foto yang pernah diunggah</h2>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border border-line">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : memories.length === 0 ? (
          <div className="border border-line">
            <EmptyState
              title="Belum ada kenangan"
              description="Unggah foto pertama lewat form di samping."
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {memories.map((memory) => (
              <article key={memory.id} className="border border-line">
                <div className="aspect-[4/3] overflow-hidden bg-subtle">
                  <img
                    src={assetUrl(memory.imageUrl) ?? ''}
                    alt={memory.caption ?? 'Kenangan'}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <p className="text-sm leading-relaxed text-fg">
                      {memory.caption ?? 'Tanpa keterangan'}
                    </p>
                    <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
                      {formatDate(memory.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    isLoading={del.isPending}
                    onClick={() => del.mutate(memory.id)}
                  >
                    Hapus
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

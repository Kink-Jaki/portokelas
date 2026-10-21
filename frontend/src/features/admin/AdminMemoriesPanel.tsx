import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useAdminMemories, useAdminMemoryVideo, useUploadMemoryVideo, useDeleteMemoryVideo, useAdminDeleteMemory } from '@/hooks/useApi';
import { assetUrl } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

export function AdminMemoriesPanel() {
  const { data, isLoading } = useAdminMemories();
  const { data: videoData } = useAdminMemoryVideo();
  const del = useAdminDeleteMemory();
  const uploadVideo = useUploadMemoryVideo();
  const deleteVideo = useDeleteMemoryVideo();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      previewUrlRef.current = url;
      setVideoPreview(url);
    } else {
      setVideoPreview(null);
    }
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, [videoFile]);

  const validateVideoFile = (f: File | null) => {
    if (!f) return 'Pilih file video untuk diunggah.';
    const allowedTypes = ['video/mp4', 'video/webm'];
    if (!allowedTypes.includes(f.type)) {
      return 'Format video harus MP4 atau WEBM.';
    }
    return null;
  };

  const handleVideoSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const validation = validateVideoFile(videoFile);
    if (validation) {
      setError(validation);
      return;
    }
    if (!videoFile) return;
    try {
      await uploadVideo.mutateAsync({ video: videoFile, caption: caption.trim() || undefined });
      setCaption('');
      setVideoFile(null);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengunggah video kenangan.';
      setError(message);
    }
  };

  const handleDeleteVideo = () => {
    deleteVideo.mutate();
  };

  const memories = data?.memories ?? [];
  const pendingMemory = pendingDeleteId
    ? memories.find((m) => m.id === pendingDeleteId) ?? null
    : null;
  const currentVideo = videoData?.video ?? null;

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Kenangan</p>
        <h2 className="font-display text-2xl">Manajemen kenangan anggota</h2>
        <p className="mt-1 text-sm text-muted">
          Semua foto kenangan anggota. Anda dapat menghapus kiriman yang tidak pantas.
        </p>
      </div>

      {/* Video Kenangan Section */}
      <div className="border border-line p-6">
        <div className="space-y-1 mb-6">
          <p className="eyebrow">Video Kenangan</p>
          <h3 className="font-display text-xl">Video section Kenangan</h3>
          <p className="text-sm text-muted">
            Video ini ditampilkan di panel video section Kenangan di landing page. Hanya satu video yang bisa aktif.
            Format: MP4/WEBM (tanpa batas ukuran).
          </p>
        </div>

        {currentVideo ? (
          <div className="space-y-4">
            <div className="aspect-video w-full max-w-2xl overflow-hidden border border-line bg-subtle rounded-lg">
              <video
                src={assetUrl(currentVideo.videoUrl) ?? ''}
                controls
                className="w-full h-full object-cover"
              />
            </div>
            {currentVideo.caption && (
              <p className="text-sm text-muted">
                Caption: {currentVideo.caption}
              </p>
            )}
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteVideo.isPending}
              onClick={handleDeleteVideo}
            >
              Hapus video
            </Button>
          </div>
        ) : (
          <form onSubmit={handleVideoSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-[0.16em] text-muted">
                Video
              </label>
              {videoPreview ? (
                <div className="aspect-video w-full max-w-2xl overflow-hidden border border-line bg-subtle rounded-lg">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null}
              <input
                type="file"
                accept="video/mp4,video/webm"
                onChange={(event) => {
                  setVideoFile(event.target.files?.[0] ?? null);
                  setError(null);
                }}
                className="block w-full text-sm file:mr-4 file:rounded-sm file:border file:border-line file:bg-bg file:px-3 file:py-1.5 file:text-sm file:transition-colors hover:file:border-line-strong"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-[0.16em] text-muted">
                Caption (opsional)
              </label>
              <textarea
                value={caption}
                onChange={(event) => setCaption(event.target.value.slice(0, 280))}
                maxLength={280}
                placeholder="Keterangan video..."
                rows={2}
                className="w-full border border-line bg-bg px-3 py-2 text-sm placeholder:text-muted/70 focus:border-line-strong focus:outline-none focus:ring-1 focus:ring-line-strong"
              />
              <p className="text-right font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
                {caption.length}/280
              </p>
            </div>

            {error ? (
              <p className="text-sm text-danger">{error}</p>
            ) : null}

            <Button
              type="submit"
              isLoading={uploadVideo.isPending}
              disabled={!videoFile || uploadVideo.isPending}
            >
              Unggah video
            </Button>
          </form>
        )}
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

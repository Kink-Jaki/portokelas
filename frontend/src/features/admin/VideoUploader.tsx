import { useEffect, useRef, useState } from 'react';

import { VideoPlayer } from '@/components/domain/VideoPlayer';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useDeleteMemoryVideo } from '@/hooks/useApi';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import type { MemoryVideo } from '@/types/api';

type VideoUploaderProps = {
  current: MemoryVideo | null;
};

function formatMegabytes(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1);
}

/** Form unggah video kenangan dengan progress bar dan validasi lokal. */
export function VideoUploader({ current }: VideoUploaderProps) {
  const { upload, progress, isUploading, error } = useVideoUpload();
  const deleteVideo = useDeleteMemoryVideo();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [replacing, setReplacing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const previewUrlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const resetForm = () => {
    setFile(null);
    setCaption('');
    setLocalError(null);
    setReplacing(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setLocalError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    if (!file) {
      setLocalError('Pilih file video terlebih dahulu.');
      return;
    }

    try {
      await upload(file, caption);
      resetForm();
    } catch {
      // Pesan error sudah ditangani hook useVideoUpload.
    }
  };

  const handleDelete = () => {
    deleteVideo.mutate(undefined, {
      onSuccess: () => {
        setConfirmDelete(false);
        resetForm();
      },
    });
  };

  const showForm = !current || replacing;
  const message = localError ?? error;

  return (
    <div className="space-y-4">
      {current && !replacing ? (
        <>
          <div className="aspect-video w-full max-w-2xl overflow-hidden rounded-lg border border-line bg-subtle">
            <VideoPlayer src={current.videoUrl} />
          </div>
          {current.caption ? (
            <p className="text-sm text-muted">Caption: {current.caption}</p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={() => setReplacing(true)}>
              Ganti video
            </Button>
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
              Hapus video
            </Button>
          </div>
        </>
      ) : null}

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Video
            </label>

            {preview ? (
              <div className="aspect-video w-full max-w-2xl overflow-hidden rounded-lg border border-line bg-subtle">
                <VideoPlayer src={preview} label="Pratinjau video" />
              </div>
            ) : current ? (
              <div className="aspect-video w-full max-w-2xl overflow-hidden rounded-lg border border-line bg-subtle">
                <VideoPlayer src={current.videoUrl} />
              </div>
            ) : null}

            <input
              ref={inputRef}
              type="file"
              accept="video/mp4,video/webm"
              disabled={isUploading}
              onChange={handleFileChange}
              className="block w-full text-sm file:mr-4 file:rounded-sm file:border file:border-line file:bg-bg file:px-3 file:py-1.5 file:text-sm file:transition-colors hover:file:border-line-strong disabled:opacity-50"
            />
            <p className="text-xs leading-relaxed text-muted">
              MP4 atau WEBM, durasi maksimal 1 menit, ukuran maksimal 50 MB. File diunggah langsung
              ke Cloudflare R2 tanpa melewati server.
            </p>
            {file ? (
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
                {file.name} · {formatMegabytes(file.size)} MB
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Caption (opsional)
            </label>
            <textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value.slice(0, 280))}
              maxLength={280}
              disabled={isUploading}
              placeholder="Keterangan video..."
              rows={2}
              className="w-full border border-line bg-bg px-3 py-2 text-sm placeholder:text-muted/70 focus:border-line-strong focus:outline-none focus:ring-1 focus:ring-line-strong disabled:opacity-50"
            />
            <p className="text-right font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
              {caption.length}/280
            </p>
          </div>

          {isUploading ? (
            <div className="space-y-1.5">
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                aria-label="Progres unggah video"
                className="h-2 w-full overflow-hidden rounded-full bg-subtle"
              >
                <div
                  className="h-full bg-accent transition-[width] duration-200 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
                Mengunggah… {progress}%
              </p>
            </div>
          ) : null}

          {message ? (
            <p role="alert" className="text-sm text-danger">
              {message}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" isLoading={isUploading} disabled={!file || isUploading}>
              {current ? 'Simpan video baru' : 'Unggah video'}
            </Button>
            {replacing ? (
              <Button type="button" variant="ghost" disabled={isUploading} onClick={resetForm}>
                Batal
              </Button>
            ) : null}
          </div>
        </form>
      ) : null}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        isLoading={deleteVideo.isPending}
        title="Hapus video kenangan?"
        description="Video akan dihapus dari halaman landing dan penyimpanan R2 secara permanen."
        confirmLabel="Hapus permanen"
      />
    </div>
  );
}

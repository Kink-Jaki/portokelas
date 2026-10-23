import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import type { MemoryVideo, VideoUploadTicket } from '@/types/api';

/** Batas yang sama dengan policy presigned POST di backend. */
export const VIDEO_UPLOAD_MAX_BYTES = 50 * 1024 * 1024;
export const VIDEO_UPLOAD_MAX_DURATION_SECONDS = 60;

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'] as const;

function isAllowedVideoType(type: string): boolean {
  return (ALLOWED_VIDEO_TYPES as readonly string[]).includes(type);
}

function formatMegabytes(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1);
}

function validateVideoFile(file: File): string | null {
  if (file.size === 0) return 'File video kosong. Pilih file lain.';
  if (!isAllowedVideoType(file.type)) return 'Format video harus MP4 atau WEBM.';
  if (file.size > VIDEO_UPLOAD_MAX_BYTES) {
    return `Ukuran video maksimal 50 MB (file Anda ${formatMegabytes(file.size)} MB).`;
  }
  return null;
}

/** Baca durasi lewat elemen video sementara (metadata saja). */
function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    let settled = false;
    let timeoutId = 0;

    const finish = (action: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(objectUrl);
      action();
    };

    timeoutId = window.setTimeout(() => {
      finish(() => reject(new Error('Durasi video tidak dapat dibaca. Coba file lain.')));
    }, 15_000);

    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (Number.isFinite(duration) && duration > 0) {
        finish(() => resolve(duration));
        return;
      }
      finish(() => reject(new Error('Durasi video tidak dapat dibaca. Coba file lain.')));
    };
    video.onerror = () => {
      finish(() => reject(new Error('Video tidak dapat dibaca. Pastikan file MP4/WEBM valid.')));
    };

    video.src = objectUrl;
    video.load();
  });
}

/** POST multipart langsung ke R2 memakai policy dari presigned POST. */
function uploadToR2(
  ticket: VideoUploadTicket,
  file: File,
  onProgress: (progress: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    for (const [name, value] of Object.entries(ticket.fields)) {
      form.append(name, value);
    }
    form.append('file', file);

    const request = new XMLHttpRequest();
    request.open('POST', ticket.uploadUrl, true);
    request.timeout = ticket.expiresIn * 1000;

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total === 0) return;
      onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    };

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress(100);
        resolve();
        return;
      }

      if (request.status === 413) {
        reject(new Error('Ukuran video melebihi batas 50 MB yang diizinkan.'));
        return;
      }

      if (request.status === 403) {
        reject(new Error('Tautan unggah sudah kedaluwarsa. Silakan pilih file lagi.'));
        return;
      }

      reject(new Error(`Unggahan ke penyimpanan gagal (${request.status}). Coba lagi.`));
    };

    request.onerror = () => {
      reject(new Error('Koneksi terputus saat mengunggah video. Periksa jaringan lalu coba lagi.'));
    };
    request.ontimeout = () => {
      reject(new Error('Waktu unggah habis. Periksa koneksi lalu coba lagi.'));
    };
    request.onabort = () => {
      reject(new Error('Unggahan video dibatalkan.'));
    };

    request.send(form);
  });
}

export type UseVideoUploadResult = {
  upload: (file: File, caption?: string) => Promise<void>;
  progress: number;
  isUploading: boolean;
  error: string | null;
};

/**
 * Unggah video langsung dari browser ke Cloudflare R2:
 * validasi lokal → minta presigned POST → upload XHR (progress) → simpan URL.
 */
export function useVideoUpload(): UseVideoUploadResult {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File, caption?: string) => {
      setError(null);
      setProgress(0);

      const validation = validateVideoFile(file);
      if (validation) {
        setError(validation);
        throw new Error(validation);
      }

      setIsUploading(true);
      try {
        const duration = await readVideoDuration(file);
        if (duration > VIDEO_UPLOAD_MAX_DURATION_SECONDS + 0.5) {
          throw new Error(
            `Durasi video maksimal 1 menit (video Anda ${Math.ceil(duration)} detik).`,
          );
        }

        const ticket = await api.post<VideoUploadTicket>('/upload/video-url', {
          contentType: file.type,
        });

        await uploadToR2(ticket, file, setProgress);

        const trimmedCaption = caption?.trim();
        await api.post<{ video: MemoryVideo }>('/admin/memories/video/complete', {
          videoUrl: ticket.publicUrl,
          ...(trimmedCaption ? { caption: trimmedCaption } : {}),
        });

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.adminMemoryVideo }),
          queryClient.invalidateQueries({ queryKey: queryKeys.memoryVideo }),
        ]);
      } catch (cause) {
        const message =
          cause instanceof Error
            ? cause.message
            : 'Gagal mengunggah video. Periksa koneksi lalu coba lagi.';
        setError(message);
        throw cause;
      } finally {
        setIsUploading(false);
      }
    },
    [queryClient],
  );

  return { upload, progress, isUploading, error };
}

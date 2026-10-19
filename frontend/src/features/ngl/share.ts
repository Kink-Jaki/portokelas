type ShareNavigator = Navigator & {
  canShare?: (data: { files: File[] }) => boolean;
  share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
};

/**
 * Bagikan gambar kartu NGL lewat Web Share API (Instagram Story dsb.) bila
 * tersedia, jika tidak unduh sebagai file PNG. Melempar bila pengguna
 * membatalkan berbagi (AbortError) agar bisa diabaikan pemanggil.
 */
export async function shareNglImage(
  blob: Blob,
  filename = 'ngl-by-craftly.png',
): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], filename, { type: 'image/png' });
  const navigatorWithShare = navigator as ShareNavigator;

  if (
    typeof navigatorWithShare.share === 'function' &&
    navigatorWithShare.canShare?.({ files: [file] })
  ) {
    try {
      await navigatorWithShare.share({
        files: [file],
        title: 'NGL by Craftly',
        text: 'Pesan anonim untukmu 💌',
      });
      return 'shared';
    } catch (error) {
      if ((error as Error).name === 'AbortError') throw error;
      // Lanjut ke unduhan bila berbagi gagal karena alasan lain.
    }
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return 'downloaded';
}

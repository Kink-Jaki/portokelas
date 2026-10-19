import { toBlob } from 'html-to-image';

/**
 * Render sebuah node DOM (template share off-screen) menjadi PNG.
 * Mencoba beberapa strategi berurutan: normal → tanpa gambar (kalau gambar
 * lintas-origin gagal di-embed) → tanpa font hasil embed. Melempar error
 * terakhir bila semuanya gagal.
 */
export async function captureNglShareNode(
  node: HTMLElement,
  width: number,
  height: number,
): Promise<Blob> {
  const base = { width, height, pixelRatio: 2, cacheBust: true } as const;
  const attempts = [
    base,
    { ...base, filter: (domNode: HTMLElement) => domNode.tagName !== 'IMG' },
    {
      ...base,
      skipFonts: true,
      filter: (domNode: HTMLElement) => domNode.tagName !== 'IMG',
    },
  ];

  let lastError: unknown;
  for (const options of attempts) {
    try {
      const blob = await toBlob(node, options);
      if (blob) return blob;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Gagal membuat gambar kartu NGL.');
}

export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type CropRect = { x: number; y: number; width: number; height: number };

/** Cek apakah file bertipe gambar yang didukung. */
export function isSupportedImage(file: File): boolean {
  return (SUPPORTED_IMAGE_TYPES as readonly string[]).includes(file.type);
}

function webpName(name: string): string {
  const base = name.replace(/\.[^.]+$/, '').trim() || 'image';
  return `${base}.webp`;
}

/** Muat file gambar menjadi HTMLImageElement (object URL dibersihkan otomatis). */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Gagal membaca gambar.'));
    };
    image.src = url;
  });
}

function encodeWebp(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Gagal mengubah gambar ke WEBP.'))),
      'image/webp',
      quality,
    );
  });
}

type ConvertOptions = {
  /** Sisi terpanjang maksimal dalam piksel. */
  maxSize?: number;
  /** Kualitas WEBP 0-1. */
  quality?: number;
};

/** Potong gambar sesuai kotak lalu konversi ke WEBP berukuran persegi. */
export async function cropImageToWebp(
  file: File,
  crop: CropRect,
  { outputSize = 512, quality = 0.9 }: { outputSize?: number; quality?: number } = {},
): Promise<File> {
  const image = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas tidak tersedia di peramban ini.');

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, outputSize, outputSize);

  const blob = await encodeWebp(canvas, quality);
  return new File([blob], webpName(file.name), { type: 'image/webp' });
}

/**
 * Konversi gambar ke WEBP dan perkecil bila perlu. Bila konversi gagal
 * (mis. format tak didukung), file asli dikembalikan agar unggahan tetap jalan.
 */
export async function convertImageToWebp(
  file: File,
  { maxSize = 1600, quality = 0.82 }: ConvertOptions = {},
): Promise<File> {
  if (!isSupportedImage(file)) return file;

  try {
    const image = await loadImage(file);
    const longest = Math.max(image.naturalWidth, image.naturalHeight);
    if (!longest) return file;

    const scale = longest > maxSize ? maxSize / longest : 1;
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) return file;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, width, height);

    const blob = await encodeWebp(canvas, quality);
    return new File([blob], webpName(file.name), { type: 'image/webp' });
  } catch {
    return file;
  }
}

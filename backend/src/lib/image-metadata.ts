/**
 * Penghapus metadata gambar (EXIF/XMP/komentar) tanpa dependensi native —
 * aman dipakai di Bun maupun Cloudflare Workers.
 *
 * Foto kiriman pengguna (mis. dari kamera HP) kerap memuat GPS, model
 * perangkat, dan tanggal pengambilan. Sebelum disimpan, seluruh penanda itu
 * dibuang di sini. Untuk WEBP, flag pada chunk VP8X ikut dibersihkan.
 */

const JPEG_MARKER_SOI = 0xd8;
const JPEG_MARKER_SOS = 0xda;
const JPEG_MARKER_EOI = 0xd9;

function concatChunks(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/** Apakah marker JPEG bersifat standalone (tanpa field panjang). */
function isStandaloneMarker(marker: number): boolean {
  return marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7);
}

/** Buang APP1 (EXIF/XMP), APP13 (Photoshop IRB), dan komentar dari JPEG. */
function stripJpeg(bytes: Uint8Array): Uint8Array {
  const chunks: Uint8Array[] = [bytes.subarray(0, 2)];
  let index = 2;

  while (index < bytes.length) {
    if (bytes[index] !== 0xff || index + 1 >= bytes.length) {
      chunks.push(bytes.subarray(index));
      break;
    }

    const marker = bytes[index + 1] ?? 0;

    if (marker === JPEG_MARKER_SOS) {
      chunks.push(bytes.subarray(index));
      break;
    }

    if (marker === JPEG_MARKER_EOI) {
      chunks.push(bytes.subarray(index, index + 2));
      break;
    }

    if (isStandaloneMarker(marker)) {
      chunks.push(bytes.subarray(index, index + 2));
      index += 2;
      continue;
    }

    if (index + 3 >= bytes.length) {
      chunks.push(bytes.subarray(index));
      break;
    }

    const segmentLength = (bytes[index + 2]! << 8) | bytes[index + 3]!;
    if (segmentLength < 2) {
      // Segmen rusak — hentikan dan salin sisanya apa adanya.
      chunks.push(bytes.subarray(index));
      break;
    }

    const segmentEnd = index + 2 + segmentLength;
    const isMetadata = marker === 0xe1 || marker === 0xed || marker === 0xfe;
    if (!isMetadata) chunks.push(bytes.subarray(index, Math.min(segmentEnd, bytes.length)));

    index = segmentEnd;
  }

  return concatChunks(chunks);
}

/** Buang chunk metadata teks/waktu dari PNG (eXIf, tEXt, iTXt, zTXt, tIME). */
function stripPng(bytes: Uint8Array): Uint8Array {
  const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const STRIP = new Set(['eXIf', 'tEXt', 'iTXt', 'zTXt', 'tIME']);

  const chunks: Uint8Array[] = [bytes.subarray(0, 8)];
  let index = 8;

  while (index + 8 <= bytes.length) {
    const length =
      ((bytes[index]! << 24) |
        (bytes[index + 1]! << 16) |
        (bytes[index + 2]! << 8) |
        bytes[index + 3]!) >>>
      0;
    const type = String.fromCharCode(
      bytes[index + 4]!,
      bytes[index + 5]!,
      bytes[index + 6]!,
      bytes[index + 7]!,
    );
    const chunkEnd = index + 12 + length;
    if (chunkEnd > bytes.length) {
      chunks.push(bytes.subarray(index));
      break;
    }

    if (!STRIP.has(type)) chunks.push(bytes.subarray(index, chunkEnd));

    index = chunkEnd;
    if (type === 'IEND') break;
  }

  if (index < bytes.length) chunks.push(bytes.subarray(index));

  void PNG_SIGNATURE;
  return concatChunks(chunks);
}

/** Buang chunk EXIF/XMP dari WEBP dan bersihkan flag terkait di VP8X. */
function stripWebp(bytes: Uint8Array): Uint8Array {
  const STRIP = new Set(['EXIF', 'XMP ']);
  const chunks: Uint8Array[] = [bytes.subarray(0, 12)];
  let index = 12;

  while (index + 8 <= bytes.length) {
    const fourcc = String.fromCharCode(
      bytes[index]!,
      bytes[index + 1]!,
      bytes[index + 2]!,
      bytes[index + 3]!,
    );
    const size =
      (bytes[index + 4]! |
        (bytes[index + 5]! << 8) |
        (bytes[index + 6]! << 16) |
        (bytes[index + 7]! << 24)) >>>
      0;
    const paddedSize = size + (size % 2);
    const chunkEnd = index + 8 + paddedSize;
    if (chunkEnd > bytes.length) {
      chunks.push(bytes.subarray(index));
      break;
    }

    if (!STRIP.has(fourcc)) {
      const chunk = bytes.subarray(index, chunkEnd).slice();
      if (fourcc === 'VP8X' && chunk.length >= 9) {
        // Bersihkan bit EXIF (0x08) & XMP (0x04) pada byte flag.
        chunk[8] = (chunk[8] ?? 0) & ~0x0c;
      }
      chunks.push(chunk);
    }

    index = chunkEnd;
  }

  if (index < bytes.length) chunks.push(bytes.subarray(index));

  const result = concatChunks(chunks);
  // Perbaiki ukuran RIFF (total - 8 byte header "RIFF"+size).
  const riffSize = result.length - 8;
  result[4] = riffSize & 0xff;
  result[5] = (riffSize >>> 8) & 0xff;
  result[6] = (riffSize >>> 16) & 0xff;
  result[7] = (riffSize >>> 24) & 0xff;
  return result;
}

/**
 * Hapus metadata dari gambar berdasarkan MIME yang sudah dideteksi.
 * Bila format tidak dikenali, byte asli dikembalikan tanpa perubahan.
 */
export function stripImageMetadata(bytes: Uint8Array, mime: string): Uint8Array {
  try {
    if (mime === 'image/jpeg' && bytes[0] === 0xff && bytes[1] === JPEG_MARKER_SOI) {
      return stripJpeg(bytes);
    }
    if (mime === 'image/png') return stripPng(bytes);
    if (mime === 'image/webp') return stripWebp(bytes);
  } catch {
    return bytes;
  }
  return bytes;
}

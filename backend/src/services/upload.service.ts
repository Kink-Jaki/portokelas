import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { env } from '../env.js';
import { AppError } from '../lib/errors.js';

export type UploadKind = 'avatars' | 'projects' | 'content';

const ALLOWED_MIME = new Map<string, string>([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

export const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR);

/** `serveStatic` hanya menerima path relatif terhadap cwd proses. */
export const uploadRootRelative = path.relative(process.cwd(), uploadRoot) || '.';

/** Deteksi tipe file asli lewat magic bytes (bukan ekstensi/header kiriman). */
export function detectImageMime(bytes: Uint8Array): string | null {
  // JPEG: FF D8 FF
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }

  // WEBP: "RIFF" .... "WEBP"
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }

  return null;
}

function assertUploadShape(file: File): void {
  const maxMb = env.MAX_UPLOAD_SIZE_MB;
  if (file.size > env.maxUploadBytes) {
    throw AppError.badRequest(
      `Ukuran file maksimal ${maxMb}MB (file Anda ${(file.size / 1024 / 1024).toFixed(2)}MB).`,
    );
  }
  if (file.size === 0) {
    throw AppError.badRequest('File kosong.');
  }
  const genericTypes = new Set(['', 'application/octet-stream', 'binary/octet-stream']);
  if (!ALLOWED_MIME.has(file.type) && !genericTypes.has(file.type.toLowerCase())) {
    throw AppError.badRequest('Format file harus JPG, PNG, atau WEBP.');
  }
}

/**
 * Simpan file gambar di storage lokal server dengan nama acak (uuid).
 * Mengembalikan path relatif yang bisa langsung dipakai sebagai URL publik.
 */
export async function saveImage(file: File, kind: UploadKind): Promise<string> {
  assertUploadShape(file);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const header = bytes.subarray(0, 16);
  const realMime = detectImageMime(header);

  if (!realMime) {
    throw AppError.badRequest('Isi file bukan gambar JPG/PNG/WEBP yang valid.');
  }

  const declaredMime = file.type.toLowerCase();
  if (
    ALLOWED_MIME.has(declaredMime) &&
    declaredMime !== realMime &&
    !(declaredMime === 'image/jpg' && realMime === 'image/jpeg')
  ) {
    throw AppError.badRequest(
      `Tipe file tidak cocok dengan isinya (kiriman: ${file.type}, isi: ${realMime}).`,
    );
  }

  const extension = ALLOWED_MIME.get(realMime);
  if (!extension) throw AppError.badRequest('Format file tidak didukung.');

  const relativeDir = kind;
  const directory = path.join(uploadRoot, relativeDir);
  await mkdir(directory, { recursive: true });

  const fileName = `${crypto.randomUUID()}.${extension}`;
  const absolutePath = path.join(directory, fileName);

  await writeFile(absolutePath, bytes, { flag: 'wx' });

  return `/uploads/${relativeDir}/${fileName}`;
}

/**
 * Normalisasi nilai gambar yang disimpan di database menjadi path relatif
 * (`/uploads/...`). Menerima path relatif maupun URL absolut.
 */
export function normalizeStoredImage(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  let pathPart = trimmed;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      pathPart = new URL(trimmed).pathname;
    } catch {
      return null;
    }
  }

  return pathPart.startsWith('/uploads/') ? pathPart : null;
}

/** Hapus file upload berdasarkan path tersimpan. Aman terhadap path traversal. */
export async function deleteStoredFile(storedPath: string | null | undefined): Promise<void> {
  const normalized = storedPath ? normalizeStoredImage(storedPath) : null;
  if (!normalized) return;

  const relative = normalized.replace(/^\/uploads\//, '');
  const target = path.resolve(uploadRoot, relative);
  const root = uploadRoot.endsWith(path.sep) ? uploadRoot : uploadRoot + path.sep;

  if (!target.startsWith(root)) return;

  try {
    await unlink(target);
  } catch {
    // File sudah tidak ada — abaikan.
  }
}

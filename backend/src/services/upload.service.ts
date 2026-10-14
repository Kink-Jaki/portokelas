import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { env } from '../env.js';
import { AppError } from '../lib/errors.js';
import { getBindings, type KVNamespaceBinding, type R2BucketBinding } from '../runtime.js';

export type UploadKind = 'avatars' | 'projects' | 'content' | 'memories';

const CACHE_CONTROL = 'public, max-age=31536000, immutable';

const ALLOWED_MIME = new Map<string, string>([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

/** Binding R2 bila tersedia (produksi); null untuk penyimpanan lokal. */
function getBucket(): R2BucketBinding | null {
  return getBindings()?.UPLOADS_BUCKET ?? null;
}

/** Binding Workers KV bila tersedia (alternatif R2). */
function getKv(): KVNamespaceBinding | null {
  return getBindings()?.UPLOADS_KV ?? null;
}

/** Content type dari ekstensi key objek (mis. `projects/<uuid>.png`). */
function mimeFromKey(key: string): string {
  const extension = key.split('.').pop()?.toLowerCase() ?? '';
  return MIME_BY_EXTENSION[extension] ?? 'application/octet-stream';
}

function uploadRoot(): string {
  return path.resolve(process.cwd(), env.UPLOAD_DIR);
}

/** Resolve path relatif di dalam folder upload; null bila keluar folder (traversal). */
function resolveWithinRoot(relative: string): string | null {
  const root = uploadRoot();
  const target = path.resolve(root, relative);
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  return target.startsWith(rootWithSep) ? target : null;
}

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

function assertUploadShape(file: File, maxBytes: number): void {
  if (file.size > maxBytes) {
    throw AppError.badRequest(
      `Ukuran file maksimal ${Math.round(maxBytes / 1024 / 1024)}MB (file Anda ${(file.size / 1024 / 1024).toFixed(2)}MB).`,
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

/** Batas unggahan foto profil yang lebih longgar (foto langsung dari kamera/HP). */
export const AVATAR_MAX_BYTES = 20 * 1024 * 1024;

/**
 * Simpan file gambar (R2 bila tersedia, jika tidak ke disk lokal) dengan nama
 * acak. Mengembalikan path relatif `/uploads/...` yang siap dipakai sebagai URL.
 * `options.maxBytes` menimpa batas ukuran default untuk unggahan tertentu.
 */
export async function saveImage(
  file: File,
  kind: UploadKind,
  options: { maxBytes?: number } = {},
): Promise<string> {
  assertUploadShape(file, options.maxBytes ?? env.maxUploadBytes);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const realMime = detectImageMime(bytes.subarray(0, 16));

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

  const key = `${kind}/${crypto.randomUUID()}.${extension}`;
  const bucket = getBucket();
  const kv = getKv();

  if (bucket) {
    await bucket.put(key, bytes, {
      httpMetadata: { contentType: realMime, cacheControl: CACHE_CONTROL },
    });
  } else if (kv) {
    await kv.put(key, bytes);
  } else {
    const absolutePath = resolveWithinRoot(key);
    if (!absolutePath) throw AppError.internal('Path unggahan tidak valid.');
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, bytes, { flag: 'wx' });
  }

  return `/uploads/${key}`;
}

export type StoredUpload = {
  body: ReadableStream | Uint8Array;
  contentType: string;
};

/** Baca objek unggahan berdasarkan path tersimpan (`/uploads/...`). */
export async function readUpload(storedPath: string): Promise<StoredUpload | null> {
  const normalized = normalizeStoredImage(storedPath);
  if (!normalized) return null;

  const key = normalized.replace(/^\/uploads\//, '');
  const bucket = getBucket();
  const kv = getKv();

  if (bucket) {
    const object = await bucket.get(key);
    if (!object) return null;
    return {
      body: object.body,
      contentType: object.httpMetadata?.contentType ?? 'application/octet-stream',
    };
  }

  if (kv) {
    const arrayBuffer = await kv.get(key, { type: 'arrayBuffer' });
    if (!arrayBuffer) return null;
    return {
      body: new Uint8Array(arrayBuffer),
      contentType: mimeFromKey(key),
    };
  }

  const absolutePath = resolveWithinRoot(key);
  if (!absolutePath) return null;

  try {
    const data = await readFile(absolutePath);
    const extension = path.extname(absolutePath).slice(1).toLowerCase();
    return {
      body: new Uint8Array(data),
      contentType: MIME_BY_EXTENSION[extension] ?? 'application/octet-stream',
    };
  } catch {
    return null;
  }
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

  const key = normalized.replace(/^\/uploads\//, '');
  const bucket = getBucket();
  const kv = getKv();

  if (bucket) {
    await bucket.delete(key).catch(() => undefined);
    return;
  }

  if (kv) {
    await kv.delete(key).catch(() => undefined);
    return;
  }

  const absolutePath = resolveWithinRoot(key);
  if (!absolutePath) return;

  try {
    await unlink(absolutePath);
  } catch {
    // File sudah tidak ada — abaikan.
  }
}

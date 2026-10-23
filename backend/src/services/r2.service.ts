import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost, type PresignedPostOptions } from '@aws-sdk/s3-presigned-post';

import { env } from '../env.js';
import { AppError } from '../lib/errors.js';
import type { VideoContentType } from '../validators/upload.js';

/** Batas ukuran video kenangan — juga dienforce oleh policy R2. */
export const VIDEO_UPLOAD_MAX_BYTES = 50 * 1024 * 1024;

/** Masa berlaku presigned POST (5 menit). */
export const VIDEO_UPLOAD_EXPIRES_SECONDS = 5 * 60;

const VIDEO_EXTENSION: Record<VideoContentType, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};

/** Key yang valid hanya dibuat oleh endpoint presign kita. */
const VIDEO_KEY_PATTERN =
  /^videos\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(mp4|webm)$/i;

export type VideoUploadTicket = {
  uploadUrl: string;
  publicUrl: string;
  fields: Record<string, string>;
  expiresIn: number;
};

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
};

let cachedClient: S3Client | null = null;
let cachedClientKey = '';

/** Baca konfigurasi R2 dari environment; error jelas bila belum lengkap. */
function getR2Config(): R2Config {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } = env;

  const missing: string[] = [];
  if (!R2_ACCOUNT_ID) missing.push('R2_ACCOUNT_ID');
  if (!R2_ACCESS_KEY_ID) missing.push('R2_ACCESS_KEY_ID');
  if (!R2_SECRET_ACCESS_KEY) missing.push('R2_SECRET_ACCESS_KEY');
  if (!R2_BUCKET) missing.push('R2_BUCKET');
  if (!R2_PUBLIC_URL) missing.push('R2_PUBLIC_URL');

  if (
    missing.length > 0 ||
    !R2_ACCOUNT_ID ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_BUCKET ||
    !R2_PUBLIC_URL
  ) {
    throw AppError.serviceUnavailable(
      `Unggah video belum dikonfigurasi. Variabel environment yang kurang: ${missing.join(', ')}.`,
    );
  }

  return {
    accountId: R2_ACCOUNT_ID,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    bucket: R2_BUCKET,
    publicUrl: R2_PUBLIC_URL,
  };
}

function getS3Client(config: R2Config): S3Client {
  const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`;
  const key = `${endpoint}::${config.bucket}::${config.accessKeyId}`;

  if (cachedClient && cachedClientKey === key) return cachedClient;

  cachedClient = new S3Client({
    region: 'auto',
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  cachedClientKey = key;
  return cachedClient;
}

function publicBaseUrl(raw: string): URL {
  try {
    return new URL(raw);
  } catch {
    throw AppError.serviceUnavailable('R2_PUBLIC_URL tidak valid.');
  }
}

function buildPublicUrl(base: string, key: string): string {
  return `${base.replace(/\/+$/, '')}/${key}`;
}

/**
 * Validasi bahwa URL benar-benar berada di `R2_PUBLIC_URL` milik kita dan
 * memakai key video yang kita buat. Mengembalikan key objek R2.
 */
export function assertOwnedVideoUrl(value: string): { key: string; publicUrl: string } {
  const config = getR2Config();
  const base = publicBaseUrl(config.publicUrl);

  let candidate: URL;
  try {
    candidate = new URL(value);
  } catch {
    throw AppError.badRequest('URL video tidak valid.');
  }

  if (candidate.origin !== base.origin) {
    throw AppError.badRequest('URL video harus berasal dari penyimpanan R2 kami.');
  }

  const basePath = base.pathname.replace(/\/+$/, '');
  const prefix = `${basePath}/`;
  if (!candidate.pathname.startsWith(prefix)) {
    throw AppError.badRequest('URL video harus berasal dari folder video kami.');
  }

  let key: string;
  try {
    key = decodeURIComponent(candidate.pathname.slice(prefix.length));
  } catch {
    throw AppError.badRequest('URL video tidak valid.');
  }

  if (!VIDEO_KEY_PATTERN.test(key)) {
    throw AppError.badRequest('URL video tidak sesuai format yang diizinkan.');
  }

  return { key, publicUrl: buildPublicUrl(config.publicUrl, key) };
}

/** Buat presigned POST; ukuran file dibatasi oleh policy R2. */
export async function createVideoUploadTicket(
  contentType: VideoContentType,
): Promise<VideoUploadTicket> {
  const config = getR2Config();
  const client = getS3Client(config);
  const key = `videos/${crypto.randomUUID()}.${VIDEO_EXTENSION[contentType]}`;

  // Opsi `Key` dan `Fields.Content-Type` otomatis menjadi kondisi exact-match;
  // tambahkan content-length-range agar ukuran ditegakkan oleh R2.
  const conditions: PresignedPostOptions['Conditions'] = [
    ['content-length-range', 1, VIDEO_UPLOAD_MAX_BYTES],
  ];

  const { url, fields } = await createPresignedPost(client, {
    Bucket: config.bucket,
    Key: key,
    Expires: VIDEO_UPLOAD_EXPIRES_SECONDS,
    Fields: { 'Content-Type': contentType },
    Conditions: conditions,
  });

  return {
    uploadUrl: url,
    publicUrl: buildPublicUrl(config.publicUrl, key),
    fields,
    expiresIn: VIDEO_UPLOAD_EXPIRES_SECONDS,
  };
}

/** Hapus objek R2 berdasarkan public URL; abaikan bila bukan milik kita. */
export async function deleteVideoFromR2(value: string | null | undefined): Promise<void> {
  if (!value) return;

  let key: string;
  try {
    key = assertOwnedVideoUrl(value).key;
  } catch {
    return;
  }

  try {
    const config = getR2Config();
    await getS3Client(config).send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
  } catch (error) {
    console.error('[r2] Gagal menghapus video lama:', error);
  }
}

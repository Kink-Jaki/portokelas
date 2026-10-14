/**
 * Hashing password memakai Web Crypto (PBKDF2-SHA256) agar berjalan baik di
 * runtime Bun maupun Cloudflare Workers (tanpa API spesifik Bun).
 *
 * Format tersimpan: `pbkdf2-sha256$<iterations>$<saltB64>$<hashB64>`.
 * Password tidak pernah disimpan atau dikirim dalam bentuk plaintext.
 */

const ALGORITHM = 'pbkdf2-sha256';
const ITERATIONS = 100_000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function deriveKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    KEY_LENGTH * 8,
  );

  return new Uint8Array(bits);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= (a[index] ?? 0) ^ (b[index] ?? 0);
  }
  return diff === 0;
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const hash = await deriveKey(plain, salt, ITERATIONS);
  return `${ALGORITHM}$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  try {
    const parts = stored.split('$');
    if (parts.length !== 4 || parts[0] !== ALGORITHM) return false;

    const iterations = Number(parts[1]);
    if (!Number.isInteger(iterations) || iterations <= 0) return false;

    const salt = fromBase64(parts[2] ?? '');
    const expected = fromBase64(parts[3] ?? '');
    const actual = await deriveKey(plain, salt, iterations);

    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

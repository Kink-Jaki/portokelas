/**
 * Hashing password memakai API bawaan Bun (`Bun.password`) — argon2id.
 * Password tidak pernah disimpan atau dikirim dalam bentuk plaintext.
 */

export function hashPassword(plain: string): Promise<string> {
  return Bun.password.hash(plain, {
    algorithm: 'argon2id',
    memoryCost: 65_536,
    timeCost: 3,
  });
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await Bun.password.verify(plain, hash);
  } catch {
    return false;
  }
}

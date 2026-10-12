import { eq } from 'drizzle-orm';

import { db } from '../db/index.js';
import { memberProfileColumns, users, type MemberProfile } from '../db/schema.js';
import { AppError } from '../lib/errors.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { signSession } from '../lib/jwt.js';
import type { LoginInput, RegisterInput } from '../validators/auth.js';
import type { UpdateEmailInput, UpdatePasswordInput } from '../validators/user.js';
import {
  emailTaken,
  findUserByEmail,
  findUserById,
  findUserByNim,
  generateUniqueSlug,
} from './user.service.js';

export type AuthResult = {
  token: string;
  user: MemberProfile;
};

export async function registerMember(input: RegisterInput): Promise<AuthResult> {
  const email = input.email.toLowerCase();

  if (await emailTaken(email)) {
    throw AppError.conflict('Email sudah terdaftar. Gunakan email lain atau masuk.');
  }

  const [passwordHash, slug] = await Promise.all([
    hashPassword(input.password),
    generateUniqueSlug(input.name),
  ]);

  const rows = await db
    .insert(users)
    .values({
      name: input.name,
      email,
      passwordHash,
      slug,
      role: 'member',
    })
    .returning(memberProfileColumns);

  const user = rows[0];
  if (!user) throw AppError.internal('Gagal membuat akun');

  const token = await signSession({
    sub: user.id,
    role: user.role,
    name: user.name,
    slug: user.slug,
  });

  return { token, user };
}

export async function loginMember(input: LoginInput): Promise<AuthResult> {
  const identity = input.identity.trim();
  const user = /^\d+$/.test(identity)
    ? await findUserByNim(identity)
    : await findUserByEmail(identity);

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'NIS/email atau password salah.');
  }

  const profile = await findUserById(user.id);
  if (!profile) throw AppError.unauthorized();

  const token = await signSession({
    sub: profile.id,
    role: profile.role,
    name: profile.name,
    slug: profile.slug,
  });

  return { token, user: profile };
}

export async function getProfile(id: string): Promise<MemberProfile | null> {
  const rows = await db.select(memberProfileColumns).from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

/** Ganti email akun setelah memverifikasi password saat ini. */
export async function changeUserEmail(
  userId: string,
  input: UpdateEmailInput,
): Promise<MemberProfile> {
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = rows[0];
  if (!user) throw AppError.unauthorized();

  if (!(await verifyPassword(input.password, user.passwordHash))) {
    throw new AppError(400, 'INVALID_PASSWORD', 'Password salah.');
  }

  const email = input.email.toLowerCase();
  if (email === user.email) {
    throw AppError.conflict('Email baru sama dengan email saat ini.');
  }

  const existing = await findUserByEmail(email);
  if (existing && existing.id !== userId) {
    throw AppError.conflict('Email sudah terdaftar. Gunakan email lain.');
  }

  const updated = await db
    .update(users)
    .set({ email, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning(memberProfileColumns);

  const profile = updated[0];
  if (!profile) throw AppError.internal('Gagal memperbarui email');
  return profile;
}

/** Ganti password akun setelah memverifikasi password saat ini. */
export async function changeUserPassword(
  userId: string,
  input: UpdatePasswordInput,
): Promise<void> {
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = rows[0];
  if (!user) throw AppError.unauthorized();

  if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
    throw new AppError(400, 'INVALID_PASSWORD', 'Password saat ini salah.');
  }

  const passwordHash = await hashPassword(input.newPassword);

  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

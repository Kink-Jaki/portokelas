import { eq } from 'drizzle-orm';

import { db } from '../db/index.js';
import { memberProfileColumns, users, type MemberProfile } from '../db/schema.js';
import { AppError } from '../lib/errors.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { signSession } from '../lib/jwt.js';
import type { LoginInput, RegisterInput } from '../validators/auth.js';
import {
  emailTaken,
  findUserByEmail,
  findUserById,
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
      status: 'pending',
    })
    .returning(memberProfileColumns);

  const user = rows[0];
  if (!user) throw AppError.internal('Gagal membuat akun');

  const token = await signSession({
    sub: user.id,
    role: user.role,
    status: user.status,
    name: user.name,
    slug: user.slug,
  });

  return { token, user };
}

export async function loginMember(input: LoginInput): Promise<AuthResult> {
  const user = await findUserByEmail(input.identity);

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email atau password salah.');
  }

  if (user.status === 'rejected') {
    throw new AppError(
      403,
      'ACCOUNT_REJECTED',
      user.rejectionReason ?? 'Pendaftaran Anda ditolak oleh admin.',
      { status: user.status, reason: user.rejectionReason },
    );
  }

  if (user.status === 'suspended') {
    throw new AppError(403, 'ACCOUNT_SUSPENDED', 'Akun Anda dinonaktifkan oleh admin.', {
      status: user.status,
    });
  }

  const profile = await findUserById(user.id);
  if (!profile) throw AppError.unauthorized();

  const token = await signSession({
    sub: profile.id,
    role: profile.role,
    status: profile.status,
    name: profile.name,
    slug: profile.slug,
  });

  return { token, user: profile };
}

export async function getProfile(id: string): Promise<MemberProfile | null> {
  const rows = await db.select(memberProfileColumns).from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

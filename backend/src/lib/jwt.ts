import { sign, verify } from 'hono/jwt';

import { env } from '../env.js';
import type { UserRole, UserStatus } from '../db/schema.js';

const ALG = 'HS256' as const;

export type SessionPayload = {
  sub: string;
  role: UserRole;
  status: UserStatus;
  name: string;
  slug: string;
  exp: number;
};

export async function signSession(payload: {
  sub: string;
  role: UserRole;
  status: UserStatus;
  name: string;
  slug: string;
}): Promise<string> {
  return sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + env.sessionMaxAge,
      iat: Math.floor(Date.now() / 1000),
    },
    env.JWT_SECRET,
    ALG,
  );
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const decoded = await verify(token, env.JWT_SECRET, ALG);
    if (typeof decoded === 'string') return null;
    if (typeof decoded.sub !== 'string') return null;
    return decoded as unknown as SessionPayload;
  } catch {
    return null;
  }
}

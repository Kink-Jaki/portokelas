import { request, type FullConfig } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

/**
 * Login sekali lewat API lalu simpan cookie session (httpOnly `pk_session`) sebagai
 * storageState. Test lain memakai file ini agar tidak menguras rate limit endpoint
 * login (10 request / 15 menit / IP).
 */

const AUTH_DIR = path.join(process.cwd(), 'tests', '.auth');

async function saveStorageState(baseURL: string, identity: string, password: string, file: string) {
  const context = await request.newContext({ baseURL });
  try {
    const response = await context.post('/api/auth/login', {
      data: { identity, password },
    });
    if (!response.ok()) {
      throw new Error(
        `Gagal login sebagai "${identity}" (${response.status()}): ${await response.text()}`,
      );
    }
    await context.storageState({ path: file });
  } finally {
    await context.dispose();
  }
}

export default async function globalSetup(config: FullConfig) {
  mkdirSync(AUTH_DIR, { recursive: true });

  const baseURL = config.projects[0]?.use.baseURL ?? 'http://localhost:5173';
  const memberIdentity = process.env.E2E_MEMBER_NIS ?? '17858';
  const memberPassword = process.env.E2E_MEMBER_PASSWORD ?? process.env.E2E_PASSWORD ?? 'password';
  const adminIdentity = process.env.E2E_ADMIN_IDENTITY ?? 'admin@portofolio.test';
  const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? 'Admin12345';

  await saveStorageState(
    baseURL,
    memberIdentity,
    memberPassword,
    path.join(AUTH_DIR, 'member.json'),
  );
  await saveStorageState(baseURL, adminIdentity, adminPassword, path.join(AUTH_DIR, 'admin.json'));
}

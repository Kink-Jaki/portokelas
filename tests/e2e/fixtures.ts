import { test as base, expect, type Page } from '@playwright/test';
import path from 'node:path';

/** Path storageState hasil global-setup. */
export const AUTH_DIR = path.join(process.cwd(), 'tests', '.auth');
export const MEMBER_STATE = path.join(AUTH_DIR, 'member.json');
export const ADMIN_STATE = path.join(AUTH_DIR, 'admin.json');

/** Kredensial + data seed (lihat backend/src/db/seed-class.ts). */
export const MEMBER = {
  nis: process.env.E2E_MEMBER_NIS ?? '17858',
  password: process.env.E2E_PASSWORD ?? 'password',
  name: 'KEYLA RANI AZAHRA',
  firstName: 'KEYLA',
  slug: 'keyla-rani-azahra',
};

export const ADMIN = {
  identity: process.env.E2E_ADMIN_IDENTITY ?? 'admin@portofolio.test',
  password: process.env.E2E_ADMIN_PASSWORD ?? 'Admin12345',
  name: 'Admin Kelas',
  firstName: 'Admin',
  slug: 'admin-kelas',
  email: 'admin@portofolio.test',
};

export const API_BASE = process.env.E2E_API_URL ?? 'http://localhost:8787';

/**
 * Fixture dasar: pre-set sessionStorage penanda supaya dialog "Web Masih dalam
 * Pengembangan" tidak muncul dan mengganggu test. Intro overlay landing juga
 * dilewati karena `reducedMotion: 'reduce'` di config.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        window.sessionStorage.setItem('craftly:dev-notice-seen', '1');
      } catch {
        /* storage bisa saja tidak tersedia */
      }
    });
    await use(page);
  },
});

export { expect };

/** Login lewat UI (dipakai hanya untuk skenario login itu sendiri). */
export async function loginViaUi(page: Page, identity: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('NIS').fill(identity);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Masuk' }).click();
}

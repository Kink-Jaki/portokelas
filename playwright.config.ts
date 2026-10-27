import { defineConfig, devices } from '@playwright/test';

/**
 * E2E test configuration untuk Craftly (monorepo: backend Hono/Bun + frontend Vite/React).
 *
 * Sebelum menjalankan, pastikan database Postgres dapat diakses (backend/.env DATABASE_URL)
 * dan sudah di-seed (`bun run seed:class`). Playwright akan menjalankan sendiri:
 *   - backend : http://localhost:8787  (bun run --cwd backend start)
 *   - frontend: http://localhost:5173  (bun run --cwd frontend dev, proxy /api -> backend)
 */

const FRONTEND_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5173';
const BACKEND_URL = process.env.E2E_API_URL ?? 'http://localhost:8787';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  globalSetup: './tests/e2e/global-setup.ts',
  outputDir: './tests/.artifacts',
  reporter: [['list'], ['html', { open: 'never', outputFolder: './tests/.report' }]],
  use: {
    baseURL: FRONTEND_URL,
    reducedMotion: 'reduce',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'id-ID',
    timezoneId: 'Asia/Jakarta',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /(public|ngl)\.spec\.ts/,
    },
  ],
  webServer: [
    {
      command: 'bun run --cwd backend start',
      url: `${BACKEND_URL}/api/health`,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      // `bun run --cwd frontend dev` gagal karena vite di-hoist ke node_modules root,
      // jadi jalankan binary vite dari root dengan argumen direktori frontend.
      command: 'node node_modules/vite/bin/vite.js frontend',
      url: FRONTEND_URL,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});

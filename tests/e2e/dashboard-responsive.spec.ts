import { test, expect, MEMBER_STATE } from './fixtures';

test.use({ storageState: MEMBER_STATE });

/** Breakpoint yang wajib bersih dari scroll horizontal (lihat brief redesign). */
const VIEWPORTS = [320, 360, 375, 390, 430, 768, 1024, 1440] as const;

/** Semua tab dashboard — tiap tab punya layout sendiri yang bisa memicu overflow. */
const TAB_PATHS = ['', '?tab=projects', '?tab=memories', '?tab=personalize'];

test.describe('Dashboard responsif', () => {
  for (const width of VIEWPORTS) {
    test(`tanpa scroll horizontal pada ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });

      for (const path of TAB_PATHS) {
        await page.goto(`/dashboard${path}`);
        await expect(page.getByRole('tablist', { name: 'Section dashboard' })).toBeVisible();

        const metrics = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(
          metrics.scrollWidth,
          `scrollWidth melebihi clientWidth di ${width}px (${path || 'profil'})`,
        ).toBeLessThanOrEqual(metrics.clientWidth);

        const tabs = page.getByRole('tab');
        await expect(tabs).toHaveCount(4);
        const boxes = await tabs.evaluateAll((els) =>
          els.map((el) => {
            const rect = el.getBoundingClientRect();
            return { left: rect.left, right: rect.right, text: el.textContent?.trim() ?? '' };
          }),
        );
        for (const box of boxes) {
          expect(box.left, `tab "${box.text}" keluar kiri (${width}px)`).toBeGreaterThanOrEqual(0);
          expect(
            box.right,
            `tab "${box.text}" keluar kanan (${width}px)`,
          ).toBeLessThanOrEqual(width + 1);
        }

        const main = page.locator('main');
        const portfolio = main.getByRole('link', { name: 'Lihat portofolio' });
        await expect(portfolio).toBeVisible();
        const portfolioBox = await portfolio.boundingBox();
        expect(portfolioBox).not.toBeNull();
        expect(
          portfolioBox!.x + portfolioBox!.width,
          `tombol "Lihat portofolio" keluar viewport (${width}px)`,
        ).toBeLessThanOrEqual(width + 1);

        const logout = main.getByRole('button', { name: 'Keluar' });
        await expect(logout).toBeVisible();
        const logoutBox = await logout.boundingBox();
        expect(logoutBox).not.toBeNull();
        expect(
          logoutBox!.x + logoutBox!.width,
          `tombol "Keluar" keluar viewport (${width}px)`,
        ).toBeLessThanOrEqual(width + 1);
      }
    });
  }

  test('tab menjadi grid dua kolom di bawah 480px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/dashboard');
    await expect(page.getByRole('tablist', { name: 'Section dashboard' })).toBeVisible();

    const positions = await page.getByRole('tab').evaluateAll((els) =>
      els.map((el) => {
        const rect = el.getBoundingClientRect();
        return { top: Math.round(rect.top), left: Math.round(rect.left), width: rect.width };
      }),
    );

    // Dua baris (Profil/Project lalu Kenangan/Personalisasi) dengan lebar sama rata.
    expect(new Set(positions.map((p) => p.top)).size).toBe(2);
    expect(positions[0].left).not.toBe(positions[1].left);
    expect(Math.abs(positions[0].width - positions[1].width)).toBeLessThanOrEqual(1);

    // Di atas 480px kembali menjadi satu baris.
    await page.setViewportSize({ width: 640, height: 800 });
    await page.waitForTimeout(400);
    const wide = await page.getByRole('tab').evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().top)),
    );
    expect(new Set(wide).size).toBe(1);
  });

  test('navbar mobile memuat hamburger, logo, dan profil dalam viewport', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/dashboard');

    await expect(page.getByRole('button', { name: 'Buka navigasi' })).toBeVisible();
    await expect(
      page.locator('header').getByRole('link', { name: 'Craftly — beranda' }),
    ).toBeVisible();

    const headerHeight = await page.locator('header').evaluate((el) => el.getBoundingClientRect().height);
    expect(headerHeight).toBeGreaterThanOrEqual(60);
    expect(headerHeight).toBeLessThanOrEqual(78);

    // Sidebar desktop tidak mengambil ruang horizontal di layar kecil.
    const sidebar = page.locator('aside[aria-label="Sidebar aplikasi"]');
    await expect(sidebar).toBeHidden();

    // Drawer tetap terbuka dari tombol hamburger.
    await page.getByRole('button', { name: 'Buka navigasi' }).click();
    await expect(page.getByRole('dialog', { name: 'Navigasi' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Navigasi' })).toBeHidden();
  });
});

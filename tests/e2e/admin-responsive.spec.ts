import { test, expect, ADMIN_STATE } from './fixtures';

test.use({ storageState: ADMIN_STATE });

/** Breakpoint wajib tanpa scroll horizontal (lihat brief responsif panel admin). */
const VIEWPORTS = [320, 360, 375, 390, 430, 768, 1024, 1440] as const;

/** Semua tab admin — tiap tab punya konten yang bisa memicu overflow. */
const TABS = ['Moderasi project', 'Anggota', 'Landing page', 'Kenangan', 'NGL'] as const;

test.describe('Panel admin responsif', () => {
  for (const width of VIEWPORTS) {
    test(`tanpa scroll horizontal pada ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/admin');
      await expect(page.getByRole('tablist', { name: 'Section admin' })).toBeVisible();

      for (const tab of TABS) {
        await page.getByRole('tab', { name: tab }).click();
        await expect(page.getByRole('tab', { name: tab })).toHaveAttribute('aria-selected', 'true');

        const metrics = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(
          metrics.scrollWidth,
          `scrollWidth melebihi clientWidth di ${width}px (tab ${tab})`,
        ).toBeLessThanOrEqual(metrics.clientWidth);

        // Seluruh tab tetap berada di dalam viewport.
        const boxes = await page.getByRole('tab').evaluateAll((els) =>
          els.map((el) => {
            const rect = el.getBoundingClientRect();
            return { left: rect.left, right: rect.right, text: el.textContent?.trim() ?? '' };
          }),
        );
        for (const box of boxes) {
          expect(box.left, `tab "${box.text}" keluar kiri (${width}px)`).toBeGreaterThanOrEqual(-1);
          expect(
            box.right,
            `tab "${box.text}" keluar kanan (${width}px)`,
          ).toBeLessThanOrEqual(width + 1);
        }
      }

      // Heading, info akun, dan footer ikut utuh.
      const heading = page.getByRole('heading', { name: 'Moderasi Craftly.' });
      await expect(heading).toBeVisible();
      const headingBox = await heading.boundingBox();
      expect(headingBox).not.toBeNull();
      expect(headingBox!.x + headingBox!.width).toBeLessThanOrEqual(width + 1);

      const account = page.getByText(/Masuk sebagai/i);
      await expect(account).toBeVisible();
      const accountBox = await account.boundingBox();
      expect(accountBox).not.toBeNull();
      expect(accountBox!.x + accountBox!.width).toBeLessThanOrEqual(width + 1);

      const footerBox = await page.locator('footer').boundingBox();
      expect(footerBox).not.toBeNull();
      expect(footerBox!.x + footerBox!.width).toBeLessThanOrEqual(width + 1);
    });
  }

  test('tab menjadi grid dua kolom di bawah 540px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/admin');
    await expect(page.getByRole('tablist', { name: 'Section admin' })).toBeVisible();

    const positions = await page.getByRole('tab').evaluateAll((els) =>
      els.map((el) => {
        const rect = el.getBoundingClientRect();
        return { top: Math.round(rect.top), left: Math.round(rect.left), width: rect.width };
      }),
    );

    // Lima tab: dua baris penuh (2+2) lalu tab terakhir selebar container.
    expect(new Set(positions.map((p) => p.top)).size).toBe(3);
    expect(positions[0].left).not.toBe(positions[1].left);
    expect(Math.abs(positions[0].width - positions[1].width)).toBeLessThanOrEqual(1);
    expect(Math.abs(positions[4].width - positions[0].width * 2)).toBeLessThanOrEqual(2);

    // Di atas 540px kembali menjadi satu baris.
    await page.setViewportSize({ width: 640, height: 800 });
    await page.waitForTimeout(400);
    const wide = await page.getByRole('tab').evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().top)),
    );
    expect(new Set(wide).size).toBe(1);
  });

  test('toolbar moderasi menumpuk vertikal pada mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/admin');
    await page.getByRole('tab', { name: 'Moderasi project' }).click();

    const search = page.getByRole('searchbox', { name: 'Cari project' });
    await expect(search).toBeVisible();
    const searchBox = await search.boundingBox();
    const filterBox = await page
      .getByRole('button', { name: 'Semua', exact: true })
      .boundingBox();
    expect(searchBox).not.toBeNull();
    expect(filterBox).not.toBeNull();

    // Pencarian di atas, filter di bawah (layout vertikal).
    expect(filterBox!.y).toBeGreaterThanOrEqual(searchBox!.y + searchBox!.height);
    expect(searchBox!.width).toBeGreaterThanOrEqual(300);

    // Ketiga filter terlihat utuh dalam viewport.
    for (const label of ['Semua', 'Tayang', 'Disembunyikan'] as const) {
      const box = await page.getByRole('button', { name: label, exact: true }).boundingBox();
      expect(box, `filter "${label}" tidak tampil`).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(-1);
      expect(box!.x + box!.width).toBeLessThanOrEqual(376);
    }

    // Filter tetap berfungsi.
    await page.getByRole('button', { name: 'Tayang', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Tayang', exact: true })).toHaveClass(
      /bg-invert/,
    );
    await page.getByRole('button', { name: 'Semua', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Semua', exact: true })).toHaveClass(
      /bg-invert/,
    );
  });

  test('sidebar desktop tidak mengambil ruang di mobile', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/admin');
    await expect(page.locator('aside[aria-label="Sidebar aplikasi"]')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Buka navigasi' })).toBeVisible();

    await page.setViewportSize({ width: 1024, height: 900 });
    await page.waitForTimeout(300);
    await expect(page.locator('aside[aria-label="Sidebar aplikasi"]')).toBeVisible();
  });
});

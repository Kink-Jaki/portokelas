import { test, expect } from './fixtures';

test.describe('Craftly NGL', () => {
  test('halaman NGL memuat dengan judul dan konten yang sesuai status fitur', async ({
    page,
    request,
  }) => {
    const settings = await request.get('/api/settings/ngl');
    const body = (await settings.json()) as { data: { enabled: boolean } };

    await page.goto('/ngl');
    await expect(page.getByRole('heading', { name: /Craftly NGL/ })).toBeVisible();

    if (body.data.enabled) {
      await expect(page.getByRole('button', { name: 'Kirim anonim' })).toBeVisible();
    } else {
      await expect(page.getByRole('heading', { name: 'Fitur belum tersedia' })).toBeVisible();
    }
  });

  test('form compose menolak kiriman kosong (bila fitur aktif)', async ({ page, request }) => {
    const settings = await request.get('/api/settings/ngl');
    const body = (await settings.json()) as { data: { enabled: boolean } };
    test.skip(!body.data.enabled, 'Fitur NGL sedang dinonaktifkan admin.');

    await page.goto('/ngl');
    await page.getByRole('button', { name: 'Kirim anonim' }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'Isi minimal salah satu' }),
    ).toBeVisible();
  });
});

import { test, expect, ADMIN, ADMIN_STATE, MEMBER_STATE } from './fixtures';

test.describe('Panel admin', () => {
  test.use({ storageState: ADMIN_STATE });

  test('menampilkan header dan tab moderasi default', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.getByRole('heading', { name: 'Moderasi Craftly.' })).toBeVisible();
    await expect(page.getByText(`Masuk sebagai ${ADMIN.email}`)).toBeVisible();
    await expect(page.getByRole('searchbox', { name: 'Cari project' })).toBeVisible();
  });

  test('menelusuri seluruh tab admin', async ({ page }) => {
    await page.goto('/admin');
    const tablist = page.getByRole('tablist', { name: 'Section admin' });

    await tablist.getByRole('tab', { name: 'Anggota' }).click();
    await expect(page.getByRole('searchbox', { name: 'Cari anggota' })).toBeVisible();

    await tablist.getByRole('tab', { name: 'Landing page' }).click();
    await expect(page.getByRole('heading', { name: 'Kolase gambar hero' })).toBeVisible();

    await tablist.getByRole('tab', { name: 'Kenangan' }).click();
    await expect(page.getByRole('heading', { name: 'Manajemen kenangan anggota' })).toBeVisible();

    await tablist.getByRole('tab', { name: 'NGL' }).click();
    await expect(page.getByRole('heading', { name: 'Pesan NGL' })).toBeVisible();

    await tablist.getByRole('tab', { name: 'Moderasi project' }).click();
    await expect(page.getByRole('searchbox', { name: 'Cari project' })).toBeVisible();
  });
});

test.describe('Panel admin — kontrol akses', () => {
  test.use({ storageState: MEMBER_STATE });

  test('anggota biasa tidak dapat membuka panel admin', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByText('Akses ditolak')).toBeVisible();
    await expect(page.getByText('Hanya admin yang dapat membuka halaman ini.')).toBeVisible();
  });
});

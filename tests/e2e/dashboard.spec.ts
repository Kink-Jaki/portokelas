import { test, expect, MEMBER, MEMBER_STATE } from './fixtures';

test.use({ storageState: MEMBER_STATE });

test.describe('Dashboard anggota', () => {
  test('menampilkan sapaan dan seluruh tab', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { name: `Halo, ${MEMBER.firstName}.` })).toBeVisible();

    const tablist = page.getByRole('tablist', { name: 'Section dashboard' });
    for (const label of ['Profil', 'Project', 'Kenangan', 'Personalisasi']) {
      await expect(tablist.getByRole('tab', { name: label })).toBeVisible();
    }
  });

  test('perpindahan tab menampilkan panel yang sesuai', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { name: 'Profil publik' })).toBeVisible();

    await page.getByRole('tab', { name: 'Project' }).click();
    await expect(page.getByRole('heading', { name: 'Project saya' })).toBeVisible();
    await expect(page).toHaveURL(/tab=projects/);

    await page.getByRole('tab', { name: 'Kenangan' }).click();
    await expect(page.getByRole('heading', { name: 'Tambah foto kenangan' })).toBeVisible();

    await page.getByRole('tab', { name: 'Personalisasi' }).click();
    await expect(page.getByRole('heading', { name: 'Tema' })).toBeVisible();

    await page.getByRole('tab', { name: 'Profil' }).click();
    await expect(page.getByRole('heading', { name: 'Profil publik' })).toBeVisible();
  });

  test('tautan "Lihat portofolio" membuka halaman publik anggota', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: 'Lihat portofolio' }).click();
    await expect(page).toHaveURL(new RegExp(`/m/${MEMBER.slug}$`));
  });
});

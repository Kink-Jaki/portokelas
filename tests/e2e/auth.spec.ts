import { test, expect, loginViaUi, MEMBER, ADMIN, MEMBER_STATE, ADMIN_STATE } from './fixtures';

test.describe('Autentikasi', () => {
  test('route terproteksi mengarahkan pengunjung anonim ke login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Selamat datang kembali.' })).toBeVisible();
  });

  test('validasi form kosong menampilkan pesan error', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Masuk' }).click();

    await expect(
      page.getByRole('alert').filter({ hasText: 'NIS atau email wajib diisi' }),
    ).toBeVisible();
    await expect(page.getByRole('alert').filter({ hasText: 'Password wajib diisi' })).toBeVisible();
  });

  test('kredensial salah ditolak', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('NIS').fill('000000');
    await page.getByRole('textbox', { name: 'Password' }).fill('password-salah');
    await page.getByRole('button', { name: 'Masuk' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText('NIS/email atau password salah.').first()).toBeVisible();
  });

  test('anggota dapat login lewat UI dan diarahkan ke dashboard', async ({ page }) => {
    await loginViaUi(page, MEMBER.nis, MEMBER.password);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: `Halo, ${MEMBER.firstName}.` })).toBeVisible();
  });

  test.describe('sudah login', () => {
    test.use({ storageState: MEMBER_STATE });

    test('anggota yang sudah login diarahkan dari /login ke dashboard', async ({ page }) => {
      await page.goto('/login');
      await expect(page).toHaveURL(/\/dashboard$/);
    });

    test('anggota dapat keluar', async ({ page }) => {
      await page.goto('/dashboard');
      await page.getByRole('button', { name: 'Keluar' }).first().click();
      await expect(page).toHaveURL(/\/(login)?$/);

      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByRole('heading', { name: 'Selamat datang kembali.' })).toBeVisible();
    });
  });

  test.describe('admin sudah login', () => {
    test.use({ storageState: ADMIN_STATE });

    test('admin yang sudah login diarahkan dari /login ke panel admin', async ({ page }) => {
      await page.goto('/login');
      await expect(page).toHaveURL(/\/admin$/);
      await expect(page.getByRole('heading', { name: 'Moderasi Craftly.' })).toBeVisible();
      await expect(page.getByText(`Masuk sebagai ${ADMIN.email}`)).toBeVisible();
    });
  });
});

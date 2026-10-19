import { test, expect, MEMBER } from './fixtures';

test.describe('Halaman publik', () => {
  test('landing menampilkan hero, navigasi bagian, dan footer', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Craftly/i);
    await expect(page.getByText(/Platform Portofolio Anggota/i)).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const sectionNav = page.getByRole('navigation', { name: 'Navigasi bagian halaman' });
    const width = page.viewportSize()?.width ?? 1280;
    if (width >= 1024) {
      for (const label of ['Tentang', 'Wali Kelas', 'Anggota', 'Memories']) {
        await expect(sectionNav.getByRole('link', { name: label })).toBeVisible();
      }
    } else {
      await expect(page.getByRole('button', { name: 'Buka navigasi' })).toBeVisible();
    }

    const footer = page.getByRole('contentinfo');
    await expect(footer.getByRole('link', { name: 'Jelajahi direktori' })).toBeVisible();
  });

  test('footer mengarahkan ke direktori anggota', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'Jelajahi direktori' })
      .click();
    await expect(page).toHaveURL(/\/members$/);
    await expect(page.getByRole('heading', { name: /Anggota\s*Craftly/i })).toBeVisible();
  });

  test('halaman dokumentasi menampilkan panduan', async ({ page }) => {
    await page.goto('/docs');
    await expect(page.getByRole('heading', { name: 'Pendahuluan' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cara Menambah Project' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Craftly NGL' })).toBeVisible();
  });

  test('direktori anggota memuat daftar dan mendukung pencarian', async ({ page }) => {
    await page.goto('/members');
    await expect(page.getByRole('heading', { name: /Anggota\s*Craftly/i })).toBeVisible();

    const search = page.getByRole('searchbox', { name: 'Cari anggota' });
    await search.fill('KEYLA');

    const card = page.getByRole('link', { name: `Buka portofolio ${MEMBER.name}` });
    await expect(card).toBeVisible();

    await search.fill('zzz-tidak-ada-zzz');
    await expect(card).toHaveCount(0);
  });

  test('kartu anggota membuka portofolio publik', async ({ page }) => {
    await page.goto('/members');
    await page.getByRole('searchbox', { name: 'Cari anggota' }).fill(MEMBER.name);
    await page.getByRole('link', { name: `Buka portofolio ${MEMBER.name}` }).click();

    await expect(page).toHaveURL(new RegExp(`/m/${MEMBER.slug}$`));
    await expect(page.getByText(MEMBER.name).first()).toBeVisible();
    await expect(page.getByRole('region', { name: 'Project' })).toBeVisible();
  });

  test('portofolio anggota tak dikenal menampilkan pesan tidak ditemukan', async ({ page }) => {
    await page.goto('/m/slug-tidak-ada-xyz');
    await expect(page.getByText('Portofolio tidak ditemukan')).toBeVisible();
  });

  test('route tidak dikenal menampilkan halaman 404', async ({ page }) => {
    await page.goto('/route-yang-tidak-ada');
    await expect(page.getByRole('heading', { name: 'Halaman ini tidak ditemukan.' })).toBeVisible();
    await expect(page.getByText('404')).toBeVisible();

    await page.getByRole('link', { name: 'Kembali ke beranda' }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

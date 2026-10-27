import { test, expect, MEMBER_STATE, API_BASE } from './fixtures';

interface ProjectSummary {
  id: string;
  title: string;
  slug: string;
}

const TITLE_PREFIX = 'E2E Project ';

async function deleteLeftoverProjects(request: import('@playwright/test').APIRequestContext) {
  const res = await request.get('/api/me/projects');
  if (!res.ok()) return;
  const body = (await res.json()) as { data: { projects: ProjectSummary[] } };
  for (const project of body.data.projects) {
    if (project.title.startsWith(TITLE_PREFIX)) {
      await request.delete(`/api/me/projects/${project.id}`);
    }
  }
}

test.use({ storageState: MEMBER_STATE });

test.describe('Siklus hidup project anggota', () => {
  test('membuat, menampilkan di portofolio publik, lalu menghapus project', async ({ page }) => {
    await deleteLeftoverProjects(page.request);

    const me = await page.request.get('/api/auth/me');
    const meBody = (await me.json()) as { data: { user: { slug: string } } };
    const slug = meBody.data.user.slug;

    const title = `${TITLE_PREFIX}${Date.now()}`;

    await page.goto('/dashboard?tab=projects');
    await page.getByRole('button', { name: 'Tambah project' }).first().click();

    const dialog = page.getByRole('dialog', { name: 'Tambah project' });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Judul project').fill(title);
    await dialog.getByLabel('Deskripsi singkat').fill('Dibuat otomatis oleh pengujian E2E.');
    await dialog.getByLabel('Tech stack').fill('Playwright, TypeScript');
    await dialog.getByRole('button', { name: 'Tambah project' }).click();

    await expect(dialog).toBeHidden();
    const row = page.locator('article').filter({ hasText: title });
    await expect(row).toBeVisible();

    // Tampil di portofolio publik
    await page.goto(`/m/${slug}`);
    await expect(page.getByText(title).first()).toBeVisible();

    // Hapus lewat dashboard
    await page.goto('/dashboard?tab=projects');
    const rowToDelete = page.locator('article').filter({ hasText: title });
    await rowToDelete.getByRole('button', { name: 'Hapus' }).click();

    const confirm = page.getByRole('dialog', { name: 'Hapus project?' });
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Hapus permanen' }).click();

    await expect(rowToDelete).toHaveCount(0);
  });

  test.afterEach(async ({ page }) => {
    await deleteLeftoverProjects(page.request);
  });
});

// Sanity check: API backend dapat dijangkau langsung dari test runner.
test('backend API dapat dijangkau', async ({ playwright }) => {
  const ctx = await playwright.request.newContext({ baseURL: API_BASE });
  try {
    const res = await ctx.get('/api/health');
    expect(res.ok()).toBe(true);
  } finally {
    await ctx.dispose();
  }
});

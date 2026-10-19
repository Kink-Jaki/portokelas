import { test, expect, request as playwrightRequest } from '@playwright/test';
import { API_BASE, MEMBER } from './fixtures';

test.describe('API backend', () => {
  test('GET /api/health mengembalikan status ok', async () => {
    const ctx = await playwrightRequest.newContext({ baseURL: API_BASE });
    try {
      const res = await ctx.get('/api/health');
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('ok');
    } finally {
      await ctx.dispose();
    }
  });

  test('GET /api/members mengembalikan daftar anggota', async () => {
    const ctx = await playwrightRequest.newContext({ baseURL: API_BASE });
    try {
      const res = await ctx.get('/api/members?limit=5');
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data.items)).toBe(true);
      expect(body.data.items.length).toBeGreaterThan(0);
      expect(body.data.meta.total).toBeGreaterThan(0);
    } finally {
      await ctx.dispose();
    }
  });

  test('GET /api/members/:slug mengembalikan satu anggota', async () => {
    const ctx = await playwrightRequest.newContext({ baseURL: API_BASE });
    try {
      const res = await ctx.get(`/api/members/${MEMBER.slug}`);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.member.slug).toBe(MEMBER.slug);
      expect(body.data.member.name).toBe(MEMBER.name);

      const missing = await ctx.get('/api/members/slug-tidak-ada-xyz');
      expect(missing.status()).toBe(404);
      const missingBody = await missing.json();
      expect(missingBody.error.code).toBe('NOT_FOUND');
    } finally {
      await ctx.dispose();
    }
  });

  test('GET /api/settings/ngl mengembalikan status boolean', async () => {
    const ctx = await playwrightRequest.newContext({ baseURL: API_BASE });
    try {
      const res = await ctx.get('/api/settings/ngl');
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(typeof body.data.enabled).toBe('boolean');
    } finally {
      await ctx.dispose();
    }
  });

  test('endpoint terproteksi menolak permintaan tanpa sesi (401)', async () => {
    const ctx = await playwrightRequest.newContext({ baseURL: API_BASE });
    try {
      for (const path of ['/api/me/projects', '/api/me/memories', '/api/ngl/messages']) {
        const res = await ctx.get(path);
        expect(res.status(), `GET ${path}`).toBe(401);
      }
    } finally {
      await ctx.dispose();
    }
  });

  test('login salah mengembalikan 401', async () => {
    const ctx = await playwrightRequest.newContext({ baseURL: API_BASE });
    try {
      const res = await ctx.post('/api/auth/login', {
        data: { identity: '000000', password: 'salah' },
      });
      expect(res.status()).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
    } finally {
      await ctx.dispose();
    }
  });

  test('siklus login → me → logout berjalan', async () => {
    const ctx = await playwrightRequest.newContext({ baseURL: API_BASE });
    try {
      const login = await ctx.post('/api/auth/login', {
        data: { identity: MEMBER.nis, password: MEMBER.password },
      });
      expect(login.status()).toBe(200);

      const me = await ctx.get('/api/auth/me');
      expect(me.status()).toBe(200);
      const meBody = await me.json();
      expect(meBody.data.user.nim).toBe(MEMBER.nis);

      const logout = await ctx.post('/api/auth/logout');
      expect(logout.status()).toBe(200);

      const meAfter = await ctx.get('/api/auth/me');
      const meAfterBody = await meAfter.json();
      expect(meAfterBody.data.user).toBeNull();
    } finally {
      await ctx.dispose();
    }
  });

  test('anggota biasa tidak berhak mengakses endpoint admin (403)', async () => {
    const ctx = await playwrightRequest.newContext({ baseURL: API_BASE });
    try {
      await ctx.post('/api/auth/login', {
        data: { identity: MEMBER.nis, password: MEMBER.password },
      });
      const res = await ctx.get('/api/admin/users');
      expect(res.status()).toBe(403);
      const body = await res.json();
      expect(body.error.code).toBe('FORBIDDEN');
    } finally {
      await ctx.dispose();
    }
  });
});

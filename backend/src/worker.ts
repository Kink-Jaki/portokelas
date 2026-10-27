/**
 * Entry point Cloudflare Workers.
 *
 * `wrangler.jsonc` menunjuk ke file ini. Aplikasi Hono yang sama dipakai
 * ulang untuk `bun run dev` (lihat `index.ts`).
 *
 * Setiap request dijalankan dalam konteks AsyncLocalStorage (lihat
 * `runtime.ts`). Koneksi DB dibuat per request lalu ditutup lewat
 * `ctx.waitUntil` — Workers melarang socket dipakai lintas request. Hyperdrive
 * tetap menjaga pool koneksi ke database asli, jadi ini tetap murah.
 */
import type { ExecutionContext } from 'hono';

import { app } from './app.js';
import { closeRequestDatabase } from './db/index.js';
import { type AppBindings, runWithBindings } from './runtime.js';

export default {
  async fetch(request: Request, env: AppBindings, ctx: ExecutionContext): Promise<Response> {
    return runWithBindings(env, async () => {
      try {
        return await app.fetch(request, env, ctx);
      } finally {
        ctx.waitUntil(closeRequestDatabase());
      }
    });
  },
};

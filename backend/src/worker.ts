/**
 * Entry point Cloudflare Workers.
 *
 * `wrangler.jsonc` menunjuk ke file ini. Aplikasi Hono yang sama dipakai
 * ulang untuk `bun run dev` (lihat `index.ts`).
 *
 * Hyperdrive tidak boleh memakai koneksi/pool yang sama lintas request. Karena
 * itu pool DB ditutup di akhir setiap request (`ctx.waitUntil`) sehingga request
 * berikutnya selalu membuat koneksi baru.
 */
import type { ExecutionContext } from 'hono';

import { app } from './app.js';
import { closePool } from './db/index.js';
import { type AppBindings, setBindings } from './runtime.js';

export default {
  async fetch(
    request: Request,
    env: AppBindings,
    ctx: ExecutionContext,
  ): Promise<Response> {
    setBindings(env);
    try {
      return await app.fetch(request, env, ctx);
    } finally {
      ctx.waitUntil(closePool());
    }
  },
};

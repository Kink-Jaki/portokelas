/**
 * Penyimpan binding runtime Cloudflare (per request) agar modul lain bisa
 * membacanya tanpa harus menerima `c.env` di setiap fungsi.
 *
 * - Di Cloudflare Workers, entry (`worker.ts`) menjalankan request di dalam
 *   `runWithBindings()`. AsyncLocalStorage memastikan binding & koneksi DB
 *   tidak bocor antar request yang berjalan bersamaan di isolate yang sama.
 * - Di lokal (Bun/`bun run dev`), tidak ada store sehingga `env.ts` membaca
 *   `process.env` dan unggahan memakai filesystem.
 */

import { AsyncLocalStorage } from 'node:async_hooks';

/** Subset binding Hyperdrive yang dipakai. */
export interface HyperdriveBinding {
  connectionString: string;
}

/** Subset objek R2 yang dipakai (lihat API `R2Bucket`). */
export interface R2ObjectBody {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
}

/** Subset binding R2 bucket yang dipakai. */
export interface R2BucketBinding {
  put(
    key: string,
    value: Uint8Array,
    options?: { httpMetadata?: { contentType?: string; cacheControl?: string } },
  ): Promise<unknown>;
  get(key: string): Promise<R2ObjectBody | null>;
  delete(key: string): Promise<void>;
}

/** Subset binding Workers KV yang dipakai (alternatif R2 untuk unggahan). */
export interface KVNamespaceBinding {
  put(key: string, value: Uint8Array): Promise<void>;
  get(key: string, options: { type: 'arrayBuffer' }): Promise<ArrayBuffer | null>;
  delete(key: string): Promise<void>;
}

export type AppBindings = {
  HYPERDRIVE?: HyperdriveBinding;
  UPLOADS_BUCKET?: R2BucketBinding;
  UPLOADS_KV?: KVNamespaceBinding;
  [key: string]: unknown;
};

/**
 * State per request. `db`/`closeDb` diisi lazy oleh `db/index.ts` saat query
 * pertama; tipe `unknown` dipakai agar modul ini tidak mengimpor Drizzle.
 */
export interface RequestStore {
  bindings: AppBindings;
  db?: unknown;
  dbKey?: string;
  closeDb?: () => Promise<void>;
}

const storage = new AsyncLocalStorage<RequestStore>();

/** Jalankan handler di dalam konteks request (binding + koneksi DB terisolasi). */
export function runWithBindings<T>(bindings: AppBindings, fn: () => T): T {
  return storage.run({ bindings }, fn);
}

export function getStore(): RequestStore | undefined {
  return storage.getStore();
}

export function getBindings(): AppBindings | null {
  return storage.getStore()?.bindings ?? null;
}

/**
 * Penyimpan binding runtime Cloudflare (per request) agar modul lain bisa
 * membacanya tanpa harus menerima `c.env` di setiap fungsi.
 *
 * - Di Cloudflare Workers, entry (`worker.ts`) memanggil `setBindings(env)`
 *   sebelum meneruskan request.
 * - Di lokal (Bun/`bun run dev`), binding null sehingga `env.ts` membaca
 *   `process.env` dan unggahan memakai filesystem.
 */

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

let current: AppBindings | null = null;

export function setBindings(bindings: AppBindings | null): void {
  current = bindings;
}

export function getBindings(): AppBindings | null {
  return current;
}

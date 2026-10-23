import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { getEnv } from '../env.js';
import { getBindings, getStore } from '../runtime.js';
import * as schema from './schema.js';

const { Pool } = pg;

type PoolInstance = InstanceType<typeof Pool>;

const createDatabase = (pool: PoolInstance) => drizzle(pool, { schema });
export type Database = ReturnType<typeof createDatabase>;

type ConnectionConfig = {
  connectionString: string;
  ssl: false | { rejectUnauthorized: boolean };
};

/**
 * Resolusi koneksi: prioritaskan Hyperdrive (produksi Workers), lalu
 * jatuh ke `DATABASE_URL` (lokal / secret biasa).
 */
function resolveConnection(): ConnectionConfig {
  const hyperdrive = getBindings()?.HYPERDRIVE;

  if (hyperdrive?.connectionString) {
    return { connectionString: hyperdrive.connectionString, ssl: false };
  }

  const env = getEnv();
  if (!env.DATABASE_URL) {
    throw new Error(
      'Koneksi database tidak tersedia. Set binding Hyperdrive "HYPERDRIVE" ' +
        'atau variable DATABASE_URL.',
    );
  }

  return {
    connectionString: env.DATABASE_URL,
    ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : false,
  };
}

function createPool(
  connectionString: string,
  ssl: ConnectionConfig['ssl'],
  max: number,
): PoolInstance {
  const pool = new Pool({
    connectionString,
    max,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ...(ssl ? { ssl } : {}),
  });
  pool.on('error', (error) => console.error('[db] Pool error:', error));
  return pool;
}

/**
 * Di Workers, koneksi tidak boleh dipakai lintas request: runtime menolak I/O
 * dari socket yang dibuat oleh request lain. Karena itu setiap request memakai
 * pool sendiri (maks 1 koneksi) yang ditutup di akhir request. Hyperdrive tetap
 * yang menjaga connection pool ke database asli, jadi membuat koneksi baru
 * per request tetap murah.
 *
 * Di luar request (script seed/migrate, dev Bun) dipakai singleton agar
 * koneksi bisa dipakai ulang.
 */
let localPool: PoolInstance | null = null;
let localDatabase: Database | null = null;
let localCacheKey = '';

function ensureDatabase(): Database {
  const { connectionString, ssl } = resolveConnection();
  const key = `${connectionString}::${ssl ? 'ssl' : 'plain'}`;
  const store = getStore();

  if (store) {
    if (store.db && store.dbKey === key) return store.db as Database;

    const previous = store.closeDb;
    if (previous) void previous().catch(() => undefined);

    const pool = createPool(connectionString, ssl, 1);
    store.db = createDatabase(pool);
    store.dbKey = key;
    store.closeDb = () => pool.end();
    return store.db as Database;
  }

  if (localDatabase && localPool && localCacheKey === key) return localDatabase;

  if (localPool) void localPool.end().catch(() => undefined);

  localPool = createPool(connectionString, ssl, 5);
  localDatabase = createDatabase(localPool);
  localCacheKey = key;
  return localDatabase;
}

/**
 * Proxy lazy supaya instance drizzle dibuat setelah binding env tersedia
 * (bukan saat modul di-import).
 */
export const db = new Proxy({} as Database, {
  get(_target, property) {
    const target = ensureDatabase();
    const value = (target as unknown as Record<PropertyKey, unknown>)[property];
    return typeof value === 'function' ? value.bind(target) : value;
  },
});

/** Tutup koneksi milik request yang sedang berjalan (dipanggil via waitUntil). */
export async function closeRequestDatabase(): Promise<void> {
  const store = getStore();
  const close = store?.closeDb;
  if (!store || !close) return;

  store.db = undefined;
  store.dbKey = undefined;
  store.closeDb = undefined;
  await close().catch((error) => console.error('[db] Gagal menutup koneksi:', error));
}

/** Tutup singleton lokal (script & shutdown server Bun). */
export async function closePool(): Promise<void> {
  const current = localPool;
  localPool = null;
  localDatabase = null;
  localCacheKey = '';
  if (current) await current.end().catch(() => undefined);
}

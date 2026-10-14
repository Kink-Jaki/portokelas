import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { getEnv } from '../env.js';
import { getBindings } from '../runtime.js';
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

let pool: PoolInstance | null = null;
let database: Database | null = null;
let cacheKey = '';

function ensureDatabase(): Database {
  const { connectionString, ssl } = resolveConnection();
  const key = `${connectionString}::${ssl ? 'ssl' : 'plain'}`;

  if (database && pool && cacheKey === key) return database;

  if (pool) void pool.end().catch(() => undefined);

  pool = new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ...(ssl ? { ssl } : {}),
  });
  pool.on('error', (error) => console.error('[db] Pool error:', error));

  database = createDatabase(pool);
  cacheKey = key;
  return database;
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

export function getPool(): PoolInstance {
  ensureDatabase();
  return pool as PoolInstance;
}

export async function closePool(): Promise<void> {
  const current = pool;
  pool = null;
  database = null;
  cacheKey = '';
  if (current) await current.end().catch(() => undefined);
}

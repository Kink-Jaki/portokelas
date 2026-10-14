import { serve } from '@hono/node-server';

import { app } from './app.js';
import { closePool } from './db/index.js';
import { env } from './env.js';

const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.info(`\n  Craftly API`);
  console.info(`  ▸ http://localhost:${info.port}`);
  console.info(`  ▸ env: ${env.NODE_ENV}`);
  console.info(`  ▸ upload: ${env.UPLOAD_DIR} (public: ${env.PUBLIC_URL}/uploads)\n`);
});

const shutdown = async (signal: string) => {
  console.info(`\n[server] ${signal} diterima, menutup server...`);
  server.close();
  await closePool();
  process.exit(0);
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

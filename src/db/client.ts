import { sql } from '@vercel/postgres';
import path from 'node:path';

export type DBProvider = 'sqlite' | 'postgres';

export function getProvider(): DBProvider {
  const p = (process.env.DB_PROVIDER || 'sqlite').toLowerCase();
  return (p === 'postgres' ? 'postgres' : 'sqlite');
}

// SQLite client (singleton)
let sqliteDb: any | null = null;
export function getSqlite() {
  if (!sqliteDb) {
    const dbPath = process.env.SQLITE_PATH || 'db/dev.db';
    try {
      // Lazy require to avoid bundling/native load in non-node runtimes
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const BetterSqlite3 = require('better-sqlite3');
      sqliteDb = new BetterSqlite3(dbPath);
      sqliteDb.pragma('foreign_keys = ON');
    } catch (e: any) {
      const msg = [
        'Failed to load better-sqlite3 native module.',
        `DB_PROVIDER=sqlite with path: ${path.resolve(dbPath)}`,
        'Troubleshooting:',
        '- Ensure your Node version matches the ABI used to build node_modules.',
        '- Rebuild the addon: `npm rebuild better-sqlite3`',
        '- Or force build from source: `npm i better-sqlite3@latest --build-from-source`',
        '- If issues persist, delete node_modules and reinstall.'
      ].join('\n');
      throw new Error(msg + (e?.stack ? `\nOriginal error: ${e.stack}` : ''));
    }
  }
  return sqliteDb;
}

// Postgres sql tag re-export for convenience
export const pg = sql;

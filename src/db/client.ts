import { sql } from '@vercel/postgres';
import path from 'node:path';

// Minimal runtime-agnostic typing for the SQLite client
interface SqliteStatement {
  run: (...args: unknown[]) => unknown;
  get: (...args: unknown[]) => unknown;
  all: (...args: unknown[]) => unknown;
}
interface SqliteDB {
  prepare: (sql: string) => SqliteStatement;
  pragma: (s: string) => unknown;
  transaction: <A extends unknown[], R>(fn: (...args: A) => R) => (...args: A) => R;
}

export type DBProvider = 'sqlite' | 'postgres';

export function getProvider(): DBProvider {
  const p = (process.env.DB_PROVIDER || 'sqlite').toLowerCase();
  return (p === 'postgres' ? 'postgres' : 'sqlite');
}

// SQLite client (singleton)
let sqliteDb: SqliteDB | null = null;
export function getSqlite() {
  if (!sqliteDb) {
    const dbPath = process.env.SQLITE_PATH || 'db/dev.db';
    try {
      // Lazy require to avoid bundling/native load in non-node runtimes
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const BetterSqlite3: new (path: string) => SqliteDB = require('better-sqlite3');
      sqliteDb = new BetterSqlite3(dbPath);
      sqliteDb.pragma('foreign_keys = ON');
    } catch (e: unknown) {
      const msg = [
        'Failed to load better-sqlite3 native module.',
        `DB_PROVIDER=sqlite with path: ${path.resolve(dbPath)}`,
        'Troubleshooting:',
        '- Ensure your Node version matches the ABI used to build node_modules.',
        '- Rebuild the addon: `npm rebuild better-sqlite3`',
        '- Or force build from source: `npm i better-sqlite3@latest --build-from-source`',
        '- If issues persist, delete node_modules and reinstall.'
      ].join('\n');
      const errDetail = e instanceof Error ? (e.stack || e.message) : '';
      throw new Error(msg + (errDetail ? `\nOriginal error: ${errDetail}` : ''));
    }
  }
  return sqliteDb;
}

// Postgres sql tag re-export for convenience
export const pg = sql;

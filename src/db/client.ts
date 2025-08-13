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

// Ensure Postgres schema exists (idempotent, run-once per process)
let pgSchemaPromise: Promise<void> | null = null;
export function ensurePgSchema(): Promise<void> {
  if (getProvider() !== 'postgres') return Promise.resolve();
  if (pgSchemaPromise) return pgSchemaPromise;
  pgSchemaPromise = (async () => {
    // Create tables if not exist
    await pg`CREATE TABLE IF NOT EXISTS rules (
      id UUID PRIMARY KEY,
      text TEXT NOT NULL UNIQUE,
      rating INTEGER NOT NULL DEFAULT 100000,
      games_played INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;

    await pg`CREATE TABLE IF NOT EXISTS matches (
      id BIGSERIAL PRIMARY KEY,
      rule_a_id UUID NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
      rule_b_id UUID NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
      winner_id UUID NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
      delta INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;

    // Create or replace updated_at trigger function (idempotent)
    await pg`CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $fn$
      BEGIN
        NEW.updated_at := NOW();
        RETURN NEW;
      END;
      $fn$ LANGUAGE plpgsql;`;

    // Ensure trigger exists (drop if exists, then create)
    await pg`DROP TRIGGER IF EXISTS rules_updated_at ON rules;`;
    await pg`CREATE TRIGGER rules_updated_at
      BEFORE UPDATE ON rules
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();`;
  })();
  return pgSchemaPromise;
}

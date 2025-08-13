Local SQLite setup
-------------------

Create a fresh SQLite database and load the schema + seed data:

1) Ensure `sqlite3` CLI is installed on your machine.
2) From the repo root, run:

   sqlite3 db/dev.db < db/seed.sql

3) Verify the rows:

   sqlite3 db/dev.db "SELECT id, substr(text,1,50) || '…' AS snippet, rating, games_played FROM rules ORDER BY created_at LIMIT 10;"

Notes
- Ratings are stored as integers scaled by 100 (e.g., 100000 = 1000.00 Elo).
- Tables: `rules` (primary), `matches` (audit log).
- You can safely re-run `seed.sql`—it uses `CREATE TABLE IF NOT EXISTS` and `INSERT OR IGNORE` for the seed rules.

Vercel Postgres setup
---------------------

Use this when deploying on Vercel with their managed Postgres:

1) In the Vercel dashboard: Storage → Postgres → Create Database. Link it to your project/environments.
2) In your Vercel project settings → Environment Variables, add:
   - `DB_PROVIDER=postgres`
   (The Postgres connection variables like `POSTGRES_URL` are added automatically when you link the database.)
3) Initialize the schema. In the Vercel Postgres SQL editor, run the contents of `db/seed.pg.sql` (it creates tables and seeds sample rules). You can also run locally with:

   psql "$POSTGRES_URL" -f db/seed.pg.sql

4) Redeploy. The app will auto-detect Postgres via `DB_PROVIDER` and use `@vercel/postgres`.

Notes
- The Postgres schema mirrors SQLite but uses native types (UUID, timestamptz, boolean).
- Seeding is optional; the app works with an empty `rules` table.

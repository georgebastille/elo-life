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


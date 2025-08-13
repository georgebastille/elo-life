-- SQLite schema and seed for local development
-- Creates tables and inserts initial rules

PRAGMA foreign_keys = ON;

-- Table: rules
CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL UNIQUE,
  rating INTEGER NOT NULL DEFAULT 100000, -- Elo 1000.00 scaled by 100
  games_played INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Trigger to keep updated_at current
CREATE TRIGGER IF NOT EXISTS rules_updated_at
AFTER UPDATE ON rules
FOR EACH ROW BEGIN
  UPDATE rules SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- Table: matches (audit log)
CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_a_id TEXT NOT NULL,
  rule_b_id TEXT NOT NULL,
  winner_id TEXT NOT NULL,
  delta INTEGER NOT NULL, -- rating change scaled by 100
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(rule_a_id) REFERENCES rules(id) ON DELETE CASCADE,
  FOREIGN KEY(rule_b_id) REFERENCES rules(id) ON DELETE CASCADE,
  FOREIGN KEY(winner_id) REFERENCES rules(id) ON DELETE CASCADE
);

-- Seed rules (UUIDs are arbitrary; keep stable for dev)
INSERT OR IGNORE INTO rules (id, text, rating, games_played, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Tell the truth, or at least don’t lie', 100000, 0, 1),
  ('22222222-2222-2222-2222-222222222222', 'Assume the person you are listening to knows something you don’t', 100000, 0, 1),
  ('33333333-3333-3333-3333-333333333333', 'Compare yourself to who you were yesterday, not to who someone else is today', 100000, 0, 1),
  ('44444444-4444-4444-4444-444444444444', 'Pursue what is meaningful, not what is expedient', 100000, 0, 1),
  ('55555555-5555-5555-5555-555555555555', 'Set your house in perfect order before you criticize the world', 100000, 0, 1),
  ('66666666-6666-6666-6666-666666666666', 'Stand up straight with your shoulders back', 100000, 0, 1),
  ('77777777-7777-7777-7777-777777777777', 'Be precise in your speech', 100000, 0, 1),
  ('88888888-8888-8888-8888-888888888888', 'Pet a cat when you encounter one on the street', 100000, 0, 1),
  ('99999999-9999-9999-9999-999999999999', 'Do not bother children when they are skateboarding', 100000, 0, 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Make at least one thing better every single day', 100000, 0, 1);


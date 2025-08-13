-- Postgres schema and seed for Vercel Postgres
-- Creates tables and inserts initial rules

-- Enable UUID extension if not present (optional when client/app generates UUIDs)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: rules
CREATE TABLE IF NOT EXISTS rules (
  id UUID PRIMARY KEY,
  text TEXT NOT NULL UNIQUE,
  rating INTEGER NOT NULL DEFAULT 100000, -- Elo 1000.00 scaled by 100
  games_played INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to keep updated_at current
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at'
  ) THEN
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at := NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'rules_updated_at'
  ) THEN
    CREATE TRIGGER rules_updated_at
    BEFORE UPDATE ON rules
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END$$;

-- Table: matches (audit log)
CREATE TABLE IF NOT EXISTS matches (
  id BIGSERIAL PRIMARY KEY,
  rule_a_id UUID NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  rule_b_id UUID NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  winner_id UUID NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL, -- rating change scaled by 100
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed rules (UUIDs are arbitrary; keep stable for dev). Safe to re-run.
INSERT INTO rules (id, text, rating, games_played, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Tell the truth, or at least don’t lie', 100000, 0, TRUE),
  ('22222222-2222-2222-2222-222222222222', 'Assume the person you are listening to knows something you don’t', 100000, 0, TRUE),
  ('33333333-3333-3333-3333-333333333333', 'Compare yourself to who you were yesterday, not to who someone else is today', 100000, 0, TRUE),
  ('44444444-4444-4444-4444-444444444444', 'Pursue what is meaningful, not what is expedient', 100000, 0, TRUE),
  ('55555555-5555-5555-5555-555555555555', 'Set your house in perfect order before you criticize the world', 100000, 0, TRUE),
  ('66666666-6666-6666-6666-666666666666', 'Stand up straight with your shoulders back', 100000, 0, TRUE),
  ('77777777-7777-7777-7777-777777777777', 'Be precise in your speech', 100000, 0, TRUE),
  ('88888888-8888-8888-8888-888888888888', 'Pet a cat when you encounter one on the street', 100000, 0, TRUE),
  ('99999999-9999-9999-9999-999999999999', 'Do not bother children when they are skateboarding', 100000, 0, TRUE),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Make at least one thing better every single day', 100000, 0, TRUE)
ON CONFLICT (id) DO NOTHING;


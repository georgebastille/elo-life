import { getProvider, getSqlite, pg, ensurePgSchema } from "@/db/client";
import { MatchesRepository, RuleRow, RulesRepository } from "./types";
import crypto from "node:crypto";

class SqliteRulesRepo implements RulesRepository {
  async create(text: string): Promise<RuleRow> {
    const db = getSqlite();
    const id = crypto.randomUUID();
    db.prepare(
      `INSERT INTO rules (id, text, rating, games_played, is_active) VALUES (?, ?, 100000, 0, 1)`
    ).run(id, text);
    const row = db.prepare(`SELECT id, text, rating, games_played, is_active FROM rules WHERE id = ?`).get(id) as RuleRow;
    return row;
  }
  async findById(id: string): Promise<RuleRow | null> {
    const db = getSqlite();
    const row = db.prepare(`SELECT id, text, rating, games_played, is_active FROM rules WHERE id = ?`).get(id) as RuleRow | undefined;
    return row || null;
  }
  async findByTextNormalized(normText: string): Promise<RuleRow | null> {
    const db = getSqlite();
    const row = db.prepare(
      `SELECT id, text, rating, games_played, is_active FROM rules WHERE lower(replace(text, '  ', ' ')) = ?`
    ).get(normText) as RuleRow | undefined;
    return row || null;
  }
  async listOrdered(limit: number, offset: number): Promise<RuleRow[]> {
    const db = getSqlite();
    const rows = db.prepare(
      `SELECT id, text, rating, games_played, is_active
       FROM rules WHERE is_active = 1
       ORDER BY rating DESC, games_played DESC, created_at ASC
       LIMIT ? OFFSET ?`
    ).all(limit, offset) as RuleRow[];
    return rows;
  }
  async incrementGames(ids: string[]): Promise<void> {
    const db = getSqlite();
    const stmt = db.prepare(`UPDATE rules SET games_played = games_played + 1 WHERE id = ?`);
    const tx = db.transaction((vals: string[]) => {
      for (const id of vals) stmt.run(id);
    });
    tx(ids);
  }
  async updateRatings(rows: { id: string; rating: number }[]): Promise<void> {
    const db = getSqlite();
    const stmt = db.prepare(`UPDATE rules SET rating = ? WHERE id = ?`);
    const tx = db.transaction((items: { id: string; rating: number }[]) => {
      for (const r of items) stmt.run(r.rating, r.id);
    });
    tx(rows);
  }
  async candidatePool(size: number): Promise<Pick<RuleRow, 'id' | 'text' | 'rating'>[]> {
    const db = getSqlite();
    const rows = db.prepare(
      `SELECT id, text, rating FROM rules WHERE is_active = 1
       ORDER BY games_played ASC, created_at ASC LIMIT ?`
    ).all(size) as Pick<RuleRow, 'id' | 'text' | 'rating'>[];
    return rows;
  }
}

class PostgresRulesRepo implements RulesRepository {
  async create(text: string): Promise<RuleRow> {
    await ensurePgSchema();
    const id = crypto.randomUUID();
    const { rows } = await pg`
      INSERT INTO rules (id, text, rating, games_played, is_active)
      VALUES (${id}, ${text}, 100000, 0, true)
      RETURNING id, text, rating, games_played, is_active`;
    const r = rows[0];
    return { ...r, is_active: !!r.is_active } as RuleRow;
  }
  async findById(id: string): Promise<RuleRow | null> {
    await ensurePgSchema();
    const { rows } = await pg`SELECT id, text, rating, games_played, is_active FROM rules WHERE id = ${id}`;
    const r = rows[0];
    return r ? ({ ...r, is_active: !!r.is_active } as RuleRow) : null;
  }
  async findByTextNormalized(normText: string): Promise<RuleRow | null> {
    await ensurePgSchema();
    const { rows } = await pg`
      SELECT id, text, rating, games_played, is_active
      FROM rules
      WHERE lower(regexp_replace(text, '\\s+', ' ', 'g')) = ${normText}`;
    const r = rows[0];
    return r ? ({ ...r, is_active: !!r.is_active } as RuleRow) : null;
  }
  async listOrdered(limit: number, offset: number): Promise<RuleRow[]> {
    await ensurePgSchema();
    const { rows } = await pg`
      SELECT id, text, rating, games_played, is_active
      FROM rules WHERE is_active = true
      ORDER BY rating DESC, games_played DESC, created_at ASC
      LIMIT ${limit} OFFSET ${offset}`;
    return rows.map((r) => ({ ...r, is_active: !!r.is_active } as RuleRow));
  }
  async incrementGames(ids: string[]): Promise<void> {
    await ensurePgSchema();
    for (const id of ids) {
      await pg`UPDATE rules SET games_played = games_played + 1 WHERE id = ${id}`;
    }
  }
  async updateRatings(rows: { id: string; rating: number }[]): Promise<void> {
    await ensurePgSchema();
    for (const r of rows) {
      await pg`UPDATE rules SET rating = ${r.rating} WHERE id = ${r.id}`;
    }
  }
  async candidatePool(size: number): Promise<Pick<RuleRow, 'id' | 'text' | 'rating'>[]> {
    await ensurePgSchema();
    const { rows } = await pg`
      SELECT id, text, rating FROM rules WHERE is_active = true
      ORDER BY games_played ASC, created_at ASC
      LIMIT ${size}`;
    return rows as Pick<RuleRow, 'id' | 'text' | 'rating'>[];
  }
}

export function getRulesRepository(): RulesRepository {
  return getProvider() === 'postgres' ? new PostgresRulesRepo() : new SqliteRulesRepo();
}

export function getMatchesRepository(): MatchesRepository {
  // convenience export for API imports; implemented in matchesRepo.ts
  throw new Error('Use getMatchesRepository from matchesRepo.ts');
}

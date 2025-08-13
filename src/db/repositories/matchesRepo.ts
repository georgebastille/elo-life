import { getProvider, getSqlite, pg } from "@/db/client";
import { MatchesRepository } from "./types";

class SqliteMatchesRepo implements MatchesRepository {
  async insert(args: { ruleAId: string; ruleBId: string; winnerId: string; delta: number }): Promise<void> {
    const db = getSqlite();
    db.prepare(
      `INSERT INTO matches (rule_a_id, rule_b_id, winner_id, delta) VALUES (?, ?, ?, ?)`
    ).run(args.ruleAId, args.ruleBId, args.winnerId, args.delta);
  }
}

class PostgresMatchesRepo implements MatchesRepository {
  async insert(args: { ruleAId: string; ruleBId: string; winnerId: string; delta: number }): Promise<void> {
    await pg`
      INSERT INTO matches (rule_a_id, rule_b_id, winner_id, delta)
      VALUES (${args.ruleAId}, ${args.ruleBId}, ${args.winnerId}, ${args.delta})`;
  }
}

export function getMatchesRepository(): MatchesRepository {
  return getProvider() === 'postgres' ? new PostgresMatchesRepo() : new SqliteMatchesRepo();
}


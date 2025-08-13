export type RuleRow = {
  id: string;
  text: string;
  rating: number; // scaled by 100
  games_played: number;
  is_active: number | boolean;
};

export interface RulesRepository {
  create(text: string): Promise<RuleRow>;
  findById(id: string): Promise<RuleRow | null>;
  findByTextNormalized(normText: string): Promise<RuleRow | null>;
  listOrdered(limit: number, offset: number): Promise<RuleRow[]>;
  incrementGames(ids: string[]): Promise<void>;
  updateRatings(rows: { id: string; rating: number }[]): Promise<void>;
  candidatePool(size: number): Promise<Pick<RuleRow, 'id' | 'text' | 'rating'>[]>;
}

export interface MatchesRepository {
  insert(args: { ruleAId: string; ruleBId: string; winnerId: string; delta: number }): Promise<void>;
}


export function expectedScore(ra: number, rb: number) {
  // ratings are scaled by 100; compute in real, keep precision by scaling down then up
  const Ra = ra / 100;
  const Rb = rb / 100;
  return 1 / (1 + Math.pow(10, (Rb - Ra) / 400));
}

export function updateElo(ra: number, rb: number, winner: 'A' | 'B', k: number) {
  const Ea = expectedScore(ra, rb);
  const Eb = 1 - Ea;
  const Sa = winner === 'A' ? 1 : 0;
  const Sb = 1 - Sa;
  const deltaA = Math.round(k * 100 * (Sa - Ea)); // scale by 100
  const deltaB = Math.round(k * 100 * (Sb - Eb));
  return { newA: ra + deltaA, newB: rb + deltaB, delta: Math.abs(deltaA) };
}


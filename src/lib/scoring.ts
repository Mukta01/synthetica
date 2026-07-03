/* ============================================
   SYNTHETICA — Scoring System
   Score = 1000 - (100 × mutations) - (2 × seconds)
   ============================================ */

export interface ScoreResult {
  score: number;
  stars: 0 | 1 | 2 | 3;
  breakdown: {
    basePoints: number;
    mutationPenalty: number;
    timePenalty: number;
  };
}

const BASE_POINTS = 1000;
const MUTATION_PENALTY = 100;
const TIME_PENALTY = 2;
const MIN_SCORE = 100;

/**
 * Calculate score from mutations used and time elapsed
 */
export function calculateScore(mutationsUsed: number, timeSeconds: number): ScoreResult {
  const mutationPenalty = MUTATION_PENALTY * mutationsUsed;
  const timePenalty = TIME_PENALTY * Math.floor(timeSeconds);
  
  const rawScore = BASE_POINTS - mutationPenalty - timePenalty;
  const score = Math.max(MIN_SCORE, rawScore);
  
  const stars: 0 | 1 | 2 | 3 = score >= 700 ? 3 : score >= 400 ? 2 : 1;
  
  return {
    score,
    stars,
    breakdown: {
      basePoints: BASE_POINTS,
      mutationPenalty,
      timePenalty,
    },
  };
}

/**
 * Format time in seconds to MM:SS display
 */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format score with leading zeros
 */
export function formatScore(score: number): string {
  return score.toString().padStart(4, '0');
}

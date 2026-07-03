/* ============================================
   SYNTHETICA — Type Definitions
   ============================================ */

// ---- Nucleotide ----
export type Nucleotide = 'A' | 'T' | 'C' | 'G';

// ---- Mutation Types ----
export type MutationType = 'swap' | 'insert' | 'delete';

export interface Mutation {
  type: MutationType;
  position: number;
  from?: string;
  to?: string;
  timestamp: number;
}

// ---- Codon & Amino Acid ----
export interface Codon {
  bases: [string, string, string];
  aminoAcid: string;
  index: number;
}

// ---- Puzzle ----
export interface Puzzle {
  id: string;
  environmentId: string;
  name: string;
  description: string;
  objective: string;
  difficulty: 1 | 2 | 3;
  baseSequence: string;
  targetTraits: TraitRequirement[];
  mutationBudget: number;
  hints: string[];
  parMutations: number;
  parTimeSeconds: number;
}

export interface TraitRequirement {
  trait: string;
  label: string;
  description: string;
  minLevel: number; // 0-100
}

// ---- Environment ----
export interface Environment {
  id: string;
  name: string;
  description: string;
  lore: string;
  conditions: {
    temperature?: number;
    toxicity?: number;
    radiation?: number;
    pressure?: number;
  };
  theme: {
    gradient: string;
    particleEffect: 'heat-shimmer' | 'toxic-bubbles' | 'none';
    accentColor: string;
    icon: string;
  };
  puzzles: Puzzle[];
  unlockRequirement: number;
}

// ---- Compilation ----
export interface CompilationResult {
  survived: boolean;
  score: number;
  stars: 0 | 1 | 2 | 3;
  mutationsUsed: number;
  timeSeconds: number;
  proteinStructure: {
    aminoAcids: string[];
    foldingStability: number;
  };
  survivalResult: {
    environmentalStress: number;
    organismResilience: number;
    failurePoint?: string;
    failureReason?: string;
    failurePhase?: 'membrane_integrity' | 'protein_stability' | 'metabolic_function' | 'dna_repair';
  };
  traits: TraitResult[];
}

export interface TraitResult {
  trait: string;
  label: string;
  level: number;
  required: number;
  met: boolean;
}

// ---- User ----
export interface UserStats {
  puzzlesCompleted: string[];
  bestScores: Record<string, {
    score: number;
    stars: number;
    mutations: number;
    timeSeconds: number;
  }>;
  totalPlaytime: number;
  totalMutations: number;
}

// ---- Leaderboard ----
export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  mutationsUsed: number;
  timeSeconds: number;
  stars: number;
  completedAt: string;
}

// ---- API Types ----
export interface EvaluateRequest {
  puzzleId: string;
  sequence: string;
  mutations: Mutation[];
  timeSeconds: number;
}

export interface EvaluateResponse {
  success: boolean;
  result: CompilationResult;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  totalPlayers: number;
  playerRank?: number;
}

export interface SubmitScoreRequest {
  puzzleId: string;
  score: number;
  mutationsUsed: number;
  timeSeconds: number;
  stars: number;
  sequence: string;
  playerName: string;
}

export interface RegisterRequest {
  username: string;
}

export interface RegisterResponse {
  playerId: string;
  token: string;
}

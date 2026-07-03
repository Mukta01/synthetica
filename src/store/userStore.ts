/* ============================================
   SYNTHETICA — User State Store (Zustand)
   Anonymous user, progress, localStorage persistence
   ============================================ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserStats } from '../lib/types';

interface UserState {
  // Identity
  username: string | null;
  playerId: string | null;
  token: string | null;
  isRegistered: boolean;

  // Stats
  stats: UserStats;

  // Progress
  unlockedEnvironments: string[];

  // Actions
  setUsername: (name: string) => void;
  setRegistered: (playerId: string, token: string) => void;
  recordCompletion: (
    puzzleId: string,
    score: number,
    stars: number,
    mutations: number,
    timeSeconds: number
  ) => void;
  unlockEnvironment: (envId: string) => void;
  getCompletedCount: (environmentId?: string) => number;
  getBestScore: (puzzleId: string) => UserStats['bestScores'][string] | undefined;
  resetProgress: () => void;
}

const INITIAL_STATS: UserStats = {
  puzzlesCompleted: [],
  bestScores: {},
  totalPlaytime: 0,
  totalMutations: 0,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      username: null,
      playerId: null,
      token: null,
      isRegistered: false,
      stats: { ...INITIAL_STATS },
      unlockedEnvironments: ['thermal-vent'],

      setUsername: (name) => {
        set({ username: name });
      },

      setRegistered: (playerId, token) => {
        set({ playerId, token, isRegistered: true });
      },

      recordCompletion: (puzzleId, score, stars, mutations, timeSeconds) => {
        const { stats } = get();
        const existing = stats.bestScores[puzzleId];

        // Only update if this is a new completion or better score
        const isNew = !stats.puzzlesCompleted.includes(puzzleId);
        const isBetter = !existing || score > existing.score;

        const newCompleted = isNew
          ? [...stats.puzzlesCompleted, puzzleId]
          : stats.puzzlesCompleted;

        const newBestScores = isBetter
          ? {
              ...stats.bestScores,
              [puzzleId]: { score, stars, mutations, timeSeconds },
            }
          : stats.bestScores;

        set({
          stats: {
            ...stats,
            puzzlesCompleted: newCompleted,
            bestScores: newBestScores,
            totalPlaytime: stats.totalPlaytime + timeSeconds,
            totalMutations: stats.totalMutations + mutations,
          },
        });

        // Auto-unlock Toxic Marsh after 3 Thermal Vent puzzles
        const thermalCompleted = newCompleted.filter(id => id.startsWith('tv-')).length;
        if (thermalCompleted >= 3) {
          get().unlockEnvironment('toxic-marsh');
        }
      },

      unlockEnvironment: (envId) => {
        const { unlockedEnvironments } = get();
        if (!unlockedEnvironments.includes(envId)) {
          set({ unlockedEnvironments: [...unlockedEnvironments, envId] });
        }
      },

      getCompletedCount: (environmentId) => {
        const { stats } = get();
        if (!environmentId) return stats.puzzlesCompleted.length;
        
        const prefix = environmentId === 'thermal-vent' ? 'tv-' : 'tm-';
        return stats.puzzlesCompleted.filter(id => id.startsWith(prefix)).length;
      },

      getBestScore: (puzzleId) => {
        return get().stats.bestScores[puzzleId];
      },

      resetProgress: () => {
        set({
          stats: { ...INITIAL_STATS },
          unlockedEnvironments: ['thermal-vent'],
        });
      },
    }),
    {
      name: 'synthetica-user',
      partialize: (state) => ({
        username: state.username,
        playerId: state.playerId,
        token: state.token,
        isRegistered: state.isRegistered,
        stats: state.stats,
        unlockedEnvironments: state.unlockedEnvironments,
      }),
    }
  )
);

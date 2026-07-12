/* ============================================
   SYNTHETICA — Game State Store (Zustand)
   Core puzzle state, mutations, undo/redo
   ============================================ */

import { create } from 'zustand';
import type { Puzzle, Mutation, MutationType, CompilationResult } from '../lib/types';
import { evaluateSequenceOffline } from '../lib/offlineEvaluator';
import { checkApiHealth, evaluateSequence } from '../lib/api';

interface GameState {
  // Puzzle
  currentPuzzle: Puzzle | null;
  originalSequence: string;
  currentSequence: string;
  mutationsUsed: number;
  mutationBudget: number;
  mutationLog: Mutation[];

  // Timer
  startTime: number | null;
  elapsedSeconds: number;
  timerInterval: ReturnType<typeof setInterval> | null;

  // History (undo/redo)
  history: string[];
  historyIndex: number;

  // UI State
  activeTool: MutationType | null;
  selectedIndex: number | null;
  isCompiling: boolean;
  compilationResult: CompilationResult | null;
  showResult: boolean;
  hintIndex: number;

  // Actions
  loadPuzzle: (puzzle: Puzzle) => void;
  setActiveTool: (tool: MutationType | null) => void;
  selectIndex: (index: number | null) => void;
  applySwap: (index: number, newNucleotide: string) => void;
  applyInsert: (index: number, nucleotide: string) => void;
  applyDelete: (index: number) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  compile: () => Promise<CompilationResult>;
  dismissResult: () => void;
  showNextHint: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  tick: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  currentPuzzle: null,
  originalSequence: '',
  currentSequence: '',
  mutationsUsed: 0,
  mutationBudget: 0,
  mutationLog: [],
  startTime: null,
  elapsedSeconds: 0,
  timerInterval: null,
  history: [],
  historyIndex: -1,
  activeTool: null,
  selectedIndex: null,
  isCompiling: false,
  compilationResult: null,
  showResult: false,
  hintIndex: -1,

  loadPuzzle: (puzzle: Puzzle) => {
    // Clear any existing timer
    const { timerInterval } = get();
    if (timerInterval) clearInterval(timerInterval);

    set({
      currentPuzzle: puzzle,
      originalSequence: puzzle.baseSequence,
      currentSequence: puzzle.baseSequence,
      mutationsUsed: 0,
      mutationBudget: puzzle.mutationBudget,
      mutationLog: [],
      history: [puzzle.baseSequence],
      historyIndex: 0,
      activeTool: null,
      selectedIndex: null,
      isCompiling: false,
      compilationResult: null,
      showResult: false,
      hintIndex: -1,
      startTime: null,
      elapsedSeconds: 0,
      timerInterval: null,
    });
  },

  setActiveTool: (tool) => {
    set({ activeTool: tool, selectedIndex: null });
  },

  selectIndex: (index) => {
    set({ selectedIndex: index });
  },

  applySwap: (index, newNucleotide) => {
    const { currentSequence, mutationsUsed, mutationBudget, history, historyIndex, mutationLog } = get();
    if (mutationsUsed >= mutationBudget) return;
    if (index < 0 || index >= currentSequence.length) return;
    if (currentSequence[index] === newNucleotide) return;

    const newSequence =
      currentSequence.substring(0, index) +
      newNucleotide +
      currentSequence.substring(index + 1);

    const mutation: Mutation = {
      type: 'swap',
      position: index,
      from: currentSequence[index],
      to: newNucleotide,
      timestamp: Date.now(),
    };

    // Trim future history (if we undid something then made a new change)
    const newHistory = [...history.slice(0, historyIndex + 1), newSequence];

    set({
      currentSequence: newSequence,
      mutationsUsed: mutationsUsed + 1,
      mutationLog: [...mutationLog, mutation],
      history: newHistory,
      historyIndex: newHistory.length - 1,
      selectedIndex: null,
    });
  },

  applyInsert: (index, nucleotide) => {
    const { currentSequence, mutationsUsed, mutationBudget, history, historyIndex, mutationLog } = get();
    if (mutationsUsed >= mutationBudget) return;
    if (index < 0 || index > currentSequence.length) return;

    const newSequence =
      currentSequence.substring(0, index) +
      nucleotide +
      currentSequence.substring(index);

    const mutation: Mutation = {
      type: 'insert',
      position: index,
      to: nucleotide,
      timestamp: Date.now(),
    };

    const newHistory = [...history.slice(0, historyIndex + 1), newSequence];

    set({
      currentSequence: newSequence,
      mutationsUsed: mutationsUsed + 1,
      mutationLog: [...mutationLog, mutation],
      history: newHistory,
      historyIndex: newHistory.length - 1,
      selectedIndex: null,
    });
  },

  applyDelete: (index) => {
    const { currentSequence, mutationsUsed, mutationBudget, history, historyIndex, mutationLog } = get();
    if (mutationsUsed >= mutationBudget) return;
    if (index < 0 || index >= currentSequence.length) return;
    if (currentSequence.length <= 3) return; // Don't allow deleting below minimum

    const mutation: Mutation = {
      type: 'delete',
      position: index,
      from: currentSequence[index],
      timestamp: Date.now(),
    };

    const newSequence =
      currentSequence.substring(0, index) +
      currentSequence.substring(index + 1);

    const newHistory = [...history.slice(0, historyIndex + 1), newSequence];

    set({
      currentSequence: newSequence,
      mutationsUsed: mutationsUsed + 1,
      mutationLog: [...mutationLog, mutation],
      history: newHistory,
      historyIndex: newHistory.length - 1,
      selectedIndex: null,
    });
  },

  undo: () => {
    const { history, historyIndex, mutationsUsed, mutationLog } = get();
    if (historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    set({
      currentSequence: history[newIndex],
      historyIndex: newIndex,
      mutationsUsed: Math.max(0, mutationsUsed - 1),
      mutationLog: mutationLog.slice(0, -1),
      selectedIndex: null,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;
    set({
      currentSequence: history[newIndex],
      historyIndex: newIndex,
      mutationsUsed: newIndex,
      selectedIndex: null,
    });
  },

  reset: () => {
    const { currentPuzzle, timerInterval } = get();
    if (!currentPuzzle) return;
    if (timerInterval) clearInterval(timerInterval);

    set({
      currentSequence: currentPuzzle.baseSequence,
      mutationsUsed: 0,
      mutationLog: [],
      history: [currentPuzzle.baseSequence],
      historyIndex: 0,
      activeTool: null,
      selectedIndex: null,
      compilationResult: null,
      showResult: false,
      hintIndex: -1,
      startTime: null,
      elapsedSeconds: 0,
      timerInterval: null,
    });
  },

  compile: async () => {
    const { currentPuzzle, currentSequence, mutationLog, elapsedSeconds } = get();
    if (!currentPuzzle) throw new Error('No puzzle loaded');

    set({ isCompiling: true, selectedIndex: null, activeTool: null });

    // Simulate compilation time for animation
    await new Promise(resolve => setTimeout(resolve, 6000));

    let result: CompilationResult;

    try {
      const isOnline = await checkApiHealth();
      if (isOnline) {
        const response = await evaluateSequence({
          puzzleId: currentPuzzle.id,
          sequence: currentSequence,
          mutations: mutationLog,
          timeSeconds: elapsedSeconds,
        });
        if (response.success) {
          result = response.result;
        } else {
          throw new Error('API evaluation failed');
        }
      } else {
        throw new Error('API offline');
      }
    } catch (err) {
      console.warn('Backend evaluation unavailable, falling back to offline evaluator:', err);
      result = evaluateSequenceOffline(
        currentPuzzle,
        currentSequence,
        mutationLog,
        elapsedSeconds
      );
    }

    set({
      isCompiling: false,
      compilationResult: result,
      showResult: true,
    });

    return result;
  },

  dismissResult: () => {
    set({ showResult: false });
  },

  showNextHint: () => {
    const { currentPuzzle, hintIndex } = get();
    if (!currentPuzzle) return;
    if (hintIndex >= currentPuzzle.hints.length - 1) return;
    set({ hintIndex: hintIndex + 1 });
  },

  startTimer: () => {
    const { timerInterval } = get();
    if (timerInterval) return;

    const interval = setInterval(() => {
      get().tick();
    }, 1000);

    set({
      startTime: Date.now(),
      timerInterval: interval,
    });
  },

  stopTimer: () => {
    const { timerInterval } = get();
    if (timerInterval) {
      clearInterval(timerInterval);
      set({ timerInterval: null });
    }
  },

  tick: () => {
    const { startTime } = get();
    if (!startTime) return;
    set({ elapsedSeconds: Math.floor((Date.now() - startTime) / 1000) });
  },
}));

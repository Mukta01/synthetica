'use client';

import { useGameStore } from '../../store/gameStore';
import { formatTime } from '../../lib/scoring';
import styles from './PuzzleBriefing.module.css';

interface PuzzleBriefingProps {
  environmentName: string;
  environmentIcon: string;
}

export default function PuzzleBriefing({ environmentName, environmentIcon }: PuzzleBriefingProps) {
  const puzzle = useGameStore(s => s.currentPuzzle);
  const elapsed = useGameStore(s => s.elapsedSeconds);
  const mutations = useGameStore(s => s.mutationsUsed);
  const budget = useGameStore(s => s.mutationBudget);
  const hintIndex = useGameStore(s => s.hintIndex);
  const showNextHint = useGameStore(s => s.showNextHint);

  if (!puzzle) return null;

  const difficultyLabels = ['', 'BASIC', 'ADVANCED', 'EXPERT'];
  const difficultyColors = ['', 'var(--accent-green)', 'var(--accent-amber)', 'var(--accent-red)'];

  return (
    <div className={styles.container}>
      {/* Environment & Puzzle Name */}
      <div className={styles.header}>
        <div className={styles.envTag}>
          <span className={styles.envIcon}>{environmentIcon}</span>
          <span className={styles.envName}>{environmentName}</span>
        </div>
        <h2 className={styles.puzzleName}>{puzzle.name}</h2>
        <span
          className={styles.difficulty}
          style={{ color: difficultyColors[puzzle.difficulty] }}
        >
          {difficultyLabels[puzzle.difficulty]}
        </span>
      </div>

      {/* Objective */}
      <div className={styles.objective}>
        <span className={styles.label}>OBJECTIVE</span>
        <p className={styles.objectiveText}>{puzzle.objective}</p>
      </div>

      {/* Required Traits */}
      <div className={styles.traitsRequired}>
        <span className={styles.label}>REQUIRED TRAITS</span>
        <div className={styles.traitTags}>
          {puzzle.targetTraits.map(t => (
            <span key={t.trait} className={styles.traitTag}>
              {t.label} ≥ {t.minLevel}%
            </span>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{formatTime(elapsed)}</span>
          <span className={styles.statLabel}>TIME</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statValue} ${mutations >= budget ? styles.exhausted : ''}`}>
            {mutations}/{budget}
          </span>
          <span className={styles.statLabel}>MUTATIONS</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{puzzle.baseSequence.length}</span>
          <span className={styles.statLabel}>BASE PAIRS</span>
        </div>
      </div>

      {/* Hints */}
      <div className={styles.hints}>
        {hintIndex >= 0 && puzzle.hints.slice(0, hintIndex + 1).map((hint, i) => (
          <div key={i} className={styles.hint}>
            <span className={styles.hintIcon}>💡</span>
            <span className={styles.hintText}>{hint}</span>
          </div>
        ))}
        {hintIndex < puzzle.hints.length - 1 && (
          <button className={styles.hintBtn} onClick={showNextHint}>
            {hintIndex === -1 ? '💡 SHOW HINT' : '💡 NEXT HINT'}
            <span className={styles.hintCount}>
              ({hintIndex + 2}/{puzzle.hints.length})
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

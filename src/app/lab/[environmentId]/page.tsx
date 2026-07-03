'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getEnvironment } from '../../../data/puzzles';
import { useUserStore } from '../../../store/userStore';
import styles from './page.module.css';

export default function EnvironmentPage({ params }: { params: Promise<{ environmentId: string }> }) {
  const { environmentId } = use(params);
  const router = useRouter();
  const env = getEnvironment(environmentId);
  const stats = useUserStore(s => s.stats);

  if (!env) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>Environment not found.</p>
        <button className={styles.backBtn} onClick={() => router.push('/lab')}>← BACK TO LAB</button>
      </div>
    );
  }

  const difficultyLabels = ['', 'BASIC', 'ADVANCED', 'EXPERT'];
  const difficultyColors = ['', 'var(--accent-green)', 'var(--accent-amber)', 'var(--accent-red)'];

  return (
    <div className={styles.container}>
      {/* Environment BG */}
      <div className={styles.envBg} style={{ background: env.theme.gradient }} />

      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className={styles.backBtn} onClick={() => router.push('/lab')}>
          ← LAB
        </button>
        <div className={styles.headerCenter}>
          <span className={styles.envIcon}>{env.theme.icon}</span>
          <h1 className={styles.envName}>{env.name}</h1>
          <p className={styles.envDesc}>{env.description}</p>
        </div>
        <div className={styles.envStats}>
          <span style={{ color: env.theme.accentColor }}>
            {env.conditions.temperature && `🌡️ ${env.conditions.temperature}°C`}
            {env.conditions.toxicity && ` ☠️ ${env.conditions.toxicity}%`}
          </span>
        </div>
      </motion.div>

      {/* Puzzle Grid */}
      <div className={styles.puzzleGrid}>
        {env.puzzles.map((puzzle, index) => {
          const best = stats.bestScores[puzzle.id];
          const isCompleted = stats.puzzlesCompleted.includes(puzzle.id);

          return (
            <motion.div
              key={puzzle.id}
              className={`${styles.puzzleCard} ${isCompleted ? styles.completed : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.08 }}
              onClick={() => router.push(`/lab/${environmentId}/${puzzle.id}`)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Puzzle Number */}
              <div
                className={styles.puzzleNumber}
                style={{ borderColor: isCompleted ? env.theme.accentColor : 'var(--border-default)' }}
              >
                <span style={isCompleted ? { color: env.theme.accentColor } : {}}>
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Puzzle Info */}
              <div className={styles.puzzleInfo}>
                <h3 className={styles.puzzleName}>{puzzle.name}</h3>
                <p className={styles.puzzleDesc}>{puzzle.description}</p>

                <div className={styles.puzzleMeta}>
                  <span
                    className={styles.difficulty}
                    style={{ color: difficultyColors[puzzle.difficulty] }}
                  >
                    {difficultyLabels[puzzle.difficulty]}
                  </span>
                  <span className={styles.budget}>
                    🧬 {puzzle.mutationBudget} mutations
                  </span>
                  <span className={styles.traits}>
                    {puzzle.targetTraits.length} trait{puzzle.targetTraits.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Score */}
              <div className={styles.puzzleScore}>
                {isCompleted ? (
                  <>
                    <div className={styles.stars}>
                      {[1, 2, 3].map(s => (
                        <span
                          key={s}
                          className={styles.star}
                          style={{ opacity: best && s <= best.stars ? 1 : 0.2 }}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className={styles.scoreValue}>{best?.score}</span>
                  </>
                ) : (
                  <span className={styles.incomplete}>—</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

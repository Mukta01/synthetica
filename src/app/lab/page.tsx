'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getAllEnvironments } from '../../data/puzzles';
import { useUserStore } from '../../store/userStore';
import styles from './page.module.css';

export default function LabPage() {
  const router = useRouter();
  const environments = getAllEnvironments();
  const unlockedEnvironments = useUserStore(s => s.unlockedEnvironments);
  const stats = useUserStore(s => s.stats);

  const getCompletedCount = (envId: string) => {
    const prefix = envId === 'thermal-vent' ? 'tv-' : 'tm-';
    return stats.puzzlesCompleted.filter(id => id.startsWith(prefix)).length;
  };

  const getEnvStars = (envId: string) => {
    const prefix = envId === 'thermal-vent' ? 'tv-' : 'tm-';
    let total = 0;
    for (const [id, score] of Object.entries(stats.bestScores)) {
      if (id.startsWith(prefix)) total += score.stars;
    }
    return total;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button className={styles.backButton} onClick={() => router.push('/')}>
          ← TERMINAL
        </button>
        <div className={styles.headerCenter}>
          <h1 className={styles.headerTitle}>RESEARCH LAB</h1>
          <p className={styles.headerSubtitle}>Select an environment to begin genome engineering</p>
        </div>
        <button className={styles.leaderboardButton} onClick={() => router.push('/leaderboard')}>
          📊 LEADERBOARD
        </button>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        className={styles.statsBar}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.puzzlesCompleted.length}</span>
          <span className={styles.statLabel}>PUZZLES SOLVED</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.totalMutations}</span>
          <span className={styles.statLabel}>TOTAL MUTATIONS</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {Object.values(stats.bestScores).reduce((sum, s) => sum + s.stars, 0)}
          </span>
          <span className={styles.statLabel}>STARS EARNED</span>
        </div>
      </motion.div>

      {/* Environment Cards */}
      <div className={styles.environments}>
        {environments.map((env, index) => {
          const isUnlocked = unlockedEnvironments.includes(env.id);
          const completed = getCompletedCount(env.id);
          const totalPuzzles = env.puzzles.length;
          const totalStars = getEnvStars(env.id);
          const maxStars = totalPuzzles * 3;

          return (
            <motion.div
              key={env.id}
              className={`${styles.envCard} ${!isUnlocked ? styles.locked : ''}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.15, duration: 0.5 }}
              onClick={() => isUnlocked && router.push(`/lab/${env.id}`)}
              style={{ cursor: isUnlocked ? 'pointer' : 'default' }}
            >
              {/* Background Gradient */}
              <div
                className={styles.envBg}
                style={{ background: env.theme.gradient }}
              />

              {/* Lock Overlay */}
              {!isUnlocked && (
                <div className={styles.lockOverlay}>
                  <div className={styles.lockIcon}>🔒</div>
                  <p className={styles.lockText}>
                    Complete {env.unlockRequirement} Thermal Vent puzzles to unlock
                  </p>
                </div>
              )}

              {/* Content */}
              <div className={styles.envContent}>
                <div className={styles.envHeader}>
                  <span className={styles.envIcon}>{env.theme.icon}</span>
                  <div>
                    <h2 className={styles.envName}>{env.name}</h2>
                    <p className={styles.envConditions}>
                      {env.conditions.temperature && `${env.conditions.temperature}°C`}
                      {env.conditions.temperature && env.conditions.toxicity && ' • '}
                      {env.conditions.toxicity && `Toxicity: ${env.conditions.toxicity}%`}
                    </p>
                  </div>
                </div>

                <p className={styles.envDescription}>{env.description}</p>

                <div className={styles.envLore}>{env.lore}</div>

                {/* Progress */}
                <div className={styles.envProgress}>
                  <div className={styles.progressRow}>
                    <span className={styles.progressLabel}>
                      PUZZLES: {completed}/{totalPuzzles}
                    </span>
                    <span className={styles.progressLabel}>
                      ⭐ {totalStars}/{maxStars}
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${(completed / totalPuzzles) * 100}%`,
                        background: env.theme.accentColor,
                        boxShadow: `0 0 10px ${env.theme.accentColor}40`,
                      }}
                    />
                  </div>
                </div>

                {/* Puzzle List Preview */}
                <div className={styles.puzzlePreview}>
                  {env.puzzles.map((puzzle) => {
                    const best = stats.bestScores[puzzle.id];
                    const isCompleted = stats.puzzlesCompleted.includes(puzzle.id);
                    return (
                      <div
                        key={puzzle.id}
                        className={`${styles.puzzleDot} ${isCompleted ? styles.puzzleDotCompleted : ''}`}
                        title={`${puzzle.name} — ${isCompleted ? `${best?.stars}⭐` : 'Incomplete'}`}
                        style={isCompleted ? { background: env.theme.accentColor } : {}}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Hover Arrow */}
              {isUnlocked && (
                <div className={styles.envArrow}>→</div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

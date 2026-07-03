'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../../store/gameStore';
import { useUserStore } from '../../store/userStore';
import { formatTime, formatScore } from '../../lib/scoring';
import styles from './ResultModal.module.css';

interface ResultModalProps {
  environmentId: string;
}

export default function ResultModal({ environmentId }: ResultModalProps) {
  const router = useRouter();
  const { compilationResult, showResult, dismissResult, currentPuzzle } = useGameStore();
  const recordCompletion = useUserStore(s => s.recordCompletion);

  if (!showResult || !compilationResult || !currentPuzzle) return null;

  const { survived, score, stars, mutationsUsed, timeSeconds, survivalResult, traits } = compilationResult;

  const handleContinue = () => {
    if (survived) {
      recordCompletion(currentPuzzle.id, score, stars, mutationsUsed, timeSeconds);
    }
    dismissResult();
  };

  const handleNextPuzzle = () => {
    if (survived) {
      recordCompletion(currentPuzzle.id, score, stars, mutationsUsed, timeSeconds);
    }
    dismissResult();
    router.push(`/lab/${environmentId}`);
  };

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`${styles.modal} ${survived ? styles.success : styles.failure}`}
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Header */}
        <div className={styles.header}>
          {survived ? (
            <>
              <motion.div
                className={styles.successIcon}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                🧬
              </motion.div>
              <h2 className={styles.title}>ORGANISM VIABLE</h2>
              <p className={styles.subtitle}>Your engineered organism has survived the environment.</p>
            </>
          ) : (
            <>
              <motion.div
                className={styles.failIcon}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                💀
              </motion.div>
              <h2 className={styles.titleFail}>SEQUENCE REJECTED</h2>
              <p className={styles.subtitle}>Your organism did not survive.</p>
            </>
          )}
        </div>

        {survived ? (
          <>
            {/* Stars */}
            <div className={styles.starsRow}>
              {[1, 2, 3].map(s => (
                <motion.span
                  key={s}
                  className={styles.star}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: s <= stars ? 1 : 0.6,
                    opacity: s <= stars ? 1 : 0.2,
                  }}
                  transition={{ delay: 0.4 + s * 0.15, type: 'spring' }}
                >
                  ⭐
                </motion.span>
              ))}
            </div>

            {/* Score */}
            <motion.div
              className={styles.scoreSection}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <span className={styles.scoreLabel}>SCORE</span>
              <span className={styles.scoreValue}>{formatScore(score)}</span>
            </motion.div>

            {/* Stats */}
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statVal}>{mutationsUsed}</span>
                <span className={styles.statLbl}>MUTATIONS</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statVal}>{formatTime(timeSeconds)}</span>
                <span className={styles.statLbl}>TIME</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statVal}>{compilationResult.proteinStructure.foldingStability}%</span>
                <span className={styles.statLbl}>STABILITY</span>
              </div>
            </div>

            {/* Trait Results */}
            <div className={styles.traitResults}>
              {traits.map(t => (
                <div key={t.trait} className={styles.traitRow}>
                  <span className={styles.traitCheck}>✓</span>
                  <span className={styles.traitName}>{t.label}</span>
                  <span className={styles.traitLevel}>{t.level}%</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Failure Details */}
            <div className={styles.failureDetails}>
              {survivalResult.failurePoint && (
                <div className={styles.failPoint}>
                  <span className={styles.failLabel}>FAILURE POINT</span>
                  <span className={styles.failValue}>{survivalResult.failurePoint}</span>
                </div>
              )}
              {survivalResult.failureReason && (
                <div className={styles.failReason}>
                  <span className={styles.failLabel}>DIAGNOSIS</span>
                  <p className={styles.failReasonText}>{survivalResult.failureReason}</p>
                </div>
              )}
            </div>

            {/* Trait Results */}
            <div className={styles.traitResults}>
              {traits.map(t => (
                <div key={t.trait} className={`${styles.traitRow} ${t.met ? '' : styles.traitFailed}`}>
                  <span className={styles.traitCheck}>{t.met ? '✓' : '✗'}</span>
                  <span className={styles.traitName}>{t.label}</span>
                  <span className={styles.traitLevel}>
                    {t.level}% / {t.required}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          {survived ? (
            <>
              <button className={styles.primaryBtn} onClick={handleNextPuzzle}>
                📋 PUZZLE SELECT
              </button>
              <button className={styles.secondaryBtn} onClick={handleContinue}>
                🔄 RETRY FOR BETTER SCORE
              </button>
            </>
          ) : (
            <>
              <button className={styles.primaryBtn} onClick={handleContinue}>
                🔄 TRY AGAIN
              </button>
              <button className={styles.secondaryBtn} onClick={handleNextPuzzle}>
                📋 PUZZLE SELECT
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

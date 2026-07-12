'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllEnvironments } from '../../data/puzzles';
import { useUserStore } from '../../store/userStore';
import { formatTime, formatScore } from '../../lib/scoring';
import { checkApiHealth, getLeaderboard, getGlobalLeaderboard, submitScore, registerUser } from '../../lib/api';
import type { LeaderboardEntry } from '../../lib/types';
import styles from './page.module.css';

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, playerName: 'GeneSplicer42', score: 920, mutationsUsed: 1, timeSeconds: 32, stars: 3, completedAt: '2026-07-01' },
  { rank: 2, playerName: 'CRISPR_Queen', score: 850, mutationsUsed: 2, timeSeconds: 45, stars: 3, completedAt: '2026-07-01' },
  { rank: 3, playerName: 'HelixHunter', score: 780, mutationsUsed: 2, timeSeconds: 78, stars: 3, completedAt: '2026-06-30' },
  { rank: 4, playerName: 'BioNerd99', score: 720, mutationsUsed: 3, timeSeconds: 62, stars: 3, completedAt: '2026-06-30' },
  { rank: 5, playerName: 'MutationMaster', score: 650, mutationsUsed: 3, timeSeconds: 95, stars: 2, completedAt: '2026-06-29' },
  { rank: 6, playerName: 'DNADancer', score: 580, mutationsUsed: 4, timeSeconds: 55, stars: 2, completedAt: '2026-06-29' },
  { rank: 7, playerName: 'CodonCrafter', score: 520, mutationsUsed: 4, timeSeconds: 110, stars: 2, completedAt: '2026-06-28' },
  { rank: 8, playerName: 'ProteinPro', score: 450, mutationsUsed: 5, timeSeconds: 88, stars: 2, completedAt: '2026-06-28' },
  { rank: 9, playerName: 'NucleotideNinja', score: 380, mutationsUsed: 5, timeSeconds: 120, stars: 1, completedAt: '2026-06-27' },
  { rank: 10, playerName: 'SequenceSlayer', score: 310, mutationsUsed: 6, timeSeconds: 145, stars: 1, completedAt: '2026-06-27' },
];

export default function LeaderboardPage() {
  const router = useRouter();
  const environments = getAllEnvironments();
  const stats = useUserStore(s => s.stats);
  const username = useUserStore(s => s.username);
  const isRegistered = useUserStore(s => s.isRegistered);
  const setUsername = useUserStore(s => s.setUsername);
  const setRegistered = useUserStore(s => s.setRegistered);
  
  const [selectedPuzzle, setSelectedPuzzle] = useState<string>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Registration form
  const [regInput, setRegInput] = useState('');
  const [regError, setRegError] = useState('');
  const [showRegModal, setShowRegModal] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState<Record<string, boolean>>({});

  const fetchScores = useCallback(async () => {
    setLoading(true);
    try {
      const online = await checkApiHealth();
      setIsOnline(online);
      if (online) {
        const response = selectedPuzzle === 'all' 
          ? await getGlobalLeaderboard()
          : await getLeaderboard(selectedPuzzle);
        setEntries(response.entries);
      } else {
        setEntries(MOCK_LEADERBOARD);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setEntries(MOCK_LEADERBOARD);
    } finally {
      setLoading(false);
    }
  }, [selectedPuzzle]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regInput.trim()) return;

    try {
      const response = await registerUser({ username: regInput.trim() });
      if (response.playerId) {
        setUsername(regInput.trim());
        setRegistered(response.playerId, response.token);
        localStorage.setItem('synthetica_token', response.token);
        setShowRegModal(false);
        fetchScores();
      }
    } catch (err) {
      setRegError('Registration failed. Try a different username.');
      console.error(err);
    }
  };

  const handleSubmitScore = async (puzzleId: string, bestScore: any) => {
    if (!username || !isRegistered) {
      setShowRegModal(true);
      return;
    }

    setIsSubmittingScore(prev => ({ ...prev, [puzzleId]: true }));
    try {
      await submitScore({
        puzzleId,
        score: bestScore.score,
        mutationsUsed: bestScore.mutations,
        timeSeconds: bestScore.timeSeconds,
        stars: bestScore.stars,
        sequence: '', // optional sequence info
        playerName: username
      });
      alert('Score submitted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit score.');
    } finally {
      setIsSubmittingScore(prev => ({ ...prev, [puzzleId]: false }));
    }
  };

  const allPuzzles = environments.flatMap(env =>
    env.puzzles.map(p => ({ id: p.id, name: p.name, envName: env.name, envIcon: env.theme.icon }))
  );

  const rankColors = ['', '#ffd700', '#c0c0c0', '#cd7f32'];

  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className={styles.backBtn} onClick={() => router.push('/lab')}>
          ← LAB
        </button>
        <div className={styles.headerCenter} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Image src="/logo.png" alt="Synthetica Logo" width={32} height={32} style={{ objectFit: 'contain' }} />
            <h1 className={styles.title}>GLOBAL LEADERBOARD</h1>
          </div>
          <p className={styles.subtitle}>Most efficient mutations worldwide</p>
        </div>
        <div className={styles.headerRight}>
          {isOnline ? (
            username ? (
              <span className={styles.username}>👤 {username}</span>
            ) : (
              <button className={styles.registerBtn} onClick={() => setShowRegModal(true)}>
                🔑 REGISTER
              </button>
            )
          ) : (
            <span className={styles.offlineNote}>OFFLINE MODE</span>
          )}
        </div>
      </motion.div>

      {/* Puzzle Filter */}
      <motion.div
        className={styles.filterBar}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <button
          className={`${styles.filterBtn} ${selectedPuzzle === 'all' ? styles.filterActive : ''}`}
          onClick={() => setSelectedPuzzle('all')}
        >
          ALL PUZZLES
        </button>
        {allPuzzles.map(p => (
          <button
            key={p.id}
            className={`${styles.filterBtn} ${selectedPuzzle === p.id ? styles.filterActive : ''}`}
            onClick={() => setSelectedPuzzle(p.id)}
          >
            {p.envIcon} {p.name}
          </button>
        ))}
      </motion.div>

      {/* Leaderboard Table */}
      <motion.div
        className={styles.table}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className={styles.tableHeader}>
          <span className={styles.colRank}>RANK</span>
          <span className={styles.colPlayer}>PLAYER</span>
          <span className={styles.colScore}>SCORE</span>
          <span className={styles.colStars}>STARS</span>
          <span className={styles.colMutations}>MUTATIONS</span>
          <span className={styles.colTime}>TIME</span>
        </div>

        {loading ? (
          <div className={styles.loadingState}>LOADING SCORES...</div>
        ) : (
          entries.map((entry, index) => (
            <motion.div
              key={`${entry.playerName}-${index}`}
              className={`${styles.tableRow} ${entry.rank <= 3 ? styles.topThree : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <span
                className={styles.colRank}
                style={entry.rank <= 3 ? { color: rankColors[entry.rank] } : {}}
              >
                {entry.rank <= 3 ? ['', '🥇', '🥈', '🥉'][entry.rank] : `#${entry.rank}`}
              </span>
              <span className={styles.colPlayer}>{entry.playerName}</span>
              <span className={styles.colScore}>{formatScore(entry.score)}</span>
              <span className={styles.colStars}>
                {[1, 2, 3].map(s => (
                  <span key={s} style={{ opacity: s <= entry.stars ? 1 : 0.2 }}>⭐</span>
                ))}
              </span>
              <span className={styles.colMutations}>{entry.mutationsUsed}</span>
              <span className={styles.colTime}>{formatTime(entry.timeSeconds)}</span>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Your Best Scores */}
      {Object.keys(stats.bestScores).length > 0 && (
        <motion.div
          className={styles.yourScores}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className={styles.yourScoresTitle}>YOUR BEST SCORES</h3>
          <div className={styles.yourScoresGrid}>
            {Object.entries(stats.bestScores).map(([puzzleId, best]) => {
              const puzzleInfo = allPuzzles.find(p => p.id === puzzleId);
              return (
                <div key={puzzleId} className={styles.yourScoreCard}>
                  <div className={styles.yourScoreHeader}>
                    <span className={styles.yourScoreName}>
                      {puzzleInfo?.envIcon} {puzzleInfo?.name || puzzleId}
                    </span>
                    {isOnline && (
                      <button 
                        className={styles.submitScoreBtn} 
                        onClick={() => handleSubmitScore(puzzleId, best)}
                        disabled={isSubmittingScore[puzzleId]}
                      >
                        {isSubmittingScore[puzzleId] ? '...' : 'UP'}
                      </button>
                    )}
                  </div>
                  <span className={styles.yourScoreValue}>{formatScore(best.score)}</span>
                  <span className={styles.yourScoreStars}>
                    {[1, 2, 3].map(s => (
                      <span key={s} style={{ opacity: s <= best.stars ? 1 : 0.2 }}>⭐</span>
                    ))}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Registration Modal */}
      <AnimatePresence>
        {showRegModal && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={styles.regModal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className={styles.modalTitle}>ENTER LEADERBOARD ALIAS</h3>
              <form onSubmit={handleRegister} className={styles.form}>
                <input 
                  type="text" 
                  className={styles.regInput} 
                  placeholder="Researcher Name"
                  value={regInput}
                  onChange={(e) => setRegInput(e.target.value)}
                  maxLength={15}
                  required
                />
                {regError && <p className={styles.regError}>{regError}</p>}
                <div className={styles.modalActions}>
                  <button type="submit" className={styles.modalSubmit}>REGISTER</button>
                  <button type="button" className={styles.modalCancel} onClick={() => setShowRegModal(false)}>CANCEL</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

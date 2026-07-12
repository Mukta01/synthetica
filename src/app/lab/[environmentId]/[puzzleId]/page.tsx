'use client';

import { use, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getPuzzle, getEnvironmentForPuzzle } from '../../../../data/puzzles';
import { useGameStore } from '../../../../store/gameStore';
import SequenceEditor from '../../../../components/genome-editor/SequenceEditor';
import MutationToolbar from '../../../../components/genome-editor/MutationToolbar';
import ProteinPreview from '../../../../components/genome-editor/ProteinPreview';
import OrganismVisual from '../../../../components/genome-editor/OrganismVisual';
import PuzzleBriefing from '../../../../components/genome-editor/PuzzleBriefing';
import CompileAnimation from '../../../../components/genome-editor/CompileAnimation';
import ResultModal from '../../../../components/genome-editor/ResultModal';
import styles from './page.module.css';

export default function PuzzlePage({
  params,
}: {
  params: Promise<{ environmentId: string; puzzleId: string }>;
}) {
  const { environmentId, puzzleId } = use(params);
  const router = useRouter();
  const puzzle = getPuzzle(puzzleId);
  const environment = getEnvironmentForPuzzle(puzzleId);
  const loadPuzzle = useGameStore(s => s.loadPuzzle);
  const startTimer = useGameStore(s => s.startTimer);
  const currentPuzzle = useGameStore(s => s.currentPuzzle);
  const isCompiling = useGameStore(s => s.isCompiling);

  useEffect(() => {
    if (puzzle && puzzle.id !== currentPuzzle?.id) {
      loadPuzzle(puzzle);
    }
  }, [puzzle, currentPuzzle?.id, loadPuzzle]);

  // Start timer on first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      startTimer();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [startTimer]);

  if (!puzzle || !environment) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Puzzle not found.</p>
          <button className={styles.backBtn} onClick={() => router.push('/lab')}>
            ← BACK TO LAB
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Environment Background */}
      <div className={styles.envBg} style={{ background: environment.theme.gradient }} />

      {/* Top Bar */}
      <motion.div
        className={styles.topBar}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          className={styles.backBtn}
          onClick={() => router.push(`/lab/${environmentId}`)}
        >
          ← PUZZLES
        </button>
        <div className={styles.topBarCenter}>
          <span className={styles.envBadge}>
            {environment.theme.icon} {environment.name}
          </span>
          <span className={styles.puzzleTitle}>{puzzle.name}</span>
        </div>
        <div className={styles.topBarRight} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={styles.offlineTag}>⚡ OFFLINE</span>
          <Image src="/logo.png" alt="Synthetica Logo" width={32} height={32} style={{ objectFit: 'contain' }} />
        </div>
      </motion.div>

      {/* Main Layout */}
      <div className={styles.layout}>
        {/* Left Panel: Briefing + Toolbar */}
        <motion.div
          className={styles.leftPanel}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PuzzleBriefing
            environmentName={environment.name}
            environmentIcon={environment.theme.icon}
          />
          <MutationToolbar />
        </motion.div>

        {/* Center: Sequence Editor */}
        <motion.div
          className={styles.centerPanel}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.editorWrapper}>
            <div className={styles.editorHeader}>
              <span className={styles.editorLabel}>GENOME SEQUENCE EDITOR</span>
              <div className={styles.editorDots}>
                <span className={styles.dot} style={{ background: '#ff5f57' }} />
                <span className={styles.dot} style={{ background: '#ffbd2e' }} />
                <span className={styles.dot} style={{ background: '#28c840' }} />
              </div>
            </div>
            <SequenceEditor />
          </div>

          {/* Description */}
          <div className={styles.descriptionPanel}>
            <p className={styles.descriptionText}>{puzzle.description}</p>
          </div>
        </motion.div>

        {/* Right Panel: Protein Preview & Organism */}
        <motion.div
          className={styles.rightPanel}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <OrganismVisual />
          <ProteinPreview />
        </motion.div>
      </div>

      {/* Compile Animation Overlay */}
      {isCompiling && <CompileAnimation />}

      {/* Result Modal */}
      <ResultModal environmentId={environmentId} />
    </div>
  );
}

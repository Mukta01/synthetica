'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { translateSequence, AMINO_ACID_PROPERTIES } from '../../lib/bioUtils';
import styles from './CompileAnimation.module.css';

type Phase = 'idle' | 'transcription' | 'translation' | 'folding' | 'survival' | 'done';

export default function CompileAnimation() {
  const { isCompiling, compilationResult, currentSequence } = useGameStore();
  const [phase, setPhase] = useState<Phase>('idle');
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const aminoAcids = translateSequence(currentSequence);

  useEffect(() => {
    if (!isCompiling) {
      if (phase !== 'idle' && compilationResult) {
        setPhase('done');
      }
      return;
    }

    setPhase('transcription');
    setTerminalLines([]);

    const addLine = (line: string) => {
      setTerminalLines(prev => [...prev, line]);
    };

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase 1: Transcription
    timers.push(setTimeout(() => addLine('> INITIATING TRANSCRIPTION...'), 100));
    timers.push(setTimeout(() => addLine('  DNA strand unwinding...'), 400));
    timers.push(setTimeout(() => addLine('  mRNA synthesis in progress...'), 800));
    timers.push(setTimeout(() => addLine('  ✓ mRNA strand complete'), 1300));

    // Phase 2: Translation
    timers.push(setTimeout(() => {
      setPhase('translation');
      addLine('> INITIATING TRANSLATION...');
    }, 1600));
    timers.push(setTimeout(() => addLine('  Ribosome attached to mRNA...'), 2000));
    timers.push(setTimeout(() => addLine(`  Producing ${aminoAcids.length} amino acids...`), 2400));
    timers.push(setTimeout(() => addLine('  ✓ Polypeptide chain complete'), 3000));

    // Phase 3: Folding
    timers.push(setTimeout(() => {
      setPhase('folding');
      addLine('> PROTEIN FOLDING SIMULATION...');
    }, 3300));
    timers.push(setTimeout(() => addLine('  Computing secondary structures...'), 3600));
    timers.push(setTimeout(() => addLine('  Analyzing hydrophobic interactions...'), 4000));
    timers.push(setTimeout(() => addLine('  ✓ Folding complete'), 4500));

    // Phase 4: Survival
    timers.push(setTimeout(() => {
      setPhase('survival');
      addLine('> DEPLOYING ORGANISM TO ENVIRONMENT...');
    }, 4800));
    timers.push(setTimeout(() => addLine('  Stress testing initiated...'), 5200));
    timers.push(setTimeout(() => addLine('  Monitoring vital signs...'), 5600));

    return () => timers.forEach(clearTimeout);
  }, [isCompiling, aminoAcids.length, compilationResult, phase]);

  if (phase === 'idle') return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={styles.modal}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <h2 className={styles.title}>
            {phase === 'done' && compilationResult
              ? compilationResult.survived
                ? '🧬 SEQUENCE COMPILED SUCCESSFULLY'
                : '⚠ SEQUENCE REJECTED'
              : '🧬 COMPILING SEQUENCE...'}
          </h2>

          {/* Phase Indicators */}
          <div className={styles.phases}>
            {(['transcription', 'translation', 'folding', 'survival'] as const).map((p, i) => {
              const phaseOrder = ['transcription', 'translation', 'folding', 'survival', 'done'];
              const currentIdx = phaseOrder.indexOf(phase);
              const thisIdx = i;
              const isActive = thisIdx === currentIdx;
              const isComplete = thisIdx < currentIdx;

              return (
                <div
                  key={p}
                  className={`${styles.phaseIndicator} ${isActive ? styles.phaseActive : ''} ${isComplete ? styles.phaseComplete : ''}`}
                >
                  <div className={styles.phaseDot}>
                    {isComplete ? '✓' : isActive ? '●' : '○'}
                  </div>
                  <span className={styles.phaseName}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* DNA/Protein Visualization */}
          <div className={styles.visualization}>
            {phase === 'transcription' && (
              <motion.div className={styles.dnaVis}>
                {currentSequence.split('').map((nuc, i) => (
                  <motion.span
                    key={i}
                    className={styles.dnaChar}
                    style={{ color: `var(--nucleotide-${nuc})` }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {nuc}
                  </motion.span>
                ))}
              </motion.div>
            )}

            {phase === 'translation' && (
              <motion.div className={styles.aaVis}>
                {aminoAcids.map((aa, i) => {
                  const props = AMINO_ACID_PROPERTIES[aa];
                  return (
                    <motion.div
                      key={i}
                      className={styles.aaNode}
                      style={{
                        background: `${props?.color || '#666'}30`,
                        borderColor: props?.color || '#666',
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.15, type: 'spring' }}
                    >
                      {props?.shortName || '?'}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {phase === 'folding' && (
              <motion.div
                className={styles.foldVis}
                animate={{ rotate: [0, 5, -5, 3, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className={styles.proteinBlob}>
                  {aminoAcids.slice(0, 8).map((aa, i) => {
                    const props = AMINO_ACID_PROPERTIES[aa];
                    const angle = (i / Math.min(aminoAcids.length, 8)) * Math.PI * 2;
                    const radius = 40 + (i % 2) * 15;
                    return (
                      <motion.div
                        key={i}
                        className={styles.foldNode}
                        style={{
                          background: props?.color || '#666',
                          left: `${50 + Math.cos(angle) * radius}%`,
                          top: `${50 + Math.sin(angle) * radius}%`,
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      />
                    );
                  })}
                </div>
              </motion.div>
            )}

            {phase === 'survival' && (
              <motion.div className={styles.survivalVis}>
                <motion.div
                  className={styles.organism}
                  animate={{
                    scale: [1, 1.1, 1, 1.05, 1],
                    opacity: [1, 0.8, 1, 0.9, 1],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🦠
                </motion.div>
                <div className={styles.envStress}>
                  <motion.div
                    className={styles.stressWave}
                    animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Terminal Output */}
          <div className={styles.terminal}>
            {terminalLines.map((line, i) => (
              <motion.div
                key={i}
                className={`${styles.termLine} ${line.includes('✓') ? styles.success : ''}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
              >
                {line}
              </motion.div>
            ))}
            {isCompiling && <span className={styles.cursor}>█</span>}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

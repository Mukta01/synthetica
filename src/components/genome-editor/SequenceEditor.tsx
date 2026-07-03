'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import type { Nucleotide } from '../../lib/types';
import styles from './SequenceEditor.module.css';

const NUCLEOTIDE_COLORS: Record<string, string> = {
  A: 'var(--nucleotide-A)',
  T: 'var(--nucleotide-T)',
  C: 'var(--nucleotide-C)',
  G: 'var(--nucleotide-G)',
};

const NUCLEOTIDES: Nucleotide[] = ['A', 'T', 'C', 'G'];

export default function SequenceEditor() {
  const {
    originalSequence,
    currentSequence,
    activeTool,
    selectedIndex,
    mutationsUsed,
    mutationBudget,
    selectIndex,
    applySwap,
    applyInsert,
    applyDelete,
  } = useGameStore();

  const budgetExhausted = mutationsUsed >= mutationBudget;

  const handleTileClick = (index: number) => {
    if (budgetExhausted && activeTool !== null) return;

    if (activeTool === 'delete') {
      applyDelete(index);
      return;
    }

    if (activeTool === 'swap' || activeTool === 'insert') {
      selectIndex(selectedIndex === index ? null : index);
      return;
    }

    // No tool: just select for info
    selectIndex(selectedIndex === index ? null : index);
  };

  const handleNucleotideChoice = (nucleotide: string) => {
    if (selectedIndex === null) return;

    if (activeTool === 'swap') {
      applySwap(selectedIndex, nucleotide);
    } else if (activeTool === 'insert') {
      applyInsert(selectedIndex, nucleotide);
    }
  };

  const isChanged = (index: number): boolean => {
    if (index >= originalSequence.length) return true;
    return currentSequence[index] !== originalSequence[index];
  };

  return (
    <div className={styles.container}>
      {/* Original Sequence (ghost row) */}
      <div className={styles.sequenceRow}>
        <span className={styles.rowLabel}>ORIGINAL</span>
        <div className={styles.tiles}>
          {originalSequence.split('').map((nuc, i) => (
            <div key={`orig-${i}`} className={styles.ghostTile}>
              <span style={{ color: NUCLEOTIDE_COLORS[nuc] }}>{nuc}</span>
              {(i + 1) % 3 === 0 && i < originalSequence.length - 1 && (
                <div className={styles.codonSep} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Editing Sequence */}
      <div className={styles.sequenceRow}>
        <span className={styles.rowLabel}>EDITING</span>
        <div className={styles.tiles}>
          <AnimatePresence mode="popLayout">
            {currentSequence.split('').map((nuc, i) => {
              const changed = isChanged(i);
              const selected = selectedIndex === i;
              const color = NUCLEOTIDE_COLORS[nuc] || 'var(--text-muted)';

              return (
                <motion.div
                  key={`tile-${i}-${currentSequence.length}`}
                  className={`${styles.tile} ${selected ? styles.selected : ''} ${changed ? styles.changed : ''} ${activeTool ? styles.interactive : ''}`}
                  style={{
                    '--nuc-color': color,
                    borderColor: selected ? color : changed ? `${color}40` : 'var(--border-default)',
                  } as React.CSSProperties}
                  onClick={() => handleTileClick(i)}
                  layout
                  initial={{ opacity: 0, scale: 0.5, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 10 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  whileHover={activeTool ? { scale: 1.1, y: -2 } : {}}
                >
                  <span className={styles.tileNuc} style={{ color }}>{nuc}</span>
                  <span className={styles.tileIndex}>{i + 1}</span>

                  {/* Selection glow */}
                  {selected && (
                    <motion.div
                      className={styles.selectionGlow}
                      style={{ background: color }}
                      layoutId="selection"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Codon brackets */}
          {currentSequence.split('').map((_, i) => (
            (i + 1) % 3 === 0 && i < currentSequence.length - 1 ? (
              <div key={`sep-${i}`} className={styles.codonBracket} style={{ left: `${((i + 1) / currentSequence.length) * 100}%` }} />
            ) : null
          ))}
        </div>
      </div>

      {/* Nucleotide Picker (shows when a tile is selected in swap/insert mode) */}
      <AnimatePresence>
        {selectedIndex !== null && (activeTool === 'swap' || activeTool === 'insert') && (
          <motion.div
            className={styles.picker}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <span className={styles.pickerLabel}>
              {activeTool === 'swap' ? 'SWAP TO:' : 'INSERT:'}
            </span>
            <div className={styles.pickerOptions}>
              {NUCLEOTIDES.map(nuc => (
                <motion.button
                  key={nuc}
                  className={styles.pickerBtn}
                  style={{
                    color: NUCLEOTIDE_COLORS[nuc],
                    borderColor: `${NUCLEOTIDE_COLORS[nuc]}40`,
                  }}
                  onClick={() => handleNucleotideChoice(nuc)}
                  whileHover={{
                    scale: 1.15,
                    borderColor: NUCLEOTIDE_COLORS[nuc],
                    boxShadow: `0 0 15px ${NUCLEOTIDE_COLORS[nuc]}30`,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {nuc}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mutation Counter */}
      <div className={styles.mutationCounter}>
        <span className={styles.counterLabel}>MUTATIONS</span>
        <div className={styles.counterBar}>
          <div
            className={styles.counterFill}
            style={{
              width: `${(mutationsUsed / mutationBudget) * 100}%`,
              background: budgetExhausted
                ? 'var(--accent-red)'
                : mutationsUsed > mutationBudget * 0.7
                  ? 'var(--accent-amber)'
                  : 'var(--accent-cyan)',
            }}
          />
        </div>
        <span className={`${styles.counterValue} ${budgetExhausted ? styles.exhausted : ''}`}>
          {mutationsUsed}/{mutationBudget}
        </span>
      </div>
    </div>
  );
}

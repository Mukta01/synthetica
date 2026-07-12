'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { translateSequence, calculateTraits, AMINO_ACID_PROPERTIES } from '../../lib/bioUtils';
import styles from './ProteinPreview.module.css';

export default function ProteinPreview() {
  const currentSequence = useGameStore(s => s.currentSequence);
  const currentPuzzle = useGameStore(s => s.currentPuzzle);

  const aminoAcids = useMemo(() => translateSequence(currentSequence), [currentSequence]);
  const traits = useMemo(() => calculateTraits(aminoAcids), [aminoAcids]);

  if (!currentPuzzle) return null;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>PROTEIN PREVIEW</h3>

      {/* Amino Acid Chain */}
      <div className={styles.section}>
        <span className={styles.sectionLabel}>AMINO ACID CHAIN</span>
        <div className={styles.aaChain}>
          <AnimatePresence mode="popLayout">
            {aminoAcids.length > 0 ? (
              aminoAcids.map((aa, i) => {
                const props = AMINO_ACID_PROPERTIES[aa];
                return (
                  <motion.div
                    key={`${i}-${aa}`}
                    layout="position"
                    className={styles.aaBubble}
                    style={{
                      background: `${props?.color || '#666'}20`,
                      borderColor: `${props?.color || '#666'}60`,
                      color: props?.color || '#666',
                    }}
                    initial={{ opacity: 0, scale: 0.5, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, filter: "blur(5px)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    title={`${props?.name || 'Unknown'} (${aa})`}
                  >
                    <span className={styles.aaShort}>{props?.shortName || '?'}</span>
                    <span className={styles.aaName}>{aa}</span>
                  </motion.div>
                );
              })
            ) : (
              <motion.span 
                key="empty" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className={styles.noData}
              >
                No valid codons
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Trait Indicators */}
      <div className={styles.section}>
        <span className={styles.sectionLabel}>TRAIT ANALYSIS</span>
        <div className={styles.traits}>
          {currentPuzzle.targetTraits.map(req => {
            const level = traits[req.trait] || 0;
            const met = level >= req.minLevel;
            const percentage = Math.min(100, level);

            return (
              <div key={req.trait} className={styles.traitRow}>
                <div className={styles.traitHeader}>
                  <span className={`${styles.traitName} ${met ? styles.traitMet : ''}`}>
                    {met ? '✓' : '✗'} {req.label}
                  </span>
                  <span className={`${styles.traitValue} ${met ? styles.traitMet : styles.traitNotMet}`}>
                    {level}%
                  </span>
                </div>
                <div className={styles.traitBar}>
                  <motion.div
                    className={styles.traitFill}
                    style={{
                      background: met ? 'var(--accent-green)' : 'var(--accent-amber)',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                  {/* Required marker */}
                  <div
                    className={styles.traitRequired}
                    style={{ left: `${req.minLevel}%` }}
                    title={`Required: ${req.minLevel}%`}
                  />
                </div>
                <span className={styles.traitRequiredLabel}>
                  Required: {req.minLevel}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Amino Acid Properties Summary */}
      <div className={styles.section}>
        <span className={styles.sectionLabel}>COMPOSITION</span>
        <div className={styles.composition}>
          <div className={styles.compRow}>
            <span className={styles.compLabel}>Hydrophobic</span>
            <span className={styles.compValue}>
              {aminoAcids.filter(aa => AMINO_ACID_PROPERTIES[aa]?.hydrophobic).length}/{aminoAcids.length}
            </span>
          </div>
          <div className={styles.compRow}>
            <span className={styles.compLabel}>Heat-stable</span>
            <span className={styles.compValue}>
              {aminoAcids.filter(aa => AMINO_ACID_PROPERTIES[aa]?.heatStable).length}/{aminoAcids.length}
            </span>
          </div>
          <div className={styles.compRow}>
            <span className={styles.compLabel}>Toxin-resistant</span>
            <span className={styles.compValue}>
              {aminoAcids.filter(aa => AMINO_ACID_PROPERTIES[aa]?.toxinResistant).length}/{aminoAcids.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { translateSequence, calculateTraits } from '../../lib/bioUtils';
import styles from './OrganismVisual.module.css';

export default function OrganismVisual() {
  const currentSequence = useGameStore(s => s.currentSequence);
  const currentPuzzle = useGameStore(s => s.currentPuzzle);

  const [wobble, setWobble] = useState([
    "40% 60% 70% 30% / 40% 50% 60% 50%",
    "60% 40% 30% 70% / 60% 50% 40% 50%",
    "50% 50% 50% 50% / 50% 50% 50% 50%",
    "40% 60% 70% 30% / 40% 50% 60% 50%"
  ]);

  const aminoAcids = useMemo(() => translateSequence(currentSequence), [currentSequence]);
  const traits = useMemo(() => calculateTraits(aminoAcids), [aminoAcids]);

  if (!currentPuzzle) return null;

  // Environment Background
  const envStyles = useMemo(() => {
    switch (currentPuzzle.environmentId) {
      case 'magma':
        return {
          background: 'linear-gradient(135deg, #2a0800 0%, #4a0d00 100%)',
          boxShadow: 'inset 0 0 100px rgba(255, 51, 0, 0.5)'
        };
      case 'deepsea':
        return {
          background: 'linear-gradient(135deg, #00122a 0%, #00224a 100%)',
          boxShadow: 'inset 0 0 100px rgba(0, 100, 255, 0.5)'
        };
      case 'acid':
        return {
          background: 'linear-gradient(135deg, #0a1a00 0%, #113300 100%)',
          boxShadow: 'inset 0 0 100px rgba(100, 255, 0, 0.3)'
        };
      default:
        return { background: 'var(--bg-elevated)' };
    }
  }, [currentPuzzle.environmentId]);

  // Check if meeting ALL target traits
  const isHealthy = currentPuzzle.targetTraits.every(
    req => (traits[req.trait] || 0) >= req.minLevel
  );

  // Map traits to visual colors and effects
  const heatLevel = Math.min(100, traits['Heat Stable'] || 0);
  const hydroLevel = Math.min(100, traits['Hydrophobic'] || 0);
  const toxinLevel = Math.min(100, traits['Toxin Resistant'] || 0);

  // Dynamic visual features based on traits
  const coreColor = isHealthy ? 'var(--accent-cyan)' : 'var(--text-muted)';
  const membraneColor = `rgba(${heatLevel * 2.5}, ${toxinLevel * 2.5}, ${hydroLevel * 2.5}, 0.8)`;
  
  // Create a dynamic scale and animation speed based on health and mutation volume
  const scale = 1 + (aminoAcids.length * 0.05); // Grows slightly with more amino acids
  const animationDuration = isHealthy ? 4 : 0.5; // Fast shivering if distressed, slow pulse if healthy

  return (
    <div className={styles.container} style={envStyles}>
      <div className={styles.environmentLabel}>
        {currentPuzzle.environmentId.toUpperCase()} ENVIRONMENT
      </div>

      <motion.div 
        className={`${styles.organism} ${!isHealthy ? styles.distressed : ''}`}
        animate={{ scale }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        {/* Aura representing overall trait intensity */}
        <motion.div 
          className={styles.aura}
          animate={{
            backgroundColor: membraneColor,
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: animationDuration, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* The Outer Membrane mutating shape */}
        <motion.div 
          className={styles.membrane}
          style={{ backgroundColor: membraneColor }}
          animate={{
            borderRadius: wobble,
            rotate: [0, 90, 180, 360],
          }}
          transition={{ duration: animationDuration * 2, repeat: Infinity, ease: "linear" }}
        />

        {/* The Core Nucleus */}
        <div className={styles.core} style={{ borderColor: coreColor, border: `2px solid ${coreColor}` }}>
          <motion.div 
            className={styles.nucleus}
            animate={{ scale: [1, 0.8, 1] }}
            transition={{ duration: animationDuration, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

    </div>
  );
}

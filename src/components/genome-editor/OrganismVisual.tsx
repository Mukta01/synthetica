'use client';

import { useMemo, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useGameStore } from '../../store/gameStore';
import { translateSequence, calculateTraits } from '../../lib/bioUtils';
import styles from './OrganismVisual.module.css';

// ---- Feedback Toast Type ----
interface FeedbackItem {
  id: number;
  text: string;
  positive: boolean;
}

export default function OrganismVisual() {
  const currentSequence = useGameStore(s => s.currentSequence);
  const currentPuzzle = useGameStore(s => s.currentPuzzle);

  const prevTraitsRef = useRef<Record<string, number> | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const feedbackIdRef = useRef(0);

  const aminoAcids = useMemo(() => translateSequence(currentSequence), [currentSequence]);
  const traits = useMemo(() => calculateTraits(aminoAcids), [aminoAcids]);

  // ---- Detect trait changes and show feedback ----
  useEffect(() => {
    if (!prevTraitsRef.current || !currentPuzzle) {
      prevTraitsRef.current = traits;
      return;
    }

    const prev = prevTraitsRef.current;
    const newFeedbacks: FeedbackItem[] = [];

    for (const req of currentPuzzle.targetTraits) {
      const oldVal = prev[req.trait] || 0;
      const newVal = traits[req.trait] || 0;
      const diff = newVal - oldVal;

      if (diff !== 0) {
        feedbackIdRef.current += 1;
        newFeedbacks.push({
          id: feedbackIdRef.current,
          text: `${diff > 0 ? '▲' : '▼'} ${req.label} ${diff > 0 ? '+' : ''}${diff}%`,
          positive: diff > 0,
        });
      }
    }

    if (newFeedbacks.length > 0) {
      setFeedbacks(newFeedbacks);
      const timer = setTimeout(() => setFeedbacks([]), 2000);
      return () => clearTimeout(timer);
    }

    prevTraitsRef.current = traits;
  }, [traits, currentPuzzle]);

  // Update ref after effect runs
  useEffect(() => {
    prevTraitsRef.current = traits;
  }, [traits]);

  if (!currentPuzzle) return null;

  // ---- Environment class ----
  const envClass = (() => {
    const envId = currentPuzzle.environmentId;
    if (envId.includes('thermal') || envId.includes('magma')) return styles.envMagma;
    if (envId.includes('deep') || envId.includes('sea') || envId.includes('abyss')) return styles.envDeepsea;
    if (envId.includes('acid') || envId.includes('toxic')) return styles.envAcid;
    return styles.envDefault;
  })();

  // ---- Trait levels ----
  const heatLevel = Math.min(100, traits['heat_resistance'] || 0);
  const toxinLevel = Math.min(100, traits['toxin_resistance'] || 0);
  const membraneLevel = Math.min(100, traits['membrane_stability'] || 0);

  // ---- Health check ----
  const isHealthy = currentPuzzle.targetTraits.every(
    req => (traits[req.trait] || 0) >= req.minLevel
  );

  // ---- Dynamic Image Filters ----
  // If healthy: sharp, vivid colors matching traits. 
  // If distressed: desaturated, slightly darker, frantic shaking.
  const hueShift = (heatLevel * 0.8) - (toxinLevel * 0.8);
  const saturation = isHealthy ? 100 + (membraneLevel * 0.5) : 40;
  const brightness = isHealthy ? 100 : 70;
  
  const filterStyle = `hue-rotate(${hueShift}deg) saturate(${saturation}%) brightness(${brightness}%)`;
  
  const glowColor = isHealthy
    ? `rgba(0, 255, 170, 0.4)`
    : `rgba(255, 50, 80, 0.5)`;

  // ---- Animation configs ----
  // Healthy: slow, gentle floating and pulsing
  // Distressed: erratic shaking, fast pulsing
  const floatDuration = isHealthy ? 6 : 0.8;
  const pulseDuration = isHealthy ? 4 : 1;

  // ---- Particles ----
  const particleColor = (() => {
    const envId = currentPuzzle.environmentId;
    if (envId.includes('thermal') || envId.includes('magma')) return '#ffaa55';
    if (envId.includes('acid') || envId.includes('toxic')) return '#aaff66';
    return '#66aaff';
  })();

  return (
    <div className={`${styles.container} ${envClass}`}>
      {/* Environment Label */}
      <div className={styles.environmentLabel}>
        {currentPuzzle.environmentId.replace(/-/g, ' ')}
      </div>

      {/* Status Badge */}
      <div className={`${styles.statusBadge} ${isHealthy ? styles.statusHealthy : styles.statusDistressed}`}>
        {isHealthy ? '● THRIVING' : '● STRUGGLING'}
      </div>

      {/* Floating Environment Particles */}
      <div className={styles.particlesLayer}>
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className={styles.floatingParticle}
            style={{
              left: `${5 + Math.random() * 90}%`,
              bottom: `${Math.random() * 20 - 10}%`,
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              background: particleColor,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* ======== THE ORGANISM ======== */}
      <div className={styles.organismWrapper}>

        {/* Heat Aura Glow */}
        {heatLevel > 10 && (
          <motion.div
            className={`${styles.auraGlow} ${styles.heatAura}`}
            animate={{ opacity: [heatLevel / 200, heatLevel / 120, heatLevel / 200] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Toxin Aura Glow */}
        {toxinLevel > 10 && (
          <motion.div
            className={`${styles.auraGlow} ${styles.toxinAura}`}
            animate={{ opacity: [toxinLevel / 250, toxinLevel / 150, toxinLevel / 250] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        )}

        {/* Membrane Aura Glow */}
        {membraneLevel > 10 && (
          <motion.div
            className={`${styles.auraGlow} ${styles.hydroAura}`}
            animate={{ opacity: [membraneLevel / 200, membraneLevel / 120, membraneLevel / 200] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        )}

        {/* The Realistic Organism Image */}
        <motion.div
          className={styles.organismImage}
          style={{ '--creature-glow': glowColor, filter: filterStyle } as React.CSSProperties}
          animate={{
            y: isHealthy ? [-10, 10, -10] : [-3, 3, -4, 2, -3],
            x: isHealthy ? [0, 0, 0] : [-2, 2, -1, 3, -2],
            rotate: isHealthy ? [-2, 2, -2] : [-1, 1, -2, 1, -1],
            scale: isHealthy ? [1, 1.02, 1] : [1, 0.95, 1.05, 0.98, 1],
          }}
          transition={{
            duration: floatDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Image
            src="/organism.jpg"
            alt="Microscopic Organism"
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            style={{ objectFit: 'contain' }}
            priority
          />
        </motion.div>
      </div>

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedbacks.map((fb) => (
          <motion.div
            key={fb.id}
            className={`${styles.feedbackToast} ${fb.positive ? styles.feedbackPositive : styles.feedbackNegative}`}
            initial={{ opacity: 0, y: 15, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -25, x: '-50%' }}
            transition={{ duration: 0.4 }}
          >
            {fb.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

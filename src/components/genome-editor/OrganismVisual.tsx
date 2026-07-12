'use client';

import { useMemo, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      const timer = setTimeout(() => setFeedbacks([]), 1800);
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

  // ---- Body color morphing based on traits ----
  const bodyHue = 180 + (heatLevel * 0.8) - (toxinLevel * 0.3);
  const bodySat = 60 + (membraneLevel * 0.3);
  const bodyLight = isHealthy ? 55 : 30;
  const bodyColor = `hsl(${bodyHue}, ${bodySat}%, ${bodyLight}%)`;
  const bodyColorDark = `hsl(${bodyHue}, ${bodySat}%, ${bodyLight - 15}%)`;
  const glowColor = isHealthy
    ? `rgba(0, 255, 136, 0.4)`
    : `rgba(255, 51, 102, 0.3)`;

  // ---- Tentacle configs ---- 
  const tentacles = [
    { angle: -40, length: 35, delay: 0 },
    { angle: -70, length: 28, delay: 0.3 },
    { angle: 40, length: 32, delay: 0.6 },
    { angle: 70, length: 25, delay: 0.9 },
    { angle: 150, length: 30, delay: 0.2 },
    { angle: -150, length: 27, delay: 0.5 },
  ];

  // ---- Animation speeds ----
  const breathDuration = isHealthy ? 3 : 0.6;
  const wobbleDuration = isHealthy ? 8 : 1.5;

  // ---- Particles based on environment ----
  const particleColor = (() => {
    const envId = currentPuzzle.environmentId;
    if (envId.includes('thermal') || envId.includes('magma')) return '#ff6b35';
    if (envId.includes('acid') || envId.includes('toxic')) return '#66ff44';
    return '#4488ff';
  })();

  return (
    <div className={`${styles.container} ${envClass}`}>
      {/* Environment Label */}
      <div className={styles.environmentLabel}>
        {currentPuzzle.environmentId.replace(/-/g, ' ')} env
      </div>

      {/* Status Badge */}
      <div className={`${styles.statusBadge} ${isHealthy ? styles.statusHealthy : styles.statusDistressed}`}>
        {isHealthy ? '● STABLE' : '● UNSTABLE'}
      </div>

      {/* Floating Environment Particles */}
      <div className={styles.particlesLayer}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={styles.floatingParticle}
            style={{
              left: `${8 + Math.random() * 84}%`,
              bottom: `${Math.random() * 20}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              background: particleColor,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* The Organism */}
      <div className={styles.organismWrapper}>

        {/* Heat Aura Ring */}
        {heatLevel > 10 && (
          <motion.div
            className={`${styles.auraRing} ${styles.heatAura}`}
            animate={{
              width: [130, 145, 130],
              height: [130, 145, 130],
              top: [-25 + (160 - 130) / 2, -25 + (160 - 145) / 2, -25 + (160 - 130) / 2],
              left: [-25 + (160 - 130) / 2, -25 + (160 - 145) / 2, -25 + (160 - 130) / 2],
              opacity: [heatLevel / 200, heatLevel / 120, heatLevel / 200],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Toxin Aura Ring */}
        {toxinLevel > 10 && (
          <motion.div
            className={`${styles.auraRing} ${styles.toxinAura}`}
            animate={{
              width: [145, 160, 145],
              height: [145, 160, 145],
              top: [-25 + (160 - 145) / 2, -25 + (160 - 160) / 2, -25 + (160 - 145) / 2],
              left: [-25 + (160 - 145) / 2, -25 + (160 - 160) / 2, -25 + (160 - 145) / 2],
              opacity: [toxinLevel / 250, toxinLevel / 150, toxinLevel / 250],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        )}

        {/* Membrane / Hydro Aura */}
        {membraneLevel > 10 && (
          <motion.div
            className={`${styles.auraRing} ${styles.hydroAura}`}
            animate={{
              width: [120, 132, 120],
              height: [120, 132, 120],
              top: [-25 + (160 - 120) / 2, -25 + (160 - 132) / 2, -25 + (160 - 120) / 2],
              left: [-25 + (160 - 120) / 2, -25 + (160 - 132) / 2, -25 + (160 - 120) / 2],
              opacity: [membraneLevel / 200, membraneLevel / 130, membraneLevel / 200],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        )}

        {/* SVG Creature */}
        <motion.svg
          className={styles.creatureSvg}
          viewBox="0 0 200 200"
          style={{ '--creature-glow': glowColor } as React.CSSProperties}
          animate={{
            scale: isHealthy ? [1, 1.05, 1] : [1, 0.92, 1.08, 0.95, 1],
          }}
          transition={{
            duration: breathDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Tentacles */}
          {tentacles.map((t, i) => {
            const cx = 100;
            const cy = 100;
            const rad = (t.angle * Math.PI) / 180;
            const startX = cx + Math.cos(rad) * 38;
            const startY = cy + Math.sin(rad) * 38;
            const endX = cx + Math.cos(rad) * (38 + t.length);
            const endY = cy + Math.sin(rad) * (38 + t.length);
            const cpX = cx + Math.cos(rad + 0.3) * (38 + t.length * 0.6);
            const cpY = cy + Math.sin(rad + 0.3) * (38 + t.length * 0.6);

            return (
              <motion.path
                key={i}
                className={styles.tentacle}
                d={`M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`}
                stroke={bodyColor}
                strokeWidth={3 + membraneLevel * 0.02}
                animate={{
                  d: [
                    `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`,
                    `M ${startX} ${startY} Q ${cpX + 8} ${cpY - 8} ${endX + 5} ${endY - 5}`,
                    `M ${startX} ${startY} Q ${cpX - 5} ${cpY + 5} ${endX - 3} ${endY + 3}`,
                    `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`,
                  ],
                }}
                transition={{
                  duration: wobbleDuration * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: t.delay,
                }}
              />
            );
          })}

          {/* Main Body — Organic blob shape */}
          <motion.ellipse
            cx="100"
            cy="100"
            fill={bodyColor}
            stroke={bodyColorDark}
            strokeWidth="2"
            animate={{
              rx: isHealthy ? [38, 41, 37, 40, 38] : [38, 33, 42, 35, 38],
              ry: isHealthy ? [36, 34, 39, 35, 36] : [36, 40, 32, 38, 36],
            }}
            transition={{
              duration: wobbleDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Inner Body highlight */}
          <motion.ellipse
            cx="94"
            cy="93"
            rx="22"
            ry="20"
            fill={`hsl(${bodyHue}, ${bodySat}%, ${bodyLight + 12}%)`}
            opacity={0.35}
            animate={{
              rx: [22, 24, 21, 23, 22],
              ry: [20, 18, 22, 19, 20],
            }}
            transition={{
              duration: wobbleDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Left Eye */}
          <motion.g
            className={styles.eyeGroup}
            animate={
              isHealthy
                ? {} 
                : { y: [0, -2, 2, 0] }
            }
            transition={{ duration: 0.4, repeat: Infinity }}
          >
            {/* Eye white */}
            <ellipse cx="88" cy="92" rx="8" ry="9" fill="white" opacity={0.95} />
            {/* Pupil */}
            <motion.circle
              className={styles.pupil}
              cx="89"
              cy="93"
              r={isHealthy ? 4 : 3}
              fill="#111"
              animate={
                isHealthy
                  ? { cx: [89, 90, 88, 89], cy: [93, 92, 94, 93] }
                  : { cx: [89, 91, 87, 89], cy: [93, 95, 91, 93] }
              }
              transition={{
                duration: isHealthy ? 4 : 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Eye shine */}
            <circle cx="86" cy="90" r="1.5" fill="white" opacity={0.8} />
          </motion.g>

          {/* Right Eye */}
          <motion.g
            className={styles.eyeGroup}
            animate={
              isHealthy
                ? {}
                : { y: [0, 2, -2, 0] }
            }
            transition={{ duration: 0.4, repeat: Infinity }}
          >
            <ellipse cx="112" cy="92" rx="8" ry="9" fill="white" opacity={0.95} />
            <motion.circle
              className={styles.pupil}
              cx="113"
              cy="93"
              r={isHealthy ? 4 : 3}
              fill="#111"
              animate={
                isHealthy
                  ? { cx: [113, 114, 112, 113], cy: [93, 92, 94, 93] }
                  : { cx: [113, 115, 111, 113], cy: [93, 95, 91, 93] }
              }
              transition={{
                duration: isHealthy ? 4 : 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <circle cx="110" cy="90" r="1.5" fill="white" opacity={0.8} />
          </motion.g>

          {/* Mouth */}
          {isHealthy ? (
            // Happy smile
            <motion.path
              d="M 90 108 Q 100 118 110 108"
              fill="none"
              stroke="#111"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ d: ['M 90 108 Q 100 118 110 108', 'M 90 109 Q 100 120 110 109', 'M 90 108 Q 100 118 110 108'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          ) : (
            // Worried/sad mouth
            <motion.path
              d="M 92 114 Q 100 106 108 114"
              fill="none"
              stroke="#111"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{
                d: ['M 92 114 Q 100 106 108 114', 'M 93 115 Q 100 104 107 115', 'M 92 114 Q 100 106 108 114'],
              }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* Blush cheeks when healthy */}
          {isHealthy && (
            <>
              <motion.circle
                cx="78" cy="104" r="5"
                fill="#ff8888"
                opacity={0.25}
                animate={{ opacity: [0.15, 0.3, 0.15], r: [5, 6, 5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.circle
                cx="122" cy="104" r="5"
                fill="#ff8888"
                opacity={0.25}
                animate={{ opacity: [0.15, 0.3, 0.15], r: [5, 6, 5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              />
            </>
          )}
        </motion.svg>
      </div>

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedbacks.map((fb) => (
          <motion.div
            key={fb.id}
            className={`${styles.feedbackToast} ${fb.positive ? styles.feedbackPositive : styles.feedbackNegative}`}
            initial={{ opacity: 0, y: 10, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            transition={{ duration: 0.4 }}
          >
            {fb.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

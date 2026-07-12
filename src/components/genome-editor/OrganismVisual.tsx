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

  // ---- Body color morphing ----
  // Healthy: vivid saturated colors that shift with traits
  // Distressed: desaturated, darker
  const bodyHue = 170 + (heatLevel * 1.2) - (toxinLevel * 0.4);
  const bodySat = isHealthy ? 70 + (membraneLevel * 0.2) : 25;
  const bodyLight = isHealthy ? 50 : 25;
  const bodyColor = `hsl(${bodyHue}, ${bodySat}%, ${bodyLight}%)`;
  const bodyColorLight = `hsl(${bodyHue}, ${bodySat}%, ${bodyLight + 18}%)`;
  const bodyColorDark = `hsl(${bodyHue}, ${bodySat}%, ${Math.max(10, bodyLight - 12)}%)`;
  const glowColor = isHealthy
    ? `rgba(0, 255, 170, 0.5)`
    : `rgba(255, 50, 80, 0.35)`;

  // ---- Tentacle configs (8 tentacles, spread all around) ----
  const tentacles = [
    { angle: -30, length: 45, delay: 0, thickness: 4 },
    { angle: -60, length: 38, delay: 0.4, thickness: 3.5 },
    { angle: -100, length: 35, delay: 0.8, thickness: 3 },
    { angle: 30, length: 42, delay: 0.2, thickness: 4 },
    { angle: 60, length: 36, delay: 0.6, thickness: 3.5 },
    { angle: 100, length: 33, delay: 1.0, thickness: 3 },
    { angle: 155, length: 40, delay: 0.3, thickness: 3.5 },
    { angle: -155, length: 37, delay: 0.7, thickness: 3 },
  ];

  // ---- Animation speeds ----
  const breathDuration = isHealthy ? 3.5 : 0.5;
  const wobbleDuration = isHealthy ? 7 : 1.2;

  // ---- Particles ----
  const particleColor = (() => {
    const envId = currentPuzzle.environmentId;
    if (envId.includes('thermal') || envId.includes('magma')) return '#ff6b35';
    if (envId.includes('acid') || envId.includes('toxic')) return '#88ff33';
    return '#4499ff';
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
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className={styles.floatingParticle}
            style={{
              left: `${5 + Math.random() * 90}%`,
              bottom: `${Math.random() * 15}%`,
              width: `${2 + Math.random() * 5}px`,
              height: `${2 + Math.random() * 5}px`,
              background: particleColor,
              animationDelay: `${i * 0.35}s`,
              animationDuration: `${4 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* ======== THE ORGANISM ======== */}
      <div className={styles.organismWrapper}>

        {/* Heat Aura Ring */}
        {heatLevel > 10 && (
          <motion.div
            className={`${styles.auraRing} ${styles.heatAura}`}
            animate={{
              width: [195, 215, 195],
              height: [195, 215, 195],
              top: [(240 - 195) / 2, (240 - 215) / 2, (240 - 195) / 2],
              left: [(240 - 195) / 2, (240 - 215) / 2, (240 - 195) / 2],
              opacity: [heatLevel / 200, heatLevel / 110, heatLevel / 200],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Toxin Aura Ring */}
        {toxinLevel > 10 && (
          <motion.div
            className={`${styles.auraRing} ${styles.toxinAura}`}
            animate={{
              width: [210, 232, 210],
              height: [210, 232, 210],
              top: [(240 - 210) / 2, (240 - 232) / 2, (240 - 210) / 2],
              left: [(240 - 210) / 2, (240 - 232) / 2, (240 - 210) / 2],
              opacity: [toxinLevel / 250, toxinLevel / 140, toxinLevel / 250],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        )}

        {/* Membrane / Hydro Aura */}
        {membraneLevel > 10 && (
          <motion.div
            className={`${styles.auraRing} ${styles.hydroAura}`}
            animate={{
              width: [180, 198, 180],
              height: [180, 198, 180],
              top: [(240 - 180) / 2, (240 - 198) / 2, (240 - 180) / 2],
              left: [(240 - 180) / 2, (240 - 198) / 2, (240 - 180) / 2],
              opacity: [membraneLevel / 200, membraneLevel / 120, membraneLevel / 200],
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
            scale: isHealthy ? [1, 1.06, 1] : [1, 0.88, 1.1, 0.92, 1],
          }}
          transition={{
            duration: breathDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <defs>
            {/* Radial gradient for the body */}
            <radialGradient id="bodyGrad" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor={bodyColorLight} />
              <stop offset="70%" stopColor={bodyColor} />
              <stop offset="100%" stopColor={bodyColorDark} />
            </radialGradient>
            {/* Glow filter */}
            <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
          </defs>

          {/* Tentacles */}
          {tentacles.map((t, i) => {
            const cx = 100;
            const cy = 100;
            const rad = (t.angle * Math.PI) / 180;
            const startX = cx + Math.cos(rad) * 48;
            const startY = cy + Math.sin(rad) * 48;
            const endX = cx + Math.cos(rad) * (48 + t.length);
            const endY = cy + Math.sin(rad) * (48 + t.length);
            const cpX = cx + Math.cos(rad + 0.3) * (48 + t.length * 0.6);
            const cpY = cy + Math.sin(rad + 0.3) * (48 + t.length * 0.6);

            return (
              <motion.path
                key={i}
                className={styles.tentacle}
                d={`M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`}
                stroke={bodyColor}
                strokeWidth={t.thickness}
                animate={{
                  d: [
                    `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`,
                    `M ${startX} ${startY} Q ${cpX + 10} ${cpY - 10} ${endX + 6} ${endY - 6}`,
                    `M ${startX} ${startY} Q ${cpX - 7} ${cpY + 7} ${endX - 4} ${endY + 4}`,
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

          {/* Tentacle tips (small dots at the ends) */}
          {tentacles.map((t, i) => {
            const rad = (t.angle * Math.PI) / 180;
            const tipX = 100 + Math.cos(rad) * (48 + t.length);
            const tipY = 100 + Math.sin(rad) * (48 + t.length);
            return (
              <motion.circle
                key={`tip-${i}`}
                cx={tipX}
                cy={tipY}
                r={t.thickness * 0.6}
                fill={bodyColorLight}
                opacity={0.7}
                animate={{
                  cx: [tipX, tipX + 6, tipX - 4, tipX],
                  cy: [tipY, tipY - 6, tipY + 4, tipY],
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

          {/* Main Body — Organic blob shape with gradient */}
          <motion.ellipse
            cx="100"
            cy="100"
            fill="url(#bodyGrad)"
            stroke={bodyColorDark}
            strokeWidth="2.5"
            animate={{
              rx: isHealthy ? [48, 52, 46, 50, 48] : [48, 42, 54, 44, 48],
              ry: isHealthy ? [46, 43, 50, 44, 46] : [46, 52, 40, 50, 46],
            }}
            transition={{
              duration: wobbleDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Inner Body highlight (specular) */}
          <motion.ellipse
            cx="90"
            cy="88"
            rx="28"
            ry="24"
            fill={bodyColorLight}
            opacity={0.2}
            filter="url(#softGlow)"
            animate={{
              rx: [28, 30, 26, 29, 28],
              ry: [24, 22, 27, 23, 24],
            }}
            transition={{
              duration: wobbleDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Small specular highlight dot */}
          <motion.circle
            cx="82"
            cy="78"
            r="6"
            fill="white"
            opacity={0.12}
            filter="url(#softGlow)"
            animate={{ r: [6, 7, 5, 6], opacity: [0.12, 0.18, 0.10, 0.12] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* ---- LEFT EYE ---- */}
          <motion.g
            className={styles.eyeGroup}
            animate={
              isHealthy
                ? {}
                : { y: [0, -2, 3, -1, 0] }
            }
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {/* Eye white */}
            <ellipse cx="86" cy="94" rx="10" ry="12" fill="white" opacity={0.95} />
            {/* Iris ring */}
            <motion.circle
              cx="87"
              cy="95"
              r="6"
              fill={isHealthy ? '#33aaff' : '#aa3344'}
              animate={
                isHealthy
                  ? { cx: [87, 88, 86, 87], cy: [95, 94, 96, 95] }
                  : { cx: [87, 90, 84, 87], cy: [95, 97, 93, 95] }
              }
              transition={{
                duration: isHealthy ? 4.5 : 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Pupil */}
            <motion.circle
              className={styles.pupil}
              cx="87"
              cy="95"
              r={isHealthy ? 3.5 : 2.5}
              fill="#111"
              animate={
                isHealthy
                  ? { cx: [87, 88, 86, 87], cy: [95, 94, 96, 95] }
                  : { cx: [87, 90, 84, 87], cy: [95, 97, 93, 95] }
              }
              transition={{
                duration: isHealthy ? 4.5 : 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Eye shine */}
            <circle cx="84" cy="91" r="2" fill="white" opacity={0.85} />
          </motion.g>

          {/* ---- RIGHT EYE ---- */}
          <motion.g
            className={styles.eyeGroup}
            animate={
              isHealthy
                ? {}
                : { y: [0, 2, -3, 1, 0] }
            }
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <ellipse cx="114" cy="94" rx="10" ry="12" fill="white" opacity={0.95} />
            <motion.circle
              cx="115"
              cy="95"
              r="6"
              fill={isHealthy ? '#33aaff' : '#aa3344'}
              animate={
                isHealthy
                  ? { cx: [115, 116, 114, 115], cy: [95, 94, 96, 95] }
                  : { cx: [115, 118, 112, 115], cy: [95, 97, 93, 95] }
              }
              transition={{
                duration: isHealthy ? 4.5 : 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.circle
              className={styles.pupil}
              cx="115"
              cy="95"
              r={isHealthy ? 3.5 : 2.5}
              fill="#111"
              animate={
                isHealthy
                  ? { cx: [115, 116, 114, 115], cy: [95, 94, 96, 95] }
                  : { cx: [115, 118, 112, 115], cy: [95, 97, 93, 95] }
              }
              transition={{
                duration: isHealthy ? 4.5 : 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <circle cx="112" cy="91" r="2" fill="white" opacity={0.85} />
          </motion.g>

          {/* ---- MOUTH ---- */}
          {isHealthy ? (
            // Big happy smile
            <motion.path
              d="M 88 110 Q 100 124 112 110"
              fill="none"
              stroke="#222"
              strokeWidth="2.5"
              strokeLinecap="round"
              animate={{ d: ['M 88 110 Q 100 124 112 110', 'M 87 111 Q 100 126 113 111', 'M 88 110 Q 100 124 112 110'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          ) : (
            // Worried wobbly mouth
            <motion.path
              d="M 90 116 Q 100 106 110 116"
              fill="none"
              stroke="#444"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{
                d: ['M 90 116 Q 100 106 110 116', 'M 91 117 Q 100 103 109 117', 'M 90 116 Q 100 106 110 116'],
              }}
              transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* ---- BLUSH CHEEKS when healthy ---- */}
          {isHealthy && (
            <>
              <motion.ellipse
                cx="74" cy="106" rx="7" ry="5"
                fill="#ff7799"
                opacity={0.2}
                animate={{ opacity: [0.12, 0.28, 0.12], rx: [7, 8, 7] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.ellipse
                cx="126" cy="106" rx="7" ry="5"
                fill="#ff7799"
                opacity={0.2}
                animate={{ opacity: [0.12, 0.28, 0.12], rx: [7, 8, 7] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              />
            </>
          )}

          {/* ---- INTERNAL ORGANELLES (little floating circles inside body) ---- */}
          {[
            { cx: 108, cy: 115, r: 4, delay: 0 },
            { cx: 92, cy: 118, r: 3, delay: 0.5 },
            { cx: 100, cy: 78, r: 3.5, delay: 1 },
            { cx: 80, cy: 100, r: 2.5, delay: 1.5 },
            { cx: 118, cy: 102, r: 2.5, delay: 0.8 },
          ].map((org, i) => (
            <motion.circle
              key={`organelle-${i}`}
              cx={org.cx}
              cy={org.cy}
              r={org.r}
              fill={bodyColorLight}
              opacity={0.3}
              animate={{
                cx: [org.cx, org.cx + 3, org.cx - 2, org.cx],
                cy: [org.cy, org.cy - 2, org.cy + 3, org.cy],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: org.delay,
              }}
            />
          ))}
        </motion.svg>
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

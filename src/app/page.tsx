'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import CodexModal from '../components/genome-editor/CodexModal';
import styles from './page.module.css';

const BOOT_LINES = [
  { text: '> SYNTHETICA OS v1.0.0', delay: 0, type: 'system' },
  { text: '> INITIALIZING KERNEL...', delay: 400, type: 'system' },
  { text: '  ✓ Genome Database loaded [2.4 TB]', delay: 900, type: 'success' },
  { text: '  ✓ CRISPR-Cas9 array calibrated', delay: 1400, type: 'success' },
  { text: '  ✓ Protein folding engine online', delay: 1800, type: 'success' },
  { text: '  ✓ Environment sensors nominal', delay: 2200, type: 'success' },
  { text: '> RUNNING DIAGNOSTICS...', delay: 2700, type: 'system' },
  { text: '  ✓ Nucleotide sequencer: OPERATIONAL', delay: 3200, type: 'success' },
  { text: '  ✓ Mutation buffer: CLEAR', delay: 3500, type: 'success' },
  { text: '  ✓ Bio-containment: ACTIVE', delay: 3800, type: 'success' },
  { text: '', delay: 4200, type: 'blank' },
  { text: '> ALL SYSTEMS NOMINAL', delay: 4400, type: 'highlight' },
  { text: '> WELCOME, RESEARCHER.', delay: 5000, type: 'welcome' },
];

const DNA_HELIX = [
  '  A---T  ',
  ' T---A   ',
  '  G---C  ',
  ' C---G   ',
  '  A---T  ',
  ' G---C   ',
  '  T---A  ',
  ' C---G   ',
];

export default function LandingPage() {
  const router = useRouter();
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [showCTA, setShowCTA] = useState(false);
  const [showHelix, setShowHelix] = useState(false);
  const [helixFrame, setHelixFrame] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((line, index) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines(index + 1);
        }, line.delay)
      );
    });

    // Show helix animation
    timers.push(
      setTimeout(() => setShowHelix(true), 3000)
    );

    // Show CTA button
    timers.push(
      setTimeout(() => setShowCTA(true), 5600)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  // Helix rotation animation
  useEffect(() => {
    if (!showHelix) return;
    const interval = setInterval(() => {
      setHelixFrame(f => (f + 1) % DNA_HELIX.length);
    }, 300);
    return () => clearInterval(interval);
  }, [showHelix]);

  const handleEnter = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => router.push('/lab'), 800);
  }, [router]);

  // Allow Enter key to proceed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && showCTA && !isTransitioning && !isCodexOpen) {
        handleEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCTA, isTransitioning, handleEnter]);

  return (
    <motion.div
      className={styles.container}
      animate={isTransitioning ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background DNA Particles */}
      <div className={styles.bgParticles}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className={styles.content}>
        {/* DNA Helix ASCII Art */}
        <AnimatePresence>
          {showHelix && (
            <motion.div
              className={styles.helixContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <pre className={styles.helix}>
                {DNA_HELIX.map((line, i) => (
                  <span
                    key={i}
                    className={styles.helixLine}
                    style={{
                      opacity: (i + helixFrame) % DNA_HELIX.length < 4 ? 1 : 0.3,
                    }}
                  >
                    {line}
                    {'\n'}
                  </span>
                ))}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Terminal Output */}
        <div className={styles.terminal}>
          <div className={styles.terminalHeader}>
            <div className={styles.terminalDots}>
              <span className={styles.dotRed} />
              <span className={styles.dotYellow} />
              <span className={styles.dotGreen} />
            </div>
            <span className={styles.terminalTitle}>synthetica-terminal</span>
          </div>
          <div className={styles.terminalBody}>
            {BOOT_LINES.slice(0, visibleLines).map((line, index) => (
              <motion.div
                key={index}
                className={`${styles.terminalLine} ${styles[line.type]}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {line.text}
              </motion.div>
            ))}
            {visibleLines < BOOT_LINES.length && (
              <span className={styles.cursor}>█</span>
            )}
          </div>
        </div>

        {/* Title */}
        <AnimatePresence>
          {showCTA && (
            <motion.div
              className={styles.titleSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className={styles.logoContainer}>
                <Image
                  src="/logo.png"
                  alt="Synthetica Logo"
                  width={500}
                  height={500}
                  style={{ objectFit: 'contain', maxHeight: '40vh' }}
                  priority
                />
              </div>
              <p className={styles.subtitle}>THE GENOME EDITOR</p>
              <p className={styles.tagline}>
                Splice. Mutate. Survive.
              </p>

              <div className={styles.ctaGroup}>
                <motion.button
                  className={styles.ctaButton}
                  onClick={handleEnter}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <span className={styles.ctaIcon}>🧬</span>
                  BEGIN SEQUENCE
                  <span className={styles.ctaHint}>[ENTER]</span>
                </motion.button>
                
                <motion.button
                  className={styles.dbButton}
                  onClick={() => setIsCodexOpen(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <span className={styles.ctaIcon}>📚</span>
                  GENOME CODEX
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Database Modal */}
      <CodexModal 
        isOpen={isCodexOpen} 
        onClose={() => setIsCodexOpen(false)} 
      />

      {/* Version Tag */}
      <div className={styles.versionTag}>
        <span className={styles.versionDot} />
        SYNTHETICA OS v1.0.0 • OFFLINE MODE
      </div>
    </motion.div>
  );
}

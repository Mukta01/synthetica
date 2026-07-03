'use client';

import { useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import styles from './MutationToolbar.module.css';

export default function MutationToolbar() {
  const {
    activeTool,
    setActiveTool,
    undo,
    redo,
    reset,
    compile,
    isCompiling,
    mutationsUsed,
    mutationBudget,
    history,
    historyIndex,
    currentSequence,
  } = useGameStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const canCompile = currentSequence.length >= 3 && !isCompiling;

  const handleCompile = useCallback(async () => {
    if (!canCompile) return;
    try {
      await compile();
    } catch (err) {
      console.error('Compile failed:', err);
    }
  }, [canCompile, compile]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      // Ctrl+Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl+Y or Ctrl+Shift+Z: Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      // S: Swap tool
      if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
        setActiveTool(activeTool === 'swap' ? null : 'swap');
      }
      // I: Insert tool
      if (e.key === 'i' && !e.ctrlKey && !e.metaKey) {
        setActiveTool(activeTool === 'insert' ? null : 'insert');
      }
      // D: Delete tool
      if (e.key === 'd' && !e.ctrlKey && !e.metaKey) {
        setActiveTool(activeTool === 'delete' ? null : 'delete');
      }
      // Enter: Compile
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleCompile();
      }
      // Escape: Deselect tool
      if (e.key === 'Escape') {
        setActiveTool(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, setActiveTool, undo, redo, handleCompile]);

  const tools = [
    {
      id: 'swap' as const,
      label: 'SWAP',
      icon: '🔄',
      shortcut: 'S',
      description: 'Replace a nucleotide',
    },
    {
      id: 'insert' as const,
      label: 'INSERT',
      icon: '➕',
      shortcut: 'I',
      description: 'Add a nucleotide',
    },
    {
      id: 'delete' as const,
      label: 'DELETE',
      icon: '✂️',
      shortcut: 'D',
      description: 'Remove a nucleotide',
    },
  ];

  return (
    <div className={styles.toolbar}>
      {/* Mutation Tools */}
      <div className={styles.toolGroup}>
        <span className={styles.groupLabel}>TOOLS</span>
        <div className={styles.tools}>
          {tools.map(tool => (
            <motion.button
              key={tool.id}
              className={`${styles.toolBtn} ${activeTool === tool.id ? styles.active : ''}`}
              onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={`${tool.description} [${tool.shortcut}]`}
              disabled={mutationsUsed >= mutationBudget}
            >
              <span className={styles.toolIcon}>{tool.icon}</span>
              <span className={styles.toolLabel}>{tool.label}</span>
              <span className={styles.toolShortcut}>{tool.shortcut}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* History Controls */}
      <div className={styles.toolGroup}>
        <span className={styles.groupLabel}>HISTORY</span>
        <div className={styles.tools}>
          <motion.button
            className={styles.historyBtn}
            onClick={undo}
            disabled={!canUndo}
            whileHover={canUndo ? { scale: 1.05 } : {}}
            whileTap={canUndo ? { scale: 0.95 } : {}}
            title="Undo [Ctrl+Z]"
          >
            ↩️ UNDO
          </motion.button>
          <motion.button
            className={styles.historyBtn}
            onClick={redo}
            disabled={!canRedo}
            whileHover={canRedo ? { scale: 1.05 } : {}}
            whileTap={canRedo ? { scale: 0.95 } : {}}
            title="Redo [Ctrl+Y]"
          >
            ↪️ REDO
          </motion.button>
          <motion.button
            className={styles.resetBtn}
            onClick={reset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Reset to original sequence"
          >
            🔄 RESET
          </motion.button>
        </div>
      </div>

      {/* Compile Button */}
      <div className={styles.compileSection}>
        <motion.button
          className={`${styles.compileBtn} ${isCompiling ? styles.compiling : ''}`}
          onClick={handleCompile}
          disabled={!canCompile}
          whileHover={canCompile ? { scale: 1.03 } : {}}
          whileTap={canCompile ? { scale: 0.97 } : {}}
        >
          {isCompiling ? (
            <>
              <span className={styles.spinner} />
              COMPILING...
            </>
          ) : (
            <>
              <span className={styles.compileIcon}>🧬</span>
              COMPILE SEQUENCE
              <span className={styles.compileShortcut}>Ctrl+Enter</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

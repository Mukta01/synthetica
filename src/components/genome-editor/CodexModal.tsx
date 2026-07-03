'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CODON_TABLE, AMINO_ACID_PROPERTIES } from '../../lib/bioUtils';
import styles from './CodexModal.module.css';

interface CodexModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CodexModal({ isOpen, onClose }: CodexModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Group codons by amino acid
  const aaToCodons: Record<string, string[]> = {};
  Object.entries(CODON_TABLE).forEach(([codon, aa]) => {
    if (!aaToCodons[aa]) {
      aaToCodons[aa] = [];
    }
    aaToCodons[aa].push(codon);
  });

  const aaList = Object.entries(AMINO_ACID_PROPERTIES).map(([id, props]) => ({
    id,
    ...props,
    codons: aaToCodons[id] || [],
  }));

  const filteredList = aaList.filter(aa => 
    aa.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    aa.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aa.codons.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modal}
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <div className={styles.titleSection}>
                <span className={styles.icon}>📚</span>
                <h2 className={styles.title}>GENOME DATABASE</h2>
              </div>
              <button className={styles.closeBtn} onClick={onClose}>✕</button>
            </div>

            <div className={styles.searchBar}>
              <span className={styles.searchIcon}>🔍</span>
              <input 
                type="text" 
                placeholder="Search by Name, Abbreviation, or Codon (e.g., 'Met', 'ATG')..." 
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>AMINO ACID</th>
                    <th>CODONS</th>
                    <th>PROPERTIES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map(aa => (
                    <tr key={aa.id}>
                      <td>
                        <div className={styles.aaInfo}>
                          <div 
                            className={styles.aaBubble}
                            style={{ 
                              background: `${aa.color}20`, 
                              borderColor: `${aa.color}60`,
                              color: aa.color 
                            }}
                          >
                            {aa.shortName}
                          </div>
                          <div className={styles.aaNames}>
                            <span className={styles.aaName}>{aa.name}</span>
                            <span className={styles.aaId}>{aa.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.codonList}>
                          {aa.codons.map(codon => (
                            <span key={codon} className={styles.codon}>{codon}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className={styles.properties}>
                          <span className={`${styles.prop} ${aa.hydrophobic ? styles.propActive : styles.propInactive}`} title="Hydrophobic">
                            💧 {aa.hydrophobic ? 'Hydrophobic' : 'Hydrophilic'}
                          </span>
                          <span className={`${styles.prop} ${aa.heatStable ? styles.propActive : styles.propInactive}`} title="Heat Stable">
                            🔥 {aa.heatStable ? 'Heat Stable' : 'Heat Sensitive'}
                          </span>
                          <span className={`${styles.prop} ${aa.toxinResistant ? styles.propActive : styles.propInactive}`} title="Toxin Resistant">
                            ☠️ {aa.toxinResistant ? 'Toxin Res.' : 'Toxin Vuln.'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredList.length === 0 && (
                    <tr>
                      <td colSpan={3} className={styles.emptyState}>
                        No records found matching "{searchTerm}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

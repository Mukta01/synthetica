/* ============================================
   SYNTHETICA — Codon Table & Bio Utils
   Standard genetic code translation
   ============================================ */

// Standard Codon → Amino Acid mapping
export const CODON_TABLE: Record<string, string> = {
  // Phenylalanine
  'TTT': 'Phe', 'TTC': 'Phe',
  // Leucine
  'TTA': 'Leu', 'TTG': 'Leu', 'CTT': 'Leu', 'CTC': 'Leu', 'CTA': 'Leu', 'CTG': 'Leu',
  // Isoleucine
  'ATT': 'Ile', 'ATC': 'Ile', 'ATA': 'Ile',
  // Methionine (Start)
  'ATG': 'Met',
  // Valine
  'GTT': 'Val', 'GTC': 'Val', 'GTA': 'Val', 'GTG': 'Val',
  // Serine
  'TCT': 'Ser', 'TCC': 'Ser', 'TCA': 'Ser', 'TCG': 'Ser', 'AGT': 'Ser', 'AGC': 'Ser',
  // Proline
  'CCT': 'Pro', 'CCC': 'Pro', 'CCA': 'Pro', 'CCG': 'Pro',
  // Threonine
  'ACT': 'Thr', 'ACC': 'Thr', 'ACA': 'Thr', 'ACG': 'Thr',
  // Alanine
  'GCT': 'Ala', 'GCC': 'Ala', 'GCA': 'Ala', 'GCG': 'Ala',
  // Tyrosine
  'TAT': 'Tyr', 'TAC': 'Tyr',
  // Stop codons
  'TAA': 'Stop', 'TAG': 'Stop', 'TGA': 'Stop',
  // Histidine
  'CAT': 'His', 'CAC': 'His',
  // Glutamine
  'CAA': 'Gln', 'CAG': 'Gln',
  // Asparagine
  'AAT': 'Asn', 'AAC': 'Asn',
  // Lysine
  'AAA': 'Lys', 'AAG': 'Lys',
  // Aspartic acid
  'GAT': 'Asp', 'GAC': 'Asp',
  // Glutamic acid
  'GAA': 'Glu', 'GAG': 'Glu',
  // Cysteine
  'TGT': 'Cys', 'TGC': 'Cys',
  // Tryptophan
  'TGG': 'Trp',
  // Arginine
  'CGT': 'Arg', 'CGC': 'Arg', 'CGA': 'Arg', 'CGG': 'Arg', 'AGA': 'Arg', 'AGG': 'Arg',
  // Glycine
  'GGT': 'Gly', 'GGC': 'Gly', 'GGA': 'Gly', 'GGG': 'Gly',
};

// Amino acid properties (simplified for game mechanics)
export const AMINO_ACID_PROPERTIES: Record<string, {
  name: string;
  shortName: string;
  color: string;
  hydrophobic: boolean;
  heatStable: boolean;
  toxinResistant: boolean;
}> = {
  'Phe': { name: 'Phenylalanine', shortName: 'F', color: '#4a9eff', hydrophobic: true, heatStable: false, toxinResistant: false },
  'Leu': { name: 'Leucine', shortName: 'L', color: '#4a9eff', hydrophobic: true, heatStable: true, toxinResistant: false },
  'Ile': { name: 'Isoleucine', shortName: 'I', color: '#4a9eff', hydrophobic: true, heatStable: true, toxinResistant: false },
  'Met': { name: 'Methionine', shortName: 'M', color: '#ffaa00', hydrophobic: true, heatStable: false, toxinResistant: true },
  'Val': { name: 'Valine', shortName: 'V', color: '#4a9eff', hydrophobic: true, heatStable: true, toxinResistant: false },
  'Ser': { name: 'Serine', shortName: 'S', color: '#00ff88', hydrophobic: false, heatStable: false, toxinResistant: true },
  'Pro': { name: 'Proline', shortName: 'P', color: '#ff8844', hydrophobic: false, heatStable: true, toxinResistant: false },
  'Thr': { name: 'Threonine', shortName: 'T', color: '#00ff88', hydrophobic: false, heatStable: true, toxinResistant: true },
  'Ala': { name: 'Alanine', shortName: 'A', color: '#aaaaaa', hydrophobic: true, heatStable: true, toxinResistant: false },
  'Tyr': { name: 'Tyrosine', shortName: 'Y', color: '#00e5ff', hydrophobic: true, heatStable: false, toxinResistant: true },
  'His': { name: 'Histidine', shortName: 'H', color: '#00e5ff', hydrophobic: false, heatStable: false, toxinResistant: true },
  'Gln': { name: 'Glutamine', shortName: 'Q', color: '#00ff88', hydrophobic: false, heatStable: false, toxinResistant: true },
  'Asn': { name: 'Asparagine', shortName: 'N', color: '#00ff88', hydrophobic: false, heatStable: false, toxinResistant: false },
  'Lys': { name: 'Lysine', shortName: 'K', color: '#ff3366', hydrophobic: false, heatStable: false, toxinResistant: false },
  'Asp': { name: 'Aspartic Acid', shortName: 'D', color: '#ff3366', hydrophobic: false, heatStable: true, toxinResistant: false },
  'Glu': { name: 'Glutamic Acid', shortName: 'E', color: '#ff3366', hydrophobic: false, heatStable: true, toxinResistant: true },
  'Cys': { name: 'Cysteine', shortName: 'C', color: '#ffaa00', hydrophobic: true, heatStable: false, toxinResistant: true },
  'Trp': { name: 'Tryptophan', shortName: 'W', color: '#a855f7', hydrophobic: true, heatStable: false, toxinResistant: false },
  'Arg': { name: 'Arginine', shortName: 'R', color: '#ff3366', hydrophobic: false, heatStable: false, toxinResistant: true },
  'Gly': { name: 'Glycine', shortName: 'G', color: '#aaaaaa', hydrophobic: false, heatStable: true, toxinResistant: false },
  'Stop': { name: 'Stop', shortName: '*', color: '#666666', hydrophobic: false, heatStable: false, toxinResistant: false },
};

/**
 * Translate a DNA sequence into amino acids
 */
export function translateSequence(dna: string): string[] {
  const aminoAcids: string[] = [];
  const clean = dna.toUpperCase().replace(/[^ATCG]/g, '');
  
  for (let i = 0; i + 2 < clean.length; i += 3) {
    const codon = clean.substring(i, i + 3);
    const aa = CODON_TABLE[codon];
    if (aa) {
      if (aa === 'Stop') break;
      aminoAcids.push(aa);
    } else {
      aminoAcids.push('???');
    }
  }
  
  return aminoAcids;
}

/**
 * Get codons from a DNA sequence
 */
export function getCodons(dna: string): { codon: string; aminoAcid: string }[] {
  const codons: { codon: string; aminoAcid: string }[] = [];
  const clean = dna.toUpperCase().replace(/[^ATCG]/g, '');
  
  for (let i = 0; i + 2 < clean.length; i += 3) {
    const codon = clean.substring(i, i + 3);
    const aa = CODON_TABLE[codon] || '???';
    codons.push({ codon, aminoAcid: aa });
  }
  
  return codons;
}

/**
 * Calculate trait levels from amino acid sequence
 */
export function calculateTraits(aminoAcids: string[]): Record<string, number> {
  let heatScore = 0;
  let toxinScore = 0;
  let membraneScore = 0;
  let metabolicScore = 0;
  
  for (const aa of aminoAcids) {
    const props = AMINO_ACID_PROPERTIES[aa];
    if (!props) continue;
    
    if (props.heatStable) heatScore += 12;
    if (props.toxinResistant) toxinScore += 12;
    if (props.hydrophobic) membraneScore += 8;
    else membraneScore += 4;
    metabolicScore += 6;
  }
  
  // Normalize to 0-100
  const total = aminoAcids.length || 1;
  return {
    heat_resistance: Math.min(100, Math.round((heatScore / total) * 8)),
    toxin_resistance: Math.min(100, Math.round((toxinScore / total) * 8)),
    membrane_stability: Math.min(100, Math.round((membraneScore / total) * 10)),
    metabolic_efficiency: Math.min(100, Math.round((metabolicScore / total) * 12)),
  };
}

/**
 * Calculate folding stability from amino acid composition
 */
export function calculateFoldingStability(aminoAcids: string[]): number {
  if (aminoAcids.length === 0) return 0;
  
  let stability = 50;
  let hydrophobicRuns = 0;
  let currentRun = 0;
  
  for (const aa of aminoAcids) {
    const props = AMINO_ACID_PROPERTIES[aa];
    if (!props) continue;
    
    if (props.hydrophobic) {
      currentRun++;
      if (currentRun >= 3) hydrophobicRuns++;
    } else {
      currentRun = 0;
    }
    
    // Pro adds stability (rigid)
    if (aa === 'Pro') stability += 3;
    // Cys can form disulfide bonds
    if (aa === 'Cys') stability += 5;
    // Gly is too flexible
    if (aa === 'Gly') stability -= 2;
  }
  
  // Hydrophobic core is good
  stability += hydrophobicRuns * 5;
  
  return Math.max(0, Math.min(100, stability));
}

/**
 * Check if a nucleotide is valid
 */
export function isValidNucleotide(char: string): boolean {
  return ['A', 'T', 'C', 'G'].includes(char.toUpperCase());
}

/**
 * Validate a DNA sequence
 */
export function validateSequence(sequence: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (sequence.length === 0) {
    errors.push('Sequence is empty');
    return { valid: false, errors };
  }
  
  if (sequence.length < 3) {
    errors.push('Sequence must be at least 3 nucleotides (1 codon)');
  }
  
  for (let i = 0; i < sequence.length; i++) {
    if (!isValidNucleotide(sequence[i])) {
      errors.push(`Invalid nucleotide '${sequence[i]}' at position ${i + 1}`);
    }
  }
  
  if (sequence.length % 3 !== 0) {
    errors.push(`Sequence length (${sequence.length}) is not divisible by 3 — incomplete codon`);
  }
  
  return { valid: errors.length === 0, errors };
}

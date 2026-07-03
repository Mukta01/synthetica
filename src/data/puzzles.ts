/* ============================================
   SYNTHETICA — Puzzle Definitions
   v1: 2 Environments, ~10 Puzzles
   ============================================ */

import type { Environment, Puzzle } from '../lib/types';

export const environments: Environment[] = [
  // ================================
  // ENVIRONMENT 1: THERMAL VENT
  // ================================
  {
    id: 'thermal-vent',
    name: 'Thermal Vent',
    description: 'Deep-sea volcanic vents reaching temperatures up to 600°C. Your organism must withstand extreme heat.',
    lore: 'At the bottom of the Synthetica Ocean, hydrothermal vents spew superheated mineral-rich water. Only the most heat-adapted organisms survive here. Engineer proteins with thermostable amino acids to create life that thrives where others perish.',
    conditions: {
      temperature: 400,
      toxicity: 20,
    },
    theme: {
      gradient: 'linear-gradient(135deg, #1a0a00 0%, #2d1600 30%, #4a1800 60%, #1a0500 100%)',
      particleEffect: 'heat-shimmer',
      accentColor: '#ff6b35',
      icon: '🌋',
    },
    unlockRequirement: 0,
    puzzles: [
      {
        id: 'tv-01',
        environmentId: 'thermal-vent',
        name: 'First Flame',
        description: 'A gentle introduction to thermal engineering. The vents here are relatively cool — only 200°C.',
        objective: 'Engineer an organism that can withstand 200°C temperatures.',
        difficulty: 1,
        baseSequence: 'ATGAAACCCTTTAGC',
        targetTraits: [
          {
            trait: 'heat_resistance',
            label: 'Heat Resistance',
            description: 'Ability to maintain protein structure at high temperatures',
            minLevel: 40,
          },
        ],
        mutationBudget: 5,
        hints: [
          'Heat-stable amino acids include Leucine (Leu), Proline (Pro), Alanine (Ala), and Valine (Val).',
          'Try swapping nucleotides in the second codon to produce a heat-stable amino acid.',
          'The codon GCG produces Alanine — a very heat-stable amino acid.',
        ],
        parMutations: 2,
        parTimeSeconds: 60,
      },
      {
        id: 'tv-02',
        environmentId: 'thermal-vent',
        name: 'Heat Shield',
        description: 'Temperature rises to 350°C. You need more heat-resistant amino acids in your protein chain.',
        objective: 'Create a protein with strong heat resistance to survive 350°C.',
        difficulty: 1,
        baseSequence: 'ATGAATCAAGATTTT',
        targetTraits: [
          {
            trait: 'heat_resistance',
            label: 'Heat Resistance',
            description: 'Protein thermostability',
            minLevel: 55,
          },
        ],
        mutationBudget: 5,
        hints: [
          'Many of your current amino acids are NOT heat-stable. Identify which ones to replace.',
          'Asn (AAT/AAC), Gln (CAA/CAG), and Phe (TTT/TTC) are heat-sensitive.',
          'Replace AAT with GCT (Ala) and CAA with CCA (Pro) for better heat resistance.',
        ],
        parMutations: 3,
        parTimeSeconds: 90,
      },
      {
        id: 'tv-03',
        environmentId: 'thermal-vent',
        name: 'Crucible',
        description: 'The vent intensifies. You must also maintain membrane stability — heat destroys cell walls too.',
        objective: 'Achieve both heat resistance and membrane stability.',
        difficulty: 2,
        baseSequence: 'ATGCAAGGTTTTAATGAG',
        targetTraits: [
          {
            trait: 'heat_resistance',
            label: 'Heat Resistance',
            description: 'Protein thermostability',
            minLevel: 50,
          },
          {
            trait: 'membrane_stability',
            label: 'Membrane Stability',
            description: 'Cell membrane structural integrity',
            minLevel: 60,
          },
        ],
        mutationBudget: 6,
        hints: [
          'You need BOTH heat resistance AND membrane stability. Hydrophobic amino acids strengthen membranes.',
          'Leu, Ile, Val, and Ala are both hydrophobic AND heat-stable — they solve both requirements.',
          'Try converting the Gln (CAA) and Asn (AAT) codons to Leu (CTG) or Val (GTG).',
        ],
        parMutations: 4,
        parTimeSeconds: 120,
      },
      {
        id: 'tv-04',
        environmentId: 'thermal-vent',
        name: 'Inferno Protocol',
        description: 'Maximum temperature. Every codon counts. The margin for error is razor-thin.',
        objective: 'Engineer a super-thermophile with extreme heat resistance.',
        difficulty: 3,
        baseSequence: 'ATGAAATTTCAAAATGATAGC',
        targetTraits: [
          {
            trait: 'heat_resistance',
            label: 'Heat Resistance',
            description: 'Extreme thermostability',
            minLevel: 70,
          },
          {
            trait: 'membrane_stability',
            label: 'Membrane Stability',
            description: 'Cell membrane integrity under extreme heat',
            minLevel: 55,
          },
        ],
        mutationBudget: 5,
        hints: [
          'With only 5 mutations and 7 codons, every swap must count. Target the weakest amino acids first.',
          'Lys (AAA), Phe (TTT), Gln (CAA), Asn (AAT) are all heat-sensitive and must be replaced.',
          'Pro (CCA/CCG) and Ala (GCG/GCT) are your best options for heat resistance.',
        ],
        parMutations: 4,
        parTimeSeconds: 150,
      },
      {
        id: 'tv-05',
        environmentId: 'thermal-vent',
        name: 'Phoenix Gene',
        description: 'The ultimate thermal challenge. Your organism must not only survive — it must thrive in the fire.',
        objective: 'Maximum heat resistance with metabolic efficiency in volcanic conditions.',
        difficulty: 3,
        baseSequence: 'ATGTTTAGTCAAAACGATAAAGTT',
        targetTraits: [
          {
            trait: 'heat_resistance',
            label: 'Heat Resistance',
            description: 'Volcanic-grade thermostability',
            minLevel: 75,
          },
          {
            trait: 'membrane_stability',
            label: 'Membrane Stability',
            description: 'Structural integrity',
            minLevel: 60,
          },
          {
            trait: 'metabolic_efficiency',
            label: 'Metabolic Efficiency',
            description: 'Energy production in extreme conditions',
            minLevel: 50,
          },
        ],
        mutationBudget: 6,
        hints: [
          'Three traits to satisfy with 6 mutations across 8 codons. Plan your mutations carefully before committing.',
          'Thr (ACT/ACC) is excellent — it is heat-stable, toxin-resistant, AND supports metabolism.',
          'Focus on eliminating Phe (TTT), Gln (CAA), Asn (AAC), and Lys (AAA).',
        ],
        parMutations: 5,
        parTimeSeconds: 180,
      },
    ],
  },

  // ================================
  // ENVIRONMENT 2: TOXIC MARSH
  // ================================
  {
    id: 'toxic-marsh',
    name: 'Toxic Marsh',
    description: 'Bioluminescent swamps saturated with heavy metals and organic toxins. Survival requires chemical resistance.',
    lore: 'The Synthetica Marshlands glow with an eerie light — bioluminescent bacteria feeding on toxic waste. The soil is saturated with cadmium, mercury, and organic poisons. To survive here, your organisms need proteins that can detoxify, chelate metals, and maintain function in a chemical hellscape.',
    conditions: {
      temperature: 35,
      toxicity: 85,
    },
    theme: {
      gradient: 'linear-gradient(135deg, #0a1a0a 0%, #0d2818 30%, #1a3a1a 60%, #0a150a 100%)',
      particleEffect: 'toxic-bubbles',
      accentColor: '#39ff14',
      icon: '☠️',
    },
    unlockRequirement: 3,
    puzzles: [
      {
        id: 'tm-01',
        environmentId: 'toxic-marsh',
        name: 'Toxic Primer',
        description: 'The marsh edges are mildly toxic. A good place to start building chemical resistance.',
        objective: 'Build basic toxin resistance to survive mild marsh conditions.',
        difficulty: 1,
        baseSequence: 'ATGGTTCTTAAAGGT',
        targetTraits: [
          {
            trait: 'toxin_resistance',
            label: 'Toxin Resistance',
            description: 'Ability to neutralize environmental toxins',
            minLevel: 40,
          },
        ],
        mutationBudget: 5,
        hints: [
          'Toxin-resistant amino acids include Met, Ser, Thr, Tyr, His, Gln, Glu, Cys, and Arg.',
          'Val (GTT), Leu (CTT), Lys (AAA), and Gly (GGT) are NOT toxin-resistant.',
          'Try changing GTT to AGT (Ser) or AAA to CAA (Gln).',
        ],
        parMutations: 2,
        parTimeSeconds: 60,
      },
      {
        id: 'tm-02',
        environmentId: 'toxic-marsh',
        name: 'Chelation Therapy',
        description: 'Heavy metal concentrations increase. Your proteins need Cysteine residues to chelate metals.',
        objective: 'Develop heavy metal resistance through cysteine-rich proteins.',
        difficulty: 2,
        baseSequence: 'ATGAAAGGTGCTTTTAGG',
        targetTraits: [
          {
            trait: 'toxin_resistance',
            label: 'Toxin Resistance',
            description: 'Chemical toxin neutralization',
            minLevel: 55,
          },
          {
            trait: 'membrane_stability',
            label: 'Membrane Stability',
            description: 'Membrane resistance to chemical damage',
            minLevel: 45,
          },
        ],
        mutationBudget: 6,
        hints: [
          'Cysteine (TGT/TGC) forms disulfide bonds that both resist toxins and stabilize proteins.',
          'Arg (AGG/CGT) is already toxin-resistant — keep it! Focus on replacing Lys, Gly, and Ala.',
          'Ser (AGT) and Thr (ACT) provide good toxin resistance with moderate membrane support.',
        ],
        parMutations: 4,
        parTimeSeconds: 120,
      },
      {
        id: 'tm-03',
        environmentId: 'toxic-marsh',
        name: 'Acid Rain',
        description: 'Acidic conditions destroy standard proteins. You need extreme chemical resistance.',
        objective: 'Maximum toxin resistance for survival in highly acidic conditions.',
        difficulty: 2,
        baseSequence: 'ATGAAAGTTAATTTCGATGCA',
        targetTraits: [
          {
            trait: 'toxin_resistance',
            label: 'Toxin Resistance',
            description: 'Acid and chemical resistance',
            minLevel: 65,
          },
        ],
        mutationBudget: 5,
        hints: [
          'Identify all non-toxin-resistant amino acids and prioritize replacing them.',
          'Lys (AAA), Val (GTT), Asn (AAT), Phe (TTC), Ala (GCA) need replacement.',
          'His (CAC), Glu (GAG), and Thr (ACC) are excellent choices for acid resistance.',
        ],
        parMutations: 4,
        parTimeSeconds: 120,
      },
      {
        id: 'tm-04',
        environmentId: 'toxic-marsh',
        name: 'Miasma',
        description: 'Airborne toxins and dissolved metals. Every system in your organism is under attack.',
        objective: 'Survive comprehensive toxic assault — all defensive traits needed.',
        difficulty: 3,
        baseSequence: 'ATGGGGAAACTTTTCGATGCTAAC',
        targetTraits: [
          {
            trait: 'toxin_resistance',
            label: 'Toxin Resistance',
            description: 'Complete toxin neutralization',
            minLevel: 70,
          },
          {
            trait: 'membrane_stability',
            label: 'Membrane Stability',
            description: 'Membrane impermeability to toxins',
            minLevel: 55,
          },
          {
            trait: 'metabolic_efficiency',
            label: 'Metabolic Efficiency',
            description: 'Detoxification metabolism',
            minLevel: 45,
          },
        ],
        mutationBudget: 7,
        hints: [
          'Three requirements, 7 mutations, 8 codons. Prioritize dual-purpose amino acids.',
          'Met (ATG) at the start is already toxin-resistant — keep it. Focus on Gly, Lys, Leu, Phe.',
          'Thr (ACC/ACT) is the triple threat — toxin resistant, heat stable, and supports metabolism.',
        ],
        parMutations: 5,
        parTimeSeconds: 180,
      },
      {
        id: 'tm-05',
        environmentId: 'toxic-marsh',
        name: 'Biohazard Genesis',
        description: 'The deepest, most toxic region. Only the most perfectly engineered organism can survive.',
        objective: 'Create the ultimate toxin-resistant organism capable of thriving in lethal conditions.',
        difficulty: 3,
        baseSequence: 'ATGTTTAAAGGTGCTGATAAACTTAAC',
        targetTraits: [
          {
            trait: 'toxin_resistance',
            label: 'Toxin Resistance',
            description: 'Maximum toxin neutralization',
            minLevel: 75,
          },
          {
            trait: 'membrane_stability',
            label: 'Membrane Stability',
            description: 'Impenetrable membrane',
            minLevel: 60,
          },
          {
            trait: 'metabolic_efficiency',
            label: 'Metabolic Efficiency',
            description: 'Self-sustaining detox metabolism',
            minLevel: 55,
          },
        ],
        mutationBudget: 7,
        hints: [
          'This is the hardest puzzle. You have 7 mutations across 9 codons and 3 strict requirements.',
          'Cys (TGC/TGT) is the king of toxin resistance — try to get at least 2 into your sequence.',
          'Don\'t forget: the Met (ATG) start codon counts as toxin-resistant too.',
        ],
        parMutations: 6,
        parTimeSeconds: 240,
      },
    ],
  },
];

/**
 * Get all environments
 */
export function getAllEnvironments(): Environment[] {
  return environments;
}

/**
 * Get a single environment by ID
 */
export function getEnvironment(id: string): Environment | undefined {
  return environments.find(e => e.id === id);
}

/**
 * Get a single puzzle by ID
 */
export function getPuzzle(puzzleId: string): Puzzle | undefined {
  for (const env of environments) {
    const puzzle = env.puzzles.find(p => p.id === puzzleId);
    if (puzzle) return puzzle;
  }
  return undefined;
}

/**
 * Get the environment that contains a given puzzle
 */
export function getEnvironmentForPuzzle(puzzleId: string): Environment | undefined {
  return environments.find(env => env.puzzles.some(p => p.id === puzzleId));
}

// Re-export types
export type { Environment, Puzzle } from '../lib/types';

/* ============================================
   SYNTHETICA — Offline Sequence Evaluator
   Client-side fallback when backend is unavailable
   ============================================ */

import { translateSequence, calculateTraits, calculateFoldingStability, validateSequence } from './bioUtils';
import { calculateScore } from './scoring';
import type { Puzzle, CompilationResult, TraitResult, Mutation } from './types';

/**
 * Evaluate a sequence offline using client-side rules.
 * This is a simplified version of the server-side evaluation.
 */
export function evaluateSequenceOffline(
  puzzle: Puzzle,
  sequence: string,
  mutations: Mutation[],
  timeSeconds: number
): CompilationResult {
  // 1. Validate sequence
  const validation = validateSequence(sequence);
  if (!validation.valid) {
    return createFailureResult(
      mutations.length,
      timeSeconds,
      'dna_repair',
      'codon 1-3',
      `Invalid sequence: ${validation.errors[0]}`,
      [],
      puzzle.targetTraits.map(t => ({
        trait: t.trait,
        label: t.label,
        level: 0,
        required: t.minLevel,
        met: false,
      }))
    );
  }

  // 2. Translate to amino acids
  const aminoAcids = translateSequence(sequence);
  
  if (aminoAcids.length === 0) {
    return createFailureResult(
      mutations.length,
      timeSeconds,
      'protein_stability',
      'codon 1',
      'No valid protein produced — sequence may start with a stop codon',
      aminoAcids,
      puzzle.targetTraits.map(t => ({
        trait: t.trait,
        label: t.label,
        level: 0,
        required: t.minLevel,
        met: false,
      }))
    );
  }

  // 3. Calculate traits
  const traits = calculateTraits(aminoAcids);
  const foldingStability = calculateFoldingStability(aminoAcids);

  // 4. Check trait requirements
  const traitResults: TraitResult[] = puzzle.targetTraits.map(req => ({
    trait: req.trait,
    label: req.label,
    level: traits[req.trait] || 0,
    required: req.minLevel,
    met: (traits[req.trait] || 0) >= req.minLevel,
  }));

  const allTraitsMet = traitResults.every(t => t.met);
  const stableFolding = foldingStability >= 40;
  const survived = allTraitsMet && stableFolding;

  // 5. Determine failure details
  if (!survived) {
    const failedTrait = traitResults.find(t => !t.met);
    let failurePhase: CompilationResult['survivalResult']['failurePhase'] = 'protein_stability';
    let failureReason = 'Protein structure too unstable to function';
    
    if (failedTrait) {
      if (failedTrait.trait === 'heat_resistance') {
        failurePhase = 'membrane_integrity';
        failureReason = `Heat resistance insufficient — ${failedTrait.level}% vs ${failedTrait.required}% required. Membrane integrity compromised.`;
      } else if (failedTrait.trait === 'toxin_resistance') {
        failurePhase = 'metabolic_function';
        failureReason = `Toxin resistance insufficient — ${failedTrait.level}% vs ${failedTrait.required}% required. Metabolic pathways disrupted.`;
      } else if (failedTrait.trait === 'membrane_stability') {
        failurePhase = 'membrane_integrity';
        failureReason = `Membrane stability insufficient — ${failedTrait.level}% vs ${failedTrait.required}% required.`;
      } else {
        failureReason = `${failedTrait.label} insufficient — ${failedTrait.level}% vs ${failedTrait.required}% required.`;
      }
    } else if (!stableFolding) {
      failurePhase = 'protein_stability';
      failureReason = `Protein folding stability at ${foldingStability}% — minimum 40% required for functional protein.`;
    }

    // Find the approximate codon position of failure
    const failCodonStart = Math.max(1, Math.floor(aminoAcids.length * 0.4));
    const failCodonEnd = Math.min(aminoAcids.length, failCodonStart + 3);

    return createFailureResult(
      mutations.length,
      timeSeconds,
      failurePhase,
      `codon ${failCodonStart}-${failCodonEnd}`,
      failureReason,
      aminoAcids,
      traitResults,
      foldingStability
    );
  }

  // 6. Success! Calculate score
  const scoreResult = calculateScore(mutations.length, timeSeconds);

  return {
    survived: true,
    score: scoreResult.score,
    stars: scoreResult.stars,
    mutationsUsed: mutations.length,
    timeSeconds,
    proteinStructure: {
      aminoAcids,
      foldingStability,
    },
    survivalResult: {
      environmentalStress: Math.max(...puzzle.targetTraits.map(t => t.minLevel)),
      organismResilience: Math.round(traitResults.reduce((sum, t) => sum + t.level, 0) / traitResults.length),
    },
    traits: traitResults,
  };
}

function createFailureResult(
  mutationsUsed: number,
  timeSeconds: number,
  failurePhase: CompilationResult['survivalResult']['failurePhase'],
  failurePoint: string,
  failureReason: string,
  aminoAcids: string[],
  traits: TraitResult[],
  foldingStability: number = 0
): CompilationResult {
  return {
    survived: false,
    score: 0,
    stars: 0,
    mutationsUsed,
    timeSeconds,
    proteinStructure: {
      aminoAcids,
      foldingStability,
    },
    survivalResult: {
      environmentalStress: 80,
      organismResilience: 20,
      failurePoint,
      failureReason,
      failurePhase,
    },
    traits,
  };
}

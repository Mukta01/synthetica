# bio_utils.py
# Bioinformatics rules for sequence translation, folding stability, and trait calculations.

CODON_TABLE = {
    'TTT': 'Phe', 'TTC': 'Phe',
    'TTA': 'Leu', 'TTG': 'Leu', 'CTT': 'Leu', 'CTC': 'Leu', 'CTA': 'Leu', 'CTG': 'Leu',
    'ATT': 'Ile', 'ATC': 'Ile', 'ATA': 'Ile',
    'ATG': 'Met',
    'GTT': 'Val', 'GTC': 'Val', 'GTA': 'Val', 'GTG': 'Val',
    'TCT': 'Ser', 'TCC': 'Ser', 'TCA': 'Ser', 'TCG': 'Ser', 'AGT': 'Ser', 'AGC': 'Ser',
    'CCT': 'Pro', 'CCC': 'Pro', 'CCA': 'Pro', 'CCG': 'Pro',
    'ACT': 'Thr', 'ACC': 'Thr', 'ACA': 'Thr', 'ACG': 'Thr',
    'GCT': 'Ala', 'GCC': 'Ala', 'GCA': 'Ala', 'GCG': 'Ala',
    'TAT': 'Tyr', 'TAC': 'Tyr',
    'TAA': 'Stop', 'TAG': 'Stop', 'TGA': 'Stop',
    'CAT': 'His', 'CAC': 'His',
    'CAA': 'Gln', 'CAG': 'Gln',
    'AAT': 'Asn', 'AAC': 'Asn',
    'AAA': 'Lys', 'AAG': 'Lys',
    'GAT': 'Asp', 'GAC': 'Asp',
    'GAA': 'Glu', 'GAG': 'Glu',
    'TGT': 'Cys', 'TGC': 'Cys',
    'TGG': 'Trp',
    'CGT': 'Arg', 'CGC': 'Arg', 'CGA': 'Arg', 'CGG': 'Arg', 'AGA': 'Arg', 'AGG': 'Arg',
    'GGT': 'Gly', 'GGC': 'Gly', 'GGA': 'Gly', 'GGG': 'Gly',
}

AA_PROPERTIES = {
    'Phe': {'name': 'Phenylalanine', 'short': 'F', 'color': '#4a9eff', 'hydrophobic': True, 'heatStable': False, 'toxinResistant': False},
    'Leu': {'name': 'Leucine', 'short': 'L', 'color': '#4a9eff', 'hydrophobic': True, 'heatStable': True, 'toxinResistant': False},
    'Ile': {'name': 'Isoleucine', 'short': 'I', 'color': '#4a9eff', 'hydrophobic': True, 'heatStable': True, 'toxinResistant': False},
    'Met': {'name': 'Methionine', 'short': 'M', 'color': '#ffaa00', 'hydrophobic': True, 'heatStable': False, 'toxinResistant': True},
    'Val': {'name': 'Valine', 'short': 'V', 'color': '#4a9eff', 'hydrophobic': True, 'heatStable': True, 'toxinResistant': False},
    'Ser': {'name': 'Serine', 'short': 'S', 'color': '#00ff88', 'hydrophobic': False, 'heatStable': False, 'toxinResistant': True},
    'Pro': {'name': 'Proline', 'short': 'P', 'color': '#ff8844', 'hydrophobic': False, 'heatStable': True, 'toxinResistant': False},
    'Thr': {'name': 'Threonine', 'short': 'T', 'color': '#00ff88', 'hydrophobic': False, 'heatStable': True, 'toxinResistant': True},
    'Ala': {'name': 'Alanine', 'short': 'A', 'color': '#aaaaaa', 'hydrophobic': True, 'heatStable': True, 'toxinResistant': False},
    'Tyr': {'name': 'Tyrosine', 'short': 'Y', 'color': '#00e5ff', 'hydrophobic': True, 'heatStable': False, 'toxinResistant': True},
    'His': {'name': 'Histidine', 'short': 'H', 'color': '#00e5ff', 'hydrophobic': False, 'heatStable': False, 'toxinResistant': True},
    'Gln': {'name': 'Glutamine', 'short': 'Q', 'color': '#00ff88', 'hydrophobic': False, 'heatStable': False, 'toxinResistant': True},
    'Asn': {'name': 'Asparagine', 'short': 'N', 'color': '#00ff88', 'hydrophobic': False, 'heatStable': False, 'toxinResistant': False},
    'Lys': {'name': 'Lysine', 'short': 'K', 'color': '#ff3366', 'hydrophobic': False, 'heatStable': False, 'toxinResistant': False},
    'Asp': {'name': 'Aspartic Acid', 'short': 'D', 'color': '#ff3366', 'hydrophobic': False, 'heatStable': True, 'toxinResistant': False},
    'Glu': {'name': 'Glutamic Acid', 'short': 'E', 'color': '#ff3366', 'hydrophobic': False, 'heatStable': True, 'toxinResistant': True},
    'Cys': {'name': 'Cysteine', 'short': 'C', 'color': '#ffaa00', 'hydrophobic': True, 'heatStable': False, 'toxinResistant': True},
    'Trp': {'name': 'Tryptophan', 'short': 'W', 'color': '#a855f7', 'hydrophobic': True, 'heatStable': False, 'toxinResistant': False},
    'Arg': {'name': 'Arginine', 'short': 'R', 'color': '#ff3366', 'hydrophobic': False, 'heatStable': False, 'toxinResistant': True},
    'Gly': {'name': 'Glycine', 'short': 'G', 'color': '#aaaaaa', 'hydrophobic': False, 'heatStable': True, 'toxinResistant': False},
    'Stop': {'name': 'Stop', 'short': '*', 'color': '#666666', 'hydrophobic': False, 'heatStable': False, 'toxinResistant': False},
}

# Puzzle requirements dictionary matching targetTraits in Next.js puzzles.ts
PUZZLES = {
    'tv-01': {
        'target_traits': {'heat_resistance': 40},
        'min_stability': 40,
    },
    'tv-02': {
        'target_traits': {'heat_resistance': 55},
        'min_stability': 40,
    },
    'tv-03': {
        'target_traits': {'heat_resistance': 50, 'membrane_stability': 60},
        'min_stability': 40,
    },
    'tv-04': {
        'target_traits': {'heat_resistance': 70, 'membrane_stability': 55},
        'min_stability': 45,
    },
    'tv-05': {
        'target_traits': {'heat_resistance': 75, 'membrane_stability': 60, 'metabolic_efficiency': 50},
        'min_stability': 50,
    },
    'tm-01': {
        'target_traits': {'toxin_resistance': 40},
        'min_stability': 40,
    },
    'tm-02': {
        'target_traits': {'toxin_resistance': 55, 'membrane_stability': 45},
        'min_stability': 40,
    },
    'tm-03': {
        'target_traits': {'toxin_resistance': 65},
        'min_stability': 40,
    },
    'tm-04': {
        'target_traits': {'toxin_resistance': 70, 'membrane_stability': 55, 'metabolic_efficiency': 45},
        'min_stability': 45,
    },
    'tm-05': {
        'target_traits': {'toxin_resistance': 75, 'membrane_stability': 60, 'metabolic_efficiency': 55},
        'min_stability': 50,
    }
}

def translate_sequence(dna: str) -> list:
    """Translate DNA sequence into amino acids, stopping at a Stop codon."""
    amino_acids = []
    clean = "".join([c for c in dna.upper() if c in "ATCG"])
    
    for i in range(0, len(clean) - 2, 3):
        codon = clean[i:i+3]
        aa = CODON_TABLE.get(codon, '???')
        if aa == 'Stop':
            break
        amino_acids.append(aa)
        
    return amino_acids

def calculate_traits(amino_acids: list) -> dict:
    """Calculate trait percentages from amino acid properties."""
    heat_score = 0
    toxin_score = 0
    membrane_score = 0
    metabolic_score = 0
    
    for aa in amino_acids:
        props = AA_PROPERTIES.get(aa)
        if not props:
            continue
            
        if props['heatStable']:
            heat_score += 12
        if props['toxinResistant']:
            toxin_score += 12
        if props['hydrophobic']:
            membrane_score += 8
        else:
            membrane_score += 4
        metabolic_score += 6
        
    total = len(amino_acids) if amino_acids else 1
    
    return {
        'heat_resistance': min(100, round((heat_score / total) * 8)),
        'toxin_resistance': min(100, round((toxin_score / total) * 8)),
        'membrane_stability': min(100, round((membrane_score / total) * 10)),
        'metabolic_efficiency': min(100, round((metabolic_score / total) * 12)),
    }

def calculate_folding_stability(amino_acids: list) -> int:
    """Calculate protein folding stability from amino acid sequence."""
    if not amino_acids:
        return 0
        
    stability = 50
    hydrophobic_runs = 0
    current_run = 0
    
    for aa in amino_acids:
        props = AA_PROPERTIES.get(aa)
        if not props:
            continue
            
        if props['hydrophobic']:
            current_run += 1
            if current_run >= 3:
                hydrophobic_runs += 1
        else:
            current_run = 0
            
        if aa == 'Pro':
            stability += 3
        if aa == 'Cys':
            stability += 5
        if aa == 'Gly':
            stability -= 2
            
    stability += hydrophobic_runs * 5
    return max(0, min(100, stability))

def evaluate_organism(puzzle_id: str, sequence: str) -> dict:
    """Evalues if sequence matches target requirements and returns detailed diagnostics."""
    amino_acids = translate_sequence(sequence)
    traits = calculate_traits(amino_acids)
    stability = calculate_folding_stability(amino_acids)
    
    puzzle = PUZZLES.get(puzzle_id)
    if not puzzle:
        return {
            "survived": False,
            "failurePoint": "UNKNOWN PUZZLE",
            "failureReason": f"Puzzle '{puzzle_id}' does not exist.",
            "traits": traits,
            "stability": stability,
            "aminoAcids": amino_acids
        }
        
    # Check folding stability first
    min_stability = puzzle['min_stability']
    if stability < min_stability:
        return {
            "survived": False,
            "failurePoint": "PROTEIN FOLDING",
            "failureReason": f"Protein folding stability is {stability}%, but minimum required is {min_stability}%. Try introducing hydrophobic runs or Proline/Cysteine to stabilize the protein structure.",
            "failurePhase": "protein_folding",
            "traits": traits,
            "stability": stability,
            "aminoAcids": amino_acids
        }
        
    # Check trait requirements
    for trait_name, req_level in puzzle['target_traits'].items():
        actual_level = traits.get(trait_name, 0)
        if actual_level < req_level:
            # Generate contextual details
            label = trait_name.replace("_", " ").title()
            return {
                "survived": False,
                "failurePoint": label,
                "failureReason": f"Insufficient {label}. Calculated level is {actual_level}%, but environmental threshold requires {req_level}%. Modify nucleotide codons to express stronger trait-specific properties.",
                "failurePhase": trait_name,
                "traits": traits,
                "stability": stability,
                "aminoAcids": amino_acids
            }
            
    # All checks passed
    return {
        "survived": True,
        "traits": traits,
        "stability": stability,
        "aminoAcids": amino_acids
    }

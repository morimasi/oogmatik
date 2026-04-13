import type { AgeGroup } from '../../../types/creativeStudio';
import type { Difficulty } from '../../../types/activityStudio';

export interface PedagogicValidationInput {
  ageGroup: AgeGroup;
  difficulty: Difficulty;
  targetSkills: string[];
  pedagogicalNote: string;
  itemDifficulties: Difficulty[];
}

export interface PedagogicValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const allowedByAge: Record<AgeGroup, Difficulty[]> = {
  '5-7': ['Kolay'],
  '8-10': ['Kolay', 'Orta'],
  '11-13': ['Kolay', 'Orta', 'Zor'],
  '14+': ['Kolay', 'Orta', 'Zor'],
};

export function validatePedagogicRules(input: PedagogicValidationInput): PedagogicValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (input.pedagogicalNote.trim().length < 20) {
    errors.push('pedagogicalNote en az 20 karakter olmalidir.');
  }

  if (input.targetSkills.length < 2) {
    errors.push('En az 2 targetSkills zorunludur.');
  }

  if (!allowedByAge[input.ageGroup].includes(input.difficulty)) {
    errors.push('Yas-zorluk uyumu (ZPD) ihlali tespit edildi.');
  }

  if (input.itemDifficulties.length >= 2) {
    if (input.itemDifficulties[0] !== 'Kolay' || input.itemDifficulties[1] !== 'Kolay') {
      errors.push('Ilk 2 madde Kolay olmalidir (basari mimarisi).');
    }
  } else if (input.itemDifficulties.length === 1 && input.itemDifficulties[0] !== 'Kolay') {
    errors.push('Tek madde varsa Kolay olmalidir.');
  } else if (input.itemDifficulties.length === 0) {
    warnings.push('Madde zorluk dagilimi verilmedi.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

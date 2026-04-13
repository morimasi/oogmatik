export interface ContentValidationInput {
  title: string;
  scenario: string;
  materials: string[];
  steps: string[];
}

export interface ContentValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateContentQuality(input: ContentValidationInput): ContentValidationResult {
  const errors: string[] = [];

  if (input.title.trim().length < 3) {
    errors.push('Baslik en az 3 karakter olmalidir.');
  }

  if (input.scenario.trim().length < 20) {
    errors.push('Senaryo en az 20 karakter olmalidir.');
  }

  if (input.materials.length === 0) {
    errors.push('En az bir materyal belirtilmelidir.');
  }

  if (input.steps.length === 0) {
    errors.push('En az bir adim belirtilmelidir.');
  }

  return { valid: errors.length === 0, errors };
}

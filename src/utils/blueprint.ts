// Blueprint validation and safe fallback utilities
// - Keeps blueprint usage robust when data is missing or malformed

export type BlueprintLike = { [key: string]: any };

// A permissive default blueprint to fall back to when data is invalid
export const DEFAULT_BLUEPRINT: BlueprintLike = {
  id: 'default_blueprint',
  title: 'Otomatik Şablon',
  detectedType: 'ARCH_CLONE',
  worksheetBlueprint: '{\n  "questions": []\n}',
  layoutHints: { columns: 1, questionCount: 1, hasImages: false },
  content: [],
  metadata: {},
};

// Basic validation: ensure it's an object and has at least one common marker
// This is intentionally permissive to avoid blocking generation on partial data
export function isValidBlueprint(bp: unknown): bp is BlueprintLike {
  if (bp == null) return false;
  if (typeof bp !== 'object') return false;
  const obj = bp as BlueprintLike;
  // Accept if it has a recognizable hint for blueprint data
  return (
    typeof obj.worksheetBlueprint === 'string' ||
    (typeof obj.id === 'string' && obj.id.length > 0) ||
    Array.isArray(obj.content) ||
    obj.metadata !== undefined
  );
}

// Return the blueprint if valid, otherwise the provided fallback or DEFAULT_BLUEPRINT
export function getBlueprintOrFallback(
  bp: unknown,
  fallback: BlueprintLike = DEFAULT_BLUEPRINT
): BlueprintLike {
  if (isValidBlueprint(bp)) {
    return bp;
  }
  return fallback;
}

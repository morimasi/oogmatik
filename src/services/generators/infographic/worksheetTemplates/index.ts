/**
 * worksheetTemplates/index.ts — Barrel export + Template Registry
 */

import type { WorksheetTemplateType, WorksheetGeneratorFn } from '../../../../types/worksheetActivity';

// Offline generators
import * as offline from './offlineGenerators';
// AI generators
import * as ai from './aiGenerators';

export interface WorksheetGeneratorMapping {
  offline?: WorksheetGeneratorFn;
  ai?: WorksheetGeneratorFn;
}

/**
 * 32 Etkinlik Şablonu için Merkezi Kayıt Defteri
 * Her şablon türü için AI ve/veya Offline generator tanımlar.
 */
export const WORKSHEET_GENERATOR_REGISTRY: Record<WorksheetTemplateType, WorksheetGeneratorMapping> = {
  // ── Görsel & Mekansal ──
  'pattern-completion':    { offline: offline.generatePatternCompletion, ai: undefined },
  'symmetry-drawing':      { offline: offline.generateSymmetryDrawing, ai: undefined },
  'grid-copy':             { offline: offline.generateGridCopy, ai: undefined },
  'spot-difference':       { offline: offline.generateSpotDifference, ai: undefined },
  'word-search-grid':      { offline: offline.generateWordSearchGrid, ai: undefined },
  'directional-tracking':  { offline: offline.generateDirectionalTracking, ai: undefined },
  'shape-counting':        { offline: offline.generateShapeCounting, ai: undefined },
  'maze':                  { offline: offline.generateMaze, ai: undefined },

  // ── Okuduğunu Anlama ──
  'five-w-one-h-questions': { offline: undefined, ai: ai.generateFiveWOneHQuestions },
  'true-false':             { offline: offline.generateTrueFalseOffline, ai: undefined },
  'fill-in-blanks':         { offline: undefined, ai: ai.generateFillInBlanks },
  'event-sequencing':       { offline: undefined, ai: ai.generateEventSequencing },
  'main-idea':              { offline: undefined, ai: ai.generateMainIdea },
  'inference':              { offline: undefined, ai: ai.generateInference },
  'character-analysis':     { offline: undefined, ai: ai.generateCharacterAnalysis },
  'cause-effect-matching':  { offline: undefined, ai: ai.generateCauseEffectMatching },

  // ── Okuma & Dil ──
  'syllable-splitting':       { offline: offline.generateSyllableSplitting, ai: undefined },
  'syllable-combining':       { offline: offline.generateSyllableCombining, ai: undefined },
  'synonym-matching':         { offline: offline.generateSynonymMatching, ai: undefined },
  'antonym-matching':         { offline: offline.generateAntonymMatching, ai: undefined },
  'root-suffix-analysis':     { offline: offline.generateRootSuffixAnalysis, ai: undefined },
  'sentence-elements':        { offline: undefined, ai: ai.generateSentenceElements },
  'word-type-classification': { offline: offline.generateWordTypeClassification, ai: undefined },
  'spelling-rules':           { offline: offline.generateSpellingRules, ai: undefined },

  // ── Matematik & Mantık ──
  'number-pyramid':     { offline: offline.generateNumberPyramid, ai: undefined },
  'operation-boxes':    { offline: offline.generateOperationBoxes, ai: undefined },
  'simple-sudoku':      { offline: offline.generateSimpleSudoku, ai: undefined },
  'clock-reading':      { offline: offline.generateClockReading, ai: undefined },
  'money-calculation':  { offline: offline.generateMoneyCalculation, ai: undefined },
  'sequence-pattern':   { offline: offline.generateSequencePattern, ai: undefined },
  'graph-reading':      { offline: undefined, ai: ai.generateGraphReading },
  'word-problem':       { offline: undefined, ai: ai.generateWordProblem },
};

/**
 * Şablon türüne ve moda göre uygun generatörü çalıştırır.
 */
export async function generateWorksheetActivity(
  templateType: WorksheetTemplateType,
  params: import('../../../../types/worksheetActivity').WorksheetGeneratorParams
) {
  const mapping = WORKSHEET_GENERATOR_REGISTRY[templateType];
  if (!mapping) throw new Error(`Bilinmeyen şablon türü: ${templateType}`);

  const generator = params.mode === 'ai' && mapping.ai
    ? mapping.ai
    : mapping.offline ?? mapping.ai;

  if (!generator) throw new Error(`${templateType} için uygun üretici bulunamadı.`);

  return generator(params);
}

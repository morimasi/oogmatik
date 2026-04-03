/**
 * Workbook AI Assistant — Barrel Export
 *
 * @author Selin Arslan (AI Muhendisi)
 * @created 2026-04-02
 */

// Ana servis
export {
  WorkbookAIAssistant,
  workbookAIAssistant,
  buildWorkbookContext,
  type WorkbookContext,
} from './WorkbookAIAssistant';

// Schema'lar ve tipler
export {
  WorkbookAISchemas,
  DIFFICULTY_ENUM,
  VERDICT_ENUM,
  SEVERITY_ENUM,
  AGE_GROUP_ENUM,
  DIAGNOSIS_ENUM,
  type Difficulty,
  type Verdict,
  type Severity,
  type AgeGroup,
  type Diagnosis,
  type ActivitySuggestion,
  type ActivitySuggestionResponse,
  type SkillGap,
  type SkillGapResponse,
  type BalanceIssue,
  type PageBalanceResponse,
  type DifficultyDistributionResponse,
  type ThemeInconsistency,
  type ThemeConsistencyResponse,
  type MetadataFillResponse,
  type SequenceChange,
  type SequenceOptimizationResponse,
} from './schemas/workbookAISchemas';

// Cache
export {
  AssistantCache,
  assistantCache,
  invalidateOnWorkbookChange,
} from './cache/assistantCache';

// Validator
export {
  ContentValidator,
  contentValidator,
  handleAIResponseWithFallback,
  type ValidationResult,
} from './validators/contentValidator';

// Prompts (internal use, but exported for testing)
export {
  buildActivitySuggestionPrompt,
  buildSkillGapPrompt,
  buildPageBalancePrompt,
  buildDifficultyAnalysisPrompt,
  buildThemeConsistencyPrompt,
  buildPedagogicalNotePrompt,
  buildBatchPedagogicalNotePrompt,
  buildPrefacePrompt,
  buildMetadataFillPrompt,
  buildSequenceOptimizationPrompt,
  compressItemsForPrompt,
} from './prompts/workbookPrompts';

export type GenerationMode = 'fast' | 'ai';
export type SuperStudioDifficulty = 'Kolay' | 'Orta' | 'Zor';

/** AI üretim parametreleri — motor.md Phase 1.1 (Selin Arslan: Gemini 2.5 Flash sabit) */
export interface SuperStudioGenerationParams {
  temperature: number;
  topP: number;
  thinkingBudget: number;
}

export const SUPER_STUDIO_PARAM_DEFAULTS: SuperStudioGenerationParams = {
  temperature: 0.7,
  topP: 0.9,
  thinkingBudget: 2048,
};

export const SUPER_STUDIO_PARAM_LIMITS = {
  temperature: { min: 0, max: 1 },
  topP: { min: 0, max: 1 },
  thinkingBudget: { min: 0, max: 8192 },
} as const;

export interface TemplateDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
}

export interface PageData {
  title: string;
  content: string;
  instruction?: string;
  pageNumber?: number;
  totalPages?: number;
  pedagogicalNote?: string;
}

export interface GeneratedContentPayload {
  id: string;
  templateId: string;
  pages: PageData[];
  createdAt: number;
  fromCache?: boolean; // Cache'ten geldi mi?
}

// Standart Generator Error — motor.md Yapısal 5.3
export type GeneratorErrorCode =
  | 'RATE_LIMIT'
  | 'INVALID_RESPONSE'
  | 'CACHE_MISS'
  | 'NETWORK_ERROR'
  | 'VALIDATION_FAILED'
  | 'NO_TEMPLATE_SELECTED'
  | 'BATCH_GENERATION_FAILED'
  | 'INTERNAL_ERROR'
  | 'GENERATOR_ERROR';

export interface GeneratorError {
  code: GeneratorErrorCode;
  message: string;
  retryable: boolean;
  fallbackToOffline: boolean;
  userMessage: string;
  details?: Record<string, unknown>;
}

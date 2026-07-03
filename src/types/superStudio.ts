export type GenerationMode = 'fast' | 'ai';
export type SuperStudioDifficulty = 'Kolay' | 'Orta' | 'Zor';

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

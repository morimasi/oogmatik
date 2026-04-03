/**
 * Workbook AI Assistant — Content Validator
 *
 * Hallucination onleme icin 5 katmanli dogrulama sistemi:
 * 1. JSON Schema Uyumu
 * 2. ActivityType Dogrulama
 * 3. MEB Kazanim Referans Dogrulama
 * 4. Pedagojik Guvenlik
 * 5. Tutarlilik Kontrolu
 *
 * @author Selin Arslan (AI Muhendisi)
 * @created 2026-04-02
 */

import { ActivityType } from '../../../types';
import type { WorkbookContext } from '../prompts/workbookPrompts';
import type { ActivitySuggestion } from '../schemas/workbookAISchemas';

// ============================================================
// TYPES
// ============================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedOutput?: unknown;
}

// ============================================================
// VALIDATION PATTERNS
// ============================================================

// Olumsuz dil kaliplari (disleksi hassasiyeti)
const NEGATIVE_PATTERNS = [
  /yapama/gi,
  /edemez/gi,
  /basarisiz/gi,
  /zayif/gi,
  /yetersiz/gi,
  /olmaz/gi,
  /\bimkansiz\b/gi,
  /\bhata\b(?!.*(tespit|duzelt))/gi, // "hata tespiti" OK, tek basina "hata" uyari
];

// Yas uygunsuz icerik kaliplari
const INAPPROPRIATE_PATTERNS = [
  /\bsiddet\b/gi,
  /\bkorku\b/gi,
  /\bolum\b/gi,
  /\bkan\b/gi,
  /\bsavas\b/gi,
  /\bsilah\b/gi,
  /\bceset\b/gi,
];

// MEB kazanim format kaliplari (dogrulama icin)
const MEB_REFERENCE_PATTERNS = [
  /T\.(\d+)\.(\d+)\.(\d+)/g, // Turkce: T.4.1.3
  /M\.(\d+)\.(\d+)\.(\d+)/g, // Matematik: M.5.2.1
  /F\.(\d+)\.(\d+)\.(\d+)/g, // Fen: F.6.3.2
  /S\.(\d+)\.(\d+)\.(\d+)/g, // Sosyal: S.7.1.4
];

// ============================================================
// CONTENT VALIDATOR CLASS
// ============================================================

export class ContentValidator {
  /**
   * KATMAN 1: JSON Schema Uyumu
   * AI'den donen veri beklenen formatta mi?
   */
  validateSchema(data: unknown, expectedFields: string[]): ValidationResult {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
      return {
        isValid: false,
        errors: ['AI yaniti gecersiz: obje bekleniyor'],
        warnings: [],
      };
    }

    for (const field of expectedFields) {
      if (!(field in (data as object))) {
        errors.push(`Eksik alan: ${field}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * KATMAN 2: ActivityType Dogrulama
   * AI'in onerdigi aktivite turleri gercekten var mi?
   */
  validateActivityTypes(suggestions: ActivitySuggestion[]): ValidationResult {
    const validTypes = Object.values(ActivityType) as string[];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const suggestion of suggestions) {
      if (!validTypes.includes(suggestion.activityType)) {
        // Yakin eslestirme dene
        const similar = this.findSimilarActivityType(suggestion.activityType, validTypes);
        if (similar) {
          warnings.push(
            `"${suggestion.activityType}" yerine "${similar}" kullanildi (yakin eslestirme)`
          );
          suggestion.activityType = similar;
        } else {
          errors.push(`Gecersiz aktivite turu: ${suggestion.activityType}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedOutput: suggestions,
    };
  }

  /**
   * Yakin aktivite turu bul (typo toleransi)
   */
  private findSimilarActivityType(input: string, validTypes: string[]): string | null {
    const normalized = input.toUpperCase().replace(/[\s-_]/g, '');

    for (const type of validTypes) {
      const normalizedType = type.toUpperCase().replace(/[\s-_]/g, '');
      if (normalizedType.includes(normalized) || normalized.includes(normalizedType)) {
        return type;
      }
    }

    return null;
  }

  /**
   * KATMAN 3: MEB Kazanim Referans Dogrulama
   * AI'in bahsettigi kazanimlar MEB mufredatinda var mi?
   */
  validateMEBReferences(content: string): ValidationResult {
    const warnings: string[] = [];
    const detectedReferences: string[] = [];

    for (const pattern of MEB_REFERENCE_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        detectedReferences.push(...matches);
      }
    }

    // Bulunan referanslari logla (tam dogrulama icin curriculumService gerekli)
    if (detectedReferences.length > 0) {
      warnings.push(`MEB kazanim referanslari tespit edildi: ${detectedReferences.join(', ')}`);
      // TODO: curriculumService.verifyReferences(detectedReferences) ile dogrula
    }

    return {
      isValid: true, // Simdilik sadece uyari
      errors: [],
      warnings,
    };
  }

  /**
   * KATMAN 4: Pedagojik Guvenlik
   * Icerik pedagojik olarak guvenli mi?
   */
  validatePedagogicalSafety(content: unknown): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);

    // Olumsuz dil kontrolu
    for (const pattern of NEGATIVE_PATTERNS) {
      if (pattern.test(contentStr)) {
        warnings.push(`Olumsuz dil tespit edildi: "${pattern.source}"`);
      }
    }

    // Yas uygunsuz icerik kontrolu
    for (const pattern of INAPPROPRIATE_PATTERNS) {
      if (pattern.test(contentStr)) {
        errors.push(`Uygunsuz icerik tespit edildi: "${pattern.source}"`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * KATMAN 5: Tutarlilik Kontrolu
   * Oneri, mevcut kitapcik baglami ile tutarli mi?
   */
  validateContextConsistency(
    suggestion: ActivitySuggestion,
    context: WorkbookContext
  ): ValidationResult {
    const warnings: string[] = [];

    // Zorluk seviyesi mantigi
    if (
      suggestion.recommendedDifficulty === 'Zor' &&
      context.difficultyDistribution.hard > 30
    ) {
      warnings.push('Kitapcikta zaten cok fazla zor aktivite var (%30+)');
    }

    // Dominant aktivite kontrolu
    const dominant = context.activityDistribution.find(
      (d) => d.type === suggestion.activityType && d.count >= 3
    );
    if (dominant) {
      warnings.push(
        `"${suggestion.activityType}" aktivitesi zaten ${dominant.count} kez mevcut`
      );
    }

    return {
      isValid: true, // Uyarilar kritik degil
      errors: [],
      warnings,
    };
  }

  /**
   * TUM KATMANLARI CALISTIR
   */
  validateFull(
    data: unknown,
    context: WorkbookContext,
    options: {
      expectedFields?: string[];
      validateActivityTypes?: boolean;
      checkPedagogicalSafety?: boolean;
    } = {}
  ): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    // Katman 1: Schema
    if (options.expectedFields) {
      const schemaResult = this.validateSchema(data, options.expectedFields);
      allErrors.push(...schemaResult.errors);
      allWarnings.push(...schemaResult.warnings);
    }

    // Katman 2: ActivityType
    if (options.validateActivityTypes && data && (data as any).suggestions) {
      const activityResult = this.validateActivityTypes((data as any).suggestions);
      allErrors.push(...activityResult.errors);
      allWarnings.push(...activityResult.warnings);
    }

    // Katman 4: Pedagojik Guvenlik
    if (options.checkPedagogicalSafety) {
      const safetyResult = this.validatePedagogicalSafety(data);
      allErrors.push(...safetyResult.errors);
      allWarnings.push(...safetyResult.warnings);
    }

    // Katman 5: Tutarlilik (sadece suggestion'lar icin)
    if (data && (data as any).suggestions && Array.isArray((data as any).suggestions)) {
      for (const suggestion of (data as any).suggestions) {
        const consistencyResult = this.validateContextConsistency(suggestion, context);
        allWarnings.push(...consistencyResult.warnings);
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      sanitizedOutput: data,
    };
  }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================

export const contentValidator = new ContentValidator();

// ============================================================
// FALLBACK HANDLER
// ============================================================

/**
 * Hallucination tespit edilirse fallback kullan
 */
export const handleAIResponseWithFallback = async <T>(
  aiCall: () => Promise<T>,
  fallbackGenerator: () => T,
  validator: (result: T) => ValidationResult
): Promise<T> => {
  try {
    const result = await aiCall();
    const validation = validator(result);

    if (!validation.isValid) {
      console.warn(
        '[AI Assistant] Validation failed, using fallback:',
        validation.errors
      );
      return fallbackGenerator();
    }

    if (validation.warnings.length > 0) {
      console.warn('[AI Assistant] Validation warnings:', validation.warnings);
    }

    return (validation.sanitizedOutput as T) || result;
  } catch (error) {
    console.error('[AI Assistant] AI call failed, using fallback:', error);
    return fallbackGenerator();
  }
};

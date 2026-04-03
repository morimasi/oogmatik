/**
 * Workbook AI Assistant — Ana Orchestrator Sinif
 *
 * Calisma Kitapcigi icin entegre AI Asistan sistemi:
 * - Smart Content Suggestions
 * - Real-time Feedback
 * - Auto-Complete
 *
 * @author Selin Arslan (AI Muhendisi)
 * @created 2026-04-02
 */

import { generateWithSchema } from '../geminiClient';
import { AssistantCache, assistantCache, invalidateOnWorkbookChange } from './cache/assistantCache';
import {
  ContentValidator,
  contentValidator,
  handleAIResponseWithFallback,
} from './validators/contentValidator';
import {
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
  buildWorkbookContext,
  type WorkbookContext,
} from './prompts/workbookPrompts';
import {
  WorkbookAISchemas,
  type ActivitySuggestionResponse,
  type SkillGapResponse,
  type PageBalanceResponse,
  type DifficultyDistributionResponse,
  type ThemeConsistencyResponse,
  type MetadataFillResponse,
  type SequenceOptimizationResponse,
} from './schemas/workbookAISchemas';
import type { CollectionItem, WorkbookSettings, ActivityType } from '../../types';

// ============================================================
// TOKEN COST ESTIMATOR
// ============================================================

interface CostEstimate {
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

/**
 * Gemini 2.5 Flash Fiyatlandirma (Mart 2026):
 * Input:  $0.075 / 1M token
 * Output: $0.30  / 1M token
 */
const GEMINI_FLASH_PRICING = {
  inputPerMillion: 0.075,
  outputPerMillion: 0.30,
};

const estimateTokenCost = (
  promptLength: number,
  expectedOutputLength: number
): CostEstimate => {
  const CHARS_PER_TOKEN = 3.5; // Turkce icin

  const inputTokens = Math.ceil(promptLength / CHARS_PER_TOKEN) + 500; // +500 system instruction
  const outputTokens = Math.ceil(expectedOutputLength / CHARS_PER_TOKEN);

  const inputCost = (inputTokens * GEMINI_FLASH_PRICING.inputPerMillion) / 1_000_000;
  const outputCost = (outputTokens * GEMINI_FLASH_PRICING.outputPerMillion) / 1_000_000;

  return {
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
};

// ============================================================
// WORKBOOK AI ASSISTANT CLASS
// ============================================================

export class WorkbookAIAssistant {
  private cache: AssistantCache;
  private validator: ContentValidator;

  constructor() {
    this.cache = assistantCache;
    this.validator = contentValidator;
  }

  // --------------------------------------------------------
  // 1. SMART CONTENT SUGGESTIONS
  // --------------------------------------------------------

  /**
   * Akilli aktivite onerileri
   * ZPD analizi ile dengelenmis oneriler sunar
   */
  async suggestActivities(context: WorkbookContext): Promise<ActivitySuggestionResponse> {
    const prompt = buildActivitySuggestionPrompt(context);
    const schema = WorkbookAISchemas.activitySuggestion;

    // Cache kontrol
    const cached = await this.cache.get<ActivitySuggestionResponse>(prompt, schema);
    if (cached) {
      return cached;
    }

    // AI cagri
    const fallback: ActivitySuggestionResponse = {
      suggestions: [
        {
          activityType: 'FIVE_W_ONE_H',
          reason: 'Okuma anlama becerilerini gelistirmek icin temel aktivite',
          recommendedDifficulty: 'Orta',
          targetSkills: ['Okudugunu anlama', 'Soru cevaplama'],
        },
      ],
      analysisNote: 'Varsayilan oneri (AI baglantisi kurulamadi)',
    };

    const result = await handleAIResponseWithFallback(
      async () => {
        const response = await generateWithSchema(prompt, schema);
        return response as ActivitySuggestionResponse;
      },
      () => fallback,
      (data) =>
        this.validator.validateFull(data, context, {
          expectedFields: ['suggestions', 'analysisNote'],
          validateActivityTypes: true,
          checkPedagogicalSafety: true,
        })
    );

    // Cache kaydet
    await this.cache.set(prompt, schema, result);

    return result;
  }

  /**
   * Eksik beceri alanlari tespiti
   */
  async detectSkillGaps(items: CollectionItem[]): Promise<SkillGapResponse> {
    const prompt = buildSkillGapPrompt(items);
    const schema = WorkbookAISchemas.skillGap;

    // Cache kontrol
    const cached = await this.cache.get<SkillGapResponse>(prompt, schema);
    if (cached) {
      return cached;
    }

    const fallback: SkillGapResponse = {
      gaps: [],
      overallBalance: 'Analiz yapilamadi',
    };

    const result = await handleAIResponseWithFallback(
      async () => {
        const response = await generateWithSchema(prompt, schema);
        return response as SkillGapResponse;
      },
      () => fallback,
      (data) =>
        this.validator.validateSchema(data, ['gaps', 'overallBalance'])
    );

    await this.cache.set(prompt, schema, result);
    return result;
  }

  // --------------------------------------------------------
  // 2. REAL-TIME FEEDBACK
  // --------------------------------------------------------

  /**
   * Sayfa dengesi analizi
   */
  async analyzePageBalance(items: CollectionItem[]): Promise<PageBalanceResponse> {
    if (items.length === 0) {
      return {
        overallScore: 100,
        verdict: 'Mukemmel',
        balanceIssues: [],
        strengths: ['Kitapcik henuz bos'],
        recommendations: ['Aktivite ekleyerek baslayin'],
      };
    }

    const prompt = buildPageBalancePrompt(items);
    const schema = WorkbookAISchemas.pageBalance;

    // Cache kontrol
    const cached = await this.cache.get<PageBalanceResponse>(prompt, schema);
    if (cached) {
      return cached;
    }

    const fallback: PageBalanceResponse = {
      overallScore: 75,
      verdict: 'Iyi',
      balanceIssues: [],
      strengths: ['Analiz yapilamadi'],
      recommendations: [],
    };

    const result = await handleAIResponseWithFallback(
      async () => {
        const response = await generateWithSchema(prompt, schema);
        return response as PageBalanceResponse;
      },
      () => fallback,
      (data) =>
        this.validator.validateSchema(data, [
          'overallScore',
          'verdict',
          'balanceIssues',
          'strengths',
          'recommendations',
        ])
    );

    await this.cache.set(prompt, schema, result);
    return result;
  }

  /**
   * Zorluk dagilimi analizi
   */
  async analyzeDifficultyDistribution(
    items: CollectionItem[]
  ): Promise<DifficultyDistributionResponse> {
    const prompt = buildDifficultyAnalysisPrompt(items);
    const schema = WorkbookAISchemas.difficultyDistribution;

    const cached = await this.cache.get<DifficultyDistributionResponse>(prompt, schema);
    if (cached) {
      return cached;
    }

    const fallback: DifficultyDistributionResponse = {
      distribution: { easy: 33, medium: 34, hard: 33 },
      scaffoldingScore: 70,
      recommendation: 'Analiz yapilamadi',
    };

    const result = await handleAIResponseWithFallback(
      async () => {
        const response = await generateWithSchema(prompt, schema);
        return response as DifficultyDistributionResponse;
      },
      () => fallback,
      (data) =>
        this.validator.validateSchema(data, ['distribution', 'scaffoldingScore', 'recommendation'])
    );

    await this.cache.set(prompt, schema, result);
    return result;
  }

  /**
   * Tema tutarliligi kontrolu
   */
  async checkThemeConsistency(
    items: CollectionItem[],
    settings: WorkbookSettings
  ): Promise<ThemeConsistencyResponse> {
    const prompt = buildThemeConsistencyPrompt(items, settings);
    const schema = WorkbookAISchemas.themeConsistency;

    const cached = await this.cache.get<ThemeConsistencyResponse>(prompt, schema);
    if (cached) {
      return cached;
    }

    const fallback: ThemeConsistencyResponse = {
      consistencyScore: 80,
      detectedThemes: ['Genel egitim'],
      inconsistencies: [],
      suggestion: 'Analiz yapilamadi',
    };

    const result = await handleAIResponseWithFallback(
      async () => {
        const response = await generateWithSchema(prompt, schema);
        return response as ThemeConsistencyResponse;
      },
      () => fallback,
      (data) =>
        this.validator.validateSchema(data, [
          'consistencyScore',
          'detectedThemes',
          'suggestion',
        ])
    );

    await this.cache.set(prompt, schema, result);
    return result;
  }

  // --------------------------------------------------------
  // 3. AUTO-COMPLETE
  // --------------------------------------------------------

  /**
   * Eksik metadata doldurma
   */
  async fillMissingMetadata(item: CollectionItem): Promise<MetadataFillResponse> {
    const prompt = buildMetadataFillPrompt(item);
    const schema = WorkbookAISchemas.metadataFill;

    const cached = await this.cache.get<MetadataFillResponse>(prompt, schema);
    if (cached) {
      return cached;
    }

    const fallback: MetadataFillResponse = {
      category: 'Bilisssel',
      targetSkills: ['Genel beceri'],
      cognitiveDomain: 'genel',
      pedagogicalNote: 'Bu aktivite ogrencinin genel becerilerini gelistirmeyi amaclar.',
    };

    const result = await handleAIResponseWithFallback(
      async () => {
        const response = await generateWithSchema(prompt, schema);
        return response as MetadataFillResponse;
      },
      () => fallback,
      (data) => {
        const validation = this.validator.validateSchema(data, [
          'category',
          'targetSkills',
          'cognitiveDomain',
          'pedagogicalNote',
        ]);
        // Pedagojik guvenlik kontrolu
        const safetyCheck = this.validator.validatePedagogicalSafety(data);
        return {
          isValid: validation.isValid && safetyCheck.isValid,
          errors: [...validation.errors, ...safetyCheck.errors],
          warnings: [...validation.warnings, ...safetyCheck.warnings],
        };
      }
    );

    await this.cache.set(prompt, schema, result);
    return result;
  }

  /**
   * Pedagojik not uretimi (tek aktivite)
   */
  async generatePedagogicalNote(item: CollectionItem): Promise<string> {
    const prompt = buildPedagogicalNotePrompt(item);
    const schema = WorkbookAISchemas.pedagogicalNote;

    const cached = await this.cache.get<{ pedagogicalNote: string }>(prompt, schema);
    if (cached) {
      return cached.pedagogicalNote;
    }

    const fallback =
      'Bu aktivite ogrencinin bilisssel becerilerini gelistirmek icin tasarlanmistir.';

    const result = await handleAIResponseWithFallback(
      async () => {
        const response = (await generateWithSchema(prompt, schema)) as {
          pedagogicalNote: string;
        };
        return response.pedagogicalNote;
      },
      () => fallback,
      (data) => this.validator.validatePedagogicalSafety({ note: data })
    );

    await this.cache.set(prompt, schema, { pedagogicalNote: result });
    return result;
  }

  /**
   * Batch pedagojik not uretimi (5'li gruplar)
   */
  async batchGeneratePedagogicalNotes(
    items: CollectionItem[],
    batchSize: number = 5
  ): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const prompt = buildBatchPedagogicalNotePrompt(batch);
      const schema = WorkbookAISchemas.batchPedagogicalNotes;

      try {
        const response = (await generateWithSchema(prompt, schema)) as { notes: string[] };

        batch.forEach((item, idx) => {
          results.set(item.id, response.notes[idx] || '');
        });
      } catch {
        // Batch basarisiz — tek tek dene
        for (const item of batch) {
          const note = await this.generatePedagogicalNote(item);
          results.set(item.id, note);
        }
      }

      // Rate limit korumasi
      if (i + batchSize < items.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return results;
  }

  /**
   * Onsoz uretimi (optimize edilmis)
   */
  async generatePreface(
    settings: WorkbookSettings,
    items: CollectionItem[]
  ): Promise<string> {
    const prompt = buildPrefacePrompt(settings, items);
    const schema = WorkbookAISchemas.preface;

    const cached = await this.cache.get<{ preface: string }>(prompt, schema);
    if (cached) {
      return cached.preface;
    }

    // Fallback onsoz
    const topActivities = this.getTopActivities(items, 3);
    const fallback = `Bu calisma kitapcigi, ${settings.studentName || 'ogrencimizin'} bireysel gelisim hedefleri dogrultusunda ozel olarak hazirlanmistir. Kitapcik iceriginde ozellikle ${topActivities.join(', ')} gibi bilisssel alanlara odaklanilmistir. Duzenly uygulama ile akademik becerilerde belirgin bir artis hedeflenmektedir.`;

    const result = await handleAIResponseWithFallback(
      async () => {
        const response = (await generateWithSchema(prompt, schema)) as { preface: string };
        return response.preface;
      },
      () => fallback,
      (data) => this.validator.validatePedagogicalSafety({ preface: data })
    );

    await this.cache.set(prompt, schema, { preface: result });
    return result;
  }

  /**
   * Siralama optimizasyonu
   */
  async optimizeSequence(items: CollectionItem[]): Promise<SequenceOptimizationResponse> {
    const prompt = buildSequenceOptimizationPrompt(items);
    const schema = WorkbookAISchemas.sequenceOptimization;

    const cached = await this.cache.get<SequenceOptimizationResponse>(prompt, schema);
    if (cached) {
      return cached;
    }

    const fallback: SequenceOptimizationResponse = {
      optimizedOrder: items.map((_, idx) => ({
        originalIndex: idx,
        newIndex: idx,
      })),
      improvementScore: 0,
      pedagogicalRationale: 'Mevcut siralama korundu',
    };

    const result = await handleAIResponseWithFallback(
      async () => {
        const response = await generateWithSchema(prompt, schema);
        return response as SequenceOptimizationResponse;
      },
      () => fallback,
      (data) =>
        this.validator.validateSchema(data, [
          'optimizedOrder',
          'improvementScore',
          'pedagogicalRationale',
        ])
    );

    await this.cache.set(prompt, schema, result);
    return result;
  }

  // --------------------------------------------------------
  // YARDIMCI METODLAR
  // --------------------------------------------------------

  /**
   * En sik kullanilan aktivite turlerini al
   */
  private getTopActivities(items: CollectionItem[], count: number): string[] {
    const activityCounts: Record<string, number> = {};

    items.forEach((item) => {
      if (item.itemType !== 'divider') {
        activityCounts[item.activityType] = (activityCounts[item.activityType] || 0) + 1;
      }
    });

    return Object.entries(activityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([type]) => type);
  }

  /**
   * Token maliyet tahmini
   */
  estimateCost(
    operation: 'suggestions' | 'pageBalance' | 'pedagogicalNote' | 'preface'
  ): CostEstimate {
    const estimates: Record<string, { input: number; output: number }> = {
      suggestions: { input: 800, output: 400 },
      pageBalance: { input: 1200, output: 350 },
      pedagogicalNote: { input: 500, output: 100 },
      preface: { input: 700, output: 200 },
    };

    const { input, output } = estimates[operation] || { input: 500, output: 200 };
    return estimateTokenCost(input * 4, output * 4); // char estimate
  }

  /**
   * Cache temizle (workbook degisikliginde)
   */
  invalidateCache(changeType: 'add' | 'remove' | 'reorder' | 'profileChange'): void {
    invalidateOnWorkbookChange(changeType);
  }

  /**
   * Cache istatistikleri
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================

export const workbookAIAssistant = new WorkbookAIAssistant();

// ============================================================
// RE-EXPORTS
// ============================================================

export { buildWorkbookContext, type WorkbookContext };
export type {
  ActivitySuggestionResponse,
  SkillGapResponse,
  PageBalanceResponse,
  DifficultyDistributionResponse,
  ThemeConsistencyResponse,
  MetadataFillResponse,
  SequenceOptimizationResponse,
} from './schemas/workbookAISchemas';

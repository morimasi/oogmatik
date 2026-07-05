import { generateCreativeMultimodal } from '../geminiClient.js';
import { WorksheetData, SingleWorksheetData } from '../../types/core.js';
import { logError, logInfo } from '../../utils/logger.js';
import { assessContentQuality } from '../../utils/contentQuality.js';

export interface VariationParams {
  temperature?: number;
  topP?: number;
  thinkingBudget?: number;
}

export interface VariationResult {
  easy: WorksheetData;
  medium: WorksheetData;
  hard: WorksheetData;
  visualSupport?: WorksheetData;
  qualities: {
    easy: number;
    medium: number;
    hard: number;
    visualSupport?: number;
  };
}

export class VariationEngine {
  static async generateVariations(
    originalActivity: WorksheetData,
    params?: VariationParams
  ): Promise<{
    easy: WorksheetData;
    hard: WorksheetData;
    visualSupport: WorksheetData;
  }> {
    const prompt = `
      [GÖREV]
      Aşağıdaki orijinal aktiviteyi temel alarak 3 farklı varyasyon üret:
      1. EASY: Daha basit dil, daha az seçenek, daha fazla ipucu.
      2. HARD: Daha karmaşık mantık, daha fazla çeldirici, derin çıkarım gereksinimi.
      3. VISUAL_SUPPORT: Metinleri minimize et, her şeyi görsel referanslarla veya imgelemlerle açıkla.
      
      [ORİJİNAL AKTİVİTE]
      ${JSON.stringify(originalActivity)}
      
      [ÇIKTI]
      Lütfen 3 varyasyonu da içeren bir JSON nesnesi dön.
    `;

    try {
      const result = await generateCreativeMultimodal({
        prompt,
        schema: {
          type: 'OBJECT',
          properties: {
            easy: { type: 'STRING', description: 'Easy difficulty variant: mirror the original activity structure but simplify all questions/items. Fill every content field completely. Return as JSON string.' },
            hard: { type: 'STRING', description: 'Hard difficulty variant: mirror the original activity structure but increase complexity. Fill every content field completely. Return as JSON string.' },
            visualSupport: { type: 'STRING', description: 'Visual support variant: mirror the original activity structure but replace text with visual/imagery descriptions. Fill every content field completely. Return as JSON string.' }
          },
          required: ['easy', 'hard', 'visualSupport']
        },
        temperature: params?.temperature ?? 0.1,
      });

      return result as unknown as { easy: WorksheetData; hard: WorksheetData; visualSupport: WorksheetData; };
    } catch (e) {
      logError(e instanceof Error ? e : String(e));
      throw e;
    }
  }

  static async generateWithAllDifficulties(
    baseContent: string,
    templateId: string,
    params?: VariationParams
  ): Promise<VariationResult> {
    const prompt = `
      [GÖREV]
      Aşağıdaki içeriği temel alarak 4 farklı zorluk seviyesinde varyasyon üret:
      1. EASY: En basit dil, bol ipucu, kısa cümleler.
      2. MEDIUM: Normal zorluk, dengeli dil.
      3. HARD: Karmaşık yapılar, çıkarım gerektiren sorular.
      4. VISUAL_SUPPORT: Görsel odaklı, minimum metin.
      
      Her varyasyon tam ve bağımsız bir aktivite olmalıdır.
      
      [ORİJİNAL İÇERİK]
      ${baseContent}
      
      [ÇIKTI FORMATI]
      {
        "easy": "tam içerik metni...",
        "medium": "tam içerik metni...",
        "hard": "tam içerik metni...",
        "visualSupport": "tam içerik metni..."
      }
    `;

    try {
      const result = await generateCreativeMultimodal({
        prompt,
        schema: {
          type: 'OBJECT',
          properties: {
            easy: { type: 'STRING' },
            medium: { type: 'STRING' },
            hard: { type: 'STRING' },
            visualSupport: { type: 'STRING' },
          },
          required: ['easy', 'medium', 'hard', 'visualSupport'],
        },
        temperature: params?.temperature ?? 0.7,
        thinkingBudget: params?.thinkingBudget,
      });

      const data = result as Record<string, string>;
      const rawContent = (content: string): WorksheetData => ([{
        title: '',
        content,
        instruction: '',
      }] as unknown as SingleWorksheetData[]);

      const qualities = {
        easy: assessContentQuality(data.easy || '').overall,
        medium: assessContentQuality(data.medium || '').overall,
        hard: assessContentQuality(data.hard || '').overall,
        visualSupport: assessContentQuality(data.visualSupport || '').overall,
      };

      logInfo('[VariationEngine] Kalite skorları', qualities);

      return {
        easy: rawContent(data.easy || ''),
        medium: rawContent(data.medium || ''),
        hard: rawContent(data.hard || ''),
        visualSupport: rawContent(data.visualSupport || ''),
        qualities,
      };
    } catch (e) {
      logError(e instanceof Error ? e : String(e));
      throw e;
    }
  }
}

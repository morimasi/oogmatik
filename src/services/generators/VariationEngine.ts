import { generateWithSchema } from '../geminiClient.js';
import { WorksheetData } from '../../types/core.js';
import { logError } from '../../utils/logger.js';

/**
 * OOGMATIK - VARIATION ENGINE (v3 Premium)
 * Mevcut bir aktiviteyi temel alarak farklı zorluk ve destek seviyelerinde varyasyonlar üretir.
 */
export class VariationEngine {
  static async generateVariations(originalActivity: WorksheetData): Promise<{
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
      const result = await generateWithSchema(prompt, {
        type: 'OBJECT',
        properties: {
          easy: { type: 'OBJECT' },
          hard: { type: 'OBJECT' },
          visualSupport: { type: 'OBJECT' }
        },
        required: ['easy', 'hard', 'visualSupport']
      });

      return result as any;
    } catch (e) {
      logError('VariationEngine error', e as Record<string, unknown>);
      throw e;
    }
  }
}

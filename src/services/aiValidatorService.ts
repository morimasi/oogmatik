import { z } from 'zod';
import { logError, logWarn } from '../utils/logger.js';

/**
 * Sprint 3: Otonom Validasyon Servisi (AI Kalkanı)
 * Yapay zekadan gelen JSON'un genel şemalara uygunluğunu denetler.
 * Uyumsuz ise özel bir VALIDATION_FAILED fırlatarak geminiClient'ın retry atmasını sağlar.
 */

export const BaseActivitySchema = z.object({
  pedagogicalNote: z.string().optional(),
  difficultyLevel: z.string().optional(),
  targetSkills: z.array(z.string()).optional(),
}).catchall(z.any()); // Aktiviteye özel spesifik bloklara esneklik

export class AIValidatorService {
  /**
   * AI Çıktısını Zod üzerinden geçer. Hata varsa fırlatır.
   */
  static validateOutput(data: unknown): unknown {
    try {
      if (typeof data !== 'object' || data === null) {
        throw new Error('Beklenen çıktı valid bir JSON obesi değildi.');
      }

      // Ana şema denetimi
      const parsed = BaseActivitySchema.parse(data);

      // Verinin dizi (Array) bazlı olup olmadığını kontrol et (Bazı eski sistemlerde)
      if (Array.isArray(data)) {
        return data; 
      }

      // İçerisinde array/list içeren ana yapıları denetle
      const listKeys = ['items', 'blocks', 'problems', 'puzzles', 'questions', 'operations', 'steps'];
      const hasList = listKeys.some(key => Array.isArray((data as Record<string, unknown>)[key]));

      if (!hasList) {
        logWarn('AI Çıktısında beklenen liste formatı (items/blocks) bulunamadı. İçerik:', { keys: Object.keys(data as object) });
        // Strict kipi açsaydık burada fırlatırdık ama şimdilik sadece uyarıyoruz
      }

      return data;
    } catch (error) {
      logError('Zod Doğrulama Hatası (Otonom AI Koruması)', { error });
      throw new Error(`VALIDATION_FAILED: ${error instanceof Error ? error.message : 'JSON Şeması uyumsuz'}`);
    }
  }
}

export const aiValidatorService = new AIValidatorService();

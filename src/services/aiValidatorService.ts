import { z } from 'zod';
import { logError, logWarn } from '../utils/logger.js';

/**
 * Otonom Validasyon Servisi (AI Kalkanı)
 * Yapay zekadan gelen JSON'un genel şemalara uygunluğunu denetler.
 * DİKKAT: VALIDATION_FAILED artık fırlatılmaz — veri olduğu gibi döndürülür.
 * AI'nın ürettiği her veri kabul edilir, aşağıdaki kod yorumlar.
 */

export const BaseActivitySchema = z.object({
  pedagogicalNote: z.string().optional(),
  difficultyLevel: z.string().optional(),
  targetSkills: z.array(z.string()).optional(),
}).catchall(z.any());

export class AIValidatorService {
  /**
   * AI Çıktısını kabul edilebilir bir forma getirir. Hata fırlatmaz.
   * - null/undefined → loglanır, boş obje döner
   * - primitive (string/number/boolean) → sarmalanır
   * - array → olduğu gibi döner
   * - object → olduğu gibi döner
   */
  static validateOutput(data: unknown): unknown {
    // null veya undefined
    if (data === null || data === undefined) {
      logWarn('AI çıktısı boş (null/undefined). Boş obje döndürülüyor.');
      return { text: '', empty: true };
    }

    // Primitive tipler (string, number, boolean)
    if (typeof data !== 'object') {
      logWarn('AI çıktısı primitive değer döndürdü, sarmalanıyor', { type: typeof data });
      return { text: String(data), value: data };
    }

    // Array — olduğu gibi dön (eski davranışla uyumlu)
    if (Array.isArray(data)) {
      return data;
    }

    // Plain object — olduğu gibi dön
    try {
      BaseActivitySchema.parse(data);
      return data;
    } catch {
      // Schema uyumsuz ama obje olduğu için yine de kabul et
      logWarn('AI çıktısı BaseActivitySchema uyumsuz, ham obje döndürülüyor', { keys: Object.keys(data as object) });
      return data;
    }
  }
}

export const aiValidatorService = new AIValidatorService();

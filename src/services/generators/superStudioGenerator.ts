import { logger } from '../../utils/logger';
import {
  GenerationMode,
  SuperStudioDifficulty,
  GeneratedContentPayload,
} from '../../types/superStudio';
import { AppError } from '../../utils/AppError';
import { generateWithSchema } from '../geminiClient.js';

interface GenerateParams {
  templates: string[];
  settings: Record<string, any>;
  mode: GenerationMode;
  grade: string | null;
  difficulty: SuperStudioDifficulty;
  studentId: string | null;
}

/**
 * Browser-compatible basit hash fonksiyonu
 * SHA-256 alternatifi olarak FNV-1a hash algoritması kullanır
 */
const simpleHash = (str: string): string => {
  let hash = 2166136261; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};

/**
 * Cache key oluşturur (hash tabanlı)
 */
const generateCacheKey = (
  templateId: string,
  settings: any,
  grade: string | null,
  difficulty: SuperStudioDifficulty
): string => {
  const data = JSON.stringify({
    templateId,
    settings,
    grade,
    difficulty,
  });
  const hash = simpleHash(data);
  return `super-turkce:${hash}`;
};

import {
  _SUPER_STUDIO_REGISTRY,
  getTemplateById,
} from '../../components/SuperStudio/templates/registry';

/**
 * Şablon tipine göre prompt oluşturur
 */
const buildPromptForTemplate = (
  templateId: string,
  settings: any,
  grade: string | null,
  difficulty: SuperStudioDifficulty,
  studentId: string | null
): string => {
  const templateDef = getTemplateById(templateId);
  if (!templateDef) {
    return `[Hata] Şablon bulunamadı: ${templateId}`;
  }

  // Yeni modüler prompt builder'ı çağır
  return templateDef.promptBuilder({
    topic: 'Doğayı ve Uzayı Keşfediyorum', // Jenerik yerine daha somut ve eğitici bir varsayılan konu
    difficulty,
    grade,
    settings,
    studentName: studentId ? 'Öğrenci' : undefined, // İleride gerçek isim store'dan buraya paslanabilir
  });
};

/**
 * Şablon tipine göre Gemini API şeması oluşturur
 * Yeni nesil modüler yapıda tüm şablonlar zengin Markdown + SVG döndürür.
 */
const buildSchemaForTemplate = (_templateId: string): any => {
  return {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING', description: 'Etkinliğin ilgi çekici başlığı' },
      content: {
        type: 'STRING',
        description: "Tüm yönerge, metin, sorular ve SVG'leri içeren zengin Markdown içeriği",
      },
      pedagogicalNote: { type: 'STRING', description: 'Öğretmene özel pedagojik açıklama' },
    },
    required: ['title', 'content', 'pedagogicalNote'],
  };
};

/**
 * AI yanıtını A4 içeriğine dönüştürür (Markdown tabanlı yeni render sistemi)
 * Fallback: Eğer AI şemayı es geçip düz metin döndürürse bunu yakala
 */
const formatContentForA4 = (_templateId: string, aiResponse: any): string => {
  if (!aiResponse) return '[İçerik üretilemedi]';

  // Standart şema (content alanı var)
  if (aiResponse.content) return aiResponse.content;

  // Fallback 1: Proxy'den gelen ham metin (text alanı)
  if (aiResponse.text) return aiResponse.text;

  // Fallback 2: Obje komple string ise (nadiren)
  if (typeof aiResponse === 'string') return aiResponse;

  return '[İçerik üretilemedi]';
};

/**
 * Super Türkçe Stüdyosu için AI destekli içerik üretici
 */
export const generateSuperStudioContent = async (
  params: GenerateParams
): Promise<GeneratedContentPayload[]> => {
  try {
    const { templates, settings, mode, grade, difficulty, studentId } = params;

    if (!templates || templates.length === 0) {
      throw new AppError(
        'En az bir şablon seçilmelidir.',
        'NO_TEMPLATE_SELECTED',
        400,
        undefined,
        false
      );
    }

    const results: GeneratedContentPayload[] = [];

    // Fast mode: Offline/mock üretim (maliyet sıfır, hızlı)
    if (mode === 'fast') {
      for (const tpl of templates) {
        await new Promise((resolve) => setTimeout(resolve, 300));

        results.push({
          id: `gen-${Date.now()}-${tpl}`,
          templateId: tpl,
          pages: [
            {
              title: `${tpl === 'okuma-anlama' ? '📚 Okuma Anlama Parçası' : tpl.replace('-', ' ').toUpperCase()} Etkinliği`,
              content: `[HIZLI MOD - ÖRNEKLENDİRME]\n\n${grade || 'Orta Düzey'} / ${difficulty} Zorluk\n\nBu içerik, hızlı mod için örnek içeriktir. Gerçek içerik üretimi için "AI Mod (Gemini)" seçeneğini kullanın.\n\nHızlı modda deterministik şablonlar kullanılır ve maliyet sıfırdır. Öğretmen tarafından manuel düzenleme yapılabilir.`,
              pedagogicalNote: `Hızlı mod: ${tpl} aktivitesi için temel şablon üretildi. AI Mod ile pedagojik açıdan optimize edilmiş içerik alabilirsiniz.`,
            },
          ],
          createdAt: Date.now(),
        });
      }
      return results;
    }

    // AI mode: Gemini ile gerçek içerik üretimi (paralel batch optimizasyonu + cache)

    // Cache kontrolü (IndexedDB - opsiyonel, hata durumunda devam et)
    let cacheService: any = null;

    // Browser environment kontrolü
    const isBrowser = typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

    if (isBrowser) {
      try {
        // Dynamic import ile cacheService'i al
        const module = await import('../cacheService.js');
        cacheService = module.cacheService;
      } catch (e) {
        console.warn('[Super Türkçe] Cache servisi yüklenemedi, cache atlanıyor.', e);
      }
    }

    // Cache'ten kontrol et
    const cachedResults: GeneratedContentPayload[] = [];
    let remainingTemplates = [...templates];

    if (cacheService) {
      for (const tpl of templates) {
        const templateSettings = settings[tpl] || {};
        const cacheKey = generateCacheKey(tpl, templateSettings, grade, difficulty);

        try {
          const cached = await cacheService.get(cacheKey);
          if (cached) {
            cachedResults.push({
              ...(cached as any),
              id: `cache-${Date.now()}-${tpl}`,
              fromCache: true,
            });
            remainingTemplates = remainingTemplates.filter((t) => t !== tpl);
            logger.info(`[Super Türkçe] Cache hit: ${tpl}`);
          }
        } catch (e) {
          console.warn(`[Super Türkçe] Cache okuma hatası (${tpl}):`, e);
        }
      }
    }

    // Cache'te olmayanlar için API çağrısı yap
    const promises = remainingTemplates.map(async (tpl) => {
      const templateSettings = settings[tpl] || {};
      const prompt = buildPromptForTemplate(tpl, templateSettings, grade, difficulty, studentId);
      const schema = buildSchemaForTemplate(tpl);

      try {
        const aiResponse = await generateWithSchema(prompt, schema);

        // Validate AI response structure
        if (!aiResponse) {
          throw new AppError('AI yanıtı boş döndü', 'INTERNAL_ERROR', 500);
        }

        const content = formatContentForA4(tpl, aiResponse);

        // Ensure pedagogicalNote exists (critical requirement)
        const pedagogicalNote = aiResponse.pedagogicalNote;
        if (!pedagogicalNote || pedagogicalNote.length < 20) {
          throw new AppError(
            'Pedagojik not çok kısa veya eksik (en az 20 karakter olmalıdır).',
            'VALIDATION_ERROR',
            400
          );
        }

        // Başlık çekme mantığı (aiResponse.title yoksa content'in ilk satırını dene)
        let title = aiResponse.title || '';
        if (!title && content) {
          const firstLine = content.split('\n')[0].replace(/[#*]/g, '').trim();
          title = firstLine.substring(0, 50) || `${tpl.replace('-', ' ').toUpperCase()} Etkinliği`;
        } else if (!title) {
          title = `${tpl.replace('-', ' ').toUpperCase()} Etkinliği`;
        }

        const payload: GeneratedContentPayload = {
          id: `gen-${Date.now()}-${tpl}`,
          templateId: tpl,
          pages: [
            {
              title,
              content: content,
              pedagogicalNote: pedagogicalNote,
            },
          ],
          createdAt: Date.now(),
        };

        // Cache'e kaydet (async, bekleme)
        if (cacheService) {
          const cacheKey = generateCacheKey(tpl, templateSettings, grade, difficulty);
          try {
            await cacheService.set(cacheKey, payload as any);
            logger.info(`[Super Türkçe] Cache yazıldı: ${tpl}`);
          } catch (e) {
            console.warn(`[Super Türkçe] Cache yazma hatası (${tpl}):`, e);
          }
        }

        return {
          success: true,
          templateId: tpl,
          data: payload,
        };
      } catch (apiError: any) {
        console.error(`AI üretim hatası (${tpl}):`, apiError);
        throw apiError;
      }
    });

    // Promise.allSettled ile tüm sonuçları bekle (partial success)
    const settled = await Promise.allSettled(promises);

    // Başarılı sonuçları topla
    const successes = settled
      .filter(
        (
          r
        ): r is PromiseFulfilledResult<{
          success: boolean;
          templateId: string;
          data: GeneratedContentPayload;
        }> => r.status === 'fulfilled'
      )
      .map((r) => r.value.data);

    // Cache'ten gelenleri ekle
    const allResults = [...cachedResults, ...successes];

    // Başarısız olanları logla
    const failures = settled.filter(
      (r): boolean => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
    );

    if (failures.length > 0) {
      console.error(
        `[Super Türkçe] ${failures.length}/${templates.length} şablon başarısız oldu.`,
        failures
      );
    }

    // Hiç başarılı olmazsa hata fırlat
    if (allResults.length === 0) {
      throw new AppError(
        'Tüm şablonlar için üretim başarısız oldu. Lütfen tekrar deneyin.',
        'BATCH_GENERATION_FAILED',
        500,
        { failures },
        true
      );
    }

    return allResults;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      'Üretim sırasında beklenmeyen bir hata oluştu.',
      'GENERATOR_ERROR',
      500,
      error,
      true
    );
  }
};

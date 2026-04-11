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
  topic: string;
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
 * Cache key oluşturur (hash tabanlı, templateId prefix ile)
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
  return `super-turkce:${templateId}:${hash}`;
};

import {
  SUPER_STUDIO_REGISTRY,
  getTemplateById,
} from '../../components/SuperStudio/templates/registry';

/**
 * Şablon tipine göre prompt oluşturur
 */
const buildPromptForTemplate = (
  templateId: string,
  settings: any,
  grade: string | null,
  topic: string,
  difficulty: SuperStudioDifficulty,
  studentId: string | null
): string => {
  const templateDef = getTemplateById(templateId);
  if (!templateDef) {
    return `[Hata] Şablon bulunamadı: ${templateId}`;
  }

  // Yeni modüler prompt builder'ı çağır
  return templateDef.promptBuilder({
    topic: topic || 'Doğayı ve Uzayı Keşfediyorum',
    difficulty,
    grade,
    settings,
    studentName: studentId ? 'Öğrenci' : undefined,
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

const CONTENT_FALLBACK = '[İçerik üretilemedi]';

/**
 * AI yanıtını A4 içeriğine dönüştürür — şablon tipine göre alanları birleştirir.
 * Fallback: Eğer AI şemayı es geçip düz metin / content alanı döndürürse bunu yakala.
 */
const formatContentForA4 = (templateId: string, aiResponse: any): string => {
  if (!aiResponse) return CONTENT_FALLBACK;

  // Standart şema (content alanı var) — önce bunu dene
  if (aiResponse.content) return aiResponse.content;

  // okuma-anlama: metin + soru/cevap listesi
  if (templateId === 'okuma-anlama') {
    const text: string = aiResponse.text || '';
    const questions: unknown = aiResponse.questions;
    let content = text;
    if (!Array.isArray(questions) || questions.length === 0) {
      content += '\n\n[Sorular üretilemedi — AI yanıtında sorular bulunamadı]';
    } else {
      content += '\n\n## Sorular\n';
      (questions as any[]).forEach((q: any, i: number) => {
        const questionText: string = q?.question || '[Soru metni eksik]';
        const answerText: string = q?.answer || '[Cevap eksik]';
        content += `\n${i + 1}. ${questionText}\n   Cevap: ${answerText}\n`;
      });
    }
    return content;
  }

  // dilbilgisi: konu başlığı + kurallar + alıştırmalar
  if (templateId === 'dilbilgisi') {
    const topic: string = aiResponse.topic || '';
    const rules: unknown = aiResponse.rules;
    const exercises: unknown = aiResponse.exercises;
    let content = topic ? `## ${topic}\n\n` : '';
    if (!Array.isArray(rules) || rules.length === 0) {
      content += '[Kurallar üretilemedi]\n\n';
    } else {
      content += '### Kurallar\n';
      (rules as any[]).forEach((rule: any) => {
        content += `- ${rule || '[Kural eksik]'}\n`;
      });
      content += '\n';
    }
    if (!Array.isArray(exercises) || exercises.length === 0) {
      content += '[Alıştırmalar üretilemedi]';
    } else {
      content += '### Alıştırmalar\n';
      (exercises as any[]).forEach((ex: any, i: number) => {
        const q: string = ex?.question || '[Alıştırma metni eksik]';
        const a: string = ex?.answer || '[Cevap eksik]';
        content += `\n${i + 1}. ${q}\n   Cevap: ${a}\n`;
      });
    }
    return content;
  }

  // mantik-muhakeme: problem listesi (soru + ipucu opsiyonel + cevap)
  if (templateId === 'mantik-muhakeme') {
    const problems: unknown = aiResponse.problems;
    if (!Array.isArray(problems) || problems.length === 0) {
      return '[Problemler üretilemedi — AI yanıtında problem bulunamadı]';
    }
    let content = '';
    (problems as any[]).forEach((p: any, i: number) => {
      const q: string = p?.question || '[Problem metni eksik]';
      content += `\n${i + 1}. ${q}\n`;
      if (p?.hint) content += `   İpucu: ${p.hint}\n`;
      if (p?.answer) content += `   Cevap: ${p.answer}\n`;
    });
    return content;
  }

  // Fallback 1: Proxy'den gelen ham metin (text alanı)
  if (aiResponse.text) return aiResponse.text;

  // Fallback 2: Obje komple string ise (nadiren)
  if (typeof aiResponse === 'string') return aiResponse;

  return CONTENT_FALLBACK;
};

/**
 * Super Türkçe Stüdyosu için AI destekli içerik üretici
 */
export const generateSuperStudioContent = async (
  params: GenerateParams
): Promise<GeneratedContentPayload[]> => {
  try {
    const { templates, settings, mode, grade, topic, difficulty, studentId } = params;

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

    // Cache servisi (IndexedDB tabanlı, opsiyonel — hata durumunda üretim devam eder)
    let cacheService: any = null;

    try {
      // Dynamic import ile cacheService'i al (browser'da IndexedDB, test'te mock)
      const module = await import('../cacheService.js');
      cacheService = module.cacheService;
    } catch (e) {
      // Cache servisi yüklenemezse (Node/SSR) sessizce devam et
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
            console.log(`[Super Türkçe] Cache hit: ${tpl}`);
          }
        } catch (e) {
          console.warn(`[Super Türkçe] Cache okuma hatası (${tpl}):`, e);
        }
      }
    }

    // Cache'te olmayanlar için API çağrısı yap
    const promises = remainingTemplates.map(async (tpl) => {
      const templateSettings = settings[tpl] || {};
      const prompt = buildPromptForTemplate(
        tpl,
        templateSettings,
        grade,
        topic,
        difficulty,
        studentId
      );
      const schema = buildSchemaForTemplate(tpl);

      try {
        console.log(`[Super Türkçe] Calling API for: ${tpl}`);
        const aiResponse = await generateWithSchema(prompt, schema);
        console.log(
          `[Super Türkçe] API response for ${tpl}:`,
          typeof aiResponse,
          aiResponse ? Object.keys(aiResponse) : 'null'
        );

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
            console.log(`[Super Türkçe] Cache yazıldı: ${tpl}`);
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
        console.error(`[Super Türkçe] Şablon hatası (${tpl}):`, apiError?.message || apiError);
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
      const failureDetails = failures.map((f) => {
        if (f.status === 'rejected') {
          return { type: 'rejected', reason: f.reason?.message || String(f.reason) };
        }
        return { type: 'failed', templateId: f.value?.templateId, success: f.value?.success };
      });
      console.error(
        `[Super Türkçe] ${failures.length}/${templates.length} şablon başarısız oldu.`,
        failureDetails
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

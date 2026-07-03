import { logInfo, logError, logWarn } from '../../utils/logger';
import {
  GenerationMode,
  SuperStudioDifficulty,
  GeneratedContentPayload,
  PageData,
} from '../../types/superStudio';
import { AppError } from '../../utils/AppError';
import { generateWithSchema } from '../geminiClient.js';
import { generateOfflineSuperStudioTemplate } from './superOfflineEngine';

interface GenerateParams {
  templates: string[];
  settings: Record<string, unknown>;
  mode: GenerationMode;
  grade: string | null;
  topic: string;
  difficulty: SuperStudioDifficulty;
  studentId: string | null;
  temperature?: number;
  topP?: number;
  thinkingBudget?: number;
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
  settings: Record<string, unknown>,
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

  // Güvenlik kontrolü: promptBuilder bir fonksiyon mu?
  if (typeof templateDef.promptBuilder !== 'function') {
    logError(`[Super Türkçe] promptBuilder hatası: ${templateId} bir fonksiyon değil!`, { templateDef });
    return `[Hata] Şablon prompt motoru yüklenemedi: ${templateId}. Lütfen yöneticiye bildirin.`;
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
const buildSchemaForTemplate = (templateId: string): any => {
  const titleDesc = 'Etkinliğin ilgi çekici başlığı';

  if (templateId === 'okuma-anlama') {
    return {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: titleDesc },
        text: { type: 'STRING', description: 'Okuma metni (Markdown formatında, paragraflı)' },
        questions: {
          type: 'ARRAY',
          description: 'Metinle ilgili anlama soruları',
          items: {
            type: 'OBJECT',
            properties: {
              question: { type: 'STRING', description: 'Soru metni' },
              answer: { type: 'STRING', description: 'Doğru cevap' },
            },
            required: ['question', 'answer'],
          },
        },
      },
      required: ['title', 'text', 'questions'],
    };
  }

  if (templateId === 'dil-bilgisi') {
    return {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: titleDesc },
        topic: { type: 'STRING', description: 'Konu başlığı (ör: Ünsüz Yumuşaması)' },
        rules: {
          type: 'ARRAY',
          description: 'Dil bilgisi kuralları (maddeler halinde)',
          items: { type: 'STRING' },
        },
        exercises: {
          type: 'ARRAY',
          description: 'Alıştırma soruları',
          items: {
            type: 'OBJECT',
            properties: {
              question: { type: 'STRING', description: 'Alıştırma sorusu' },
              answer: { type: 'STRING', description: 'Doğru cevap' },
            },
            required: ['question', 'answer'],
          },
        },
      },
      required: ['title', 'topic', 'rules', 'exercises'],
    };
  }

  if (templateId === 'mantik-muhakeme') {
    return {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: titleDesc },
        problems: {
          type: 'ARRAY',
          description: 'Mantık problemleri',
          items: {
            type: 'OBJECT',
            properties: {
              question: { type: 'STRING', description: 'Problem sorusu' },
              hint: { type: 'STRING', description: 'Opsiyonel ipucu' },
              answer: { type: 'STRING', description: 'Doğru cevap' },
            },
            required: ['question', 'answer'],
          },
        },
      },
      required: ['title', 'problems'],
    };
  }

  // yaratici-yazarlik: yazma promptları + hikaye zarları + kelime bankası
  if (templateId === 'yaratici-yazarlik') {
    return {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: titleDesc },
        storyDice: {
          type: 'ARRAY',
          description: 'Hikaye zarları — her biri bir ikon/görsel içerir',
          items: {
            type: 'OBJECT',
            properties: {
              icon: { type: 'STRING', description: 'SVG veya emoji olarak ikon' },
              label: { type: 'STRING', description: 'Zar etiketi (örn: "Bir kedi", "Eski bir ev")' },
            },
            required: ['icon', 'label'],
          },
        },
        writingPrompts: {
          type: 'ARRAY',
          description: 'Yazma promptları',
          items: {
            type: 'OBJECT',
            properties: {
              prompt: { type: 'STRING', description: 'Yazma promptu / yönerge' },
              wordBank: { type: 'ARRAY', description: 'Kullanılması önerilen kelimeler', items: { type: 'STRING' } },
            },
            required: ['prompt'],
          },
        },
      },
      required: ['title', 'storyDice', 'writingPrompts'],
    };
  }

  // yazim-noktalama: kurallar + egzersizler
  if (templateId === 'yazim-noktalama') {
    return {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: titleDesc },
        rules: {
          type: 'ARRAY',
          description: 'Yazım/noktalama kuralları',
          items: { type: 'STRING' },
        },
        exercises: {
          type: 'ARRAY',
          description: 'Düzeltme egzersizleri',
          items: {
            type: 'OBJECT',
            properties: {
              instruction: { type: 'STRING', description: 'Yönerge (örn: "Aşağıdaki cümledeki noktalama hatasını bulun")' },
              sentence: { type: 'STRING', description: 'Hatalı/eksik cümle' },
              corrected: { type: 'STRING', description: 'Doğru hali' },
            },
            required: ['sentence', 'corrected'],
          },
        },
      },
      required: ['title', 'rules', 'exercises'],
    };
  }

  // soz-varligi: deyim/atasözü listesi + eşleştirme
  if (templateId === 'soz-varligi') {
    return {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: titleDesc },
        items: {
          type: 'ARRAY',
          description: 'Deyim/atasözü/mecaz listesi',
          items: {
            type: 'OBJECT',
            properties: {
              expression: { type: 'STRING', description: 'Deyim, atasözü veya mecaz ifade' },
              type: { type: 'STRING', description: 'deyim, atasozu veya mecaz' },
              meaning: { type: 'STRING', description: 'Sade dille anlamı' },
              example: { type: 'STRING', description: 'Örnek cümle içinde kullanımı' },
            },
            required: ['expression', 'type', 'meaning'],
          },
        },
        matchingPairs: {
          type: 'ARRAY',
          description: 'Eşleştirme için çiftler',
          items: {
            type: 'OBJECT',
            properties: {
              left: { type: 'STRING', description: 'Sol sütun (deyim/atasözü)' },
              right: { type: 'STRING', description: 'Sağ sütun (anlamı)' },
            },
            required: ['left', 'right'],
          },
        },
      },
      required: ['title', 'items', 'matchingPairs'],
    };
  }

  // hece-ses: ses olayları + kelimeler
  if (templateId === 'hece-ses') {
    return {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: titleDesc },
        rules: {
          type: 'ARRAY',
          description: 'Ses olayı kuralları',
          items: { type: 'STRING' },
        },
        words: {
          type: 'ARRAY',
          description: 'Heceleme/ses olayı kelimeleri',
          items: {
            type: 'OBJECT',
            properties: {
              word: { type: 'STRING', description: 'Kelime' },
              syllables: { type: 'ARRAY', description: 'Heceleme (örn: ["Ki", "tap"])', items: { type: 'STRING' } },
              soundEvent: { type: 'STRING', description: 'Ses olayı türü (yumusama, sertlesme, ses-dusmesi veya boş)' },
            },
            required: ['word', 'syllables'],
          },
        },
      },
      required: ['title', 'rules', 'words'],
    };
  }

  // kelime-bilgisi: eş/zıt/eş sesli kelime çiftleri
  if (templateId === 'kelime-bilgisi') {
    return {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: titleDesc },
        wordSets: {
          type: 'ARRAY',
          description: 'Kelime grupları (eş anlamlı, zıt anlamlı, eş sesli)',
          items: {
            type: 'OBJECT',
            properties: {
              type: { type: 'STRING', description: 'es-anlamli, zit-anlamli veya es-sesli' },
              pairs: {
                type: 'ARRAY',
                description: 'Kelime çiftleri',
                items: {
                  type: 'OBJECT',
                  properties: {
                    word: { type: 'STRING', description: 'Ana kelime' },
                    pair: { type: 'STRING', description: 'Eş/zıt/eş sesli karşılığı' },
                    example: { type: 'STRING', description: 'Örnek cümle (opsiyonel)' },
                  },
                  required: ['word', 'pair'],
                },
              },
            },
            required: ['type', 'pairs'],
          },
        },
      },
      required: ['title', 'wordSets'],
    };
  }
};

const CONTENT_FALLBACK = '[İçerik üretilemedi]';

/**
 * AI yanıtını A4 içeriğine dönüştürür — şablon tipine göre alanları birleştirir.
 * Fallback: Eğer AI şemayı es geçip düz metin / content alanı döndürürse bunu yakala.
 */
const formatContentForA4 = (templateId: string, aiResponse: any): string => {
  if (!aiResponse) return CONTENT_FALLBACK;

  // okuma-anlama: metin + soru/cevap listesi (structured schema)
  if (templateId === 'okuma-anlama') {
    const text: string = aiResponse.text || '';
    const questions: unknown = aiResponse.questions;
    let content = text;
    if (!Array.isArray(questions) || questions.length === 0) {
      content += '\n\n[Sorular üretilemedi — AI yanıtında sorular bulunamadı]';
    } else {
      content += '\n\n## Sorular\n';
      (questions as unknown[]).forEach((q: any, i: number) => {
        const questionText: string = q?.question || '[Soru metni eksik]';
        const answerText: string = q?.answer || '[Cevap eksik]';
        content += `\n${i + 1}. ${questionText}\n   Cevap: ${answerText}\n`;
      });
    }
    return content;
  }

  // dil-bilgisi: konu başlığı + kurallar + alıştırmalar (structured schema)
  if (templateId === 'dil-bilgisi') {
    const topic: string = aiResponse.topic || '';
    const rules: unknown = aiResponse.rules;
    const exercises: unknown = aiResponse.exercises;
    let content = topic ? `## ${topic}\n\n` : '';
    if (!Array.isArray(rules) || rules.length === 0) {
      content += '[Kurallar üretilemedi]\n\n';
    } else {
      content += '### Kurallar\n';
      (rules as unknown[]).forEach((rule: any) => {
        content += `- ${rule || '[Kural eksik]'}\n`;
      });
      content += '\n';
    }
    if (!Array.isArray(exercises) || exercises.length === 0) {
      content += '[Alıştırmalar üretilemedi]';
    } else {
      content += '### Alıştırmalar\n';
      (exercises as unknown[]).forEach((ex: any, i: number) => {
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
    (problems as unknown[]).forEach((p: any, i: number) => {
      const q: string = p?.question || '[Problem metni eksik]';
      content += `\n${i + 1}. ${q}\n`;
      if (p?.hint) content += `   İpucu: ${p.hint}\n`;
      if (p?.answer) content += `   Cevap: ${p.answer}\n`;
    });
    return content;
  }

  // yaratici-yazarlik: hikaye zarları + yazma promptları
  if (templateId === 'yaratici-yazarlik') {
    const storyDice: unknown = aiResponse.storyDice;
    const writingPrompts: unknown = aiResponse.writingPrompts;
    let content = '';
    if (Array.isArray(storyDice) && storyDice.length > 0) {
      content += '### 🎲 Hikaye Zarları\n\n';
      (storyDice as any[]).forEach((die: any, i: number) => {
        content += `**Zar ${i + 1}:** ${die.icon || ''} ${die.label || ''}\n\n`;
      });
      content += 'Bu zarları kullanarak bir hikaye oluşturun.\n\n';
    }
    if (Array.isArray(writingPrompts) && writingPrompts.length > 0) {
      content += '### ✍️ Yazma Promptları\n\n';
      (writingPrompts as any[]).forEach((wp: any, i: number) => {
        content += `**${i + 1}.** ${wp.prompt || '[Prompt eksik]'}\n`;
        if (Array.isArray(wp.wordBank) && wp.wordBank.length > 0) {
          content += `   📚 Kelime Bankası: ${wp.wordBank.join(', ')}\n`;
        }
        content += '\n   Cevap: ________________________________________\n\n';
      });
    }
    return content || '[Yazma etkinliği üretilemedi]';
  }

  // yazim-noktalama: kurallar + düzeltme egzersizleri
  if (templateId === 'yazim-noktalama') {
    const rules: unknown = aiResponse.rules;
    const exercises: unknown = aiResponse.exercises;
    let content = '';
    if (Array.isArray(rules) && rules.length > 0) {
      content += '### 📌 Kurallar\n\n';
      (rules as string[]).forEach((rule: string) => {
        content += `- ${rule}\n`;
      });
      content += '\n';
    }
    if (Array.isArray(exercises) && exercises.length > 0) {
      content += '### ✏️ Düzeltme Egzersizleri\n\n';
      (exercises as any[]).forEach((ex: any, i: number) => {
        if (ex.instruction) content += `**Yönerge:** ${ex.instruction}\n\n`;
        content += `**${i + 1}.** ${ex.sentence || '[Cümle eksik]'}\n`;
        content += `   Doğrusu: ${ex.corrected || '[Düzeltme eksik]'}\n\n`;
      });
    }
    return content || '[Yazım/noktalama etkinliği üretilemedi]';
  }

  // soz-varligi: deyim/atasözü listesi + eşleştirme
  if (templateId === 'soz-varligi') {
    const items: unknown = aiResponse.items;
    const matchingPairs: unknown = aiResponse.matchingPairs;
    let content = '';
    if (Array.isArray(items) && items.length > 0) {
      content += '### 📖 Deyim ve Atasözleri\n\n';
      (items as any[]).forEach((item: any, i: number) => {
        const typeLabel = item.type === 'atasozu' ? 'Atasözü' : item.type === 'mecaz' ? 'Mecaz' : 'Deyim';
        content += `**${i + 1}. ${item.expression}** (${typeLabel})\n`;
        content += `   Anlamı: ${item.meaning || '[Anlam eksik]'}\n`;
        if (item.example) content += `   Örnek: ${item.example}\n`;
        content += '\n';
      });
    }
    if (Array.isArray(matchingPairs) && matchingPairs.length > 0) {
      content += '### 🔗 Eşleştirme\n\n';
      content += '| İfade | Anlamı |\n| :--- | :--- |\n';
      (matchingPairs as any[]).forEach((pair: any) => {
        content += `| ${pair.left || ''} | ${pair.right || ''} |\n`;
      });
      content += '\n(Yukarıdaki ifadeleri anlamlarıyla eşleştirin.)\n';
    }
    return content || '[Söz varlığı etkinliği üretilemedi]';
  }

  // hece-ses: ses olayı kuralları + heceleme kelimeleri
  if (templateId === 'hece-ses') {
    const rules: unknown = aiResponse.rules;
    const words: unknown = aiResponse.words;
    let content = '';
    if (Array.isArray(rules) && rules.length > 0) {
      content += '### 📌 Ses Olayı Kuralları\n\n';
      (rules as string[]).forEach((rule: string) => {
        content += `- ${rule}\n`;
      });
      content += '\n';
    }
    if (Array.isArray(words) && words.length > 0) {
      content += '### 🔤 Heceleme ve Ses Olayları\n\n';
      content += '| Kelime | Heceler | Ses Olayı |\n| :--- | :--- | :--- |\n';
      (words as any[]).forEach((w: any) => {
        const syls = Array.isArray(w.syllables) ? w.syllables.join('-') : '';
        const eventMap: Record<string, string> = { yumusama: 'Ünsüz Yumuşaması', sertlesme: 'Ünsüz Benzeşmesi', 'ses-dusmesi': 'Ses Düşmesi' };
        const eventLabel = eventMap[w.soundEvent] || w.soundEvent || '';
        content += `| ${w.word} | ${syls} | ${eventLabel} |\n`;
      });
      content += '\nTabloyu inceleyerek ses olaylarını ve hece yapılarını öğrenin.\n';
    }
    return content || '[Hece/ses etkinliği üretilemedi]';
  }

  // kelime-bilgisi: eş/zıt/eş sesli kelime grupları
  if (templateId === 'kelime-bilgisi') {
    const wordSets: unknown = aiResponse.wordSets;
    if (!Array.isArray(wordSets) || wordSets.length === 0) {
      return '[Kelime bilgisi etkinliği üretilemedi]';
    }
    let content = '';
    (wordSets as any[]).forEach((ws: any) => {
      const typeLabel = ws.type === 'es-anlamli' ? 'Eş Anlamlı Kelimeler'
        : ws.type === 'zit-anlamli' ? 'Zıt Anlamlı Kelimeler'
        : 'Eş Sesli Kelimeler';
      content += `### ${typeLabel}\n\n`;
      if (Array.isArray(ws.pairs)) {
        content += '| Kelime | Karşılığı | Örnek Cümle |\n| :--- | :--- | :--- |\n';
        (ws.pairs as any[]).forEach((p: any) => {
          content += `| ${p.word} | ${p.pair} | ${p.example || ''} |\n`;
        });
        content += '\n';
      }
    });
    return content || '[Kelime bilgisi etkinliği üretilemedi]';
  }

  // Generic schema (content alanı var)
  if (aiResponse.content) {
    if (typeof aiResponse.content === 'string') {
      return aiResponse.content;
    }
    if (typeof aiResponse.content === 'object' && !Array.isArray(aiResponse.content)) {
      return aiResponse.content.content || aiResponse.content.text || JSON.stringify(aiResponse.content, null, 2);
    }
    return String(aiResponse.content);
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
    const { templates, settings, mode, grade, topic, difficulty, studentId, temperature, topP, thinkingBudget } = params;

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

    // Fast mode: Offline/Premium üretim (Premium, Pedagojik ve Dolu Dolu A4)
    if (mode === 'fast') {
      for (const tpl of templates) {
        await new Promise((resolve) => setTimeout(resolve, 200));

        const templateSettings = (settings[tpl] || {}) as Record<string, unknown>;
        const content = generateOfflineSuperStudioTemplate(tpl, templateSettings, grade, topic, difficulty);
        
        // Başlık belirleme
        const titleMap: Record<string, string> = {
            'okuma-anlama': '📚 Okuma Anlama',
            'dil-bilgisi': '🔤 Dil Bilgisi',
            'mantik-muhakeme': '🧩 Mantık & Muhakeme',
            'yaratici-yazarlik': '✍️ Yaratıcı Yazarlık',
            'yazim-noktalama': '📍 Yazım & Noktalama',
            'soz-varligi': '📖 Söz Varlığı',
            'hece-ses': '🔊 Hece & Ses',
            'kelime-bilgisi': '🔍 Kelime Bilgisi'
        };
        const instructionMap: Record<string, string> = {
            'okuma-anlama': 'Aşağıdaki metni dikkatlice oku ve soruları cevapla.',
            'dil-bilgisi': 'Kuralları incele ve alıştırmaları yap.',
            'mantik-muhakeme': 'Problemleri dikkatlice oku ve doğru cevabı bul.',
            'yaratici-yazarlik': 'Yönergeleri takip ederek yazma çalışmalarını tamamla.',
            'yazim-noktalama': 'Yazım ve noktalama kurallarına göre düzeltmeleri yap.',
            'soz-varligi': 'Deyim, atasözü ve mecaz ifadeleri öğren.',
            'hece-ses': 'Heceleme ve ses olayları çalışmalarını yap.',
            'kelime-bilgisi': 'Kelime çiftlerini eşleştir ve cümlelerde kullan.'
        };

        results.push({
          id: `gen-${Date.now()}-${tpl}`,
          templateId: tpl,
          pages: [
            {
              title: `${titleMap[tpl] || tpl.toUpperCase()} — ${topic || 'Genel Çalışma'}`,
              content: content,
              instruction: instructionMap[tpl] || 'Aşağıdaki etkinliği dikkatlice tamamlayalım.',
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
        const templateSettings = (settings[tpl] || {}) as Record<string, unknown>;
        const cacheKey = generateCacheKey(tpl, templateSettings, grade, difficulty);

        try {
          const cached = await cacheService.get(cacheKey);
          if (cached) {
            const cachedPayload = cached as Record<string, unknown>;
            cachedResults.push({
              id: `cache-${Date.now()}-${tpl}`,
              templateId: (cachedPayload.templateId as string) || tpl,
              pages: (cachedPayload.pages as PageData[]) || [],
              createdAt: (cachedPayload.createdAt as number) || Date.now(),
              fromCache: true,
            });
            remainingTemplates = remainingTemplates.filter((t) => t !== tpl);
            logInfo(`[Super Türkçe] Cache hit: ${tpl}`);
          }
        } catch (e) {
          logWarn(`[Super Türkçe] Cache okuma hatası (${tpl}):`, { error: String(e) });
        }
      }
    }

    // Cache'te olmayanlar için API çağrısı yap
    const promises = remainingTemplates.map(async (tpl) => {
      const templateSettings = (settings[tpl] || {}) as Record<string, unknown>;
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
        logInfo(`[Super Türkçe] Calling API for: ${tpl}`, { temperature, topP, thinkingBudget });
        const aiResponse = await generateWithSchema(prompt, schema, { temperature, topP, thinkingBudget });
        logInfo(
          `[Super Türkçe] API response for ${tpl}:`,
          { 
            type: typeof aiResponse, 
            keys: aiResponse ? Object.keys(aiResponse) : 'null' 
          }
        );

        // Validate AI response structure
        if (!aiResponse) {
          throw new AppError('AI yanıtı boş döndü', 'INTERNAL_ERROR', 500);
        }

        const content = formatContentForA4(tpl, aiResponse);

        // Baslik cekme mantigi (aiResponse.title yoksa content'in ilk satirini dene)
        let title = aiResponse.title || '';
        if (!title && content) {
          const firstLine = content.split('\n')[0].replace(/[#*]/g, '').trim();
          title = firstLine.substring(0, 50) || `${tpl.replace('-', ' ').toUpperCase()} Etkinliği`;
        } else if (!title) {
          title = `${tpl.replace('-', ' ').toUpperCase()} Etkinliği`;
        }

        const instructionMap: Record<string, string> = {
            'okuma-anlama': 'Aşağıdaki metni dikkatlice oku ve soruları cevapla.',
            'dil-bilgisi': 'Kuralları incele ve alıştırmaları yap.',
            'mantik-muhakeme': 'Problemleri dikkatlice oku ve doğru cevabı bul.',
            'yaratici-yazarlik': 'Yönergeleri takip ederek yazma çalışmalarını tamamla.',
            'yazim-noktalama': 'Yazım ve noktalama kurallarına göre düzeltmeleri yap.',
            'soz-varligi': 'Deyim, atasözü ve mecaz ifadeleri öğren.',
            'hece-ses': 'Heceleme ve ses olayları çalışmalarını yap.',
            'kelime-bilgisi': 'Kelime çiftlerini eşleştir ve cümlelerde kullan.'
        };

        const payload: GeneratedContentPayload = {
          id: `gen-${Date.now()}-${tpl}`,
          templateId: tpl,
          pages: [
            {
              title,
              content: content,
              instruction: instructionMap[tpl] || 'Aşağıdaki etkinliği dikkatlice tamamlayalım.',
            },
          ],
          createdAt: Date.now(),
        };

        // Cache'e kaydet (async, bekleme)
        if (cacheService) {
          const cacheKey = generateCacheKey(tpl, templateSettings, grade, difficulty);
          try {
            await cacheService.set(cacheKey, { ...payload } as Record<string, unknown>);
            logInfo(`[Super Türkçe] Cache yazıldı: ${tpl}`);
          } catch (e) {
            logWarn(`[Super Türkçe] Cache yazma hatası (${tpl}):`, { error: String(e) });
          }
        }

        return {
          success: true,
          templateId: tpl,
          data: payload,
        };
      } catch (apiError: unknown) {
        logError(`[Super Türkçe] Şablon hatası (${tpl}):`, { error: apiError instanceof Error ? apiError.message : String(apiError) });
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
      logError(
        `[Super Türkçe] ${failures.length}/${templates.length} şablon başarısız oldu.`,
        { failures: failureDetails }
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
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      'Üretim sırasında beklenmeyen bir hata oluştu.',
      'GENERATOR_ERROR',
      500,
      { error: String(error) } as Record<string, unknown>,
      true
    );
  }
};

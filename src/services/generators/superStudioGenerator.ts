import { logInfo, logError, logWarn } from '../../utils/logger';
import {
  GenerationMode,
  SuperStudioDifficulty,
  GeneratedContentPayload,
  PageData,
  SuperStudioGenerationParams,
  SUPER_STUDIO_PARAM_DEFAULTS,
  SUPER_STUDIO_PARAM_LIMITS,
} from '../../types/superStudio';
import { AppError } from '../../utils/AppError';
import { generateWithSchema } from '../geminiClient.js';
import { generateOfflineSuperStudioTemplate } from './superOfflineEngine';

const CHARS_PER_PAGE = 3000;

/** Prompt injection koruması: kullanıcı girdisini max 2000 karaktere indirger ve tehlikeli kalıpları temizler. */
export const sanitizeSuperStudioTopic = (topic: string | null | undefined): string => {
  if (typeof topic !== 'string') return 'Genel';
  const truncated = topic.slice(0, 2000);
  return truncated
    .replace(/<script[\s\S]*?<\/script\s*>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/[<>]/g, '')
    .trim() || 'Genel';
};

const clampNumber = (value: unknown, min: number, max: number, fallback: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
};

/** AI parametrelerini güvenli aralığa indirger (defense in depth: store + generator). */
export const clampSuperStudioParams = (
  params: Partial<SuperStudioGenerationParams> | undefined
): SuperStudioGenerationParams => ({
  temperature: clampNumber(
    params?.temperature,
    SUPER_STUDIO_PARAM_LIMITS.temperature.min,
    SUPER_STUDIO_PARAM_LIMITS.temperature.max,
    SUPER_STUDIO_PARAM_DEFAULTS.temperature
  ),
  topP: clampNumber(
    params?.topP,
    SUPER_STUDIO_PARAM_LIMITS.topP.min,
    SUPER_STUDIO_PARAM_LIMITS.topP.max,
    SUPER_STUDIO_PARAM_DEFAULTS.topP
  ),
  thinkingBudget: Math.round(
    clampNumber(
      params?.thinkingBudget,
      SUPER_STUDIO_PARAM_LIMITS.thinkingBudget.min,
      SUPER_STUDIO_PARAM_LIMITS.thinkingBudget.max,
      SUPER_STUDIO_PARAM_DEFAULTS.thinkingBudget
    )
  ),
});

/** Şablon id'lerindeki tire farklarını normalize eder (örn: 'dilbilgisi' → 'dil-bilgisi'). */
const normalizeTemplateId = (templateId: string): string => {
  const compact = templateId.replace(/-/g, '').toLowerCase();
  const aliasMap: Record<string, string> = {
    dilbilgisi: 'dil-bilgisi',
    okumaanlama: 'okuma-anlama',
    mantikmuhakeme: 'mantik-muhakeme',
    yaraticyazarlik: 'yaratici-yazarlik',
    yazimnoktalama: 'yazim-noktalama',
    sozvarligi: 'soz-varligi',
    heceses: 'hece-ses',
    kelimebilgisi: 'kelime-bilgisi',
  };
  return aliasMap[compact] ?? templateId;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

/**
 * AI yanıtında pedagogicalNote zorunluluğunu denetler (Elif Yıldız kuralı).
 * Eksik/geçersizse AppError fırlatır — ilgili şablon "başarısız" sayılır.
 */
export const extractPedagogicalNote = (aiResponse: unknown, templateId: string): string => {
  if (!isRecord(aiResponse)) {
    throw new AppError(
      `AI yanıtı geçersiz olduğu için öğretmen notu üretilemedi (${templateId}).`,
      'VALIDATION_FAILED',
      500,
      { templateId },
      true
    );
  }
  const note = aiResponse.pedagogicalNote;
  if (typeof note !== 'string' || note.trim().length < 10) {
    throw new AppError(
      `AI yanıtında öğretmen notu (pedagogicalNote) eksik (${templateId}).`,
      'VALIDATION_FAILED',
      500,
      { templateId },
      true
    );
  }
  return note.trim();
};

const splitContentIntoPages = (content: string, title: string, instruction: string): PageData[] => {
  const chunks = content.split(/===SAYFA_SONU===/i).filter((c) => c.trim().length > 0);
  if (chunks.length === 0) {
    return [{ title, content, instruction }];
  }
  if (chunks.length > 1) {
    return chunks.map((chunk, i) => ({
      title: i === 0 ? title : `${title} (devam)`,
      content: chunk.trim(),
      instruction,
    }));
  }
  const paragraphs = chunks[0].split(/\n\n+/).filter((p) => p.trim().length > 0);
  let accumulated = '';
  const forcedPages: PageData[] = [];
  for (const para of paragraphs) {
    if (accumulated.length + para.length > CHARS_PER_PAGE && accumulated.length > 500) {
      forcedPages.push({ title: forcedPages.length === 0 ? title : `${title} (devam)`, content: accumulated.trim(), instruction });
      accumulated = para + '\n\n';
    } else {
      accumulated += para + '\n\n';
    }
  }
  if (accumulated.trim()) {
    forcedPages.push({ title: forcedPages.length === 0 ? title : `${title} (devam)`, content: accumulated.trim(), instruction });
  }
  return forcedPages;
};

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
  settings: Record<string, unknown>,
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

  // Prompt injection koruması: kullanıcı girdisi sanitize edilir (max 2000 karakter)
  const safeTopic = sanitizeSuperStudioTopic(topic) || 'Doğayı ve Uzayı Keşfediyorum';

  // Yeni modüler prompt builder'ı çağır
  return templateDef.promptBuilder({
    topic: safeTopic,
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
const buildSchemaForTemplate = (templateId: string): Record<string, unknown> => {
  const titleDesc = 'Etkinliğin ilgi çekici başlığı';
  // Tire varyantlarını normalize et ('dilbilgisi' → 'dil-bilgisi')
  const normalizedId = normalizeTemplateId(templateId);

  if (normalizedId === 'okuma-anlama') {
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

  if (normalizedId === 'dil-bilgisi') {
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

  if (normalizedId === 'mantik-muhakeme') {
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
  if (normalizedId === 'yaratici-yazarlik') {
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
  if (normalizedId === 'yazim-noktalama') {
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
  if (normalizedId === 'soz-varligi') {
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
              type: { type: 'STRING', description: 'deyim, atasözü veya mecaz' },
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
  if (normalizedId === 'hece-ses') {
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
  if (normalizedId === 'kelime-bilgisi') {
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
              type: { type: 'STRING', description: 'es-anlamlı, zit-anlamlı veya es-sesli' },
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

  // Bilinmeyen şablon id'leri için genel şema (formatContentForA4'ün generic dalıyla eşleşir)
  return {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING', description: titleDesc },
      content: { type: 'STRING', description: 'Etkinlik içeriği (Markdown formatında)' },
    },
    required: ['title', 'content'],
  };
};

const CONTENT_FALLBACK = '[İçerik üretilemedi]';

/**
 * AI yanıtını A4 içeriğine dönüştürür — şablon tipine göre alanları birleştirir.
 * Fallback: Eğer AI şemayı es geçip düz metin / content alanı döndürürse bunu yakala.
 */
const formatContentForA4 = (templateId: string, aiResponse: unknown): string => {
  if (!aiResponse) return CONTENT_FALLBACK;
  if (!isRecord(aiResponse)) {
    return typeof aiResponse === 'string' ? aiResponse : CONTENT_FALLBACK;
  }
  const normalizedId = normalizeTemplateId(templateId);
  const str = (key: string): string => {
    const v: unknown = aiResponse[key];
    return typeof v === 'string' ? v : '';
  };

  // okuma-anlama: metin + soru/cevap listesi (structured schema)
  if (normalizedId === 'okuma-anlama') {
    const text: string = str('text');
    const questions: unknown = aiResponse.questions;
    let content = text;
    if (!Array.isArray(questions) || questions.length === 0) {
      content += '\n\n[Sorular üretilemedi — AI yanıtında sorular bulunamadı]';
    } else {
      content += '\n\n## Sorular\n';
      questions.forEach((q: unknown, i: number) => {
        const qRec = isRecord(q) ? q : {};
        const questionText: string =
          typeof qRec.question === 'string' && qRec.question ? qRec.question : '[Soru metni eksik]';
        const answerText: string =
          typeof qRec.answer === 'string' && qRec.answer ? qRec.answer : '[Cevap eksik]';
        content += `\n${i + 1}. ${questionText}\n   Cevap: ${answerText}\n`;
      });
    }
    return content;
  }

  // dil-bilgisi: konu başlığı + kurallar + alıştırmalar (structured schema)
  if (normalizedId === 'dil-bilgisi') {
    const topic: string = str('topic');
    const rules: unknown = aiResponse.rules;
    const exercises: unknown = aiResponse.exercises;
    let content = topic ? `## ${topic}\n\n` : '';
    if (!Array.isArray(rules) || rules.length === 0) {
      content += '[Kurallar üretilemedi]\n\n';
    } else {
      content += '### Kurallar\n';
      rules.forEach((rule: unknown) => {
        content += `- ${typeof rule === 'string' && rule ? rule : '[Kural eksik]'}\n`;
      });
      content += '\n';
    }
    if (!Array.isArray(exercises) || exercises.length === 0) {
      content += '[Alıştırmalar üretilemedi]';
    } else {
      content += '### Alıştırmalar\n';
      exercises.forEach((ex: unknown, i: number) => {
        const exRec = isRecord(ex) ? ex : {};
        const q: string =
          typeof exRec.question === 'string' && exRec.question ? exRec.question : '[Alıştırma metni eksik]';
        const a: string =
          typeof exRec.answer === 'string' && exRec.answer ? exRec.answer : '[Cevap eksik]';
        content += `\n${i + 1}. ${q}\n   Cevap: ${a}\n`;
      });
    }
    return content;
  }

  // mantik-muhakeme: problem listesi (soru + ipucu opsiyonel + cevap)
  if (normalizedId === 'mantik-muhakeme') {
    const problems: unknown = aiResponse.problems;
    if (!Array.isArray(problems) || problems.length === 0) {
      return '[Problemler üretilemedi — AI yanıtında problem bulunamadı]';
    }
    let content = '';
    problems.forEach((p: unknown, i: number) => {
      const pRec = isRecord(p) ? p : {};
      const q: string =
        typeof pRec.question === 'string' && pRec.question ? pRec.question : '[Problem metni eksik]';
      content += `\n${i + 1}. ${q}\n`;
      if (typeof pRec.hint === 'string' && pRec.hint) content += `   İpucu: ${pRec.hint}\n`;
      if (typeof pRec.answer === 'string' && pRec.answer) content += `   Cevap: ${pRec.answer}\n`;
    });
    return content;
  }

  // yaratici-yazarlik: hikaye zarları + yazma promptları
  if (normalizedId === 'yaratici-yazarlik') {
    const storyDice: unknown = aiResponse.storyDice;
    const writingPrompts: unknown = aiResponse.writingPrompts;
    let content = '';
    if (Array.isArray(storyDice) && storyDice.length > 0) {
      content += '### 🎲 Hikaye Zarları\n\n';
      storyDice.forEach((die: unknown, i: number) => {
        const dieRec = isRecord(die) ? die : {};
        const icon = typeof dieRec.icon === 'string' ? dieRec.icon : '';
        const label = typeof dieRec.label === 'string' ? dieRec.label : '';
        content += `**Zar ${i + 1}:** ${icon} ${label}\n\n`;
      });
      content += 'Bu zarları kullanarak bir hikaye oluşturun.\n\n';
    }
    if (Array.isArray(writingPrompts) && writingPrompts.length > 0) {
      content += '### ✍️ Yazma Promptları\n\n';
      writingPrompts.forEach((wp: unknown, i: number) => {
        const wpRec = isRecord(wp) ? wp : {};
        const prompt = typeof wpRec.prompt === 'string' && wpRec.prompt ? wpRec.prompt : '[Prompt eksik]';
        content += `**${i + 1}.** ${prompt}\n`;
        if (Array.isArray(wpRec.wordBank) && wpRec.wordBank.length > 0) {
          content += `   📚 Kelime Bankası: ${asStringArray(wpRec.wordBank).join(', ')}\n`;
        }
        content += '\n   Cevap: ________________________________________\n\n';
      });
    }
    return content || '[Yazma etkinliği üretilemedi]';
  }

  // yazim-noktalama: kurallar + düzeltme egzersizleri
  if (normalizedId === 'yazim-noktalama') {
    const rules: unknown = aiResponse.rules;
    const exercises: unknown = aiResponse.exercises;
    let content = '';
    if (Array.isArray(rules) && rules.length > 0) {
      content += '### 📌 Kurallar\n\n';
      asStringArray(rules).forEach((rule: string) => {
        content += `- ${rule}\n`;
      });
      content += '\n';
    }
    if (Array.isArray(exercises) && exercises.length > 0) {
      content += '### ✏️ Düzeltme Egzersizleri\n\n';
      exercises.forEach((ex: unknown, i: number) => {
        const exRec = isRecord(ex) ? ex : {};
        const instruction = typeof exRec.instruction === 'string' ? exRec.instruction : '';
        const sentence =
          typeof exRec.sentence === 'string' && exRec.sentence ? exRec.sentence : '[Cümle eksik]';
        const corrected =
          typeof exRec.corrected === 'string' && exRec.corrected ? exRec.corrected : '[Düzeltme eksik]';
        if (instruction) content += `**Yönerge:** ${instruction}\n\n`;
        content += `**${i + 1}.** ${sentence}\n`;
        content += `   Doğrusu: ${corrected}\n\n`;
      });
    }
    return content || '[Yazım/noktalama etkinliği üretilemedi]';
  }

  // soz-varligi: deyim/atasözü listesi + eşleştirme
  if (normalizedId === 'soz-varligi') {
    const items: unknown = aiResponse.items;
    const matchingPairs: unknown = aiResponse.matchingPairs;
    let content = '';
    if (Array.isArray(items) && items.length > 0) {
      content += '### 📖 Deyim ve Atasözleri\n\n';
      items.forEach((item: unknown, i: number) => {
        const itemRec = isRecord(item) ? item : {};
        const kind = typeof itemRec.type === 'string' ? itemRec.type : '';
        const expression = typeof itemRec.expression === 'string' ? itemRec.expression : '';
        const meaning = typeof itemRec.meaning === 'string' ? itemRec.meaning : '[Anlam eksik]';
        const example = typeof itemRec.example === 'string' ? itemRec.example : '';
        const typeLabel = kind === 'atasozu' ? 'Atasözü' : kind === 'mecaz' ? 'Mecaz' : 'Deyim';
        content += `**${i + 1}. ${expression}** (${typeLabel})\n`;
        content += `   Anlamı: ${meaning}\n`;
        if (example) content += `   Örnek: ${example}\n`;
        content += '\n';
      });
    }
    if (Array.isArray(matchingPairs) && matchingPairs.length > 0) {
      content += '### 🔗 Eşleştirme\n\n';
      content += '| İfade | Anlamı |\n| :--- | :--- |\n';
      matchingPairs.forEach((pair: unknown) => {
        const pairRec = isRecord(pair) ? pair : {};
        const left = typeof pairRec.left === 'string' ? pairRec.left : '';
        const right = typeof pairRec.right === 'string' ? pairRec.right : '';
        content += `| ${left} | ${right} |\n`;
      });
      content += '\n(Yukarıdaki ifadeleri anlamlarıyla eşleştirin.)\n';
    }
    return content || '[Söz varlığı etkinliği üretilemedi]';
  }

  // hece-ses: ses olayı kuralları + heceleme kelimeleri
  if (normalizedId === 'hece-ses') {
    const rules: unknown = aiResponse.rules;
    const words: unknown = aiResponse.words;
    let content = '';
    if (Array.isArray(rules) && rules.length > 0) {
      content += '### 📌 Ses Olayı Kuralları\n\n';
      asStringArray(rules).forEach((rule: string) => {
        content += `- ${rule}\n`;
      });
      content += '\n';
    }
    if (Array.isArray(words) && words.length > 0) {
      content += '### 🔤 Heceleme ve Ses Olayları\n\n';
      content += '| Kelime | Heceler | Ses Olayı |\n| :--- | :--- | :--- |\n';
      words.forEach((w: unknown) => {
        const wRec = isRecord(w) ? w : {};
        const word = typeof wRec.word === 'string' ? wRec.word : '';
        const syls = Array.isArray(wRec.syllables) ? asStringArray(wRec.syllables).join('-') : '';
        const soundEvent = typeof wRec.soundEvent === 'string' ? wRec.soundEvent : '';
        const eventMap: Record<string, string> = { yumusama: 'Ünsüz Yumuşaması', sertlesme: 'Ünsüz Benzeşmesi', 'ses-dusmesi': 'Ses Düşmesi' };
        const eventLabel = eventMap[soundEvent] || soundEvent || '';
        content += `| ${word} | ${syls} | ${eventLabel} |\n`;
      });
      content += '\nTabloyu inceleyerek ses olaylarını ve hece yapılarını öğrenin.\n';
    }
    return content || '[Hece/ses etkinliği üretilemedi]';
  }

  // kelime-bilgisi: eş/zıt/eş sesli kelime grupları
  if (normalizedId === 'kelime-bilgisi') {
    const wordSets: unknown = aiResponse.wordSets;
    if (!Array.isArray(wordSets) || wordSets.length === 0) {
      return '[Kelime bilgisi etkinliği üretilemedi]';
    }
    let content = '';
    wordSets.forEach((ws: unknown) => {
      const wsRec = isRecord(ws) ? ws : {};
      const wsType = typeof wsRec.type === 'string' ? wsRec.type : '';
      const typeLabel = wsType === 'es-anlamli' ? 'Eş Anlamlı Kelimeler'
        : wsType === 'zit-anlamli' ? 'Zıt Anlamlı Kelimeler'
        : 'Eş Sesli Kelimeler';
      content += `### ${typeLabel}\n\n`;
      if (Array.isArray(wsRec.pairs)) {
        content += '| Kelime | Karşılığı | Örnek Cümle |\n| :--- | :--- | :--- |\n';
        wsRec.pairs.forEach((p: unknown) => {
          const pRec = isRecord(p) ? p : {};
          const word = typeof pRec.word === 'string' ? pRec.word : '';
          const pair = typeof pRec.pair === 'string' ? pRec.pair : '';
          const example = typeof pRec.example === 'string' ? pRec.example : '';
          content += `| ${word} | ${pair} | ${example} |\n`;
        });
        content += '\n';
      }
    });
    return content || '[Kelime bilgisi etkinliği üretilemedi]';
  }

  // Generic schema (content alanı var)
  const genericContent: unknown = aiResponse.content;
  if (typeof genericContent === 'string') {
    return genericContent;
  }
  if (isRecord(genericContent)) {
    const nested: unknown = genericContent.content ?? genericContent.text;
    return typeof nested === 'string' ? nested : JSON.stringify(genericContent, null, 2);
  }
  if (Array.isArray(genericContent)) {
    return String(genericContent);
  }

  // Fallback 1: Proxy'den gelen ham metin (text alanı)
  const fallbackText = str('text');
  if (fallbackText) return fallbackText;

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

    // AI parametreleri: güvenli aralığa indirgenir ve Gemini çağrısına gerçekten uygulanır
    const aiParams = clampSuperStudioParams({
      temperature: params.temperature,
      topP: params.topP,
      thinkingBudget: params.thinkingBudget,
    });

    // Prompt injection koruması: kullanıcı girdisi tek noktadan sanitize edilir
    const safeTopic = sanitizeSuperStudioTopic(topic);

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

    // Offline öğretmen notu (hızlı modda pedagogicalNote zorunluluğunu korur)
    const OFFLINE_PEDAGOGICAL_NOTE =
      'Disleksi desteğine ihtiyacı olan öğrenciler için hazırlandı: yönergeleri sesli okuyun, ' +
      'her görevde önce kolay maddeden başlayarak güven inşa edin ve öğrencinin hızında ilerleyin.';

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
    const titleFor = (tpl: string): string =>
      titleMap[normalizeTemplateId(tpl)] ?? titleMap[tpl] ?? tpl.toUpperCase();
    const instructionFor = (tpl: string): string =>
      instructionMap[normalizeTemplateId(tpl)] ??
      instructionMap[tpl] ??
      'Aşağıdaki etkinliği dikkatlice tamamlayalım.';

    // Fast mode: Offline/Premium üretim (Premium, Pedagojik ve Dolu Dolu A4)
    if (mode === 'fast') {
      for (const tpl of templates) {
        await new Promise((resolve) => setTimeout(resolve, 200));

        const templateSettings = isRecord(settings[tpl])
          ? (settings[tpl] as Record<string, unknown>)
          : {};
        const offlineContent = generateOfflineSuperStudioTemplate(tpl, templateSettings, grade, safeTopic, difficulty);

        // Hızlı mod işaretçisi: ilk sayfada görünür kalır (boş-sayfa/test ayırt edici)
        const content = `[HIZLI MOD — Offline Üretim]\n\n${offlineContent}`;

        const pages = splitContentIntoPages(
          content,
          `${titleFor(tpl)} — ${safeTopic || 'Genel Çalışma'}`,
          instructionFor(tpl)
        ).map((p) => ({ ...p, pedagogicalNote: OFFLINE_PEDAGOGICAL_NOTE }));

        results.push({
          id: `gen-${Date.now()}-${tpl}`,
          templateId: tpl,
          pages,
          createdAt: Date.now(),
        });
      }
      return results;
    }

    // AI mode: Gemini ile gerçek içerik üretimi (paralel batch optimizasyonu + cache)
    // Model sabiti: gemini-2.5-flash (geminiClient.MASTER_MODEL) — değiştirilmedi.

    // Cache servisi (IndexedDB tabanlı, opsiyonel — hata durumunda üretim devam eder)
    interface SuperStudioCacheLike {
      get: (key: string) => Promise<unknown>;
      set: (key: string, value: Record<string, unknown>) => Promise<unknown>;
    }
    let cacheService: SuperStudioCacheLike | null = null;

    try {
      // Dynamic import ile cacheService'i al (browser'da IndexedDB, test'te mock)
      const cacheModule = (await import('../cacheService')) as unknown as Record<string, unknown>;
      const candidate: unknown = cacheModule.cacheService;
      if (
        isRecord(candidate) &&
        typeof candidate.get === 'function' &&
        typeof candidate.set === 'function'
      ) {
        cacheService = candidate as unknown as SuperStudioCacheLike;
      }
    } catch {
      // Cache servisi yüklenemezse (Node/SSR) sessizce devam et
    }

    const isPageDataArray = (value: unknown): value is PageData[] =>
      Array.isArray(value) &&
      value.every(
        (p): p is PageData =>
          isRecord(p) && typeof p.title === 'string' && typeof p.content === 'string'
      );

    // Cache'ten kontrol et
    const cachedResults: GeneratedContentPayload[] = [];
    let remainingTemplates = [...templates];

    if (cacheService) {
      for (const tpl of templates) {
        const templateSettings = isRecord(settings[tpl])
          ? (settings[tpl] as Record<string, unknown>)
          : {};
        const cacheKey = generateCacheKey(tpl, templateSettings, grade, difficulty);

        try {
          const cached: unknown = await cacheService.get(cacheKey);
          if (isRecord(cached)) {
            cachedResults.push({
              id: `cache-${Date.now()}-${tpl}`,
              templateId: typeof cached.templateId === 'string' ? cached.templateId : tpl,
              pages: isPageDataArray(cached.pages) ? cached.pages : [],
              createdAt: typeof cached.createdAt === 'number' ? cached.createdAt : Date.now(),
              fromCache: true,
            });
            remainingTemplates = remainingTemplates.filter((t) => t !== tpl);
            logInfo(`[Super Türkçe] Cache hit: ${tpl}`);
          }
        } catch (e: unknown) {
          logWarn(`[Super Türkçe] Cache okuma hatası (${tpl}):`, { error: e });
        }
      }
    }

    // Cache'te olmayanlar için API çağrısı yap
    const promises = remainingTemplates.map(async (tpl) => {
      const templateSettings = isRecord(settings[tpl])
        ? (settings[tpl] as Record<string, unknown>)
        : {};
      const prompt = buildPromptForTemplate(
        tpl,
        templateSettings,
        grade,
        safeTopic,
        difficulty,
        studentId
      );
      const schema = buildSchemaForTemplate(tpl);

      try {
        logInfo(`[Super Türkçe] Calling API for: ${tpl}`, { ...aiParams });
        const aiResponse: unknown = await generateWithSchema(prompt, schema, { ...aiParams });
        logInfo(
          `[Super Türkçe] API response for ${tpl}:`,
          {
            type: typeof aiResponse,
            keys: isRecord(aiResponse) ? Object.keys(aiResponse) : 'null'
          }
        );

        // Validate AI response structure
        if (!aiResponse) {
          throw new AppError('AI yanıtı boş döndü', 'INTERNAL_ERROR', 500);
        }

        // pedagogicalNote zorunlu: eksikse bu şablon başarısız sayılır
        const pedagogicalNote = extractPedagogicalNote(aiResponse, tpl);

        const content = formatContentForA4(tpl, aiResponse);

        // Baslik cekme mantigi (aiResponse.title yoksa content'in ilk satirini dene)
        const responseTitle: unknown = isRecord(aiResponse) ? aiResponse.title : undefined;
        let title = typeof responseTitle === 'string' ? responseTitle : '';
        if (!title && content) {
          const firstLine = content.split('\n')[0].replace(/[#*]/g, '').trim();
          title = firstLine.substring(0, 50) || `${tpl.replace('-', ' ').toUpperCase()} Etkinliği`;
        } else if (!title) {
          title = `${tpl.replace('-', ' ').toUpperCase()} Etkinliği`;
        }

        const pages = splitContentIntoPages(
          content,
          title,
          instructionFor(tpl)
        ).map((p) => ({ ...p, pedagogicalNote }));

        const payload: GeneratedContentPayload = {
          id: `gen-${Date.now()}-${tpl}`,
          templateId: tpl,
          pages,
          createdAt: Date.now(),
        };

        // Cache'e kaydet (async, bekleme)
        if (cacheService) {
          const cacheKey = generateCacheKey(tpl, templateSettings, grade, difficulty);
          try {
            await cacheService.set(cacheKey, { ...payload } as Record<string, unknown>);
            logInfo(`[Super Türkçe] Cache yazıldı: ${tpl}`);
          } catch (e: unknown) {
            logWarn(`[Super Türkçe] Cache yazma hatası (${tpl}):`, { error: e });
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
          const reason: unknown = f.reason;
          const reasonMessage =
            reason instanceof Error ? reason.message : String(reason);
          return { type: 'rejected', reason: reasonMessage };
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

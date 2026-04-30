/**
 * OOGMATIK - OCR Variation Service
 * Blueprint'ten varyasyon üretimi orkestratörü
 *
 * Bu servis OCR blueprint'lerinden aynı mimari yapıda, farklı verilerle
 * yeni aktivite varyantları üretir.
 */

import { ValidationError, InternalServerError } from '../utils/AppError.js';
import { retryWithBackoff } from '../utils/errorHandler.js';
import { logError } from '../utils/logger.js';
import { analyzeImage } from './geminiClient.js';
import type {
  OCRResult,
  SingleWorksheetData,
  WorksheetData,
  ActivityType,
  LearningDisabilityProfile,
  AgeGroup,
  Difficulty
} from '../types';
import {
  A4_COMPACT_INSTRUCTION,
  COMPONENT_CHECKLIST_PROMPT,
  buildDetectedTypePromptPatch,
  buildComponentChecklist,
  buildDensityDirective,
  type OCRDetectedType as OCRDetectedTypeLib,
} from './generators/ocrPromptLibrary.js';

// ─── CONSTANTS ────────────────────────────────────────────────────────────

const MASTER_MODEL = 'gemini-2.5-flash';

// ─── DIRECT GEMINI CALLER (server-side only) ─────────────────────────────

/**
 * Server-side Gemini REST API çağrısı.
 * analyzeImage (frontend proxy) sunucu tarafında çalışmaz, bu yüzden doğrudan REST API kullanılır.
 */
const callGeminiDirect = async (prompt: string): Promise<unknown> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
  if (!apiKey) throw new InternalServerError('API Key bulunamadı.');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MASTER_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    }),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new InternalServerError(
      `Gemini API Hatası (varyasyon): ${(errJson as any)?.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  const text = (data as any)?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new InternalServerError('Gemini boş yanıt döndürdü (varyasyon).');

  // JSON repair
  let cleaned = text.replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
    .replace(/^```json[\s\S]*?\n/, '')
    .replace(/^```\s*/m, '')
    .replace(/```\s*$/m, '')
    .trim();
  const idx = Math.min(
    cleaned.indexOf('{') === -1 ? Infinity : cleaned.indexOf('{'),
    cleaned.indexOf('[') === -1 ? Infinity : cleaned.indexOf('[')
  );
  if (idx > 0 && idx !== Infinity) cleaned = cleaned.substring(idx);

  try { return JSON.parse(cleaned); } catch { /* devam */ }
  // Parantez tamamlama
  const stack: string[] = []; let inStr = false; let esc = false;
  for (const ch of cleaned) {
    if (esc) { esc = false; continue; }
    if (ch === '\\' && inStr) { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === '{') stack.push('}'); else if (ch === '[') stack.push(']');
    else if ((ch === '}' || ch === ']') && stack.length > 0) stack.pop();
  }
  if (inStr) cleaned += '"';
  while (stack.length > 0) cleaned += stack.pop();
  return JSON.parse(cleaned);
};

// ─── TYPE DEFINITIONS ────────────────────────────────────────────────────

export interface VariantGenerationConfig {
  targetProfile?: LearningDisabilityProfile;
  ageGroup?: AgeGroup;
  difficultyLevel?: Difficulty;
  preserveLayout: boolean;
  preserveStructure: boolean;
}

export interface DifficultyMetrics {
  complexity: number;  // 0-100
  vocabularyLevel: number;  // 0-100
  cognitiveLoad: number;  // 0-100
}

export interface VariantContext {
  sourceBlueprint: string;
  metadata: {
    originalType: string;
    layoutHints: {
      columns: number;
      hasImages: boolean;
      questionCount: number;
    };
  };
}

export interface VariationRequest {
  blueprint: OCRResult;
  count: number; // 1-10
  config?: VariantGenerationConfig;
  userId: string;
}

export interface VariationResult {
  variations: SingleWorksheetData[];
  metadata: {
    requestedCount: number;
    successfulCount: number;
    failedCount: number;
    quality: 'high' | 'medium' | 'low';
    warnings?: string[];
    processingTimeMs: number;
  };
}

// ─── VALIDATION ──────────────────────────────────────────────────────────

const validateVariationRequest = (request: VariationRequest): void => {
  if (!request.blueprint || !request.blueprint.structuredData) {
    throw new ValidationError('Blueprint verisi eksik veya geçersiz.', {
      hasBlueprint: !!request.blueprint,
      hasStructuredData: !!request.blueprint?.structuredData
    });
  }

  if (request.count < 1 || request.count > 10) {
    throw new ValidationError('Varyasyon sayısı 1-10 arasında olmalıdır.', {
      count: request.count
    });
  }

  if (request.blueprint.quality === 'low') {
    throw new ValidationError(
      'Blueprint kalitesi çok düşük. Lütfen daha net bir görsel yükleyin.',
      { quality: request.blueprint.quality }
    );
  }

  if (!request.userId || typeof request.userId !== 'string') {
    throw new ValidationError('Kullanıcı ID eksik veya geçersiz.', {
      userId: request.userId
    });
  }
};

// ─── PROMPT ENGINEERING ──────────────────────────────────────────────────

const buildVariationPrompt = (
  request: VariationRequest,
  context: VariantContext
): string => {
  const { blueprint, count, config } = request;
  const { worksheetBlueprint, title, detectedType, componentRequirements, densityHints } = blueprint.structuredData;

  const targetProfile = config?.targetProfile || 'mixed';
  const ageGroup = config?.ageGroup || '8-10';

  const visualContext = blueprint.structuredData.visualDescriptors?.length
    ? `\nMEVCUT GÖRSELLER: ${blueprint.structuredData.visualDescriptors
        .map(v => `${v.tipi}: ${v.aciklama}`)
        .join('; ')}`
    : '';

  // Tip bazlı direktif
  const typePatch = buildDetectedTypePromptPatch(detectedType as OCRDetectedTypeLib);

  // Bileşen checklist direktifi (sadece true olan bileşenler için)
  const componentChecklist = buildComponentChecklist(componentRequirements);

  // Yoğunluk hedefi direktifi
  const densityDirective = buildDensityDirective(densityHints);

  return `
${A4_COMPACT_INSTRUCTION}

${typePatch}

${componentChecklist ? componentChecklist + '\n' : ''}
[VARYASYON ÜRETME MOTORU - GEMINI 2.5 FLASH]
Aşağıdaki BLUEPRINT'ten ${count} adet FARKLI VERİLİ aktivite varyasyonu üret.

BLUEPRINT (MİMARİ DNA):
${worksheetBlueprint}

KAYNAK BİLGİLERİ:
- Başlık: ${title}
- Tip: ${detectedType}
- Sütun sayısı: ${context.metadata.layoutHints.columns}
- Soru sayısı: ~${context.metadata.layoutHints.questionCount}
- Görsel içeriyor: ${context.metadata.layoutHints.hasImages ? 'Evet' : 'Hayır'}${visualContext}

${densityDirective}

KRİTİK KURALLAR (İHLAL EDİLEMEZ):
1. MİMARİ YAPISI AYNI KALMALI: Sütun sayısı, soru formatı, layout tamamen aynı.
2. VERİ FARKLI OLMALI: Sayılar, metinler, kelimeler, cümleler her varyasyonda farklı.
3. ZORLUK SEVİYESİ AYNI: Blueprint'teki zorluk seviyesi korunmalı.
4. PEDAGOJİK UYUM: Öğrenme profili = ${targetProfile}, Yaş grubu = ${ageGroup}
5. DISLEKSİ-DOSTU: Lexend fontu (font-family:'Lexend',sans-serif), geniş satır aralığı, net görsel hiyerarşi.

${COMPONENT_CHECKLIST_PROMPT}

VARYASYON ÖRNEKLERİ:
Blueprint: "3 + 5 = ?" → Varyasyon 1: "7 + 2 = ?", Varyasyon 2: "9 + 4 = ?"
Blueprint: "Kelimedeki ünlüleri bulun: elma" → Varyasyon 1: "armut", Varyasyon 2: "kiraz"
Blueprint: "Boşluğu doldurun: Ali ___ gitti." → Varyasyon 1: "okula", Varyasyon 2: "parka"

GÖRSEL ÜRETİM:
- Orijinal materyal görsel içeriyorsa (hasImages: true veya blueprint'te grafik/tablo/şekil varsa):
  Her varyasyonda grafikVeri alanını doldur. Aynı tip görseli (örn: sutun_grafigi) farklı verilerle üret.
- Orijinal materyal görsel içermiyorsa: grafikVeri alanını null bırak.

HTML İÇERİK KALİTE KURALLARI:
- Her content HTML olarak döndür — düz metin değil.
- Inline style kullan: font-family:'Lexend',sans-serif; font-size:11px; line-height:1.3
- Sorular arası: margin-bottom:6px; paragraflar arası: margin-bottom:4px
- Tablo, grid yapıları için: padding:4px; border:1px solid #999; border-collapse:collapse
- 2 sütun layout gerekiyorsa: display:grid; grid-template-columns:1fr 1fr; gap:8px

${count} adet tam varyasyon üret. Her biri eksiksiz WorksheetData objesi olmalı.
  `.trim();
};

// ─── SCHEMA DEFINITION ───────────────────────────────────────────────────

const getVariationSchema = () => ({
  type: 'OBJECT' as const,
  properties: {
    variations: {
      type: 'ARRAY' as const,
      items: {
        type: 'OBJECT' as const,
        properties: {
          title: {
            type: 'STRING' as const,
            description: 'Aktivite başlığı (kısa, öğrenciye hitap eden)'
          },
          type: {
            type: 'STRING' as const,
            description: 'ActivityType enum değeri'
          },
          content: {
            type: 'STRING' as const,
            description: 'HTML aktivite içeriği. ZORUNLU: inline style ile font-family:Lexend,sans-serif; font-size:11px; line-height:1.3 kullan. A4 sayfasını %80+ dolduracak yoğunlukta üret. Sorular arası margin-bottom:6px.'
          },

          difficultyLevel: {
            type: 'STRING' as const,
            description: "Zorluk seviyesi: 'Kolay' | 'Orta' | 'Zor'"
          },
          targetSkills: {
            type: 'ARRAY' as const,
            items: { type: 'STRING' as const },
            description: 'Hedef beceriler listesi (örn: "Okuma hızı", "Sayı algısı")'
          },
          grafikVeri: {
            type: 'OBJECT' as const,
            nullable: true,
            description: 'Aktivitenin görsel/grafik verisi — orijinal materyalde grafik/tablo/şekil varsa doldur',
            properties: {
              tip: {
                type: 'STRING' as const,
                description: 'Görsel tipi: sutun_grafigi | pasta_grafigi | cizgi_grafigi | tablo | ucgen | dikdortgen | daire | koordinat_sistemi | sayi_dogrusu | venn_diyagrami'
              },
              baslik: {
                type: 'STRING' as const,
                description: 'Grafiğin başlığı'
              },
              veri: {
                type: 'ARRAY' as const,
                items: {
                  type: 'OBJECT' as const,
                  properties: {
                    etiket: { type: 'STRING' as const },
                    deger: { type: 'NUMBER' as const },
                    birim: { type: 'STRING' as const }
                  }
                }
              }
            }
          }
        },
        required: ['title', 'type', 'content', 'difficultyLevel', 'targetSkills']
      }
    }
  },
  required: ['variations']
});

// ─── POST-PROCESSING ─────────────────────────────────────────────────────

const validateVariation = (
  variation: any,
  index: number
): string[] => {
  const warnings: string[] = [];



  if (!variation.title || variation.title.length < 5) {
    warnings.push(`Varyasyon ${index + 1}: Başlık çok kısa.`);
  }

  if (!variation.content || variation.content.length < 100) {
    warnings.push(`Varyasyon ${index + 1}: İçerik çok kısa veya eksik.`);
  }

  if (!Array.isArray(variation.targetSkills) || variation.targetSkills.length === 0) {
    warnings.push(`Varyasyon ${index + 1}: Hedef beceriler eksik.`);
  }

  return warnings;
};

const postProcessVariation = (
  variation: any,
  index: number,
  request: VariationRequest
): SingleWorksheetData => {
  const timestamp = new Date().toISOString();

  return {
    ...variation,
    id: `ocr_var_${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
    type: 'OCR_CONTENT' as ActivityType,
    grafikVeri: variation.grafikVeri ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
    source: 'ocr_variation',
    metadata: {
      originalBlueprint: request.blueprint.title,
      variationIndex: index + 1,
      totalVariations: request.count,
      generatedFrom: 'blueprint_cloning',
      blueprintQuality: request.blueprint.quality
    }
  };
};

// ─── MAIN SERVICE ────────────────────────────────────────────────────────

/**
 * generateVariations: Blueprint'ten varyasyon üretir
 *
 * @param request - Varyasyon üretim isteği
 * @returns Üretilen varyasyonlar ve metadata
 * @throws ValidationError - Geçersiz istek
 * @throws InternalServerError - Gemini API hatası
 */
export const generateVariations = async (
  request: VariationRequest
): Promise<VariationResult> => {
  const startTime = Date.now();

  // Validasyon
  validateVariationRequest(request);

  const { worksheetBlueprint, layoutHints, detectedType } = request.blueprint.structuredData;

  // Context oluştur
  const context: VariantContext = {
    sourceBlueprint: worksheetBlueprint,
    metadata: {
      originalType: detectedType || 'OTHER',
      layoutHints: layoutHints || { columns: 1, hasImages: false, questionCount: 5 }
    }
  };

  // Prompt oluştur
  const prompt = buildVariationPrompt(request, context);
  const schema = getVariationSchema();

  try {
    // Gemini API'ye tek seferde gönder (batch generation)
    const result = await retryWithBackoff<{ variations: any[] }>(
      async () => {
        const apiResult = process.env.NODE_ENV === 'test'
          ? await analyzeImage('', prompt, schema)
          : await callGeminiDirect(prompt);

        if (!apiResult || !Array.isArray((apiResult as any).variations)) {
          throw new InternalServerError(
            'Gemini API geçersiz varyasyon yanıtı döndü.'
          );
        }

        return apiResult as { variations: any[] };
      },
      {
        maxRetries: 2,
        initialDelay: 2000,
        maxDelay: 8000,
        shouldRetry: (error: any) => error.isRetryable || error.httpStatus === 503
      }
    );

    // Post-processing ve validation
    const allWarnings: string[] = [];
    const processedVariations: SingleWorksheetData[] = result.variations.map((variation, index) => {
      const warnings = validateVariation(variation, index);
      allWarnings.push(...warnings);
      return postProcessVariation(variation, index, request);
    });

    // Kalite kontrolü
    const successfulCount = processedVariations.length;
    const failedCount = request.count - successfulCount;

    if (successfulCount < request.count) {
      allWarnings.push(
        `İstenilen ${request.count} varyasyondan ${successfulCount} tanesi başarıyla üretildi.`
      );
    }

    // Quality scoring
    let quality: 'high' | 'medium' | 'low' = 'high';
    if (allWarnings.length > 3 || successfulCount < request.count * 0.8) {
      quality = 'low';
    } else if (allWarnings.length > 1 || successfulCount < request.count) {
      quality = 'medium';
    }

    const processingTimeMs = Date.now() - startTime;

    return {
      variations: processedVariations as unknown as SingleWorksheetData[],
      metadata: {
        requestedCount: request.count,
        successfulCount,
        failedCount,
        quality,
        warnings: allWarnings.length > 0 ? allWarnings : undefined,
        processingTimeMs
      }
    };
  } catch (error: unknown) {
    logError('OCR Variation Error', {
      error: error as Record<string, unknown>,
      context: 'OCR Variation Generation',
      userId: request.userId,
      blueprintTitle: request.blueprint.title
    });
    throw error;
  }
};

/**
 * validateVariationQuality: Üretilen varyasyonun kalitesini kontrol eder
 *
 * @param variation - Kontrol edilecek varyasyon
 * @returns Kalite skoru (0-100)
 */
export const validateVariationQuality = (variation: SingleWorksheetData): number => {
  let score = 100;



  // Content kontrolü
  if (!variation.content || (variation.content as string).length < 100) {
    score -= 25;
  }

  // targetSkills kontrolü
  if (!Array.isArray(variation.targetSkills) || (variation.targetSkills as string[]).length === 0) {
    score -= 20;
  }

  // Title kontrolü
  if (!variation.title || variation.title.length < 5) {
    score -= 15;
  }

  // difficultyLevel kontrolü
  const validDifficulties = ['Kolay', 'Orta', 'Zor'];
  if (!validDifficulties.includes(variation.difficultyLevel as string)) {
    score -= 10;
  }

  return Math.max(0, score);
};

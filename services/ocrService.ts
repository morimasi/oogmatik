
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { OCRResult, OCRBlueprint, OCRDetectedType } from '../types';

// Blueprint kalitesini ölçen minimum karakter eşiği
const BLUEPRINT_MIN_LENGTH = 50;

// ─── Blueprint Önbelleği ──────────────────────────────────────────
// base64 hash → OCRResult eşlemesi (aynı görsel tekrar analiz edilmez)
const blueprintCache = new Map<string, { result: OCRResult; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 dakika

/**
 * hashBase64: Base64 stringin ilk 200 + son 200 karakterinden hızlı hash üretir.
 * Tam hash hesaplaması pahalı olduğundan kısaltılmış karşılaştırma yapılır.
 */
const hashBase64 = (base64: string): string => {
    const raw = base64.split(',')[1] || base64;
    const head = raw.substring(0, 200);
    const tail = raw.substring(raw.length - 200);
    const len = raw.length;
    // Basit ama etkili hash — çarpışma ihtimali ihmal edilebilir
    let hash = 0;
    const segment = head + tail + len;
    for (let i = 0; i < segment.length; i++) {
        hash = ((hash << 5) - hash + segment.charCodeAt(i)) | 0;
    }
    return `ocr_${hash}_${len}`;
};

const getCachedResult = (base64: string): OCRResult | null => {
    const key = hashBase64(base64);
    const cached = blueprintCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.result;
    }
    if (cached) blueprintCache.delete(key); // TTL geçmiş, sil
    return null;
};

const setCacheResult = (base64: string, result: OCRResult): void => {
    const key = hashBase64(base64);
    blueprintCache.set(key, { result, timestamp: Date.now() });
    // Maks 20 önbellek girişi tut
    if (blueprintCache.size > 20) {
        const oldest = blueprintCache.keys().next().value;
        if (oldest) blueprintCache.delete(oldest);
    }
};

/**
 * validateBlueprint: Dönen blueprint'in anlamlı olup olmadığını kontrol eder.
 */
const validateBlueprint = (blueprint: string): { isValid: boolean; quality: 'high' | 'medium' | 'low'; warnings: string[] } => {
    const warnings: string[] = [];

    if (!blueprint || blueprint.trim().length === 0) {
        return { isValid: false, quality: 'low', warnings: ['Blueprint boş döndü.'] };
    }

    if (blueprint.trim().length < BLUEPRINT_MIN_LENGTH) {
        warnings.push(`Blueprint çok kısa (${blueprint.trim().length} karakter). Daha net bir görsel deneyin.`);
        return { isValid: true, quality: 'low', warnings };
    }

    const meaningfulKeywords = ['soru', 'cevap', 'bölüm', 'grid', 'tablo', 'column', 'block', 'hücre', 'liste', 'madde'];
    const lowerBlueprint = blueprint.toLowerCase();
    const hasKeywords = meaningfulKeywords.some(kw => lowerBlueprint.includes(kw));

    if (!hasKeywords && blueprint.trim().length < 200) {
        warnings.push('Blueprint yapısal anahtar kelimeler içermiyor. Analiz kalitesi düşük olabilir.');
        return { isValid: true, quality: 'medium', warnings };
    }

    return { isValid: true, quality: 'high', warnings };
};

export const ocrService = {
    processImage: async (base64Image: string): Promise<OCRResult> => {
        // Önbellek kontrolü
        const cached = getCachedResult(base64Image);
        if (cached) {
            console.log('[OCR Cache] Hit — önbellekten döndürülüyor.');
            return { ...cached, description: cached.description + ' (Önbellek)' };
        }

        const prompt = `
        [MİMARİ KLONLAMA MOTORU - GEMINI 3 FLASH THINKING]
        Bu çalışma sayfasını derinlemesine analiz et ve 'BLUEPRINT_V1.0' formatında mimari DNA'sını çıkar.
        
        ANALİZ PROTOKOLÜ (Thinking):
        1. ROOT_CONTAINER: Sayfa genel yerleşimi (sütun sayısı, grid yapısı, kenar boşlukları).
        2. LOGIC_MODULES: Soru bloklarının teknik yapısı (soru tipi, format, boşluk tasarımı).
        3. SOLUTION_LOGIC: Cevaba giden mantıksal yol ve örüntü.
        4. DETECTED_TYPE: Materyal türü (MATH_WORKSHEET | READING_COMPREHENSION | FILL_IN_THE_BLANK | MATCHING | TRUE_FALSE | MULTIPLE_CHOICE | OTHER).
        5. LAYOUT_HINTS: Sütun sayısı, görsel varlığı, toplam soru sayısı tahmini.
        
        SADECE metni okuma; sayfa hiyerarşisini ve mimari yapısını çöz.
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                title: {
                    type: Type.STRING,
                    description: "Çalışma sayfasının başlığı veya konusu"
                },
                detectedType: {
                    type: Type.STRING,
                    description: "MATH_WORKSHEET | READING_COMPREHENSION | FILL_IN_THE_BLANK | MATCHING | TRUE_FALSE | MULTIPLE_CHOICE | OTHER"
                },
                worksheetBlueprint: {
                    type: Type.STRING,
                    description: "BLUEPRINT_V1.0 formatında teknik mimari DNA — sütunlar, bloklar, soru tipleri, yerleşim mantığı"
                },
                layoutHints: {
                    type: Type.OBJECT,
                    properties: {
                        columns: { type: Type.NUMBER, description: "Sayfadaki sütun sayısı (1-4)" },
                        hasImages: { type: Type.BOOLEAN, description: "Görseller içeriyor mu?" },
                        questionCount: { type: Type.NUMBER, description: "Tahmini soru/madde sayısı" }
                    },
                    required: ['columns', 'hasImages', 'questionCount']
                }
            },
            required: ['title', 'detectedType', 'worksheetBlueprint', 'layoutHints']
        };

        try {
            const result = await analyzeImage(base64Image, prompt, schema) as OCRBlueprint;
            const validation = validateBlueprint(result.worksheetBlueprint);

            if (!validation.isValid) {
                throw new Error(validation.warnings.join(' '));
            }

            const ocrResult: OCRResult = {
                rawText: result.worksheetBlueprint,
                detectedType: (result.detectedType as OCRDetectedType) || 'ARCH_CLONE',
                title: result.title || 'Başlıksız Materyal',
                description: `Mimari DNA başarıyla analiz edildi. Kalite: ${validation.quality.toUpperCase()}. Klonlama için hazır.`,
                generatedTemplate: result.worksheetBlueprint,
                structuredData: {
                    ...result,
                    detectedType: (result.detectedType as OCRDetectedType) || 'OTHER'
                },
                baseType: 'OCR_CONTENT',
                quality: validation.quality,
                warnings: validation.warnings.length > 0 ? validation.warnings : undefined
            };

            // Önbelleğe kaydet
            setCacheResult(base64Image, ocrResult);

            return ocrResult;
        } catch (error: unknown) {
            console.error("Deep Arch Analysis Error:", error);
            throw error;
        }
    },

    /** Önbelleği temizle */
    clearCache: () => {
        blueprintCache.clear();
    }
};

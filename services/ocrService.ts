
import { InternalServerError } from '../utils/AppError.js';
import { OCRResult, OCRBlueprint, OCRDetectedType } from '../types.js';

// ─── CONSTANTS ────────────────────────────────────────────────────────────
const MASTER_MODEL = 'gemini-2.5-flash';

// ─── DIRECT GEMINI WITH IMAGE (server-side only) ──────────────────────────
/**
 * Doğrudan Gemini REST API çağrısı (görsel destekli).
 * analyzeImage (frontend proxy) /api/ocr/analyze endpoint'inden çağrıldığında
 * /api/generate'e yönlendirir → circular / cross-request sorun yaratır.
 * Bu yüzden server-side'da REST API doğrudan çağrılır.
 */
const callGeminiWithImage = async (
    base64Image: string,
    prompt: string
): Promise<unknown> => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
    if (!apiKey) throw new InternalServerError('API Key bulunamadı (ocrService).');

    // Base64 prefix temizle
    const imageData = base64Image.includes(',')
        ? base64Image.split(',')[1]
        : base64Image;

    // MIME type tespiti
    let mimeType: string = 'image/jpeg';
    try {
        const prefix = imageData.substring(0, 8);
        const bytes = atob(prefix);
        const b0 = bytes.charCodeAt(0), b1 = bytes.charCodeAt(1);
        if (b0 === 0x89 && b1 === 0x50) mimeType = 'image/png';
        else if (b0 === 0x52 && b1 === 0x49) mimeType = 'image/webp';
    } catch { /* fallback jpeg */ }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MASTER_MODEL}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                role: 'user',
                parts: [
                    { inlineData: { mimeType, data: imageData } },
                    { text: prompt }
                ]
            }]
        })
    });

    if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new InternalServerError(
            `Gemini API Hatası (OCR): ${(errJson as any)?.error?.message || response.statusText}`
        );
    }

    const data = await response.json();
    const text = (data as any)?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new InternalServerError('Gemini boş yanıt döndürdü (OCR).');

    // JSON repair motoru
    let cleaned = text.replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
        .replace(/^```json[\s\S]*?\n/, '')
        .replace(/^```\s*/m, '')
        .replace(/```\s*$/m, '')
        .trim();

    const fb = cleaned.indexOf('{');
    const fl = cleaned.indexOf('[');
    let si = -1;
    if (fb !== -1 && fl !== -1) si = Math.min(fb, fl);
    else if (fb !== -1) si = fb;
    else if (fl !== -1) si = fl;
    if (si > 0) cleaned = cleaned.substring(si);

    try { return JSON.parse(cleaned); } catch { /* devam */ }

    // Parantez tamamlama
    const stack: string[] = []; let inStr = false; let esc = false;
    let fixedStr = cleaned;
    for (const ch of fixedStr) {
        if (esc) { esc = false; continue; }
        if (ch === '\\' && inStr) { esc = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === '{') stack.push('}'); else if (ch === '[') stack.push(']');
        else if ((ch === '}' || ch === ']') && stack.length > 0) stack.pop();
    }
    if (inStr) fixedStr += '"';
    while (stack.length > 0) fixedStr += stack.pop();
    return JSON.parse(fixedStr);
};

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
        // LRU: Son erişim zamanını güncelle
        cached.timestamp = Date.now();
        return cached.result;
    }
    if (cached) blueprintCache.delete(key); // TTL geçmiş, sil
    return null;
};

const setCacheResult = (base64: string, result: OCRResult): void => {
    const key = hashBase64(base64);
    blueprintCache.set(key, { result, timestamp: Date.now() });

    // Maks 20 önbellek girişi tut (LRU Tahliye Stratejisi)
    if (blueprintCache.size > 20) {
        const entries = Array.from(blueprintCache.entries());
        const oldest = entries.sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
        if (oldest) {
            blueprintCache.delete(oldest[0]);
        }
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
        3. EXACT_TEXT_EXTRACTION: Görselde okuduğun metinleri, yönergeleri, tabloları ve soruları KESİNLİKLE DEĞİŞTİRMEDEN (1:1 Birebir) Blueprint içerisine veri olarak aktar.
        4. SOLUTION_LOGIC: Cevaba giden mantıksal yol ve örüntü.
        5. DETECTED_TYPE: Materyal türü (MATH_WORKSHEET | READING_COMPREHENSION | FILL_IN_THE_BLANK | MATCHING | TRUE_FALSE | MULTIPLE_CHOICE | OTHER).
        6. LAYOUT_HINTS: Sütun sayısı, görsel varlığı, toplam soru sayısı tahmini.
        
        SADECE metni okuma; sayfa hiyerarşisini, mimari yapısını ve ASIL VERİYİ eksiksiz çöz.
        `;

        const schema = {
            type: 'OBJECT',
            properties: {
                title: {
                    type: 'STRING',
                    description: "Çalışma sayfasının başlığı veya konusu"
                },
                detectedType: {
                    type: 'STRING',
                    description: "MATH_WORKSHEET | READING_COMPREHENSION | FILL_IN_THE_BLANK | MATCHING | TRUE_FALSE | MULTIPLE_CHOICE | OTHER"
                },
                worksheetBlueprint: {
                    type: 'STRING',
                    description: "BLUEPRINT_V1.0 formatında teknik mimari DNA — sütunlar, bloklar, soru tipleri, yerleşim mantığı"
                },
                layoutHints: {
                    type: 'OBJECT',
                    properties: {
                        columns: { type: 'NUMBER', description: "Sayfadaki sütun sayısı (1-4)" },
                        hasImages: { type: 'BOOLEAN', description: "Görseller içeriyor mu?" },
                        questionCount: { type: 'NUMBER', description: "Tahmini soru/madde sayısı" }
                    },
                    required: [] // Hiçbiri zorunlu değil (Robusti artırır)
                }
            },
            required: ['title', 'detectedType', 'worksheetBlueprint']
        };

        try {
            const result = await callGeminiWithImage(base64Image, prompt) as OCRBlueprint;
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

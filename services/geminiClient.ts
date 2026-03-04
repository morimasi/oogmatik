import { GoogleGenAI } from "@google/genai";

declare var process: any;

// SİSTEMİN KALBİ: GEMINI 3 FLASH PREVIEW
const MASTER_MODEL = 'gemini-3-flash-preview';

/**
 * balanceBraces: JSON yanıtlarını güvenli hale getirir.
 */
const balanceBraces = (str: string): string => {
    let openBraces = (str.match(/\{/g) || []).length;
    let closeBraces = (str.match(/\}/g) || []).length;
    let openBrackets = (str.match(/\[/g) || []).length;
    let closeBrackets = (str.match(/\]/g) || []).length;

    while (openBrackets > closeBrackets) { str += ']'; closeBrackets++; }
    while (openBraces > closeBraces) { str += '}'; closeBraces++; }
    return str;
};

const tryRepairJson = (jsonStr: string): any => {
    if (!jsonStr) throw new Error("AI yanıt dönmedi.");
    let cleaned = jsonStr.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    let startIndex = -1;
    if (firstBrace !== -1 && firstBracket !== -1) startIndex = Math.min(firstBrace, firstBracket);
    else if (firstBrace !== -1) startIndex = firstBrace;
    else if (firstBracket !== -1) startIndex = firstBracket;

    if (startIndex !== -1) cleaned = cleaned.substring(startIndex);
    cleaned = balanceBraces(cleaned);

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Parse Error:", cleaned);
        throw new Error("AI verisi işlenemedi.");
    }
};

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun "Nöro-Mimari" motorusun (Gemini 3 Flash Thinking Edition).
GÖREVİN: Özel öğrenme güçlüğü yaşayan çocuklar için bilimsel temelli materyalleri klonlamak ve üretmek.

THINKING MODU GÖREVLERİ:
1. Görseldeki tablo, ızgara ve hiyerarşik yapıları teknik bir BLUEPRINT olarak analiz et.
2. Klinik çeldiricileri (b-d karışıklığı, ayna etkisi vb.) üretimden önce MUHAKEME ET.
3. Çıktı her zaman geçerli bir JSON olmalıdır.

MULTIMODAL KURALLAR:
- Gelen görsellerdeki her bir soru bloğunu, tipografik özellikleri ve yerleşimi analiz et.
- Yeni üretimi bu mimari DNA üzerine inşa et.
`;

export interface MultimodalFile {
    data: string;
    mimeType: string;
}

/**
 * generateCreativeMultimodal: 
 * Gemini 3 Flash Preview kullanarak 'Thinking' kapasitesiyle üretim yapar.
 */
export const generateCreativeMultimodal = async (params: {
    prompt: string,
    schema: any,
    files?: MultimodalFile[]
}) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Anahtarı eksik.");

    const ai = new GoogleGenAI({ apiKey });
    let parts: any[] = [];

    // MULTIMODAL: Görsel verileri ekle
    if (params.files && params.files.length > 0) {
        params.files.forEach(file => {
            const base64Data = file.data.split(',')[1] || file.data;
            parts.push({ inlineData: { mimeType: file.mimeType, data: base64Data.trim() } });
        });
    }

    parts.push({ text: params.prompt });

    // KRİTİK: Gemini 3 Thinking Ayarları
    // ThinkingBudget, MaxOutputTokens'tan küçük olmalıdır.
    const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: params.schema,
        temperature: 0.1,
        maxOutputTokens: 18000,
        thinkingConfig: { thinkingBudget: 6000 }
    };

    const response = await ai.models.generateContent({
        model: MASTER_MODEL,
        contents: { parts }, // Doğru yapı: { parts }
        config: config
    });

    if (response.text) return tryRepairJson(response.text);
    throw new Error("AI yanıt üretmedi.");
};

export const generateWithSchema = async (prompt: string, schema: any) => {
    return await generateCreativeMultimodal({ prompt, schema });
};

/**
 * detectMimeType: Base64 verinin magic headerından MIME tipini çözer.
 * Sabit 'image/jpeg' yerine dinamik algılama yaparak PNG/WEBP/GIF hatalarını önler.
 */
export const detectMimeType = (base64: string): 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' => {
    const raw = base64.split(',')[1] || base64;
    // İlk birkaç karakter base64 magic byte içerir
    const prefix = raw.substring(0, 8);
    try {
        const bytes = atob(prefix);
        const b0 = bytes.charCodeAt(0);
        const b1 = bytes.charCodeAt(1);
        const b2 = bytes.charCodeAt(2);
        const b3 = bytes.charCodeAt(3);
        if (b0 === 0xFF && b1 === 0xD8) return 'image/jpeg';
        if (b0 === 0x89 && b1 === 0x50 && b2 === 0x4E && b3 === 0x47) return 'image/png';
        if (b0 === 0x52 && b1 === 0x49 && b2 === 0x46 && b3 === 0x46) return 'image/webp';
        if (b0 === 0x47 && b1 === 0x49 && b2 === 0x46) return 'image/gif';
    } catch {
        // atob başarısız olursa data URL header'ına bak
        const header = base64.split(';')[0];
        if (header.includes('png')) return 'image/png';
        if (header.includes('webp')) return 'image/webp';
        if (header.includes('gif')) return 'image/gif';
    }
    return 'image/jpeg'; // fallback
};

export const analyzeImage = async (image: string, prompt: string, schema: any) => {
    const mimeType = detectMimeType(image);
    return await generateCreativeMultimodal({
        prompt,
        schema,
        files: [{ data: image, mimeType }]
    });
};

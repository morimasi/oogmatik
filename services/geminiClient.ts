
import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = 'gemini-3-pro-preview'; 
const FLASH_MODEL = 'gemini-3-flash-preview';

/**
 * balanceBraces: Yarıda kesilmiş JSON yanıtlarını parantezleri sayarak kapatır.
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

/**
 * tryRepairJson: AI'dan gelen ham metni temizler ve JSON'a dönüştürür.
 */
const tryRepairJson = (jsonStr: string): any => {
    if (!jsonStr) throw new Error("AI boş yanıt döndürdü.");

    // 1. Temel Temizlik (Markdown ve Unicode)
    let cleaned = jsonStr.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    // 2. Hallüsinasyon Temizliği (Hatalı uzun sayı dizilerini düzeltme)
    // viewBox: "0 0 100 5000000000000..." gibi hataları yakalar
    // Tüm 10 basamaktan büyük sayıları 100 ile değiştir (Koordinat/boyut sistemimiz 100 tabanlı olduğu için mantıklı bir fallback)
    cleaned = cleaned.replace(/: ?"?(\d{10,})"?/g, ': 100');
    // Eğer tırnak içindeyse ve çok uzunsa temizle
    cleaned = cleaned.replace(/"(\d{10,})"/g, '"100"');

    // 3. JSON Bloğunu Yakala
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    let startIndex = -1;
    if (firstBrace !== -1 && firstBracket !== -1) startIndex = Math.min(firstBrace, firstBracket);
    else if (firstBrace !== -1) startIndex = firstBrace;
    else if (firstBracket !== -1) startIndex = firstBracket;

    if (startIndex !== -1) {
        cleaned = cleaned.substring(startIndex);
    }

    // 4. Parantez Dengeleme (Yarıda kesilme ihtimaline karşı)
    cleaned = balanceBraces(cleaned);

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        // Son çare: Virgül hatalarını ve kaçış karakterlerini temizle
        let fragment = cleaned
            .replace(/,\s*([\}\]])/g, '$1') 
            .replace(/\\n/g, ' ');
        try {
            return JSON.parse(fragment);
        } catch (e2) {
            console.error("JSON Tamiri Başarısız. Ham Veri:", jsonStr);
            throw new Error("AI verisi işlenemedi. Lütfen tekrar deneyin.");
        }
    }
};

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun "Nöro-Mimari" motorusun. 
GÖREVİN: Disleksi/diskalkuli odaklı, görsel hiyerarşisi güçlü eğitim materyalleri üretmek.
ÖNEMLİ KURALLAR:
1. SADECE SAF JSON DÖN.
2. Sayısal değerlerde asla 10 basamaktan uzun sayı kullanma.
3. viewBox her zaman "0 0 100 100" olmalıdır.
4. Karmaşık koordinatlar yerine 0-100 arası tamsayıları tercih et.
5. JSON çıktısında 'layoutArchitecture' anahtarını mutlaka kullan ve sayfayı 'blocks' olarak kurgula.
`;

export interface MultimodalFile {
    data: string; 
    mimeType: string;
}

export const generateCreativeMultimodal = async (params: { 
    prompt: string, 
    schema: any, 
    files?: MultimodalFile[],
    useFlash?: boolean
}) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Anahtarı eksik.");

    const ai = new GoogleGenAI({ apiKey });
    let parts: any[] = [];
    
    if (params.files && params.files.length > 0) {
        params.files.forEach(file => {
            const base64Data = file.data.split(',')[1] || file.data;
            parts.push({ inlineData: { mimeType: file.mimeType, data: base64Data.trim() } });
        });
    }

    parts.push({ text: params.prompt });

    const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: params.schema,
        temperature: 0.1, 
        thinkingConfig: { thinkingBudget: params.useFlash ? 0 : 8000 } 
    };

    const response = await ai.models.generateContent({
        model: params.useFlash ? FLASH_MODEL : DEFAULT_MODEL,
        contents: [{ role: 'user', parts }],
        config: config
    });
    
    if (response.text) return tryRepairJson(response.text);
    throw new Error("AI yanıt üretmedi.");
};

export const generateWithSchema = async (prompt: string, schema: any, model?: string) => {
    return await generateCreativeMultimodal({ prompt, schema, useFlash: model?.includes('flash') });
};

export const analyzeImage = async (image: string, prompt: string, schema: any, model?: string) => {
    return await generateCreativeMultimodal({ 
        prompt, schema, files: [{ data: image, mimeType: 'image/jpeg' }],
        useFlash: model?.includes('flash')
    });
};

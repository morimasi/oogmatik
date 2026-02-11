
import { GoogleGenAI } from "@google/genai";

// TÜM SİSTEMDE TEK MODEL: GEMINI 3 FLASH PREVIEW
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
Sen, Bursa Disleksi AI platformunun "Nöro-Mimari" motorusun. 
GÖREVİN: Disleksi, Diskalkuli ve DEHB tanısı almış çocuklar için bilimsel temelli materyallerin DNA'sını klonlamak ve üretmek.
MODEL MODU: Thinking (Düşünme) & Multimodal Vizyon Aktif.

KLİNİK KURALLAR:
1. Yanıtın her zaman geçerli bir JSON olmalıdır.
2. Görsel analiz ediyorsan, mimari yapıyı (tablo, sütun, hiyerarşi) teknik bir blueprint olarak çıkar.
3. Pedagojik kısıtlamaları (çeldirici mantığı, görsel yük) üretimden önce derinlemesine muhakeme et.
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
    
    if (params.files && params.files.length > 0) {
        params.files.forEach(file => {
            const base64Data = file.data.split(',')[1] || file.data;
            parts.push({ inlineData: { mimeType: file.mimeType, data: base64Data.trim() } });
        });
    }

    parts.push({ text: params.prompt });

    // KRİTİK AYAR: Thinking aktifken maxOutputTokens zorunludur.
    // Flash modelleri için ideal denge.
    const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: params.schema,
        temperature: 0.1,
        maxOutputTokens: 12000,
        thinkingConfig: { thinkingBudget: 8000 }
    };

    const response = await ai.models.generateContent({
        model: MASTER_MODEL,
        contents: [{ role: 'user', parts }],
        config: config
    });
    
    if (response.text) return tryRepairJson(response.text);
    throw new Error("AI yanıt üretmedi.");
};

export const generateWithSchema = async (prompt: string, schema: any) => {
    return await generateCreativeMultimodal({ prompt, schema });
};

export const analyzeImage = async (image: string, prompt: string, schema: any) => {
    return await generateCreativeMultimodal({ 
        prompt, 
        schema, 
        files: [{ data: image, mimeType: 'image/jpeg' }]
    });
};

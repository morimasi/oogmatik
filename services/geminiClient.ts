
import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = 'gemini-3-pro-preview'; // Karmaşık analizler için Pro modeline geçiş
const FLASH_MODEL = 'gemini-3-flash-preview';

/**
 * tryRepairJson: AI'dan gelen ham metni atomik seviyede JSON'a dönüştürür.
 */
const tryRepairJson = (jsonStr: string): any => {
    if (!jsonStr) throw new Error("AI boş yanıt döndürdü.");

    // Unicode ve gizli karakterleri temizle
    let cleaned = jsonStr.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    
    // Markdown bloklarını temizle
    cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        // En dıştaki { veya [ karakterini bul ve sonrasını yakala (Prefix metinleri temizlemek için)
        const firstBrace = cleaned.indexOf('{');
        const firstBracket = cleaned.indexOf('[');
        let startIndex = -1;

        if (firstBrace !== -1 && firstBracket !== -1) startIndex = Math.min(firstBrace, firstBracket);
        else if (firstBrace !== -1) startIndex = firstBrace;
        else if (firstBracket !== -1) startIndex = firstBracket;

        if (startIndex !== -1) {
            cleaned = cleaned.substring(startIndex);
            // Sondaki fazlalıkları temizle
            const lastBrace = cleaned.lastIndexOf('}');
            const lastBracket = cleaned.lastIndexOf(']');
            const endIndex = Math.max(lastBrace, lastBracket);
            if (endIndex !== -1) {
                cleaned = cleaned.substring(0, endIndex + 1);
            }
        }

        try {
            return JSON.parse(cleaned);
        } catch (e2) {
            // Manuel tırnak ve kaçış karakteri düzeltmeleri
            let fragment = cleaned
                .replace(/,\s*([\}\]])/g, '$1') // Sondaki virgülleri temizle
                .replace(/\\n/g, ' ')
                .replace(/([^\\])"/g, '$1\"'); // Kaçırılmamış tırnakları kontrol et (deneysel)

            try {
                return JSON.parse(fragment);
            } catch (e3) {
                console.error("JSON Repair Failed. Raw Response:", jsonStr);
                throw new Error("AI yanıtı JSON formatına dönüştürülemedi. Lütfen tekrar deneyin.");
            }
        }
    }
};

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun "Nöro-Mimari" motorusun. 
GÖREVİN: Disleksi/diskalkuli odaklı eğitim blueprintleri üretmek.
MULTIMODAL YETENEK: Ekte dosya (PDF veya Görsel) varsa, bu dosyaların yapısını, soru stilini ve pedagojik yaklaşımını analiz et.
ÜRETİM KURALI: Yeni üreteceğin içerik, ekteki dosyaların mizanpajı ve kalitesiyle uyumlu olmalı.
KURAL: SADECE SAF JSON DÖN. Asla açıklama metni ekleme.
MODEL MODU: Thinking & Multimodal Reasoning Aktif.
`;

export interface MultimodalFile {
    data: string; // base64
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
    
    // Dosyaları parçalara ekle (Base64 temizliği ile)
    if (params.files && params.files.length > 0) {
        params.files.forEach(file => {
            const base64Data = file.data.split(',')[1] || file.data;
            parts.push({ 
                inlineData: { 
                    mimeType: file.mimeType, 
                    data: base64Data.trim()
                } 
            });
        });
    }

    // Promptu en son ekle
    parts.push({ text: params.prompt });

    const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: params.schema,
        temperature: 0.1, // Daha tutarlı JSON için düşürüldü
        thinkingConfig: { thinkingBudget: params.useFlash ? 0 : 16000 } // Pro için bütçe artırıldı
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
        prompt, 
        schema, 
        files: [{ data: image, mimeType: 'image/jpeg' }],
        useFlash: model?.includes('flash')
    });
};

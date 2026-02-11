
import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = 'gemini-3-flash-preview';
const IMAGE_GEN_MODEL = 'gemini-2.5-flash-image';

/**
 * tryRepairJson: AI'dan gelen ham metni atomik seviyede JSON'a dönüştürür.
 * 1. Markdown bloklarını ayıklar.
 * 2. En büyük {} veya [] bloğunu bulur.
 * 3. Kesik yanıtlar için parantez sayacı ile otomatik kapatma yapar.
 * 4. Geçersiz kaçış karakterlerini normalize eder.
 */
const tryRepairJson = (jsonStr: string): any => {
    // Görünmez karakterleri ve Markdown bloklarını temizle
    let cleaned = jsonStr.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.warn("Standart JSON parse başarısız, derin onarım motoru (Deep Fix) devreye giriyor...");
        
        // 1. Regex ile ana bloğu cımbızla çek
        const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        let fragment = jsonMatch ? jsonMatch[0] : cleaned;
        
        // 2. Kaçış karakterlerini ve trailing commas'ları temizle
        fragment = fragment
            .replace(/,\s*([\}\]])/g, '$1') // Trailing commas
            .replace(/\\n/g, ' ')           // Newlines in strings
            .replace(/\\"/g, '"');         // Escaped quotes

        // 3. Auto-Closure: Eksik parantezleri matematiksel olarak tamamla
        const braceCount = (fragment.match(/\{/g) || []).length - (fragment.match(/\}/g) || []).length;
        const bracketCount = (fragment.match(/\[/g) || []).length - (fragment.match(/\]/g) || []).length;
        
        if (braceCount > 0) fragment += '}'.repeat(braceCount);
        if (bracketCount > 0) fragment += ']'.repeat(bracketCount);
        
        try {
            return JSON.parse(fragment);
        } catch (e2) {
            // Son Çare: Manuel string temizliği ve tekrar deneme
            try {
                const superCleaned = fragment.substring(0, fragment.lastIndexOf('}') + 1);
                return JSON.parse(superCleaned);
            } catch (e3) {
                console.error("JSON DNA Onarılamaz Durumda:", fragment);
                throw new Error("AI yanıtı geçerli bir JSON bloğuna dönüştürülemedi.");
            }
        }
    }
};

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun "Nöro-Mimari" motorusun. 
GÖREVİN: Gelen görseli analiz edip disleksi/diskalkuli odaklı eğitim blueprintleri üretmek.
KURAL: SADECE SAF JSON DÖN. Açıklama yapma.
`;

const generateDirectly = async (params: { 
    prompt: string, 
    schema: any, 
    model?: string, 
    image?: string, 
    mimeType?: string,
    isOcr?: boolean
}) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Anahtarı eksik.");

    const ai = new GoogleGenAI({ apiKey });
    const modelName = params.model || DEFAULT_MODEL;
    
    let parts: any[] = [];
    if (params.image) {
        // Base64 temizliği
        const base64Data = params.image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "").trim();
        parts.push({ 
            inlineData: { 
                mimeType: params.mimeType || 'image/jpeg', 
                data: base64Data
            } 
        });
    }
    parts.push({ text: params.prompt });

    const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: params.schema,
        temperature: 0.1,
    };

    if (modelName.includes('gemini-3') || modelName.includes('gemini-2.5')) {
        config.thinkingConfig = { thinkingBudget: params.isOcr ? 4000 : 0 };
    }

    const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: config
    });
    
    if (response.text) return tryRepairJson(response.text);
    throw new Error("AI yanıt üretmedi.");
};

export const generateWithSchema = async (prompt: string, schema: any, model?: string) => {
    return await generateDirectly({ prompt, schema, model, isOcr: false });
};

export const analyzeImage = async (image: string, prompt: string, schema: any, model?: string) => {
    return await generateDirectly({ 
        prompt, 
        schema, 
        model: model || DEFAULT_MODEL, 
        image,
        isOcr: true 
    });
};

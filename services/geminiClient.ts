
import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = 'gemini-3-flash-preview';
const IMAGE_GEN_MODEL = 'gemini-2.5-flash-image';

const tryRepairJson = (jsonStr: string): any => {
    // 1. Temel temizlik
    let cleaned = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim();

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.warn("Primary JSON Parse failed, attempting regex-based extraction...");
        
        // 2. Regex ile en geniş kapsamlı {} veya [] bloğunu bul
        // Bu, AI'nın JSON öncesi veya sonrası yaptığı sohbetleri temizler
        const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        
        if (jsonMatch) {
            const extracted = jsonMatch[0];
            try {
                return JSON.parse(extracted);
            } catch (e2) {
                console.warn("Regex extraction failed, attempting structural repair...");
                // 3. Eksik parantezleri kapatma (Stratejik onarım)
                let repaired = extracted;
                const openBraces = (repaired.match(/{/g) || []).length;
                const closeBraces = (repaired.match(/}/g) || []).length;
                const openBrackets = (repaired.match(/\[/g) || []).length;
                const closeBrackets = (repaired.match(/\]/g) || []).length;

                for (let i = 0; i < (openBraces - closeBraces); i++) repaired += '}';
                for (let i = 0; i < (openBrackets - closeBrackets); i++) repaired += ']';
                
                try {
                    return JSON.parse(repaired);
                } catch (e3) {
                    console.error("Structural repair failed completely.");
                    throw new Error("Yapay zeka yanıtı geçerli bir veri yapısına sahip değil: " + cleaned.substring(0, 100) + "...");
                }
            }
        }
        throw new Error("Yanıt içinde JSON bloğu bulunamadı. AI Yanıtı: " + cleaned.substring(0, 100));
    }
};

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun Klinik Yapay Zeka Motorusun.
Görevin: Disleksi, Diskalkuli ve DEHB tanısı almış çocuklar için tıbbi ve pedagojik hassasiyete sahip materyaller üretmek.

UZMANLIK ALANLARIN:
1. **Nöropsikoloji:** Dikkat testleri (Burdon, Stroop), çalışma belleği görevleri.
2. **Dilbilim:** Fonolojik farkındalık, morfolojik analiz, TDK uyumlu heceleme.
3. **Görsel Algı:** Şekil-zemin ayrımı, uzamsal yönelim, ayna harf diskriminasyonu.

KURAL: Sadece geçerli JSON döndür. Konuşma, açıklama yapma.
Her üretimde 'targetedErrors' (örn: ['visual_reversal', 'attention_lapse']) ve 'cognitiveGoal' alanlarını KESİNLİKLE doldur.
`;

const generateDirectly = async (params: { 
    prompt: string, 
    schema: any, 
    model?: string, 
    image?: string, 
    mimeType?: string,
    useSearch?: boolean,
    isOcr?: boolean
}) => {
    // Fix: Initialization using process.env.API_KEY directly as per guidelines
    if (!process.env.API_KEY) throw new Error("API Anahtarı eksik.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const modelName = params.model || DEFAULT_MODEL;
    
    let parts: any[] = [];
    if (params.image) {
        parts.push({ 
            inlineData: { 
                mimeType: params.mimeType || 'image/jpeg', 
                data: params.image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "") 
            } 
        });
    }
    parts.push({ text: params.prompt });

    const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: params.schema,
        temperature: 0.1, // Daha tutarlı JSON için sıcaklığı düşürdüm
    };

    // OCR görevlerinde düşünme bütçesini kapatmıyoruz, modelin görseli "anlaması" gerek.
    // Sadece standart metin görevlerinde 0 yapıyoruz.
    if (!params.isOcr) {
        config.thinkingConfig = { thinkingBudget: 0 };
    }

    if (params.useSearch) config.tools = [{ googleSearch: {} }];

    // Fix: Updated contents structure to object format
    const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: config
    });
    
    // Fix: Use text property directly (not calling it)
    if (response.text) return tryRepairJson(response.text);
    throw new Error("Boş yanıt alındı.");
};

export const generateWithSchema = async (prompt: string, schema: any, model?: string, useSearch?: boolean) => {
    const targetModel = model || DEFAULT_MODEL;
    return await generateDirectly({ prompt, schema, model: targetModel, useSearch, isOcr: false });
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

export const generateNanoImage = async (prompt: string): Promise<string | null> => {
    // Fix: Initialization using process.env.API_KEY directly as per guidelines
    if (!process.env.API_KEY) return null;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        // Fix: Updated contents structure
        const response = await ai.models
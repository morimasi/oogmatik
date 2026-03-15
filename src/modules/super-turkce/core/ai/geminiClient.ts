import { GoogleGenAI, Type, Schema } from '@google/genai';

// Singleton instance
let aiClient: any = null;

const getClient = () => {
    if (!aiClient) {
        // VITE_GEMINI_API_KEY environment variable'dan alınır
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            console.error('CRITICAL: VITE_GEMINI_API_KEY bulunamadı!');
            return null;
        }
        aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
};

// Pedagojik hedefe özel Sistem Komutları (System Instructions)
const AI_PERSONA = `
Sen Türkiye Cumhuriyeti MEB (Milli Eğitim Bakanlığı) müfredatına tam hakim, 
uzman bir Türkçe sınıf öğretmeni, özel eğitim uzmanı ve pedagogsundur.
Görevin, okuma anlama, dil bilgisi ve mantık etkinlikleri üretmektir.
Çıktıların daima katı bir JSON objesi olmak zorundadır. Asla JSON dışında (markdown vs) metin ekleme.
Vertebileceğin tüm içeriklerin öğrencilerin gelişim düzeyine %100 uygun olduğundan emin ol.
`;

const AUDIENCE_RULES = {
    normal: '',
    hafif_disleksi: '\nDİKKAT: Öğrenciler hafif disleksili. Cümleleri çok uzun tutma. Karmaşık dolaylı anlatımlardan kaçın. Net ve somut ifadeler kullan.',
    derin_disleksi: '\nKRİTİK DİKKAT: Öğrenciler DERİN DİSLEKSİ tanılıdır. Cümleler en fazla 5-6 kelime olmalı. Asla soyut kavram kullanma. Çok basit, %100 somut, tek yargı bildiren kısa yönergeler oluştur. Eşsesli ve benzer sesli kelimeleri yan yana kullanma.'
};

/**
 * Gemini'ye doğrudan Prompt gönderip Yapılandırılmış JSON verisi alır.
 */
export const generateActivityWithGemini = async (
    prompt: string,
    audience: 'normal' | 'hafif_disleksi' | 'derin_disleksi' = 'normal',
    formatId: string
): Promise<any> => {
    const client = getClient();
    if (!client) {
        throw new Error('Gemini API Error: API Key is missing. Check your .env file.');
    }

    const systemInstruction = AI_PERSONA + AUDIENCE_RULES[audience];

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json',
                temperature: 0.7, // Sabit ve öngörülebilir ama yaratıcı içerik
            }
        });

        const textResponse = response.text();
        if (!textResponse) {
            throw new Error('Gemini boş yanıt döndürdü.');
        }

        // Gemini JSON mimetype set edildiği için textResponse doğrudan parse edilebilir
        const parsedJson = JSON.parse(textResponse);
        return parsedJson;

    } catch (error: any) {
        console.error(`Gemini Activity Generation Failed for Format ${formatId}:`, error);
        throw new Error(`Yapay Zeka üretiminde hata: ${error.message || 'Bilinmeyen Hata'}`);
    }
};

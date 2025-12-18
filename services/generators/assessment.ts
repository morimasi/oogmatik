
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { AdaptiveQuestion, TestCategory } from '../../types';
import { PEDAGOGICAL_BASE } from './prompts';

export const generateAdaptiveQuestionsFromAI = async (
    skills: TestCategory[], 
    countPerSkill: number = 3
): Promise<Record<string, AdaptiveQuestion[]>> => {
    
    // Construct a prompt that asks for questions across selected skills
    // We ask for a mix of difficulties (1=Easy, 3=Medium, 5=Hard)
    const prompt = `
    ${PEDAGOGICAL_PROMPT_ASSESSMENT}
    
    GÖREV: Aşağıdaki beceri alanları için Çoktan Seçmeli Adaptif Test Soruları üret.
    
    BECERİLER: ${skills.join(', ')}.
    HER BECERİ İÇİN SORU SAYISI: ${countPerSkill}.
    
    DAĞILIM:
    - Sorular 1 (Kolay) ile 5 (Çok Zor) arasında zorluk seviyelerine sahip olmalıdır.
    - Her beceri için: 1 Kolay, 1 Orta, 1 Zor soru üret (eğer sayı 3 ise).
    
    KRİTİK GEREKSİNİM (HATA ANALİZİ):
    - "errorTags" alanı ZORUNLUDUR.
    - Yanlış cevaplar (çeldiriciler) rastgele olmamalıdır.
    - Her yanlış şık, belirli bir bilişsel hatayı temsil etmelidir.
    - Örn: "b" yerine "d" seçildiyse -> "reversal_error".
    - Örn: "5+2=7" yerine "10" seçildiyse (5*2) -> "operation_confusion".
    
    ÇIKTI FORMATI:
    JSON nesnesi döndür. Anahtarlar beceri isimleri (linguistic, math, etc.), değerler soru listesi olmalıdır.
    `;

    const questionSchema = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING }, // Use a temp ID, will be overwritten
            text: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correct: { type: Type.STRING },
            difficulty: { type: Type.INTEGER },
            skill: { type: Type.STRING },
            subSkill: { type: Type.STRING },
            errorTags: { 
                type: Type.OBJECT,
                description: "Map of Option Text to Error Tag Key (e.g., {'d': 'reversal_error'})",
                nullable: true 
            } 
        },
        required: ['text', 'options', 'correct', 'difficulty', 'skill', 'errorTags']
    };

    const schema = {
        type: Type.OBJECT,
        properties: skills.reduce((acc, skill) => {
            acc[skill] = { type: Type.ARRAY, items: questionSchema };
            return acc;
        }, {} as any)
    };

    try {
        const rawData = await generateWithSchema(prompt, schema);
        // Post-process to ensure IDs and structure
        const result: Record<string, AdaptiveQuestion[]> = {};
        
        Object.keys(rawData).forEach(key => {
            if (skills.includes(key as any)) {
                result[key] = rawData[key].map((q: any, idx: number) => ({
                    ...q,
                    id: `${key}_ai_${Date.now()}_${idx}`,
                    skill: key // Enforce consistency
                }));
            }
        });
        
        return result;
    } catch (error) {
        console.error("AI Assessment Generation Failed:", error);
        throw error; // Let the service handle fallback
    }
};

const PEDAGOGICAL_PROMPT_ASSESSMENT = `
[ROL: UZMAN PSİKOMETRİST VE ÖZEL EĞİTİM UZMANI]

Sen, çocukların bilişsel becerilerini (Dikkat, Hafıza, Görsel Algı, Mantık, Sözel) ölçen akıllı bir test motorusun.
Soruların "Eğlenceli ama Tanısal" olmalı.

HATA ETİKETLERİ (errorTags) KILAVUZU:
Yanlış cevaplar için aşağıdaki etiketleri kullan (Türkçe veya İngilizce kod):
- visual_discrimination (Görsel ayrım hatası)
- reversal_error (Ters çevirme: b/d, 6/9)
- sequencing_error (Sıralama hatası)
- attention_lapse (Dikkat eksikliği / Rastgele)
- auditory_confusion (İşitsel benzerlik)
- working_memory (İşleyen bellek yetersizliği)
- logic_error (Mantık hatası)
- impulsivity (Dürtüsellik / Çeldiriciye atlama)
`;

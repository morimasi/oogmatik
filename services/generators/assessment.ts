
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { AdaptiveQuestion, TestCategory, Student } from '../../types';
import { PEDAGOGICAL_BASE } from './prompts';

export const generateAdaptiveQuestionsFromAI = async (
    skills: TestCategory[], 
    countPerSkill: number = 3,
    student?: Student // Added student context
): Promise<Record<string, AdaptiveQuestion[]>> => {
    
    const studentContext = student ? `
    ÖĞRENCİ BİLGİSİ:
    - Tanı: ${student.diagnosis?.join(', ') || 'Belirtilmemiş'}
    - Destek İhtiyaçları: ${student.weaknesses?.join(', ') || 'Genel'}
    - İlgi Alanları: ${student.interests?.join(', ') || 'Genel'}
    ` : '';

    const prompt = `
    ${PEDAGOGICAL_PROMPT_ASSESSMENT}
    
    ${studentContext}

    GÖREV: Yukarıdaki öğrenci profiline UYGUN seviyede ve ilgi çekici Çoktan Seçmeli Adaptif Test Soruları üret.
    
    BECERİLER: ${skills.join(', ')}.
    HER BECERİ İÇİN SORU SAYISI: ${countPerSkill}.
    
    DAĞILIM:
    - Sorular 1 (Kolay) ile 5 (Çok Zor) arasında zorluk seviyelerine sahip olmalıdır.
    - Her beceri için: 1 Kolay, 1 Orta, 1 Zor soru üret.
    
    KRİTİK GEREKSİNİM (HATA ANALİZİ):
    - "errorTags" alanı ZORUNLUDUR.
    - Yanlış cevaplar (çeldiriciler) rastgele olmamalıdır.
    - Her yanlış şık, belirli bir bilişsel hatayı temsil etmelidir.
    - Örn: "b" yerine "d" seçildiyse -> "reversal_error".
    
    ÇIKTI FORMATI:
    JSON nesnesi döndür. Anahtarlar beceri isimleri olmalıdır.
    `;

    const questionSchema = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            text: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correct: { type: Type.STRING },
            difficulty: { type: Type.INTEGER },
            skill: { type: Type.STRING },
            subSkill: { type: Type.STRING },
            errorTags: { 
                type: Type.OBJECT,
                description: "Map of Option Text to Error Tag Key",
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
        const result: Record<string, AdaptiveQuestion[]> = {};
        
        Object.keys(rawData).forEach(key => {
            if (skills.includes(key as any)) {
                result[key] = rawData[key].map((q: any, idx: number) => ({
                    ...q,
                    id: `${key}_ai_${Date.now()}_${idx}`,
                    skill: key 
                }));
            }
        });
        
        return result;
    } catch (error) {
        console.error("AI Assessment Generation Failed:", error);
        throw error; 
    }
};

const PEDAGOGICAL_PROMPT_ASSESSMENT = `
[ROL: UZMAN PSİKOMETRİST VE ÖZEL EĞİTİM UZMANI]
Sen, çocukların bilişsel becerilerini ölçen akıllı bir test motorusun.
Soruların "Eğlenceli ama Tanısal" olmalı.

HATA ETİKETLERİ (errorTags) KILAVUZU:
Yanlış cevaplar için aşağıdaki etiketleri kullan:
- visual_discrimination (Görsel ayrım hatası)
- reversal_error (Ters çevirme: b/d, 6/9)
- sequencing_error (Sıralama hatası)
- attention_lapse (Dikkat eksikliği)
- impulsivity (Dürtüsellik)
`;

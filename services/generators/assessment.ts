
<<<<<<< HEAD
import { generateWithSchema } from '../geminiClient.js';
import { AdaptiveQuestion, TestCategory, Student } from '../../types.js';
import { PEDAGOGICAL_BASE } from './prompts.js';

export const generateAdaptiveQuestionsFromAI = async (
    skills: TestCategory[],
    countPerSkill: number = 3,
    student?: Student // Added student context
): Promise<Record<string, AdaptiveQuestion[]>> => {

=======
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { AdaptiveQuestion, TestCategory, Student } from '../../types';
import { PEDAGOGICAL_BASE } from './prompts';

export const generateAdaptiveQuestionsFromAI = async (
    skills: TestCategory[], 
    countPerSkill: number = 3,
    student?: Student // Added student context
): Promise<Record<string, AdaptiveQuestion[]>> => {
    
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
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
<<<<<<< HEAD
        type: 'OBJECT',
        properties: {
            id: { type: 'STRING' },
            text: { type: 'STRING' },
            options: { type: 'ARRAY', items: { type: 'STRING' } },
            correct: { type: 'STRING' },
            difficulty: { type: 'INTEGER' },
            skill: { type: 'STRING' },
            subSkill: { type: 'STRING' },
            errorTags: {
                type: 'OBJECT',
                description: "Map of Option Text to Error Tag Key",
                nullable: true
            }
=======
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
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
        },
        required: ['text', 'options', 'correct', 'difficulty', 'skill', 'errorTags']
    };

    const schema = {
<<<<<<< HEAD
        type: 'OBJECT',
        properties: skills.reduce((acc, skill) => {
            acc[skill] = { type: 'ARRAY', items: questionSchema };
=======
        type: Type.OBJECT,
        properties: skills.reduce((acc, skill) => {
            acc[skill] = { type: Type.ARRAY, items: questionSchema };
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
            return acc;
        }, {} as any)
    };

    try {
        const rawData = await generateWithSchema(prompt, schema);
        const result: Record<string, AdaptiveQuestion[]> = {};
<<<<<<< HEAD

=======
        
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
        Object.keys(rawData).forEach(key => {
            if (skills.includes(key as any)) {
                result[key] = rawData[key].map((q: any, idx: number) => ({
                    ...q,
                    id: `${key}_ai_${Date.now()}_${idx}`,
<<<<<<< HEAD
                    skill: key
                }));
            }
        });

        return result;
    } catch (error) {
        console.error("AI Assessment Generation Failed:", error);
        throw error;
=======
                    skill: key 
                }));
            }
        });
        
        return result;
    } catch (error) {
        console.error("AI Assessment Generation Failed:", error);
        throw error; 
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
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

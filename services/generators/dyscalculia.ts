
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, 
    NumberSenseData, VisualArithmeticData, SpatialGridData, ConceptMatchData, EstimationData,
    RealLifeProblemData, ActivityType, MathMemoryCardsData
} from '../../types';
import { getMathPrompt } from './prompts';

const PEDAGOGICAL_PROMPT = `
[ROL: KIDEMLİ ÖZEL EĞİTİM UZMANI]
Diskalkuli destekli materyal üret. Sadece JSON döndür.
`;

export const generateNumberSenseFromAI = async (options: GeneratorOptions): Promise<NumberSenseData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Sayı Hissi etkinliği üret. Seviye: ${difficulty}. ${PEDAGOGICAL_PROMPT}`;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                layout: { type: Type.STRING },
                exercises: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING },
                            values: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                            target: { type: Type.NUMBER },
                            visualType: { type: Type.STRING }
                        },
                        required: ['type', 'values']
                    }
                }
            },
            required: ['title', 'instruction', 'exercises']
        }
    };
    return generateWithSchema(prompt, schema);
};

export const generateMathMemoryCardsFromAI = async (options: GeneratorOptions): Promise<MathMemoryCardsData[]> => {
    const { difficulty, itemCount, variant, selectedOperations, studentContext } = options;
    
    const rule = `
    [GÖREV: MATEMATİK HAFIZA KARTLARI ÜRET]
    ZORLUK: ${difficulty}
    TOPLAM KART SAYISI: ${itemCount || 16}
    EŞLEŞTİRME MODU: ${variant} (op-res: İşlem-Sonuç, vis-num: Görsel-Rakam, eq-eq: Denk İşlemler)
    KULLANILACAK İŞLEMLER: ${selectedOperations?.join(', ') || 'Toplama, Çıkarma'}

    TASARIM KURALLARI:
    1. Bir sayfada tam olarak ${itemCount || 16} kart olsun. 
    2. 'cards' dizisinde her öğe bir karttır. 'pairId' alanı aynı olan iki kart birbirinin eşidir.
    3. 'vis-num' modunda kartlardan biri mutlaka 'visual' tipinde olmalı ve 'visualType' belirtilmelidir (ten-frame, blocks, dice).
    4. Sayılar ve işlemler zorluk seviyesine uygun olmalıdır.
    
    ÇIKTI: JSON formatında, A4 sayfasını dolduracak şekilde 'cards' dizisi döndür.
    `;

    const prompt = getMathPrompt("Matematik Hafıza Atölyesi", difficulty, rule, studentContext);

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                cards: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            pairId: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['operation', 'number', 'visual', 'text'] },
                            content: { type: Type.STRING },
                            visualType: { type: Type.STRING, nullable: true },
                            numValue: { type: Type.NUMBER }
                        },
                        required: ['id', 'pairId', 'type', 'content', 'numValue']
                    }
                }
            },
            required: ['title', 'instruction', 'cards']
        }
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

export const generateRealLifeMathProblemsFromAI = async (options: GeneratorOptions): Promise<RealLifeProblemData[]> => {
    const { topic, difficulty } = options;
    const prompt = `Günlük yaşam matematik problemleri üret. Konu: ${topic}, Zorluk: ${difficulty}. ${PEDAGOGICAL_PROMPT}`;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                problems: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            solution: { type: Type.STRING }
                        },
                        required: ['text', 'solution']
                    }
                }
            },
            required: ['title', 'problems']
        }
    };
    return generateWithSchema(prompt, schema);
};

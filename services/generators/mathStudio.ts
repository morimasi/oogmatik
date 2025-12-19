
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { MathStudioConfig } from '../../types';

export const generateMathProblemsAI = async (config: MathStudioConfig) => {
    const prompt = `
    [ROL: ÜST DÜZEY MATEMATİK ÖĞRETİM TASARIMCISI]
    GÖREV: ${config.gradeLevel} seviyesinde, "${config.problemConfig.topic}" temalı, ${config.problemConfig.count} adet matematik problemi üret.
    
    KURALLAR:
    1. İşlem Sayısı: Her problem ${config.problemConfig.steps} aşamalı/işlemli olmalı.
    2. İşlem Türleri: Sadece şu işlemleri kullan: ${config.operations.join(', ')}.
    3. Dil: Disleksi dostu, kısa ve net cümleler. Karmaşık bağlaçlardan kaçın.
    4. Sayılar: ${config.gradeLevel} seviyesine uygun büyüklükte sayılar seç.
    
    ÇIKTI (JSON):
    {
        "problems": [
            {
                "text": "Problem metni buraya...",
                "steps": ["1. işlem açıklaması", "2. işlem açıklaması"],
                "answer": "Cevap",
                "hint": "İpucu (Gerekirse)"
            }
        ]
    }
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            problems: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.STRING },
                        hint: { type: Type.STRING }
                    },
                    required: ['text', 'answer']
                }
            }
        },
        required: ['problems']
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-pro-preview');
};

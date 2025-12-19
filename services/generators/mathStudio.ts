
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { MathStudioConfig, MathStudioData } from '../../types';

export const generateMathProblemsAI = async (config: MathStudioConfig): Promise<MathStudioData> => {
    const prompt = `
    [ROL: ÜST DÜZEY MATEMATİK ÖĞRETİM TASARIMCISI]
    GÖREV: İlköğretim seviyesinde matematik çalışma sayfası içeriği üret.
    
    ÖĞRENCİ: ${config.studentName} (${config.gradeLevel})
    İŞLEM TÜRLERİ: ${config.operations.join(', ')}
    PROBLEM AYARLARI: ${config.includeProblems ? `${config.problemCount} adet, ${config.problemSteps} işlemli, Konu: ${config.problemTopic}` : 'Problem istemiyorum.'}
    
    ÖZEL KURALLAR:
    - Sözel problemler Primary School seviyesinde, anlaşılır ve disleksi dostu (kısa cümleler) olmalı.
    - Problemlerin çözümünde seçilen işlem türleri kullanılmalı.
    
    ÇIKTI: JSON formatında.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            instruction: { type: Type.STRING },
            problems: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        answer: { type: Type.NUMBER },
                        steps: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['text', 'answer']
                }
            }
        },
        required: ['title', 'problems']
    };

    // Cast response to correct type intersection
    const result = await generateWithSchema(prompt, schema);
    return result as any; // Cast to MathStudioData
};

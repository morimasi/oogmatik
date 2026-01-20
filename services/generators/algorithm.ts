
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, AlgorithmData } from '../../types';
import { getStudentContextPrompt, PEDAGOGICAL_BASE, IMAGE_GENERATION_GUIDE } from './prompts';

export const generateAlgorithmGeneratorFromAI = async (options: GeneratorOptions): Promise<AlgorithmData[]> => {
    const { topic, difficulty, studentContext } = options;

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(studentContext)}
    
    GÖREV: Disleksi dostu "Sıralı Mantık Algoritması" üret.
    KONU: "${topic || 'Günlük Yaşam Mantığı'}"
    ZORLUK: ${difficulty}

    KURALLAR:
    - Bir "Challenge" senaryosu belirle (Örn: Çay demleme, Karşıdan karşıya geçme).
    - Çözüm için 5-8 arası mantıklı adım oluştur.
    - Mutlaka 1 adet 'decision' (Karar) adımı ekle.
    - Adım tipleri: 'start', 'process', 'decision', 'input', 'output', 'end'.

    ${IMAGE_GENERATION_GUIDE}
    ÇIKTI: JSON Dizisi.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                challenge: { type: Type.STRING },
                steps: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.INTEGER },
                            type: { type: Type.STRING, enum: ['start', 'process', 'decision', 'input', 'output', 'end'] },
                            text: { type: Type.STRING }
                        },
                        required: ['id', 'type', 'text']
                    }
                }
            },
            required: ['title', 'steps', 'challenge']
        }
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

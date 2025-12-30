
import { Type } from "@google/genai";
import { generateWithSchema, analyzeImage } from '../geminiClient';
import { GeneratorOptions, AlgorithmData } from '../../types';
import { getStudentContextPrompt, PEDAGOGICAL_BASE, IMAGE_GENERATION_GUIDE } from './prompts';

/**
 * Generates an Algorithm Flowchart worksheet.
 * Supports Multimodal analysis using gemini-3-flash-preview.
 */
export const generateAlgorithmGeneratorFromAI = async (options: GeneratorOptions): Promise<AlgorithmData[]> => {
    const { topic, difficulty, worksheetCount, studentContext, customInput } = options;
    
    // Check if we have an image to clone from (Multimodal Mode)
    const sourceImage = typeof customInput === 'string' && customInput.startsWith('data:image') ? customInput : null;

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(studentContext)}
    
    KONU: "${topic || 'Günlük Hayat Mantığı'}"
    ZORLUK: ${difficulty}
    
    ${sourceImage ? '[ÖNEMLİ]: Ekteki görseldeki mantıksal akış şemasını ve problem çözüm adımlarını analiz et. Bu mantığı kullanarak tamamen yeni verilerle disleksi dostu bir algoritma üret.' : 'Yeni bir problem senaryosu üzerinden sıralı mantık algoritması üret.'}

    TASARIM KURALLARI:
    - Bir problem senaryosu (challenge) belirle.
    - Adım adım bir çözüm süreci tasarla (Min 5, Max 8 adım).
    - Mutlaka bir karar noktası (decision) ekle.
    
    ADIM TİPLERİ:
    - 'start': Başlangıç
    - 'process': Eylem adımı
    - 'decision': Koşullu ayrım (Evet/Hayır)
    - 'input': Bilgi girişi
    - 'output': Bilgi çıkışı
    - 'end': Sonuç
    
    ${IMAGE_GENERATION_GUIDE}

    ÇIKTI: JSON formatında bir dizi (array).
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
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

    if (sourceImage) {
        return await analyzeImage(sourceImage, prompt, schema, 'gemini-3-flash-preview') as unknown as AlgorithmData[];
    }

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

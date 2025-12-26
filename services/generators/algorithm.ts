
import { Type } from "@google/genai";
import { generateWithSchema, analyzeImage } from '../geminiClient';
import { GeneratorOptions, AlgorithmData } from '../../types';
import { getStudentContextPrompt, PEDAGOGICAL_BASE, IMAGE_GENERATION_GUIDE } from './prompts';

/**
 * Generates an Algorithm Flowchart worksheet.
 * Supports Multimodal analysis if an image is provided in options.
 */
export const generateAlgorithmGeneratorFromAI = async (options: GeneratorOptions): Promise<AlgorithmData[]> => {
    const { topic, difficulty, worksheetCount, studentContext, customInput } = options;
    
    // Check if we have an image to clone from
    const sourceImage = typeof customInput === 'string' && customInput.startsWith('data:image') ? customInput : null;

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(studentContext)}
    
    KONU: "${topic || 'Günlük Yaşam'}"
    ZORLUK: ${difficulty}
    
    ${sourceImage ? '[ÖNEMLİ]: Ekteki görseldeki mantıksal akışı analiz et ve onu modern, çocuk dostu bir algoritmaya dönüştür.' : ''}

    GÖREV: Çocuklar için sıralı mantık ve problem çözmeyi öğreten bir AKIŞ ŞEMASI (Algorithm Flowchart) oluştur.
    - Bir problem senaryosu belirle (Örn: Çay demleme, okula gitme, hata düzeltme). 
    - Öğrencinin ilgi alanları varsa senaryoyu ona göre kurgula.
    - Adım adım bir süreç tasarla.
    - Karar noktaları (Evet/Hayır) ekle.
    
    ADIM TİPLERİ:
    - 'start': Başlangıç (Oval)
    - 'process': Eylem (Dikdörtgen)
    - 'decision': Karar (Baklava Dilimi)
    - 'input': Giriş
    - 'output': Çıktı
    - 'end': Bitiş
    
    ${IMAGE_GENERATION_GUIDE}

    ÇIKTI: JSON formatında bir dizi (array) döndür. Her eleman bir çalışma sayfası verisi olmalıdır.
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
                            text: { type: Type.STRING },
                            next: { type: Type.INTEGER },
                            yes: { type: Type.INTEGER },
                            no: { type: Type.INTEGER }
                        },
                        required: ['id', 'type', 'text']
                    }
                }
            },
            required: ['title', 'steps', 'challenge', 'instruction', 'pedagogicalNote', 'imagePrompt']
        }
    };

    if (sourceImage) {
        return await analyzeImage(sourceImage, prompt, schema, 'gemini-3-flash-preview') as unknown as AlgorithmData[];
    }

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

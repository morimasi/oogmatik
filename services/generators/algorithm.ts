
import { Type } from "@google/genai";
import { generateWithSchema, analyzeImage } from '../geminiClient';
import { GeneratorOptions, AlgorithmData } from '../../types';
import { getStudentContextPrompt, PEDAGOGICAL_BASE, IMAGE_GENERATION_GUIDE } from './prompts';

/**
 * Algoritma Akış Şeması üreticisi.
 * Multimodal analiz desteği ile (gemini-3-flash-preview) görselden mantık klonlayabilir.
 */
export const generateAlgorithmGeneratorFromAI = async (options: GeneratorOptions): Promise<AlgorithmData[]> => {
    const { topic, difficulty, worksheetCount, studentContext, customInput } = options;
    
    // Eğer bir görsel yüklenmişse (OCR Modu), multimodal analizi tetikle
    const sourceImage = typeof customInput === 'string' && customInput.startsWith('data:image') ? customInput : null;

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(studentContext)}
    
    KONU: "${topic || 'Günlük Yaşam Mantığı'}"
    ZORLUK: ${difficulty}
    
    ${sourceImage ? '[ÖNEMLİ]: Ekteki görseldeki mantıksal akış şemasını ve problem çözüm adımlarını analiz et. Bu mantığı kullanarak tamamen yeni verilerle disleksi dostu bir algoritma üret.' : 'Yeni bir problem senaryosu üzerinden sıralı mantık algoritması üret.'}

    MİMARİ KURALLAR:
    - Bir "Challenge" (Zorluk) senaryosu belirle.
    - Adım adım bir çözüm süreci tasarla (Min 5, Max 9 adım).
    - Mutlaka en az 1 adet 'decision' (karar/ayrım) noktası ekle.
    - Adımlar mantıksal olarak birbirini izlemeli.
    
    ADIM TİPLERİ:
    - 'start': Başlangıç noktası (Yeşil tonlu).
    - 'process': Aksiyon/Eylem adımı.
    - 'decision': Mantıksal ayrım (Evet/Hayır dallanması).
    - 'input': Kullanıcıdan veri girişi istenen adım.
    - 'output': Sonucun alındığı adım.
    - 'end': Bitiş noktası (Kırmızı tonlu).
    
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
            required: ['title', 'steps', 'challenge', 'instruction']
        }
    };

    if (sourceImage) {
        return await analyzeImage(sourceImage, prompt, schema, 'gemini-3-flash-preview') as unknown as AlgorithmData[];
    }

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

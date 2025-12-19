
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, AlgorithmData } from '../../types';

export const generateAlgorithmGeneratorFromAI = async (options: GeneratorOptions): Promise<AlgorithmData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    
    const prompt = `
    [ROL: BİLİŞSEL GELİŞİM VE ALGORİTMİK DÜŞÜNCE UZMANI]
    KONU: "${topic || 'Günlük Yaşam'}"
    ZORLUK: ${difficulty}
    
    GÖREV: Çocuklar için sıralı mantık ve problem çözmeyi öğreten bir AKIŞ ŞEMASI (Algorithm Flowchart) oluştur.
    - Bir problem belirle (Örn: Çay demleme, okula gitme, hata düzeltme).
    - Adım adım bir süreç tasarla.
    - Karar noktaları (Evet/Hayır) ekle.
    
    ADIM TİPLERİ:
    - 'start': Başlangıç (Oval)
    - 'process': Eylem (Dikdörtgen)
    - 'decision': Karar (Baklava Dilimi)
    - 'input': Giriş
    - 'output': Çıktı
    - 'end': Bitiş
    
    ÇIKTI: JSON formatında.
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
            required: ['title', 'steps', 'challenge']
        }
    };

    return await generateWithSchema(prompt, schema);
};

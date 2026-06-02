/**
 * AI Generator for NOKTA (Dot Placement) Module
 * Unique content generation with generationSeed
 */

import { generateWithSchema } from '../../geminiClient.js';
import { GeneratorOptions } from '../../../types.js';

export const generateNoktaFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { topic, difficulty, worksheetCount, ageGroup } = options;
    
    // UNIQUE CONTENT GENERATION
    const generationSeed = Date.now() + Math.random();
    
    const prompt = `
    "${difficulty}" seviyesinde, '${topic}' temalı NOKTA okuma materyali üret.
    
    ⚠️ KRİTİK: HER ÜRETİMDE BENZERSİZ İÇERİK!
    - Rastgelelik tohumu: ${generationSeed}
    - Farklı kelimeler, farklı düzenler
    - Yaş grubu: ${ageGroup || '8-10 yaş'}
    
    NOKTA NEDİR?
    - Kelimelerin veya hecelerin altında noktalar gösterilir
    - Okuma hızını ve kelime tanımayı geliştirir
    - Görsel dikkat ve odaklanma becerilerini artırır
    
    GÖREV:
    1. Yaşa uygun 100-200 kelimelik özgün metin yaz
    2. Her kelimenin altına nokta yerleştir
    3. Nokta sıklığı ve stilini belirle
    
    ${worksheetCount || 1} adet üret.
    `;
    
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING', description: 'Etkinlik başlığı' },
            instruction: { type: 'STRING', description: 'Öğrenciye verilen yönerge' },
            text: { type: 'STRING', description: 'Noktalı okuma metni' },
            words: {
                type: 'ARRAY',
                description: 'Nokta yerleşimli kelimeler',
                items: {
                    type: 'OBJECT',
                    properties: {
                        word: { type: 'STRING', description: 'Kelime metni' },
                        hasDot: { type: 'BOOLEAN', description: 'Altında nokta var mı?' },
                        dotPosition: { type: 'INTEGER', description: 'Nokta konumu (karakter sırası)' }
                    },
                    required: ['word', 'hasDot']
                }
            },
            dotPlacement: { type: 'STRING', description: 'Nokta yerleşim düzeyi', enum: ['kelime', 'hece'] },
            dotDensity: { type: 'INTEGER', description: 'Nokta yoğunluğu (1-10)' },
            dotStyle: { type: 'STRING', description: 'Nokta görsel stili', enum: ['yuvarlak', 'kare', 'elips'] }
        },
        required: ['title', 'instruction', 'text', 'words']
    };
    
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<any[]>;
};

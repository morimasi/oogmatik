/**
 * AI Generator for PENCERE (Window Reading) Module
 * Unique content generation with generationSeed
 */

import { generateWithSchema } from '../../geminiClient.js';
import { GeneratorOptions } from '../../../types.js';

export const generatePencereFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { topic, difficulty, worksheetCount, ageGroup } = options;
    
    // UNIQUE CONTENT GENERATION
    const generationSeed = Date.now() + Math.random();
    
    const prompt = `
    "${difficulty}" seviyesinde, '${topic}' temalı PENCERE okuma materyali üret.
    
    ⚠️ KRİTİK: HER ÜRETİMDE BENZERSİZ İÇERİK!
    - Rastgelelik tohumu: ${generationSeed}
    - Asla aynı metinleri tekrar etme
    - Yaş grubu: ${ageGroup || '8-10 yaş'}
    
    PENCERE NEDİR?
    - Metin pencere içinde gösterilir
    - Öğrenci pencereyi kaydırarak okur
    - Odaklanma ve görsel izleme becerilerini geliştirir
    
    GÖREV:
    1. Yaşa uygun, konuyla ilgili 150-300 kelimelik özgün metin yaz
    2. Metni 3-5 paragrafa böl
    3. Her paragraf için pencere gösterim ayarları belirle
    
    ${worksheetCount || 1} adet üret.
    `;
    
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            paragraphs: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        text: { type: 'STRING' },
                        windowSize: { type: 'INTEGER' },
                        revealSpeed: { type: 'STRING', enum: ['yavaş', 'orta', 'hızlı'] }
                    },
                    required: ['text', 'windowSize', 'revealSpeed']
                }
            },
            visibilityRatio: { type: 'NUMBER' },
            gridColumns: { type: 'INTEGER' }
        },
        required: ['title', 'instruction', 'paragraphs']
    };
    
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<any[]>;
};

/**
 * AI Generator for ÇİFT METİN (Dual Text) Module
 * Unique content generation with generationSeed
 */

import { generateWithSchema } from '../../geminiClient.js';
import { GeneratorOptions } from '../../../types.js';

export const generateCiftMetinFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { topic, difficulty, worksheetCount, ageGroup } = options;
    
    // UNIQUE CONTENT GENERATION
    const generationSeed = Date.now() + Math.random();
    
    const prompt = `
    "${difficulty}" seviyesinde, '${topic}' temalı ÇİFT METİN okuma materyali üret.
    
    ⚠️ KRİTİK: HER ÜRETİMDE BENZERSİZ İÇERİK!
    - Rastgelelik tohumu: ${generationSeed}
    - İki farklı kaynak, farklı metinler
    - Yaş grubu: ${ageGroup || '8-10 yaş'}
    
    ÇİFT METİN NEDİR?
    - İki farklı metin kaynağı interleaved (karışık) gösterilir
    - Karşılaştırma ve analiz becerisini geliştirir
    - Okuduğunu anlama ve eleştirel düşünceyi artırır
    
    GÖREV:
    1. Aynı konuda iki FARKLI perspektiften metin yaz (100-200 kelime her biri)
    2. Kaynak A ve Kaynak B olarak işaretle
    3. Interleave oranını belirle (kelime/satır/paragraf)
    
    ${worksheetCount || 1} adet üret.
    `;
    
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            sourceA: {
                type: 'OBJECT',
                properties: {
                    title: { type: 'STRING' },
                    text: { type: 'STRING' }
                },
                required: ['title', 'text']
            },
            sourceB: {
                type: 'OBJECT',
                properties: {
                    title: { type: 'STRING' },
                    text: { type: 'STRING' }
                },
                required: ['title', 'text']
            },
            interleaveMode: { type: 'STRING', enum: ['kelime', 'satir', 'paragraf'] },
            interleaveRatio: { type: 'INTEGER' }
        },
        required: ['title', 'instruction', 'sourceA', 'sourceB', 'interleaveMode']
    };
    
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<any[]>;
};

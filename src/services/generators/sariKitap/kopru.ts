/**
 * AI Generator for KÖPRÜ (Bridge Reading) Module
 * Unique content generation with generationSeed
 */

import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions } from '../../types.js';

export const generateKopruFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { topic, difficulty, worksheetCount, ageGroup } = options;
    
    // UNIQUE CONTENT GENERATION
    const generationSeed = Date.now() + Math.random();
    
    const prompt = `
    "${difficulty}" seviyesinde, '${topic}' temalı KÖPRÜ okuma materyali üret.
    
    ⚠️ KRİTİK: HER ÜRETİMDE BENZERSİZ İÇERİK!
    - Rastgelelik tohumu: ${generationSeed}
    - Farklı kelime grupları, farklı köprüler
    - Yaş grubu: ${ageGroup || '8-10 yaş'}
    
    KÖPRÜ NEDİR?
    - Kelimeler veya heceler arasında köprüler gösterilir
    - Akıcı okuma ve kelime gruplarını birleştirme becerisini geliştirir
    - Görsel izleme ve okuma hızını artırır
    
    GÖREV:
    1. Yaşa uygun 120-250 kelimelik özgün metin yaz
    2. Kelimeler arası köprüleme yap
    3. Köprü yüksekliği ve stilini belirle
    
    ${worksheetCount || 1} adet üret.
    `;
    
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            text: { type: 'STRING' },
            wordGroups: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        words: { type: 'ARRAY', items: { type: 'STRING' } },
                        hasBridge: { type: 'BOOLEAN' },
                        bridgeHeight: { type: 'NUMBER' }
                    },
                    required: ['words', 'hasBridge']
                }
            },
            bridgePlacement: { type: 'STRING', enum: ['kelime', 'hece'] },
            bridgeStyle: { type: 'STRING', enum: ['yay', 'düz', 'noktalı'] }
        },
        required: ['title', 'instruction', 'text', 'wordGroups']
    };
    
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<any[]>;
};

/**
 * AI Generator for BELLEK (Memory Game) Module
 * Unique content generation with generationSeed
 */

import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions } from '../../types.js';

export const generateBellekFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { topic, difficulty, worksheetCount, ageGroup } = options;
    
    // UNIQUE CONTENT GENERATION
    const generationSeed = Date.now() + Math.random();
    
    const prompt = `
    "${difficulty}" seviyesinde, '${topic}' temalı BELLEK okuma materyali üret.
    
    ⚠️ KRİTİK: HER ÜRETİMDE BENZERSİZ İÇERİK!
    - Rastgelelik tohumu: ${generationSeed}
    - Farklı kelimeler, farklı boşluklar
    - Yaş grubu: ${ageGroup || '8-10 yaş'}
    
    BELLEK OYUNU NEDİR?
    - Öğrenci önce kelimeleri görür ve ezberler
    - Sonra bazı kelimeler boş bırakılır, öğrenci hatırlamalı
    - Çalışan belleği ve kelime dağarcığını geliştirir
    
    GÖREV:
    1. Yaşa uygun 15-30 kelimelik liste seç (konuyla ilgili)
    2. Aşamalı bellek testi oluştur (4 faz: A, B, C, D)
    3. Her fazda farklı kelime gruplarını boş bırak
    
    ${worksheetCount || 1} adet üret.
    `;
    
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            category: { type: 'STRING' },
            phases: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        phase: { type: 'STRING', enum: ['A', 'B', 'C', 'D'] },
                        studyWords: { type: 'ARRAY', items: { type: 'STRING' } },
                        blankIndices: { type: 'ARRAY', items: { type: 'INTEGER' } },
                        distractors: { type: 'ARRAY', items: { type: 'STRING' } }
                    },
                    required: ['phase', 'studyWords', 'blankIndices']
                }
            },
            blockCount: { type: 'INTEGER' },
            gridColumns: { type: 'INTEGER' }
        },
        required: ['title', 'instruction', 'phases']
    };
    
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<any[]>;
};

/**
 * AI Generator for BELLEK (Memory Game) Module
 * Unique content generation with generationSeed
 */

import { generateWithSchema } from '../../geminiClient.js';
import { GeneratorOptions } from '../../../types.js';
import { getSariKitapPromptTopic } from './shared';

export const generateBellekFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty, worksheetCount, ageGroup } = options;
    const topic = getSariKitapPromptTopic(options as Record<string, unknown>);
    
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
            title: { type: 'STRING', description: 'Etkinlik başlığı' },
            instruction: { type: 'STRING', description: 'Öğrenciye verilen yönerge' },
            category: { type: 'STRING', description: 'Kelime kategorisi' },
            phases: {
                type: 'ARRAY',
                description: 'Bellek aşamaları (A-Çalışma B-Hatırlama C-Karışık D-Cümle)',
                items: {
                    type: 'OBJECT',
                    properties: {
                        phase: { type: 'STRING', description: 'Aşama kodu', enum: ['A', 'B', 'C', 'D'] },
                        studyWords: { type: 'ARRAY', description: 'Ezberlenecek kelimeler', items: { type: 'STRING' } },
                        blankIndices: { type: 'ARRAY', description: 'Boş bırakılacak indisler', items: { type: 'INTEGER' } },
                        distractors: { type: 'ARRAY', description: 'Dikkat dağıtıcı kelimeler', items: { type: 'STRING' } }
                    },
                    required: ['phase', 'studyWords', 'blankIndices']
                }
            },
            blockCount: { type: 'INTEGER', description: 'Kelime blok sayısı' },
            gridColumns: { type: 'INTEGER', description: 'Grid sütun sayısı' }
        },
        required: ['title', 'instruction', 'phases']
    };
    
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<any[]>;
};

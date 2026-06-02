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
            title: { type: 'STRING', description: 'Etkinlik başlığı' },
            instruction: { type: 'STRING', description: 'Öğrenciye verilen yönerge' },
            paragraphs: {
                type: 'ARRAY',
                description: 'Pencere okuma paragrafları',
                items: {
                    type: 'OBJECT',
                    properties: {
                        text: { type: 'STRING', description: 'Paragraf metni' },
                        windowSize: { type: 'INTEGER', description: 'Pencere boyutu (karakter)' },
                        revealSpeed: { type: 'STRING', description: 'Açılma hızı', enum: ['yavaş', 'orta', 'hızlı'] }
                    },
                    required: ['text', 'windowSize', 'revealSpeed']
                }
            },
            visibilityRatio: { type: 'NUMBER', description: 'Görünürlük oranı 0-1' },
            gridColumns: { type: 'INTEGER', description: 'Grid sütun sayısı' }
        },
        required: ['title', 'instruction', 'paragraphs']
    };
    
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<any[]>;
};

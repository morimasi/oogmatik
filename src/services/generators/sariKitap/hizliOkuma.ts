/**
 * AI Generator for HIZLI OKUMA (Serial Word Reading) Module
 * Ultra-premium unique content generation with advanced settings
 */

import { generateWithSchema } from '../../geminiClient.js';
import { GeneratorOptions } from '../../../types.js';

export const generateHizliOkumaFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { topic, difficulty, worksheetCount, ageGroup, customSettings } = options as Record<string, unknown>;
    
    // UNIQUE CONTENT GENERATION
    const generationSeed = Date.now() + Math.random();
    
    // Premium settings
    const settings = customSettings as unknown as any || {};
    const columnMode = settings.columnMode || 'tek';
    const lineSpacing = settings.lineSpacing || 'orta';
    const rhythmicMode = settings.rhythmicMode !== false;
    
    const prompt = `
    "${difficulty}" seviyesinde, "${topic || 'genel'}" temalı HIZLI OKUMA materyali üret.
    
    ⚠️ KRİTİK: HER ÜRETİMDE BENZERSİZ İÇERİK!
    - Rastgelelik tohumu: ${generationSeed}
    - Asla aynı metinleri veya kelime sıralamalarını tekrar etme
    - Yaş grubu: ${ageGroup || '8-10 yaş'}
    
    HIZLI OKUMA NEDİR?
    - Kelimeler satır satır gösterilir
    - Öğrenci hızlıca okumaya çalışır
    - Görsel tarama ve kelime tanıma becerilerini geliştirir
    
    🎯 ZORLUK SEVİYELERİ:
    - easy (Kolay): 2-3 kelimeli satırlar, kısa kelimeler
    - medium (Orta): 3-4 kelimeli satırlar, orta uzunlukta kelimeler
    - hard (Zor): 4-5 kelimeli satırlar, uzun kelimeler
    - expert (Uzman): 5-6 kelimeli satırlar, karmaşık kelimeler
    
    📝 İÇERİK YAPISI:
    1. Başlık: Konuyla ilgili kısa, ilgi çekici başlık
    2. Yönerge: "Satır satır ilerleyerek kelimeleri olabildiğince hızlı okuyun."
    3. Kelime blokları: 
       - Her satırda 2-6 kelime (zorluğa göre)
       - Toplam 20-40 satır
       - Kelimeler yaş grubuna uygun olmalı
       - Anlamlı cümleler oluşturmalı (her satır kendi içinde anlamlı olabilir)
    
    🎨 GÖRSEL AYARLAR:
    - Sütun Modu: ${columnMode === 'cift' ? 'Çift sütun (20 satır x 2)' : 'Tek sütun (30-40 satır)'}
    - Satır Aralığı: ${lineSpacing}
    - Ritmik Mod: ${rhythmicMode ? 'Aktif (her 2. satır farklı arka plan)' : 'Pasif'}
    
    ${worksheetCount || 1} adet üret.
    `;
    
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING', description: 'Etkinlik başlığı' },
            instructions: { type: 'STRING', description: 'Öğrenciye verilen yönerge' },
            wordBlocks: {
                type: 'ARRAY',
                description: 'Hızlı okuma kelime blokları',
                items: {
                    type: 'ARRAY',
                    items: { type: 'STRING' }
                }
            },
            difficulty: { type: 'STRING', description: 'Zorluk seviyesi', enum: ['easy', 'medium', 'hard', 'expert'] },
            columnMode: { type: 'STRING', description: 'Sütun modu', enum: ['tek', 'cift'] },
            lineSpacing: { type: 'STRING', description: 'Satır aralığı', enum: ['sıkı', 'orta', 'geniş'] },
            rhythmicMode: { type: 'BOOLEAN', description: 'Ritmik arka plan aktif?' },
            totalRows: { type: 'INTEGER', description: 'Toplam satır sayısı' }
        },
        required: ['title', 'instructions', 'wordBlocks']
    };
    
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<any[]>;
};

/**
 * AI Generator for HIZLI OKUMA (Serial Word Reading) Module
 * Ultra-premium unique content generation with advanced settings
 */

import { generateWithSchema } from '../../geminiClient.js';
import { GeneratorOptions } from '../../../types.js';
import { getSariKitapPromptTopic } from './shared';

export const generateHizliOkumaFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const {
      difficulty,
      worksheetCount,
      ageGroup,
      wordsPerBlock,
      blockRows,
      showTimer,
      rhythmicMode,
      autoFill,
      columnMode,
      lineSpacing,
    } = options as Record<string, unknown>;
    const topic = getSariKitapPromptTopic(options as Record<string, unknown>);

    // UNIQUE CONTENT GENERATION
    const generationSeed = Date.now() + Math.random();
    
    const effectiveColumnMode = typeof columnMode === 'string' ? columnMode : 'tek';
    const effectiveLineSpacing = typeof lineSpacing === 'string' ? lineSpacing : 'normal';
    const effectiveRhythmicMode = rhythmicMode !== false;
    const effectiveWordsPerBlock = typeof wordsPerBlock === 'number' ? wordsPerBlock : 3;
    const effectiveBlockRows = typeof blockRows === 'number' ? blockRows : 30;
    const effectiveAutoFill = autoFill !== false;
    const effectiveShowTimer = showTimer !== false;

    const prompt = `
    "${difficulty || 'Orta'}" seviyesinde, "${topic}" temalı HIZLI OKUMA materyali üret.
    
    ⚠️ KRİTİK: HER ÜRETİMDE BENZERSİZ İÇERİK!
    - Rastgelelik tohumu: ${generationSeed}
    - Asla aynı metinleri veya kelime sıralamalarını tekrar etme
    - Yaş grubu: ${ageGroup || '8-10 yaş'}
    
    HIZLI OKUMA NEDİR?
    - Kelimeler blok halinde seriyal gösterilir
    - Öğrenci hızlıca okumaya çalışır
    - Görsel tarama ve kelime tanıma becerilerini geliştirir
    
    🎯 SETİNGLER:
    - Satır başına kelime: ${effectiveWordsPerBlock}
    - Satır sayısı: ${effectiveBlockRows}
    - Sütun modu: ${effectiveColumnMode === 'cift' ? 'Çift sütun' : 'Tek sütun'}
    - Satır aralığı: ${effectiveLineSpacing}
    - Zamanlayıcı: ${effectiveShowTimer ? 'Göster' : 'Gizle'}
    - Ritmik mod: ${effectiveRhythmicMode ? 'Aktif' : 'Pasif'}
    - Otomatik doldurma: ${effectiveAutoFill ? 'Açık' : 'Kapalı'}
    
    🎯 ZORLUK SEVİYELERİ:
    - easy (Kolay): 2-3 kelimeli satırlar, kısa kelimeler
    - medium (Orta): 3-4 kelimeli satırlar, orta uzunlukta kelimeler
    - hard (Zor): 4-5 kelimeli satırlar, uzun kelimeler
    - expert (Uzman): 5-6 kelimeli satırlar, karmaşık kelimeler
    
    📝 İÇERİK YAPISI:
    1. Başlık: Konuyla ilgili kısa, ilgi çekici başlık
    2. Yönerge: "Satır satır ilerleyerek kelimeleri olabildiğince hızlı okuyun."
    3. Kelime blokları: 
       - Her satırda ${effectiveWordsPerBlock} kelime
       - Toplam ${effectiveBlockRows} satır
       - Kelimeler yaş grubuna uygun olmalı
       - Anlamlı cümleler oluşturmalı (her satır kendi içinde anlamlı olabilir)
    
    🎨 GÖRSEL AYARLAR:
    - Sütun Modu: ${effectiveColumnMode === 'cift' ? 'Çift sütun (20 satır x 2)' : 'Tek sütun (30-40 satır)'}
    - Satır Aralığı: ${effectiveLineSpacing}
    - Ritmik Mod: ${effectiveRhythmicMode ? 'Aktif (her 2. satır farklı arka plan)' : 'Pasif'}
    - Otomatik Doldurma: ${effectiveAutoFill ? 'Açık' : 'Kapalı'}
    
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

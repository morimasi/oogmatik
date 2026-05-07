/**
 * AI Generator for QUEUE ORDERING (Sıralama/Sıra Alma Becerisi) Module
 * Ultra-professional unique content generation with real difficulty settings
 */

import { generateWithSchema } from '../../geminiClient.js';
import { GeneratorOptions } from '../../../types.js';

export const generateQueueOrderingFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { topic, difficulty, worksheetCount, ageGroup, customSettings } = options;
    
    // UNIQUE CONTENT GENERATION
    const generationSeed = Date.now() + Math.random();
    
    // Location settings - type-safe access
    const settings = customSettings as any || {};
    const locationType = settings.locationType || 'yemekhane';
    const customLocations = settings.customLocations || [];
    const maxQueueSize = settings.maxQueueSize || 10;
    const minQueueSize = settings.minQueueSize || 5;
    const problemCount = settings.problemCount || 4;
    const showVisualClues = settings.showVisualClues !== false;
    const showPositionNumbers = settings.showPositionNumbers !== false;
    
    const prompt = `
    "${difficulty}" zorluk seviyesinde, "${topic || locationType}" temalı SIRA ALMA BECERİSİ (QUEUE ORDERING) problemi üret.
    
    ⚠️ KRİTİK: HER ÜRETİMDE BENZERSİZ İÇERİK!
    - Rastgelelik tohumu: ${generationSeed}
    - Asla aynı senaryoları, isimleri veya sıralamaları tekrar etme
    - Yaş grubu: ${ageGroup || '8-10 yaş'}
    - Zorluk: ${difficulty || 'orta'}
    
    📍 LOKASYON AYARLARI:
    - Varsayılan lokasyon: ${locationType}
    - Özel lokasyonlar: ${customLocations.length > 0 ? JSON.stringify(customLocations) : 'Varsayılan lokasyonları kullan'}
    - Lokasyonlar: Yemekhane, Market Kuyruğu, Otobüs Durağı, Sinema Bilet Gişe, Hastane Poliklinik, Kütüphane
    
    🎯 ZORLUK SEVİYELERİ (Gerçek Zorluk):
    - easy (Kolay): 3-5 kişi, 1-2 ipucu, doğrudan sıralama
    - medium (Orta): 5-7 kişi, 2-3 ipucu, bir adım çıkarım gerektirir
    - hard (Zor): 7-9 kişi, 3-4 ipucu, çoklu çıkarım, karışık referanslar
    - expert (Uzman): 9-${maxQueueSize} kişi, 4-5 ipucu, karmaşık mantık, negatif ifadeler
    
    📝 SENARYO YAPISI:
    1. Lokasyon adı ve toplam kişi sayısı belirtilir
    2. Bazı kişilerin pozisyonları verilir (doğrudan veya dolaylı)
    3. Bir kişinin pozisyonu sorulur (cevap net olmalı)
    4. TÜM bilgiler tutarlı ve tek doğru cevap vermeli
    
    ✍️ İPUCU FORMATLARI:
    - Doğrudan: "Ömer 3. sırada"
    - Göreceli: "Nihanur, Ömer'den 2 sıra sonra"
    - Matematiksel: "Tarık, sondan 3. sırada"
    - Karşılaştırmalı: "Ertuğrul, Kayra'dan önce"
    - Negatif (expert): "Mete, 5. sırada değil"
    
    ⚙️ ÜRETİM PARAMETRELERİ:
    - Soru sayısı: ${problemCount} adet
    - Min kişi: ${minQueueSize}
    - Max kişi: ${maxQueueSize}
    - Görsel ipuçları: ${showVisualClues ? 'EVET' : 'HAYIR'}
    - Pozisyon numaraları: ${showPositionNumbers ? 'EVET' : 'HAYIR'}
    
    ${worksheetCount || 1} adet problem üret.
    `;
    
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            id: { type: 'STRING' },
            locationType: { type: 'STRING', enum: ['yemekhane', 'market', 'otobus', 'sinema', 'hastane', 'kutuphane'] },
            difficulty: { type: 'STRING', enum: ['easy', 'medium', 'hard', 'expert'] },
            problemCount: { type: 'INTEGER' },
            maxQueueSize: { type: 'INTEGER' },
            minQueueSize: { type: 'INTEGER' },
            showVisualClues: { type: 'BOOLEAN' },
            showPositionNumbers: { type: 'BOOLEAN' },
            problems: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        id: { type: 'STRING' },
                        locationId: { type: 'STRING' },
                        locationName: { type: 'STRING' },
                        totalPeople: { type: 'INTEGER' },
                        people: {
                            type: 'ARRAY',
                            items: {
                                type: 'OBJECT',
                                properties: {
                                    id: { type: 'STRING' },
                                    name: { type: 'STRING' },
                                    position: { type: 'INTEGER' },
                                    icon: { type: 'STRING' },
                                    clue: { type: 'STRING' }
                                },
                                required: ['id', 'name', 'position']
                            }
                        },
                        questionPerson: { type: 'STRING' },
                        questionText: { type: 'STRING' },
                        answer: { type: 'INTEGER' },
                        scenario: { type: 'STRING' },
                        difficulty: { type: 'STRING', enum: ['easy', 'medium', 'hard', 'expert'] },
                        steps: { type: 'INTEGER' }
                    },
                    required: ['id', 'locationName', 'totalPeople', 'people', 'questionPerson', 'questionText', 'answer', 'scenario', 'difficulty']
                }
            },
            steps: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        stepNumber: { type: 'INTEGER' },
                        instruction: { type: 'STRING' },
                        hint: { type: 'STRING' }
                    },
                    required: ['stepNumber', 'instruction']
                }
            }
        },
        required: ['problems']
    };
    
    return generateWithSchema(prompt, singleSchema) as Promise<any[]>;
};

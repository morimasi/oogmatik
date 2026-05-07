/**
 * AI Generator for Sarı Kitap Studio Modules
 * Unique content generation for: Pencere, Nokta, Köprü, Çift Metin, Bellek
 */

import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions } from '../../types.js';

// ─── PENCERE MODULE ─────────────────────────────────────────────
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

// ─── NOKTA MODULE ───────────────────────────────────────────────
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
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            text: { type: 'STRING' },
            words: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        word: { type: 'STRING' },
                        hasDot: { type: 'BOOLEAN' },
                        dotPosition: { type: 'INTEGER' }
                    },
                    required: ['word', 'hasDot']
                }
            },
            dotPlacement: { type: 'STRING', enum: ['kelime', 'hece'] },
            dotDensity: { type: 'INTEGER' },
            dotStyle: { type: 'STRING', enum: ['yuvarlak', 'kare', 'elips'] }
        },
        required: ['title', 'instruction', 'text', 'words']
    };
    
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<any[]>;
};

// ─── KÖPRÜ MODULE ───────────────────────────────────────────────
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

// ─── ÇİFT METİN MODULE ──────────────────────────────────────────
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

// ─── BELLEK MODULE ──────────────────────────────────────────────
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

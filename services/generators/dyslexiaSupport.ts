
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, PseudowordReadingData, MorphologicalAnalysisData } from '../../types';
import { getDyslexiaPrompt } from './prompts';

export const generatePseudowordReadingFromAI = async (options: GeneratorOptions): Promise<PseudowordReadingData[]> => {
    const { difficulty, studentContext, variant, itemCount = 24, gridSize = 4, syllableStructure = 'mixed' } = options;
    
    const structureDesc = {
        'basic': 'Sadece KV-KV (paka, tede) yapısında basit heceler.',
        'medium': 'KVK-KV veya KV-KVK (termo, kaban) yapısında orta zorlukta heceler.',
        'hard': 'KKV veya VCC (trapo, alst) yapısında ünsüz öbeği içeren zor heceler.',
        'mixed': 'Tüm hece yapılarının dengeli karışımı.'
    }[syllableStructure];

    const specifics = `
    GÖREV: Profesyonel klinik düzeyde Sözde Kelime (Pseudoword) listesi üret.
    ZORLUK: ${difficulty}.
    ADET: ${itemCount} adet özgün kelime.
    HECE YAPISI: ${structureDesc}
    
    PEDAGOJİK KURALLAR:
    - Kelimeler anlamsız olmalı ama Türkçe fonetik kurallarına (Büyük/Küçük ünlü uyumu) uymalıdır.
    - Disleksi odaklı: Karıştırılan harfleri (b-d, p-q, m-n, u-ü) stratejik olarak kelimelerin içine yerleştir.
    - Tekrardan kaçın, her kelime fonolojik olarak ayırt edici olsun.
    `;

    const prompt = getDyslexiaPrompt("Sözde Kelime Okuma Analizi", difficulty, specifics, studentContext);

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            words: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['title', 'instruction', 'words', 'pedagogicalNote']
    };

    const result = await generateWithSchema(prompt, schema) as any;
    return [{
        ...result,
        visualMode: (variant as any) || 'standard',
        scoringTable: true,
        difficulty: difficulty,
        settings: {
            columns: gridSize,
            itemCount: itemCount,
            fontSize: itemCount > 40 ? 18 : 24
        }
    }];
};

export const generateMorphologicalAnalysisFromAI = async (options: GeneratorOptions): Promise<MorphologicalAnalysisData[]> => {
    const { difficulty, topic, studentContext, visualStyle = 'architect' } = options;
    
    const specifics = `
    GÖREV: Morfolojik Analiz (Kelime Mimarisi) seti üret.
    TEMA: ${topic || 'Genel'}.
    ZORLUK: ${difficulty}.
    
    PEDAGOJİK KURALLAR:
    - Bir "Kök" (Root) seç ve bu kökten türeyen 3-5 adet anlamlı "Gövde" (Derivations) oluştur.
    - Her gövdenin hangi yapım ekiyle oluştuğunu ve kazandığı yeni anlamı açıkla.
    - ${difficulty === 'Uzman' ? 'Soyut ve akademik kökler kullan.' : 'Somut ve günlük kökler kullan.'}
    - Karıştırmaya müsait çeldirici ekler (Distractors) ekle.
    `;

    const prompt = getDyslexiaPrompt("Morfolojik Analiz Atölyesi", difficulty, specifics, studentContext);

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            rootSets: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        root: { type: Type.STRING },
                        meaning: { type: Type.STRING },
                        suffixes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    text: { type: Type.STRING },
                                    function: { type: Type.STRING },
                                    example: { type: Type.STRING }
                                },
                                required: ['text', 'function']
                            }
                        },
                        correctDerivations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    word: { type: Type.STRING },
                                    meaning: { type: Type.STRING }
                                },
                                required: ['word', 'meaning']
                            }
                        },
                        distractors: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['root', 'suffixes', 'correctDerivations']
                }
            }
        },
        required: ['title', 'instruction', 'rootSets', 'pedagogicalNote']
    };

    const result = await generateWithSchema(prompt, schema) as any;
    return [{
        ...result,
        visualStyle: visualStyle as any
    }];
};

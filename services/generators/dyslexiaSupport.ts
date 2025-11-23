
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData } from '../../types';

const PEDAGOGICAL_PROMPT = `
EĞİTİMSEL İÇERİK KURALLARI:
1. Çıktı JSON formatında olmalı.
2. "pedagogicalNote": Etkinliğin hedeflediği disleksi alt tipi (fonolojik, ortografik) ve kazanımı.
3. "instruction": Öğrenciye yönelik motive edici, kısa ve net yönerge.
4. "imagePrompt": Çocuk dostu, yüksek kontrastlı, dikkati odaklayan net bir görsel betimlemesi (İngilizce).
`;

export const generateReadingFlowFromAI = async (options: GeneratorOptions): Promise<ReadingFlowData[]> => {
    const { topic, worksheetCount, difficulty, syllableColorMode, fontStyle } = options;
    const prompt = `
    '${topic}' konulu, "${difficulty}" seviyesinde Akıcı Okuma metni.
    Yazı Tipi Stili: ${fontStyle || 'dyslexic'}.
    Renk Şeması: ${syllableColorMode || 'black-blue'}.
    
    KURALLAR:
    - Metin, hecelere bölünmüş ve her hece belirlenen renk şemasına göre renklendirilmiş olmalı (örn: black-blue için siyah-mavi-siyah...).
    - Cümleler kısa, ritmik ve okuma hızını artırıcı nitelikte olsun.
    - Satır sonlarında kelime bölünmemesine dikkat et.
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            text: {
                type: Type.OBJECT,
                properties: {
                    paragraphs: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                sentences: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            syllables: {
                                                type: Type.ARRAY,
                                                items: {
                                                    type: Type.OBJECT,
                                                    properties: { text: { type: Type.STRING }, color: { type: Type.STRING } },
                                                    required: ['text', 'color']
                                                }
                                            }
                                        },
                                        required: ['syllables']
                                    }
                                }
                            },
                            required: ['sentences']
                        }
                    }
                },
                required: ['paragraphs']
            }
        },
        required: ['title', 'instruction', 'text', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ReadingFlowData[]>;
};

export const generateLetterDiscriminationFromAI = async (options: GeneratorOptions): Promise<LetterDiscriminationData[]> => {
    const { worksheetCount, targetLetters, distractionLevel, itemCount } = options;
    const prompt = `
    Harf Karışıklığı ve Görsel Ayırt Etme Egzersizi.
    Hedef Harfler: ${targetLetters || 'b-d'}.
    Çeldirici Yoğunluğu: %${distractionLevel || 50}.
    Satır Sayısı: ${itemCount || 8}.
    
    KURALLAR:
    - Görsel olarak birbirine çok benzeyen (ayna hayali olan) harfleri karıştır.
    - Hedef harfi (örn: 'b') çeldiricilerin (örn: 'd', 'p', 'q') arasına gizle.
    - Rastgele dağılım yerine, görsel yorgunluğu ölçecek desenler kullan.
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            targetLetters: { type: Type.ARRAY, items: { type: Type.STRING } },
            rows: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        letters: { type: Type.ARRAY, items: { type: Type.STRING } },
                        targetCount: { type: Type.INTEGER }
                    },
                    required: ['letters', 'targetCount']
                }
            }
        },
        required: ['title', 'prompt', 'rows', 'targetLetters', 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<LetterDiscriminationData[]>;
};

export const generateRapidNamingFromAI = async (options: GeneratorOptions): Promise<RapidNamingData[]> => {
    const { type, worksheetCount, targetLetters, gridConfig } = options;
    const lettersPrompt = type === 'letter' && targetLetters ? `Kullanılacak harfler: ${targetLetters}.` : '';
    
    const prompt = `
    Hızlı İsimlendirme (RAN) Testi. Tip: ${type || 'object'}. ${lettersPrompt}
    Izgara Düzeni: ${gridConfig || '5x4'}.
    
    KURALLAR:
    - Seçilen öğeler (renk, sayı, harf, nesne) sık tekrarlanmalı.
    - Nesneler için: Basit, tek heceli kelimelere karşılık gelen görseller seç (örn: el, at, top).
    - Harfler için: Görsel olarak karışanları seç.
    - 'imagePrompt' sadece kapak görseli için değil, nesne türünde her öğe için ikon tanımı olarak kullanılacak.
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['color', 'object', 'number', 'letter'] },
            grid: {
                type: Type.OBJECT,
                properties: {
                    items: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING },
                                value: { type: Type.STRING },
                                label: { type: Type.STRING },
                                imagePrompt: { type: Type.STRING }
                            },
                            required: ['type', 'value', 'label']
                        }
                    }
                },
                required: ['items']
            }
        },
        required: ['title', 'prompt', 'grid', 'type', 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<RapidNamingData[]>;
};

export const generatePhonologicalAwarenessFromAI = async (options: GeneratorOptions): Promise<PhonologicalAwarenessData[]> => {
    const { worksheetCount, difficulty, skillType } = options;
    const prompt = `
    Fonolojik Farkındalık Etkinliği. Odak Beceri: ${skillType || 'syllable'} (hece, kafiye, ilk ses).
    Zorluk: ${difficulty}.
    
    KURALLAR:
    - Eğer Beceri 'rhyme' ise: Kafiyeli kelime çiftlerini bulma soruları.
    - Eğer Beceri 'initial-sound' ise: "Hangi kelime 'A' ile başlar?" gibi sorular.
    - Her soru için net bir görsel (imagePrompt) tanımla.
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            exercises: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['syllable-counting', 'rhyming'] },
                        question: { type: Type.STRING },
                        word: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                        answer: { type: Type.STRING }
                    },
                    required: ['type', 'question', 'word', 'options', 'answer', 'imagePrompt']
                }
            }
        },
        required: ['title', 'prompt', 'exercises', 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<PhonologicalAwarenessData[]>;
};

export const generateMirrorLettersFromAI = async (options: GeneratorOptions): Promise<MirrorLettersData[]> => {
    const { worksheetCount, difficulty, targetPair, rotationMode } = options;
    const prompt = `
    Ayna Harf Savaşçısı (Mirror Letters).
    Hedef Çift: ${targetPair || 'b-d'}.
    Döndürme Modu: ${rotationMode || 'simple'} (simple: sadece ayna, complex: farklı açılar).
    
    KURALLAR:
    - Karışıklık yaratan harfleri (b, d, p, q) farklı yönlerde (döndürülmüş, ters çevrilmiş) sun.
    - Kullanıcı sadece "doğru" duran hedefi bulmalı.
    - 'rotation' değerini (0, 90, 180, 270) ve 'isMirrored' (true/false) durumunu çeşitlendir.
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            targetPair: { type: Type.STRING },
            rows: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    letter: { type: Type.STRING },
                                    isMirrored: { type: Type.BOOLEAN },
                                    rotation: { type: Type.NUMBER }
                                },
                                required: ['letter', 'isMirrored', 'rotation']
                            }
                        }
                    },
                    required: ['items']
                }
            }
        },
        required: ['title', 'instruction', 'targetPair', 'rows', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<MirrorLettersData[]>;
};

export const generateSyllableTrainFromAI = async (options: GeneratorOptions): Promise<SyllableTrainData[]> => {
    const { worksheetCount, difficulty, topic, wordLength } = options;
    const prompt = `
    Hece Treni (Syllable Train). Konu: ${topic}.
    Kelime Uzunluğu: ${wordLength || 'Karışık'}.
    
    KURALLAR:
    - Kelimeleri doğru hecelerine ayır.
    - Her vagon bir heceyi temsil etsin.
    - Görsel (imagePrompt) kelimenin anlamını yansıtsın.
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            trains: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        syllables: { type: Type.ARRAY, items: { type: Type.STRING } },
                        imagePrompt: { type: Type.STRING }
                    },
                    required: ['word', 'syllables', 'imagePrompt']
                }
            }
        },
        required: ['title', 'instruction', 'trains', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<SyllableTrainData[]>;
};

export const generateVisualTrackingLinesFromAI = async (options: GeneratorOptions): Promise<VisualTrackingLineData[]> => {
    const { worksheetCount, difficulty, pathComplexity } = options;
    const prompt = `
    Görsel Takip Yolları (Tangle Maze).
    Karmaşıklık: ${pathComplexity || 'medium'} (spagetti çizgiler).
    
    KURALLAR:
    - Sol taraftan başlayıp sağ taraftaki hedefe giden, birbirine dolanmış çizgiler oluştur.
    - Çizgiler için SVG path verisi ('d' attribute) üret.
    - Her çizginin rengi farklı olsun.
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            width: { type: Type.INTEGER },
            height: { type: Type.INTEGER },
            paths: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        color: { type: Type.STRING },
                        d: { type: Type.STRING },
                        startLabel: { type: Type.STRING },
                        endLabel: { type: Type.STRING },
                        startImage: { type: Type.STRING },
                        endImage: { type: Type.STRING }
                    },
                    required: ['id', 'color', 'd', 'startLabel', 'endLabel']
                }
            }
        },
        required: ['title', 'instruction', 'paths', 'width', 'height', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<VisualTrackingLineData[]>;
};

export const generateBackwardSpellingFromAI = async (options: GeneratorOptions): Promise<BackwardSpellingData[]> => {
    const { worksheetCount, difficulty, topic, itemCount, showVisual } = options;
    const visualPrompt = showVisual ? "Her kelime için görsel (imagePrompt) ekle." : "Sadece metin odaklı.";
    
    const prompt = `
    Ters Kelime Avcısı (Backward Spelling). Konu: ${topic}.
    Seviye: ${difficulty}. ${itemCount} adet kelime.
    ${visualPrompt}
    
    KURALLAR:
    - Kelimeleri ters çevir (örn: ELMA -> AMLE).
    - Öğrenci doğrusunu bulmalı.
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        reversed: { type: Type.STRING },
                        correct: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING }
                    },
                    required: ['reversed', 'correct', 'imagePrompt']
                }
            }
        },
        required: ['title', 'instruction', 'items', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<BackwardSpellingData[]>;
};

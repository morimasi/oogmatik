
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData } from '../../types';

const PEDAGOGICAL_PROMPT = `
EĞİTİMSEL İÇERİK KURALLARI:
1. Çıktı JSON formatında olmalı.
2. "pedagogicalNote": Bu etkinlik hangi disleksi alt tipine (fonolojik, görsel, hızlı isimlendirme) hitap ediyor açıkla.
3. "instruction": Öğrenciye yönelik net, cesaretlendirici yönerge.
4. "imagePrompt": Çocuk dostu, dikkat dağıtmayan, net görsel betimlemesi (İngilizce).
`;

export const generateReadingFlowFromAI = async (options: GeneratorOptions): Promise<ReadingFlowData[]> => {
    const { topic, worksheetCount, difficulty } = options;
    const prompt = `
    '${topic}' konulu, "${difficulty}" seviyesinde Akıcı Okuma (Reading Flow) metni.
    Metni hecelere böl ve her heceye farklı renk (siyah/mavi) ata.
    Okuma hızını artıracak şekilde kısa ve ritmik cümleler kullan.
    Özellikle "Satır sonu heceleme" kurallarına dikkat et.
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
    const { worksheetCount } = options;
    const prompt = `
    Harf Karışıklığı (b-d, p-q, m-n) egzersizi.
    Görsel olarak birbirine benzeyen harflerden oluşan satırlar üret.
    Hedef harfi belirle. Örneğin "b" harfini "d" lerin arasından bulma.
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
    const { type, worksheetCount } = options;
    const prompt = `
    Hızlı İsimlendirme (RAN) testi. Tip: ${type || 'object'}.
    Izgara şeklinde sıralanmış öğeler (renk, sayı veya nesne).
    Nesneler için **İngilizce** 'imagePrompt' gereklidir.
    Renkler için hex kodu (value) ve renk ismi (label) ver.
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
    const { worksheetCount, difficulty } = options;
    const prompt = `
    Fonolojik Farkındalık etkinliği.
    Hece sayma veya kafiye bulma soruları.
    Her soru için görsel (imagePrompt) oluştur.
    Zorluk seviyesi: ${difficulty}.
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
    const { worksheetCount, difficulty } = options;
    const prompt = `
    Ayna Harf Savaşçısı (Mirror Letters).
    b/d, p/q gibi harflerin karışık olduğu bir ızgara oluştur.
    Bazı harfler normal, bazıları ters (ayna) dönmüş olsun.
    Kullanıcı sadece doğru yönlü olanları bulmalı.
    'isMirrored' true ise harf ters çevrilmiş demektir.
    Zorluk: ${difficulty}.
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
    const { worksheetCount, difficulty, topic } = options;
    const prompt = `
    Hece Treni (Syllable Train). Konu: ${topic}.
    Kelimeleri hecelerine ayır (vagonlar).
    Her kelime için bir tren oluştur.
    Görsel (imagePrompt) kelimeyi betimlesin.
    Zorluk: ${difficulty}.
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
    const { worksheetCount, difficulty } = options;
    const prompt = `
    Görsel Takip Yolları (Visual Tracking / Tangle Maze).
    Soldaki nesneleri sağdaki hedeflerle birleştiren karmaşık yollar oluştur.
    Yollar birbirine dolanmalı (spaghetti lines).
    SVG path verisi üret (M x y C ... formatında).
    Başlangıç ve bitiş noktalarını etiketle.
    Zorluk: ${difficulty}.
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

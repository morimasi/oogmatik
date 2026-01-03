
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, LetterVisualMatchingData } from '../../types';
import { getAttentionPrompt, getDyslexiaPrompt } from './prompts';

// New: Letter Visual Matching
export const generateLetterVisualMatchingFromAI = async (options: GeneratorOptions): Promise<LetterVisualMatchingData[]> => {
    const { worksheetCount, difficulty, itemCount, targetLetters, case: letterCase } = options;
    
    const specifics = `
    - Hedef Harfler: ${targetLetters || 'Karışık'}.
    - Harf Tipi: ${letterCase === 'upper' ? 'BÜYÜK HARFLER' : 'küçük harfler'}.
    - GÖREV: Belirlenen harfleri, o harfle başlayan nesne görselleriyle eşleştir.
    - ZORLUK: ${difficulty}. 
    - Başlangıç seviyesi için çok belirgin nesneler (Elma-E), Zor seviye için sesli/sessiz benzerliği olanlar.
    `;
    
    const prompt = getDyslexiaPrompt("Harf-Görsel Eşleme", difficulty, specifics);
    
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            pairs: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        letter: { type: Type.STRING },
                        word: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING }
                    },
                    required: ['letter', 'word', 'imagePrompt']
                }
            }
        },
        required: ['title', 'instruction', 'pairs', 'pedagogicalNote']
    };
    
    const result = await generateWithSchema(prompt, { type: Type.ARRAY, items: singleSchema }) as any[];
    return result.map(p => ({
        ...p,
        settings: {
            fontFamily: options.fontFamily || 'OpenDyslexic',
            letterCase: letterCase || 'upper',
            showTracing: difficulty === 'Başlangıç',
            gridCols: options.gridSize || 3
        }
    }));
};

// 1. Code Reading
export const generateCodeReadingFromAI = async (options: GeneratorOptions): Promise<CodeReadingData[]> => {
    const { worksheetCount, symbolType, codeLength, itemCount } = options;
    
    const specifics = `
    - Sembol Tipi: ${symbolType || 'arrows'}.
    - Kod Uzunluğu: ${codeLength || 4}.
    - Bir "Anahtar Tablosu" oluştur.
    - Şifreler çözüldüğünde anlamlı kelimeler veya basit cümleler oluşsun.
    `;
    
    const prompt = getDyslexiaPrompt("Kod Okuma (Şifre Çözme)", options.difficulty, specifics);
    
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            keyMap: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { symbol: { type: Type.STRING }, value: { type: Type.STRING }, color: { type: Type.STRING } },
                    required: ['symbol', 'value']
                }
            },
            codesToSolve: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        sequence: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.STRING }
                    },
                    required: ['sequence', 'answer']
                }
            }
        },
        required: ['title', 'instruction', 'keyMap', 'codesToSolve', 'pedagogicalNote', 'imagePrompt']
    };
    
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<CodeReadingData[]>;
};

// 2. Attention To Question
export const generateAttentionToQuestionFromAI = async (options: GeneratorOptions): Promise<AttentionToQuestionData[]> => {
    const { worksheetCount, subType } = options;
    
    const specifics = `
    Alt Tip: ${subType || 'letter-cancellation'}.
    
    - 'letter-cancellation': Bir ızgara içinde belirli harfleri (örn: b, d) bulma ve eleme.
    - 'path-finding': Başlangıçtan bitişe sembolleri takip etme.
    - 'visual-logic': Şekil dizilerindeki mantık hatasını bulma.
    `;
    
    const prompt = getAttentionPrompt(`Soruya Dikkat (${subType})`, 1, options.difficulty) + specifics;
    
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            subType: { type: Type.STRING, enum: ['letter-cancellation', 'path-finding', 'visual-logic'] },
            // Letter Cancellation Props
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            targetChars: { type: Type.ARRAY, items: { type: Type.STRING } },
            password: { type: Type.STRING },
            // Path Finding Props
            pathGrid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            correctPath: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {r: {type: Type.NUMBER}, c: {type: Type.NUMBER}} } },
            // Visual Logic Props
            logicItems: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.NUMBER },
                        isOdd: { type: Type.BOOLEAN },
                        correctAnswer: { type: Type.STRING },
                        shapes: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { color: { type: Type.STRING }, type: { type: Type.STRING }, connectedTo: { type: Type.ARRAY, items: { type: Type.NUMBER } } } 
                            } 
                        }
                    }
                }
            }
        },
        required: ['title', 'instruction', 'subType', 'pedagogicalNote', 'imagePrompt']
    };
    
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<AttentionToQuestionData[]>;
};

// 3. Attention Development
export const generateAttentionDevelopmentFromAI = async (options: GeneratorOptions): Promise<AttentionDevelopmentData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    
    const specifics = `
    Görev: Mantık Bilmeceleri oluştur.
    Format: Sol/Sağ kutu veya A/B kutusu.
    İçerik: Hedef sayıyı veya nesneyi bulmak için "olumsuzlama", "karşılaştırma" ve "matematiksel özellikler" (tek/çift, büyük/küçük) içeren ipuçları yaz.
    `;
    
    const prompt = getAttentionPrompt("Dikkat Geliştirme (Mantık)", itemCount || 4, difficulty) + specifics;
    
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        riddle: { type: Type.STRING },
                        boxes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    numbers: { type: Type.ARRAY, items: { type: Type.INTEGER } }
                                },
                                required: ['numbers']
                            }
                        },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.STRING }
                    },
                    required: ['riddle', 'boxes', 'options', 'answer']
                }
            }
        },
        required: ['title', 'instruction', 'puzzles', 'pedagogicalNote', 'imagePrompt']
    };
    
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<AttentionDevelopmentData[]>;
};

// 4. Attention Focus
export const generateAttentionFocusFromAI = async (options: GeneratorOptions): Promise<AttentionFocusData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;

    const specifics = `
    Görev: Özellik eşleştirme ve eleme.
    Format: Nesne listeleri (örn: Meyveler, Eşyalar).
    İpuçları: Rengi kırmızı olmayan, çekirdeği olan, suda batmayan vb. özellikler üzerinden hedefi buldur.
    `;

    const prompt = getAttentionPrompt("Dikkatini Ver (Özellik Analizi)", itemCount || 4, difficulty) + specifics;

    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        riddle: { type: Type.STRING },
                        boxes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING }, // e.g. "Kutu 1" or empty
                                    items: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ['items']
                            }
                        },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.STRING }
                    },
                    required: ['riddle', 'boxes', 'options', 'answer']
                }
            }
        },
        required: ['title', 'instruction', 'puzzles', 'pedagogicalNote', 'imagePrompt']
    };

    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<AttentionFocusData[]>;
};

// Placeholder exports
export const generateReadingFlowFromAI = async (o: GeneratorOptions): Promise<ReadingFlowData[]> => [];
export const generateLetterDiscriminationFromAI = async (o: GeneratorOptions): Promise<LetterDiscriminationData[]> => [];
export const generateRapidNamingFromAI = async (o: GeneratorOptions): Promise<RapidNamingData[]> => [];
export const generatePhonologicalAwarenessFromAI = async (o: GeneratorOptions): Promise<PhonologicalAwarenessData[]> => [];
export const generateMirrorLettersFromAI = async (o: GeneratorOptions): Promise<MirrorLettersData[]> => [];
export const generateSyllableTrainFromAI = async (o: GeneratorOptions): Promise<SyllableTrainData[]> => [];
export const generateVisualTrackingLinesFromAI = async (o: GeneratorOptions): Promise<VisualTrackingLineData[]> => [];
export const generateBackwardSpellingFromAI = async (o: GeneratorOptions): Promise<BackwardSpellingData[]> => [];


import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, 
    NumberSenseData, VisualArithmeticData, SpatialGridData, ConceptMatchData, EstimationData,
    RealLifeProblemData // Reusing this type for Applied Math Story
} from '../../types';

const PEDAGOGICAL_PROMPT = `
ÜST DÜZEY EĞİTİM İÇERİĞİ OLUŞTURMA YÖNERGESİ (PREMIUM KALİTE):
1.  **Rol:** Sen, "Özel Eğitim ve Üstün Yetenekliler" için materyal hazırlayan uzman bir pedagogsun.
2.  **Çıktı:** Sadece geçerli JSON.
3.  **"pedagogicalNote":** Bu alan veli/öğretmen içindir. Etkinliğin hangi spesifik diskalkuli becerisini (örn: sayı hissi, uzamsal algı, miktar korunumu) nasıl desteklediğini akademik ama anlaşılır bir dille açıkla.
4.  **"instruction":** Yönerge çok kısa, net ve basit olsun. Karmaşık cümlelerden kaçın.
5.  **"imagePrompt":** (Çok Önemli) Sen aynı zamanda bir Sanat Yönetmenisin. SVG üretecek bir yapay zeka için detaylı görsel tasviri yaz.
    - **Stil:** "Minimalist Math Art", "Clear Shapes", "High Contrast".
    - **Detay:** Soyut kavramları SOMUTLAŞTIRAN, net görseller iste.
6.  **İçerik:**
    - Sayılar ve miktarlar tutarlı olmalı.
    - Diskalkuli dostu (karışıklığa yer vermeyen) tasarım.
`;

// --- 1. Number Sense & Quantity ---
export const generateNumberSenseFromAI = async (options: GeneratorOptions): Promise<NumberSenseData[]> => {
    const { difficulty, worksheetCount, numberRange, visualType } = options;
    const prompt = `
    Diskalkuli destekli "Sayı Hissi" etkinliği. Seviye: ${difficulty}.
    Aralık: ${numberRange || '1-10'}. Görsel Tip: ${visualType || 'objects'}.
    Egzersizler: Sayı doğrusunda eksik bulma, çokluk karşılaştırma (az/çok), sıralama.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                layout: { type: Type.STRING, enum: ['list', 'visual'] },
                exercises: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, enum: ['number-line', 'comparison', 'ordering', 'missing'] },
                            values: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                            target: { type: Type.NUMBER },
                            visualType: { type: Type.STRING }
                        },
                        required: ['type', 'values']
                    }
                }
            },
            required: ['title', 'instruction', 'exercises', 'layout']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<NumberSenseData[]>;
};

// --- 2. Arithmetic Fluency & Visual Arithmetic ---
export const generateArithmeticFluencyFromAI = async (options: GeneratorOptions): Promise<VisualArithmeticData[]> => {
    const { difficulty, worksheetCount, operationType, numberRange } = options;
    const prompt = `
    Diskalkuli için "Temel Aritmetik Akıcılığı". Seviye: ${difficulty}.
    İşlem: ${operationType}. Sayı Aralığı: ${numberRange || '1-10'}.
    Problemleri hem sayı hem de görsel (nokta/nesne) ile destekle.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                layout: { type: Type.STRING, enum: ['visual'] },
                problems: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            num1: { type: Type.NUMBER },
                            num2: { type: Type.NUMBER },
                            operator: { type: Type.STRING },
                            answer: { type: Type.NUMBER },
                            visualType: { type: Type.STRING },
                            imagePrompt: { type: Type.STRING }
                        },
                        required: ['num1', 'num2', 'operator', 'answer', 'visualType']
                    }
                }
            },
            required: ['title', 'problems', 'layout']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<VisualArithmeticData[]>;
};

export const generateVisualArithmeticFromAI = async (options: GeneratorOptions) => generateArithmeticFluencyFromAI(options);

// --- 3. Grouping ---
export const generateNumberGroupingFromAI = async (options: GeneratorOptions): Promise<VisualArithmeticData[]> => {
    const { groupSize, worksheetCount } = options;
    const prompt = `
    Sayı Gruplama (Onluk taban blokları veya 5'li gruplar).
    Grup Boyutu: ${groupSize || 10}.
    Nesneleri gruplayarak saymayı teşvik et.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    // Reusing VisualArithmeticData structure as it fits well
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                layout: { type: Type.STRING, enum: ['visual'] },
                problems: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            num1: { type: Type.NUMBER }, // Total count
                            num2: { type: Type.NUMBER }, // Group size
                            operator: { type: Type.STRING }, // 'group'
                            answer: { type: Type.NUMBER }, // Number of groups
                            visualType: { type: Type.STRING },
                            imagePrompt: { type: Type.STRING }
                        },
                        required: ['num1', 'num2', 'answer']
                    }
                }
            },
            required: ['title', 'problems']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<VisualArithmeticData[]>;
};

// --- 7. Spatial Reasoning & 13, 14, 15 (UPDATED FOR CUBES) ---
export const generateSpatialReasoningFromAI = async (options: GeneratorOptions): Promise<SpatialGridData[]> => {
    const { gridSize, concept, worksheetCount } = options;
    const prompt = `
    Diskalkuli/Uzamsal Algı etkinliği. Konu: ${concept || 'count-cubes'}.
    
    Eğer Konu 'count-cubes' ise:
    - 'cubeData': ${gridSize || 3}x${gridSize} boyutunda, her hücrede küp yüksekliğini belirten sayı matrisi üret (örn: [[2,1,0],[3,2,1]...]).
    - 'type': 'count-cubes'
    
    Eğer Konu 'copy' (Kopyalama) ise:
    - 'grid': ${gridSize || 4}x${gridSize} ızgara. Dolu hücreler için 'filled', boş için null.
    - 'type': 'copy'
    
    Eğer Konu 'path' (Yön) ise:
    - 'grid': Başlangıç 'S', Bitiş 'E' olan ızgara.
    - 'instruction': Yolu tarif et (Yukarı, Sağ, Aşağı).
    - 'type': 'path'

    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                layout: { type: Type.STRING, enum: ['grid'] },
                gridSize: { type: Type.INTEGER },
                cubeData: { 
                    type: Type.ARRAY, 
                    items: { type: Type.ARRAY, items: { type: Type.INTEGER } } 
                },
                tasks: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, enum: ['position', 'direction', 'copy', 'path', 'count-cubes'] },
                            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                            instruction: { type: Type.STRING },
                            target: { type: Type.OBJECT, properties: { r: { type: Type.NUMBER }, c: { type: Type.NUMBER } } }
                        },
                        required: ['type', 'grid', 'instruction']
                    }
                }
            },
            required: ['title', 'gridSize', 'tasks']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<SpatialGridData[]>;
};

export const generateSpatialAwarenessDiscoveryFromAI = async (opts: GeneratorOptions) => generateSpatialReasoningFromAI({...opts, concept: 'path'});
export const generatePositionalConceptsFromAI = async (opts: GeneratorOptions) => generateSpatialReasoningFromAI({...opts, concept: 'copy'});
export const generateDirectionalConceptsFromAI = async (opts: GeneratorOptions) => generateSpatialReasoningFromAI({...opts, concept: 'direction'});

// --- 5. Math Language & 6. Time/Measure ---
export const generateMathLanguageFromAI = async (options: GeneratorOptions): Promise<ConceptMatchData[]> => {
    const { worksheetCount } = options;
    const prompt = `
    Matematiksel Dil ve Semboller.
    Sembolleri (+, -, =) anlamlarıyla (topla, çıkar, eşittir) eşleştirme.
    Somut örneklerle (3 elma + 2 elma) destekle.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                layout: { type: Type.STRING, enum: ['list'] },
                pairs: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            item1: { type: Type.STRING },
                            item2: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['symbol'] },
                            imagePrompt1: { type: Type.STRING }
                        },
                        required: ['item1', 'item2', 'type']
                    }
                }
            },
            required: ['title', 'pairs']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<ConceptMatchData[]>;
};

export const generateTimeMeasurementGeometryFromAI = async (options: GeneratorOptions): Promise<ConceptMatchData[]> => {
    const { worksheetCount, subType } = options;
    const prompt = `
    Zaman, Ölçme ve Geometri etkinliği. Alt Tip: ${subType || 'clock'}.
    Saat okuma (analog/dijital), paraları tanıma veya şekil özellikleri.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    // Reusing ConceptMatchData for pairing time/shapes with values/names
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                layout: { type: Type.STRING, enum: ['visual'] }, // Visual layout for clocks/shapes
                pairs: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            item1: { type: Type.STRING }, // e.g. "3:00"
                            item2: { type: Type.STRING }, // e.g. "Saat üç"
                            type: { type: Type.STRING, enum: ['time', 'measurement', 'geometry'] },
                            imagePrompt1: { type: Type.STRING } // e.g. Clock face image
                        },
                        required: ['item1', 'item2', 'type', 'imagePrompt1']
                    }
                }
            },
            required: ['title', 'pairs']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<ConceptMatchData[]>;
};

export const generateFractionsDecimalsFromAI = async (options: GeneratorOptions): Promise<ConceptMatchData[]> => {
    const { worksheetCount, visualStyle } = options;
    const prompt = `
    Kesirler ve Ondalıklar. Stil: ${visualStyle || 'pie'}.
    Basit kesirleri (1/2, 1/4) görsel modellerle (pasta/çubuk) eşleştir.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    // Reusing ConceptMatchData
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                layout: { type: Type.STRING, enum: ['visual'] },
                pairs: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            item1: { type: Type.STRING }, // "1/2"
                            item2: { type: Type.STRING }, // "Yarım"
                            type: { type: Type.STRING, enum: ['fraction'] },
                            imagePrompt1: { type: Type.STRING } // Fraction visual prompt
                        },
                        required: ['item1', 'item2', 'type', 'imagePrompt1']
                    }
                }
            },
            required: ['title', 'pairs']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<ConceptMatchData[]>;
};

// --- 8. Estimation ---
export const generateEstimationSkillsFromAI = async (options: GeneratorOptions): Promise<EstimationData[]> => {
    const { numberRange, worksheetCount } = options;
    const prompt = `
    Tahmin Becerileri (Estimation). Aralık: ${numberRange || '10-50'}.
    Bir kavanoz/kutu içinde rastgele dağılmış nesneler göster.
    Öğrenci saymadan tahmin etmeli. Seçenekler ver (biri çok uzak, biri yakın, biri doğru).
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                layout: { type: Type.STRING, enum: ['visual'] },
                items: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            count: { type: Type.NUMBER },
                            visualType: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                            imagePrompt: { type: Type.STRING }
                        },
                        required: ['count', 'options', 'imagePrompt']
                    }
                }
            },
            required: ['title', 'items']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<EstimationData[]>;
};

// --- 10. Visual Number Rep ---
export const generateVisualNumberRepresentationFromAI = async (options: GeneratorOptions): Promise<NumberSenseData[]> => {
    // Maps numbers to visual representations (fingers, tally marks, dice)
    return generateNumberSenseFromAI({ ...options, visualType: 'mixed' });
};

// --- 12. Applied Math Story ---
export const generateAppliedMathStoryFromAI = async (options: GeneratorOptions): Promise<RealLifeProblemData[]> => {
    const { storyTheme, worksheetCount } = options;
    const prompt = `
    Uygulamalı Matematik Hikayesi. Tema: ${storyTheme || 'Macera'}.
    Öğrenci hikayenin kahramanı. İlerlemek için matematiksel kararlar vermeli.
    Her adım bir problem.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                problems: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING }, // Story segment + Question
                            solution: { type: Type.STRING },
                            operationHint: { type: Type.STRING },
                            imagePrompt: { type: Type.STRING }
                        },
                        required: ['text', 'solution', 'imagePrompt']
                    }
                }
            },
            required: ['title', 'problems']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<RealLifeProblemData[]>;
};

// --- 4. Problem Solving Strategies ---
export const generateProblemSolvingStrategiesFromAI = async (options: GeneratorOptions) => generateAppliedMathStoryFromAI(options);

// --- 16. Visual Discrimination (Math specific) ---
import { generateVisualOddOneOutFromAI } from './perceptualSkills';
export const generateVisualDiscriminationMathFromAI = async (options: GeneratorOptions) => generateVisualOddOneOutFromAI(options);

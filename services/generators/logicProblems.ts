
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    NumberPatternData, ShapeNumberPatternData,
    ThematicOddOneOutData, PunctuationMazeData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationPhoneNumberData,
    ArithmeticConnectData, RomanArabicMatchConnectData, WeightConnectData, LengthConnectData, VisualNumberPatternData,
    LogicGridPuzzleData
} from '../../types';

const PEDAGOGICAL_PROMPT = `
EĞİTİMSEL İÇERİK KURALLARI:
1. Çıktı JSON formatında olmalı.
2. "pedagogicalNote": Bu etkinlik hangi bilişsel beceriyi (örn: sıralı düşünme, görsel ayırt etme, mantıksal çıkarım) desteklediğini açıklayan kısa bir not.
3. "instruction": Öğrenciye yönelik kısa, net ve cesaretlendirici bir yönerge (örn: "Sıradaki sayıyı bul ve yaz.").
4. "imagePrompt": Varsa görseller için İngilizce, çocuk dostu, renkli, vektörel stil betimlemesi.
5. İçerik asla "Lorem ipsum" veya yer tutucu olmamalı, gerçek ve eğitici veri üret.
`;

export const generateNumberPatternFromAI = async (options: GeneratorOptions): Promise<NumberPatternData[]> => {
    const { itemCount, difficulty, worksheetCount, patternType } = options;
    
    let patternRules = "Basit aritmetik artışlar (örn: +2, +5).";
    if (patternType === 'geometric' || difficulty === 'Orta') patternRules = "Artış/Azalış karışık veya çarpma/bölme.";
    if (patternType === 'complex' || difficulty === 'Zor') patternRules = "İki aşamalı kurallar (x2 +1) veya Fibonacci.";
    if (difficulty === 'Uzman') patternRules = "Karmaşık diziler, karesel artışlar.";

    const prompt = `
    "${difficulty}" zorluk seviyesinde, ${itemCount} adet Sayı Örüntüsü oluştur.
    Kural: ${patternRules}
    Her örüntü bir dizi sayı ve sonunda '?' içermeli.
    Cevabı (answer) belirt.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet çalışma sayfası verisi üret.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            patterns: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        sequence: { type: Type.STRING },
                        answer: { type: Type.STRING },
                    },
                     required: ['sequence', 'answer']
                },
            },
        },
        required: ['title', 'instruction', 'patterns', 'pedagogicalNote']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<NumberPatternData[]>;
};

export const generateShapeNumberPatternFromAI = async (options: GeneratorOptions): Promise<ShapeNumberPatternData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde Şekilli Sayı Örüntüsü (Shape Number Pattern) oluştur.
    Üçgenlerin köşelerindeki sayılarla (veya merkezindeki) bir matematiksel ilişki kur.
    Örn: Üst sayı = Sol alt + Sağ alt.
    Bir şekildeki sayı '?' olsun.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;

    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            patterns: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        shapes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ['triangle'] },
                                    numbers: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ["type", "numbers"]
                            }
                        }
                    },
                    required: ["shapes"]
                }
            }
        },
        required: ["title", "patterns", "instruction", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ShapeNumberPatternData[]>;
};

export const generateThematicOddOneOutFromAI = async (options: GeneratorOptions): Promise<ThematicOddOneOutData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `
    '${topic}' temalı, "${difficulty}" seviyesinde "Tematik Farklı Olanı Bul" etkinliği.
    Her satırda 4 kelime/kavram olsun. 3'ü temaya uygun, 1'i farklı.
    Her kelime için **İngilizce** 'imagePrompt' oluştur. Stil: "Cute colorful icon" veya "Vector illustration".
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
            theme: { type: Type.STRING },
            rows: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        words: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT,
                                properties: {
                                    text: { type: Type.STRING },
                                    imagePrompt: { type: Type.STRING }
                                },
                                required: ["text", "imagePrompt"]
                            } 
                        },
                        oddWord: { type: Type.STRING }
                    },
                    required: ["words", "oddWord"]
                }
            },
            sentencePrompt: { type: Type.STRING }
        },
        required: ["title", "prompt", "theme", "rows", "sentencePrompt", "instruction", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ThematicOddOneOutData[]>;
};

export const generatePunctuationMazeFromAI = async (options: GeneratorOptions): Promise<PunctuationMazeData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde "Noktalama Labirenti".
    Bir noktalama işareti seç (örn: Nokta, Virgül).
    Bu işaretin kullanımıyla ilgili 8 kural yaz (bazıları doğru, bazıları yanlış).
    Doğru kurallar labirentin çıkış yolunu göstersin.
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
            punctuationMark: { type: Type.STRING },
            rules: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        text: { type: Type.STRING },
                        isCorrect: { type: Type.BOOLEAN }
                    },
                    required: ["id", "text", "isCorrect"]
                }
            }
        },
        required: ["title", "prompt", "punctuationMark", "rules", "instruction", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<PunctuationMazeData[]>;
};

export const generateThematicOddOneOutSentenceFromAI = async (options: GeneratorOptions): Promise<ThematicOddOneOutSentenceData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `
    '${topic}' temalı, "${difficulty}" seviyesinde "Farklı Olanla Cümle Kur" etkinliği.
    5 satır oluştur. Her satırda biri hariç diğerleri temaya uyan kelimeler olsun.
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
            rows: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        words: { type: Type.ARRAY, items: { type: Type.STRING } },
                        oddWord: { type: Type.STRING }
                    },
                    required: ["words", "oddWord"]
                }
            },
            sentencePrompt: { type: Type.STRING }
        },
        required: ["title", "prompt", "rows", "sentencePrompt", "instruction", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ThematicOddOneOutSentenceData[]>;
};

export const generateColumnOddOneOutSentenceFromAI = async (options: GeneratorOptions): Promise<ColumnOddOneOutSentenceData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde "Sütunda Farklı Olanı Bul" etkinliği.
    4 sütun oluştur. Her sütunda anlamsal olarak uyumsuz bir kelime olsun.
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
            columns: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        words: { type: Type.ARRAY, items: { type: Type.STRING } },
                        oddWord: { type: Type.STRING }
                    },
                    required: ["words", "oddWord"]
                }
            },
            sentencePrompt: { type: Type.STRING }
        },
        required: ["title", "prompt", "columns", "sentencePrompt", "instruction", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ColumnOddOneOutSentenceData[]>;
};

export const generatePunctuationPhoneNumberFromAI = async (options: GeneratorOptions): Promise<PunctuationPhoneNumberData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde "Noktalama Telefonu" bulmacası.
    7 adet ipucu ver. Her ipucu bir noktalama işareti kuralını veya sayısını işaret etsin ve bir rakama karşılık gelsin.
    Örn: "Cümle sonuna konan nokta sayısı = 3".
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
            clues: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        text: { type: Type.STRING }
                    },
                    required: ["id", "text"]
                }
            },
            solution: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        punctuationMark: { type: Type.STRING },
                        number: { type: Type.INTEGER }
                    },
                    required: ["punctuationMark", "number"]
                }
            }
        },
        required: ["title", "prompt", "instruction", "clues", "solution", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<PunctuationPhoneNumberData[]>;
};

export const generateArithmeticConnectFromAI = async (options: GeneratorOptions): Promise<ArithmeticConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde "İşlem Bağlamaca".
    10-12 adet aritmetik işlem (veya sonuç sayı) oluştur.
    Aynı sonuca çıkan işlemleri eşleştirmek üzere gruplandır.
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
            example: { type: Type.STRING },
            expressions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        value: { type: Type.INTEGER },
                        group: { type: Type.INTEGER },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER }
                    },
                    required: ["text", "value", "group", "x", "y"]
                }
            }
        },
        required: ["title", "prompt", "example", "expressions", "instruction", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ArithmeticConnectData[]>;
};

export const generateRomanArabicMatchConnectFromAI = async (options: GeneratorOptions): Promise<RomanArabicMatchConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde Romen ve Arap rakamlarını eşleştirme oyunu.
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
            gridDim: { type: Type.INTEGER },
            points: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        pairId: { type: Type.INTEGER },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER }
                    },
                    required: ["label", "pairId", "x", "y"]
                }
            }
        },
        required: ["title", "prompt", "gridDim", "points", "instruction", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<RomanArabicMatchConnectData[]>;
};

export const generateWeightConnectFromAI = async (options: GeneratorOptions): Promise<WeightConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde Ağırlık Eşleştirme.
    Farklı birimlerdeki (kg, g) eşit ağırlıkları eşleştir.
    Görseller için **İngilizce** 'imagePrompt' oluştur (tartı, meyve, sebze vb.). Stil: "Flat icon" veya "Vector".
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
            gridDim: { type: Type.INTEGER },
            points: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        pairId: { type: Type.INTEGER },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        imagePrompt: { type: Type.STRING }
                    },
                    required: ["label", "pairId", "x", "y", "imagePrompt"]
                }
            }
        },
        required: ["title", "prompt", "gridDim", "points", "instruction", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<WeightConnectData[]>;
};

export const generateLengthConnectFromAI = async (options: GeneratorOptions): Promise<LengthConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde Uzunluk Eşleştirme.
    Farklı birimlerdeki (m, cm, km) eşit uzunlukları eşleştir.
    Görseller için **İngilizce** 'imagePrompt' (cetvel, metre, yol vb.).
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
            gridDim: { type: Type.INTEGER },
            points: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        pairId: { type: Type.INTEGER },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        imagePrompt: { type: Type.STRING }
                    },
                    required: ["label", "pairId", "x", "y", "imagePrompt"]
                }
            }
        },
        required: ["title", "prompt", "gridDim", "points", "instruction", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<LengthConnectData[]>;
};

export const generateVisualNumberPatternFromAI = async (options: GeneratorOptions): Promise<VisualNumberPatternData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde Görsel Sayı Örüntüsü.
    Sayıların rengi, boyutu ve değeri bir kurala göre değişsin.
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
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    number: { type: Type.INTEGER },
                                    color: { type: Type.STRING },
                                    size: { type: Type.NUMBER }
                                },
                                required: ["number", "color", "size"]
                            }
                        },
                        rule: { type: Type.STRING },
                        answer: { type: Type.INTEGER }
                    },
                    required: ["items", "rule", "answer"]
                }
            }
        },
        required: ["title", "prompt", "puzzles", "instruction", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<VisualNumberPatternData[]>;
};

export const generateLogicGridPuzzleFromAI = async (options: GeneratorOptions): Promise<LogicGridPuzzleData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde Mantık Tablosu (Logic Grid Puzzle).
    Kişiler, nesneler ve özellikleri içeren ipuçları ver.
    Nesneler için **İngilizce** 'imagePrompt' oluştur.
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
            clues: { type: Type.ARRAY, items: { type: Type.STRING } },
            people: { type: Type.ARRAY, items: { type: Type.STRING } },
            categories: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    imageDescription: { type: Type.STRING },
                                    imagePrompt: { type: Type.STRING }
                                },
                                required: ["name", "imageDescription", "imagePrompt"]
                            }
                        }
                    },
                    required: ["title", "items"]
                }
            }
        },
        required: ["title", "prompt", "clues", "people", "categories", "instruction", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<LogicGridPuzzleData[]>;
};

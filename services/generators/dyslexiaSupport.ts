
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, ImageInterpretationTFData, HeartOfSkyData } from '../../types';

const PEDAGOGICAL_PROMPT = `
EĞİTİMSEL İÇERİK KURALLARI:
1. Çıktı JSON formatında olmalı.
2. "pedagogicalNote": Bilişsel beceri açıklaması.
3. "instruction": Net yönerge.
4. "imagePrompt": Etkinlik için MUTLAKA bir adet ana görsel betimlemesi (İngilizce).
`;

// 1. Reading Flow
export const generateReadingFlowFromAI = async (options: GeneratorOptions): Promise<ReadingFlowData[]> => {
    const { worksheetCount, topic, difficulty } = options;
    const prompt = `
    "Okuma Akışı" etkinliği. Seviye: ${difficulty}. Konu: ${topic || 'Doğa'}.
    Renkli hecelerle okumayı kolaylaştıran bir metin hazırla.
    Metni paragraflara, cümlelere ve hecelere böl.
    Her hece için birbirini takip eden zıt renkler (örn: siyah, kırmızı) kullan.
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
                                                        properties: {
                                                            text: { type: Type.STRING },
                                                            color: { type: Type.STRING }
                                                        },
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
            required: ['title', 'text', 'instruction', 'pedagogicalNote', 'imagePrompt']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<ReadingFlowData[]>;
};

// 2. Letter Discrimination
export const generateLetterDiscriminationFromAI = async (options: GeneratorOptions): Promise<LetterDiscriminationData[]> => {
    const { worksheetCount, targetLetters } = options;
    const targets = targetLetters || "b, d";
    const prompt = `
    "Harf Ayırt Etme" etkinliği. Hedef Harfler: ${targets}.
    Karışık harflerden oluşan satırlar üret. Hedef harfleri aralara serpiştir.
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
                targetLetters: { type: Type.ARRAY, items: { type: Type.STRING } },
                rows: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            letters: { type: Type.ARRAY, items: { type: Type.STRING } },
                            targetCount: { type: Type.NUMBER }
                        },
                        required: ['letters', 'targetCount']
                    }
                }
            },
            required: ['title', 'rows', 'targetLetters']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<LetterDiscriminationData[]>;
};

// 3. Rapid Naming
export const generateRapidNamingFromAI = async (options: GeneratorOptions): Promise<RapidNamingData[]> => {
    const { worksheetCount, contentType } = options; // contentType: color, object, number, letter
    const type = contentType || 'object';
    const prompt = `
    "Hızlı İsimlendirme (RAN)" etkinliği. Tür: ${type}.
    Otomatikleşmiş isimlendirme hızı için bir ızgara oluştur.
    Örn: Renklerse (kırmızı, mavi, sarı...), objelerse (ev, top, ağaç...).
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
                type: { type: Type.STRING },
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
                                    label: { type: Type.STRING }
                                },
                                required: ['type', 'value', 'label']
                            }
                        }
                    },
                    required: ['items']
                }
            },
            required: ['title', 'grid', 'type']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<RapidNamingData[]>;
};

// 4. Phonological Awareness
export const generatePhonologicalAwarenessFromAI = async (options: GeneratorOptions): Promise<PhonologicalAwarenessData[]> => {
    const { worksheetCount, difficulty } = options;
    const prompt = `
    "Fonolojik Farkındalık" etkinliği. Seviye: ${difficulty}.
    Egzersiz türleri:
    1. 'syllable-counting': Kelimenin kaç heceli olduğunu bulma.
    2. 'rhyming': Kafiyeli kelimeyi bulma.
    Her soru için 'imagePrompt' (İngilizce görsel betimlemesi) oluştur.
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
                        required: ['type', 'question', 'word', 'answer', 'imagePrompt']
                    }
                }
            },
            required: ['title', 'exercises']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<PhonologicalAwarenessData[]>;
};

// 5. Mirror Letters
export const generateMirrorLettersFromAI = async (options: GeneratorOptions): Promise<MirrorLettersData[]> => {
    const { worksheetCount, targetPair } = options; // e.g. "b-d"
    const prompt = `
    "Ayna Harfler (Mirror Letters)" etkinliği. Odak: ${targetPair || "b-d"}.
    Harfleri normal ve ayna görüntüsü (ters) olarak karıştır.
    'isMirrored': true ise harf ters çevrilmiş demektir.
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
                                    required: ['letter', 'isMirrored']
                                }
                            }
                        },
                        required: ['items']
                    }
                }
            },
            required: ['title', 'rows', 'targetPair']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<MirrorLettersData[]>;
};

// 6. Syllable Train
export const generateSyllableTrainFromAI = async (options: GeneratorOptions): Promise<SyllableTrainData[]> => {
    const { worksheetCount, difficulty } = options;
    const prompt = `
    "Hece Treni" etkinliği. Seviye: ${difficulty}.
    Kelimeleri vagonlara (hecelere) ayır.
    Görsel (imagePrompt) kelimeyi temsil etmeli.
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
            required: ['title', 'trains']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<SyllableTrainData[]>;
};

// 7. Visual Tracking Lines
export const generateVisualTrackingLinesFromAI = async (options: GeneratorOptions): Promise<VisualTrackingLineData[]> => {
    const { worksheetCount } = options;
    const prompt = `
    "Gözle Takip Çizgileri" etkinliği.
    Soldaki nesneyi sağdaki eşleşen nesneye götüren karmaşık yollar (SVG path d string) oluştur.
    Yollar birbirine karışmalı ama kesişmemeli.
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
                width: { type: Type.NUMBER },
                height: { type: Type.NUMBER },
                paths: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.NUMBER },
                            color: { type: Type.STRING },
                            d: { type: Type.STRING }, // SVG Path Data
                            startLabel: { type: Type.STRING },
                            endLabel: { type: Type.STRING }
                        },
                        required: ['id', 'color', 'd', 'startLabel', 'endLabel']
                    }
                }
            },
            required: ['title', 'paths']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<VisualTrackingLineData[]>;
};

// 8. Backward Spelling
export const generateBackwardSpellingFromAI = async (options: GeneratorOptions): Promise<BackwardSpellingData[]> => {
    const { worksheetCount, difficulty } = options;
    const prompt = `
    "Tersten Okuma/Yazma" etkinliği. Seviye: ${difficulty}.
    Kelimeleri tersten yaz (örn: "elma" -> "amle").
    Görsel (imagePrompt) kelimeyi temsil etsin.
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
            required: ['title', 'items']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<BackwardSpellingData[]>;
};

// 9. Code Reading
export const generateCodeReadingFromAI = async (options: GeneratorOptions): Promise<CodeReadingData[]> => {
    const { worksheetCount } = options;
    const prompt = `
    "Kod Okuma / Şifre Çözme" etkinliği.
    Sembolleri harflerle eşleştir (keyMap).
    Bu sembolleri kullanarak kelimeler yaz (codesToSolve).
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
                keyMap: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            symbol: { type: Type.STRING }, // e.g., "★" or unicode
                            value: { type: Type.STRING },  // e.g., "A"
                            color: { type: Type.STRING }
                        },
                        required: ['symbol', 'value']
                    }
                },
                codesToSolve: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            sequence: { type: Type.ARRAY, items: { type: Type.STRING } }, // Array of symbols
                            answer: { type: Type.STRING }
                        },
                        required: ['sequence', 'answer']
                    }
                }
            },
            required: ['title', 'keyMap', 'codesToSolve']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<CodeReadingData[]>;
};

// 10. Attention To Question
export const generateAttentionToQuestionFromAI = async (options: GeneratorOptions): Promise<AttentionToQuestionData[]> => {
    const { worksheetCount, subType } = options; // letter-cancellation, path-finding, visual-logic
    const prompt = `
    "Soruya/Yönergeye Dikkat" etkinliği. Tür: ${subType || 'visual-logic'}.
    Karmaşık görsel veya metinsel yönergeler içeren bir bulmaca oluştur.
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
                subType: { type: Type.STRING },
                // For logic items:
                logicItems: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.NUMBER },
                            shapes: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { color: {type: Type.STRING}, type: {type: Type.STRING} } 
                                } 
                            },
                            isOdd: { type: Type.BOOLEAN },
                            correctAnswer: { type: Type.STRING }
                        }
                    }
                }
            },
            required: ['title', 'instruction', 'subType']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<AttentionToQuestionData[]>;
};

// 11. Attention Development
export const generateAttentionDevelopmentFromAI = async (options: GeneratorOptions): Promise<AttentionDevelopmentData[]> => {
    const { worksheetCount } = options;
    const prompt = `
    "Dikkat Geliştirme (Mantık)" etkinliği.
    Sayı kutuları ve ipuçları içeren bulmacalar.
    Örn: "Sol kutudaki en büyük sayıyı bul."
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
                                    properties: { label: {type: Type.STRING}, numbers: {type: Type.ARRAY, items: {type: Type.NUMBER}} }
                                }
                            },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            answer: { type: Type.STRING }
                        }
                    }
                }
            },
            required: ['title', 'puzzles']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<AttentionDevelopmentData[]>;
};

// 12. Attention Focus
export const generateAttentionFocusFromAI = async (options: GeneratorOptions): Promise<AttentionFocusData[]> => {
    const { worksheetCount } = options;
    const prompt = `
    "Dikkatini Ver (Odaklanma)" etkinliği.
    Benzer öğeler arasından belirli bir kurala uyanı bulma.
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
                                    properties: { title: {type: Type.STRING}, items: {type: Type.ARRAY, items: {type: Type.STRING}} }
                                }
                            },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            answer: { type: Type.STRING }
                        }
                    }
                }
            },
            required: ['title', 'puzzles']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<AttentionFocusData[]>;
};

// 13. Image Interpretation T/F
export const generateImageInterpretationTFFromAI = async (options: GeneratorOptions): Promise<ImageInterpretationTFData[]> => {
    const { worksheetCount, itemCount } = options;
    const prompt = `
    "Resim Yorumlama ve Doğru-Yanlış (D-Y) Okuma" etkinliği.
    
    1. Çocuklar için renkli, detaylı ve neşeli bir sahne kurgula (Örn: Piknik yapan aile, sınıfta ders işleyen öğrenciler, oyun parkı).
    2. 'sceneDescription': Bu sahneyi detaylıca betimle (Görseli zihinde canlandırmak için).
    3. 'imagePrompt': Bu sahneyi görselleştirecek İngilizce prompt yaz. Stil: "Children book illustration, clear lines, colorful".
    4. Bu sahneyle ilgili ${itemCount || 9} adet cümle yaz.
       - Bazıları sahneye göre DOĞRU, bazıları YANLIŞ olsun.
       - Cümleler görsel detaylara (renk, konum, eylem, sayı) odaklanmalı.
       - Örn: "Kırmızı tişörtlü çocuk ayakta duruyor." (Doğru/Yanlış)
    
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
            sceneDescription: { type: Type.STRING },
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        isCorrect: { type: Type.BOOLEAN }
                    },
                    required: ['text', 'isCorrect']
                }
            }
        },
        required: ['title', 'instruction', 'items', 'pedagogicalNote', 'imagePrompt', 'sceneDescription']
    };

    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ImageInterpretationTFData[]>;
};

// 14. Heart of Sky (Gökyüzünün Kalbi)
export const generateHeartOfSkyFromAI = async (options: GeneratorOptions): Promise<HeartOfSkyData[]> => {
    const { worksheetCount, difficulty } = options;
    
    const prompt = `
    "Gökyüzünün Kalbi" (Varki ve Dolunay Masalı) etkinliği. Seviye: ${difficulty}.
    
    Bu etkinlik, minik kurbağa Varki'nin merakını, Nilüfer çiçeği ile diyaloğunu ve dolunay keşfini içeren masalsı bir yolculuktur.
    
    ÖZELLİKLER (PDF'e dayalı):
    - Karakterler: Meraklı minik kurbağa Varki (mavi kurdeleli), Bilge Nilüfer Çiçeği, Zıplayan Balık.
    - Atmosfer: Gölet, sazlıklar, gün batımı, akşamın laciverti, dolunay ışığı.
    - Temalar: Merak, doğa gözlemi, iç huzur, ışık ve sevgi (manevi boyut).
    
    GÖREV:
    1. 6-8 adet "Spread" (Sahne) oluştur.
    2. Her sahne için masalsı, şiirsel bir metin (text) yaz.
    3. Her sahne için o anı canlandıran, detaylı bir "visualDescription" (Türkçe) yaz. (Örn: "Varki nilüfer yaprağında dikilmiş, gökyüzüne bakıyor.")
    4. Her sahne için "imagePrompt" (İngilizce) oluştur. Stil: "Children book illustration style, colorful, whimsical, detailed, soft lighting".
       - Örn: "A cute small green frog with a blue ribbon standing on a giant lily pad in a pond at twilight, looking up at the full moon."
    
    ZORLUK AYARLARI:
    - Başlangıç: Daha kısa cümleler, somut betimlemeler.
    - Orta/Zor: Orijinal PDF'teki gibi şiirsel ve felsefi dil.
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;

    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Cover image
            theme: { type: Type.STRING },
            scenes: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        text: { type: Type.STRING },
                        visualDescription: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING },
                        question: { type: Type.STRING } // Optional comprehension question per scene
                    },
                    required: ['title', 'text', 'visualDescription', 'imagePrompt']
                }
            }
        },
        required: ['title', 'instruction', 'scenes', 'pedagogicalNote', 'imagePrompt', 'theme']
    };

    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<HeartOfSkyData[]>;
};

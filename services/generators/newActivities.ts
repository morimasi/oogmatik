
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, FamilyRelationsData, LogicDeductionData, NumberBoxLogicData, MapInstructionData, MindGamesData, MindGames56Data } from '../../types';
import { ActivityType } from '../../types';

const PEDAGOGICAL_PROMPT = `
ÜST DÜZEY EĞİTİM İÇERİĞİ OLUŞTURMA YÖNERGESİ (PREMIUM KALİTE):
1.  **Rol:** Sen, "Özel Eğitim ve Üstün Yetenekliler" için materyal hazırlayan uzman bir pedagogsun.
2.  **Çıktı:** Sadece geçerli JSON.
3.  **"pedagogicalNote":** Bu alan veli/öğretmen içindir. Etkinliğin hangi spesifik bilişsel beceriyi desteklediğini açıkla.
4.  **"instruction":** Öğrenciye hitap et. Net, motive edici ve anlaşılır ol.
5.  **"imagePrompt":** (KRİTİK ÖNEMLİ) Sen aynı zamanda bir Sanat Yönetmenisin. SVG üretecek bir yapay zeka için detaylı görsel tasviri yaz.
    - Stil: "Professional Vector Illustration", "Clean & Educational".
    - Detay: İçeriğe uygun, zengin ve estetik bir görsel betimle.
6.  **İçerik:**
    - Üst düzey düşünme becerilerini (HOTs) hedefle.
    - Orijinal "Algoritma"daki mantığı BİREBİR uygula.
    - **ASLA BOŞ VERİ DÖNME.** İstenen veri yapılarını (grid, questions, items vb.) mutlaka mantıklı verilerle doldur.
`;

// --- DYNAMIC SCHEMA SELECTOR ---
// Selects the strictest possible schema based on the activity type to force content generation.
const getSchemaForActivityType = (type: ActivityType) => {
    
    // 1. GRID BASED (Word Search, Sudoku, Crossword, Matrix)
    const gridSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            words: { type: Type.ARRAY, items: { type: Type.STRING } }, // Optional word list
            clues: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {id: {type:Type.NUMBER}, text:{type:Type.STRING}, direction:{type:Type.STRING}}, required:['id','text'] } }
        },
        required: ['title', 'instruction', 'grid'] // Force Grid
    };

    // 2. MATH OPERATIONS (Basic Ops, Pyramids, Equations)
    const mathSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            operations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { num1: {type:Type.NUMBER}, num2: {type:Type.NUMBER}, operator: {type:Type.STRING}, answer: {type:Type.NUMBER} }, required: ['num1', 'operator', 'answer'] } },
            puzzles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { problem: {type:Type.STRING}, answer: {type:Type.STRING} }, required: ['problem', 'answer'] } }
        },
        required: ['title', 'instruction', 'operations'] // Force Operations
    };

    // 3. QUESTIONS & TEXT (Stories, Logic Riddles)
    const questionSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            story: { type: Type.STRING },
            questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: {type:Type.STRING}, options: {type:Type.ARRAY, items:{type:Type.STRING}}, answer: {type:Type.STRING} }, required: ['question', 'answer'] } }
        },
        required: ['title', 'instruction', 'questions'] // Force Questions
    };

    // 4. LISTS & MATCHING (Pairs, Sorting, Odd One Out)
    const listSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: {type:Type.STRING}, isCorrect: {type:Type.BOOLEAN}, imagePrompt: {type:Type.STRING} }, required: ['text'] } },
            rows: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { items: {type: Type.ARRAY, items: {type: Type.STRING}}, correctIndex: {type: Type.NUMBER} }, required: ['items'] } },
            pairs: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item1: {type:Type.STRING}, item2: {type:Type.STRING} }, required: ['item1', 'item2'] } }
        },
        // We require at least 'items' but the AI can put data in rows/pairs if structure demands.
        // To be safe for generic lists, we prioritize 'items'.
        required: ['title', 'instruction', 'items'] 
    };

    // Routing Logic based on ActivityType string
    if (['WORD_SEARCH', 'CROSSWORD', 'SUDOKU', 'MINI_WORD_GRID', 'KENDOKU', 'FUTOSHIKI', 'LETTER_GRID_TEST'].some(t => type.includes(t))) {
        return gridSchema;
    }
    if (['BASIC_OPERATIONS', 'MATH_PUZZLE', 'NUMBER_PYRAMID', 'ARITHMETIC'].some(t => type.includes(t))) {
        return mathSchema;
    }
    if (['STORY', 'READING', 'LOGIC_DEDUCTION', 'RIDDLE'].some(t => type.includes(t))) {
        return questionSchema;
    }
    
    // Default to a Flexible Schema but with stricter requirements for the "General" case
    return {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            // Union of all possible data containers
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: {type:Type.STRING}, value: {type:Type.STRING}, isCorrect: {type:Type.BOOLEAN}, imagePrompt: {type:Type.STRING} } } },
            questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: {type:Type.STRING}, options: {type:Type.ARRAY, items:{type:Type.STRING}}, answer: {type:Type.STRING} } } },
            puzzles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { problem: {type:Type.STRING}, answer: {type:Type.STRING}, question: {type:Type.STRING} } } },
            rows: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { items: {type: Type.ARRAY, items: {type: Type.STRING}}, correctIndex: {type: Type.NUMBER} } } },
            pairs: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item1: {type:Type.STRING}, item2: {type:Type.STRING} } } },
            operations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { num1: {type:Type.NUMBER}, num2: {type:Type.NUMBER}, operator: {type:Type.STRING}, answer: {type:Type.NUMBER} } } }
        },
        required: ['title', 'instruction'] // In fallback, we trust the specific prompt instructions below
    };
};

// --- OCR / RICH PROMPT HANDLER ---
export const generateFromRichPrompt = async (activityType: ActivityType, richPrompt: string, options: GeneratorOptions) => {
    
    // 1. Get the specific schema that forces the AI to output data
    const itemSchema = getSchemaForActivityType(activityType);
    
    // 2. Wrap in Array Schema (as the app expects array of worksheets)
    const schema = {
        type: Type.ARRAY,
        items: itemSchema
    };

    const finalPrompt = `
    ${PEDAGOGICAL_PROMPT}

    ÖZEL GÖREV (OCR ALGORİTMA DÖNÜŞÜMÜ):
    Elimizde bir eğitim materyalinin "Kaynak Kodu/Algoritması" var. 
    Bu algoritmayı kullanarak YENİ ve ÖZGÜN içerik üretmelisin.
    
    GİRDİ ALGORİTMASI:
    =========================================
    ${richPrompt}
    =========================================
    
    HİYERARŞİ VE ÜRETİM KURALLARI (DİKKAT!):
    1. **HİYERARŞİ:** Toplam **${options.worksheetCount}** adet Çalışma Sayfası (Worksheet) nesnesi döndür.
    2. **İÇERİK:** Her bir Çalışma Sayfası nesnesinin içinde, yukarıdaki algoritmaya uygun **${options.itemCount || 10} adet** soru/öğe (items/questions/rows/puzzles) bulunmalıdır.
       - Yani dizi içinde ${options.worksheetCount} eleman olacak, her eleman kendi içinde ${options.itemCount || 10} soru barındıracak.
    3. **Zorluk:** ${options.difficulty} seviyesine uygun sayılar veya kelimeler seç.
    4. **Konu:** ${options.topic || 'Genel'} temasına uygun içerik üret.
    
    NOT: Eğer algoritma tek bir "büyük" bulmaca (örneğin Sudoku veya Kelime Avı) tarif ediyorsa, her çalışma sayfasında 1 adet büyük bulmaca olabilir. Ancak liste tipi (çoktan seçmeli, eşleştirme vb.) sorularda sayfa başına çoklu soru üretilmelidir.
    `;

    // Use Gemini 2.0 Flash for complex reasoning
    return generateWithSchema(finalPrompt, schema, 'gemini-2.0-flash');
};

// ... Existing exports (generateFamilyRelationsFromAI, etc.) remain unchanged
export const generateFamilyRelationsFromAI = async (options: GeneratorOptions): Promise<FamilyRelationsData[]> => {
    const { worksheetCount, itemCount, topic } = options;
    const prompt = `
    Akrabalık İlişkileri Eşleştirme. Konu: ${topic || 'Akrabalık'}.
    Sol sütunda tanımlar (örn: "Annemin kız kardeşi"), sağ sütunda cevaplar (örn: "Teyze") olsun.
    ${itemCount || 10} çift oluştur.
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
                leftColumn: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, id: { type: Type.NUMBER } }, required: ['text', 'id'] } },
                rightColumn: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, id: { type: Type.NUMBER } }, required: ['text', 'id'] } }
            },
            required: ['title', 'instruction', 'leftColumn', 'rightColumn', 'pedagogicalNote', 'imagePrompt']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<FamilyRelationsData[]>;
};

export const generateLogicDeductionFromAI = async (options: GeneratorOptions): Promise<LogicDeductionData[]> => {
    const { worksheetCount, itemCount, topic } = options;
    const prompt = `
    Mantıksal Çıkarım Bulmacaları. Kategori: ${topic || 'Karışık'}.
    Her soru bir bilmece gibi olsun (Örn: Aradığımız meyve kırmızı değil...).
    ${itemCount || 4} soru. Her soruda 3-5 şık olsun.
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
                scoringText: { type: Type.STRING },
                questions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            riddle: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            answerIndex: { type: Type.NUMBER },
                            correctLetter: { type: Type.STRING }
                        },
                        required: ['riddle', 'options', 'answerIndex', 'correctLetter']
                    }
                }
            },
            required: ['title', 'instruction', 'questions', 'pedagogicalNote', 'imagePrompt']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<LogicDeductionData[]>;
};

export const generateNumberBoxLogicFromAI = async (options: GeneratorOptions): Promise<NumberBoxLogicData[]> => {
    const { worksheetCount, itemCount, numberRange } = options;
    const prompt = `
    Kutulu Sayı Analizi. Sayı Aralığı: ${numberRange}.
    İki kutu (box1, box2) içinde sayılar ver. Bu sayılarla ilgili mantık soruları sor (örn: En büyüğü, toplamı).
    ${itemCount || 2} bulmaca seti üret.
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
                            box1: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                            box2: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                            questions: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        text: { type: Type.STRING },
                                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        correctAnswer: { type: Type.STRING }
                                    },
                                    required: ['text', 'options', 'correctAnswer']
                                }
                            }
                        },
                        required: ['box1', 'box2', 'questions']
                    }
                }
            },
            required: ['title', 'instruction', 'puzzles', 'pedagogicalNote', 'imagePrompt']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<NumberBoxLogicData[]>;
};

export const generateMapInstructionFromAI = async (options: GeneratorOptions): Promise<MapInstructionData[]> => {
    const { worksheetCount, itemCount } = options;
    const prompt = `
    Harita ve Yönerge Takibi. Türkiye haritası üzerinde illerle ilgili yönergeler.
    ${itemCount || 8} adet yönerge (örn: "Ankara'nın batısındaki şehri boya").
    'mapSvg' alanını boş bırak (frontend dolduracak).
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
                mapSvg: { type: Type.STRING },
                cities: { 
                    type: Type.ARRAY, 
                    items: { 
                        type: Type.OBJECT, 
                        properties: { name: { type: Type.STRING }, x: { type: Type.NUMBER }, y: { type: Type.NUMBER } },
                        required: ['name', 'x', 'y']
                    } 
                },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['title', 'instruction', 'instructions', 'cities', 'pedagogicalNote', 'imagePrompt']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<MapInstructionData[]>;
};

export const generateMindGamesFromAI = async (options: GeneratorOptions): Promise<MindGamesData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const prompt = `
    "Akıl Oyunları" (3. ve 4. Sınıf Seviyesi - Bilsem Tarzı).
    Zorluk: ${difficulty}.
    Aşağıdaki bulmaca tiplerinden KARIŞIK olarak ${itemCount || 4} adet içeren bir set üret:
    1. 'shape_math': Üçgen veya Kare içindeki/köşesindeki sayılarla işlem. (Örn: Köşeler toplamı = Orta veya Üst*Alt = Orta).
    2. 'matrix_logic': 3x3 Izgarada sayı örüntüsü (Kurallı Dikdörtgenler). Satır veya sütun ilişkisi.
    3. 'hexagon_logic': Altıgen dilimlerinde sayılar. Karşılıklı sayılar toplamı veya dairesel artış.
    4. 'function_machine': Girdi -> Kural -> Çıktı (Örn: Giriş 5 -> Çıkış 15, Kural: x3).
    5. 'number_pyramid': Sayı piramidi (Alttaki iki sayının toplamı üsttekini verir).
    HER BULMACA İÇİN:
    - "type": Bulmaca tipi.
    - "numbers": Dizi (shape_math, number_pyramid, hexagon_logic için). '?' için "string" kullan.
    - "grid": Matris (matrix_logic için). '?' için "string" kullan.
    - "input", "output", "rule": (function_machine için). '?' için "string" kullan.
    - "question": Soru metni (Örn: "Soru işareti yerine kaç gelmelidir?").
    - "answer": Cevap.
    - "hint": İpucu (Kural açıklaması).
    - "imagePrompt": Her bulmaca için görsel betimlemesi (İngilizce). Stil: "Educational vector art".
    "pedagogicalNote": Hangi zeka alanını geliştirdiği (Sayısal Mantık, Görsel Algı vb.).
    ${worksheetCount} adet sayfa üret.
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, puzzles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING, enum: ['shape_math', 'matrix_logic', 'number_pyramid', 'hexagon_logic', 'function_machine'] }, shape: { type: Type.STRING, enum: ['triangle', 'square', 'circle'] }, numbers: { type: Type.ARRAY, items: { oneOf: [{ type: Type.NUMBER }, { type: Type.STRING }] } }, grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { oneOf: [{ type: Type.NUMBER }, { type: Type.STRING }, { type: Type.NULL }] } } }, input: { type: Type.NUMBER }, output: { type: Type.STRING }, rule: { type: Type.STRING }, question: { type: Type.STRING }, answer: { type: Type.STRING }, hint: { type: Type.STRING }, imagePrompt: { type: Type.STRING } }, required: ['type', 'answer'] } } }, required: ['title', 'instruction', 'puzzles', 'pedagogicalNote', 'imagePrompt'] } };
    return generateWithSchema(prompt, schema) as Promise<MindGamesData[]>;
};

export const generateMindGames56FromAI = async (options: GeneratorOptions): Promise<MindGames56Data[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const prompt = `
    "Akıl Oyunları" (5. ve 6. Sınıf Seviyesi).
    Zorluk: ${difficulty}.
    Aşağıdaki bulmaca tiplerinden KARIŞIK olarak ${itemCount || 4} adet üret:
    1. 'word_problem': Çok adımlı mantık ve matematik gerektiren sözel problemler (Yaş, para, kesir, mantık vb.).
    2. 'number_sequence': Alışılmışın dışında, karmaşık kurallara sahip sayı veya harf-sayı dizileri.
    3. 'visual_logic': Karmaşık bir şekil içindeki nesneleri sayma (örn: kaç kare var?), kibrit çöpü problemleri, zar mantığı.
    4. 'cipher': Standart dışı matematiksel işlemlerle oluşturulmuş şifreler (örn: A ⌾ B = A*B + A).
    HER BULMACA İÇİN:
    - "type": Bulmaca tipi ('word_problem', 'number_sequence', 'visual_logic', 'cipher').
    - "title": Bulmacanın özgün başlığı (örn: "Kurnaz Osman", "Bir Garip Sayı Dizisi").
    - "question": Problemin tam metni.
    - "answer": Cevap (Sadece sayı veya kısa metin).
    - "hint": (Opsiyonel) Çözüme yönelik küçük bir ipucu.
    - "imagePrompt": Her bulmaca için görsel betimlemesi (İngilizce). Stil: "Clean, modern educational illustration".
    "pedagogicalNote": Hangi zeka alanını geliştirdiği (Sözel Mantık, Sayısal Akıl Yürütme vb.).
    ${worksheetCount} adet sayfa üret.
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, puzzles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING, enum: ['word_problem', 'number_sequence', 'visual_logic', 'cipher'] }, title: { type: Type.STRING }, question: { type: Type.STRING }, answer: { type: Type.STRING }, hint: { type: Type.STRING }, imagePrompt: { type: Type.STRING } }, required: ['type', 'title', 'question', 'answer'] } } }, required: ['title', 'instruction', 'puzzles', 'pedagogicalNote', 'imagePrompt'] } };
    return generateWithSchema(prompt, schema) as Promise<MindGames56Data[]>;
};

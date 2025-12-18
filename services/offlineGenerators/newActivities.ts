
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, FamilyRelationsData, LogicDeductionData, NumberBoxLogicData, MapInstructionData, MindGamesData, MindGames56Data } from '../../types';
import { shuffle, getRandomInt, getRandomItems, generateSudokuGrid, generateLatinSquare } from './helpers';

const PEDAGOGICAL_PROMPT = `
ÜST DÜZEY EĞİTİM İÇERİĞİ OLUŞTURMA YÖNERGESİ (PREMIUM KALİTE):
1.  **Rol:** Sen, "Özel Eğitim ve Üstün Yetenekliler" için materyal hazırlayan uzman bir pedagogsun.
2.  **Çıktı:** Sadece geçerli JSON.
3.  **"pedagogicalNote":** Bu alan veli/öğretmen içindir. Etkinliğin hangi spesifik bilişsel beceriyi (örn: kavramsal eşleştirme, soyut düşünme, yön bulma) nasıl desteklediğini akademik ama anlaşılır bir dille açıkla.
4.  **"instruction":** Öğrenciye hitap et. Net, motive edici ve anlaşılır ol.
5.  **"imagePrompt":** (Çok Önemli) Sen aynı zamanda bir Sanat Yönetmenisin. SVG üretecek bir yapay zeka için detaylı görsel tasviri yaz.
    - **Stil:** "Professional Vector Illustration", "Clean & Educational".
    - **Detay:** İçeriğe uygun, zengin ve estetik bir görsel betimle.
6.  **İçerik:**
    - Üst düzey düşünme becerilerini (HOTs) hedefle.
    - Kültürel olarak nötr veya evrensel.
`;

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

// --- MIND GAMES AI GENERATOR (3-4. Sınıf) ---
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
                            type: { type: Type.STRING, enum: ['shape_math', 'matrix_logic', 'number_pyramid', 'hexagon_logic', 'function_machine'] },
                            shape: { type: Type.STRING, enum: ['triangle', 'square', 'circle'] },
                            numbers: { type: Type.ARRAY, items: { oneOf: [{ type: Type.NUMBER }, { type: Type.STRING }] } },
                            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { oneOf: [{ type: Type.NUMBER }, { type: Type.STRING }, { type: Type.NULL }] } } },
                            input: { type: Type.NUMBER },
                            output: { type: Type.STRING }, 
                            rule: { type: Type.STRING },
                            question: { type: Type.STRING },
                            answer: { type: Type.STRING },
                            hint: { type: Type.STRING },
                            imagePrompt: { type: Type.STRING }
                        },
                        required: ['type', 'answer']
                    }
                }
            },
            required: ['title', 'instruction', 'puzzles', 'pedagogicalNote', 'imagePrompt']
        }
    };
    
    return generateWithSchema(prompt, schema) as Promise<MindGamesData[]>;
};

// --- MIND GAMES AI GENERATOR (5-6. Sınıf) ---
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
                            type: { type: Type.STRING, enum: ['word_problem', 'number_sequence', 'visual_logic', 'cipher'] },
                            title: { type: Type.STRING },
                            question: { type: Type.STRING },
                            answer: { type: Type.STRING },
                            hint: { type: Type.STRING },
                            imagePrompt: { type: Type.STRING }
                        },
                        required: ['type', 'title', 'question', 'answer']
                    }
                }
            },
            required: ['title', 'instruction', 'puzzles', 'pedagogicalNote', 'imagePrompt']
        }
    };
    
    return generateWithSchema(prompt, schema) as Promise<MindGames56Data[]>;
};

// --- OFFLINE GENERATORS ---

export const generateOfflineFamilyRelations = async (options: GeneratorOptions): Promise<FamilyRelationsData[]> => {
    const { worksheetCount, itemCount } = options;
    const relations = [
        { q: "Annemin kız kardeşi", a: "Teyze" },
        { q: "Babamın erkek kardeşi", a: "Amca" },
        { q: "Teyzemin oğlu", a: "Kuzen" },
        { q: "Babamın annesi", a: "Babaanne" },
        { q: "Annemin babası", a: "Dede" },
        { q: "Kardeşimin oğlu", a: "Yeğen" },
        { q: "Amcamın eşi", a: "Yenge" },
        { q: "Teyzemin kocası", a: "Enişte" },
        { q: "Kızımın kocası", a: "Damat" },
        { q: "Oğlumun karısı", a: "Gelin" }
    ];

    return Array.from({ length: worksheetCount }, () => {
        const selected = getRandomItems(relations, itemCount || 5);
        const shuffledAnswers = shuffle([...selected]);
        
        return {
            title: "Akrabalık İlişkileri",
            instruction: "Tanımları doğru akrabalık isimleriyle eşleştirin.",
            pedagogicalNote: "Sosyal kavramlar ve mantıksal ilişkilendirme.",
            imagePrompt: "Family Tree",
            leftColumn: selected.map((r, i) => ({ text: r.q, id: i })),
            rightColumn: shuffledAnswers.map((r, i) => ({ text: r.a, id: selected.indexOf(r) })) // Correct ID mapping
        };
    });
};

export const generateOfflineLogicDeduction = async (options: GeneratorOptions): Promise<LogicDeductionData[]> => {
    const { worksheetCount, itemCount } = options;
    const puzzles = [
        { r: "Ben bir meyveyim. Kırmızıyım ama elma değilim. Çekirdeklerim üzerinde. Ben neyim?", o: ["Çilek", "Elma", "Kiraz"], a: 0, l: "A" },
        { r: "Dört ayağım var ama yürüyemem. Üzerimde yemek yersin. Ben neyim?", o: ["Sandalye", "Masa", "Yatak"], a: 1, l: "B" },
        { r: "Sıcak tutarım ama canlı değilim. Kışın giyilirim. Ben neyim?", o: ["Gözlük", "Mont", "Terlik"], a: 1, l: "B" },
        { r: "Kanatlarım var ama kuş değilim. Motorum var. Ben neyim?", o: ["Uçak", "Arı", "Kelebek"], a: 0, l: "A" }
    ];

    return Array.from({ length: worksheetCount }, () => ({
        title: "Mantıksal Çıkarım",
        instruction: "Bilmeceleri oku ve doğru cevabı bul.",
        pedagogicalNote: "Çıkarım yapma ve kelime dağarcığı.",
        imagePrompt: "Detective",
        questions: getRandomItems(puzzles, itemCount || 3).map(p => ({
            riddle: p.r, options: p.o, answerIndex: p.a, correctLetter: p.l
        }))
    }));
};

export const generateOfflineNumberBoxLogic = async (options: GeneratorOptions): Promise<NumberBoxLogicData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const box1 = Array.from({length: 4}, () => getRandomInt(1, 20));
        const box2 = Array.from({length: 4}, () => getRandomInt(1, 20));
        const max1 = Math.max(...box1);
        const min2 = Math.min(...box2);
        
        return {
            title: "Kutu Mantığı",
            instruction: "Kutulardaki sayıları incele ve soruları cevapla.",
            pedagogicalNote: "Veri analizi ve karşılaştırma.",
            imagePrompt: "Number Boxes",
            puzzles: [{
                box1, box2,
                questions: [
                    { text: "1. Kutudaki en büyük sayı kaçtır?", options: [max1.toString(), (max1-1).toString(), (max1+2).toString()], correctAnswer: max1.toString() },
                    { text: "2. Kutudaki en küçük sayı kaçtır?", options: [min2.toString(), (min2+1).toString(), (min2-2).toString()], correctAnswer: min2.toString() }
                ]
            }]
        };
    });
};

export const generateOfflineMapInstruction = async (options: GeneratorOptions): Promise<MapInstructionData[]> => {
    const { worksheetCount, itemCount } = options;
    
    // Updated Coordinates for Realistic Map (0-100 Relative Scale)
    // Matches the TurkeyMapSVG visual layout
    const cities = [
        { name: "İstanbul", x: 25, y: 20 }, 
        { name: "Ankara", x: 42, y: 35 }, 
        { name: "İzmir", x: 10, y: 50 },
        { name: "Antalya", x: 38, y: 80 }, 
        { name: "Adana", x: 55, y: 75 }, 
        { name: "Erzurum", x: 80, y: 30 },
        { name: "Diyarbakır", x: 75, y: 55 }, 
        { name: "Trabzon", x: 70, y: 15 }, 
        { name: "Konya", x: 42, y: 60 },
        { name: "Van", x: 90, y: 50 }, 
        { name: "Bursa", x: 25, y: 30 }, 
        { name: "Samsun", x: 55, y: 12 }
    ];

    return Array.from({ length: worksheetCount }, () => {
        const instructions = [
            "Konya'yı kırmızı renge boya.",
            "Erzurum'u göster (daire içine al).",
            "Ankara'nın doğusundaki bir şehri maviye boya.",
            "Karadeniz'e kıyısı olan bir şehri yeşil renge boya.",
            "Adı 'İ' harfiyle başlayan bir şehri sarı renge boya.",
            "Akdeniz bölgesinden bir şehri turuncu renge boya.",
            "Van gölünün yanındaki şehri bul.",
            "En batıdaki şehri mor renge boya."
        ];

        return {
            title: "Harita ve Yönerge Takibi",
            instruction: "Haritayı incele ve aşağıdaki yönergeleri sırasıyla uygula.",
            pedagogicalNote: "Mekansal algı, yön kavramları ve işitsel/görsel dikkat.",
            imagePrompt: "Türkiye Haritası",
            mapSvg: "", 
            cities,
            instructions: instructions.slice(0, itemCount || 8) // Slice random instructions
        };
    });
};

export const generateOfflineMindGames = async (options: GeneratorOptions): Promise<MindGamesData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const puzzles = [];
        // 1. Function Machine
        const input = getRandomInt(2, 10);
        const mult = getRandomInt(2, 5);
        puzzles.push({
            type: 'function_machine',
            input,
            rule: `x ${mult}`,
            output: (input * mult).toString(),
            question: "Giriş sayısına kuralı uygula.",
            answer: (input * mult).toString(),
            imagePrompt: 'Machine'
        });
        
        // 2. Pyramid
        const b1=3, b2=4, b3=5;
        puzzles.push({
            type: 'number_pyramid',
            numbers: [b1, b2, b3, b1+b2, b2+b3, (b1+b2)+(b2+b3)], // 3 base, 2 mid, 1 top
            question: "Zirvedeki sayı kaçtır?",
            answer: ((b1+b2)+(b2+b3)).toString(),
            imagePrompt: 'Pyramid'
        });

        return {
            title: "Akıl Oyunları (Hızlı Mod)",
            instruction: "Mantığını kullanarak bulmacaları çöz.",
            pedagogicalNote: "Matematiksel akıl yürütme.",
            imagePrompt: "Puzzle",
            puzzles
        };
    });
};

export const generateOfflineMindGames56 = async (options: GeneratorOptions): Promise<MindGames56Data[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: "İleri Akıl Oyunları (Hızlı Mod)",
        instruction: "Soruları çöz.",
        pedagogicalNote: "Analitik düşünme.",
        imagePrompt: "Brain",
        puzzles: [
            { type: 'number_sequence', title: 'Sayı Dizisi', question: '2, 4, 8, 16, ?', answer: '32', hint: 'İki katı', imagePrompt: 'Sequence' },
            { type: 'word_problem', title: 'Yaş Problemi', question: 'Ali 10 yaşında. Babası ondan 30 yaş büyük. 5 yıl sonra baba kaç yaşında olur?', answer: '45', hint: 'Baba şu an 40 yaşında.', imagePrompt: 'Age' }
        ]
    }));
};

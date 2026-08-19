/**
 * Matematik & Mantık — Özel AI Prompt Motorları
 * 11 etkinlik için disleksi-dostu, pedagojik açıdan zengin Gemini promptları
 * 
 * Kapsam: MATH_BASIC_OPERATIONS, MATH_WORD_PROBLEMS, CLOCK_READING,
 * MONEY_COUNTING, NUMBER_PATH_LOGIC, VISUAL_ARITHMETIC, NUMBER_SENSE,
 * REAL_LIFE_MATH_PROBLEMS, ESTIMATION, SPATIAL_GRID, SHAPE_SUDOKU
 */

import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions } from '../../types.js';

const mathSchema = {
    type: 'OBJECT',
    properties: {
        title: { type: 'STRING' },
        instruction: { type: 'STRING' },
        pedagogicalNote: { type: 'STRING' },
        problems: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    id: { type: 'STRING' },
                    question: { type: 'STRING' },
                    answer: { type: 'INTEGER' },
                    visualHint: { type: 'STRING' },
                    visualType: { type: 'STRING' },
                    num1: { type: 'INTEGER' },
                    num2: { type: 'INTEGER' },
                    operator: { type: 'STRING' },
                    options: { type: 'ARRAY', items: { type: 'INTEGER' } }
                }
            }
        },
        exercises: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    type: { type: 'STRING' },
                    values: { type: 'ARRAY', items: { type: 'INTEGER' } },
                    target: { type: 'INTEGER' },
                    step: { type: 'INTEGER' },
                    visualType: { type: 'STRING' }
                }
            }
        },
        items: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    count: { type: 'INTEGER' },
                    options: { type: 'ARRAY', items: { type: 'INTEGER' } },
                    answer: { type: 'INTEGER' }
                }
            }
        },
        legend: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    symbol: { type: 'STRING' },
                    operation: { type: 'STRING' },
                    value: { type: 'INTEGER' },
                    color: { type: 'STRING' }
                }
            }
        },
        chains: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    startNumber: { type: 'INTEGER' },
                    steps: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                symbol: { type: 'STRING' },
                                expectedValue: { type: 'INTEGER' }
                            }
                        }
                    }
                }
            }
        },
        tasks: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    type: { type: 'STRING' },
                    description: { type: 'STRING' }
                }
            }
        },
        cubeData: { type: 'ARRAY', items: { type: 'INTEGER' } },
        clockTimes: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    hour: { type: 'INTEGER' },
                    minute: { type: 'INTEGER' },
                    label: { type: 'STRING' }
                }
            }
        },
        moneyItems: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    coins: { type: 'ARRAY', items: { type: 'STRING' } },
                    total: { type: 'STRING' },
                    label: { type: 'STRING' }
                }
            }
        },
        grid: {
            type: 'ARRAY',
            items: {
                type: 'ARRAY',
                items: { type: 'STRING' }
            }
        },
        solution: {
            type: 'ARRAY',
            items: {
                type: 'ARRAY',
                items: { type: 'STRING' }
            }
        }
    }
};

const MATH_PEDAGOGICAL_PROMPT = `
ÜST DÜZEY MATEMATİK EĞİTİM İÇERİĞİ OLUŞTURMA YÖNERGESİ (DİSLEKSİ DOSTU):
1. **Rol:** Sen, disleksi ve diskalkuli yaşayan çocuklar için materyal hazırlayan uzman bir matematik pedagogusun.
2. **Çıktı:** Sadece geçerli JSON.
3. **"instruction":** Öğrenciye doğrudan, net, kısa cümlelerle hitap et. Motive edici ol. Türkçe yaz.
4. **"pedagogicalNote":** Öğretmene bu aktivitenin neden önemli olduğunu, hangi becerileri geliştirdiğini açıkla. Türkçe yaz.
5. **İçerik Kuralları:**
   - Sayılar net ve büyük olmalı (karmaşık ondalıklı sayılar kullanma).
   - Her sorunun tek bir doğru cevabı olmalı.
   - Zorluk seviyesine uygun sayı aralıkları kullan.
   - Asla tekrar yapma, her soru benzersiz olsun.
   - Görsel ipuçları (visualHint) pedagojik ve destekleyici olmalı.
`;

// ─────────────────────────────────────────────────────────────
// 1. MATH_BASIC_OPERATIONS
// ─────────────────────────────────────────────────────────────
export const generateBasicOperationsFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty = 'Orta', worksheetCount = 1, itemCount = 12 } = options;
    const prompt = `"${difficulty}" zorluk seviyesinde ${itemCount} adet temel matematik işlemi üret.
    Kolay: 1-20 arası toplama/çıkarma. Orta: 1-100 arası 4 işlem. Zor: 1-500 arası 4 işlem.
    Her problem: question ("12 + 5 = ?"), answer (17), visualHint ("12 ve 5 sayılarının toplamı").
    ${MATH_PEDAGOGICAL_PROMPT} ${worksheetCount} adet çalışma sayfası üret.`;

    const schema = { type: 'ARRAY', items: mathSchema };
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Temel Matematik İşlemleri',
        instruction: p.instruction || 'Aşağıdaki işlemleri çöz ve sonuçları kutucuklara yaz.',
        problems: Array.isArray(p.problems) ? p.problems : Array.isArray(p.items) ? p.items : [],
        pedagogicalNote: p.pedagogicalNote || 'Dört işlem becerisi, sayısal akıcılığı ve işlem doğruluğunu geliştirir.'
    }));
};

// ─────────────────────────────────────────────────────────────
// 2. MATH_WORD_PROBLEMS
// ─────────────────────────────────────────────────────────────
export const generateMathWordProblemsFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty = 'Orta', worksheetCount = 1, itemCount = 5 } = options;
    const prompt = `"${difficulty}" zorluk seviyesinde ${itemCount} adet sözel matematik problemi üret.
    Her problem günlük hayattan bir senaryo içersin (market, okul, bahçe vb.).
    Kolay: tek işlem, küçük sayılar. Orta: iki işlem. Zor: çok adımlı.
    Her problem: question (problem metni), answer (sayısal sonuç), visualHint (çözüm ipucu).
    ${MATH_PEDAGOGICAL_PROMPT} ${worksheetCount} adet çalışma sayfası üret.`;

    const schema = { type: 'ARRAY', items: mathSchema };
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Sözel Problemler',
        instruction: p.instruction || 'Problemleri dikkatlice oku ve çöz.',
        problems: Array.isArray(p.problems) ? p.problems : Array.isArray(p.items) ? p.items : [],
        pedagogicalNote: p.pedagogicalNote || 'Sözel problem çözme becerisi, okuduğunu anlama ve matematiksel modelleme yeteneğini geliştirir.'
    }));
};

// ─────────────────────────────────────────────────────────────
// 3. CLOCK_READING
// ─────────────────────────────────────────────────────────────
export const generateClockReadingFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty = 'Orta', worksheetCount = 1, itemCount = 8 } = options;
    const prompt = `"${difficulty}" zorluk seviyesinde ${itemCount} adet saat okuma etkinliği üret.
    Kolay: tam saatler (3:00, 7:00). Orta: yarım ve çeyrek saatler (2:30, 4:15). Zor: 5'er dakika aralıkları (3:25, 8:40).
    Her saat: hour (saat), minute (dakika), label (gösterilecek metin "Saat kaç?").
    clockTimes dizisinde dön.
    ${MATH_PEDAGOGICAL_PROMPT} ${worksheetCount} adet çalışma sayfası üret.`;

    const schema = { type: 'ARRAY', items: mathSchema };
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Saat Okuma',
        instruction: p.instruction || 'Saatleri oku ve doğru zamanı yaz.',
        clockTimes: Array.isArray(p.clockTimes) ? p.clockTimes : [],
        pedagogicalNote: p.pedagogicalNote || 'Zaman kavramı, analog saat okuma ve günlük hayat becerilerini geliştirir.'
    }));
};

// ─────────────────────────────────────────────────────────────
// 4. MONEY_COUNTING
// ─────────────────────────────────────────────────────────────
export const generateMoneyCountingFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty = 'Orta', worksheetCount = 1, itemCount = 6 } = options;
    const prompt = `"${difficulty}" zorluk seviyesinde ${itemCount} adet para sayma etkinliği üret.
    Türk Lirası kullan (1 TL, 50 kuruş, 25 kuruş, 10 kuruş, 5 kuruş, 1 kuruş).
    Kolay: 2-3 madeni para. Orta: 4-5 madeni para. Zor: kâğıt para + bozuk para karışık.
    moneyItems dizisinde dön. Her öğe: coins (["1 TL", "50 kuruş"]), total ("1,50 TL"), label.
    ${MATH_PEDAGOGICAL_PROMPT} ${worksheetCount} adet çalışma sayfası üret.`;

    const schema = { type: 'ARRAY', items: mathSchema };
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Paralarımız',
        instruction: p.instruction || 'Madeni paraları say ve toplam tutarı yaz.',
        moneyItems: Array.isArray(p.moneyItems) ? p.moneyItems : [],
        pedagogicalNote: p.pedagogicalNote || 'Para tanıma, toplama ve günlük alışveriş becerilerini geliştirir.'
    }));
};

// ─────────────────────────────────────────────────────────────
// 5. NUMBER_PATH_LOGIC
// ─────────────────────────────────────────────────────────────
export const generateNumberPathLogicFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty = 'Orta', worksheetCount = 1, itemCount = 6 } = options;
    const prompt = `"${difficulty}" zorluk seviyesinde ${itemCount} zincirli "Sayı Yolu Mantığı" üret.
    Her zincir bir başlangıç sayısı ve sembolik adımlar içersin.
    Legend: [{symbol: "circle", operation: "+", value: 3, color: "#4F46E5"}, {symbol: "triangle", operation: "*", value: 2, color: "#EF4444"}]
    Her chain: {startNumber: 5, steps: [{symbol: "circle", expectedValue: 8}, {symbol: "triangle", expectedValue: 16}]}
    ${MATH_PEDAGOGICAL_PROMPT} ${worksheetCount} adet çalışma sayfası üret.`;

    const schema = { type: 'ARRAY', items: mathSchema };
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Sayı Yolu Mantığı',
        instruction: p.instruction || 'Sembolik kurallara göre sayı yolunu takip et.',
        legend: Array.isArray(p.legend) ? p.legend : [],
        chains: Array.isArray(p.chains) ? p.chains : [],
        pedagogicalNote: p.pedagogicalNote || 'Sembolik düşünme, işlem sıralama ve mantıksal çıkarım becerilerini geliştirir.'
    }));
};

// ─────────────────────────────────────────────────────────────
// 6. VISUAL_ARITHMETIC
// ─────────────────────────────────────────────────────────────
export const generateVisualArithmeticFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty = 'Orta', worksheetCount = 1, itemCount = 6 } = options;
    const prompt = `"${difficulty}" zorluk seviyesinde ${itemCount} adet görsel aritmetik problemi üret.
    Her problem iki sayı ve bir işlem içersin. Görselleştirme tipi: ten-frame, dice, blocks veya number-bond.
    Her problem: {num1, num2, operator (+|-|*), answer, visualType ("ten-frame"|"dice"|"blocks"|"number-bond")}.
    Kolay: 1-10 arası toplama. Orta: 1-20 arası. Zor: 1-50 arası.
    ${MATH_PEDAGOGICAL_PROMPT} ${worksheetCount} adet çalışma sayfası üret.`;

    const schema = { type: 'ARRAY', items: mathSchema };
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Görsel Aritmetik',
        instruction: p.instruction || 'Görselleri kullanarak işlemi çöz.',
        problems: Array.isArray(p.problems) ? p.problems : [],
        pedagogicalNote: p.pedagogicalNote || 'Somuttan soyuta geçiş, sayı hissi ve görsel-matematiksel bağ kurma becerilerini geliştirir.'
    }));
};

// ─────────────────────────────────────────────────────────────
// 7. NUMBER_SENSE
// ─────────────────────────────────────────────────────────────
export const generateNumberSenseFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty = 'Orta', worksheetCount = 1, itemCount = 6 } = options;
    const prompt = `"${difficulty}" zorluk seviyesinde ${itemCount} adet sayı hissi alıştırması üret.
    Alıştırma tipleri: "missing" (eksik sayıyı bul) ve "comparison" (büyük/küçük karşılaştırma).
    missing tipi: {type: "missing", values: [2,4,6,8,10], target: 6, step: 2}
    comparison tipi: {type: "comparison", values: [15, 23], visualType: "ten-frame"|"blocks"}
    exercises dizisinde dön.
    ${MATH_PEDAGOGICAL_PROMPT} ${worksheetCount} adet çalışma sayfası üret.`;

    const schema = { type: 'ARRAY', items: mathSchema };
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Sayı Hissi',
        instruction: p.instruction || 'Sayıları incele ve doğru cevabı bul.',
        exercises: Array.isArray(p.exercises) ? p.exercises : [],
        pedagogicalNote: p.pedagogicalNote || 'Sayı doğrusu kavramı, büyüklük karşılaştırma ve sayı hissi becerilerini geliştirir.'
    }));
};

// ─────────────────────────────────────────────────────────────
// 8. REAL_LIFE_MATH_PROBLEMS
// ─────────────────────────────────────────────────────────────
export const generateRealLifeMathProblemsFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty = 'Orta', worksheetCount = 1, itemCount = 5 } = options;
    const prompt = `"${difficulty}" zorluk seviyesinde ${itemCount} adet gerçek hayat matematik problemi üret.
    Senaryolar: market alışverişi, yemek tarifi, seyahat mesafesi, spor puanları vb.
    Her problem: question (günlük hayat senaryosu), answer (sayısal sonuç), visualHint (çözüm stratejisi).
    Kolay: tek işlem. Orta: iki işlem. Zor: çok adımlı ve karışık işlemler.
    ${MATH_PEDAGOGICAL_PROMPT} ${worksheetCount} adet çalışma sayfası üret.`;

    const schema = { type: 'ARRAY', items: mathSchema };
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Gerçek Hayat Problemleri',
        instruction: p.instruction || 'Günlük hayattan problemleri çöz.',
        problems: Array.isArray(p.problems) ? p.problems : Array.isArray(p.items) ? p.items : [],
        pedagogicalNote: p.pedagogicalNote || 'Matematiğin günlük hayattaki kullanımını anlama ve problem çözme stratejileri geliştirir.'
    }));
};

// ─────────────────────────────────────────────────────────────
// 9. ESTIMATION
// ─────────────────────────────────────────────────────────────
export const generateEstimationFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty = 'Orta', worksheetCount = 1, itemCount = 6 } = options;
    const prompt = `"${difficulty}" zorluk seviyesinde ${itemCount} adet tahmin etkinliği üret.
    Her etkinlikte belirli sayıda nesne (nokta, yıldız vb.) gösterilsin ve öğrenci doğru sayıyı tahmin etsin.
    Her item: {count: 23, options: [15, 23, 31, 40], answer: 23}.
    Kolay: 5-20 arası nesneler, 3 seçenek. Orta: 10-50 arası, 4 seçenek. Zor: 20-100 arası, 4 seçenek.
    items dizisinde dön.
    ${MATH_PEDAGOGICAL_PROMPT} ${worksheetCount} adet çalışma sayfası üret.`;

    const schema = { type: 'ARRAY', items: mathSchema };
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Tahmin Et',
        instruction: p.instruction || 'Nesneleri sayarak doğru tahmini seç.',
        items: Array.isArray(p.items) ? p.items : [],
        pedagogicalNote: p.pedagogicalNote || 'Subitizing (anlık algılama), tahmin becerisi ve sayısal büyüklük kavramını geliştirir.'
    }));
};

// ─────────────────────────────────────────────────────────────
// 10. SPATIAL_GRID
// ─────────────────────────────────────────────────────────────
export const generateSpatialGridFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty = 'Orta', worksheetCount = 1, itemCount = 4 } = options;
    const prompt = `"${difficulty}" zorluk seviyesinde ${itemCount} adet uzamsal ızgara ve küp sayma görevi üret.
    Her görev: {type: "count-cubes", description: "3D küp yapısını say"}.
    cubeData dizisi: her eleman bir sütundaki küp sayısını temsil eder. Örn: [3, 1, 2, 4] = 4 sütunlu yapı.
    Kolay: 3-4 sütun, max 3 küp. Orta: 4-6 sütun, max 5 küp. Zor: 5-8 sütun, max 7 küp.
    ${MATH_PEDAGOGICAL_PROMPT} ${worksheetCount} adet çalışma sayfası üret.`;

    const schema = { type: 'ARRAY', items: mathSchema };
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Uzamsal Izgara',
        instruction: p.instruction || 'Küpleri sayarak toplam sayıyı bul.',
        tasks: Array.isArray(p.tasks) ? p.tasks : [{ type: 'count-cubes', description: '3D küp yapısını say' }],
        cubeData: Array.isArray(p.cubeData) ? p.cubeData : [],
        pedagogicalNote: p.pedagogicalNote || 'Uzamsal algılama, 3 boyutlu düşünme ve sayma becerilerini geliştirir.'
    }));
};

// ─────────────────────────────────────────────────────────────
// 11. SHAPE_SUDOKU
// ─────────────────────────────────────────────────────────────
export const generateShapeSudokuFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty = 'Orta', worksheetCount = 1 } = options;
    const size = difficulty === 'Kolay' ? 4 : difficulty === 'Zor' ? 6 : 4;
    const shapes = difficulty === 'Kolay' ? ['⭐', '🔵', '🔺', '🟩'] : ['⭐', '🔵', '🔺', '🟩', '💜', '🟠'];
    const prompt = `"${difficulty}" zorluk seviyesinde ${size}x${size} boyutunda "Şekil Sudokusu" üret.
    Kullanılacak şekiller: ${shapes.join(', ')}
    Kural: Her satır ve sütunda her şekil tam bir kez bulunmalı.
    grid: ${size}x${size} dizi (boşluklar "" olarak). solution: tamamen dolu ${size}x${size} dizi.
    Başlangıçta hücrelerin %30-40'ı dolu olmalı, geri kalanı boş ("").
    ${MATH_PEDAGOGICAL_PROMPT} ${worksheetCount} adet çalışma sayfası üret.`;

    const schema = { type: 'ARRAY', items: mathSchema };
    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Şekil Sudokusu',
        instruction: p.instruction || 'Her satır ve sütunda her şekil bir kez olacak şekilde doldur.',
        grid: Array.isArray(p.grid) ? p.grid : [],
        solution: Array.isArray(p.solution) ? p.solution : [],
        pedagogicalNote: p.pedagogicalNote || 'Mantıksal çıkarım, örüntü tanıma ve uzamsal düzenleme becerilerini geliştirir.'
    }));
};

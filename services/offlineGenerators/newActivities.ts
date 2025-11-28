
import { FamilyRelationsData, LogicDeductionData, NumberBoxLogicData, MapInstructionData, GeneratorOptions, MindGamesData } from '../../types';
import { getRandomItems, getRandomInt, shuffle } from './helpers';

export const generateOfflineFamilyRelations = async (options: GeneratorOptions): Promise<FamilyRelationsData[]> => {
    const { worksheetCount, itemCount } = options;
    const count = itemCount || 10;

    const allRelations = [
        { def: "Annemin kız kardeşidir.", term: "teyze" },
        { def: "Babamın annesidir.", term: "babaanne" },
        { def: "Babamın kız kardeşidir.", term: "hala" },
        { def: "Annemin annesidir.", term: "anneanne" },
        { def: "Annemin erkek kardeşidir.", term: "dayı" },
        { def: "Babamın erkek kardeşidir.", term: "amca" },
        { def: "Babamın babasıdır.", term: "dede" },
        { def: "Annemin babasıdır.", term: "büyükbaba" }, // or dede
        { def: "Amcamın karısıdır.", term: "yenge" },
        { def: "Dayımın çocuğudur.", term: "kuzen" },
        { def: "Halamın kocasıdır.", term: "enişte" },
        { def: "Kız kardeşimin oğludur.", term: "yeğen" }
    ];

    return Array.from({ length: worksheetCount }, () => {
        const selection = getRandomItems(allRelations, Math.min(count, allRelations.length));
        // Left is definitions, Right is terms (shuffled)
        const leftColumn = selection.map((item, i) => ({ text: item.def, id: i }));
        const rightColumn = shuffle(selection.map((item, i) => ({ text: item.term, id: i })));

        return {
            title: "Akrabalık İlişkileri",
            instruction: "Aşağıdaki tanımlarla kişileri eşleştiriniz.",
            pedagogicalNote: "Kavramsal eşleştirme ve akrabalık terimleri farkındalığı.",
            imagePrompt: "Aile Ağacı",
            leftColumn,
            rightColumn
        };
    });
};

export const generateOfflineLogicDeduction = async (options: GeneratorOptions): Promise<LogicDeductionData[]> => {
    const { worksheetCount, itemCount } = options;
    const count = itemCount || 4;

    const templates = [
        {
            category: "Kıyafet",
            context: "denize girerken giyilen giysinin bulunduğu kutudadır.",
            negation: "vücudumuzun üst kısmına giydiğimiz bir giyecektir.", // Trick part
            answer: "mayo",
            distractors: ["etek", "kazak", "şort", "gömlek"]
        },
        {
            category: "Meyve",
            context: "çekirdekli bir meyvenin olmadığı kutudadır.",
            negation: "kırmızı renkli değildir.",
            answer: "muz",
            distractors: ["kiraz", "karpuz", "elma", "çilek"]
        },
        {
            category: "Taşıt",
            context: "raylarda giden bir taşıtın bulunduğu kutudadır.",
            negation: "yük taşımak için kullanılmaz.",
            answer: "tramvay",
            distractors: ["kamyon", "tır", "bisiklet", "gemi"]
        },
        {
            category: "Eşya",
            context: "soğukta kafamıza taktığımız bir eşyanın bulunduğu kutudadır.",
            negation: "vücudumuzun alt kısmına giydiğimiz bir giyecek değildir.",
            answer: "bere",
            distractors: ["pantolon", "ceket", "gömlek", "çorap"]
        }
    ];

    return Array.from({ length: worksheetCount }, () => {
        const questions = Array.from({ length: count }).map((_, i) => {
            // Generate dynamic riddle
            const t = templates[i % templates.length];
            const opts = shuffle([t.answer, ...getRandomItems(t.distractors, 4)]);
            const correctLetter = String.fromCharCode(97 + opts.indexOf(t.answer)); // a, b, c, d, e

            return {
                riddle: `Aradığımız ${t.category.toLowerCase()} ${t.context} Bu ${t.category.toLowerCase()} ${t.negation} Bu ${t.category.toLowerCase()} aşağıdakilerden hangisi olabilir?`,
                options: opts,
                answerIndex: opts.indexOf(t.answer),
                correctLetter
            };
        });

        return {
            title: "Mantıksal Çıkarım Bulmacaları",
            instruction: "Aşağıdaki ifadeleri okuyun ve doğru seçeneği bulun.",
            pedagogicalNote: "Okuduğunu anlama, yönerge takibi ve eleme yöntemiyle problem çözme.",
            imagePrompt: "Dedektif",
            questions,
            scoringText: "a=1 b=2 c=3 d=4 e=5\nDoğru cevaplarındaki sayı değerlerinin toplamını bulun."
        };
    });
};

export const generateOfflineNumberBoxLogic = async (options: GeneratorOptions): Promise<NumberBoxLogicData[]> => {
    const { worksheetCount, itemCount, numberRange } = options;
    const count = itemCount || 2;
    let maxVal = 20;
    if (numberRange === '1-50') maxVal = 50;
    if (numberRange === '1-100') maxVal = 100;

    return Array.from({ length: worksheetCount }, () => {
        const puzzles = Array.from({ length: count }).map(() => {
            const box1 = Array.from({ length: 4 }, () => getRandomInt(1, maxVal));
            const box2 = Array.from({ length: 4 }, () => getRandomInt(1, maxVal));
            
            // Ensure uniqueness in boxes for clarity
            while(new Set(box1).size !== box1.length) box1[0] = getRandomInt(1, maxVal);
            while(new Set(box2).size !== box2.length) box2[0] = getRandomInt(1, maxVal);

            const max1 = Math.max(...box1);
            const min1 = Math.min(...box1);
            const even1 = box1.filter(n => n % 2 === 0);
            
            const questions = [
                {
                    text: "Aradığımız sayı sol kutudadır. Bulunduğu kutudaki en büyük sayıdır.",
                    options: shuffle([max1.toString(), min1.toString(), box2[0].toString(), box1[1].toString()]),
                    correctAnswer: max1.toString()
                },
                {
                    text: "Aradığımız sayı sağ kutudadır. Bulunduğu kutudaki en küçük sayıdır.",
                    options: shuffle([Math.min(...box2).toString(), Math.max(...box2).toString(), box1[0].toString(), (Math.min(...box2)+1).toString()]),
                    correctAnswer: Math.min(...box2).toString()
                }
            ];

            return { box1, box2, questions };
        });

        return {
            title: "Kutulu Sayı Analizi",
            instruction: "Kutulardaki sayıları inceleyin ve soruları cevaplayın.",
            pedagogicalNote: "Sayıları karşılaştırma, sınıflandırma ve yönerge takibi.",
            imagePrompt: "Sayı Kutuları",
            puzzles
        };
    });
};

export const generateOfflineMapInstruction = async (options: GeneratorOptions): Promise<MapInstructionData[]> => {
    const { worksheetCount, itemCount } = options;
    
    // Simplified Representation of Turkey Map regions/cities for offline coordinates
    // This will be used by the SVG renderer to place dots or regions.
    // For offline generator, we just provide the text instructions.
    const cities = [
        { name: "İstanbul", x: 20, y: 15 }, { name: "Ankara", x: 45, y: 30 }, { name: "İzmir", x: 10, y: 40 },
        { name: "Antalya", x: 30, y: 65 }, { name: "Adana", x: 55, y: 60 }, { name: "Erzurum", x: 80, y: 25 },
        { name: "Diyarbakır", x: 75, y: 50 }, { name: "Trabzon", x: 70, y: 10 }, { name: "Konya", x: 45, y: 50 },
        { name: "Van", x: 90, y: 45 }, { name: "Bursa", x: 20, y: 25 }, { name: "Samsun", x: 60, y: 10 }
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
            mapSvg: "TURKEY_MAP_PLACEHOLDER", // Frontend will render the actual SVG
            cities,
            instructions: getRandomItems(instructions, itemCount || 8)
        };
    });
};

// --- ENHANCED OFFLINE MIND GAMES (Akıl Oyunları 3-4. Sınıf) ---
export const generateOfflineMindGames = async (options: GeneratorOptions): Promise<MindGamesData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const count = itemCount || 4;
    
    return Array.from({ length: worksheetCount }, () => {
        const puzzles = Array.from({ length: count }).map(() => {
            const typeRoll = Math.random();
            const multiplier = difficulty === 'Başlangıç' ? 1 : (difficulty === 'Orta' ? 2 : 4);
            
            // 1. Shape Math (Triangle Logic) - %25 Chance
            if (typeRoll < 0.25) {
                // Logic: Sum of corners = Center
                const n1 = getRandomInt(2, 10 * multiplier);
                const n2 = getRandomInt(2, 10 * multiplier);
                const n3 = getRandomInt(2, 10 * multiplier);
                const center = n1 + n2 + n3;
                
                return {
                    type: 'shape_math' as const,
                    shape: 'triangle' as const,
                    numbers: [n1, n2, n3, '?'], // Corners + Center(target)
                    answer: center.toString(),
                    hint: "Köşelerdeki sayıları topla.",
                    imagePrompt: "Sayı üçgeni",
                    question: "Soru işareti yerine hangi sayı gelmelidir?"
                };
            } 
            // 2. Matrix Logic (Kurallı Dikdörtgenler) - %25 Chance
            else if (typeRoll < 0.5) {
                // Logic: Row 2 = Row 1 * K
                const k = getRandomInt(2, 4);
                const r1 = [getRandomInt(2, 8), getRandomInt(2, 8), getRandomInt(2, 8)];
                const r2 = r1.map(n => n * k);
                
                // Hide middle item of second row
                const grid = [
                    [r1[0], r1[1], r1[2]],
                    [r2[0], '?', r2[2]]
                ];
                
                return {
                    type: 'matrix_logic' as const,
                    grid: grid as any,
                    answer: r2[1].toString(),
                    hint: `Alt satır üst satırın ${k} katıdır.`,
                    question: "Tablodaki kuralı bul ve boşluğu doldur."
                };
            }
            // 3. Hexagon Logic (Altıgen Örüntü) - %25 Chance
            else if (typeRoll < 0.75) {
                // Logic: Opposite numbers sum to Center OR simple arithmetic on outer circle
                // Let's do: Center is Sum of Top-Left and Bottom-Right opposites
                const center = getRandomInt(20, 50);
                const pairs = [
                    [getRandomInt(1, center-1), 0],
                    [getRandomInt(1, center-1), 0],
                    [getRandomInt(1, center-1), 0]
                ];
                // Calculate pairs to sum to center
                pairs[0][1] = center - pairs[0][0];
                pairs[1][1] = center - pairs[1][0];
                pairs[2][1] = center - pairs[2][0];
                
                const nums = [
                    pairs[0][0], pairs[1][0], pairs[2][0], // Top-Left, Top-Right, Right
                    pairs[0][1], pairs[1][1], pairs[2][1], // Bottom-Right, Bottom-Left, Left
                    center // Center
                ];
                
                // Hide one random outer number
                const hiddenIdx = getRandomInt(0, 5);
                const ans = nums[hiddenIdx];
                nums[hiddenIdx] = '?' as any;
                
                return {
                    type: 'hexagon_logic' as const,
                    numbers: nums,
                    answer: ans.toString(),
                    hint: "Karşılıklı sayıların toplamı ortadaki sayıya eşittir.",
                    question: "Eksik sayıyı bulun."
                };
            }
            // 4. Function Machine (Üç Aşağı Beş Yukarı) - %25 Chance
            else {
                // Input -> Rule -> Output
                const factor = getRandomInt(2, 5);
                const add = getRandomInt(1, 10);
                const input = getRandomInt(5, 15);
                const output = input * factor + add;
                
                return {
                    type: 'function_machine' as const,
                    input: input,
                    output: '?',
                    rule: `x ${factor} + ${add}`,
                    answer: output.toString(),
                    hint: `Giriş sayısını ${factor} ile çarpıp ${add} ekle.`,
                    question: "Makineden çıkan sonuç ne olur?"
                };
            }
        });

        return {
            title: "Akıl Oyunları (Hızlı Mod)",
            instruction: "Mantığını kullan, kuralı keşfet ve soru işaretinin yerine gelmesi gereken sayıyı bul.",
            pedagogicalNote: "Mantıksal akıl yürütme, örüntü tanıma, işlem becerisi ve görsel algı.",
            imagePrompt: "Zeka Oyunu",
            puzzles
        };
    });
};

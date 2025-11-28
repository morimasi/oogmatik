
import { FamilyRelationsData, LogicDeductionData, NumberBoxLogicData, MapInstructionData, GeneratorOptions, MindGamesData, MindGames56Data } from '../../types';
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

// --- MIND GAMES (3-4. Sınıf) ---
export const generateOfflineMindGames = async (options: GeneratorOptions): Promise<MindGamesData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const count = itemCount || 4;
    
    return Array.from({ length: worksheetCount }, () => {
        const puzzles = Array.from({ length: count }).map(() => {
            const typeRoll = Math.random();
            const multiplier = difficulty === 'Başlangıç' ? 1 : (difficulty === 'Orta' ? 2 : 4);
            
            if (typeRoll < 0.25) { // Shape Math
                const n1 = getRandomInt(2, 10 * multiplier);
                const n2 = getRandomInt(2, 10 * multiplier);
                const n3 = getRandomInt(2, 10 * multiplier);
                const center = n1 + n2 + n3;
                return { type: 'shape_math' as const, shape: 'triangle' as const, numbers: [n1, n2, n3, '?'], answer: center.toString(), hint: "Köşeleri topla.", imagePrompt: 'Üçgen' };
            } 
            else if (typeRoll < 0.5) { // Matrix Logic
                const k = getRandomInt(2, 4);
                const r1 = [getRandomInt(2, 8), getRandomInt(2, 8), getRandomInt(2, 8)];
                const r2 = r1.map(n => n * k);
                return { type: 'matrix_logic' as const, grid: [r1, [r2[0], '?', r2[2]]] as any, answer: r2[1].toString(), hint: `Alt satır, üstün ${k} katıdır.`, imagePrompt: 'Matris' };
            }
            else if (typeRoll < 0.75) { // Hexagon Logic
                const center = getRandomInt(20, 50);
                const p1 = getRandomInt(1, center-1);
                const p2 = getRandomInt(1, center-1);
                const p3 = getRandomInt(1, center-1);
                const nums = [p1, p2, p3, center-p1, center-p2, center-p3, center];
                const hiddenIdx = getRandomInt(0, 5);
                const ans = nums[hiddenIdx];
                nums[hiddenIdx] = '?' as any;
                return { type: 'hexagon_logic' as const, numbers: nums, answer: ans.toString(), hint: "Karşılıklı sayılar ortayı verir.", imagePrompt: 'Altıgen' };
            }
            else { // Function Machine
                const factor = getRandomInt(2, 5);
                const add = getRandomInt(1, 10);
                const input = getRandomInt(5, 15);
                const output = input * factor + add;
                return { type: 'function_machine' as const, input: input, output: '?', rule: `x ${factor} + ${add}`, answer: output.toString(), hint: `Sayıyı ${factor} ile çarp, ${add} ekle.`, imagePrompt: 'Fonksiyon' };
            }
        });

        return {
            title: "Akıl Oyunları (Hızlı Mod)",
            instruction: "Kuralı keşfet ve '?' yerine gelecek sayıyı bul.",
            pedagogicalNote: "Mantıksal akıl yürütme, örüntü tanıma ve işlem becerisi.",
            imagePrompt: "Zeka Oyunu",
            puzzles
        };
    });
};


// --- MIND GAMES (5-6. Sınıf) ---
export const generateOfflineMindGames56 = async (options: GeneratorOptions): Promise<MindGames56Data[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const count = itemCount || 4;

    const puzzleGenerators = [
        // Word Problem: System of Equations (Portakal Sayısı)
        () => {
            const a_g = getRandomInt(8, 15);
            const e_a = getRandomInt(8, 15);
            const e_g = getRandomInt(5, a_g - 1);
            const total = (a_g + e_a + e_g);
            if (total % 2 !== 0) return null; // Ensure solvable with integer
            const answer = total / 2;
            return {
                type: 'word_problem' as const,
                title: 'Paylaşım Problemi',
                question: `Açelya ile Görkem birlikte ${a_g} tane; Esra ile Açelya ${e_a} tane; Esra ile Görkem ise ${e_g} tane portakal yemiştir. Üçü birlikte toplam kaç portakal yemiştir?`,
                answer: answer.toString(),
                hint: 'Tüm verileri alt alta toplayıp ne elde ettiğine bak.',
                imagePrompt: 'Portakal'
            };
        },
        // Cipher: Non-standard operation (Nasıl Bir İlişki Var?)
        () => {
            const n1 = getRandomInt(1, 9);
            const n2 = getRandomInt(n1, 9);
            const n3 = getRandomInt(1, 9);
            const n4 = getRandomInt(n3, 9);
            
            return {
                type: 'cipher' as const,
                title: 'Sıradışı İşlem',
                question: `Aşağıdaki işlemlerde '⌾' sembolü gizli bir kurala göre işlem yapmaktadır:\n- ${n1} ⌾ ${n2} = ${String(n1+n2) + String(n2-n1)}\n- ${n3} ⌾ ${n4} = ${String(n3+n4) + String(n4-n3)}\nBu kurala göre, 7 ⌾ 9 işleminin sonucu kaçtır?`,
                answer: String(7+9) + String(9-7),
                hint: 'Sayıları toplayıp başa, farkını alıp sona yaz.',
                imagePrompt: 'İşlem'
            };
        },
        // Number Sequence: Fibonacci-like
        () => {
            const start1 = getRandomInt(1, 5);
            const start2 = getRandomInt(start1, 7);
            const sequence = [start1, start2];
            for(let i=0; i<4; i++) {
                sequence.push(sequence[i] + sequence[i+1]);
            }
            return {
                type: 'number_sequence' as const,
                title: 'Örüntü Sorusu',
                question: `Aşağıdaki sayı dizisinin kuralını bulun ve bir sonraki sayıyı yazın:\n${sequence.slice(0, 5).join(', ')}, ?`,
                answer: sequence[5].toString(),
                hint: 'Her sayı, kendinden önceki iki sayının toplamıdır.',
                imagePrompt: 'Örüntü'
            };
        }
    ];

    return Array.from({ length: worksheetCount }, () => {
        const puzzles = [];
        for(let i=0; i<count; i++) {
            const gen = puzzleGenerators[i % puzzleGenerators.length];
            const puzzle = gen();
            if(puzzle) puzzles.push(puzzle);
        }

        return {
            title: "Akıl Oyunları (5-6. Sınıf)",
            instruction: "Her bir bulmacayı dikkatlice oku ve çöz.",
            pedagogicalNote: "Üst düzey mantıksal akıl yürütme, problem çözme stratejileri ve esnek düşünme.",
            imagePrompt: "Strateji Oyunu",
            puzzles
        };
    });
};

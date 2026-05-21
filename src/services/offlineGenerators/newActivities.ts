
import { getRandomInt, shuffle, getRandomItems, getWordsForDifficulty, turkishAlphabet, VISUALLY_SIMILAR_CHARS } from './helpers';
import { SyllableWordBuilderData, FamilyRelationsData, FamilyLogicTestData, GeneratorOptions, FindLetterPairData } from '../../types';

// ... Family Pool definitions remain unchanged ...
const FAMILY_POOL_BASIC = [
    { label: "Baba", definition: "Annenin kocası, senin erkek ebeveynin.", side: "none" },
    { label: "Anne", definition: "Babanın karısı, senin kadın ebeveynin.", side: "none" },
    { label: "Ağabey", definition: "Senden büyük olan erkek kardeşin.", side: "none" },
    { label: "Abla", definition: "Senden büyük olan kız kardeşin.", side: "none" }
];

const FAMILY_POOL_EXTENDED = [
    { label: "Hala", definition: "Babanın kız kardeşi.", side: "dad" },
    { label: "Amca", definition: "Babanın erkek kardeşi.", side: "dad" },
    { label: "Teyze", definition: "Annenin kız kardeşi.", side: "mom" },
    { label: "Dayı", definition: "Annenin erkek kardeşi.", side: "mom" },
    { label: "Büyükanne", definition: "Annenin veya babanın annesi.", side: "both" },
    { label: "Büyükbaba", definition: "Annenin veya babanın babası.", side: "both" },
    { label: "Kuzen", definition: "Hala, teyze, amca veya dayının çocuğu.", side: "both" }
];

export const generateOfflineFindLetterPair = async (options: GeneratorOptions): Promise<FindLetterPairData[]> => {
    const { 
        worksheetCount = 1, 
        difficulty = 'Orta', 
        itemCount = 1, 
        targetPair 
    } = options;
    
    // Premium Dolu Dolu A4 için Izgara Boyutu
    const rows = options.gridRows || (difficulty === 'Zor' ? 16 : 14);
    const cols = options.gridCols || (difficulty === 'Zor' ? 14 : 12);

    const pages: FindLetterPairData[] = [];

    const getSimilars = (char: string) => {
        // Hedef harfe görsel olarak çok benzeyen çeldiriciler (Ketleme için kritik)
        const pool = VISUALLY_SIMILAR_CHARS.filter(c => c !== char);
        return pool.length > 5 ? pool : [...pool, ...['b','d','p','q','o','a','u','n','m','w']];
    };

    for (let p = 0; p < worksheetCount; p++) {
        const grids = [];
        // Tek sayfada 1 büyük veya 2 orta boy ızgara (layout'a göre)
        const logicalItemCount = itemCount || (difficulty === 'Zor' ? 1 : 2);
        
        for (let i = 0; i < logicalItemCount; i++) {
            const pair = (targetPair || (Math.random() > 0.5 ? 'bd' : 'pq')).toLowerCase().substring(0, 2);

            const matrix = Array.from({ length: rows }, () =>
                Array.from({ length: cols }, () => {
                    const pool = (difficulty === 'Zor' || difficulty === 'Uzman' || Math.random() > 0.3)
                        ? getSimilars(pair[0])
                        : turkishAlphabet.split('');
                    return pool[getRandomInt(0, pool.length - 1)];
                })
            );

            // HEDEF YERLEŞTİRME: %15 doluluk oranı (Yoğun tarama için)
            const countToPlace = Math.floor((rows * cols) * 0.15); 

            for (let k = 0; k < countToPlace; k++) {
                const r = getRandomInt(0, rows - 1);
                const c = getRandomInt(0, cols - 2); 
                matrix[r][c] = pair[0];
                matrix[r][c + 1] = pair[1];
            }

            grids.push({
                grid: matrix.map(row => row.map(cell => options.case === 'upper' ? cell.toLocaleUpperCase('tr') : cell)),
                targetPair: options.case === 'upper' ? pair.toLocaleUpperCase('tr') : pair
            });
        }
        
        pages.push({
            title: "🔍 Harf İkilisi Dedektifi: Ultra Pro",
            instruction: "Aşağıdaki yoğun harf havuzunu dikkatle tara. Hedef ikiliyi (yan yana gelmiş hallerini) bul ve daire içine al. Unutma, harfler birbirine çok benziyor!",
            grids,
            settings: {
                gridSize: Math.max(rows, cols),
                itemCount: logicalItemCount,
                difficulty: difficulty,
                ultraCompact: true,
                clinicalFocus: 'Visual Scanning & Interference Control'
            },
            pedagogicalNote: 'Bu etkinlik, benzer harfler (b-d, p-q) arasındaki görsel ayrıştırma becerisini geliştirirken, yoğun çeldiricilerle ketleme kontrolünü (inhibition) en üst düzeye çıkarır.'
        } as any);
    }
    return pages;
};


// ... (Other functions generateOfflineFamilyRelations, generateOfflineFamilyLogicTest, generateOfflineSyllableWordBuilder remain unchanged) ...
export const generateOfflineFamilyRelations = async (options: GeneratorOptions): Promise<FamilyRelationsData[]> => {
    const { worksheetCount = 1, difficulty, itemCount = 8 } = options;
    const pages: FamilyRelationsData[] = [];

    for (let p = 0; p < worksheetCount; p++) {
        let pool = [...FAMILY_POOL_BASIC];
        if (difficulty !== 'Başlangıç') pool = [...pool, ...FAMILY_POOL_EXTENDED];

        const selection = shuffle(pool).slice(0, itemCount);
        const momRelatives = selection.filter(s => s.side === 'mom').map(s => s.label);
        const dadRelatives = selection.filter(s => s.side === 'dad').map(s => s.label);

        pages.push({
            title: "Akrabalık İlişkileri Atölyesi",
            instruction: "Aşağıdaki tanımları doğru akrabalık isimleri ile eşleştirin ve anne/baba tarafı olarak gruplandırın.",
            pairs: selection.map(s => ({ definition: s.definition, label: s.label, side: s.side as any })),
            momRelatives,
            dadRelatives,
            difficulty: difficulty || 'Orta'
        });
    }
    return pages;
};

export const generateOfflineFamilyLogicTest = async (options: GeneratorOptions): Promise<FamilyLogicTestData[]> => {
    const { worksheetCount = 1, difficulty, itemCount = 8 } = options;
    const pages: FamilyLogicTestData[] = [];

    const statements = [
        { text: "Babamın erkek kardeşi benim amcam olur.", isTrue: true },
        { text: "Annemin kız kardeşi benim halam olur.", isTrue: false },
        { text: "Amcamın oğlu benim kuzenim olur.", isTrue: true },
        { text: "Teyzemin annesi benim anneannem olur.", isTrue: true },
        { text: "Dayımın babası benim dedem olur.", isTrue: true },
        { text: "Halamın kocası benim eniştem olur.", isTrue: true },
        { text: "Annemin erkek kardeşi benim amcam olur.", isTrue: false },
        { text: "Babamın annesi benim babaannem olur.", isTrue: true }
    ];

    for (let p = 0; p < worksheetCount; p++) {
        pages.push({
            title: "Akrabalık Mantık Testi",
            instruction: "Aşağıdaki cümleleri okuyun. Doğru olanlar için (D), yanlış olanlar için (Y) kutusunu işaretleyin.",
            statements: shuffle(statements).slice(0, itemCount),
            difficulty: difficulty || 'Orta'
        });
    }
    return pages;
};

export const generateOfflineSyllableWordBuilder = async (options: GeneratorOptions): Promise<SyllableWordBuilderData[]> => {
    const { worksheetCount = 1, _difficulty, _itemCount = 4 } = options;
    const words = [
        { word: "ARABA", syllables: ["A", "RA", "BA"], img: "car" },
        { word: "KİTAP", syllables: ["Kİ", "TAP"], img: "book" },
        { word: "ELMA", syllables: ["EL", "MA"], img: "apple" },
        { word: "GÜNEŞ", syllables: ["GÜ", "NEŞ"], img: "sun" }
    ];
    return Array.from({ length: worksheetCount ?? 1 }, () => ({
        title: "Hece Dedektifi",
        instruction: "Karışık verilen heceleri birleştirerek görsele uygun kelimeyi oluştur.",
        words: words.map((w, i) => ({ id: i, targetWord: w.word, syllables: w.syllables, imagePrompt: w.img })),
        syllableBank: shuffle(words.flatMap(w => w.syllables))
    }));
};

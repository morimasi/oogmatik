
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
    const { worksheetCount = 1, difficulty = 'Orta', itemCount = 6, topic = 'animals', syllableRange = '2-3' } = options;
    
    // Premium Kelime Havuzu (Konu ve Hece Yoğunluğuna Göre)
    const WORD_POOLS = {
        animals: [
            { word: "KEDİ", syllables: ["KE", "Dİ"], img: "cute cat" },
            { word: "KÖPEK", syllables: ["KÖ", "PEK"], img: "friendly dog" },
            { word: "KUŞ", syllables: ["KUŞ"], img: "colorful bird" },
            { word: "TAVUK", syllables: ["TA", "VUK"], img: "chicken" },
            { word: "KOYUN", syllables: ["KO", "YUN"], img: "sheep" },
            { word: "İNEK", syllables: ["İ", "NEK"], img: "cow" },
            { word: "AT", syllables: ["AT"], img: "horse" },
            { word: "FİL", syllables: ["FİL"], img: "elephant" }
        ],
        fruits: [
            { word: "ELMA", syllables: ["EL", "MA"], img: "red apple" },
            { word: "ARMUT", syllables: ["AR", "MUT"], img: "pear" },
            { word: "KİRAZ", syllables: ["Kİ", "RAZ"], img: "cherries" },
            { word: "ÇİLEK", syllables: ["Çİ", "LEK"], img: "strawberry" },
            { word: "PORTAKAL", syllables: ["POR", "TA", "KAL"], img: "orange" },
            { word: "MUZ", syllables: ["MUZ"], img: "banana" },
            { word: "ÜZÜM", syllables: ["Ü", "ZÜM"], img: "grapes" },
            { word: "KAVUN", syllables: ["KA", "VUN"], img: "melon" }
        ],
        school: [
            { word: "KİTAP", syllables: ["Kİ", "TAP"], img: "book" },
            { word: "KALEM", syllables: ["KA", "LEM"], img: "pencil" },
            { word: "MASA", syllables: ["MA", "SA"], img: "school desk" },
            { word: "SINIF", syllables: ["Sİ", "NİF"], img: "classroom" },
            { word: "DEFTAR", syllables: ["DEF", "TAR"], img: "notebook" },
            { word: "BOYA", syllables: ["BO", "YA"], img: "crayons" },
            { word: "OKUL", syllables: ["O", "KUL"], img: "school building" },
            { word: "ÖĞRETMEN", syllables: ["ÖĞ", "RET", "MEN"], img: "teacher" }
        ],
        nature: [
            { word: "GÜNEŞ", syllables: ["GÜ", "NEŞ"], img: "sun" },
            { word: "YILDIZ", syllables: ["YIL", "DIZ"], img: "star" },
            { word: "AY", syllables: ["AY"], img: "moon" },
            { word: "ÇİÇEK", syllables: ["Çİ", "ÇEK"], img: "flower" },
            { word: "AĞAÇ", syllables: ["A", "ĞAÇ"], img: "tree" },
            { word: "DENİZ", syllables: ["DE", "NİZ"], img: "sea" },
            { word: "DAĞ", syllables: ["DAĞ"], img: "mountain" },
            { word: "YAĞMUR", syllables: ["YAĞ", "MUR"], img: "rain" }
        ]
    };

    const [minSyl, maxSyl] = syllableRange.split('-').map(Number);
    const selectedPool = WORD_POOLS[topic as keyof typeof WORD_POOLS] || WORD_POOLS.animals;
    
    // Hece sayısına göre filtrele
    const filteredWords = selectedPool.filter(w => w.syllables.length >= minSyl && w.syllables.length <= maxSyl);
    
    // Dolu dolu A4 için kelime sayısı
    const finalItemCount = itemCount || (difficulty === 'Zor' ? 8 : difficulty === 'Orta' ? 6 : 4);
    
    return Array.from({ length: worksheetCount || 1 }, () => {
        const selectedWords = getRandomItems(filteredWords, finalItemCount);
        const syllableBank = shuffle(selectedWords.flatMap(w => w.syllables));
        
        return {
            title: "Hece Dedektifi: Premium Pro",
            instruction: "Hece havuzundaki harf gruplarını birleştirerek görsellere uygun kelimeleri oluştur. Her kelime için doğru heceleri yerleştir.",
            words: selectedWords.map((w, i) => ({ 
                id: i, 
                targetWord: w.word, 
                syllables: w.syllables, 
                imagePrompt: w.img 
            })),
            syllableBank,
            settings: {
                aestheticMode: 'ultra-compact',
                pageFormat: 'A4',
                margins: { top: 15, bottom: 15, left: 12, right: 12 },
                difficulty,
                topic,
                syllableRange,
                itemCount: finalItemCount
            }
        };
    });
};

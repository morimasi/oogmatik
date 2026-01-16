
import { getRandomInt, shuffle, getRandomItems, simpleSyllabify, getWordsForDifficulty, turkishAlphabet, VISUALLY_SIMILAR_CHARS } from './helpers';
import { SyllableWordBuilderData, FamilyRelationsData, FamilyLogicTestData, GeneratorOptions, FindLetterPairData } from '../../types';

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
    const { worksheetCount, difficulty, itemCount = 1, gridSize = 10, targetPair } = options;
    const pages: FindLetterPairData[] = [];

    const getSimilars = (char: string) => {
        const pool = VISUALLY_SIMILAR_CHARS.filter(c => c !== char);
        return pool.length > 0 ? pool : turkishAlphabet.split('');
    };

    for (let p = 0; p < worksheetCount; p++) {
        const grids = [];
        for (let i = 0; i < itemCount; i++) {
            const pair = (targetPair || (Math.random() > 0.5 ? 'bd' : 'pq')).toLowerCase().substring(0, 2);
            const size = gridSize || 10;
            const matrix = Array.from({ length: size }, () => 
                Array.from({ length: size }, () => {
                    const pool = (difficulty === 'Zor' || difficulty === 'Uzman') 
                        ? getSimilars(pair[0]) 
                        : turkishAlphabet.split('');
                    return pool[getRandomInt(0, pool.length - 1)];
                })
            );
            const countToPlace = Math.floor(size * 1.2);
            for (let k = 0; k < countToPlace; k++) {
                const r = getRandomInt(0, size - 1);
                const c = getRandomInt(0, size - 2);
                matrix[r][c] = pair[0];
                matrix[r][c + 1] = pair[1];
            }
            grids.push({ 
                grid: matrix.map(row => row.map(cell => cell.toLocaleUpperCase('tr'))), 
                targetPair: pair.toLocaleUpperCase('tr') 
            });
        }
        pages.push({
            title: "Harf İkilisi Dedektifi",
            instruction: "Tabloları dikkatlice tara ve hedef ikilileri bulup daire içine al.",
            pedagogicalNote: "Görsel ayrıştırma, hızlı tarama ve fonolojik sentez kapasitesini ölçer.",
            grids,
            settings: { gridSize: gridSize || 10, itemCount, difficulty: difficulty || 'Orta' }
        });
    }
    return pages;
};

export const generateOfflineFamilyRelations = async (options: GeneratorOptions): Promise<FamilyRelationsData[]> => {
    const { worksheetCount, difficulty, itemCount = 8 } = options;
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
            pedagogicalNote: "Sosyal biliş, hiyerarşik sınıflama ve ilişkisel mantık becerilerini geliştirir.",
            pairs: selection.map(s => ({ definition: s.definition, label: s.label, side: s.side as any })),
            momRelatives,
            dadRelatives,
            difficulty: difficulty || 'Orta'
        });
    }
    return pages;
};

export const generateOfflineFamilyLogicTest = async (options: GeneratorOptions): Promise<FamilyLogicTestData[]> => {
    const { worksheetCount, difficulty, itemCount = 8 } = options;
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
            pedagogicalNote: "Sözel muhakeme, akıl yürütme ve işleyen bellek kapasitesini destekler.",
            statements: shuffle(statements).slice(0, itemCount),
            difficulty: difficulty || 'Orta'
        });
    }
    return pages;
};

export const generateOfflineSyllableWordBuilder = async (options: GeneratorOptions): Promise<SyllableWordBuilderData[]> => {
    const { worksheetCount, difficulty, itemCount = 4 } = options;
    const words = [
        { word: "ARABA", syllables: ["A", "RA", "BA"], img: "car" },
        { word: "KİTAP", syllables: ["Kİ", "TAP"], img: "book" },
        { word: "ELMA", syllables: ["EL", "MA"], img: "apple" },
        { word: "GÜNEŞ", syllables: ["GÜ", "NEŞ"], img: "sun" }
    ];
    return Array.from({ length: worksheetCount }, () => ({
        title: "Hece Dedektifi",
        instruction: "Karışık verilen heceleri birleştirerek görsele uygun kelimeyi oluştur.",
        pedagogicalNote: "Fonolojik sentez ve görsel-sözel ilişkilendirme.",
        words: words.map((w, i) => ({ id: i, targetWord: w.word, syllables: w.syllables, imagePrompt: w.img })),
        syllableBank: shuffle(words.flatMap(w => w.syllables))
    }));
};


import { GeneratorOptions, PseudowordReadingData, MorphologicalAnalysisData } from '../../types';
import { getRandomItems, shuffle } from './helpers';

// --- PSEUDOWORD GENERATOR ENGINE (PROFESSIONAL) ---
const VOWELS = ['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü'];
const CONSONANTS = ['b', 'c', 'ç', 'd', 'f', 'g', 'ğ', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 'ş', 't', 'v', 'y', 'z'];
const CRITICAL_CONSONANTS = ['b', 'd', 'p', 'q', 'm', 'n'];

const generateSyllable = (type: string): string => {
    const v = VOWELS[Math.floor(Math.random() * VOWELS.length)];
    const c1 = CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)];
    const c2 = CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)];
    const crit = CRITICAL_CONSONANTS[Math.floor(Math.random() * CRITICAL_CONSONANTS.length)];

    switch (type) {
        case 'CV': return (Math.random() > 0.4 ? crit : c1) + v;
        case 'VC': return v + c1;
        case 'CVC': return c1 + v + (Math.random() > 0.5 ? crit : c2);
        case 'CCV': return c1 + c2 + v;
        default: return c1 + v;
    }
};

const generatePseudoWordByStructure = (structure: string): string => {
    let word = "";
    if (structure === 'basic') {
        word = generateSyllable('CV') + generateSyllable('CV');
    } else if (structure === 'medium') {
        word = (Math.random() > 0.5 ? generateSyllable('CVC') : generateSyllable('CV')) + generateSyllable('CVC');
    } else if (structure === 'hard') {
        word = generateSyllable('CCV') + generateSyllable('CV') + (Math.random() > 0.5 ? 'st' : 'rt');
    } else {
        // Mixed
        const len = Math.random() > 0.5 ? 2 : 3;
        for(let i=0; i<len; i++) word += generateSyllable(Math.random() > 0.7 ? 'CVC' : 'CV');
    }
    return word;
};

export const generateOfflinePseudowordReading = async (options: GeneratorOptions): Promise<PseudowordReadingData[]> => {
    const { worksheetCount, difficulty, variant, itemCount = 24, gridSize = 4, syllableStructure = 'mixed' } = options;

    return Array.from({ length: worksheetCount }, () => {
        const words = [];
        for (let i = 0; i < itemCount; i++) {
            words.push(generatePseudoWordByStructure(syllableStructure as string));
        }

        return {
            title: "Sözde Kelime Okuma Analizi",
            instruction: "Aşağıdaki kelimeler gerçek değildir. Lütfen her birini yüksek sesle ve hızlıca okumaya çalış.",
            pedagogicalNote: "Sözde kelime okuma, öğrencinin kelime ezberleme stratejisini devre dışı bırakarak doğrudan fonolojik kod çözme becerisini ölçer.",
            words: shuffle(words),
            syllableType: syllableStructure as string,
            visualMode: (variant as any) || 'standard',
            scoringTable: true,
            difficulty: difficulty,
            settings: {
                columns: gridSize || 4,
                itemCount: itemCount,
                fontSize: itemCount > 40 ? 18 : 24
            }
        };
    });
};

const TURKISH_ROOT_DATABASE = [
    { root: 'göz', meaning: 'Görme organı', derivations: [{w: 'gözlük', m: 'Göze takılan cam'}, {w: 'gözcü', m: 'Gözetleyen kişi'}, {w: 'gözlem', m: 'Bir şeyi inceleme'}] },
    { root: 'yol', meaning: 'Gidilen yer', derivations: [{w: 'yolcu', m: 'Yola giden kişi'}, {w: 'yolluk', m: 'Yol azığı'}, {w: 'yolsuz', m: 'Yolu olmayan'}] },
    { root: 'su', meaning: 'Sıvı madde', derivations: [{w: 'sulu', m: 'İçinde su olan'}, {w: 'susuz', m: 'Suyu olmayan'}, {w: 'sulak', m: 'Suyu bol yer'}] },
    { root: 'bil', meaning: 'Anlamak, kavramak', derivations: [{w: 'bilgi', m: 'Öğrenilen şey'}, {w: 'bilim', m: 'Düzenli bilgi'}, {w: 'bilgin', m: 'Bilgili kişi'}] }
];

export const generateOfflineMorphologicalAnalysis = async (options: GeneratorOptions): Promise<MorphologicalAnalysisData[]> => {
    const { worksheetCount } = options;
    const count = 3;

    return Array.from({ length: worksheetCount }, () => {
        const selectedRoots = getRandomItems(TURKISH_ROOT_DATABASE, count);
        
        return {
            title: "Kelime Mimarisi: Morfolojik Analiz",
            instruction: "Kelimelerin köklerini ve eklerini incele. Parçaları birleştirerek yeni anlamlar inşa et.",
            pedagogicalNote: "Morfolojik farkındalık, karmaşık kelimeleri çözümleme ve kelime dağarcığını zenginleştirme için en güçlü stratejidir.",
            rootSets: selectedRoots.map(r => ({
                root: r.root,
                meaning: r.meaning,
                suffixes: r.derivations.map(d => ({ text: d.w.replace(r.root, '-'), function: 'Yapım Eki', example: d.w })),
                correctDerivations: r.derivations.map(d => ({ word: d.w, meaning: d.m })),
                distractors: ['-miş', '-yor', '-ecek']
            })),
            visualStyle: 'architect'
        };
    });
};

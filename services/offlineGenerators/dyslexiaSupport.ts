
import { GeneratorOptions, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, HandwritingPracticeData, RealLifeProblemData, PseudowordReadingData, MorphologicalAnalysisData } from '../../types';
import { getRandomItems, shuffle, getRandomInt, TR_VOCAB, turkishAlphabet, COLORS, simpleSyllabify, getWordsForDifficulty, SHAPE_TYPES, VISUALLY_SIMILAR_CHARS, EMOJI_MAP } from './helpers';

// --- PSEUDOWORD GENERATOR ENGINE ---
const SYLLABLES_CV = ['ba', 'be', 'bı', 'bi', 'bo', 'bö', 'bu', 'bü', 'ca', 'ce', 'cı', 'ci', 'co', 'cü', 'da', 'de', 'dı', 'di', 'do', 'dö', 'fa', 'fe', 'ga', 'ge', 'ha', 'he', 'ka', 'ke', 'la', 'le', 'ma', 'me', 'na', 'ne', 'pa', 'pe', 'ra', 're', 'sa', 'se', 'ta', 'te', 'va', 've', 'ya', 'ye', 'za', 'ze'];
const SYLLABLES_CVC = ['bak', 'bal', 'bel', 'ber', 'cek', 'cer', 'dak', 'dal', 'der', 'fak', 'fer', 'gak', 'gel', 'hak', 'han', 'kan', 'kar', 'lak', 'ler', 'man', 'mer', 'nak', 'ner', 'pak', 'per', 'rak', 'rek', 'sak', 'sel', 'tak', 'ter', 'vak', 'ver', 'yak', 'yer', 'zak', 'zer'];

const generatePseudoWord = (length: number): string => {
    let word = "";
    for (let i = 0; i < length; i++) {
        const pool = Math.random() > 0.3 ? SYLLABLES_CV : SYLLABLES_CVC;
        word += pool[Math.floor(Math.random() * pool.length)];
    }
    return word;
};

export const generateOfflinePseudowordReading = async (options: GeneratorOptions): Promise<PseudowordReadingData[]> => {
    const { worksheetCount, difficulty, variant } = options;
    const count = 24; // Standard grid size

    return Array.from({ length: worksheetCount }, () => {
        const words = [];
        const syllLen = difficulty === 'Başlangıç' ? 2 : (difficulty === 'Orta' ? 3 : 4);
        
        for (let i = 0; i < count; i++) {
            words.push(generatePseudoWord(syllLen));
        }

        return {
            title: "Sözde Kelime Okuma Analizi",
            instruction: "Aşağıdaki kelimeler gerçek değildir. Lütfen her birini yüksek sesle ve hızlıca okumaya çalış.",
            pedagogicalNote: "Sözde kelime okuma, öğrencinin kelime ezberleme stratejisini devre dışı bırakarak doğrudan fonolojik kod çözme becerisini ölçer. Akıcılık ve hata türleri disleksi tanısı için kritiktir.",
            words: shuffle(words),
            syllableType: "Karışık",
            visualMode: (variant as any) || 'standard',
            scoringTable: true,
            difficulty: difficulty
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

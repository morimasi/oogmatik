

import { 
    WorksheetData, WordSearchData, AnagramData, MathPuzzleData, FindTheDifferenceData, ProverbFillData,
    SpellingCheckData, OddOneOutData, WordComparisonData, WordsInStoryData, ProverbSearchData, ReverseWordData, FindDuplicateData, WordGroupingData, WordLadderData, WordFormationData, FindIdenticalWordData, LetterBridgeData, FindLetterPairData, MiniWordGridData,
    StroopTestData, NumberPatternData, NumberSearchData, SymbolCipherData, ShapeType, TargetNumberData, NumberPyramidData, FindDifferentStringData, StoryData, StoryCreationPromptData, WordMemoryData, LetterGridTestData, ShapeMatchingData, StoryAnalysisData, CoordinateCipherData, TargetSearchData, VisualMemoryData, StorySequencingData, GridDrawingData, SymmetryDrawingData, AbcConnectData, MultiplicationPyramidData, DivisionPyramidData, MultiplicationWheelData, ShapeSudokuData, MissingPartsData, WordConnectData, JumbledWordStoryData, ThematicOddOneOutData, PasswordFinderData, SyllableCompletionData, CrosswordData, WordGridPuzzleData, ProverbSayingSortData, HomonymImageMatchData, AntonymFlowerPuzzleData, ProverbWordChainData, SynonymAntonymGridData, PunctuationColoringData, PunctuationMazeData, AntonymResfebeData, ThematicWordSearchColorData, ThematicOddOneOutSentenceData, ProverbSentenceFinderData, SynonymSearchAndStoryData, ColumnOddOneOutSentenceData, SynonymAntonymColoringData, PunctuationPhoneNumberData, PunctuationSpiralPuzzleData, ThematicJumbledWordStoryData, SynonymMatchingPatternData, FutoshikiData, NumberCapsuleData, OddEvenSudokuData, RomanNumeralConnectData, RomanNumeralStarHuntData, RoundingConnectData, RomanNumeralMultiplicationData, ArithmeticConnectData, RomanArabicMatchConnectData, Sudoku6x6ShadedData, KendokuData, OperationSquareSubtractionData, OperationSquareFillInData, ResfebeData, FutoshikiLengthData, MatchstickSymmetryData, WordWebData, StarHuntData, LengthConnectData, VisualNumberPatternData, ProfessionConnectData, VisualOddOneOutThemedData, LogicGridPuzzleData, ImageAnagramSortData, AnagramImageMatchData, SyllableWordSearchData, WordSearchWithPasswordData, WordWebWithPasswordData, LetterGridWordFindData, WordPlacementPuzzleData, PositionalAnagramData, ColorWheelMemoryData, ImageComprehensionData, CharacterMemoryData, ChaoticNumberSearchData, BlockPaintingData, VisualOddOneOutData, ShapeCountingData, DotPaintingData, HomonymSentenceData,
    ShapeNumberPatternData,
    SynonymWordSearchData,
    SpiralPuzzleData,
    OperationSquareMultDivData,
    WeightConnectData
} from '../types';

// IMPORT NEW DATA SOURCES
import { TR_VOCAB } from '../data/vocabulary';
import { PROVERBS, STORY_TEMPLATES } from '../data/sentences';

const turkishAlphabet = 'abcçdefgğhıijklmnoöprsştuüvyz';
const SHAPE_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon'];
const EMOJIS = ["🍎 Elma", "🚗 Araba", "🏠 Ev", "⭐ Yıldız", "🎈 Balon", "📚 Kitap", "⚽ Top", "☀️ Güneş", "🌙 Ay", "🌲 Ağaç", "🌺 Çiçek", "🎁 Hediye", "⏰ Saat", "🔑 Anahtar", "🚲 Bisiklet", "🎸 Gitar", "👓 Gözlük", "☂️ Şemsiye", "🍦 Dondurma", "🍕 Pizza", "🍔 Hamburger", "🍟 Patates", "🐱 Kedi", "🐶 Köpek", "🦁 Aslan", "🐯 Kaplan", "🚀 Roket", "🚁 Helikopter"];
const COLORS = [
    { name: 'KIRMIZI', css: 'red' }, { name: 'MAVİ', css: 'blue' }, { name: 'YEŞİL', css: 'green' }, { name: 'SARI', css: 'yellow' },
    { name: 'TURUNCU', css: 'orange' }, { name: 'MOR', css: 'purple' }, { name: 'PEMBE', css: 'pink' }, { name: 'SİYAH', css: 'black' },
    { name: 'TURKUAZ', css: 'turquoise' }, { name: 'GRİ', css: 'gray' }, { name: 'KAHVERENGİ', css: 'brown' }, { name: 'LACİVERT', css: 'navy' }
];

const HOMONYMS = [
    "yüz", "çay", "düş", "at", "ben", "bin", "dil", "diz", "ekmek", "el", "in", "iç", "kara", "kır", "kız", "ocak", "oy", "pazar", "saç", "satır", "soluk", "sürü", "yaş", "yaz", "yol"
];

// --- Helper Functions ---

const shuffle = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const getRandomInt = (min: number, max: number): number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomItems = <T>(arr: T[], count: number): T[] => {
    if (count >= arr.length) return shuffle(arr);
    return shuffle(arr).slice(0, count);
};

// Helper to combine vocab based on difficulty
const getWordsForDifficulty = (difficulty: string, topic?: string): string[] => {
    let pool: string[] = [];
    
    // Topic selection (if random or not found, use mix)
    if (topic && topic in TR_VOCAB) {
        const vocabList = (TR_VOCAB as any)[topic];
        // Ensure we only pick string arrays (exclude synonyms/antonyms)
        if (Array.isArray(vocabList) && vocabList.length > 0 && typeof vocabList[0] === 'string') {
            pool = vocabList as string[];
        } else {
             // Fallback if topic is invalid for this context
             pool = [...TR_VOCAB.animals, ...TR_VOCAB.fruits_veggies, ...TR_VOCAB.jobs, ...TR_VOCAB.school];
        }
    } else {
        // Mix categories for random
        pool = [...TR_VOCAB.animals, ...TR_VOCAB.fruits_veggies, ...TR_VOCAB.jobs, ...TR_VOCAB.school];
    }

    // Difficulty Filtering
    if (difficulty === 'Başlangıç') {
        pool = [...pool.filter(w => w.length <= 4), ...TR_VOCAB.easy_words];
    } else if (difficulty === 'Orta') {
        pool = [...pool.filter(w => w.length >= 4 && w.length <= 6), ...TR_VOCAB.medium_words];
    } else if (difficulty === 'Zor') {
        pool = [...pool.filter(w => w.length >= 7), ...TR_VOCAB.hard_words];
    } else if (difficulty === 'Uzman') {
        pool = [...TR_VOCAB.expert_words, ...TR_VOCAB.hard_words.filter(w => w.length > 8)];
    }

    return shuffle(pool); // Always return shuffled for uniqueness
};

// --- Generator Options Interface ---

export interface OfflineGeneratorOptions {
    topic: string;
    itemCount: number;
    gridSize: number;
    worksheetCount: number;
    difficulty: 'Başlangıç' | 'Orta' | 'Zor' | 'Uzman';
    targetPair?: string;
    targetLetters?: string;
    targetChar?: string;
    distractorChar?: string;
    timestamp?: number; // Added for uniqueness tracking
}

// --- Generator Functions ---

export const generateOfflineWordSearch = async (options: OfflineGeneratorOptions): Promise<WordSearchData[]> => {
    const { topic, itemCount, difficulty, worksheetCount } = options;
    const results: WordSearchData[] = [];
    
    let size = 10;
    let allowedDirections = [0, 1]; // 0: Yatay, 1: Dikey

    if (difficulty === 'Orta') {
        size = 14;
        allowedDirections = [0, 1, 2]; // + Çapraz
    } else if (difficulty === 'Zor') {
        size = 16;
        allowedDirections = [0, 1, 2, 3]; // + Ters Yatay
    } else if (difficulty === 'Uzman') {
        size = 18;
        allowedDirections = [0, 1, 2, 3, 4, 5]; // + Ters Dikey, Ters Çapraz
    }
    
    if (options.gridSize) size = options.gridSize;

    for (let i = 0; i < worksheetCount; i++) {
        const availableWords = getWordsForDifficulty(difficulty, topic === 'Rastgele' ? undefined : topic);
        const words = getRandomItems(availableWords, itemCount);
        
        const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
        
        words.forEach(word => {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 100) {
                const direction = allowedDirections[getRandomInt(0, allowedDirections.length - 1)];
                let row = 0, col = 0, dRow = 0, dCol = 0;

                if (direction === 0) { dRow = 0; dCol = 1; row = getRandomInt(0, size - 1); col = getRandomInt(0, size - word.length); } 
                else if (direction === 1) { dRow = 1; dCol = 0; row = getRandomInt(0, size - word.length); col = getRandomInt(0, size - 1); }
                else if (direction === 2) { dRow = 1; dCol = 1; row = getRandomInt(0, size - word.length); col = getRandomInt(0, size - word.length); }
                else if (direction === 3) { dRow = 0; dCol = -1; row = getRandomInt(0, size - 1); col = getRandomInt(word.length - 1, size - 1); }
                else if (direction === 4) { dRow = -1; dCol = 0; row = getRandomInt(word.length - 1, size - 1); col = getRandomInt(0, size - 1); }
                else if (direction === 5) { dRow = -1; dCol = -1; row = getRandomInt(word.length - 1, size - 1); col = getRandomInt(word.length - 1, size - 1); }

                let fits = true;
                for (let k = 0; k < word.length; k++) {
                     if (grid[row + k * dRow][col + k * dCol] !== '' && grid[row + k * dRow][col + k * dCol] !== word[k]) {
                         fits = false; break;
                     }
                }

                if (fits) {
                    for (let k = 0; k < word.length; k++) {
                        grid[row + k * dRow][col + k * dCol] = word[k];
                    }
                    placed = true;
                }
                attempts++;
            }
        });

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (grid[r][c] === '') grid[r][c] = turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)];
            }
        }
        
        results.push({ title: `Kelime Bulmaca (${difficulty})`, words, grid });
    }
    return results;
};

export const generateOfflineAnagram = async (options: OfflineGeneratorOptions): Promise<(AnagramData[])[]> => {
    const { topic, itemCount, worksheetCount, difficulty } = options;
    const results: (AnagramData[])[] = [];
    
    for (let i = 0; i < worksheetCount; i++) {
        const availableWords = getWordsForDifficulty(difficulty, topic === 'Rastgele' ? undefined : topic);
        const words = getRandomItems(availableWords, itemCount);
        const anagrams: AnagramData[] = words.map(word => ({ word, scrambled: shuffle(word.split('')).join('') }));
        results.push(anagrams);
    }
    return results;
};

export const generateOfflineMathPuzzle = async (options: OfflineGeneratorOptions): Promise<MathPuzzleData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const objects = ['🍎', '🍌', '🍓', '🍇', '🍒', '🍍', '🥑', '🥕', '🌽', '🥦'];
    
    let valueMin = 1, valueMax = 10, ops = ['+'];
    if (difficulty === 'Orta') { valueMin = 1; valueMax = 50; ops = ['+', '-']; } 
    else if (difficulty === 'Zor') { valueMin = 10; valueMax = 100; ops = ['+', '-', '*']; } 
    else if (difficulty === 'Uzman') { valueMin = 20; valueMax = 500; ops = ['+', '-', '*', '/']; }

    const results: MathPuzzleData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const currentObjects = getRandomItems(objects, 3);
        const values = currentObjects.map(() => getRandomInt(valueMin, valueMax));
        
        const puzzles = Array.from({ length: itemCount }).map(() => {
            const op = getRandomItems(ops, 1)[0];
            const [idx1, idx2] = [getRandomInt(0, 2), getRandomInt(0, 2)];
            
            let val1 = values[idx1];
            let val2 = values[idx2];
            let problemStr = `${currentObjects[idx1]} ${op} ${currentObjects[idx2]} = ?`;

            if (op === '-' && val1 < val2) { [val1, val2] = [val2, val1]; problemStr = `${currentObjects[idx2]} ${op} ${currentObjects[idx1]} = ?`; }
            if (op === '/' && val1 % val2 !== 0) {
                val1 = val1 - (val1 % val2); if(val1 === 0) val1 = val2; if(val2 === 0) val2 = 1;
                problemStr = `(${val1} değeri) ${op} ${currentObjects[idx2]} = ?`;
            }

            let answer = 0;
            if (op === '+') answer = val1 + val2;
            else if (op === '-') answer = val1 - val2;
            else if (op === '*') answer = val1 * val2;
            else if (op === '/') answer = Math.floor(val1 / val2);

            return { problem: problemStr, question: `(İpucu: ${currentObjects[0]}=${values[0]}, ${currentObjects[1]}=${values[1]}...)`, answer: answer.toString() };
        });
        results.push({ title: `Matematik Bulmacası (${difficulty})`, puzzles });
    }
    return results;
};

export const generateOfflineFindTheDifference = async (options: OfflineGeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { topic, itemCount, worksheetCount, difficulty } = options;
    const results: FindTheDifferenceData[] = [];
    
    for (let i = 0; i < worksheetCount; i++) {
        const availableWords = getWordsForDifficulty(difficulty, topic === 'Rastgele' ? undefined : topic);
        const words = getRandomItems(availableWords, itemCount);
        const rows = words.map(word => {
            const correctIndex = getRandomInt(0, 3);
            const items = Array.from({ length: 4 }).map((_, k) => {
                if (k === correctIndex) {
                    const chars = word.split('');
                    if (difficulty === 'Başlangıç') { [chars[0], chars[chars.length - 1]] = [chars[chars.length - 1], chars[0]]; } 
                    else if (difficulty === 'Orta') { const pos = getRandomInt(1, chars.length - 2); chars[pos] = turkishAlphabet[getRandomInt(0, turkishAlphabet.length-1)]; } 
                    else { const pos = getRandomInt(0, chars.length - 2); [chars[pos], chars[pos + 1]] = [chars[pos + 1], chars[pos]]; }
                    return chars.join('');
                }
                return word;
            });
            return { items, correctIndex };
        });
        results.push({ title: 'Farklı Kelimeyi Bul', rows });
    }
    return results;
};

export const generateOfflineNumberPattern = async (options: OfflineGeneratorOptions): Promise<NumberPatternData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const results: NumberPatternData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const patterns = Array.from({ length: itemCount }).map(() => {
            const start = getRandomInt(1, 50);
            const step = getRandomInt(2, 9);
            let sequence = "";
            let answer = "";
            if (difficulty === 'Başlangıç') { sequence = `${start}, ${start+step}, ${start+2*step}, ${start+3*step}, ?`; answer = (start+4*step).toString(); }
            else { sequence = `${start}, ${start*2}, ${start*3}, ${start*4}, ?`; answer = (start*5).toString(); }
            return { sequence, answer };
        });
        results.push({ title: `Sayı Örüntüsü (${difficulty})`, patterns });
    }
    return results;
};

export const generateOfflineProverbFill = async (options: OfflineGeneratorOptions): Promise<ProverbFillData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const results: ProverbFillData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        let filteredProverbs = PROVERBS;
        if (difficulty === 'Başlangıç') filteredProverbs = PROVERBS.filter(p => p.length < 35);
        const selectedProverbs = getRandomItems(filteredProverbs.length > 0 ? filteredProverbs : PROVERBS, itemCount);
        const proverbs = selectedProverbs.map(p => {
            const parts = p.split(' ');
            const idx = getRandomInt(1, parts.length-2);
            return { start: parts.slice(0, idx).join(' '), end: parts.slice(idx+1).join(' ') };
        });
        results.push({ title: 'Atasözü Tamamla', proverbs });
    }
    return results;
};
export const generateOfflineProverbFillInTheBlank = generateOfflineProverbFill;

export const generateOfflineSpellingCheck = async (options: OfflineGeneratorOptions): Promise<SpellingCheckData[]> => {
    const { topic, itemCount, worksheetCount, difficulty } = options;
    const results: SpellingCheckData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const words = getRandomItems(getWordsForDifficulty(difficulty, topic), itemCount);
        const checks = words.map(word => {
            const arr = word.split('');
            const wrong1 = [...arr]; wrong1[getRandomInt(0, arr.length-1)] = turkishAlphabet[getRandomInt(0,28)];
            const wrong2 = [...arr]; if(arr.length>1) [wrong2[0], wrong2[1]] = [wrong2[1], wrong2[0]];
            return { correct: word, options: shuffle([word, wrong1.join(''), wrong2.join('')]) };
        });
        results.push({ title: 'Yazım Yanlışı', checks });
    }
    return results;
};

export const generateOfflineOddOneOut = async (options: OfflineGeneratorOptions): Promise<OddOneOutData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: OddOneOutData[] = [];
    const categories = Object.keys(TR_VOCAB).filter(k => !k.endsWith('_words') && k !== 'synonyms' && k !== 'antonyms');
    for (let i = 0; i < worksheetCount; i++) {
        const groups = Array.from({ length: itemCount }).map(() => {
            const [cat1, cat2] = getRandomItems(categories, 2);
            const w1 = getRandomItems((TR_VOCAB as any)[cat1] as string[], 3);
            const w2 = getRandomItems((TR_VOCAB as any)[cat2] as string[], 1);
            return { words: shuffle([...w1, ...w2]) };
        });
        results.push({ title: 'Farklı Olanı Bul', groups });
    }
    return results;
};

export const generateOfflineWordComparison = async (options: OfflineGeneratorOptions): Promise<WordComparisonData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const results: WordComparisonData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const pool = getWordsForDifficulty(difficulty, topic);
        const common = getRandomItems(pool, 8);
        const diff1 = getRandomItems(pool.filter(w => !common.includes(w)), 2);
        const diff2 = getRandomItems(pool.filter(w => !common.includes(w) && !diff1.includes(w)), 2);
        results.push({
            title: 'Kelime Karşılaştırma',
            box1Title: 'Liste A', box2Title: 'Liste B',
            wordList1: shuffle([...common, ...diff1]),
            wordList2: shuffle([...common, ...diff2])
        });
    }
    return results;
};

export const generateOfflineStoryComprehension = async (options: OfflineGeneratorOptions): Promise<StoryData[]> => {
    const { worksheetCount, difficulty } = options;
    const results: StoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const tmpl = getRandomItems(STORY_TEMPLATES, 1)[0];
        let story = tmpl.template;
        const char = getRandomItems(tmpl.characters, 1)[0];
        story = story.replace(/{character}/g, char);
        Object.keys(tmpl).forEach(k => {
            if(Array.isArray((tmpl as any)[k]) && k !== 'template' && k !== 'characters') {
                const replacement = getRandomItems((tmpl as any)[k] as string[], 1)[0];
                story = story.replace(new RegExp(`{${k}}`, 'g'), replacement);
            }
        });
        results.push({
            title: `Hikaye (${difficulty})`,
            story,
            questions: [
                { question: 'Ana karakter kimdir?', options: [char, 'Bilinmiyor', 'Kedi'], answerIndex: 0 },
                { question: 'Olay nerede geçiyor?', options: ['Evde', 'Okulda', 'Metinde belirtilen yerde'], answerIndex: 2 },
                { question: 'Sonuç ne oldu?', options: ['Mutlu bitti', 'Üzgün bitti', 'Bilinmiyor'], answerIndex: 0 }
            ]
        });
    }
    return results;
};

// Placeholder replacements with dynamic data logic
export const generateOfflineLetterBridge = async (options: OfflineGeneratorOptions): Promise<LetterBridgeData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const results: LetterBridgeData[] = [];
    const words = getWordsForDifficulty(difficulty);
    for (let i = 0; i < worksheetCount; i++) {
        const pairs = Array.from({ length: itemCount }).map(() => {
            const w1 = getRandomItems(words, 1)[0];
            const w2 = getRandomItems(words.filter(w => w !== w1), 1)[0];
            return { word1: w1, word2: w2 };
        });
        results.push({ title: 'Harf Köprüsü', pairs });
    }
    return results;
};

export const generateOfflineWordLadder = async (options: OfflineGeneratorOptions): Promise<WordLadderData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const results: WordLadderData[] = [];
    const words = getWordsForDifficulty(difficulty);
    for (let i = 0; i < worksheetCount; i++) {
        const ladders = Array.from({ length: itemCount }).map(() => ({
            startWord: getRandomItems(words, 1)[0],
            endWord: getRandomItems(words, 1)[0],
            steps: 3
        }));
        results.push({ title: 'Kelime Merdiveni', ladders });
    }
    return results;
};

export const generateOfflineVisualMemory = async (options: OfflineGeneratorOptions): Promise<VisualMemoryData[]> => {
    const { worksheetCount } = options;
    const results: VisualMemoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const items = getRandomItems(EMOJIS, 12);
        results.push({
            title: 'Görsel Hafıza',
            memorizeTitle: 'Ezberle', testTitle: 'Bul',
            itemsToMemorize: items.slice(0, 6),
            testItems: items
        });
    }
    return results;
};

export const generateOfflineStoryAnalysis = async (options: OfflineGeneratorOptions): Promise<StoryAnalysisData[]> => {
     // Reusing story generation logic for uniqueness
     const stories = await generateOfflineStoryComprehension(options);
     return stories.map(s => ({
         title: 'Hikaye Analizi',
         story: s.story,
         questions: [
             { question: 'Hikayenin ana fikri nedir?', context: 'Genel' },
             { question: 'Karakterin özelliği nedir?', context: 'Karakter' }
         ]
     }));
};

export const generateOfflineJumbledWordStory = async (options: OfflineGeneratorOptions): Promise<JumbledWordStoryData[]> => {
    const { topic, worksheetCount, difficulty } = options;
    const results: JumbledWordStoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const words = getRandomItems(getWordsForDifficulty(difficulty, topic), 3);
        const puzzles = words.map(w => ({ word: w, jumbled: shuffle(w.split('')) }));
        results.push({
            title: 'Karışık Kelimeler',
            prompt: 'Kelimeleri bul ve hikaye yaz.',
            theme: topic || 'Genel',
            puzzles,
            storyPrompt: 'Bu kelimeleri kullanarak bir hikaye yaz.'
        });
    }
    return results;
};

export const generateOfflineHomonymSentenceWriting = async (options: OfflineGeneratorOptions): Promise<HomonymSentenceData[]> => {
    const { worksheetCount } = options;
    const results: HomonymSentenceData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const items = getRandomItems(HOMONYMS, 3).map(w => ({ word: w }));
        results.push({ title: 'Eş Sesli Kelimeler', prompt: 'Cümle kur.', items });
    }
    return results;
};

export const generateOfflineHomonymImageMatch = async (options: OfflineGeneratorOptions): Promise<HomonymImageMatchData[]> => {
    const { worksheetCount } = options;
    const results: HomonymImageMatchData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const word = getRandomItems(HOMONYMS, 1)[0];
        results.push({
            title: 'Eş Sesli Eşleştirme',
            prompt: 'Resimleri eşleştir.',
            leftImages: [{ id: 1, word }],
            rightImages: [{ id: 1, word }],
            wordScramble: { word, letters: shuffle(word.split('')) }
        });
    }
    return results;
};

export const generateOfflineSynonymAntonymGrid = async (options: OfflineGeneratorOptions): Promise<SynonymAntonymGridData[]> => {
    const { worksheetCount } = options;
    const results: SynonymAntonymGridData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const syn = getRandomItems(TR_VOCAB.synonyms, 1)[0];
        const ant = getRandomItems(TR_VOCAB.antonyms, 1)[0];
        results.push({
            title: 'Eş/Zıt Anlam Tablosu',
            prompt: 'Kelimeleri bul.',
            synonyms: [{ word: syn.word }],
            antonyms: [{ word: ant.word }],
            grid: [[syn.synonym[0], ant.antonym[0]]] // Simplified
        });
    }
    return results;
};

export const generateOfflineThematicWordSearchColor = async (options: OfflineGeneratorOptions): Promise<ThematicWordSearchColorData[]> => {
    const { topic, worksheetCount, difficulty } = options;
    const results: ThematicWordSearchColorData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const words = getRandomItems(getWordsForDifficulty(difficulty, topic), 5);
        results.push({
            title: 'Tematik Kelime Avı',
            prompt: 'Kelimeleri bul ve boya.',
            theme: topic || 'Genel',
            words,
            grid: Array(10).fill(Array(10).fill('A')) // Simplified grid
        });
    }
    return results;
};

export const generateOfflineProverbSentenceFinder = async (options: OfflineGeneratorOptions): Promise<ProverbSentenceFinderData[]> => {
    const { worksheetCount } = options;
    const results: ProverbSentenceFinderData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const p = getRandomItems(PROVERBS, 1)[0];
        const words = p.split(' ').map(w => ({ word: w, color: getRandomItems(COLORS, 1)[0].css }));
        results.push({
            title: 'Atasözü Bul',
            prompt: 'Kelimeleri sıraya diz.',
            wordCloud: shuffle(words),
            solutions: [p]
        });
    }
    return results;
};

export const generateOfflineSynonymMatchingPattern = async (options: OfflineGeneratorOptions): Promise<SynonymMatchingPatternData[]> => {
    const { worksheetCount } = options;
    const results: SynonymMatchingPatternData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const pairs = getRandomItems(TR_VOCAB.synonyms, 5);
        results.push({
            title: 'Eş Anlamlı Eşleştirme',
            prompt: 'Kelimeleri eşleştir.',
            theme: 'Genel',
            pairs
        });
    }
    return results;
};

// Implement remaining simple generators to ensure full coverage
export const generateOfflineStroopTest = async (options: OfflineGeneratorOptions): Promise<StroopTestData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: StroopTestData[] = [];
    for(let i=0; i<worksheetCount; i++) {
        const items = Array.from({length: itemCount}).map(() => {
            const c1 = getRandomItems(COLORS, 1)[0];
            const c2 = getRandomItems(COLORS.filter(c => c.css !== c1.css), 1)[0];
            return { text: c1.name, color: c2.css };
        });
        results.push({ title: 'Stroop Testi', items });
    }
    return results;
};

export const generateOfflineLetterGridTest = async (options: OfflineGeneratorOptions): Promise<LetterGridTestData[]> => {
    const { gridSize, worksheetCount, targetLetters } = options;
    const results: LetterGridTestData[] = [];
    const targets = targetLetters ? targetLetters.split(',') : ['a', 'b'];
    for(let i=0; i<worksheetCount; i++) {
        const grid = Array.from({length: gridSize || 10}, () => 
            Array.from({length: gridSize || 10}, () => turkishAlphabet[getRandomInt(0, 28)])
        );
        results.push({ title: 'Harf Izgarası', grid, targetLetters: targets });
    }
    return results;
};

export const generateOfflineFindIdenticalWord = async (options: OfflineGeneratorOptions): Promise<FindIdenticalWordData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const results: FindIdenticalWordData[] = [];
    const words = getWordsForDifficulty(difficulty);
    for(let i=0; i<worksheetCount; i++) {
        const groups = Array.from({length: itemCount}).map(() => {
            const w = getRandomItems(words, 1)[0];
            return { words: [w, w] as [string, string] };
        });
        results.push({ title: 'Aynısını Bul', groups });
    }
    return results;
};

export const generateOfflineWordFormation = async (options: OfflineGeneratorOptions): Promise<WordFormationData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: WordFormationData[] = [];
    for(let i=0; i<worksheetCount; i++) {
        const sets = Array.from({length: itemCount}).map(() => ({
            letters: getRandomItems(turkishAlphabet.split(''), 7),
            jokerCount: 1
        }));
        results.push({ title: 'Kelime Türetme', sets });
    }
    return results;
};

export const generateOfflineFindLetterPair = async (options: OfflineGeneratorOptions): Promise<FindLetterPairData[]> => {
    const { gridSize, worksheetCount, targetPair } = options;
    const results: FindLetterPairData[] = [];
    const pair = targetPair || 'ab';
    for(let i=0; i<worksheetCount; i++) {
         const grid = Array.from({length: gridSize || 10}, () => 
            Array.from({length: gridSize || 10}, () => turkishAlphabet[getRandomInt(0, 28)])
        );
        results.push({ title: 'Harf İkilisi', grid, targetPair: pair });
    }
    return results;
};

export const generateOfflineWordGrouping = async (options: OfflineGeneratorOptions): Promise<WordGroupingData[]> => {
    const { worksheetCount } = options;
    const results: WordGroupingData[] = [];
    for(let i=0; i<worksheetCount; i++) {
        const words = [...getRandomItems(TR_VOCAB.animals, 3), ...getRandomItems(TR_VOCAB.fruits_veggies, 3)];
        results.push({ title: 'Gruplama', words: shuffle(words), categoryNames: ['Hayvanlar', 'Meyveler'] });
    }
    return results;
};

export const generateOfflineProverbSearch = async (options: OfflineGeneratorOptions): Promise<ProverbSearchData[]> => {
    const { worksheetCount, gridSize } = options;
    const results: ProverbSearchData[] = [];
    for(let i=0; i<worksheetCount; i++) {
        const p = getRandomItems(PROVERBS, 1)[0];
        const grid = Array.from({length: gridSize || 12}, () => Array.from({length: gridSize || 12}, () => turkishAlphabet[getRandomInt(0, 28)]));
        results.push({ title: 'Atasözü Avı', grid, proverb: p });
    }
    return results;
};

export const generateOfflineReverseWord = async (options: OfflineGeneratorOptions): Promise<ReverseWordData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const results: ReverseWordData[] = [];
    const words = getWordsForDifficulty(difficulty);
    for(let i=0; i<worksheetCount; i++) {
        results.push({ title: 'Ters Kelime', words: getRandomItems(words, itemCount) });
    }
    return results;
};

export const generateOfflineFindTheDuplicateInRow = async (options: OfflineGeneratorOptions): Promise<FindDuplicateData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: FindDuplicateData[] = [];
    for(let i=0; i<worksheetCount; i++) {
        const rows = Array.from({length: itemCount}).map(() => {
            const chars = Array.from({length: 10}, () => turkishAlphabet[getRandomInt(0, 28)]);
            chars.push(chars[0]); // Duplicate
            return shuffle(chars);
        });
        results.push({ title: 'İkiliyi Bul', rows });
    }
    return results;
};

export const generateOfflineMiniWordGrid = async (options: OfflineGeneratorOptions): Promise<MiniWordGridData[]> => {
     const { worksheetCount } = options;
     const results: MiniWordGridData[] = [];
     for(let i=0; i<worksheetCount; i++) {
         results.push({ title: 'Mini Bulmaca', prompt: 'Bul', puzzles: [{ grid: [['a','b'],['c','d']], start: {row:0, col:0} }] });
     }
     return results;
};

export const generateOfflineFindDifferentString = async (options: OfflineGeneratorOptions): Promise<FindDifferentStringData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: FindDifferentStringData[] = [];
    for(let i=0; i<worksheetCount; i++) {
        const rows = Array.from({length: itemCount}).map(() => ({ items: ['ABC', 'ABC', 'ACB', 'ABC'] }));
        results.push({ title: 'Farklı Diziyi Bul', prompt: 'Bul', rows });
    }
    return results;
};

export const generateOfflineNumberPyramid = async (options: OfflineGeneratorOptions): Promise<NumberPyramidData[]> => {
     const { worksheetCount } = options;
     return Array(worksheetCount).fill({ title: 'Piramit', prompt: 'Topla', pyramids: [{ rows: [[1], [null, 2]] }] });
};

export const generateOfflineTargetNumber = async (options: OfflineGeneratorOptions): Promise<TargetNumberData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Hedef Sayı', prompt: 'Hesapla', puzzles: [{ target: 10, givenNumbers: [2, 5] }] });
};

export const generateOfflineCoordinateCipher = async (options: OfflineGeneratorOptions): Promise<CoordinateCipherData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Koordinat', grid: [['A']], wordsToFind: ['A'], cipherCoordinates: ['A1'] });
};

export const generateOfflineTargetSearch = async (options: OfflineGeneratorOptions): Promise<TargetSearchData[]> => {
     const { worksheetCount } = options;
     return Array(worksheetCount).fill({ title: 'Hedef Ara', grid: [['A']], target: 'A', distractor: 'B' });
};

export const generateOfflineShapeNumberPattern = async (options: OfflineGeneratorOptions): Promise<ShapeNumberPatternData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Şekil Örüntüsü', patterns: [{ shapes: [{ type: 'triangle', numbers: ['1', '2', '3'] }] }] });
};

export const generateOfflineGridDrawing = async (options: OfflineGeneratorOptions): Promise<GridDrawingData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Izgara Çizimi', gridDim: 5, drawings: [{ lines: [[[0,0], [1,1]]] }] });
};

export const generateOfflineColorWheelMemory = async (options: OfflineGeneratorOptions): Promise<ColorWheelMemoryData[]> => {
     const { worksheetCount } = options;
     const items = getRandomItems(TR_VOCAB.fruits_veggies, 4).map(w => ({ name: w, color: 'red' }));
     return Array(worksheetCount).fill({ title: 'Renk Çemberi', memorizeTitle: 'Ezberle', testTitle: 'Test', items });
};

export const generateOfflineImageComprehension = async (options: OfflineGeneratorOptions): Promise<ImageComprehensionData[]> => {
     const { worksheetCount } = options;
     return Array(worksheetCount).fill({ title: 'Resim Anlama', memorizeTitle: 'Bak', testTitle: 'Cevapla', sceneDescription: 'Park', questions: ['Kim var?'] });
};

export const generateOfflineCharacterMemory = async (options: OfflineGeneratorOptions): Promise<CharacterMemoryData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Karakter Hafıza', memorizeTitle: 'Ezberle', testTitle: 'Test', charactersToMemorize: [], testCharacters: [] });
};

export const generateOfflineStorySequencing = async (options: OfflineGeneratorOptions): Promise<StorySequencingData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Sıralama', prompt: 'Sırala', panels: [] });
};

export const generateOfflineChaoticNumberSearch = async (options: OfflineGeneratorOptions): Promise<ChaoticNumberSearchData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Kaotik Sayı', prompt: 'Bul', numbers: [], range: { start: 1, end: 10 } });
};

export const generateOfflineBlockPainting = async (options: OfflineGeneratorOptions): Promise<BlockPaintingData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Blok Boyama', prompt: 'Boya', grid: { rows: 5, cols: 5 }, shapes: [] });
};

export const generateOfflineVisualOddOneOut = async (options: OfflineGeneratorOptions): Promise<VisualOddOneOutData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Görsel Fark', prompt: 'Bul', rows: [] });
};

export const generateOfflineShapeCounting = async (options: OfflineGeneratorOptions): Promise<ShapeCountingData[]> => {
     const { worksheetCount } = options;
     return Array(worksheetCount).fill({ title: 'Şekil Sayma', prompt: 'Say', figures: [] });
};

export const generateOfflineSymmetryDrawing = async (options: OfflineGeneratorOptions): Promise<SymmetryDrawingData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Simetri', prompt: 'Çiz', gridDim: 5, dots: [], axis: 'vertical' });
};

export const generateOfflineBurdonTest = async (options: OfflineGeneratorOptions): Promise<LetterGridTestData[]> => {
    return generateOfflineLetterGridTest(options);
};

export const generateOfflineDotPainting = async (options: OfflineGeneratorOptions): Promise<DotPaintingData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Nokta Boyama', prompt1: 'Boya', prompt2: 'Bul', svgViewBox: '0 0 100 100', gridPaths: [], dots: [] });
};

export const generateOfflineAbcConnect = async (options: OfflineGeneratorOptions): Promise<AbcConnectData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'ABC Bağlama', prompt: 'Bağla', puzzles: [] });
};

export const generateOfflinePasswordFinder = async (options: OfflineGeneratorOptions): Promise<PasswordFinderData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Şifre', prompt: 'Bul', words: [], passwordLength: 5 });
};

export const generateOfflineSyllableCompletion = async (options: OfflineGeneratorOptions): Promise<SyllableCompletionData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Hece', prompt: 'Tamamla', theme: 'Genel', wordParts: [], syllables: [], storyPrompt: 'Yaz' });
};

export const generateOfflineSynonymSearchStory = async (options: OfflineGeneratorOptions): Promise<SynonymSearchAndStoryData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Eş Anlamlı', prompt: 'Bul', wordTable: [], grid: [], storyPrompt: 'Yaz' });
};

export const generateOfflineSynonymWordSearch = async (options: OfflineGeneratorOptions): Promise<SynonymWordSearchData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Eş Anlamlı Avı', prompt: 'Bul', wordsToMatch: [], grid: [] });
};

export const generateOfflineWordConnect = async (options: OfflineGeneratorOptions): Promise<WordConnectData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Kelime Bağla', prompt: 'Bağla', gridDim: 10, points: [] });
};

export const generateOfflineSpiralPuzzle = async (options: OfflineGeneratorOptions): Promise<SpiralPuzzleData[]> => {
     const { worksheetCount } = options;
     return Array(worksheetCount).fill({ title: 'Sarmal', prompt: 'Çöz', clues: [], grid: [], wordStarts: [] });
};

export const generateOfflineCrossword = async (options: OfflineGeneratorOptions): Promise<CrosswordData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Çapraz', prompt: 'Çöz', grid: [], clues: [], passwordCells: [], passwordLength: 5 });
};

export const generateOfflineWordGridPuzzle = async (options: OfflineGeneratorOptions): Promise<WordGridPuzzleData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Kelime Ağı', prompt: 'Yerleştir', theme: 'Genel', wordList: [], grid: [], unusedWordPrompt: 'Yaz' });
};

export const generateOfflineProverbSayingSort = async (options: OfflineGeneratorOptions): Promise<ProverbSayingSortData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Sınıflandırma', prompt: 'Ayır', items: [] });
};

export const generateOfflineAntonymFlowerPuzzle = async (options: OfflineGeneratorOptions): Promise<AntonymFlowerPuzzleData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Papatya', prompt: 'Çöz', puzzles: [], passwordLength: 5 });
};

export const generateOfflineProverbWordChain = async (options: OfflineGeneratorOptions): Promise<ProverbWordChainData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Zincir', prompt: 'Tamamla', wordCloud: [], solutions: [] });
};

export const generateOfflineThematicOddOneOut = async (options: OfflineGeneratorOptions): Promise<ThematicOddOneOutData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Tematik Fark', prompt: 'Bul', theme: 'Genel', rows: [], sentencePrompt: 'Yaz' });
};

export const generateOfflinePunctuationColoring = async (options: OfflineGeneratorOptions): Promise<PunctuationColoringData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Noktalama Boyama', prompt: 'Boya', sentences: [] });
};

export const generateOfflinePunctuationMaze = async (options: OfflineGeneratorOptions): Promise<PunctuationMazeData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Labirent', prompt: 'Çöz', punctuationMark: '.', rules: [] });
};

export const generateOfflineAntonymResfebe = async (options: OfflineGeneratorOptions): Promise<AntonymResfebeData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Resfebe', prompt: 'Çöz', puzzles: [], antonymsPrompt: 'Yaz' });
};

export const generateOfflineThematicOddOneOutSentence = async (options: OfflineGeneratorOptions): Promise<ThematicOddOneOutSentenceData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Fark Cümle', prompt: 'Bul', rows: [], sentencePrompt: 'Yaz' });
};

export const generateOfflineColumnOddOneOutSentence = async (options: OfflineGeneratorOptions): Promise<ColumnOddOneOutSentenceData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Sütun Fark', prompt: 'Bul', columns: [], sentencePrompt: 'Yaz' });
};

export const generateOfflineSynonymAntonymColoring = async (options: OfflineGeneratorOptions): Promise<SynonymAntonymColoringData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Boyama', prompt: 'Boya', colorKey: [], wordsOnImage: [] });
};

export const generateOfflinePunctuationPhoneNumber = async (options: OfflineGeneratorOptions): Promise<PunctuationPhoneNumberData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Telefon', prompt: 'Bul', instruction: 'Çöz', clues: [], solution: [] });
};

export const generateOfflinePunctuationSpiralPuzzle = async (options: OfflineGeneratorOptions): Promise<PunctuationSpiralPuzzleData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Sarmal', prompt: 'Çöz', clues: [], grid: [], wordStarts: [] });
};

export const generateOfflineThematicJumbledWordStory = async (options: OfflineGeneratorOptions): Promise<ThematicJumbledWordStoryData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Karışık', prompt: 'Bul', theme: 'Genel', puzzles: [], storyPrompt: 'Yaz' });
};

export const generateOfflineFutoshiki = async (options: OfflineGeneratorOptions): Promise<FutoshikiData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Futoşiki', prompt: 'Çöz', puzzles: [] });
};

export const generateOfflineNumberCapsule = async (options: OfflineGeneratorOptions): Promise<NumberCapsuleData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Kapsül', prompt: 'Çöz', puzzles: [] });
};

export const generateOfflineOddEvenSudoku = async (options: OfflineGeneratorOptions): Promise<OddEvenSudokuData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Sudoku', prompt: 'Çöz', puzzles: [] });
};

export const generateOfflineRomanNumeralConnect = async (options: OfflineGeneratorOptions): Promise<RomanNumeralConnectData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Romen Bağla', prompt: 'Bağla', puzzles: [] });
};

export const generateOfflineRomanNumeralStarHunt = async (options: OfflineGeneratorOptions): Promise<RomanNumeralStarHuntData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Yıldız Avı', prompt: 'Bul', grid: [], starCount: 5 });
};

export const generateOfflineRoundingConnect = async (options: OfflineGeneratorOptions): Promise<RoundingConnectData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Yuvarlama', prompt: 'Bağla', example: 'Örnek', numbers: [] });
};

export const generateOfflineRomanNumeralMultiplication = async (options: OfflineGeneratorOptions): Promise<RomanNumeralMultiplicationData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Çarpma', prompt: 'Çöz', puzzles: [] });
};

export const generateOfflineArithmeticConnect = async (options: OfflineGeneratorOptions): Promise<ArithmeticConnectData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Aritmetik', prompt: 'Bağla', example: 'Örnek', expressions: [] });
};

export const generateOfflineRomanArabicMatchConnect = async (options: OfflineGeneratorOptions): Promise<RomanArabicMatchConnectData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Eşleştirme', prompt: 'Bağla', gridDim: 10, points: [] });
};

export const generateOfflineSudoku6x6Shaded = async (options: OfflineGeneratorOptions): Promise<Sudoku6x6ShadedData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Sudoku', prompt: 'Çöz', puzzles: [] });
};

export const generateOfflineKendoku = async (options: OfflineGeneratorOptions): Promise<KendokuData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Kendoku', prompt: 'Çöz', puzzles: [] });
};

export const generateOfflineDivisionPyramid = async (options: OfflineGeneratorOptions): Promise<DivisionPyramidData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Bölme Piramidi', prompt: 'Çöz', pyramids: [] });
};

export const generateOfflineMultiplicationPyramid = async (options: OfflineGeneratorOptions): Promise<MultiplicationPyramidData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Çarpma Piramidi', prompt: 'Çöz', pyramids: [] });
};

export const generateOfflineOperationSquareSubtraction = async (options: OfflineGeneratorOptions): Promise<OperationSquareSubtractionData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Çıkarma Karesi', prompt: 'Çöz', puzzles: [] });
};

export const generateOfflineOperationSquareFillIn = async (options: OfflineGeneratorOptions): Promise<OperationSquareFillInData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'İşlem Karesi', prompt: 'Doldur', puzzles: [] });
};

export const generateOfflineMultiplicationWheel = async (options: OfflineGeneratorOptions): Promise<MultiplicationWheelData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Çarpım Çarkı', prompt: 'Doldur', puzzles: [] });
};

export const generateOfflineOperationSquareMultDiv = async (options: OfflineGeneratorOptions): Promise<OperationSquareMultDivData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Çarp/Böl Karesi', prompt: 'Çöz', puzzles: [] });
};

export const generateOfflineShapeSudoku = async (options: OfflineGeneratorOptions): Promise<ShapeSudokuData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Şekil Sudoku', prompt: 'Çöz', puzzles: [] });
};

export const generateOfflineWeightConnect = async (options: OfflineGeneratorOptions): Promise<WeightConnectData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Ağırlık', prompt: 'Bağla', gridDim: 10, points: [] });
};

export const generateOfflineResfebe = async (options: OfflineGeneratorOptions): Promise<ResfebeData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Resfebe', prompt: 'Bul', puzzles: [] });
};

export const generateOfflineFutoshikiLength = async (options: OfflineGeneratorOptions): Promise<FutoshikiLengthData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Uzunluk Futoşiki', prompt: 'Çöz', puzzles: [] });
};

export const generateOfflineMatchstickSymmetry = async (options: OfflineGeneratorOptions): Promise<MatchstickSymmetryData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Kibrit Simetri', prompt: 'Çiz', puzzles: [] });
};

export const generateOfflineWordWeb = async (options: OfflineGeneratorOptions): Promise<WordWebData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Kelime Ağı', prompt: 'Çöz', wordsToFind: [], grid: [], keyWordPrompt: 'Yaz' });
};

export const generateOfflineStarHunt = async (options: OfflineGeneratorOptions): Promise<StarHuntData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Yıldız Avı', prompt: 'Bul', grid: [] });
};

export const generateOfflineLengthConnect = async (options: OfflineGeneratorOptions): Promise<LengthConnectData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Uzunluk', prompt: 'Bağla', gridDim: 10, points: [] });
};

export const generateOfflineVisualNumberPattern = async (options: OfflineGeneratorOptions): Promise<VisualNumberPatternData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Görsel Örüntü', prompt: 'Bul', puzzles: [] });
};

export const generateOfflineMissingParts = async (options: OfflineGeneratorOptions): Promise<MissingPartsData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Eksik Parça', prompt: 'Tamamla', leftParts: [], rightParts: [], givenParts: [] });
};

export const generateOfflineProfessionConnect = async (options: OfflineGeneratorOptions): Promise<ProfessionConnectData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Meslekler', prompt: 'Bağla', gridDim: 10, points: [] });
};

export const generateOfflineVisualOddOneOutThemed = async (options: OfflineGeneratorOptions): Promise<VisualOddOneOutThemedData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Tematik Fark', prompt: 'Bul', rows: [] });
};

export const generateOfflineLogicGridPuzzle = async (options: OfflineGeneratorOptions): Promise<LogicGridPuzzleData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Mantık', prompt: 'Çöz', clues: [], people: [], categories: [] });
};

export const generateOfflineImageAnagramSort = async (options: OfflineGeneratorOptions): Promise<ImageAnagramSortData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Kart Sıralama', prompt: 'Sırala', cards: [] });
};

export const generateOfflineAnagramImageMatch = async (options: OfflineGeneratorOptions): Promise<AnagramImageMatchData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Anagram Eşleştirme', prompt: 'Eşleştir', wordBank: [], puzzles: [] });
};

export const generateOfflineSyllableWordSearch = async (options: OfflineGeneratorOptions): Promise<SyllableWordSearchData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Hece Avı', prompt: 'Bul', syllablesToCombine: [], wordsToCreate: [], wordsToFindInSearch: [], grid: [], passwordPrompt: 'Yaz' });
};

export const generateOfflineWordSearchWithPassword = async (options: OfflineGeneratorOptions): Promise<WordSearchWithPasswordData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Şifreli Av', prompt: 'Bul', grid: [], words: [], passwordCells: [] });
};

export const generateOfflineWordWebWithPassword = async (options: OfflineGeneratorOptions): Promise<WordWebWithPasswordData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Şifreli Ağ', prompt: 'Çöz', words: [], grid: [], passwordColumnIndex: 0 });
};

export const generateOfflineLetterGridWordFind = async (options: OfflineGeneratorOptions): Promise<LetterGridWordFindData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Tabloda Bul', prompt: 'Bul', words: [], grid: [], writingPrompt: 'Yaz' });
};

export const generateOfflineWordPlacementPuzzle = async (options: OfflineGeneratorOptions): Promise<WordPlacementPuzzleData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Yerleştirme', prompt: 'Yerleştir', grid: [], wordGroups: [], unusedWordPrompt: 'Yaz' });
};

export const generateOfflinePositionalAnagram = async (options: OfflineGeneratorOptions): Promise<PositionalAnagramData[]> => {
    const { worksheetCount } = options;
    return Array(worksheetCount).fill({ title: 'Konum Anagram', prompt: 'Çöz', puzzles: [] });
};


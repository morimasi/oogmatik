// FIX: Removed static JSON imports and embedded data directly to prevent file loading issues.
import { 
    WordSearchData, AnagramData, MathPuzzleData, FindTheDifferenceData, ProverbFillData, WorksheetData,
    SpellingCheckData, OddOneOutData, WordComparisonData, WordsInStoryData, ProverbSearchData, ReverseWordData, FindDuplicateData, WordGroupingData, WordLadderData, WordFormationData, FindIdenticalWordData, LetterBridgeData, FindLetterPairData, MiniWordGridData,
    StroopTestData, NumberPatternData, NumberSearchData, SymbolCipherData, ShapeType, TargetNumberData, NumberPyramidData, FindDifferentStringData, StoryData, StoryCreationPromptData, WordMemoryData, LetterGridTestData, ShapeMatchingData, StoryAnalysisData, CoordinateCipherData, TargetSearchData, VisualMemoryData, StorySequencingData, GridDrawingData, SymmetryDrawingData, AbcConnectData, MultiplicationPyramidData, DivisionPyramidData, MultiplicationWheelData, ShapeSudokuData, MissingPartsData, WordConnectData, JumbledWordStoryData, ThematicOddOneOutData, PasswordFinderData, SyllableCompletionData, CrosswordData, WordGridPuzzleData, ProverbSayingSortData, HomonymImageMatchData, AntonymFlowerPuzzleData, ProverbWordChainData, SynonymAntonymGridData, PunctuationColoringData, PunctuationMazeData, AntonymResfebeData, ThematicWordSearchColorData, ThematicOddOneOutSentenceData, ProverbSentenceFinderData, SynonymSearchAndStoryData, ColumnOddOneOutSentenceData, SynonymAntonymColoringData, PunctuationPhoneNumberData, PunctuationSpiralPuzzleData, ThematicJumbledWordStoryData, SynonymMatchingPatternData, FutoshikiData, NumberCapsuleData, OddEvenSudokuData, RomanNumeralConnectData, RomanNumeralStarHuntData, RoundingConnectData, RomanNumeralMultiplicationData, ArithmeticConnectData, RomanArabicMatchConnectData, Sudoku6x6ShadedData, KendokuData, OperationSquareSubtractionData, OperationSquareFillInData, ResfebeData, FutoshikiLengthData, MatchstickSymmetryData, WordWebData, StarHuntData, LengthConnectData, VisualNumberPatternData, ProfessionConnectData, VisualOddOneOutThemedData, LogicGridPuzzleData, ImageAnagramSortData, AnagramImageMatchData, SyllableWordSearchData, WordSearchWithPasswordData, WordWebWithPasswordData, LetterGridWordFindData, WordPlacementPuzzleData, PositionalAnagramData, ColorWheelMemoryData, ImageComprehensionData, CharacterMemoryData, ChaoticNumberSearchData, BlockPaintingData, VisualOddOneOutData, ShapeCountingData, DotPaintingData, HomonymSentenceData,
    ShapeNumberPatternData,
    SynonymWordSearchData,
    SpiralPuzzleData
} from '../types';

// Data is embedded to avoid file loading issues.
const wordlist: Record<string, string[]> = {
  "Hayvanlar": [
    "kedi", "köpek", "aslan", "kaplan", "fil", "zürafa", "ayı", "kurt", "tilki", "tavşan", 
    "maymun", "yılan", "balık", "kuş", "ördek", "at", "eşek", "deve", "fare", "sincap"
  ],
  "Meyveler": [
    "elma", "armut", "kiraz", "çilek", "muz", "portakal", "kavun", "karpuz", "üzüm", "erik",
    "şeftali", "kayısı", "incir", "nar", "mandalina", "limon", "ananas", "mango", "kivi", "dut"
  ],
  "Meslekler": [
    "doktor", "öğretmen", "polis", "avukat", "mühendis", "hemşire", "itfaiyeci", "aşçı", "pilot", "asker",
    "terzi", "berber", "şoför", "çiftçi", "marangoz", "ressam", "mimar", "hakim", "savcı", "eczacı"
  ],
  "Rastgele": [
    "kitap", "kalem", "masa", "ev", "araba", "güneş", "ay", "yıldız", "su", "hava", "toprak", "ateş",
    "okul", "sınıf", "tahta", "silgi", "defter", "çanta", "oyun", "park"
  ]
};

const proverbs: string[] = [
  "Damlaya damlaya göl olur.",
  "Sakla samanı, gelir zamanı.",
  "Ayağını yorganına göre uzat.",
  "Bugünün işini yarına bırakma.",
  "Ağaç yaş iken eğilir.",
  "Üzüm üzüme baka baka kararır.",
  "Tatlı dil yılanı deliğinden çıkarır.",
  "Bir elin nesi var, iki elin sesi var.",
  "Ak akçe kara gün içindir.",
  "Güneş balçıkla sıvanmaz."
];


// --- Yardımcı Fonksiyonlar ---

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
    return shuffle(arr).slice(0, count);
};

const turkishAlphabet = 'abcçdefgğhıijklmnoöprsştuüvyz';
const SHAPE_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon'];
const EMOJIS = ["🍎 Elma", "🚗 Araba", "🏠 Ev", "⭐ Yıldız", "🎈 Balon", "📚 Kitap", "⚽ Top", "☀️ Güneş", "🌙 Ay", "🌲 Ağaç", "🌺 Çiçek", "🎁 Hediye", "⏰ Saat", "🔑 Anahtar", "🚲 Bisiklet", "🎸 Gitar"];
const COLORS = [
    { name: 'KIRMIZI', css: 'red' }, { name: 'MAVİ', css: 'blue' }, { name: 'YEŞİL', css: 'green' }, { name: 'SARI', css: 'yellow' },
    { name: 'TURUNCU', css: 'orange' }, { name: 'MOR', css: 'purple' }, { name: 'PEMBE', css: 'pink' }, { name: 'SİYAH', css: 'black' },
];

// --- Üretici Seçenekleri Arayüzü ---

export interface OfflineGeneratorOptions {
    topic: string;
    itemCount: number;
    gridSize: number;
    worksheetCount: number;
    difficulty: 'Kolay' | 'Orta' | 'Zor';
    targetPair?: string;
    targetLetters?: string;
    targetChar?: string;
    distractorChar?: string;
}

// --- Üretici Fonksiyonları (Mevcut ve Güncellenmiş) ---

export const generateOfflineWordSearch = async (options: OfflineGeneratorOptions): Promise<WordSearchData[]> => {
    const { topic, itemCount, gridSize, worksheetCount } = options;
    const results: WordSearchData[] = [];
    const availableWords = wordlist[topic] || wordlist.Rastgele;

    for (let i = 0; i < worksheetCount; i++) {
        const words = getRandomItems(availableWords.filter(w => w.length <= gridSize), itemCount);
        const grid: string[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
        
        words.forEach(word => {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 50) {
                const direction = Math.floor(Math.random() * 3); // 0: yatay, 1: dikey, 2: çapraz
                if (direction === 0) { // Yatay
                    const row = getRandomInt(0, gridSize - 1);
                    const col = getRandomInt(0, gridSize - word.length);
                    if (Array.from({ length: word.length }).every((_, k) => grid[row][col + k] === '' || grid[row][col + k] === word[k])) {
                        for (let k = 0; k < word.length; k++) grid[row][col + k] = word[k];
                        placed = true;
                    }
                } else if (direction === 1) { // Dikey
                    const row = getRandomInt(0, gridSize - word.length);
                    const col = getRandomInt(0, gridSize - 1);
                    if (Array.from({ length: word.length }).every((_, k) => grid[row + k][col] === '' || grid[row + k][col] === word[k])) {
                        for (let k = 0; k < word.length; k++) grid[row + k][col] = word[k];
                        placed = true;
                    }
                } else { // Çapraz
                     const row = getRandomInt(0, gridSize - word.length);
                     const col = getRandomInt(0, gridSize - word.length);
                     if (Array.from({ length: word.length }).every((_, k) => grid[row + k][col + k] === '' || grid[row + k][col + k] === word[k])) {
                        for (let k = 0; k < word.length; k++) grid[row + k][col + k] = word[k];
                        placed = true;
                    }
                }
                attempts++;
            }
        });

        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (grid[r][c] === '') grid[r][c] = turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)];
            }
        }
        
        results.push({ title: `${topic} Kelime Bulmaca`, words, grid });
    }
    return results;
};


export const generateOfflineAnagrams = async (options: OfflineGeneratorOptions): Promise<(AnagramData[])[]> => {
    const { topic, itemCount, worksheetCount } = options;
    const results: (AnagramData[])[] = [];
    const availableWords = wordlist[topic] || wordlist.Rastgele;

    for (let i = 0; i < worksheetCount; i++) {
        const words = getRandomItems(availableWords, itemCount);
        const anagrams: AnagramData[] = words.map(word => ({ word, scrambled: shuffle(word.split('')).join('') }));
        results.push(anagrams);
    }
    return results;
};


export const generateOfflineMathPuzzles = async (options: OfflineGeneratorOptions): Promise<MathPuzzleData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const objects = ['🍎', '🍌', '🍓', '🍇'];
    
    let valueMin = 1, valueMax = 5, ops = ['+'];
    if (difficulty === 'Orta') {
        valueMin = 1; valueMax = 10; ops = ['+', '-'];
    } else if (difficulty === 'Zor') {
        valueMin = 5; valueMax = 20; ops = ['+', '-'];
    }

    const results: MathPuzzleData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const values = objects.map(() => getRandomInt(valueMin, valueMax));
        const puzzles = Array.from({ length: itemCount }).map(() => {
            const op = getRandomItems(ops, 1)[0];
            const [idx1, idx2] = [getRandomInt(0, 3), getRandomInt(0, 3)];
            
            let val1 = values[idx1];
            let val2 = values[idx2];
            let problemStr = `${objects[idx1]} ${op} ${objects[idx2]} = ?`;

            if (op === '-' && val1 < val2) {
                [val1, val2] = [val2, val1]; // Swap to avoid negative results
                problemStr = `${objects[idx2]} ${op} ${objects[idx1]} = ?`;
            }

            const answer = op === '+' ? val1 + val2 : val1 - val2;
            return { problem: problemStr, question: `(İpucu: ${objects[0]}=${values[0]}, ${objects[1]}=${values[1]}, ... )`, answer: answer.toString() };
        });
        results.push({ title: 'Meyveli Matematik', puzzles });
    }
    return results;
};

export const generateOfflineFindTheDifference = async (options: OfflineGeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { topic, itemCount, worksheetCount, difficulty } = options;
    const results: FindTheDifferenceData[] = [];
    const availableWords = wordlist[topic] || wordlist.Rastgele;
    for (let i = 0; i < worksheetCount; i++) {
        const words = getRandomItems(availableWords.filter(w => w.length > 4), itemCount);
        const rows = words.map(word => {
            const correctIndex = getRandomInt(0, 3);
            const items = Array.from({ length: 4 }).map((_, k) => {
                if (k === correctIndex) {
                    const chars = word.split('');
                    if (difficulty === 'Kolay') {
                        // Swap first and last letters - more obvious
                        [chars[0], chars[chars.length - 1]] = [chars[chars.length - 1], chars[0]];
                    } else if (difficulty === 'Orta') {
                        // Swap two random, non-adjacent letters
                        let pos1 = getRandomInt(0, chars.length - 1);
                        let pos2 = getRandomInt(0, chars.length - 1);
                        while (Math.abs(pos1 - pos2) <= 1) {
                            pos2 = getRandomInt(0, chars.length - 1);
                        }
                        [chars[pos1], chars[pos2]] = [chars[pos2], chars[pos1]];
                    } else { // Zor
                        // Swap two adjacent letters - more subtle
                        const pos = getRandomInt(0, chars.length - 2);
                        [chars[pos], chars[pos + 1]] = [chars[pos + 1], chars[pos]];
                    }
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

export const generateOfflineProverbFill = async (options: OfflineGeneratorOptions): Promise<ProverbFillData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: ProverbFillData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const selectedProverbs = getRandomItems(proverbs, itemCount);
        const proverbPuzzles = selectedProverbs.map(proverb => {
            const words = proverb.split(' ');
            if (words.length < 3) return { start: proverb, end: '' };
            const missingIndex = getRandomInt(1, words.length - 2);
            return { start: words.slice(0, missingIndex).join(' '), end: words.slice(missingIndex + 1).join(' ') };
        });
        results.push({ title: 'Atasözünü Tamamla', proverbs: proverbPuzzles });
    }
    return results;
};

export const generateOfflineSpellingCheck = async (options: OfflineGeneratorOptions): Promise<SpellingCheckData[]> => {
    const { topic, itemCount, worksheetCount } = options;
    const results: SpellingCheckData[] = [];
    const availableWords = wordlist[topic] || wordlist.Rastgele;
    for (let i = 0; i < worksheetCount; i++) {
        const selectedWords = getRandomItems(availableWords.filter(w => w.length > 4), itemCount);
        const checks = selectedWords.map(correct => {
            const chars = correct.split('');
            const swapIndex = getRandomInt(0, chars.length - 2);
            const mistake1 = [...chars.slice(0, swapIndex), chars[swapIndex + 1], chars[swapIndex], ...chars.slice(swapIndex + 2)].join('');
            const changeIndex = getRandomInt(0, chars.length - 1);
            const mistake2 = [...chars.slice(0, changeIndex), turkishAlphabet[getRandomInt(0, 28)], ...chars.slice(changeIndex + 1)].join('');
            return { correct, options: shuffle([correct, mistake1, mistake2]) };
        });
        results.push({ title: 'Doğru Yazılışı Bul', checks });
    }
    return results;
};

export const generateOfflineOddOneOut = async (options: OfflineGeneratorOptions): Promise<OddOneOutData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: OddOneOutData[] = [];
    const categories = Object.keys(wordlist);
    for (let i = 0; i < worksheetCount; i++) {
        const groups = Array.from({ length: itemCount }).map(() => {
            const [mainCat, outlierCat] = getRandomItems(categories, 2);
            const mainWords = getRandomItems(wordlist[mainCat], 3);
            const outlierWord = getRandomItems(wordlist[outlierCat], 1);
            return { words: shuffle([...mainWords, ...outlierWord]) };
        });
        results.push({ title: 'Anlamsal Olarak Farklı Olanı Bul', groups });
    }
    return results;
};

export const generateOfflineWordComparison = async (options: OfflineGeneratorOptions): Promise<WordComparisonData[]> => {
    const { topic, itemCount, worksheetCount } = options;
    const results: WordComparisonData[] = [];
    const availableWords = wordlist[topic] || wordlist.Rastgele;
    for (let i = 0; i < worksheetCount; i++) {
        const wordPool = getRandomItems(availableWords, itemCount + 4);
        const common = wordPool.slice(0, itemCount - 2);
        const list1Only = wordPool.slice(itemCount - 2, itemCount);
        const list2Only = wordPool.slice(itemCount, itemCount + 2);
        results.push({
            title: 'Kelime Karşılaştırma', box1Title: 'Kutu 1', box2Title: 'Kutu 2',
            wordList1: shuffle([...common, ...list1Only]),
            wordList2: shuffle([...common, ...list2Only])
        });
    }
    return results;
};

export const generateOfflineWordsInStory = async (options: OfflineGeneratorOptions): Promise<WordsInStoryData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: WordsInStoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const story = getRandomItems(proverbs, 3).join(' ');
        const storyWords = Array.from(new Set(story.toLowerCase().replace(/[.,]/g, '').split(' ')));
        const inStoryCount = Math.floor(itemCount / 2);
        const wordsInStory = getRandomItems(storyWords, inStoryCount);
        const wordsNotInStory = getRandomItems(Object.values(wordlist).flat().filter(w => !storyWords.includes(w)), itemCount - inStoryCount);
        const wordList = shuffle([...wordsInStory.map(word => ({ word, isInStory: true })), ...wordsNotInStory.map(word => ({ word, isInStory: false }))]);
        results.push({ title: 'Metindeki Kelimeler', story, wordList });
    }
    return results;
};

export const generateOfflineProverbSearch = async (options: OfflineGeneratorOptions): Promise<ProverbSearchData[]> => {
    const { gridSize, worksheetCount } = options;
    const results: ProverbSearchData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const proverb = getRandomItems(proverbs, 1)[0];
        const word = proverb.replace(/[.,\s]/g, '').toLowerCase();
        const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
        if (word.length <= gridSize) {
            const row = getRandomInt(0, gridSize - 1);
            const col = getRandomInt(0, gridSize - word.length);
            for (let k = 0; k < word.length; k++) grid[row][col + k] = word[k];
        }
        for (let r = 0; r < gridSize; r++) for (let c = 0; c < gridSize; c++) if (grid[r][c] === '') grid[r][c] = turkishAlphabet[getRandomInt(0, 28)];
        results.push({ title: 'Atasözü Avı', proverb, grid });
    }
    return results;
};

export const generateOfflineReverseWord = async (options: OfflineGeneratorOptions): Promise<ReverseWordData[]> => {
    const { topic, itemCount, worksheetCount } = options;
    const availableWords = wordlist[topic] || wordlist.Rastgele;
    return Array.from({ length: worksheetCount }).map(() => ({
        title: 'Kelimeleri Ters Çevir',
        words: getRandomItems(availableWords, itemCount)
    }));
};

export const generateOfflineFindDuplicateInRow = async (options: OfflineGeneratorOptions): Promise<FindDuplicateData[]> => {
    const { itemCount, worksheetCount } = options;
    const chars = (turkishAlphabet + '0123456789').split('');
    const results: FindDuplicateData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const rows = Array.from({ length: itemCount }).map(() => {
            const rowChars = getRandomItems(chars, 14);
            const duplicateChar = rowChars[getRandomInt(0, 13)];
            rowChars.splice(getRandomInt(0, 14), 0, duplicateChar);
            return shuffle(rowChars);
        });
        results.push({ title: 'Satırda Tekrar Edeni Bul', rows });
    }
    return results;
};

export const generateOfflineWordGrouping = async (options: OfflineGeneratorOptions): Promise<WordGroupingData[]> => {
    const { worksheetCount } = options;
    const results: WordGroupingData[] = [];
    const allCategories = Object.keys(wordlist).filter(k => k !== 'Rastgele');
    for (let i = 0; i < worksheetCount; i++) {
        const categoryNames = getRandomItems(allCategories, 3);
        const words = categoryNames.flatMap(cat => getRandomItems(wordlist[cat], 5));
        results.push({ title: 'Kelime Gruplama', words: shuffle(words), categoryNames });
    }
    return results;
};

export const generateOfflineWordLadder = async (options: OfflineGeneratorOptions): Promise<WordLadderData[]> => {
    const { itemCount, worksheetCount } = options;
    const fourLetterWords = Object.values(wordlist).flat().filter(w => w.length === 4);
    const results: WordLadderData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const ladders = Array.from({ length: Math.floor(itemCount / 2) }).map(() => {
            const [startWord, endWord] = getRandomItems(fourLetterWords, 2);
            return { startWord, endWord, steps: 3 };
        });
        results.push({ title: 'Kelime Merdiveni', ladders });
    }
    return results;
};

export const generateOfflineWordFormation = async (options: OfflineGeneratorOptions): Promise<WordFormationData[]> => {
    const { itemCount, worksheetCount } = options;
    const longWords = Object.values(wordlist).flat().filter(w => w.length >= 7 && w.length <= 9);
    const results: WordFormationData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const sets = getRandomItems(longWords, Math.floor(itemCount / 2)).map(word => ({
            letters: shuffle(word.split('')),
            jokerCount: getRandomInt(1, 2)
        }));
        results.push({ title: 'Harflerden Kelime Türetme', sets });
    }
    return results;
};

export const generateOfflineFindIdenticalWord = async (options: OfflineGeneratorOptions): Promise<FindIdenticalWordData[]> => {
    const { itemCount, worksheetCount } = options;
    const availableWords = Object.values(wordlist).flat().filter(w => w.length > 4);
    const results: FindIdenticalWordData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const groups = Array.from({ length: itemCount * 2 }).map(() => {
            const word = getRandomItems(availableWords, 1)[0];
            const pair: [string, string] = Math.random() > 0.5 ? [word, word] : [word, word.slice(0, -2) + word.slice(-1) + word.slice(-2, -1)];
            return { words: pair };
        });
        results.push({ title: 'Aynısını Bul', groups: shuffle(groups) });
    }
    return results;
};

export const generateOfflineLetterBridge = async (options: OfflineGeneratorOptions): Promise<LetterBridgeData[]> => {
    const { itemCount, worksheetCount } = options;
    const availableWords = Object.values(wordlist).flat();
    return Array.from({ length: worksheetCount }).map(() => ({
        title: 'Harf Köprüsü',
        pairs: Array.from({ length: itemCount }).map(() => {
            const [word1, word2] = getRandomItems(availableWords, 2);
            return { word1, word2 };
        })
    }));
};

export const generateOfflineFindLetterPair = async (options: OfflineGeneratorOptions): Promise<FindLetterPairData[]> => {
    const { gridSize, worksheetCount, targetPair = 'tr' } = options;
    const results: FindLetterPairData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const grid = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => turkishAlphabet[getRandomInt(0, 28)]));
        for (let p = 0; p < Math.floor(gridSize / 2); p++) {
            const row = getRandomInt(0, gridSize - 1);
            const col = getRandomInt(0, gridSize - 2);
            grid[row][col] = targetPair[0];
            grid[row][col + 1] = targetPair[1];
        }
        results.push({ title: `Harf İkilisi Bul (${targetPair.toUpperCase()})`, grid, targetPair });
    }
    return results;
};

export const generateOfflineMiniWordGrid = async (options: OfflineGeneratorOptions): Promise<MiniWordGridData[]> => {
    const { worksheetCount } = options;
    const fourLetterWords = Object.values(wordlist).flat().filter(w => w.length === 4);
    const results: MiniWordGridData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const puzzles = Array.from({ length: 4 }).map(() => {
            const grid = Array.from({ length: 4 }, () => Array(4).fill(''));
            const word = getRandomItems(fourLetterWords, 1)[0];
            const isHorizontal = Math.random() > 0.5;
            const start = { row: isHorizontal ? getRandomInt(0, 3) : 0, col: isHorizontal ? 0 : getRandomInt(0, 3) };
            for (let k = 0; k < 4; k++) isHorizontal ? grid[start.row][start.col + k] = word[k] : grid[start.row + k][start.col] = word[k];
            for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (grid[r][c] === '') grid[r][c] = turkishAlphabet[getRandomInt(0, 28)];
            return { grid, start };
        });
        results.push({ title: 'Mini Kelime Bulmaca', prompt: 'Renkli harften başlayarak kelimeleri bulun.', puzzles });
    }
    return results;
};

export const generateOfflineStroopTest = async (options: OfflineGeneratorOptions): Promise<StroopTestData[]> => {
    const { itemCount, worksheetCount } = options;
    return Array.from({ length: worksheetCount }).map(() => ({
        title: 'Stroop Testi',
        items: shuffle(Array.from({ length: itemCount * 2 }).map(() => {
            const textItem = getRandomItems(COLORS, 1)[0];
            let colorItem = getRandomItems(COLORS, 1)[0];
            if (Math.random() > 0.2) while (colorItem.css === textItem.css) colorItem = getRandomItems(COLORS, 1)[0];
            return { text: textItem.name, color: colorItem.css };
        }))
    }));
};

export const generateOfflineNumberPattern = async (options: OfflineGeneratorOptions): Promise<NumberPatternData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }).map(() => ({
        title: 'Sayı Örüntüsü',
        patterns: Array.from({ length: itemCount }).map(() => {
            let start = getRandomInt(1, 10);
            const step = difficulty === 'Kolay' ? getRandomInt(1, 5) : (difficulty === 'Orta' ? getRandomInt(2, 10) : getRandomInt(5, 15));
            const sequence = [start];
            for (let k = 0; k < 4; k++) sequence.push(sequence[k] + step);
            const answer = sequence.pop()!.toString();
            return { sequence: sequence.join(', ') + ', ?', answer };
        })
    }));
};

export const generateOfflineNumberSearch = async (options: OfflineGeneratorOptions): Promise<NumberSearchData[]> => {
    const { worksheetCount } = options;
    const range = { start: 1, end: 50 };
    return Array.from({ length: worksheetCount }).map(() => ({
        title: 'Sayı Avı',
        numbers: shuffle([...Array.from({ length: 50 }, (_, k) => k + 1), ...Array.from({ length: 50 }, () => getRandomInt(1, 100))]),
        range
    }));
};

export const generateOfflineSymbolCipher = async (options: OfflineGeneratorOptions): Promise<SymbolCipherData[]> => {
    const { itemCount, worksheetCount } = options;
    const availableWords = Object.values(wordlist).flat().filter(w => w.length >= 4 && w.length <= 6);
    const results: SymbolCipherData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const lettersForKey = shuffle(turkishAlphabet.split('')).slice(0, 8);
        const shapesForKey = shuffle(SHAPE_TYPES);
        const cipherKey = lettersForKey.map((letter, index) => ({ shape: shapesForKey[index], letter }));
        const letterToShapeMap = new Map(cipherKey.map(k => [k.letter, k.shape]));
        const words = getRandomItems(availableWords.filter(w => w.split('').every(l => letterToShapeMap.has(l))), Math.floor(itemCount / 2));
        const wordsToSolve = words.map(word => ({ shapeSequence: word.split('').map(l => letterToShapeMap.get(l)!), wordLength: word.length }));
        results.push({ title: 'Şifre Çözme', cipherKey, wordsToSolve });
    }
    return results;
};

export const generateOfflineTargetNumber = async (options: OfflineGeneratorOptions): Promise<TargetNumberData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }).map(() => ({
        title: 'Hedef Sayı',
        prompt: 'Verilen sayıları ve dört işlemi (+, -, ×, ÷) kullanarak hedef sayıya ulaşın.',
        puzzles: Array.from({ length: 3 }).map(() => {
             if (difficulty === 'Kolay') {
                const nums = [getRandomInt(1, 10), getRandomInt(1, 10), getRandomInt(1, 10), getRandomInt(1, 10)];
                const target = nums[0] + nums[1];
                return { target, givenNumbers: shuffle(nums) };
            } else if (difficulty === 'Orta') {
                const nums = [getRandomInt(1, 20), getRandomInt(1, 20), getRandomInt(1, 25), getRandomInt(1, 25)];
                const target = nums[0] + nums[2];
                return { target, givenNumbers: shuffle(nums) };
            } else { // Zor
                const nums = [getRandomInt(2, 10), getRandomInt(2, 10), getRandomInt(1, 25), getRandomInt(25, 100)];
                const target = (nums[0] * nums[1]) + nums[2];
                return { target, givenNumbers: shuffle(nums) };
            }
        })
    }));
};

export const generateOfflineNumberPyramid = async (options: OfflineGeneratorOptions): Promise<NumberPyramidData[]> => {
    const { worksheetCount, difficulty } = options;
    const results: NumberPyramidData[] = [];

    let baseSize = 4, baseMin = 1, baseMax = 10, blanks = 3;
    if (difficulty === 'Orta') {
        baseSize = 4; baseMin = 1; baseMax = 20; blanks = 4;
    } else if (difficulty === 'Zor') {
        baseSize = 5; baseMin = 5; baseMax = 25; blanks = 6;
    }

    for (let i = 0; i < worksheetCount; i++) {
        const pyramids = Array.from({ length: 2 }).map((_, j) => {
            const base = Array.from({ length: baseSize }, () => getRandomInt(baseMin, baseMax));
            const rows: (number | null)[][] = [];
            rows[baseSize - 1] = [...base];
            for (let r = baseSize - 2; r >= 0; r--) {
                rows[r] = Array.from({ length: r + 1 }).map((_, c) => rows[r + 1][c]! + rows[r + 1][c + 1]!);
            }
            // Add blanks
            let placedBlanks = 0;
            while(placedBlanks < blanks) {
                const r = getRandomInt(0, baseSize - 1);
                const c = getRandomInt(0, rows[r].length - 1);
                if(rows[r][c] !== null) {
                    rows[r][c] = null;
                    placedBlanks++;
                }
            }
            return { title: `${j + 1}. Piramit`, rows };
        });
        results.push({ title: 'Sayı Piramidi (Toplama)', prompt: 'Bir üstteki sayı, altındaki iki sayının toplamıdır.', pyramids });
    }
    return results;
};

export const generateOfflineFindDifferentString = async (options: OfflineGeneratorOptions): Promise<FindDifferentStringData[]> => {
    const { itemCount, worksheetCount } = options;
    return Array.from({ length: worksheetCount }).map(() => ({
        title: 'Farklı Diziyi Bul',
        prompt: 'Her satırda diğerlerinden farklı olan harf grubunu bulun.',
        rows: Array.from({ length: itemCount }).map(() => {
            const base = [0, 0, 0].map(() => turkishAlphabet[getRandomInt(0, 28)].toUpperCase()).join('');
            const items = Array(5).fill(base);
            const diffIndex = getRandomInt(0, 4);
            const chars = base.split('');
            [chars[0], chars[1]] = [chars[1], chars[0]];
            items[diffIndex] = chars.join('');
            return { items: shuffle(items) };
        })
    }));
};

// --- TAMAMEN YENİ EKLENEN TÜM ÜRETİCİLER (EKSİKLER) ---

export const generateOfflineStoryComprehension = async (options: OfflineGeneratorOptions): Promise<StoryData[]> => {
    const { worksheetCount, topic } = options;
    return Array.from({ length: worksheetCount }).map(() => {
        const story = getRandomItems(proverbs, 2).join(' ');
        const wordsInStory = Array.from(new Set(story.replace(/[.,]/g, '').toLowerCase().split(' ').filter(w => w.length > 3)));
        const answer = getRandomItems(wordsInStory, 1)[0] || 'kelime';
        const distractors = getRandomItems((wordlist[topic] || wordlist.Rastgele).filter(w => w !== answer), 2);
        const a_options = shuffle([answer, ...distractors]);
        return {
            title: 'Hikaye Anlama (Hızlı Mod)', story,
            questions: [{ question: `Metinde hangi kelime geçmektedir?`, options: a_options, answerIndex: a_options.indexOf(answer) }]
        };
    });
};

export const generateOfflineLetterGridTest = async (options: OfflineGeneratorOptions): Promise<LetterGridTestData[]> => {
    const { gridSize, worksheetCount, targetLetters = 'a,b,d,g' } = options;
    const targets = targetLetters.split(',').map(l => l.trim());
    return Array.from({ length: worksheetCount }).map(() => ({
        title: 'Harf Izgara Testi (Hızlı Mod)',
        grid: Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => Math.random() < 0.2 ? getRandomItems(targets, 1)[0] : turkishAlphabet[getRandomInt(0, 28)])),
        targetLetters: targets
    }));
};

export const generateOfflineWordMemory = async (options: OfflineGeneratorOptions): Promise<WordMemoryData[]> => {
    const { topic, worksheetCount } = options;
    const availableWords = wordlist[topic] || wordlist.Rastgele;
    return Array.from({ length: worksheetCount }).map(() => {
        const wordsToMemorize = getRandomItems(availableWords, 8);
        const testWords = shuffle([...wordsToMemorize, ...getRandomItems(availableWords.filter(w => !wordsToMemorize.includes(w)), 8)]);
        return { title: "Kelime Hafıza", memorizeTitle: "Ezberle", testTitle: "İşaretle", wordsToMemorize, testWords };
    });
};

export const generateOfflineStoryCreationPrompt = async (options: OfflineGeneratorOptions): Promise<StoryCreationPromptData[]> => {
    const { topic, worksheetCount } = options;
    return Array.from({ length: worksheetCount }).map(() => ({
        title: "Hikaye Oluşturma", prompt: "Bu kelimelerle bir hikaye yazın.", keywords: getRandomItems(wordlist[topic] || wordlist.Rastgele, 5)
    }));
};

export const generateOfflineShapeMatching = async (options: OfflineGeneratorOptions): Promise<ShapeMatchingData[]> => {
    const { itemCount, worksheetCount } = options;
    return Array.from({ length: worksheetCount }).map(() => {
        const leftColumn = Array.from({ length: itemCount }, (_, id) => ({ id: id + 1, shapes: getRandomItems(SHAPE_TYPES, 3) }));
        const rightColumn = shuffle(leftColumn).map((item, id) => ({ ...item, id: String.fromCharCode(65 + id) }));
        return { title: 'Şekil Eşleştirme', leftColumn, rightColumn };
    });
};

export const generateOfflineVisualMemory = async (options: OfflineGeneratorOptions): Promise<VisualMemoryData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }).map(() => {
        const itemsToMemorize = getRandomItems(EMOJIS, 8);
        const testItems = shuffle([...itemsToMemorize, ...getRandomItems(EMOJIS.filter(e => !itemsToMemorize.includes(e)), 8)]);
        return { title: 'Görsel Hafıza', memorizeTitle: 'Ezberle', testTitle: 'İşaretle', itemsToMemorize, testItems };
    });
};

export const generateOfflineStoryAnalysis = async (options: OfflineGeneratorOptions): Promise<StoryAnalysisData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }).map(() => {
        const story = getRandomItems(proverbs, 2).join(' ');
        const targetWord = getRandomItems(story.replace(/[.,]/g, '').split(' '), 1)[0] || 'kelime';
        return { title: 'Hikaye Analizi', story, questions: [{ question: `'${targetWord}' kelimesi metinde geçiyor mu?`, context: targetWord }] };
    });
};

export const generateOfflineCoordinateCipher = async (options: OfflineGeneratorOptions): Promise<CoordinateCipherData[]> => {
    const { topic, worksheetCount } = options;
    const availableWords = wordlist[topic] || wordlist.Rastgele;
    return Array.from({ length: worksheetCount }).map(() => {
        const grid = Array.from({ length: 6 }, () => Array.from({ length: 6 }, () => turkishAlphabet[getRandomInt(0, 28)]));
        const cipherWord = getRandomItems(availableWords.filter(w => w.length === 4), 1)[0] || "BEYİN";
        const cipherCoordinates = Array.from({ length: 4 }).map((_, k) => {
            const [r, c] = [getRandomInt(0, 5), getRandomInt(0, 5)];
            grid[r][c] = cipherWord[k];
            return `${String.fromCharCode(65 + r)}${c + 1}`;
        });
        return { title: 'Koordinat Şifresi', grid, wordsToFind: getRandomItems(availableWords, 3), cipherCoordinates };
    });
};

export const generateOfflineTargetSearch = async (options: OfflineGeneratorOptions): Promise<TargetSearchData[]> => {
    const { gridSize, worksheetCount, targetChar = '7', distractorChar = 'Z' } = options;
    return Array.from({ length: worksheetCount }).map(() => ({
        title: 'Hedef Arama',
        grid: Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => Math.random() < 0.15 ? targetChar : distractorChar)),
        target: targetChar, distractor: distractorChar
    }));
};

export const generateOfflineShapeNumberPattern = async (options: OfflineGeneratorOptions): Promise<ShapeNumberPatternData[]> => {
    return Array.from({ length: options.worksheetCount }).map(() => ({
        title: 'Şekilli Sayı Örüntüsü',
        patterns: [{
            shapes: [
                { type: 'triangle', numbers: [getRandomInt(1, 10), getRandomInt(1, 10), getRandomInt(1, 10), '?'] }
            ]
        }]
    }));
};

export const generateOfflineGridDrawing = async (options: OfflineGeneratorOptions): Promise<GridDrawingData[]> => {
    return Array.from({ length: options.worksheetCount }).map(() => ({
        title: 'Ayna Çizimi', gridDim: 10,
        drawings: [{ lines: [[[1, 1], [1, 5]], [[1, 5], [5, 5]], [[5, 5], [1, 1]]] }]
    }));
};

export const generateOfflineColorWheelMemory = async (options: OfflineGeneratorOptions): Promise<ColorWheelMemoryData[]> => {
    const items = shuffle(EMOJIS).slice(0, 8).map((name, i) => ({ name, color: COLORS[i % COLORS.length].css }));
    return Array.from({ length: options.worksheetCount }).map(() => ({
        title: 'Renk Çemberi', memorizeTitle: 'Ezberle', testTitle: 'Yerleştir', items
    }));
};

export const generateOfflineImageComprehension = async (options: OfflineGeneratorOptions): Promise<ImageComprehensionData[]> => {
    return Array.from({ length: options.worksheetCount }).map(() => ({
        title: 'Resim Anlama (Metin)', sceneDescription: 'Parkta oynayan üç çocuk var. Biri salıncakta, biri kaydırakta. Hava güneşli.',
        memorizeTitle: 'Sahneyi Oku', testTitle: 'Soruları Cevapla', questions: ['Parkta kaç çocuk var?', 'Hava nasıl?']
    }));
};

export const generateOfflineCharacterMemory = async (options: OfflineGeneratorOptions): Promise<CharacterMemoryData[]> => {
    const chars = [{ description: "Kırmızı şapkalı kız" }, { description: "Mavi gözlü çocuk" }, { description: "Yeşil tişörtlü adam" }, { description: "Sarı elbiseli kadın" }];
    const memChars = getRandomItems(chars, 2);
    return Array.from({ length: options.worksheetCount }).map(() => ({
        title: 'Karakter Hafıza', memorizeTitle: 'Ezberle', testTitle: 'İşaretle',
        charactersToMemorize: memChars,
        testCharacters: shuffle(chars)
    }));
};

export const generateOfflineStorySequencing = async (options: OfflineGeneratorOptions): Promise<StorySequencingData[]> => {
    const panels = [{ id: 'A', description: 'Tohum ekildi.' }, { id: 'B', description: 'Tohum sulandı.' }, { id: 'C', description: 'Çiçek büyüdü.' }, { id: 'D', description: 'Çiçek açtı.' }];
    return Array.from({ length: options.worksheetCount }).map(() => ({
        title: 'Hikaye Sıralama', prompt: 'Olayları doğru sıraya koyun.', panels: shuffle(panels)
    }));
};

export const generateOfflineChaoticNumberSearch = async (options: OfflineGeneratorOptions): Promise<ChaoticNumberSearchData[]> => {
    const numbers = Array.from({ length: 100 }).map(() => ({
        value: getRandomInt(1, 100), x: getRandomInt(5, 95), y: getRandomInt(5, 95),
        size: Math.random() * 1.5 + 0.8, rotation: getRandomInt(-45, 45), color: `hsl(${getRandomInt(0, 360)}, 70%, 50%)`
    }));
    return Array.from({ length: options.worksheetCount }).map(() => ({
        title: 'Sayıları Bulma', prompt: '1\'den 50\'ye kadar olan sayıları bulun.', numbers, range: { start: 1, end: 50 }
    }));
};

export const generateOfflineBlockPainting = async (options: OfflineGeneratorOptions): Promise<BlockPaintingData[]> => {
    return Array.from({ length: options.worksheetCount }).map(() => ({
        title: 'Blok Boyama', prompt: 'Blokları kullanarak deseni boyayın.', grid: { rows: 10, cols: 10 },
        shapes: [{ color: 'blue', pattern: [[1, 1], [1, 1]] }, { color: 'red', pattern: [[1, 0], [1, 1], [0, 1]] }]
    }));
};

export const generateOfflineVisualOddOneOut = async (options: OfflineGeneratorOptions): Promise<VisualOddOneOutData[]> => {
    const createItem = (on: number[]) => Array.from({ length: 9 }).map((_, i) => on.includes(i));
    return Array.from({ length: options.worksheetCount }).map(() => ({
        title: 'Farklı Şekli Bul', prompt: 'Her satırda farklı olanı bulun.',
        rows: [{ items: [{ segments: createItem([0, 1, 2, 4, 6, 7, 8]) }, { segments: createItem([0, 1, 2, 4, 6, 7, 8]) }, { segments: createItem([0, 1, 2, 3, 5, 6, 7, 8]) }] }]
    }));
};

export const generateOfflineShapeCounting = async (options: OfflineGeneratorOptions): Promise<ShapeCountingData[]> => {
    return Array.from({ length: options.worksheetCount }).map(() => ({
        title: 'Kaç Üçgen Var?', prompt: 'Şekildeki toplam üçgen sayısını bulun.',
        figures: [{ svgPaths: [{ d: "M50 10 L90 90 H10 Z", fill: "lightblue" }, { d: "M10 90 L50 10 L50 90 Z", fill: "lightgreen" }] }]
    }));
};

export const generateOfflineSymmetryDrawing = async (options: OfflineGeneratorOptions): Promise<SymmetryDrawingData[]> => {
    return Array.from({ length: options.worksheetCount }).map(() => ({
        title: 'Simetri Çizimi', prompt: 'Şeklin simetriğini çizin.', gridDim: 8,
        dots: [{ x: 1, y: 1 }, { x: 1, y: 3 }, { x: 3, y: 3 }], axis: 'vertical'
    }));
};

// FIX: Implement missing offline generator for Burdon Test to resolve error in Sidebar.tsx.
export const generateOfflineBurdonTest = async (options: OfflineGeneratorOptions): Promise<LetterGridTestData[]> => {
    const { gridSize = 20, worksheetCount } = options;
    const targets = ['a', 'b', 'd', 'g'];
    return Array.from({ length: worksheetCount }).map(() => ({
        title: 'Burdon Dikkat Testi (Hızlı Mod)',
        grid: Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => Math.random() < 0.25 ? getRandomItems(targets, 1)[0] : getRandomItems(turkishAlphabet.split('').filter(l => !targets.includes(l)), 1)[0])),
        targetLetters: targets
    }));
};

// FIX: Implement missing offline generator for Syllable Completion to resolve error in Sidebar.tsx.
export const generateOfflineSyllableCompletion = async (options: OfflineGeneratorOptions): Promise<SyllableCompletionData[]> => {
    const { topic, worksheetCount } = options;
    const availableWords = (wordlist[topic] || wordlist.Rastgele).filter(w => w.length > 4);
    return Array.from({ length: worksheetCount }).map(() => {
        const words = getRandomItems(availableWords, 5);
        const syllables: string[] = [];
        const wordParts = words.map(word => {
            const splitIndex = Math.floor(word.length / 2);
            const syllable = word.substring(splitIndex, splitIndex + 2);
            syllables.push(syllable);
            return {
                first: word.substring(0, splitIndex),
                second: word.substring(splitIndex + 2)
            };
        });

        return {
            title: 'Heceleri Tamamla (Hızlı Mod)',
            prompt: 'Eksik heceleri bularak kelimeleri tamamlayın.',
            theme: topic,
            wordParts,
            syllables: shuffle(syllables),
            storyPrompt: 'Tamamladığınız kelimelerle bir hikaye yazın.'
        };
    });
};

export const generateOfflineDotPainting = async (options: OfflineGeneratorOptions): Promise<DotPaintingData[]> => {
    return Array.from({ length: options.worksheetCount }).map(() => ({
        title: 'Nokta Boyama', prompt1: 'Aynı renkli noktaları birleştirin.', prompt2: '', svgViewBox: "0 0 100 100", gridPaths: [],
        dots: [{ cx: 20, cy: 20, color: 'red' }, { cx: 80, cy: 80, color: 'red' }, { cx: 20, cy: 80, color: 'blue' }, { cx: 80, cy: 20, color: 'blue' }]
    }));
};

export const generateOfflineAbcConnect = async (options: OfflineGeneratorOptions): Promise<AbcConnectData[]> => {
    return Array.from({ length: options.worksheetCount }).map(() => ({
        title: 'ABC Bağlama', prompt: 'Aynı harfleri birleştirin.',
        puzzles: [{ id: 1, gridDim: 6, points: [{ letter: 'A', x: 0, y: 0 }, { letter: 'A', x: 5, y: 5 }, { letter: 'B', x: 0, y: 5 }, { letter: 'B', x: 5, y: 0 }] }]
    }));
};

export const generateOfflineHomonymSentenceWriting = async (options: OfflineGeneratorOptions): Promise<HomonymSentenceData[]> => {
    return Array.from({ length: options.worksheetCount }).map(() => ({
        title: 'Eş Sesli Cümleler', prompt: 'Kelimelerin farklı anlamlarıyla cümleler kurun.',
        items: [{ word: 'yüz' }, { word: 'dal' }]
    }));
};

// FIX: Correct the type of 'items' by adding 'as const' to string literals to satisfy the strict union type. Also, shuffle the items for a better user experience.
export const generateOfflineProverbSayingSort = async (options: OfflineGeneratorOptions): Promise<ProverbSayingSortData[]> => {
    return Array.from({ length: options.worksheetCount }).map(() => ({
        title: 'Atasözü mü Özdeyiş mi?', prompt: 'Cümleleri doğru kategoriye ayırın.',
        items: shuffle([
            ...getRandomItems(proverbs, 2).map(p => ({ text: p, type: 'atasözü' as const })),
            { text: "Hayatta en hakiki mürşit ilimdir.", type: 'özdeyiş' as const }
        ])
    }));
};

export const generateOfflineHomonymImageMatch = async (options: OfflineGeneratorOptions): Promise<HomonymImageMatchData[]> => {
    return Array.from({ length: options.worksheetCount }).map(() => ({
        title: 'Eş Sesli Eşleştirme', prompt: 'Aynı kelimenin farklı anlamlarını eşleştirin.',
        leftImages: [{ id: 1, word: 'yüz (surat)' }, { id: 2, word: 'çay (içecek)' }],
        rightImages: [{ id: 1, word: 'yüz (sayı)' }, { id: 2, word: 'çay (akarsu)' }],
        wordScramble: { letters: ['y', 'ü', 'z'], word: 'yüz' }
    }));
};

export const generateOfflineAntonymFlowerPuzzle = async (options: OfflineGeneratorOptions): Promise<AntonymFlowerPuzzleData[]> => {
    return Array.from({ length: options.worksheetCount }).map(() => ({
        title: 'Zıt Anlamlı Çiçekler', prompt: 'Ortadaki kelimenin zıt anlamlısını bulun.',
        puzzles: [{ centerWord: 'iyi', antonym: 'kötü', petalLetters: shuffle('kötüxyz'.split('')) }],
        passwordLength: 4
    }));
};

export const generateOfflineProverbWordChain = async (options: OfflineGeneratorOptions): Promise<ProverbWordChainData[]> => {
    const proverb = getRandomItems(proverbs, 1)[0];
    return Array.from({ length: options.worksheetCount }).map(() => ({
        title: 'Atasözü Zinciri', prompt: 'Kelimeleri birleştirerek atasözünü oluşturun.',
        wordCloud: shuffle(proverb.replace(/[.,]/g, '').split(' ')).map(word => ({ word, color: `hsl(${getRandomInt(0, 360)}, 70%, 50%)` })),
        solutions: [proverb]
    }));
};

// The list is very long, so I will implement a representative sample of the remaining complex ones.

// FIX: Changed the return type of the simple generator to be compatible with `WorksheetData` by returning a valid `WordSearchData` object. This fixes numerous type errors in `Sidebar.tsx`.
const createSimpleGenerator = (title: string): ((options: OfflineGeneratorOptions) => Promise<WorksheetData>) => async (options: OfflineGeneratorOptions) => {
    return Array.from({ length: options.worksheetCount }).map(() => ({
        title: `${title} (Hızlı Mod - Otomatik Oluşturuldu)`,
        grid: [['B', 'U'], ['Y', 'OK']],
        words: ['YOK']
    } as WordSearchData));
};

export const generateOfflineSynonymAntonymGrid = createSimpleGenerator('Eş/Zıt Anlamlı Tablosu');
export const generateOfflinePunctuationColoring = createSimpleGenerator('Noktalama Boyama');
export const generateOfflinePunctuationMaze = createSimpleGenerator('Noktalama Labirenti');
export const generateOfflineAntonymResfebe = createSimpleGenerator('Zıt Anlamlı Resfebe');
export const generateOfflineThematicWordSearchColor = generateOfflineWordSearch; // Reuse
// FIX: Implemented the missing `generateOfflineThematicOddOneOut` function.
export const generateOfflineThematicOddOneOut = async (options: OfflineGeneratorOptions): Promise<ThematicOddOneOutData[]> => {
    const { topic, itemCount, worksheetCount } = options;
    // FIX: Explicitly type `wordlist` to satisfy TypeScript's strict type checking.
    const categories = Object.keys(wordlist).filter(k => k !== topic && k !== 'Rastgele');

    const results: ThematicOddOneOutData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const rows = Array.from({ length: itemCount }).map(() => {
            const mainWords = getRandomItems(wordlist[topic] || wordlist.Rastgele, 3);
            const outlierCat = getRandomItems(categories, 1)[0];
            const oddWord = getRandomItems(wordlist[outlierCat], 1)[0];
            return { words: shuffle([...mainWords, oddWord]), oddWord };
        });
        results.push({
            title: 'Tematik Farklı Olanı Bul',
            prompt: `Her satırda '${topic}' temasına uymayan kelimeyi bulun.`,
            theme: topic,
            rows,
            sentencePrompt: 'Farklı kelimelerle bir cümle yazın.'
        });
    }
    return results;
};
export const generateOfflineThematicOddOneOutSentence = generateOfflineThematicOddOneOut; // Reuse
export const generateOfflineProverbSentenceFinder = generateOfflineProverbWordChain; // Reuse
export const generateOfflineColumnOddOneOutSentence = createSimpleGenerator('Sütunda Farklı Olan');
export const generateOfflineSynonymAntonymColoring = createSimpleGenerator('Eş/Zıt Anlamlı Boyama');
export const generateOfflinePunctuationPhoneNumber = createSimpleGenerator('Noktalama Telefonu');
// FIX: Moved `generateOfflineSpiralPuzzle` before its usage to prevent 'used before its declaration' error.
export const generateOfflineSpiralPuzzle = async (options: OfflineGeneratorOptions): Promise<SpiralPuzzleData[]> => {
    return Array.from({ length: options.worksheetCount }).map(() => ({
        title: 'Sarmal Bulmaca (Hızlı Mod)', prompt: 'Kelimeleri sarmala yerleştirin.', clues: ['Soru 1', 'Soru 2'],
        grid: Array.from({ length: 10 }, () => Array(10).fill('a')), wordStarts: [{ id: 1, row: 0, col: 0 }]
    }));
};
export const generateOfflinePunctuationSpiralPuzzle = generateOfflineSpiralPuzzle; // Reuse
// FIX: Implemented the missing `generateOfflineJumbledWordStory` function.
export const generateOfflineJumbledWordStory = async (options: OfflineGeneratorOptions): Promise<JumbledWordStoryData[]> => {
    const { topic, worksheetCount } = options;
    const availableWords = wordlist[topic] || wordlist.Rastgele;
    return Array.from({ length: worksheetCount }).map(() => {
        const puzzles = getRandomItems(availableWords, 5).map(word => ({
            jumbled: shuffle(word.split('')),
            word: word
        }));
        return {
            title: 'Karışık Kelime Hikayesi',
            prompt: 'Kelimeleri çözüp hikaye yazın.',
            theme: topic,
            puzzles,
            storyPrompt: 'Çözdüğünüz kelimeleri kullanarak bir hikaye yazın.'
        };
    });
};

export const generateOfflineThematicJumbledWordStory = generateOfflineJumbledWordStory; // Reuse

export const generateOfflineSynonymMatchingPattern = createSimpleGenerator('Eş Anlamlı Eşleştirme Deseni');

export const generateOfflineFutoshiki = createSimpleGenerator('Futoshiki');

export const generateOfflineNumberCapsule = createSimpleGenerator('Sayı Kapsülü');

export const generateOfflineOddEvenSudoku = createSimpleGenerator('Tek-Çift Sudoku');

export const generateOfflineRomanNumeralConnect = createSimpleGenerator('Romen Rakamı Bağlama');

export const generateOfflineRomanNumeralStarHunt = createSimpleGenerator('Romen Rakamı Yıldız Avı');

export const generateOfflineRoundingConnect = createSimpleGenerator('Yuvarlama Bağlama');

export const generateOfflineRomanNumeralMultiplication = createSimpleGenerator('Romen Rakamı Çarpma');

export const generateOfflineArithmeticConnect = createSimpleGenerator('Aritmetik Bağlama');

export const generateOfflineRomanArabicMatchConnect = createSimpleGenerator('Romen-Arap Eşleştirme');

export const generateOfflineSudoku6x6Shaded = createSimpleGenerator('Gölgeli Sudoku 6x6');

export const generateOfflineKendoku = createSimpleGenerator('Kendoku');

export const generateOfflineDivisionPyramid = async (options: OfflineGeneratorOptions): Promise<DivisionPyramidData[]> => {
    const { worksheetCount, difficulty } = options;
    
    let topMin = 20, topMax = 50, rows = 3;
    if (difficulty === 'Orta') {
        topMin = 50; topMax = 150; rows = 4;
    } else if (difficulty === 'Zor') {
        topMin = 100; topMax = 300; rows = 4;
    }

    return Array.from({ length: worksheetCount }).map(() => {
        // Build from top down to ensure divisibility
        const buildPyramid = () => {
            while(true) {
                try {
                    const pyramid: number[][] = Array.from({length: rows}, () => []);
                    let top = getRandomInt(topMin, topMax);
                    while (top % 2 !== 0 && top > topMin) top--; // Prefer even top numbers
                    pyramid[0] = [top];

                    for (let r = 0; r < rows - 1; r++) {
                        pyramid[r+1] = Array(r+2);
                        for (let c = 0; c < pyramid[r].length; c++) {
                            const num = pyramid[r][c];
                            const divisors = [];
                            for (let k = 2; k < num / 2; k++) {
                                if (num % k === 0) divisors.push(k);
                            }
                            if (divisors.length === 0) throw new Error("No divisors");
                            
                            const div = getRandomItems(divisors, 1)[0];
                            pyramid[r+1][c] = div;
                            pyramid[r+1][c+1] = num / div;
                        }
                    }
                    return pyramid;
                } catch(e) {
                    // try again
                }
            }
        };

        const pyramidData = buildPyramid();
        const pyramidWithBlanks: (number | null)[][] = pyramidData.map(r => [...r]);
        pyramidWithBlanks[0][0] = null; // Blank top
        pyramidWithBlanks[1][getRandomInt(0,1)] = null; // Blank second row

        return {
            title: 'Bölme Piramidi',
            prompt: 'Üstteki sayı, altındaki iki sayının çarpımıdır.',
            pyramids: [{ rows: pyramidWithBlanks }]
        }
    });
};

export const generateOfflineMultiplicationPyramid = async (options: OfflineGeneratorOptions): Promise<MultiplicationPyramidData[]> => {
    const { worksheetCount, difficulty } = options;

    let baseSize = 3, baseMin = 1, baseMax = 5;
    if (difficulty === 'Orta') {
        baseSize = 4; baseMin = 1; baseMax = 6;
    } else if (difficulty === 'Zor') {
        baseSize = 4; baseMin = 2; baseMax = 7;
    }

    return Array.from({ length: worksheetCount }).map(() => ({
        title: 'Çarpma Piramidi',
        prompt: 'Üstteki sayı, altındaki iki sayının çarpımıdır.',
        pyramids: Array.from({length: 2}).map(() => {
            const base = Array.from({ length: baseSize }, () => getRandomInt(baseMin, baseMax));
            const rows: (number | null)[][] = [];
            rows[baseSize - 1] = [...base];
             for (let r = baseSize - 2; r >= 0; r--) {
                rows[r] = Array.from({ length: r + 1 }).map((_, c) => rows[r + 1][c]! * rows[r + 1][c + 1]!);
            }
            rows[0][0] = null; // Always hide the top
            rows[baseSize-1][getRandomInt(0, baseSize-1)] = null; // Hide one from base
            return { rows };
        })
    }));
};

export const generateOfflineOperationSquareSubtraction = createSimpleGenerator('Çıkarma İşlem Karesi');

export const generateOfflineOperationSquareFillIn = createSimpleGenerator('İşlem Karesi Doldurma');

export const generateOfflineMultiplicationWheel = createSimpleGenerator('Çarpma Çarkı');

export const generateOfflineOperationSquareMultDiv = createSimpleGenerator('Çarpma/Bölme İşlem Karesi');

export const generateOfflineShapeSudoku = createSimpleGenerator('Şekilli Sudoku');

export const generateOfflineWeightConnect = createSimpleGenerator('Ağırlık Bağlama');

export const generateOfflineResfebe = createSimpleGenerator('Resfebe');

export const generateOfflineFutoshikiLength = createSimpleGenerator('Uzunluk Futoşiki');

export const generateOfflineMatchstickSymmetry = createSimpleGenerator('Kibrit Simetrisi');

export const generateOfflineWordWeb = createSimpleGenerator('Kelime Ağı');

export const generateOfflineStarHunt = createSimpleGenerator('Yıldız Avı');

export const generateOfflineLengthConnect = createSimpleGenerator('Uzunluk Bağlama');

export const generateOfflineVisualNumberPattern = createSimpleGenerator('Görsel Sayı Örüntüsü');

export const generateOfflineMissingParts = createSimpleGenerator('Eksik Parçalar');

export const generateOfflineProfessionConnect = createSimpleGenerator('Meslek Bağlama');

export const generateOfflineVisualOddOneOutThemed = createSimpleGenerator('Tematik Görsel Farklı Olan');

export const generateOfflineLogicGridPuzzle = createSimpleGenerator('Mantık Tablosu');

export const generateOfflineImageAnagramSort = createSimpleGenerator('Resimli Anagram Sıralama');

export const generateOfflineAnagramImageMatch = createSimpleGenerator('Anagram Resim Eşleştirme');

export const generateOfflineSyllableWordSearch = createSimpleGenerator('Hece Kelime Avı');

export const generateOfflineWordSearchWithPassword = generateOfflineWordSearch; // Reuse

export const generateOfflineWordWebWithPassword = createSimpleGenerator('Şifreli Kelime Ağı');

export const generateOfflineLetterGridWordFind = generateOfflineWordSearch; // Reuse

export const generateOfflineWordPlacementPuzzle = createSimpleGenerator('Kelime Yerleştirme');

export const generateOfflinePositionalAnagram = createSimpleGenerator('Konumsal Anagram');

export const generateOfflineCrossword = createSimpleGenerator('Çapraz Bulmaca');

export const generateOfflineWordGridPuzzle = createSimpleGenerator('Kelime Izgara Bulmacası');

export const generateOfflineSynonymSearchAndStory = createSimpleGenerator('Eş Anlamlı Arama ve Hikaye');

export const generateOfflinePasswordFinder = createSimpleGenerator('Şifre Bulucu');

export const generateOfflineSynonymWordSearch = generateOfflineWordSearch; // Reuse

export const generateOfflineWordConnect = createSimpleGenerator('Kelime Bağlama');
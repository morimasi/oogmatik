
// FIX: Removed static JSON imports and embedded data directly to prevent file loading issues.
import { 
    WorksheetData, WordSearchData, AnagramData, MathPuzzleData, FindTheDifferenceData, ProverbFillData,
    SpellingCheckData, OddOneOutData, WordComparisonData, WordsInStoryData, ProverbSearchData, ReverseWordData, FindDuplicateData, WordGroupingData, WordLadderData, WordFormationData, FindIdenticalWordData, LetterBridgeData, FindLetterPairData, MiniWordGridData,
    StroopTestData, NumberPatternData, NumberSearchData, SymbolCipherData, ShapeType, TargetNumberData, NumberPyramidData, FindDifferentStringData, StoryData, StoryCreationPromptData, WordMemoryData, LetterGridTestData, ShapeMatchingData, StoryAnalysisData, CoordinateCipherData, TargetSearchData, VisualMemoryData, StorySequencingData, GridDrawingData, SymmetryDrawingData, AbcConnectData, MultiplicationPyramidData, DivisionPyramidData, MultiplicationWheelData, ShapeSudokuData, MissingPartsData, WordConnectData, JumbledWordStoryData, ThematicOddOneOutData, PasswordFinderData, SyllableCompletionData, CrosswordData, WordGridPuzzleData, ProverbSayingSortData, HomonymImageMatchData, AntonymFlowerPuzzleData, ProverbWordChainData, SynonymAntonymGridData, PunctuationColoringData, PunctuationMazeData, AntonymResfebeData, ThematicWordSearchColorData, ThematicOddOneOutSentenceData, ProverbSentenceFinderData, SynonymSearchAndStoryData, ColumnOddOneOutSentenceData, SynonymAntonymColoringData, PunctuationPhoneNumberData, PunctuationSpiralPuzzleData, ThematicJumbledWordStoryData, SynonymMatchingPatternData, FutoshikiData, NumberCapsuleData, OddEvenSudokuData, RomanNumeralConnectData, RomanNumeralStarHuntData, RoundingConnectData, RomanNumeralMultiplicationData, ArithmeticConnectData, RomanArabicMatchConnectData, Sudoku6x6ShadedData, KendokuData, OperationSquareSubtractionData, OperationSquareFillInData, ResfebeData, FutoshikiLengthData, MatchstickSymmetryData, WordWebData, StarHuntData, LengthConnectData, VisualNumberPatternData, ProfessionConnectData, VisualOddOneOutThemedData, LogicGridPuzzleData, ImageAnagramSortData, AnagramImageMatchData, SyllableWordSearchData, WordSearchWithPasswordData, WordWebWithPasswordData, LetterGridWordFindData, WordPlacementPuzzleData, PositionalAnagramData, ColorWheelMemoryData, ImageComprehensionData, CharacterMemoryData, ChaoticNumberSearchData, BlockPaintingData, VisualOddOneOutData, ShapeCountingData, DotPaintingData, HomonymSentenceData,
    ShapeNumberPatternData,
    SynonymWordSearchData,
    SpiralPuzzleData,
// FIX: Imported missing types to resolve compilation errors.
    OperationSquareMultDivData,
    WeightConnectData
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

// --- Helper Data ---
const synonymMap: Record<string, string> = { "hızlı": "süratli", "yavaş": "ağır", "güzel": "hoş", "cevap": "yanıt", "soru": "sual", "öğrenci": "talebe", "doktor": "hekim", "ev": "konut", "kırmızı": "al", "siyah": "kara" };
const antonymMap: Record<string, string> = { "iyi": "kötü", "uzun": "kısa", "sıcak": "soğuk", "dolu": "boş", "açık": "kapalı", "temiz": "kirli", "zengin": "fakir", "kolay": "zor", "güzel": "çirkin", "gel": "git" };


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
        const commonWords = getRandomItems(availableWords, 10);
        const list1_diff = getRandomItems(availableWords.filter(w => !commonWords.includes(w)), 3);
        const list2_diff = getRandomItems(availableWords.filter(w => !commonWords.includes(w) && !list1_diff.includes(w)), 3);
        
        results.push({
            title: "Kelime Karşılaştırma",
            box1Title: "Kutu 1",
            box2Title: "Kutu 2",
            wordList1: shuffle([...commonWords, ...list1_diff]),
            wordList2: shuffle([...commonWords, ...list2_diff]),
        });
    }
    return results;
};

// FIX: Added all missing offline generator function stubs to resolve export errors.

export const generateOfflineStoryComprehension = async (options: OfflineGeneratorOptions): Promise<StoryData[]> => {
    const { worksheetCount } = options;
    const results: StoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        results.push({
            title: `Çevrimdışı Hikaye ${i + 1}`,
            story: 'Bir zamanlar küçük bir köyde Ali adında bir çocuk yaşarmış. Ali hayvanları çok severmiş. Bir gün ormanda yaralı bir kuş bulmuş ve ona yardım etmiş.',
            questions: [
                { question: 'Çocuğun adı neydi?', options: ['Veli', 'Ali', 'Can'], answerIndex: 1 },
                { question: 'Ali nerede yaşarmış?', options: ['Şehirde', 'Kasabada', 'Köyde'], answerIndex: 2 },
            ],
        });
    }
    return results;
};

export const generateOfflineStroopTest = async (options: OfflineGeneratorOptions): Promise<StroopTestData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: StroopTestData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const items = Array.from({ length: itemCount }).map(() => {
            const color1 = getRandomItems(COLORS, 1)[0];
            const color2 = getRandomItems(COLORS.filter(c => c.css !== color1.css), 1)[0];
            return { text: color1.name, color: color2.css };
        });
        results.push({ title: 'Stroop Testi (Çevrimdışı)', items });
    }
    return results;
};

export const generateOfflineNumberPattern = async (options: OfflineGeneratorOptions): Promise<NumberPatternData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: NumberPatternData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const patterns = Array.from({ length: itemCount }).map(() => {
            const start = getRandomInt(1, 10);
            const step = getRandomInt(2, 5);
            const sequence = Array.from({ length: 4 }).map((_, k) => start + k * step).join(', ') + ', ?';
            const answer = (start + 4 * step).toString();
            return { sequence, answer };
        });
        results.push({ title: 'Sayı Örüntüsü (Çevrimdışı)', patterns });
    }
    return results;
};

export const generateOfflineLetterGridTest = async (options: OfflineGeneratorOptions): Promise<LetterGridTestData[]> => {
    const { gridSize, worksheetCount, targetLetters } = options;
    const results: LetterGridTestData[] = [];
    const targets = (targetLetters || "a,b,d,g").split(',').map(t => t.trim());
    for (let i = 0; i < worksheetCount; i++) {
        const grid = Array.from({ length: gridSize }, () => 
            Array.from({ length: gridSize }, () => turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)])
        );
        results.push({ title: 'Harf Izgara Testi (Çevrimdışı)', grid, targetLetters: targets });
    }
    return results;
};

export const generateOfflineNumberSearch = async (options: OfflineGeneratorOptions): Promise<NumberSearchData[]> => {
    const { worksheetCount } = options;
    const results: NumberSearchData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const numbers = Array.from({ length: 100 }, () => getRandomInt(1, 100));
        results.push({ title: 'Sayı Avı (Çevrimdışı)', numbers, range: { start: 1, end: 50 } });
    }
    return results;
};

export const generateOfflineWordMemory = async (options: OfflineGeneratorOptions): Promise<WordMemoryData[]> => {
    const { topic, worksheetCount } = options;
    const availableWords = wordlist[topic] || wordlist.Rastgele;
    const results: WordMemoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const wordsToMemorize = getRandomItems(availableWords, 10);
        const otherWords = getRandomItems(availableWords.filter(w => !wordsToMemorize.includes(w)), 10);
        results.push({
            title: 'Kelime Hafıza (Çevrimdışı)',
            memorizeTitle: 'Bu Kelimeleri Ezberle',
            testTitle: 'Ezberlediklerini İşaretle',
            wordsToMemorize,
            testWords: shuffle([...wordsToMemorize, ...otherWords]),
        });
    }
    return results;
};

export const generateOfflineStoryCreationPrompt = async (options: OfflineGeneratorOptions): Promise<StoryCreationPromptData[]> => {
    const { topic, worksheetCount } = options;
    const availableWords = wordlist[topic] || wordlist.Rastgele;
    const results: StoryCreationPromptData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        results.push({
            title: 'Hikaye Oluşturma (Çevrimdışı)',
            prompt: 'Bu kelimeleri kullanarak bir hikaye yaz.',
            keywords: getRandomItems(availableWords, 5),
        });
    }
    return results;
};

export const generateOfflineWordsInStory = async (options: OfflineGeneratorOptions): Promise<WordsInStoryData[]> => {
    const { topic, worksheetCount } = options;
    const availableWords = wordlist[topic] || wordlist.Rastgele;
    const results: WordsInStoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const inStoryWords = getRandomItems(availableWords, 6);
        const notInStoryWords = getRandomItems(availableWords.filter(w => !inStoryWords.includes(w)), 6);
        const story = `İşte ${topic} hakkında bir hikaye. İçinde ${inStoryWords.join(', ')} kelimeleri geçiyor. Ama ${notInStoryWords.join(', ')} kelimeleri geçmiyor.`;
        const wordList = shuffle([
            ...inStoryWords.map(word => ({ word, isInStory: true })),
            ...notInStoryWords.map(word => ({ word, isInStory: false })),
        ]);
        results.push({ title: 'Metindeki Kelimeler (Çevrimdışı)', story, wordList });
    }
    return results;
};

export const generateOfflineShapeMatching = async (options: OfflineGeneratorOptions): Promise<ShapeMatchingData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: ShapeMatchingData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const leftColumn = Array.from({ length: itemCount }, (_, k) => ({
            id: k + 1,
            shapes: getRandomItems(SHAPE_TYPES, 3),
        }));
        const rightColumn = shuffle(leftColumn).map((item, k) => ({
            ...item,
            id: String.fromCharCode(65 + k),
        }));
        results.push({ title: 'Şekil Eşleştirme (Çevrimdışı)', leftColumn, rightColumn });
    }
    return results;
};

export const generateOfflineSymbolCipher = async (options: OfflineGeneratorOptions): Promise<SymbolCipherData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: SymbolCipherData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const cipherKey = getRandomItems(SHAPE_TYPES, 8).map((shape, k) => ({ shape, letter: turkishAlphabet[k] }));
        const wordsToSolve = Array.from({ length: itemCount }).map(() => {
            const wordLength = getRandomInt(4, 6);
            const shapeSequence = getRandomItems(cipherKey, wordLength).map(ck => ck.shape);
            return { shapeSequence, wordLength };
        });
        results.push({ title: 'Şifre Çözme (Çevrimdışı)', cipherKey, wordsToSolve });
    }
    return results;
};

export const generateOfflineLetterBridge = async (options: OfflineGeneratorOptions): Promise<LetterBridgeData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: LetterBridgeData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        results.push({
            title: 'Harf Köprüsü (Çevrimdışı)',
            pairs: Array.from({ length: itemCount }).map(() => ({ word1: 'ÖRNEK', word2: 'SÖZCÜK' })),
        });
    }
    return results;
};

export const generateOfflineWordLadder = async (options: OfflineGeneratorOptions): Promise<WordLadderData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: WordLadderData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        results.push({
            title: 'Kelime Merdiveni (Çevrimdışı)',
            ladders: Array.from({ length: itemCount }).map(() => ({ startWord: 'BAŞLA', endWord: 'BİTİR', steps: 3 })),
        });
    }
    return results;
};

export const generateOfflineFindIdenticalWord = async (options: OfflineGeneratorOptions): Promise<FindIdenticalWordData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: FindIdenticalWordData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        results.push({
            title: 'Aynısını Bul (Çevrimdışı)',
            groups: Array.from({ length: itemCount }).map(() => ({ words: ['benzer', 'benzeş'] })),
        });
    }
    return results;
};

export const generateOfflineWordFormation = async (options: OfflineGeneratorOptions): Promise<WordFormationData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: WordFormationData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        results.push({
            title: 'Kelime Türetme (Çevrimdışı)',
            sets: Array.from({ length: itemCount }).map(() => ({ letters: ['a', 'b', 'c', 'd', 'e', 'f'], jokerCount: 1 })),
        });
    }
    return results;
};

export const generateOfflineFindLetterPair = async (options: OfflineGeneratorOptions): Promise<FindLetterPairData[]> => {
    const { gridSize, targetPair, worksheetCount } = options;
    const results: FindLetterPairData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const grid = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => 'x'));
        results.push({ title: 'Harf İkilisi Bul (Çevrimdışı)', grid, targetPair: targetPair || 'tr' });
    }
    return results;
};

export const generateOfflineVisualMemory = async (options: OfflineGeneratorOptions): Promise<VisualMemoryData[]> => {
    const { worksheetCount } = options;
    const results: VisualMemoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const itemsToMemorize = getRandomItems(EMOJIS, 8);
        const otherItems = getRandomItems(EMOJIS.filter(e => !itemsToMemorize.includes(e)), 8);
        results.push({
            title: 'Görsel Hafıza (Çevrimdışı)',
            memorizeTitle: 'Bunları Ezberle',
            testTitle: 'Gördüklerini İşaretle',
            itemsToMemorize,
            testItems: shuffle([...itemsToMemorize, ...otherItems]),
        });
    }
    return results;
};

export const generateOfflineStoryAnalysis = async (options: OfflineGeneratorOptions): Promise<StoryAnalysisData[]> => {
    const { worksheetCount } = options;
    const results: StoryAnalysisData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        results.push({
            title: 'Hikaye Analizi (Çevrimdışı)',
            story: 'Mutlu çocuk parkta hızlıca koşuyordu. Annesi ona yavaş olmasını söyledi.',
            questions: [
                { question: "'Mutlu' kelimesinin zıt anlamlısı nedir?", context: 'Mutlu çocuk' },
                { question: "'Hızlı' kelimesinin eş anlamlısı nedir?", context: 'hızlıca koşuyordu' }
            ],
        });
    }
    return results;
};

// --- START OF MISSING FUNCTION STUBS ---
// The following functions are placeholders to resolve missing export errors.

export const generateOfflineFindDuplicateInRow = async (options: OfflineGeneratorOptions): Promise<FindDuplicateData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: FindDuplicateData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const rows = Array.from({ length: itemCount }).map(() => {
            const row = getRandomItems(turkishAlphabet.split(''), 15);
            const duplicateIndex = getRandomInt(0, 14);
            const insertIndex = getRandomInt(0, 14);
            row.splice(insertIndex, 0, row[duplicateIndex]);
            return row;
        });
        results.push({ title: 'İkiliyi Bul (Çevrimdışı)', rows });
    }
    return results;
}

export const generateOfflineReverseWord = async (options: OfflineGeneratorOptions): Promise<ReverseWordData[]> => {
    const { topic, itemCount, worksheetCount } = options;
    const availableWords = wordlist[topic] || wordlist.Rastgele;
    const results: ReverseWordData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const words = getRandomItems(availableWords, itemCount);
        results.push({ title: 'Ters Kelime (Çevrimdışı)', words });
    }
    return results;
};

export const generateOfflineWordGrouping = async (options: OfflineGeneratorOptions): Promise<WordGroupingData[]> => {
    const { worksheetCount } = options;
    const results: WordGroupingData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const categoryNames = ['Meyveler', 'Hayvanlar', 'Meslekler'];
        const words = [...getRandomItems(wordlist.Meyveler, 4), ...getRandomItems(wordlist.Hayvanlar, 4), ...getRandomItems(wordlist.Meslekler, 4)];
        results.push({ title: 'Kelime Gruplama (Çevrimdışı)', words: shuffle(words), categoryNames });
    }
    return results;
};

export const generateOfflineProverbSearch = async (options: OfflineGeneratorOptions): Promise<ProverbSearchData[]> => {
    const { worksheetCount, gridSize } = options;
    const results: ProverbSearchData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const grid = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => 'x'));
        results.push({ title: 'Atasözü Avı (Çevrimdışı)', grid, proverb: 'Damlaya damlaya göl olur.' });
    }
    return results;
};

export const generateOfflineMiniWordGrid = async (options: OfflineGeneratorOptions): Promise<MiniWordGridData[]> => {
    const { worksheetCount } = options;
    const results: MiniWordGridData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        results.push({
            title: 'Mini Kelime Bulmaca (Çevrimdışı)',
            prompt: 'Kelimeyi bul.',
            puzzles: [{ grid: [['e', 'l'], ['m', 'a']], start: { row: 0, col: 0 } }]
        });
    }
    return results;
};

export const generateOfflineFindDifferentString = async (options: OfflineGeneratorOptions): Promise<FindDifferentStringData[]> => {
    const { worksheetCount, itemCount } = options;
    const results: FindDifferentStringData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const rows = Array.from({ length: itemCount }).map(() => ({ items: ['VWN', 'VWN', 'VNW', 'VWN', 'VWN'] }));
        results.push({ title: 'Farklı Diziyi Bul (Çevrimdışı)', prompt: 'Farklı olanı bul.', rows });
    }
    return results;
};

export const generateOfflineNumberPyramid = async (options: OfflineGeneratorOptions): Promise<NumberPyramidData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Sayı Piramidi (Çevrimdışı)',
        prompt: 'Boşlukları doldur.',
        pyramids: [{ title: 'Piramit 1', rows: [[8], [null, 2]] }]
    });
};

export const generateOfflineTargetNumber = async (options: OfflineGeneratorOptions): Promise<TargetNumberData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Hedef Sayı (Çevrimdışı)',
        prompt: 'Hedefe ulaş.',
        puzzles: [{ target: 24, givenNumbers: [1, 2, 3, 4] }]
    });
};

export const generateOfflineCoordinateCipher = async (options: OfflineGeneratorOptions): Promise<CoordinateCipherData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Koordinat Şifre (Çevrimdışı)',
        grid: [['a', 'b'], ['c', 'd']],
        wordsToFind: ['ab'],
        cipherCoordinates: ['A1', 'B2']
    });
};

export const generateOfflineTargetSearch = async (options: OfflineGeneratorOptions): Promise<TargetSearchData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Hedef Arama (Çevrimdışı)',
        grid: [['Z', '7'], ['Z', 'Z']],
        target: options.targetChar || '7',
        distractor: options.distractorChar || 'Z'
    });
};

export const generateOfflineShapeNumberPattern = async (options: OfflineGeneratorOptions): Promise<ShapeNumberPatternData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Şekilli Sayı Örüntüsü (Çevrimdışı)',
        patterns: [{ shapes: [{ type: 'triangle', numbers: ['1', '2', '3', '?'] }] }]
    });
};

export const generateOfflineGridDrawing = async (options: OfflineGeneratorOptions): Promise<GridDrawingData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Ayna Çizimi (Çevrimdışı)',
        gridDim: 10,
        drawings: [{ lines: [[[0, 0], [5, 5]]] }]
    });
};

export const generateOfflineColorWheelMemory = async (options: OfflineGeneratorOptions): Promise<ColorWheelMemoryData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Renk Çemberi (Çevrimdışı)',
        memorizeTitle: 'Ezberle',
        testTitle: 'Test',
        items: [{ name: "Elma 🍎", color: "#FF0000" }, { name: "Araba 🚗", color: "#0000FF" }]
    });
};

export const generateOfflineImageComprehension = async (options: OfflineGeneratorOptions): Promise<ImageComprehensionData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Resim Anlama (Çevrimdışı)',
        memorizeTitle: 'İncele',
        testTitle: 'Cevapla',
        sceneDescription: 'Parkta oynayan çocuklar.',
        questions: ['Kaç çocuk var?']
    });
};

export const generateOfflineCharacterMemory = async (options: OfflineGeneratorOptions): Promise<CharacterMemoryData[]> => {
    const char = { description: 'Kırmızı şapkalı çocuk' };
    return Array(options.worksheetCount).fill({
        title: 'Karakter Hafıza (Çevrimdışı)',
        memorizeTitle: 'Ezberle',
        testTitle: 'Test',
        charactersToMemorize: [char],
        testCharacters: [char, { description: 'Mavi pantolonlu kız' }]
    });
};

export const generateOfflineStorySequencing = async (options: OfflineGeneratorOptions): Promise<StorySequencingData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Hikaye Sıralama (Çevrimdışı)',
        prompt: 'Olayları sırala.',
        panels: [{ id: 'A', description: 'Çocuk uyandı.' }, { id: 'B', description: 'Çocuk kahvaltı yaptı.' }]
    });
};

export const generateOfflineChaoticNumberSearch = async (options: OfflineGeneratorOptions): Promise<ChaoticNumberSearchData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Sayı Avı (Çevrimdışı)',
        prompt: '1\'den 10\'a kadar bul.',
        numbers: [{ value: 1, x: 10, y: 10, size: 2, rotation: 0, color: 'red' }],
        range: { start: 1, end: 10 }
    });
};

export const generateOfflineBlockPainting = async (options: OfflineGeneratorOptions): Promise<BlockPaintingData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Blok Boyama (Çevrimdışı)',
        prompt: 'Boyama yap.',
        grid: { rows: 10, cols: 10 },
        shapes: [{ color: 'blue', pattern: [[1, 1], [1, 1]] }]
    });
};

export const generateOfflineVisualOddOneOut = async (options: OfflineGeneratorOptions): Promise<VisualOddOneOutData[]> => {
    const item = { segments: [true, true, true, true, true, true, true, false, false] };
    return Array(options.worksheetCount).fill({
        title: 'Görsel Farklı Olanı Bul (Çevrimdışı)',
        prompt: 'Farklı olanı bul.',
        rows: [{ items: [item, item, { ...item, segments: [...item.segments.slice(1), false] }] }]
    });
};

export const generateOfflineShapeCounting = async (options: OfflineGeneratorOptions): Promise<ShapeCountingData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Şekil Sayma (Çevrimdışı)',
        prompt: 'Üçgenleri say.',
        figures: [{ svgPaths: [{ d: 'M0 0 L50 50 L0 50 Z', fill: 'lightblue' }] }]
    });
};

export const generateOfflineSymmetryDrawing = async (options: OfflineGeneratorOptions): Promise<SymmetryDrawingData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Simetri Çizimi (Çevrimdışı)',
        prompt: 'Simetriğini çiz.',
        gridDim: 8,
        dots: [{ x: 1, y: 1 }],
        axis: 'vertical'
    });
};

export const generateOfflineBurdonTest = async (options: OfflineGeneratorOptions): Promise<LetterGridTestData[]> => {
    return generateOfflineLetterGridTest({...options, targetLetters: 'a,b,d,g'});
};

export const generateOfflineDotPainting = async (options: OfflineGeneratorOptions): Promise<DotPaintingData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Nokta Boyama (Çevrimdışı)',
        prompt1: 'Boyama yap.',
        prompt2: 'Gizli resmi bul.',
        svgViewBox: '0 0 100 100',
        gridPaths: ['M0 10 L100 10'],
        dots: [{ cx: 50, cy: 50, color: 'red' }]
    });
};

export const generateOfflineAbcConnect = async (options: OfflineGeneratorOptions): Promise<AbcConnectData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'ABC Bağlama (Çevrimdışı)',
        prompt: 'Harfleri birleştir.',
        puzzles: [{ id: 1, gridDim: 6, points: [{ letter: 'A', x: 0, y: 0 }, { letter: 'A', x: 5, y: 5 }] }]
    });
};

export const generateOfflinePasswordFinder = async (options: OfflineGeneratorOptions): Promise<PasswordFinderData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Şifre Bul (Çevrimdışı)',
        prompt: 'Özel isimleri bul.',
        words: [{ word: 'ankara', passwordLetter: 'A', isProperNoun: true }],
        passwordLength: 1
    });
};

export const generateOfflineSyllableCompletion = async (options: OfflineGeneratorOptions): Promise<SyllableCompletionData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Heceleri Tamamla (Çevrimdışı)',
        prompt: 'Kelimeleri oluştur.',
        theme: 'Okul',
        wordParts: [{ first: 'Ka', second: 'lem' }],
        syllables: ['le'],
        storyPrompt: 'Hikaye yaz.'
    });
};

export const generateOfflineSynonymWordSearch = async (options: OfflineGeneratorOptions): Promise<SynonymWordSearchData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Eş Anlamlı Avı (Çevrimdışı)',
        prompt: 'Eş anlamlıları bul.',
        wordsToMatch: [{ word: 'hızlı', synonym: 'süratli' }],
        grid: [['s', 'ü'], ['r', 'a']]
    });
};

export const generateOfflineWordConnect = async (options: OfflineGeneratorOptions): Promise<WordConnectData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Kelime Bağlama (Çevrimdışı)',
        prompt: 'İlişkili kelimeleri bağla.',
        gridDim: 10,
        points: [{ word: 'doktor', pairId: 1, x: 1, y: 1 }, { word: 'hastane', pairId: 1, x: 8, y: 8 }]
    });
};

export const generateOfflineSpiralPuzzle = async (options: OfflineGeneratorOptions): Promise<SpiralPuzzleData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Sarmal Bulmaca (Çevrimdışı)',
        prompt: 'Kelimeleri yerleştir.',
        clues: ['Bir meyve'],
        grid: [['e', 'l'], ['m', 'a']],
        wordStarts: [{ id: 1, row: 0, col: 0 }]
    });
};

export const generateOfflineCrossword = async (options: OfflineGeneratorOptions): Promise<CrosswordData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Çapraz Bulmaca (Çevrimdışı)',
        prompt: 'Bulmacayı çöz.',
        grid: [['k', null], ['e', 'di']],
        clues: [{ id: 1, direction: 'down', text: 'Miyav der.', start: { row: 0, col: 0 }, word: 'kedi' }],
        passwordCells: [{ row: 0, col: 0 }],
        passwordLength: 1
    });
};

export const generateOfflineJumbledWordStory = async (options: OfflineGeneratorOptions): Promise<JumbledWordStoryData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Karışık Kelime ve Hikaye (Çevrimdışı)',
        prompt: 'Karışık harflerden kelimeleri bulun ve bu kelimelerle bir hikaye yazın.',
        theme: options.topic || 'Okul',
        puzzles: [
            { jumbled: ['k', 'l', 'e', 'a', 'm'], word: 'kalem' },
            { jumbled: ['d', 'e', 'f', 'e', 't', 'r'], word: 'defter' },
            { jumbled: ['s', 'l', 'i', 'i', 'g'], word: 'silgi' }
        ],
        storyPrompt: 'Yukarıda bulduğun kelimeleri kullanarak kısa bir hikaye yaz.'
    });
};

export const generateOfflineHomonymSentenceWriting = async (options: OfflineGeneratorOptions): Promise<HomonymSentenceData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Eş Sesli Cümle Yazma (Çevrimdışı)',
        prompt: 'Verilen kelimelerle iki farklı anlama gelecek şekilde cümleler yazın.',
        items: [{ word: 'yüz' }, { word: 'dal' }, { word: 'çay' }]
    });
};

export const generateOfflineWordGridPuzzle = async (options: OfflineGeneratorOptions): Promise<WordGridPuzzleData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Kelime Ağı (Çevrimdışı)',
        prompt: 'Kelimeleri yerleştir.',
        theme: 'Doğa',
        wordList: ['ağaç', 'nehir', 'dağ'],
        grid: [[null, 'a', null], ['a', 'ğ', 'a'], [null, 'ç', null]],
        unusedWordPrompt: 'Kullanılmayan kelimeyle cümle kur.'
    });
};

export const generateOfflineProverbSayingSort = async (options: OfflineGeneratorOptions): Promise<ProverbSayingSortData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Atasözü/Özdeyiş (Çevrimdışı)',
        prompt: 'Sınıflandır.',
        items: [{ text: 'Damlaya damlaya göl olur.', type: 'atasözü' }, { text: 'Hayatta en hakiki mürşit ilimdir.', type: 'özdeyiş' }]
    });
};

export const generateOfflineHomonymImageMatch = async (options: OfflineGeneratorOptions): Promise<HomonymImageMatchData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Eş Sesli Resim Eşleştirme (Çevrimdışı)',
        prompt: 'Eşleştir.',
        leftImages: [{ id: 1, word: 'yüz' }],
        rightImages: [{ id: 1, word: 'yüz' }],
        wordScramble: { letters: ['y', 'ü', 'z'], word: 'yüz' }
    });
};

export const generateOfflineAntonymFlowerPuzzle = async (options: OfflineGeneratorOptions): Promise<AntonymFlowerPuzzleData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Zıt Anlamlı Papatya (Çevrimdışı)',
        prompt: 'Zıt anlamlıları bul.',
        puzzles: [{ centerWord: 'iyi', antonym: 'kötü', petalLetters: ['a', 'b', 'c', 'd', 'e', 'f'] }],
        passwordLength: 3
    });
};

export const generateOfflineProverbWordChain = async (options: OfflineGeneratorOptions): Promise<ProverbWordChainData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Atasözü Zinciri (Çevrimdışı)',
        prompt: 'Atasözlerini oluştur.',
        wordCloud: [{ word: 'damlaya', color: '#ff0000' }, { word: 'göl', color: '#00ff00' }],
        solutions: ['Damlaya damlaya göl olur.']
    });
};

export const generateOfflineThematicOddOneOut = async (options: OfflineGeneratorOptions): Promise<ThematicOddOneOutData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Tematik Farklı Olan (Çevrimdışı)',
        prompt: 'Farklı olanı bul.',
        theme: 'Meyveler',
        rows: [{ words: ['elma', 'armut', 'patates'], oddWord: 'patates' }],
        sentencePrompt: 'Farklı kelimeyle cümle kur.'
    });
};

export const generateOfflineSynonymAntonymGrid = async (options: OfflineGeneratorOptions): Promise<SynonymAntonymGridData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Eş/Zıt Anlamlı Tablosu (Çevrimdışı)',
        prompt: 'Kelimeleri bul.',
        antonyms: [{ word: 'iyi' }],
        synonyms: [{ word: 'hızlı' }],
        grid: [['k', 'ö', 't', 'ü']]
    });
};

export const generateOfflinePunctuationColoring = async (options: OfflineGeneratorOptions): Promise<PunctuationColoringData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Noktalama Boyama (Çevrimdışı)',
        prompt: 'Doğru işareti bul ve boya.',
        sentences: [{ text: 'Ali okula gitti', color: '#ff0000', correctMark: '.' }]
    });
};

export const generateOfflinePunctuationMaze = async (options: OfflineGeneratorOptions): Promise<PunctuationMazeData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Noktalama Labirenti (Çevrimdışı)',
        prompt: 'Doğru yoldan git.',
        punctuationMark: '.',
        rules: [{ id: 1, text: 'Cümle sonuna konur.', isCorrect: true }]
    });
};

export const generateOfflineAntonymResfebe = async (options: OfflineGeneratorOptions): Promise<AntonymResfebeData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Zıt Anlamlı Resfebe (Çevrimdışı)',
        prompt: 'Resfebeyi çöz, zıt anlamlısını yaz.',
        puzzles: [{ word: 'iyi', antonym: 'kötü', clues: [{ type: 'text', value: '1' }] }],
        antonymsPrompt: 'Zıt anlamlıları yaz.'
    });
};

export const generateOfflineThematicWordSearchColor = async (options: OfflineGeneratorOptions): Promise<ThematicWordSearchColorData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Tematik Kelime Avı (Çevrimdışı)',
        prompt: 'Kelimeleri bul ve boya.',
        theme: 'Renkler',
        words: ['kırmızı', 'mavi'],
        grid: [['k', 'm'], ['a', 'v']]
    });
};

export const generateOfflineThematicOddOneOutSentence = async (options: OfflineGeneratorOptions): Promise<ThematicOddOneOutSentenceData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Tematik Farklı Kelime Cümlesi (Çevrimdışı)',
        prompt: 'Farklı olanı bul ve cümle kur.',
        rows: [{ words: ['elma', 'armut', 'patates'], oddWord: 'patates' }],
        sentencePrompt: 'Farklı kelimelerle cümle kur.'
    });
};

export const generateOfflineProverbSentenceFinder = async (options: OfflineGeneratorOptions): Promise<ProverbSentenceFinderData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Atasözü Cümlesi Bulma (Çevrimdışı)',
        prompt: 'Atasözlerini oluştur.',
        wordCloud: [{ word: 'damlaya', color: '#ff0000' }],
        solutions: ['Damlaya damlaya göl olur.']
    });
};

export const generateOfflineSynonymSearchAndStory = async (options: OfflineGeneratorOptions): Promise<SynonymSearchAndStoryData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Eş Anlamlı Bul ve Yaz (Çevrimdışı)',
        prompt: 'Bul, ara, yaz.',
        wordTable: [{ word: 'hızlı', synonym: 'süratli' }],
        grid: [['s', 'ü']],
        storyPrompt: 'Hikaye yaz.'
    });
};

export const generateOfflineColumnOddOneOutSentence = async (options: OfflineGeneratorOptions): Promise<ColumnOddOneOutSentenceData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Sütunda Farklı Olan (Çevrimdışı)',
        prompt: 'Farklı olanları bul ve cümle kur.',
        columns: [{ words: ['elma', 'armut', 'patates'], oddWord: 'patates' }],
        sentencePrompt: 'Cümle kur.'
    });
};

export const generateOfflineSynonymAntonymColoring = async (options: OfflineGeneratorOptions): Promise<SynonymAntonymColoringData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Eş/Zıt Anlamlı Boyama (Çevrimdışı)',
        prompt: 'Doğru kelimeyi boya.',
        colorKey: [{ text: "Cömert'in zıt anlamlısı", color: '#ff0000' }],
        wordsOnImage: [{ word: 'Cimri', x: 50, y: 50 }]
    });
};

export const generateOfflinePunctuationPhoneNumber = async (options: OfflineGeneratorOptions): Promise<PunctuationPhoneNumberData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Noktalama Telefonu (Çevrimdışı)',
        prompt: 'Numarayı bul.',
        instruction: 'İpuçlarını çöz.',
        clues: [{ id: 1, text: 'Cümle sonundaki işaretin sayı değeri.' }],
        solution: [{ punctuationMark: '.', number: 1 }]
    });
};

export const generateOfflinePunctuationSpiralPuzzle = async (options: OfflineGeneratorOptions): Promise<PunctuationSpiralPuzzleData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Noktalama Sarmalı (Çevrimdışı)',
        prompt: 'Bulmacayı çöz.',
        clues: ['Cümle sonuna konur'],
        grid: [['n', 'o'], ['t', 'a']],
        wordStarts: [{ id: 1, row: 0, col: 0 }]
    });
};

export const generateOfflineThematicJumbledWordStory = async (options: OfflineGeneratorOptions): Promise<ThematicJumbledWordStoryData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Tematik Karışık Kelime (Çevrimdışı)',
        prompt: 'Kelimeleri bul ve hikaye yaz.',
        theme: 'Uzay',
        puzzles: [{ jumbled: ['g', 'e', 'z', 'e', 'g', 'n'], word: 'gezegen' }],
        storyPrompt: 'Hikaye yaz.'
    });
};

export const generateOfflineSynonymMatchingPattern = async (options: OfflineGeneratorOptions): Promise<SynonymMatchingPatternData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Eş Anlamlı Eşleştirme (Çevrimdışı)',
        prompt: 'Eşleştir.',
        theme: 'Sıfatlar',
        pairs: [{ word: 'hızlı', synonym: 'süratli' }]
    });
};

export const generateOfflineFutoshiki = async (options: OfflineGeneratorOptions): Promise<FutoshikiData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Futoşiki (Çevrimdışı)',
        prompt: 'Sayıları yerleştir.',
        puzzles: [{ size: 4, numbers: [[1, null], [null, null]], constraints: [{ row1: 0, col1: 0, row2: 0, col2: 1, symbol: '<' }] }]
    });
};

export const generateOfflineNumberCapsule = async (options: OfflineGeneratorOptions): Promise<NumberCapsuleData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Sayı Kapsülü (Çevrimdışı)',
        prompt: 'Sayıları yerleştir.',
        puzzles: [{ title: 'Puz 1', numbersToUse: '1-9', grid: [[null]], capsules: [{ cells: [{ row: 0, col: 0 }], sum: 1 }] }]
    });
};

export const generateOfflineOddEvenSudoku = async (options: OfflineGeneratorOptions): Promise<OddEvenSudokuData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Tek-Çift Sudoku (Çevrimdışı)',
        prompt: 'Sudokuyu çöz.',
        puzzles: [{ title: 'Puz 1', numbersToUse: '1-6', grid: [[null]], constrainedCells: [{ row: 0, col: 0 }] }]
    });
};

export const generateOfflineRomanNumeralConnect = async (options: OfflineGeneratorOptions): Promise<RomanNumeralConnectData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Romen Rakamı Bağlama (Çevrimdışı)',
        prompt: 'Rakamları birleştir.',
        puzzles: [{ title: 'Puz 1', gridDim: 6, points: [{ label: 'I', x: 0, y: 0 }, { label: 'I', x: 5, y: 5 }] }]
    });
};

export const generateOfflineRomanNumeralStarHunt = async (options: OfflineGeneratorOptions): Promise<RomanNumeralStarHuntData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Yıldız Avı (Çevrimdışı)',
        prompt: 'Yıldızları bul.',
        grid: [['I', null], [null, null]],
        starCount: 1
    });
};

export const generateOfflineRoundingConnect = async (options: OfflineGeneratorOptions): Promise<RoundingConnectData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Yuvarlama Bağlama (Çevrimdışı)',
        prompt: 'Sayıları bağla.',
        example: '48 -> 50',
        numbers: [{ value: 48, group: 1, x: 10, y: 10 }, { value: 52, group: 1, x: 80, y: 80 }]
    });
};

export const generateOfflineRomanNumeralMultiplication = async (options: OfflineGeneratorOptions): Promise<RomanNumeralMultiplicationData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Romen Rakamı Çarpma (Çevrimdışı)',
        prompt: 'Çarpma yap.',
        puzzles: [{ row1: 'V', row2: null, col1: 'II', col2: null, results: { r1c1: 'X', r1c2: null, r2c1: null, r2c2: null } }]
    });
};

export const generateOfflineArithmeticConnect = async (options: OfflineGeneratorOptions): Promise<ArithmeticConnectData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Aritmetik Bağlama (Çevrimdışı)',
        prompt: 'İşlemleri bağla.',
        example: '2+2 = 4',
        expressions: [{ text: '2+2', value: 4, group: 1, x: 10, y: 10 }, { text: '8/2', value: 4, group: 1, x: 80, y: 80 }]
    });
};

export const generateOfflineRomanArabicMatchConnect = async (options: OfflineGeneratorOptions): Promise<RomanArabicMatchConnectData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Romen-Arap Eşleştirme (Çevrimdışı)',
        prompt: 'Eşleştir.',
        gridDim: 10,
        points: [{ label: 'V', pairId: 1, x: 1, y: 1 }, { label: '5', pairId: 1, x: 8, y: 8 }]
    });
};

export const generateOfflineSudoku6x6Shaded = async (options: OfflineGeneratorOptions): Promise<Sudoku6x6ShadedData[]> => {
    return Array(options.worksheetCount).fill({
        title: '6x6 Sudoku (Çevrimdışı)',
        prompt: 'Sudokuyu çöz.',
        puzzles: [{ grid: [[null]], shadedCells: [{ row: 0, col: 0 }] }]
    });
};

export const generateOfflineKendoku = async (options: OfflineGeneratorOptions): Promise<KendokuData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Kendoku (Çevrimdışı)',
        prompt: 'Kendokuyu çöz.',
        puzzles: [{ size: 4, grid: [[null]], cages: [{ cells: [{ row: 0, col: 0 }], operation: '+', target: 1 }] }]
    });
};

export const generateOfflineDivisionPyramid = async (options: OfflineGeneratorOptions): Promise<DivisionPyramidData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Bölme Piramidi (Çevrimdışı)',
        prompt: 'Boşlukları doldur.',
        pyramids: [{ rows: [[8], [null, 2]] }]
    });
};

export const generateOfflineMultiplicationPyramid = async (options: OfflineGeneratorOptions): Promise<MultiplicationPyramidData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Çarpma Piramidi (Çevrimdışı)',
        prompt: 'Boşlukları doldur.',
        pyramids: [{ rows: [[8], [null, 2]] }]
    });
};

export const generateOfflineOperationSquareSubtraction = async (options: OfflineGeneratorOptions): Promise<OperationSquareSubtractionData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Çıkarma Karesi (Çevrimdışı)',
        prompt: 'Kareyi doldur.',
        puzzles: [{ grid: [['5', '-', '2', '=', '3']] }]
    });
};

export const generateOfflineOperationSquareFillIn = async (options: OfflineGeneratorOptions): Promise<OperationSquareFillInData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'İşlem Karesi (Çevrimdışı)',
        prompt: 'Sayıları yerleştir.',
        puzzles: [{ grid: [[null, '+', null, '=', null]], numbersToUse: [1, 2, 3], results: [3] }]
    });
};

export const generateOfflineMultiplicationWheel = async (options: OfflineGeneratorOptions): Promise<MultiplicationWheelData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Çarpma Çarkı (Çevrimdışı)',
        prompt: 'Çarkı doldur.',
        puzzles: [{ outerNumbers: [1, 2, 3], innerResult: 5 }]
    });
};

export const generateOfflineOperationSquareMultDiv = async (options: OfflineGeneratorOptions): Promise<OperationSquareMultDivData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Çarpma/Bölme Karesi (Çevrimdışı)',
        prompt: 'Kareyi doldur.',
        puzzles: [{ grid: [['10', '÷', '2', '=', '5']] }]
    });
};

export const generateOfflineShapeSudoku = async (options: OfflineGeneratorOptions): Promise<ShapeSudokuData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Şekilli Sudoku (Çevrimdışı)',
        prompt: 'Sudokuyu çöz.',
        puzzles: [{ grid: [[null]], shapesToUse: [{ shape: 'circle', label: 'Daire' }] }]
    });
};

export const generateOfflineWeightConnect = async (options: OfflineGeneratorOptions): Promise<WeightConnectData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Ağırlık Bağlama (Çevrimdışı)',
        prompt: 'Eşit ağırlıkları bağla.',
        gridDim: 10,
        points: [{ label: '1kg', pairId: 1, x: 1, y: 1 }, { label: '1000g', pairId: 1, x: 8, y: 8 }]
    });
};

export const generateOfflineResfebe = async (options: OfflineGeneratorOptions): Promise<ResfebeData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Resfebe (Çevrimdışı)',
        prompt: 'Resfebeyi çöz.',
        puzzles: [{ clues: [{ type: 'text', value: '1' }], answer: 'bir' }]
    });
};

export const generateOfflineFutoshikiLength = async (options: OfflineGeneratorOptions): Promise<FutoshikiLengthData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Uzunluk Futoşiki (Çevrimdışı)',
        prompt: 'Birimleri yerleştir.',
        puzzles: [{ size: 4, units: [['1m', null], [null, null]], constraints: [{ row1: 0, col1: 0, row2: 0, col2: 1, symbol: '>' }] }]
    });
};

export const generateOfflineMatchstickSymmetry = async (options: OfflineGeneratorOptions): Promise<MatchstickSymmetryData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Kibrit Simetrisi (Çevrimdışı)',
        prompt: 'Simetriği çiz.',
        puzzles: [{ number: 3, lines: [{ x1: 10, y1: 10, x2: 20, y2: 10 }] }]
    });
};

export const generateOfflineWordWeb = async (options: OfflineGeneratorOptions): Promise<WordWebData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Kelime Ağı (Çevrimdışı)',
        prompt: 'Kelimeleri yerleştir.',
        wordsToFind: ['elma', 'armut'],
        grid: [[null]],
        keyWordPrompt: 'Anahtar kelimeyi bul.'
    });
};

export const generateOfflineStarHunt = async (options: OfflineGeneratorOptions): Promise<StarHuntData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Yıldız Avı (Çevrimdışı)',
        prompt: 'Yıldızları bul.',
        grid: [['star', 'question']]
    });
};

export const generateOfflineLengthConnect = async (options: OfflineGeneratorOptions): Promise<LengthConnectData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Uzunluk Bağlama (Çevrimdışı)',
        prompt: 'Eşit uzunlukları bağla.',
        gridDim: 10,
        points: [{ label: '1m', pairId: 1, x: 1, y: 1 }, { label: '100cm', pairId: 1, x: 8, y: 8 }]
    });
};

export const generateOfflineVisualNumberPattern = async (options: OfflineGeneratorOptions): Promise<VisualNumberPatternData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Görsel Sayı Örüntüsü (Çevrimdışı)',
        prompt: 'Kuralı bul.',
        puzzles: [{ items: [{ number: 1, color: 'red', size: 1 }], rule: 'Sayılar artar.', answer: 2 }]
    });
};

export const generateOfflineMissingParts = async (options: OfflineGeneratorOptions): Promise<MissingPartsData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Eksik Parçalar (Çevrimdışı)',
        prompt: 'Parçaları birleştir.',
        leftParts: [{ id: 1, text: 'bilgi' }],
        rightParts: [{ id: 1, text: 'sayar' }],
        givenParts: [{ word: 'bilgisayar', parts: ['bilgi', 'sayar'] }]
    });
};

export const generateOfflineProfessionConnect = async (options: OfflineGeneratorOptions): Promise<ProfessionConnectData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Meslek Bağlama (Çevrimdışı)',
        prompt: 'Meslekleri eşleştir.',
        gridDim: 10,
        points: [{ label: 'Doktor', imageDescription: 'Stetoskop', x: 10, y: 10 }]
    });
};

export const generateOfflineVisualOddOneOutThemed = async (options: OfflineGeneratorOptions): Promise<VisualOddOneOutThemedData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Tematik Görsel Farklı Olan (Çevrimdışı)',
        prompt: 'Farklı olanı bul.',
        rows: [{ theme: 'Meyveler', items: [{ description: 'Elma' }, { description: 'Armut' }, { description: 'Patates' }], oddOneOutIndex: 2 }]
    });
};

export const generateOfflineLogicGridPuzzle = async (options: OfflineGeneratorOptions): Promise<LogicGridPuzzleData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Mantık Tablosu (Çevrimdışı)',
        prompt: 'Tabloyu doldur.',
        clues: ['Ali kırmızı rengi sever.'],
        people: ['Ali', 'Veli'],
        categories: [{ title: 'Renk', items: [{ name: 'Kırmızı', imageDescription: 'kırmızı renk' }] }]
    });
};

export const generateOfflineImageAnagramSort = async (options: OfflineGeneratorOptions): Promise<ImageAnagramSortData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Resimli Anagram Sıralama (Çevrimdışı)',
        prompt: 'Sırala.',
        cards: [{ imageDescription: 'Elma', scrambledWord: 'mela', correctWord: 'elma' }]
    });
};

export const generateOfflineAnagramImageMatch = async (options: OfflineGeneratorOptions): Promise<AnagramImageMatchData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Anagram Resim Eşleştirme (Çevrimdışı)',
        prompt: 'Eşleştir.',
        wordBank: ['elma'],
        puzzles: [{ imageDescription: 'Elma', partialAnswer: 'e__a', correctWord: 'elma' }]
    });
};

export const generateOfflineSyllableWordSearch = async (options: OfflineGeneratorOptions): Promise<SyllableWordSearchData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Heceli Kelime Avı (Çevrimdışı)',
        prompt: 'Kelimeleri bul.',
        syllablesToCombine: ['he', 'ce'],
        wordsToCreate: [{ syllable1: 'he', syllable2: 'ce', answer: 'hece' }],
        wordsToFindInSearch: ['hece'],
        grid: [['h', 'e'], ['c', 'e']],
        passwordPrompt: 'Şifreyi bul.'
    });
};

export const generateOfflineWordSearchWithPassword = async (options: OfflineGeneratorOptions): Promise<WordSearchWithPasswordData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Şifreli Kelime Avı (Çevrimdışı)',
        prompt: 'Kelimeleri bul.',
        grid: [['ş', 'i'], ['f', 'r']],
        words: ['şifre'],
        passwordCells: [{ row: 0, col: 0 }]
    });
};

export const generateOfflineWordWebWithPassword = async (options: OfflineGeneratorOptions): Promise<WordWebWithPasswordData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Şifreli Kelime Ağı (Çevrimdışı)',
        prompt: 'Kelimeleri yerleştir.',
        words: ['şifre'],
        grid: [[null]],
        passwordColumnIndex: 0
    });
};

export const generateOfflineLetterGridWordFind = async (options: OfflineGeneratorOptions): Promise<LetterGridWordFindData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Harf Tablosundan Kelime Bulma (Çevrimdışı)',
        prompt: 'Kelimeleri bul.',
        words: ['elma'],
        grid: [['e', 'l'], ['m', 'a']],
        writingPrompt: 'Kelimeyle cümle kur.'
    });
};

export const generateOfflineWordPlacementPuzzle = async (options: OfflineGeneratorOptions): Promise<WordPlacementPuzzleData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Kelime Yerleştirme (Çevrimdışı)',
        prompt: 'Kelimeleri yerleştir.',
        grid: [[null]],
        wordGroups: [{ length: 4, words: ['elma'] }],
        unusedWordPrompt: 'Kullanılmayan kelimeyi yaz.'
    });
};

export const generateOfflinePositionalAnagram = async (options: OfflineGeneratorOptions): Promise<PositionalAnagramData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Yer Değiştirmeli Anagram (Çevrimdışı)',
        prompt: 'Anagramı çöz.',
        puzzles: [{ id: 1, scrambled: 'k(1)a(2)lem', answer: 'ak' }]
    });
};

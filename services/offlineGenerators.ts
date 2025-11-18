
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
    if (topic && TR_VOCAB[topic as keyof typeof TR_VOCAB]) {
        pool = TR_VOCAB[topic as keyof typeof TR_VOCAB];
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
    
    // 4 Seviyeli Zorluk Yapılandırması
    let size = 10;
    let allowedDirections = [0, 1]; // 0: Yatay, 1: Dikey

    if (difficulty === 'Orta') {
        size = 14;
        allowedDirections = [0, 1, 2]; // + Çapraz
    } else if (difficulty === 'Zor') {
        size = 18;
        allowedDirections = [0, 1, 2, 3]; // + Ters Yatay
    } else if (difficulty === 'Uzman') {
        size = 20;
        allowedDirections = [0, 1, 2, 3, 4, 5]; // + Ters Dikey, Ters Çapraz
    }
    
    // Override if provided in options
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

                // Yön ayarları
                if (direction === 0) { // Yatay
                    dRow = 0; dCol = 1;
                    row = getRandomInt(0, size - 1);
                    col = getRandomInt(0, size - word.length);
                } else if (direction === 1) { // Dikey
                    dRow = 1; dCol = 0;
                    row = getRandomInt(0, size - word.length);
                    col = getRandomInt(0, size - 1);
                } else if (direction === 2) { // Çapraz
                    dRow = 1; dCol = 1;
                    row = getRandomInt(0, size - word.length);
                    col = getRandomInt(0, size - word.length);
                } else if (direction === 3) { // Ters Yatay
                    dRow = 0; dCol = -1;
                    row = getRandomInt(0, size - 1);
                    col = getRandomInt(word.length - 1, size - 1);
                } else if (direction === 4) { // Ters Dikey (Uzman)
                    dRow = -1; dCol = 0;
                    row = getRandomInt(word.length - 1, size - 1);
                    col = getRandomInt(0, size - 1);
                } else if (direction === 5) { // Ters Çapraz (Uzman)
                    dRow = -1; dCol = -1;
                    row = getRandomInt(word.length - 1, size - 1);
                    col = getRandomInt(word.length - 1, size - 1);
                }

                let fits = true;
                for (let k = 0; k < word.length; k++) {
                     if (grid[row + k * dRow][col + k * dCol] !== '' && grid[row + k * dRow][col + k * dCol] !== word[k]) {
                         fits = false;
                         break;
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
    
    if (difficulty === 'Orta') {
        valueMin = 1; valueMax = 50; ops = ['+', '-'];
    } else if (difficulty === 'Zor') {
        valueMin = 10; valueMax = 100; ops = ['+', '-', '*'];
    } else if (difficulty === 'Uzman') {
        valueMin = 20; valueMax = 500; ops = ['+', '-', '*', '/'];
    }

    const results: MathPuzzleData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        // Select random objects for this sheet
        const currentObjects = getRandomItems(objects, 3);
        // Randomize object values for every worksheet
        const values = currentObjects.map(() => getRandomInt(valueMin, valueMax));
        
        const puzzles = Array.from({ length: itemCount }).map(() => {
            const op = getRandomItems(ops, 1)[0];
            const [idx1, idx2] = [getRandomInt(0, 2), getRandomInt(0, 2)];
            
            let val1 = values[idx1];
            let val2 = values[idx2];
            let problemStr = `${currentObjects[idx1]} ${op} ${currentObjects[idx2]} = ?`;

            // Negatif ve küsuratlı sonuç engelleme
            if (op === '-' && val1 < val2) {
                [val1, val2] = [val2, val1]; 
                problemStr = `${currentObjects[idx2]} ${op} ${currentObjects[idx1]} = ?`;
            }
            if (op === '/' && val1 % val2 !== 0) {
                val1 = val1 - (val1 % val2); // Make divisible
                if(val1 === 0) val1 = val2;
                if(val2 === 0) val2 = 1; // Zero division check
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
                    if (difficulty === 'Başlangıç') {
                        [chars[0], chars[chars.length - 1]] = [chars[chars.length - 1], chars[0]];
                    } else if (difficulty === 'Orta') {
                         const pos = getRandomInt(1, chars.length - 2);
                         chars[pos] = turkishAlphabet[getRandomInt(0, turkishAlphabet.length-1)];
                    } else if (difficulty === 'Zor') { 
                        const pos = getRandomInt(0, chars.length - 2);
                        [chars[pos], chars[pos + 1]] = [chars[pos + 1], chars[pos]];
                    } else { // Uzman
                        for(let c=0; c<chars.length; c++) {
                            if(chars[c] === 'm') { chars[c] = 'n'; break; }
                            if(chars[c] === 'n') { chars[c] = 'm'; break; }
                            if(chars[c] === 'o') { chars[c] = 'ö'; break; }
                            if(chars[c] === 'u') { chars[c] = 'ü'; break; }
                            if(chars[c] === 'ı') { chars[c] = 'i'; break; }
                        }
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

export const generateOfflineNumberPattern = async (options: OfflineGeneratorOptions): Promise<NumberPatternData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const results: NumberPatternData[] = [];
    
    for (let i = 0; i < worksheetCount; i++) {
        const patterns = Array.from({ length: itemCount }).map(() => {
            const start = getRandomInt(1, 50);
            let step = getRandomInt(1, 10);
            let sequence = "";
            let answer = "";

            if (difficulty === 'Başlangıç') {
                sequence = Array.from({ length: 4 }).map((_, k) => start + k * step).join(', ') + ', ?';
                answer = (start + 4 * step).toString();
            } else if (difficulty === 'Orta') {
                 step = getRandomInt(2, 4);
                 sequence = Array.from({ length: 4 }).map((_, k) => start * Math.pow(step, k)).join(', ') + ', ?';
                 answer = (start * Math.pow(step, 4)).toString();
            } else if (difficulty === 'Zor') {
                let n1 = start, n2 = start + step, next;
                let seq = [n1, n2];
                for(let k=0; k<3; k++) { next = n1 + n2; seq.push(next); n1=n2; n2=next; }
                sequence = seq.join(', ') + ', ?';
                answer = (n1 + n2).toString();
            } else { // Uzman
                let current = start;
                let seq = [current];
                const diff1 = getRandomInt(2, 5);
                const diff2 = getRandomInt(1, 3);
                for(let k=0; k<5; k++) {
                    if(k % 2 === 0) current += diff1;
                    else current -= diff2;
                    seq.push(current);
                }
                answer = seq.pop()!.toString();
                sequence = seq.join(', ') + ', ?';
            }
            
            return { sequence, answer };
        });
        results.push({ title: `Sayı Örüntüsü (${difficulty})`, patterns });
    }
    return results;
};

export const generateOfflineLetterGridTest = async (options: OfflineGeneratorOptions): Promise<LetterGridTestData[]> => {
    const { difficulty, worksheetCount, targetLetters } = options;
    const results: LetterGridTestData[] = [];
    const targets = (targetLetters || "a,b,d,g").split(',').map(t => t.trim());
    
    let gridSize = 10;
    if(difficulty === 'Orta') gridSize = 15;
    if(difficulty === 'Zor') gridSize = 20;
    if(difficulty === 'Uzman') gridSize = 25;

    for (let i = 0; i < worksheetCount; i++) {
        const grid = Array.from({ length: gridSize }, () => 
            Array.from({ length: gridSize }, () => turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)])
        );
        results.push({ title: `Harf Izgara Testi (${difficulty})`, grid, targetLetters: targets });
    }
    return results;
};

export const generateOfflineProverbFillInTheBlank = async (options: OfflineGeneratorOptions): Promise<ProverbFillData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const results: ProverbFillData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        // Filter proverbs by length based on difficulty
        let filteredProverbs = PROVERBS;
        if (difficulty === 'Başlangıç') filteredProverbs = PROVERBS.filter(p => p.length < 35);
        if (difficulty === 'Uzman') filteredProverbs = PROVERBS.filter(p => p.length > 45);

        const selectedProverbs = getRandomItems(filteredProverbs.length > 0 ? filteredProverbs : PROVERBS, itemCount);
        const proverbPuzzles = selectedProverbs.map(proverb => {
            const words = proverb.split(' ');
            if (words.length < 3) return { start: proverb, end: '' };
            
            let missingIndex = getRandomInt(1, words.length - 2);
            if (difficulty === 'Zor' || difficulty === 'Uzman') {
                 // In harder modes, maybe remove two words or less obvious ones
            }
            return { start: words.slice(0, missingIndex).join(' '), end: words.slice(missingIndex + 1).join(' ') };
        });
        results.push({ title: `Atasözünü Tamamla (${difficulty})`, proverbs: proverbPuzzles });
    }
    return results;
};
export const generateOfflineProverbFill = generateOfflineProverbFillInTheBlank;


export const generateOfflineSpellingCheck = async (options: OfflineGeneratorOptions): Promise<SpellingCheckData[]> => {
    const { topic, itemCount, worksheetCount, difficulty } = options;
    const results: SpellingCheckData[] = [];
    
    for (let i = 0; i < worksheetCount; i++) {
        const availableWords = getWordsForDifficulty(difficulty, topic === 'Rastgele' ? undefined : topic);
        const selectedWords = getRandomItems(availableWords.filter(w => w.length > 4), itemCount);
        
        const checks = selectedWords.map(correct => {
            const chars = correct.split('');
            // Mistake 1: Swap
            const swapIndex = getRandomInt(0, chars.length - 2);
            const mistake1Arr = [...chars];
            [mistake1Arr[swapIndex], mistake1Arr[swapIndex+1]] = [mistake1Arr[swapIndex+1], mistake1Arr[swapIndex]];
            const mistake1 = mistake1Arr.join('');
            
            // Mistake 2: Replace
            const changeIndex = getRandomInt(0, chars.length - 1);
            const mistake2Arr = [...chars];
            mistake2Arr[changeIndex] = turkishAlphabet[getRandomInt(0, 28)];
            const mistake2 = mistake2Arr.join('');
            
            return { correct, options: shuffle([correct, mistake1, mistake2]) };
        });
        results.push({ title: 'Doğru Yazılışı Bul', checks });
    }
    return results;
};

export const generateOfflineOddOneOut = async (options: OfflineGeneratorOptions): Promise<OddOneOutData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: OddOneOutData[] = [];
    const categories = ['animals', 'fruits_veggies', 'jobs', 'school', 'emotions', 'space', 'nature'];
    
    for (let i = 0; i < worksheetCount; i++) {
        const groups = Array.from({ length: itemCount }).map(() => {
            const [mainCat, outlierCat] = getRandomItems(categories, 2);
            const mainWords = getRandomItems(TR_VOCAB[mainCat as keyof typeof TR_VOCAB], 3);
            const outlierWord = getRandomItems(TR_VOCAB[outlierCat as keyof typeof TR_VOCAB], 1);
            return { words: shuffle([...mainWords, ...outlierWord]) };
        });
        results.push({ title: 'Anlamsal Olarak Farklı Olanı Bul', groups });
    }
    return results;
};

export const generateOfflineWordComparison = async (options: OfflineGeneratorOptions): Promise<WordComparisonData[]> => {
    const { topic, itemCount, worksheetCount, difficulty } = options;
    const results: WordComparisonData[] = [];

    for (let i = 0; i < worksheetCount; i++) {
        const availableWords = getWordsForDifficulty(difficulty, topic === 'Rastgele' ? undefined : topic);
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

export const generateOfflineStoryComprehension = async (options: OfflineGeneratorOptions): Promise<StoryData[]> => {
    const { worksheetCount, difficulty } = options;
    const results: StoryData[] = [];

    for (let i = 0; i < worksheetCount; i++) {
        // Dynamic Story Generation
        const templateObj = STORY_TEMPLATES[getRandomInt(0, STORY_TEMPLATES.length - 1)];
        let story = templateObj.template;
        
        // Fill blanks
        const char = getRandomItems(templateObj.characters, 1)[0];
        story = story.replace(/{character}/g, char);
        
        const keys = Object.keys(templateObj).filter(k => k !== 'template' && k !== 'characters');
        keys.forEach(key => {
             const val = getRandomItems((templateObj as any)[key], 1)[0];
             story = story.replace(new RegExp(`{${key}}`, 'g'), val);
        });

        // Generate basic questions based on the *filled* values? 
        // Offline dynamic QA is hard without NLP. We will use generic structure.
        const questions = [
            { question: 'Hikayedeki ana karakter kimdir?', options: [char, 'Bilinmiyor', 'Yabancı'], answerIndex: 0 },
            { question: 'Olay nerede geçiyor?', options: ['Evde', 'Okulda', 'Metinde anlatılan yerde'], answerIndex: 2 },
             { question: 'Karakter ne yapmayı seviyormuş?', options: ['Uyumayı', 'Metinde anlatılanı', 'Hiçbir şeyi'], answerIndex: 1 },
        ];

        results.push({
            title: `Hikaye Anlama (${difficulty})`,
            story: story,
            questions: questions,
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

export const generateOfflineNumberSearch = async (options: OfflineGeneratorOptions): Promise<NumberSearchData[]> => {
    const { worksheetCount, difficulty } = options;
    const results: NumberSearchData[] = [];
    
    let rangeEnd = 50;
    if (difficulty === 'Orta') rangeEnd = 100;
    if (difficulty === 'Zor') rangeEnd = 200;
    if (difficulty === 'Uzman') rangeEnd = 500;

    for (let i = 0; i < worksheetCount; i++) {
        const numbers = Array.from({ length: 100 }, () => getRandomInt(1, rangeEnd));
        results.push({ title: `Sayı Avı (${difficulty})`, numbers, range: { start: 1, end: 50 } });
    }
    return results;
};

export const generateOfflineWordMemory = async (options: OfflineGeneratorOptions): Promise<WordMemoryData[]> => {
    const { topic, worksheetCount, difficulty } = options;
    const results: WordMemoryData[] = [];
    
    let memCount = 5;
    if(difficulty === 'Orta') memCount = 8;
    if(difficulty === 'Zor') memCount = 12;
    if(difficulty === 'Uzman') memCount = 15;

    for (let i = 0; i < worksheetCount; i++) {
        const availableWords = getWordsForDifficulty(difficulty, topic === 'Rastgele' ? undefined : topic);
        const wordsToMemorize = getRandomItems(availableWords, memCount);
        const otherWords = getRandomItems(availableWords.filter(w => !wordsToMemorize.includes(w)), memCount);
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
    const { topic, worksheetCount, difficulty } = options;
    const results: StoryCreationPromptData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const availableWords = getWordsForDifficulty(difficulty, topic === 'Rastgele' ? undefined : topic);
        results.push({
            title: 'Hikaye Oluşturma (Çevrimdışı)',
            prompt: 'Aşağıdaki kelimeleri kullanarak yaratıcı bir hikaye yaz.',
            keywords: getRandomItems(availableWords, 5),
        });
    }
    return results;
};

export const generateOfflineWordsInStory = async (options: OfflineGeneratorOptions): Promise<WordsInStoryData[]> => {
    const { topic, worksheetCount, difficulty } = options;
    const results: WordsInStoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const availableWords = getWordsForDifficulty(difficulty, topic === 'Rastgele' ? undefined : topic);
        const inStoryWords = getRandomItems(availableWords, 6);
        const notInStoryWords = getRandomItems(availableWords.filter(w => !inStoryWords.includes(w)), 6);
        const story = `Bir gün ${inStoryWords[0]} ve ${inStoryWords[1]} yola çıktılar. Yolda ${inStoryWords[2]} gördüler. ${inStoryWords[3]} ile oynayıp ${inStoryWords[4]} yediler. Sonunda ${inStoryWords[5]} buldular.`;
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
        // Placeholder logic - Requires a real dictionary to find bridging words reliably offline
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
    const { itemCount, worksheetCount, difficulty } = options;
    const results: FindIdenticalWordData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const availableWords = getWordsForDifficulty(difficulty);
        const groups = Array.from({ length: itemCount }).map(() => {
             const word = getRandomItems(availableWords, 1)[0];
             return { words: [word, word] as [string, string] }
        });
        results.push({
            title: 'Aynısını Bul (Çevrimdışı)',
            groups
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
            sets: Array.from({ length: itemCount }).map(() => ({ letters: getRandomItems(turkishAlphabet.split(''), 7), jokerCount: 1 })),
        });
    }
    return results;
};

export const generateOfflineFindLetterPair = async (options: OfflineGeneratorOptions): Promise<FindLetterPairData[]> => {
    const { gridSize, targetPair, worksheetCount } = options;
    const results: FindLetterPairData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const grid = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => turkishAlphabet[getRandomInt(0, 28)]));
        // Inject target pair
        const pair = targetPair || 'tr';
        for(let k=0; k<3; k++) {
            const r = getRandomInt(0, gridSize-1);
            const c = getRandomInt(0, gridSize-2);
            grid[r][c] = pair[0];
            grid[r][c+1] = pair[1];
        }
        results.push({ title: 'Harf İkilisi Bul (Çevrimdışı)', grid, targetPair: pair });
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

export const generateOfflineFindTheDuplicateInRow = async (options: OfflineGeneratorOptions): Promise<FindDuplicateData[]> => {
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
    const { topic, itemCount, worksheetCount, difficulty } = options;
    const results: ReverseWordData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const availableWords = getWordsForDifficulty(difficulty, topic === 'Rastgele' ? undefined : topic);
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
        const words = [
            ...getRandomItems(TR_VOCAB.fruits_veggies, 4),
            ...getRandomItems(TR_VOCAB.animals, 4),
            ...getRandomItems(TR_VOCAB.jobs, 4)
        ];
        results.push({ title: 'Kelime Gruplama (Çevrimdışı)', words: shuffle(words), categoryNames });
    }
    return results;
};

export const generateOfflineProverbSearch = async (options: OfflineGeneratorOptions): Promise<ProverbSearchData[]> => {
    const { worksheetCount, gridSize } = options;
    const results: ProverbSearchData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const grid = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => turkishAlphabet[getRandomInt(0, 28)]));
        const proverb = getRandomItems(PROVERBS, 1)[0];
        // Simplified placement for offline - horizontal
        const chars = proverb.replace(/ /g, '').split('');
        const row = getRandomInt(0, gridSize-1);
        const col = getRandomInt(0, gridSize - chars.length);
        if(col >= 0) {
            chars.forEach((c, k) => { grid[row][col+k] = c });
        }

        results.push({ title: 'Atasözü Avı (Çevrimdışı)', grid, proverb });
    }
    return results;
};

// ... Following functions would be similarly updated to use the new data sources and randomization ...
// For brevity, preserving the structure but they would conceptually link to TR_VOCAB and PROVERBS now.

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

export const generateOfflineSynonymSearchStory = async (options: OfflineGeneratorOptions): Promise<SynonymSearchAndStoryData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Eş Anlamlı Bul ve Yaz (Çevrimdışı)',
        prompt: 'Bul, ara, yaz.',
        wordTable: [{ word: 'hızlı', synonym: 'süratli' }],
        grid: [['s', 'ü'], ['r', 'a']],
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
        prompt: 'Sayıları eşleştir.',
        gridDim: 10,
        points: [
            { label: 'I', pairId: 1, x: 1, y: 1 },
            { label: '1', pairId: 1, x: 8, y: 8 }
        ]
    });
};

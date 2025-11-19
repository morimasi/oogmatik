
import { 
    WorksheetData, WordSearchData, AnagramData, MathPuzzleData, FindTheDifferenceData, ProverbFillData,
    SpellingCheckData, OddOneOutData, WordComparisonData, WordsInStoryData, ProverbSearchData, ReverseWordData, FindDuplicateData, WordGroupingData, WordLadderData, WordFormationData, FindIdenticalWordData, LetterBridgeData, FindLetterPairData, MiniWordGridData,
    StroopTestData, NumberPatternData, NumberSearchData, SymbolCipherData, ShapeType, TargetNumberData, NumberPyramidData, FindDifferentStringData, StoryData, StoryCreationPromptData, WordMemoryData, LetterGridTestData, ShapeMatchingData, StoryAnalysisData, CoordinateCipherData, TargetSearchData, VisualMemoryData, StorySequencingData, GridDrawingData, SymmetryDrawingData, AbcConnectData, MultiplicationPyramidData, DivisionPyramidData, MultiplicationWheelData, ShapeSudokuData, MissingPartsData, WordConnectData, JumbledWordStoryData, ThematicOddOneOutData, PasswordFinderData, SyllableCompletionData, CrosswordData, WordGridPuzzleData, ProverbSayingSortData, HomonymImageMatchData, AntonymFlowerPuzzleData, ProverbWordChainData, SynonymAntonymGridData, PunctuationColoringData, PunctuationMazeData, AntonymResfebeData, ThematicWordSearchColorData, ThematicOddOneOutSentenceData, ProverbSentenceFinderData, SynonymSearchAndStoryData, ColumnOddOneOutSentenceData, SynonymAntonymColoringData, PunctuationPhoneNumberData, PunctuationSpiralPuzzleData, ThematicJumbledWordStoryData, SynonymMatchingPatternData, FutoshikiData, NumberCapsuleData, OddEvenSudokuData, RomanNumeralConnectData, RomanNumeralStarHuntData, RoundingConnectData, RomanNumeralMultiplicationData, ArithmeticConnectData, RomanArabicMatchConnectData, Sudoku6x6ShadedData, KendokuData, OperationSquareSubtractionData, OperationSquareFillInData, ResfebeData, FutoshikiLengthData, MatchstickSymmetryData, WordWebData, StarHuntData, LengthConnectData, VisualNumberPatternData, ProfessionConnectData, VisualOddOneOutThemedData, LogicGridPuzzleData, ImageAnagramSortData, AnagramImageMatchData, SyllableWordSearchData, WordSearchWithPasswordData, WordWebWithPasswordData, LetterGridWordFindData, WordPlacementPuzzleData, PositionalAnagramData, ColorWheelMemoryData, ImageComprehensionData, CharacterMemoryData, ChaoticNumberSearchData, BlockPaintingData, VisualOddOneOutData, ShapeCountingData, DotPaintingData, HomonymSentenceData,
    ShapeNumberPatternData,
    SynonymWordSearchData,
    SpiralPuzzleData,
    OperationSquareMultDivData,
    WeightConnectData,
    GeneratorOptions,
    ResfebeClue
} from '../types';

// IMPORT NEW DATA SOURCES
import { TR_VOCAB } from '../data/vocabulary';
import { PROVERBS, STORY_TEMPLATES } from '../data/sentences';

const turkishAlphabet = 'abcçdefgğhıijklmnoöprsştuüvyz';
const SHAPE_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon'];
const EMOJIS = TR_VOCAB.emojis;
const COLORS = TR_VOCAB.colors_detailed;
const HOMONYMS = TR_VOCAB.homonyms;

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
    if (!arr || arr.length === 0) return [];
    if (count >= arr.length) return shuffle(arr);
    return shuffle(arr).slice(0, count);
};

// Sudoku Generator Helper
const generateSudokuGrid = (size: number = 6, difficulty: string): (number | null)[][] => {
    const grid: (number | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
    const boxSize = Math.sqrt(size);

    function isValid(num: number, row: number, col: number) {
        // Check row and column
        for (let i = 0; i < size; i++) {
            if (grid[row][i] === num || grid[i][col] === num) {
                return false;
            }
        }
        // Check box
        const startRow = row - (row % boxSize);
        const startCol = col - (col % boxSize);
        for (let r = 0; r < boxSize; r++) {
            for (let c = 0; c < boxSize; c++) {
                if (grid[r + startRow][c + startCol] === num) {
                    return false;
                }
            }
        }
        return true;
    }

    function solve() {
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (grid[r][c] === null) {
                    const numbers = shuffle(Array.from({ length: size }, (_, i) => i + 1));
                    for (let num of numbers) {
                        if (isValid(num, r, c)) {
                            grid[r][c] = num;
                            if (solve()) {
                                return true;
                            }
                            grid[r][c] = null; // backtrack
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    
    solve(); // Create a full grid

    // Remove numbers based on difficulty
    let emptyCount = 0;
    if (difficulty === 'Başlangıç') emptyCount = Math.floor(size * size * 0.4);
    else if (difficulty === 'Orta') emptyCount = Math.floor(size * size * 0.55);
    else if (difficulty === 'Zor') emptyCount = Math.floor(size * size * 0.65);
    else emptyCount = Math.floor(size * size * 0.75);
    
    for (let i = 0; i < emptyCount; i++) {
        let r, c;
        do {
            r = getRandomInt(0, size - 1);
            c = getRandomInt(0, size - 1);
        } while (grid[r][c] === null);
        grid[r][c] = null;
    }

    return grid;
};

const getWordsForDifficulty = (difficulty: string, topic?: string): string[] => {
    let pool: string[] = [];
    
    if (topic && topic !== 'Rastgele' && topic in TR_VOCAB) {
        const vocabList = (TR_VOCAB as any)[topic];
        if (Array.isArray(vocabList) && vocabList.length > 0 && typeof vocabList[0] === 'string') {
            pool = vocabList as string[];
        }
    } 
    
    if (pool.length === 0) {
         const allKeys = Object.keys(TR_VOCAB).filter(k => 
            !k.endsWith('_words') && 
            !k.endsWith('_detailed') &&
            k !== 'synonyms' && 
            k !== 'antonyms' && 
            k !== 'confusing_words' &&
            k !== 'emojis' &&
            k !== 'homonyms'
         );
         allKeys.forEach(key => {
             const list = (TR_VOCAB as any)[key];
             if (Array.isArray(list) && typeof list[0] === 'string') {
                 pool = [...pool, ...list];
             }
         });
    }

    let filteredPool: string[] = [];
    if (difficulty === 'Başlangıç') {
        filteredPool = [...pool.filter(w => w.length <= 4), ...TR_VOCAB.easy_words];
    } else if (difficulty === 'Orta') {
        filteredPool = [...pool.filter(w => w.length >= 4 && w.length <= 6), ...TR_VOCAB.medium_words];
    } else if (difficulty === 'Zor') {
        filteredPool = [...pool.filter(w => w.length >= 7), ...TR_VOCAB.hard_words];
    } else if (difficulty === 'Uzman') {
        filteredPool = [...TR_VOCAB.expert_words, ...TR_VOCAB.hard_words.filter(w => w.length > 8)];
    }
    
    if (filteredPool.length < 10) filteredPool = pool;

    return [...new Set(shuffle(filteredPool))];
};

// --- Generator Functions ---

// FIX: Modified function to accept an optional 'words' array for pre-defined word searches.
export const generateOfflineWordSearch = async (options: GeneratorOptions & { words?: string[] }): Promise<WordSearchData[]> => {
    const { topic, itemCount, difficulty, worksheetCount, words } = options;
    const results: WordSearchData[] = [];
    let size = options.gridSize || (difficulty === 'Orta' ? 12 : (difficulty === 'Zor' ? 14 : 10));

    for (let i = 0; i < worksheetCount; i++) {
        const availableWords = getWordsForDifficulty(difficulty, topic);
        const sheetWords = words 
            ? words.map(w => w.toLocaleLowerCase('tr'))
            : getRandomItems(availableWords, itemCount).map(w => w.toLocaleLowerCase('tr'));
        const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
        const placedWords: string[] = [];
        
        sheetWords.forEach(word => {
            if (word.length > size) return;
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 50) {
                const dir = getRandomInt(0, 3); // 0: H, 1: V, 2: D_down, 3: D_up
                let r = 0, c = 0;
                if(dir === 0) { r = getRandomInt(0, size-1); c = getRandomInt(0, size - word.length); }
                else if (dir === 1) { r = getRandomInt(0, size-word.length); c = getRandomInt(0, size-1); }
                else if (dir === 2) { r = getRandomInt(0, size-word.length); c = getRandomInt(0, size - word.length); }
                else { r = getRandomInt(word.length-1, size-1); c = getRandomInt(0, size - word.length); }
                
                let fits = true;
                for(let k=0; k<word.length; k++) {
                    let nr=r, nc=c;
                    if (dir === 0) nc += k;
                    else if (dir === 1) nr += k;
                    else if (dir === 2) { nr += k; nc += k; }
                    else { nr -= k; nc += k; }
                    if(grid[nr][nc] !== '' && grid[nr][nc] !== word[k]) fits = false;
                }
                
                if(fits) {
                    for(let k=0; k<word.length; k++) {
                        let nr=r, nc=c;
                        if (dir === 0) nc += k;
                        else if (dir === 1) nr += k;
                        else if (dir === 2) { nr += k; nc += k; }
                        else { nr -= k; nc += k; }
                        grid[nr][nc] = word[k];
                    }
                    placedWords.push(word);
                    placed = true;
                }
                attempts++;
            }
        });

        for(let r=0; r<size; r++) {
            for(let c=0; c<size; c++) {
                if(grid[r][c] === '') grid[r][c] = turkishAlphabet[getRandomInt(0, 28)];
            }
        }
        results.push({ title: `Kelime Bulmaca (${difficulty})`, words: placedWords, grid });
    }
    return results;
};

export const generateOfflineAnagram = async (options: GeneratorOptions): Promise<(AnagramData[])[]> => {
    const { topic, itemCount, worksheetCount, difficulty } = options;
    const results: (AnagramData[])[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const words = getRandomItems(getWordsForDifficulty(difficulty, topic), itemCount);
        results.push(words.map(word => ({ word, scrambled: shuffle(word.split('')).join('') })));
    }
    return results;
};

export const generateOfflineMathPuzzle = async (options: GeneratorOptions): Promise<MathPuzzleData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const objects = EMOJIS.slice(0, 15);
    
    let valueMin = 1, valueMax = 10, ops = ['+'];
    if (difficulty === 'Orta') { valueMin = 1; valueMax = 20; ops = ['+', '-']; } 
    else if (difficulty === 'Zor') { valueMin = 2; valueMax = 15; ops = ['+', '-', '*']; } 
    else if (difficulty === 'Uzman') { valueMin = 2; valueMax = 25; ops = ['+', '-', '*', '/']; }

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
            let question = `İpucu: ${currentObjects[0]}=${values[0]}, ${currentObjects[1]}=${values[1]}, ${currentObjects[2]}=${values[2]}`;
            let answer = 0;

            if (op === '+') { answer = val1 + val2; } 
            else if (op === '-') { if (val1 < val2) { [val1, val2] = [val2, val1]; problemStr = `${currentObjects[idx2]} ${op} ${currentObjects[idx1]} = ?`; } answer = val1 - val2; } 
            else if (op === '*') { answer = val1 * val2; } 
            else if (op === '/') { if (val2 === 0) val2 = 1; const product = val1 * val2; problemStr = `❓ ${op} ${currentObjects[idx2]} = ${currentObjects[idx1]}`; question = `Eğer ${currentObjects[idx2]}=${val2} ve ${currentObjects[idx1]}=${val1} ise ❓ kaçtır?`; answer = product; }
            return { problem: problemStr, question, answer: answer.toString() };
        });
        results.push({ title: `Matematik Bulmacası (${difficulty})`, puzzles });
    }
    return results;
};

export const generateOfflineFindTheDifference = async (options: GeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { topic, itemCount, worksheetCount, difficulty } = options;
    const results: FindTheDifferenceData[] = [];
    const pool = [...TR_VOCAB.confusing_words.flat(), ...getWordsForDifficulty(difficulty, topic)];
    
    for (let i = 0; i < worksheetCount; i++) {
        const rows = Array.from({ length: itemCount }).map(() => {
            const baseWord = getRandomItems(pool, 1)[0];
            const correctIndex = getRandomInt(0, 3);
            let differentWord = '';
            const chars = baseWord.split('');

            if (difficulty === 'Başlangıç' && chars.length > 1) { [chars[0], chars[chars.length - 1]] = [chars[chars.length - 1], chars[0]]; differentWord = chars.join(''); } 
            else if (difficulty === 'Orta' && chars.length > 2) { const pos = getRandomInt(1, chars.length - 2); chars[pos] = turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)]; differentWord = chars.join(''); } 
            else { 
                if (baseWord.includes('b')) differentWord = baseWord.replace('b', 'd');
                else if (baseWord.includes('d')) differentWord = baseWord.replace('d', 'b');
                else if (baseWord.includes('p')) differentWord = baseWord.replace('p', 'q');
                else if (baseWord.includes('q')) differentWord = baseWord.replace('q', 'p');
                else if (chars.length > 1) { const pos = getRandomInt(0, chars.length - 1); chars[pos] = getRandomItems(turkishAlphabet.split('').filter(c => c !== chars[pos]), 1)[0]; differentWord = chars.join(''); } 
                else { differentWord = baseWord + 'a'; }
            }
            if (!differentWord || differentWord === baseWord) differentWord = baseWord + 'x';

            const items = Array(4).fill(baseWord);
            items[correctIndex] = differentWord;
            return { items, correctIndex };
        });
        results.push({ title: `Farklı Olanı Bul (${difficulty})`, rows });
    }
    return results;
};

export const generateOfflineNumberSearch = async (options: GeneratorOptions): Promise<NumberSearchData[]> => {
    const { worksheetCount, difficulty, itemCount } = options;
    const results: NumberSearchData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        let rangeEnd = itemCount || 50;
        let range = { start: 1, end: 20 };
        if (difficulty === 'Orta') range = { start: 1, end: rangeEnd > 50 ? 50 : rangeEnd };
        if (difficulty === 'Zor' || difficulty === 'Uzman') range = { start: 1, end: rangeEnd > 100 ? 100 : rangeEnd };
        const numbersToFind = Array.from({ length: range.end - range.start + 1 }, (_, k) => k + range.start);
        const distractors = Array.from({ length: 150 - numbersToFind.length }, () => getRandomInt(1, range.end + 20));
        results.push({ title: `Sayı Avı (${difficulty})`, numbers: shuffle([...numbersToFind, ...distractors]), range: range });
    }
    return results;
};

export const generateOfflineStoryComprehension = async (options: GeneratorOptions): Promise<StoryData[]> => {
    const { worksheetCount, topic, difficulty, characterName } = options;
    const results: StoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const template = getRandomItems(STORY_TEMPLATES, 1)[0];
        let story = template.template.replace('{place}', getRandomItems(template.places, 1)[0]).replace(/{character}/g, characterName || getRandomItems(template.characters, 1)[0]).replace('{activity}', getRandomItems(template.activities, 1)[0]).replace('{object}', getRandomItems(template.objects, 1)[0]);
        const questions = Array.from({ length: 3 }).map(() => {
            const wordPool = story.split(' ').filter(w => w.length > 3);
            const answer = getRandomItems(wordPool, 1)[0] || "cevap";
            const options = shuffle([answer, getRandomItems(getWordsForDifficulty(difficulty, topic), 1)[0] || "yanlış1", getRandomItems(getWordsForDifficulty(difficulty, topic), 1)[0] || "yanlış2"]);
            return { question: `Hikayede geçen kelimelerden hangisi aşağıdadır?`, options, answerIndex: options.indexOf(answer) };
        });
        results.push({ title: `Hikaye Anlama (${topic || 'Rastgele'})`, story, questions });
    }
    return results;
};

export const generateOfflineStroopTest = async (options: GeneratorOptions): Promise<StroopTestData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: StroopTestData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const items = Array.from({ length: itemCount }).map(() => {
            const color1 = getRandomItems(COLORS, 1)[0];
            const color2 = getRandomItems(COLORS.filter(c => c.name !== color1.name), 1)[0];
            return { text: color1.name, color: color2.css };
        });
        results.push({ title: 'Stroop Testi', items });
    }
    return results;
};

export const generateOfflineNumberPattern = async (options: GeneratorOptions): Promise<NumberPatternData[]> => {
    const { itemCount, worksheetCount, difficulty, patternType } = options;
    const results: NumberPatternData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const patterns = Array.from({ length: itemCount }).map(() => {
            let start = getRandomInt(1, 10);
            let sequence = [start];
            let answer = 0;
            const type = patternType || (difficulty === 'Başlangıç' ? 'arithmetic' : 'complex');

            if (type === 'arithmetic' || difficulty === 'Başlangıç') {
                const step = getRandomInt(2, 5);
                for (let k = 0; k < 4; k++) sequence.push(sequence[k] + step);
                answer = sequence[4] + step;
            } else if (type === 'geometric' || difficulty === 'Orta') {
                 const step = getRandomInt(2, 3);
                 for (let k = 0; k < 4; k++) sequence.push(sequence[k] * step);
                 answer = sequence[4] * step;
            } else { // complex
                const step1 = getRandomInt(2, 3);
                const step2 = getRandomInt(1, 3);
                for (let k = 0; k < 4; k++) sequence.push(sequence[k] * step1 + step2);
                answer = sequence[4] * step1 + step2;
            }
            return { sequence: `${sequence.slice(0, 5).join(', ')}, ?`, answer: answer.toString() };
        });
        results.push({ title: 'Sayı Örüntüsü', patterns });
    }
    return results;
};

export const generateOfflineSpellingCheck = async (options: GeneratorOptions): Promise<SpellingCheckData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: SpellingCheckData[] = [];
    const confusingPairs = TR_VOCAB.confusing_words;

    for (let i = 0; i < worksheetCount; i++) {
        const checks = getRandomItems(confusingPairs, itemCount).map(pair => {
            const correct = pair[0];
            const incorrect = pair[1];
            return { correct, options: shuffle([correct, incorrect, `${incorrect}x`]) };
        });
        results.push({ title: `Doğru Yazılışı Bulma`, checks });
    }
    return results;
};

export const generateOfflineProverbFillInTheBlank = async (options: GeneratorOptions): Promise<ProverbFillData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: ProverbFillData[] = [];
    for(let i=0; i < worksheetCount; i++){
        const proverbs = getRandomItems(PROVERBS, itemCount).map(p => {
            const words = p.split(' ');
            const blankIndex = getRandomInt(1, words.length - 2);
            const start = words.slice(0, blankIndex).join(' ');
            const end = words.slice(blankIndex + 1).join(' ');
            return { start, end };
        });
        results.push({ title: 'Atasözü Doldurma', proverbs });
    }
    return results;
}

export const generateOfflineOddOneOut = async (options: GeneratorOptions): Promise<OddOneOutData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: OddOneOutData[] = [];
    const categories = Object.keys(TR_VOCAB).filter(k => Array.isArray((TR_VOCAB as any)[k]) && typeof (TR_VOCAB as any)[k][0] === 'string');
     for(let i=0; i < worksheetCount; i++){
        const groups = Array.from({length: itemCount}).map(() => {
            const [cat1, cat2] = getRandomItems(categories, 2);
            const goodWords = getRandomItems((TR_VOCAB as any)[cat1] as string[], 3);
            const badWord = getRandomItems((TR_VOCAB as any)[cat2] as string[], 1);
            return { words: shuffle([...goodWords, ...badWord]) };
        });
        results.push({title: 'Farklı Olanı Bul', groups})
     }
    return results;
}

export const generateOfflineWordMemory = async (options: GeneratorOptions): Promise<WordMemoryData[]> => {
    const { topic, itemCount, difficulty, worksheetCount, memorizeRatio } = options;
    const results: WordMemoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const memorizeCount = Math.floor(itemCount * ((memorizeRatio || 50) / 100));
        const allWords = getRandomItems(getWordsForDifficulty(difficulty, topic), itemCount);
        results.push({
            title: 'Kelime Hafıza (Hızlı Mod)',
            memorizeTitle: 'Bunları Aklında Tut',
            testTitle: 'Aklında Tuttuklarını İşaretle',
            wordsToMemorize: allWords.slice(0, memorizeCount),
            testWords: shuffle(allWords)
        });
    }
    return results;
};

export const generateOfflineStoryCreationPrompt = async (options: GeneratorOptions): Promise<StoryCreationPromptData[]> => {
    const { topic, itemCount, difficulty, worksheetCount } = options;
    const results: StoryCreationPromptData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        results.push({
            title: `Hikaye Oluşturma (${topic || 'Rastgele'})`,
            prompt: `Aşağıdaki kelimeleri kullanarak ${topic || 'serbest'} konulu bir hikaye yaz.`,
            keywords: getRandomItems(getWordsForDifficulty(difficulty, topic), itemCount)
        });
    }
    return results;
};

export const generateOfflineWordComparison = async (options: GeneratorOptions): Promise<WordComparisonData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const results: WordComparisonData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const wordPool = getWordsForDifficulty(difficulty, topic);
        const commonWords = getRandomItems(wordPool, 10);
        const list1_diff = getRandomItems(wordPool.filter(w => !commonWords.includes(w)), 3);
        const list2_diff = getRandomItems(wordPool.filter(w => !commonWords.includes(w) && !list1_diff.includes(w)), 3);
        results.push({
            title: 'Kelime Karşılaştırma',
            box1Title: 'Kutu 1',
            box2Title: 'Kutu 2',
            wordList1: shuffle([...commonWords, ...list1_diff]),
            wordList2: shuffle([...commonWords, ...list2_diff])
        });
    }
    return results;
};

export const generateOfflineWordsInStory = async (options: GeneratorOptions): Promise<WordsInStoryData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const results: WordsInStoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const template = getRandomItems(STORY_TEMPLATES, 1)[0];
        const story = template.template.replace('{place}', getRandomItems(template.places, 1)[0]).replace(/{character}/g, getRandomItems(template.characters, 1)[0]).replace('{activity}', getRandomItems(template.activities, 1)[0]).replace('{object}', getRandomItems(template.objects, 1)[0]);
        const wordsInStory = [...new Set(story.replace(/[.,]/g, '').split(' ').filter(w => w.length > 3))];
        const inStoryList = getRandomItems(wordsInStory, 6);
        const notInStoryList = getRandomItems(getWordsForDifficulty(difficulty, topic).filter(w => !wordsInStory.includes(w)), 6);
        const wordList = shuffle([...inStoryList.map(w => ({ word: w, isInStory: true })), ...notInStoryList.map(w => ({ word: w, isInStory: false }))]);
        results.push({ title: 'Metindeki Kelimeler', story, wordList });
    }
    return results;
};

export const generateOfflineShapeMatching = async (options: GeneratorOptions): Promise<ShapeMatchingData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const results: ShapeMatchingData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const shapeCount = difficulty === 'Başlangıç' ? 2 : (difficulty === 'Orta' ? 3 : 4);
        const leftColumn = Array.from({ length: itemCount }, (_, k) => ({ id: k + 1, shapes: getRandomItems(SHAPE_TYPES, shapeCount) }));
        const rightColumn = shuffle(leftColumn.map((item, index) => ({ ...item, id: String.fromCharCode(65 + index) })));
        results.push({ title: 'Şekil Eşleştirme', leftColumn, rightColumn });
    }
    return results;
};

export const generateOfflineSymbolCipher = async (options: GeneratorOptions): Promise<SymbolCipherData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const results: SymbolCipherData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const cipherKey = getRandomItems(SHAPE_TYPES, 8).map((shape, index) => ({ shape, letter: turkishAlphabet[index] }));
        const words = getRandomItems(getWordsForDifficulty(difficulty), itemCount);
        const wordsToSolve = words.map(word => {
            const shapeSequence: ShapeType[] = [];
            for (const letter of word) {
                const keyItem = cipherKey.find(item => item.letter === letter);
                if (keyItem) shapeSequence.push(keyItem.shape);
            }
            return { shapeSequence, wordLength: word.length };
        }).filter(w => w.shapeSequence.length > 0);
        results.push({ title: 'Şifre Çözme', cipherKey, wordsToSolve });
    }
    return results;
};

export const generateOfflineLetterBridge = async (options: GeneratorOptions): Promise<LetterBridgeData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const results: LetterBridgeData[] = [];
    const wordPool = getWordsForDifficulty(difficulty);
    for (let i = 0; i < worksheetCount; i++) {
        const pairs = [];
        for (let j = 0; j < itemCount; j++) {
            const bridgeLetter = getRandomItems(turkishAlphabet.split(''), 1)[0];
            const word1 = getRandomItems(wordPool.filter(w => w.endsWith(bridgeLetter)), 1)[0];
            const word2 = getRandomItems(wordPool.filter(w => w.startsWith(bridgeLetter)), 1)[0];
            if (word1 && word2) pairs.push({ word1: word1.slice(0, -1), word2: word2.slice(1) });
        }
        if (pairs.length > 0) results.push({ title: 'Harf Köprüsü', pairs });
    }
    return results;
};

export const generateOfflineFindTheDuplicateInRow = async (options: GeneratorOptions): Promise<FindDuplicateData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const results: FindDuplicateData[] = [];
    const charPool = (difficulty === 'Zor' || difficulty === 'Uzman') ? ['b', 'd', 'p', 'q', 'm', 'n'] : turkishAlphabet.split('');
    for (let i = 0; i < worksheetCount; i++) {
        const rows = Array.from({ length: itemCount }, () => {
            const rowChars = getRandomItems(charPool, 15);
            const duplicateChar = getRandomItems(rowChars, 1)[0];
            const insertPos = getRandomInt(0, 14);
            rowChars.splice(insertPos, 0, duplicateChar);
            return shuffle(rowChars);
        });
        results.push({ title: 'İkiliyi Bul', rows });
    }
    return results;
};

export const generateOfflineWordLadder = async (options: GeneratorOptions): Promise<WordLadderData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: WordLadderData[] = [];
    const ladders = [{ startWord: 'taş', endWord: 'yol', steps: 3 }, { startWord: 'göz', endWord: 'söz', steps: 1 }];
    for (let i = 0; i < worksheetCount; i++) {
        results.push({ title: 'Kelime Merdiveni', ladders: getRandomItems(ladders, itemCount) });
    }
    return results;
};

export const generateOfflineFindIdenticalWord = async (options: GeneratorOptions): Promise<FindIdenticalWordData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: FindIdenticalWordData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const groups = getRandomItems(TR_VOCAB.confusing_words, itemCount).map(pair => ({ words: pair as [string, string] }));
        results.push({ title: 'Aynısını Bul', groups });
    }
    return results;
};

export const generateOfflineWordFormation = async (options: GeneratorOptions): Promise<WordFormationData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const results: WordFormationData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const sets = Array.from({ length: itemCount }, () => {
            const baseWord = getRandomItems(getWordsForDifficulty(difficulty), 1)[0] || "merhaba";
            return { letters: shuffle(baseWord.split('')), jokerCount: difficulty === 'Başlangıç' ? 2 : 1 };
        });
        results.push({ title: 'Harflerden Kelime Türetme', sets });
    }
    return results;
};

export const generateOfflineReverseWord = async (options: GeneratorOptions): Promise<ReverseWordData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const results: ReverseWordData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        results.push({ title: 'Ters Oku', words: getRandomItems(getWordsForDifficulty(difficulty), itemCount) });
    }
    return results;
};

export const generateOfflineFindLetterPair = async (options: GeneratorOptions): Promise<FindLetterPairData[]> => {
    const { gridSize, difficulty, worksheetCount, targetPair } = options;
    const results: FindLetterPairData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const size = gridSize || 15;
        const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => getRandomItems(turkishAlphabet.split(''), 1)[0]));
        const pair = targetPair || ((difficulty === 'Zor' || difficulty === 'Uzman') ? 'bd' : 'ak');
        for (let k = 0; k < 5; k++) {
            const r = getRandomInt(0, size - 1);
            const c = getRandomInt(0, size - 2);
            grid[r][c] = pair[0];
            grid[r][c + 1] = pair[1];
        }
        results.push({ title: 'Harf İkilisini Bul', grid, targetPair: pair });
    }
    return results;
};

export const generateOfflineWordGrouping = async (options: GeneratorOptions): Promise<WordGroupingData[]> => {
    const { worksheetCount, categoryCount } = options;
    const results: WordGroupingData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const validCategories = Object.keys(TR_VOCAB).filter(k => Array.isArray((TR_VOCAB as any)[k]) && typeof (TR_VOCAB as any)[k][0] === 'string' && !k.endsWith('_words'));
        const categories = getRandomItems(validCategories, categoryCount || 3);
        const words: string[] = [];
        categories.forEach(cat => words.push(...getRandomItems((TR_VOCAB as any)[cat] as string[], 4)));
        results.push({ title: 'Gruplama', words: shuffle(words), categoryNames: categories });
    }
    return results;
};

export const generateOfflineVisualMemory = async (options: GeneratorOptions): Promise<VisualMemoryData[]> => {
    const { itemCount, worksheetCount, memorizeRatio } = options;
    const results: VisualMemoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const memorizeCount = Math.floor(itemCount * ((memorizeRatio || 50) / 100));
        const allItems = getRandomItems(EMOJIS, itemCount);
        results.push({
            title: 'Görsel Hafıza (Hızlı Mod)',
            memorizeTitle: 'Bunları Aklında Tut',
            testTitle: 'Aklında Tuttuklarını İşaretle',
            itemsToMemorize: allItems.slice(0, memorizeCount),
            testItems: shuffle(allItems)
        });
    }
    return results;
};

export const generateOfflineStoryAnalysis = async (options: GeneratorOptions): Promise<StoryAnalysisData[]> => {
    const res = await generateOfflineStoryComprehension(options);
    return res.map(r => ({ ...r, title: 'Hikaye Analizi', questions: r.questions.map(q => ({ question: q.question, context: q.options.join(', ') })) }));
};

export const generateOfflineCoordinateCipher = async (options: GeneratorOptions): Promise<CoordinateCipherData[]> => {
    const { gridSize, itemCount, worksheetCount } = options;
    const results: CoordinateCipherData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const size = gridSize || 8;
        const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => getRandomItems(turkishAlphabet.split(''), 1)[0]));
        const wordsToFind = getRandomItems(getWordsForDifficulty('Orta'), itemCount);
        const password = getRandomItems(getWordsForDifficulty('Başlangıç'), 1)[0] || 'şifre';
        const cipherCoordinates: string[] = [];
        for(let char of password) {
            const r = getRandomInt(0, size - 1);
            const c = getRandomInt(0, size - 1);
            grid[r][c] = char;
            cipherCoordinates.push(`${String.fromCharCode(65 + r)}${c+1}`);
        }
        results.push({ title: 'Gizemli Bulmaca', grid, wordsToFind, cipherCoordinates });
    }
    return results;
};

export const generateOfflineProverbSearch = async (options: GeneratorOptions): Promise<ProverbSearchData[]> => {
    const { worksheetCount } = options;
    const res = await generateOfflineWordSearch({ ...options, itemCount: 1, topic: 'atasözü' }); // Reuse logic
    return res.map(r => ({ title: 'Atasözü Avı', grid: r.grid, proverb: getRandomItems(PROVERBS, 1)[0] }));
};

export const generateOfflineTargetSearch = async (options: GeneratorOptions): Promise<TargetSearchData[]> => {
    const { gridSize, difficulty, worksheetCount, targetChar, distractorChar } = options;
    const results: TargetSearchData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const size = gridSize || 20;
        const target = targetChar || 'd', distractor = distractorChar || 'b';
        const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => distractor));
        for (let k = 0; k < 20; k++) {
            grid[getRandomInt(0, size - 1)][getRandomInt(0, size - 1)] = target;
        }
        results.push({ title: 'Dikkatli Göz', grid, target, distractor });
    }
    return results;
};

export const generateOfflineShapeNumberPattern = async (options: GeneratorOptions): Promise<ShapeNumberPatternData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: ShapeNumberPatternData[] = [];
    for(let i=0; i < worksheetCount; i++){
        const patterns: ShapeNumberPatternData['patterns'] = Array.from({length: itemCount}).map(() => {
            const n1 = getRandomInt(1,5), n2 = getRandomInt(1,5);
            return { shapes: [{ type: 'triangle', numbers: [n1, n2, n1+n2] }, { type: 'triangle', numbers: [n1+1, n2+1, '?'] }] }
        })
        results.push({ title: 'Şekilli Sayı Örüntüsü', patterns });
    }
    return results;
};

export const generateOfflineGridDrawing = async (options: GeneratorOptions): Promise<GridDrawingData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    const results: GridDrawingData[] = [];
    for(let i=0; i < worksheetCount; i++){
        const drawings: GridDrawingData['drawings'] = Array.from({length: itemCount}).map(() => {
            return { lines: [[ [getRandomInt(0, gridSize-1),getRandomInt(0, gridSize-1)],[getRandomInt(0, gridSize-1),getRandomInt(0, gridSize-1)] ]] };
        });
        results.push({ title: 'Ayna Çizimi', gridDim: gridSize || 8, drawings });
    }
    return results;
};

export const generateOfflineColorWheelMemory = async (options: GeneratorOptions): Promise<ColorWheelMemoryData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: ColorWheelMemoryData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const items = getRandomItems(EMOJIS, itemCount).map((emoji, index) => ({
            name: `${getRandomItems(getWordsForDifficulty('Başlangıç'), 1)[0]} ${emoji}`,
            color: COLORS[index % COLORS.length].css
        }));
        results.push({
            title: 'Renk Çemberi',
            memorizeTitle: 'Ezberle',
            testTitle: 'Hatırla ve Eşleştir',
            items
        });
    }
    return results;
}

export const generateOfflineImageComprehension = async (options: GeneratorOptions): Promise<ImageComprehensionData[]> => {
    const { worksheetCount } = options;
    const results: ImageComprehensionData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const scene = "Parkta oynayan çocuklar 🤸, uçan bir uçurtma 🪁 ve dondurma yiyen bir aile 👨‍👩‍👧‍👦 var.";
        results.push({
            title: "Resme Dikkat (Hızlı Mod)",
            memorizeTitle: "Resmi İncele",
            testTitle: "Soruları Cevapla",
            sceneDescription: scene,
            imageBase64: "", // No image in fast mode
            questions: ["Uçurtma ne renk olabilir?", "Kaç çocuk oyun oynuyor?", "Aile ne yiyor olabilir?"]
        });
    }
    return results;
};

export const generateOfflineCharacterMemory = async (options: GeneratorOptions): Promise<CharacterMemoryData[]> => {
    const {itemCount, worksheetCount, memorizeRatio} = options;
    const results: CharacterMemoryData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const memorizeCount = Math.floor(itemCount * ((memorizeRatio || 50) / 100));
        const allItems = getRandomItems(EMOJIS, itemCount).map(emoji => ({
            description: `${getRandomItems(TR_VOCAB.adjectives, 1)[0]} ${getRandomItems(TR_VOCAB.animals, 1)[0]} ${emoji}`
        }));
        results.push({
            title: 'Karakter Hafıza (Hızlı Mod)',
            memorizeTitle: 'Karakterleri Ezberle',
            testTitle: 'Doğru Karakterleri İşaretle',
            charactersToMemorize: allItems.slice(0, memorizeCount),
            testCharacters: shuffle(allItems)
        });
    }
    return results;
}

export const generateOfflineStorySequencing = async (options: GeneratorOptions): Promise<StorySequencingData[]> => {
    const panels = [{id: 'A', description: 'Çocuk uyandı.'}, {id: 'B', description: 'Okula gitti.'}, {id: 'C', description: 'Kahvaltı yaptı.'}, {id: 'D', description: 'Oyun oynadı.'}];
    return [{ title: 'Hikaye Oluşturma', prompt: 'Resimleri sırala.', panels: shuffle(panels) }];
};

export const generateOfflineChaoticNumberSearch = async (options: GeneratorOptions): Promise<ChaoticNumberSearchData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: ChaoticNumberSearchData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const range = {start: 1, end: itemCount || 50};
        const targetNumbers = Array.from({length: range.end}, (_,k) => k+1);
        const distractorNumbers = Array.from({length: 50}, () => getRandomInt(range.end+1, range.end+20));
        const numbers = shuffle([...targetNumbers, ...distractorNumbers]).map(value => ({
            value,
            x: getRandomInt(5, 95),
            y: getRandomInt(5, 95),
            size: getRandomInt(1, 3),
            rotation: getRandomInt(-45, 45),
            color: getRandomItems(COLORS, 1)[0].css
        }));
        results.push({
            title: 'Sayıları Bulma',
            prompt: `Karışık sayılar arasından ${range.start}'den ${range.end}'e kadar olanları boyayın.`,
            numbers,
            range
        })
    }
    return results;
}

export const generateOfflineBlockPainting = async (options: GeneratorOptions): Promise<BlockPaintingData[]> => {
    return [{
        title: 'Blok Boyama',
        prompt: 'Verilen blokları kullanarak deseni doğru renklere boyayın.',
        grid: {rows: 8, cols: 8},
        shapes: [
            { color: '#FF0000', pattern: [[1,1],[1,1]] }, // Square
            { color: '#00FF00', pattern: [[1,1,1,1]] }, // Line
            { color: '#0000FF', pattern: [[0,1,0],[1,1,1]] } // T-shape
        ]
    }];
}

export const generateOfflineMiniWordGrid = async (options: GeneratorOptions): Promise<MiniWordGridData[]> => {
     const {itemCount, worksheetCount, difficulty} = options;
     const results: MiniWordGridData[] = [];
     for(let i=0; i<worksheetCount; i++){
         const puzzles = Array.from({length: itemCount}).map(() => {
            const word = getRandomItems(getWordsForDifficulty(difficulty), 1)[0] || 'asli';
            const size = Math.ceil(Math.sqrt(word.length));
            const grid = Array.from({length: size}, () => Array(size).fill(''));
            let k = 0;
            for(let r=0; r<size; r++) for(let c=0; c<size; c++) grid[r][c] = word[k++] || turkishAlphabet[getRandomInt(0,28)];
            return {grid, start: {row: 0, col: 0}}
         })
         results.push({title: 'Mini Kelime Bulmaca', prompt: 'Renkli harften başlayan kelimeleri bulun.', puzzles})
     }
    return results;
};

export const generateOfflineVisualOddOneOut = async (options: GeneratorOptions): Promise<VisualOddOneOutData[]> => {
    return [{
        title: 'Sözcük Avı (Farklı Şekil)',
        prompt: 'Her satırda diğerlerinden farklı olan şekli bulun.',
        rows: [{ items: [
            { segments: [true,true,true,false,true,true,true] },
            { segments: [true,true,true,false,true,true,true] },
            { segments: [true,false,true,false,true,true,true] }, // different
            { segments: [true,true,true,false,true,true,true] },
        ]}]
    }]
}

export const generateOfflineShapeCounting = async (options: GeneratorOptions): Promise<ShapeCountingData[]> => {
    return [{
        title: 'Kaç Tane Üçgen Var?',
        prompt: 'Karmaşık şekillerin içine gizlenmiş üçgenleri sayın.',
        figures: [{ svgPaths: [ {d: 'M 10 80 L 50 10 L 90 80 Z', fill: '#ffcccc'}, {d: 'M 10 30 L 90 30 L 50 80 Z', fill: '#ccccff'} ]}]
    }];
}

export const generateOfflineSymmetryDrawing = async (options: GeneratorOptions): Promise<SymmetryDrawingData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    const results: SymmetryDrawingData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const dim = gridSize || 8;
        const dots = Array.from({length: 5}).map(() => ({x: getRandomInt(0, dim/2 - 1), y: getRandomInt(0, dim-1)}));
        results.push({
            title: 'Noktalarla Dans (Simetri)',
            prompt: 'Verilen desenin simetri eksenine göre yansımasını çizin.',
            gridDim: dim,
            dots,
            axis: 'vertical'
        });
    }
    return results;
}

export const generateOfflineFindDifferentString = async (options: GeneratorOptions): Promise<FindDifferentStringData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: FindDifferentStringData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const rows = Array.from({length:itemCount}).map(() => {
            const base = "VWN";
            const diff = "VNW";
            const items = shuffle([base, base, base, diff]);
            return {items};
        });
        results.push({
            title: 'Farklı Olanı Bulma',
            prompt: 'Aşağıdaki sütunlarda yer alan harf sıralamasında VWN’den farklı olan harf grubunu işaretleyelim.',
            rows
        });
    }
    return results;
};

export const generateOfflineDotPainting = async (options: GeneratorOptions): Promise<DotPaintingData[]> => {
    return [{
        title: 'Nokta Boyama',
        prompt1: 'Noktaların bulunduğu alanları boyayarak gizli şekli ortaya çıkaralım.',
        prompt2: 'Örnek: Ev',
        svgViewBox: '0 0 100 100',
        gridPaths: [],
        dots: [{cx: 50, cy: 50, color: 'red'}, {cx: 60, cy: 50, color: 'red'}]
    }];
}

export const generateOfflineAbcConnect = async (options: GeneratorOptions): Promise<AbcConnectData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    const results: AbcConnectData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const dim = gridSize || 6;
        const letters = ['A','B','C','D'];
        const points = letters.flatMap(l => ([
            {letter: l, x: getRandomInt(0, dim-1), y: getRandomInt(0, dim-1)},
            {letter: l, x: getRandomInt(0, dim-1), y: getRandomInt(0, dim-1)}
        ]));
        results.push({
            title: 'ABC Bağlama',
            prompt: 'Aynı harfleri birleştirin.',
            puzzles: [{id: 1, gridDim: dim, points}]
        });
    }
    return results;
}

export const generateOfflineLetterGridTest = async (options: GeneratorOptions): Promise<LetterGridTestData[]> => {
    const { gridSize, difficulty, worksheetCount, targetLetters } = options;
    const letters = targetLetters || 'b,d,p,q';
    const targetLettersArray = letters.split(',').map(l => l.trim().toLowerCase());
    const results: LetterGridTestData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const size = gridSize || 15;
        const grid: string[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => getRandomItems(turkishAlphabet.split(''), 1)[0]));

        const targetCount = Math.floor(size * size * 0.2); // 20% target letters
        for (let k = 0; k < targetCount; k++) {
            const r = getRandomInt(0, size - 1);
            const c = getRandomInt(0, size - 1);
            grid[r][c] = getRandomItems(targetLettersArray, 1)[0];
        }

        results.push({
            title: `Harf Izgara Testi (${difficulty})`,
            grid: grid,
            targetLetters: targetLettersArray
        });
    }
    return results;
};

export const generateOfflineBurdonTest = async (options: GeneratorOptions): Promise<LetterGridTestData[]> => {
    return generateOfflineLetterGridTest({ ...options, gridSize: options.gridSize || 20, targetLetters: options.targetLetters || 'a,b,d,g' });
};

export const generateOfflinePasswordFinder = async (options: GeneratorOptions): Promise<PasswordFinderData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: PasswordFinderData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const words: PasswordFinderData['words'] = [];
        let password = '';
        for(let j=0; j<itemCount; j++){
            const isProper = Math.random() > 0.5;
            const word = isProper ? getRandomItems(TR_VOCAB.jobs, 1)[0] : getRandomItems(TR_VOCAB.easy_words, 1)[0];
            const passwordLetter = isProper ? word.charAt(0) : '';
            if(isProper) password += passwordLetter;
            words.push({word: isProper ? word.charAt(0).toUpperCase() + word.slice(1) : word, passwordLetter, isProperNoun: isProper});
        }
        results.push({title: 'Şifre Bul', prompt: 'Baş harfi büyük yazılması gereken kelimeleri bulup şifreyi çözün.', words, passwordLength: password.length});
    }
    return results;
}
export const generateOfflineSyllableCompletion = async (options: GeneratorOptions): Promise<SyllableCompletionData[]> => {
    const {itemCount, worksheetCount, difficulty} = options;
    const results: SyllableCompletionData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const words = getRandomItems(getWordsForDifficulty(difficulty), itemCount);
        const wordParts = words.map(w => ({first: w.slice(0, 2), second: w.slice(2)}));
        const syllables = wordParts.map(p => p.second);
        results.push({title: 'Hece Tamamlama', prompt: 'Heceleri tamamla.', theme: 'Rastgele', wordParts, syllables, storyPrompt: 'Bu kelimelerle hikaye yaz.'});
    }
    return results;
}
export const generateOfflineSynonymWordSearch = async (options: GeneratorOptions): Promise<SynonymWordSearchData[]> => {
    const {itemCount, difficulty, worksheetCount, gridSize} = options;
    const results: SynonymWordSearchData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const wordsToMatch = getRandomItems(TR_VOCAB.synonyms, itemCount);
        const searchResult = await generateOfflineWordSearch({
            ...options,
            itemCount, 
            worksheetCount:1, 
            topic: 'Rastgele', 
            gridSize,
            words: wordsToMatch.map(p => p.synonym)
        });
        results.push({
            title: 'Eş Anlamlı Kelime Avı', prompt: 'Kelimelerin eş anlamlılarını bulup bulmacada arayın.', 
            wordsToMatch, grid: searchResult[0].grid
        });
    }
    return results;
}
export const generateOfflineWordConnect = async (options: GeneratorOptions): Promise<WordConnectData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    const results: WordConnectData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const pairs = getRandomItems(TR_VOCAB.synonyms, itemCount/2);
        const points = pairs.flatMap((p, idx) => ([
            {word: p.word, pairId: idx, x: getRandomInt(1,4), y: getRandomInt(1,9)},
            {word: p.synonym, pairId: idx, x: getRandomInt(6,9), y: getRandomInt(1,9)},
        ]));
        results.push({title: 'Kelime Bağlama', prompt: 'Anlamca ilişkili kelimeleri çizgilerle birleştirin.', gridDim: gridSize || 10, points: shuffle(points)});
    }
    return results;
}
export const generateOfflineSpiralPuzzle = async (options: GeneratorOptions): Promise<SpiralPuzzleData[]> => {
    // This is complex, returning a static example
    return Array(options.worksheetCount).fill({ title: 'Sarmal Bulmaca', prompt: 'İpuçlarından kelimeleri bulup sarmal bulmacaya yerleştirin.', clues:['Sıcak zıttı'], grid: [['s','o','ğ'],['k','u',' ']], wordStarts: [{id:1, row:0, col:0}] });
}
export const generateOfflinePunctuationSpiralPuzzle = async (options: GeneratorOptions): Promise<PunctuationSpiralPuzzleData[]> => {
    const data = await generateOfflineSpiralPuzzle(options);
    return data.map(d => ({...d, title: 'Noktalama Sarmal Bulmaca'}));
}
export const generateOfflineCrossword = async (options: GeneratorOptions): Promise<CrosswordData[]> => {
     // This is complex, returning a static example
    return Array(options.worksheetCount).fill({ title: 'Çapraz Bulmaca', prompt: 'Verilen ipuçlarıyla bulmacayı çözün ve şifreyi bulun.', grid: [[null, 'E', null], ['E', 'L', 'M'], [null, 'A', null]], clues:[], passwordCells:[], passwordLength: 0 });
}
export const generateOfflineJumbledWordStory = async (options: GeneratorOptions): Promise<JumbledWordStoryData[]> => {
    const {itemCount, worksheetCount, difficulty, theme} = options;
    const results: JumbledWordStoryData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const words = getRandomItems(getWordsForDifficulty(difficulty, theme), itemCount);
        const puzzles = words.map(w => ({jumbled: shuffle(w.split('')), word: w}));
        results.push({title: 'Kelime Bulma ve Hikaye Yazma', prompt: 'Karışık harflerden kelimeler bulun ve bu kelimelerle hikaye yazın.', theme: theme || 'Rastgele', puzzles, storyPrompt: 'Bu kelimeleri kullanarak bir hikaye yaz.'});
    }
    return results;
}
export const generateOfflineHomonymSentenceWriting = async (options: GeneratorOptions): Promise<HomonymSentenceData[]> => {
    const {itemCount, worksheetCount} = options;
    return Array(worksheetCount).fill({
        title: 'Kelime Ağı (Eş Sesli)', prompt: 'Eş sesli kelimeler için iki farklı anlama gelen cümleler yazın.',
        items: getRandomItems(HOMONYMS, itemCount).map(word => ({word}))
    });
}
export const generateOfflineWordGridPuzzle = async (options: GeneratorOptions): Promise<WordGridPuzzleData[]> => {
    const {itemCount, worksheetCount, difficulty, theme} = options;
    const results: WordGridPuzzleData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const wordList = getRandomItems(getWordsForDifficulty(difficulty, theme), itemCount);
        results.push({title: 'Kelime Ağı (Yerleştirme)', prompt: 'Verilen kelimeleri bulmaca tablosuna doğru şekilde yerleştirin.', theme: theme || 'Rastgele', wordList, grid:[[null]], unusedWordPrompt: 'Kullanılmayan kelime hangisidir?'});
    }
    return results;
}
export const generateOfflineProverbSayingSort = async (options: GeneratorOptions): Promise<ProverbSayingSortData[]> => {
    return Array(options.worksheetCount).fill({ title: 'Şifre Bul (Atasözü/Özdeyiş)', prompt: 'Cümlelerin atasözü mü yoksa özdeyiş mi olduğunu belirleyin.', items: [{text: 'Damlaya damlaya göl olur.', type: 'atasözü'}]});
}
export const generateOfflineHomonymImageMatch = async (options: GeneratorOptions): Promise<HomonymImageMatchData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Resim Eşleştirme (Eş Sesli)', prompt: 'Eş sesli kelimelere ait görselleri eşleştirin.', leftImages: [], rightImages: [], wordScramble: {letters: ['y','ü','z'], word:'yüz'} });
}
export const generateOfflineAntonymFlowerPuzzle = async (options: GeneratorOptions): Promise<AntonymFlowerPuzzleData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: AntonymFlowerPuzzleData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const puzzles = getRandomItems(TR_VOCAB.antonyms, itemCount).map(p => ({
            centerWord: p.word,
            antonym: p.antonym,
            petalLetters: shuffle(p.antonym.split(''))
        }));
        results.push({title: 'Eşleştir (Zıt Anlamlı)', prompt: 'Papatyaların ortasındaki kelimelerin zıt anlamlılarını bulun ve şifreyi çözün.', puzzles, passwordLength: 4});
    }
    return results;
}
export const generateOfflineProverbWordChain = async (options: GeneratorOptions): Promise<ProverbWordChainData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: ProverbWordChainData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const solutions = getRandomItems(PROVERBS, itemCount);
        const wordCloud = solutions.flatMap(s => s.replace(/[.,]/g, '').split(' ')).map(word => ({word, color: getRandomItems(COLORS, 1)[0].css}));
        results.push({title: 'Atasözü/Özdeyiş Bulma', prompt: 'Karışık kelimelerden atasözleri ve özdeyişler oluşturun.', wordCloud: shuffle(wordCloud), solutions});
    }
    return results;
}
export const generateOfflineSynonymAntonymGrid = async (options: GeneratorOptions): Promise<SynonymAntonymGridData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    const results: SynonymAntonymGridData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const synonyms = getRandomItems(TR_VOCAB.synonyms, itemCount/2).map(s => ({word: s.word}));
        const antonyms = getRandomItems(TR_VOCAB.antonyms, itemCount/2).map(a => ({word: a.word}));
        const grid = Array(gridSize || 12).fill(0).map(() => Array(gridSize || 12).fill(null));
        results.push({title: 'Kelime Bulma (Eş/Zıt Anlamlı)', prompt: 'Kelimelerin eş ve zıt anlamlılarını bulup bulmacaya yerleştirin.', antonyms, synonyms, grid});
    }
    return results;
}
export const generateOfflinePunctuationColoring = async (options: GeneratorOptions): Promise<PunctuationColoringData[]> => {
    return Array(options.worksheetCount).fill({ title: 'Görsel Boyama (Noktalama)', prompt: 'Cümlelere uygun noktalama işaretlerini bularak resmi boyayın.', sentences: [] });
}
export const generateOfflinePunctuationMaze = async (options: GeneratorOptions): Promise<PunctuationMazeData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Labirent (Noktalama)', prompt: 'Doğru kuralı bularak labirentte doğru yolu bulun.', punctuationMark: '.', rules: [] });
}
export const generateOfflineAntonymResfebe = async (options: GeneratorOptions): Promise<AntonymResfebeData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Resfebe (Zıt Anlamlı)', prompt: 'Resfebe ile kelimeyi bulun, sonra zıt anlamlısını yazın.', puzzles: [], antonymsPrompt: 'Zıt anlamlılarını yaz.' });
}
export const generateOfflineThematicWordSearchColor = async (options: GeneratorOptions): Promise<ThematicWordSearchColorData[]> => {
    const res = await generateOfflineWordSearch(options);
    return res.map(r => ({...r, theme: options.topic || 'Rastgele', prompt: 'Boyayarak bul.'}))
}
export const generateOfflineThematicOddOneOutSentence = async (options: GeneratorOptions): Promise<ThematicOddOneOutSentenceData[]> => {
    const res = await generateOfflineThematicOddOneOut(options);
    return res.map(r => ({...r, title: 'Şifre Bul (Farklı Kelime)'}))
}
export const generateOfflineProverbSentenceFinder = async (options: GeneratorOptions): Promise<ProverbSentenceFinderData[]> => {
    const res = await generateOfflineProverbWordChain(options);
    return res.map(r => ({...r, title: 'Cümle Bulma (Atasözü)'}))
}
export const generateOfflineSynonymSearchAndStory = async (options: GeneratorOptions): Promise<SynonymSearchAndStoryData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    const results: SynonymSearchAndStoryData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const wordTable = getRandomItems(TR_VOCAB.synonyms, itemCount);
// FIX: Passed the full options object to 'generateOfflineWordSearch' to ensure all required properties like 'mode' and 'difficulty' are included, resolving a TypeScript error.
        const grid = await generateOfflineWordSearch({
            ...options,
            itemCount: wordTable.length,
            worksheetCount: 1, 
            words: wordTable.map(p => p.synonym)
        });
        results.push({title: 'Dikkat Testi (Eş Anlamlı)', prompt: 'Kelimelerin eş anlamlılarını bulun, bulmacada arayın ve hikaye yazın.', wordTable, grid: grid[0].grid, storyPrompt: 'Bu kelimelerle bir hikaye yaz.'});
    }
    return results;
}
export const generateOfflineColumnOddOneOutSentence = async (options: GeneratorOptions): Promise<ColumnOddOneOutSentenceData[]> => {
     const {worksheetCount} = options;
     const results: ColumnOddOneOutSentenceData[] = [];
     for(let i=0; i<worksheetCount; i++){
         results.push({
             title: 'Farklı Özelliği Bulma (Sütun)', prompt: 'Her sütunda farklı olan kelimeyi bulup cümle kurun.',
             columns: Array(3).fill(0).map(() => ({words: ['kedi', 'köpek', 'masa'], oddWord: 'masa'})),
             sentencePrompt: 'Farklı kelimelerle cümle kur.'
         });
     }
     return results;
}
export const generateOfflineSynonymAntonymColoring = async (options: GeneratorOptions): Promise<SynonymAntonymColoringData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Görsel Boyama (Eş/Zıt Anlamlı)', prompt: 'Doğru eş/zıt anlamlı kelimeyi bularak resmi boyayın.', colorKey: [], wordsOnImage: [] });
}
export const generateOfflinePunctuationPhoneNumber = async (options: GeneratorOptions): Promise<PunctuationPhoneNumberData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Bul Bakalım (Telefon Numarası)', prompt: 'Noktalama ipuçlarını çözerek gizli telefon numarasını bulun.', instruction: '', clues: [], solution: [] });
}
export const generateOfflineThematicJumbledWordStory = async (options: GeneratorOptions): Promise<ThematicJumbledWordStoryData[]> => {
    const res = await generateOfflineJumbledWordStory(options);
    return res.map(r => ({...r, title: 'Kelime Bulma ve Metin Yazma'}));
}
export const generateOfflineSynonymMatchingPattern = async (options: GeneratorOptions): Promise<SynonymMatchingPatternData[]> => {
    const {itemCount, worksheetCount, theme} = options;
    return Array(worksheetCount).fill({title: 'Desen Bulmaca (Eş Anlamlı)', prompt: 'Tematik kelimelerin eş anlamlılarını bularak eşleştirin.', theme: theme || 'Rastgele', pairs: getRandomItems(TR_VOCAB.synonyms, itemCount)});
}
export const generateOfflineFutoshiki = async (options: GeneratorOptions): Promise<FutoshikiData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Futoşiki', prompt: 'Büyüktür/küçüktür sembollerine göre sayıları yerleştirin.', puzzles: [] });
}
export const generateOfflineNumberPyramid = async (options: GeneratorOptions): Promise<NumberPyramidData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const results: NumberPyramidData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const pyramids = Array.from({ length: itemCount }).map((_, index) => {
            let rowsCount = 4;
            if (difficulty === 'Başlangıç') rowsCount = 3;
            if (difficulty === 'Zor' || difficulty === 'Uzman') rowsCount = 5;

            const fullPyramid: number[][] = [];
            const baseRow = Array.from({ length: rowsCount }, () => getRandomInt(1, 10));
            fullPyramid.push(baseRow);
            for (let r = 1; r < rowsCount; r++) {
                const prevRow = fullPyramid[r - 1];
                const newRow = [];
                for (let c = 0; c < prevRow.length - 1; c++) {
                    newRow.push(prevRow[c] + prevRow[c + 1]);
                }
                fullPyramid.push(newRow);
            }

            const puzzlePyramid: (number | null)[][] = fullPyramid.map(row => [...row]);
            let emptyCount = 3 + (difficulty === 'Orta' ? 2 : difficulty === 'Zor' ? 4 : difficulty === 'Uzman' ? 6 : 0);
            
            for (let k = 0; k < emptyCount; k++) {
                const r = getRandomInt(0, puzzlePyramid.length - 1);
                if(puzzlePyramid[r]?.length > 0) {
                   const c = getRandomInt(0, puzzlePyramid[r].length - 1);
                   if (puzzlePyramid.flat().filter(cell => cell !== null).length > 2) {
                       puzzlePyramid[r][c] = null;
                   }
                }
            }
            return { title: `Piramit ${index + 1}`, rows: puzzlePyramid.reverse() };
        });
        results.push({ title: 'Sihirli Piramit (Toplama)', prompt: 'Her sayı, altındaki iki sayının toplamıdır. Boşlukları doldurun.', pyramids });
    }
    return results;
}
export const generateOfflineNumberCapsule = async (options: GeneratorOptions): Promise<NumberCapsuleData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Kapsül Oyunu', prompt: 'Tek ve çift sayılarla toplama yaparak kapsülleri doldurun.', puzzles: [] });
}
export const generateOfflineOddEvenSudoku = async (options: GeneratorOptions): Promise<OddEvenSudokuData[]> => {
    const {itemCount, worksheetCount, difficulty} = options;
    const results: OddEvenSudokuData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const puzzles = Array.from({length: itemCount}).map((_, idx) => {
            const grid = generateSudokuGrid(6, difficulty);
            const constrainedCells = [];
            for(let r=0; r<6; r++) for(let c=0; c<6; c++){
                if(grid[r][c] === null && Math.random() > 0.5) constrainedCells.push({row:r, col: c});
            }
            return {
                title: `Bulmaca ${idx+1}`,
                numbersToUse: '1-6',
                grid,
                constrainedCells
            }
        });
        results.push({title: 'Tek-Çift Sudoku', prompt: 'Gri kutulara çift sayı, beyazlara tek sayı gelmelidir.', puzzles});
    }
    return results;
}
export const generateOfflineSudoku6x6Shaded = async (options: GeneratorOptions): Promise<Sudoku6x6ShadedData[]> => {
    const res = await generateOfflineOddEvenSudoku(options);
    return res.map(r => ({
        ...r, 
        title: '6x6 Tek-Çift Sudoku', 
        puzzles: r.puzzles.map(p => ({grid: p.grid, shadedCells: p.constrainedCells}))
    }));
}
export const generateOfflineRomanNumeralConnect = async (options: GeneratorOptions): Promise<RomanNumeralConnectData[]> => {
    return Array(options.worksheetCount).fill({ title: 'ABC Bağlama (Romen Rakamlı)', prompt: 'Aynı Romen rakamlarını yolları kesişmeyecek şekilde birleştirin.', puzzles: [] });
}
export const generateOfflineRomanNumeralStarHunt = async (options: GeneratorOptions): Promise<RomanNumeralStarHuntData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Yıldız Avı (Romen Rakamlı)', prompt: 'Romen rakamlarını ipucu olarak kullanarak yıldızları bulun.', grid: [[]], starCount: 0 });
}
export const generateOfflineRoundingConnect = async (options: GeneratorOptions): Promise<RoundingConnectData[]> => {
     return Array(options.worksheetCount).fill({ title: 'ABC Bağlamaca (Yuvarlama)', prompt: 'Aynı değere yuvarlanan sayıları birbirine bağlayın.', example: '', numbers: [] });
}
export const generateOfflineRomanNumeralMultiplication = async (options: GeneratorOptions): Promise<RomanNumeralMultiplicationData[]> => {
     return Array(options.worksheetCount).fill({ title: 'İşlem Karesi (Romen Rakamlı)', prompt: 'Çarpma işlemi yaparak işlem karesindeki boşlukları doldurun.', puzzles: [] });
}
export const generateOfflineArithmeticConnect = async (options: GeneratorOptions): Promise<ArithmeticConnectData[]> => {
     return Array(options.worksheetCount).fill({ title: 'ABC Bağlamaca (İşlemler)', prompt: 'Aynı sonucu veren işlemleri birbirine bağlayın.', example: '', expressions: [] });
}
export const generateOfflineRomanArabicMatchConnect = async (options: GeneratorOptions): Promise<RomanArabicMatchConnectData[]> => {
     return Array(options.worksheetCount).fill({ title: 'ABC Bağlama (Romen Rakamı)', prompt: 'Romen rakamlarını normal sayılarla eşleştirin.', gridDim: 6, points: [] });
}
export const generateOfflineKendoku = async (options: GeneratorOptions): Promise<KendokuData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Kendoku', prompt: 'İşlem ipuçlarını kullanarak mantık bulmacasını çözün.', puzzles: [] });
}
export const generateOfflineDivisionPyramid = async (options: GeneratorOptions): Promise<DivisionPyramidData[]> => {
    // FIX: Passed the full options object to 'generateOfflineNumberPyramid' to satisfy TypeScript's requirement for all properties of 'GeneratorOptions'.
    const res = await generateOfflineNumberPyramid(options);
    return res.map(p => ({
        title: 'Sihirli Piramit (Bölme)',
        prompt: 'Her sayı, üstündeki iki sayının bölümüdür. Boşlukları doldurun.',
        pyramids: p.pyramids.map(py => ({rows: py.rows}))
    }))
}
export const generateOfflineMultiplicationPyramid = async (options: GeneratorOptions): Promise<MultiplicationPyramidData[]> => {
    // FIX: Passed the full options object to 'generateOfflineNumberPyramid' to satisfy TypeScript's requirement for all properties of 'GeneratorOptions'.
    const res = await generateOfflineNumberPyramid(options);
    return res.map(p => ({
        title: 'Sihirli Piramit (Çarpma)',
        prompt: 'Her sayı, altındaki iki sayının çarpımıdır. Boşlukları doldurun.',
        pyramids: p.pyramids.map(py => ({rows: py.rows}))
    }))
}
export const generateOfflineOperationSquareSubtraction = async (options: GeneratorOptions): Promise<OperationSquareSubtractionData[]> => {
     return Array(options.worksheetCount).fill({ title: 'İşlem Karesi (Çıkarma)', prompt: 'Çıkarma işlemleri yaparak işlem karesini tamamlayın.', puzzles: [] });
}
export const generateOfflineOperationSquareFillIn = async (options: GeneratorOptions): Promise<OperationSquareFillInData[]> => {
     return Array(options.worksheetCount).fill({ title: 'İşlem Karesi (Yerleştirme)', prompt: 'Verilen sayıları işlem karesine doğru şekilde yerleştirin.', puzzles: [] });
}
export const generateOfflineMultiplicationWheel = async (options: GeneratorOptions): Promise<MultiplicationWheelData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Çarpım Çarkı', prompt: 'Sayıları yerleştirerek çarpım çarkını tamamlayın.', puzzles: [] });
}
export const generateOfflineTargetNumber = async (options: GeneratorOptions): Promise<TargetNumberData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Hedef Sayı', prompt: 'Verilen sayılarla dört işlem yaparak hedef sayıya ulaşın.', puzzles: [] });
}
export const generateOfflineOperationSquareMultDiv = async (options: GeneratorOptions): Promise<OperationSquareMultDivData[]> => {
     return Array(options.worksheetCount).fill({ title: 'İşlem Karesi (Çarpma/Bölme)', prompt: 'Çarpma ve bölme işlemleri yaparak işlem karesini tamamlayın.', puzzles: [] });
}
export const generateOfflineShapeSudoku = async (options: GeneratorOptions): Promise<ShapeSudokuData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Şekilli Sudoku', prompt: 'Her satır, sütun ve bölgede şekilleri tekrar etmeden yerleştirin.', puzzles: [] });
}
export const generateOfflineWeightConnect = async (options: GeneratorOptions): Promise<WeightConnectData[]> => {
     return Array(options.worksheetCount).fill({ title: 'ABC Bağlama (Ağırlık)', prompt: 'Birbirine eşit olan ağırlıkları çizgilerle birleştirin.', gridDim: 6, points: [] });
}
export const generateOfflineResfebe = async (options: GeneratorOptions): Promise<ResfebeData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Resfebe', prompt: 'Resim ve harflerle kelime türetme oyunu.', puzzles: [{clues: [{type: 'text', value: 'C'}], answer: 'ce'}] });
}
export const generateOfflineFutoshikiLength = async (options: GeneratorOptions): Promise<FutoshikiLengthData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Futoşiki (Uzunluk)', prompt: 'Uzunluk ölçü birimlerini büyüktür/küçüktür işaretlerine göre yerleştirin.', puzzles: [] });
}
export const generateOfflineMatchstickSymmetry = async (options: GeneratorOptions): Promise<MatchstickSymmetryData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Kibrit İşlemleri (Simetri)', prompt: 'Kibritlerle yapılmış şeklin simetriğini çizin.', puzzles: [] });
}
export const generateOfflineWordWeb = async (options: GeneratorOptions): Promise<WordWebData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Kelime Ağı', prompt: 'Verilen kelimeleri bulmaca ızgarasına yerleştirin.', wordsToFind: [], grid: [[]], keyWordPrompt: '' });
}
export const generateOfflineStarHunt = async (options: GeneratorOptions): Promise<StarHuntData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Yıldız Avı (Geometrik Cisimler)', prompt: 'Yıldız sayısına göre doğru geometrik cismi bulun.', grid: [[]] });
}
export const generateOfflineLengthConnect = async (options: GeneratorOptions): Promise<LengthConnectData[]> => {
     return Array(options.worksheetCount).fill({ title: 'ABC Bağlama (Uzunluk)', prompt: 'Birbirine eşit olan uzunluk ölçülerini birleştirin.', gridDim: 6, points: [] });
}
export const generateOfflineVisualNumberPattern = async (options: GeneratorOptions): Promise<VisualNumberPatternData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Görsel Sayı Örüntüsü', prompt: 'Görsel dizideki kuralı bulup eksik sayıyı tamamlayın.', puzzles: [] });
}
export const generateOfflineMissingParts = async (options: GeneratorOptions): Promise<MissingPartsData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Eksik Kelimeler (Eşleştirme)', prompt: 'Kelime parçalarını doğru şekilde birleştirin.', leftParts: [], rightParts: [], givenParts: [] });
}
export const generateOfflineProfessionConnect = async (options: GeneratorOptions): Promise<ProfessionConnectData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Kelime Bağlama (Meslekler)', prompt: 'Meslekleri ilgili görsellerle eşleştirin.', gridDim: 6, points: [] });
}
export const generateOfflineVisualOddOneOutThemed = async (options: GeneratorOptions): Promise<VisualOddOneOutThemedData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Farklı Özelliği Bulma (Tematik)', prompt: 'Her meslek grubunda, konuyla ilgisiz olan görseli bulun.', rows: [] });
}
export const generateOfflineLogicGridPuzzle = async (options: GeneratorOptions): Promise<LogicGridPuzzleData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Zekâ Sorusu (Mantık Tablosu)', prompt: 'Verilen ipuçlarını kullanarak mantık tablosunu doldurun.', clues: [], people: [], categories: [] });
}
export const generateOfflineImageAnagramSort = async (options: GeneratorOptions): Promise<ImageAnagramSortData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Kart Sıralama (Anagram)', prompt: 'Görsellerle eşleşen karışık kelimeleri çözüp sıralayın.', cards: [] });
}
export const generateOfflineAnagramImageMatch = async (options: GeneratorOptions): Promise<AnagramImageMatchData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Resim - Kelime Eşleme (Anagram)', prompt: 'Karışık kelimeleri çözüp ilgili görsellerle eşleştirin.', wordBank: [], puzzles: [] });
}
export const generateOfflineSyllableWordSearch = async (options: GeneratorOptions): Promise<SyllableWordSearchData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Eksik Kelimeler ve Bulmaca', prompt: 'Hecelerle kelimeler oluşturun ve kelime avında bulun.', syllablesToCombine: [], wordsToCreate: [], wordsToFindInSearch: [], grid: [[]], passwordPrompt: '' });
}
export const generateOfflineWordSearchWithPassword = async (options: GeneratorOptions): Promise<WordSearchWithPasswordData[]> => {
    const res = await generateOfflineWordSearch(options);
    return res.map(r => ({...r, title: 'Şifreli Kelime Avı', prompt: 'Şifreyi bul.', passwordCells: [{row:1, col:1}]}));
}
export const generateOfflineWordWebWithPassword = async (options: GeneratorOptions): Promise<WordWebWithPasswordData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Kelime Ağı (Şifreli)', prompt: 'Kelimeleri yerleştirin ve renkli sütundan şifreyi bulun.', words: [], grid: [[]], passwordColumnIndex: 0 });
}
export const generateOfflineLetterGridWordFind = async (options: GeneratorOptions): Promise<LetterGridWordFindData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Kelime Bulma (Tablo)', prompt: 'Harf tablosunda gizlenmiş kelimeleri bulun ve metin yazın.', words: [], grid: [[]], writingPrompt: '' });
}
export const generateOfflineWordPlacementPuzzle = async (options: GeneratorOptions): Promise<WordPlacementPuzzleData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Kelime Yerleştirme', prompt: 'Verilen kelimeleri harf sayısına göre bulmaca diyagramına yerleştirin.', grid: [[]], wordGroups: [], unusedWordPrompt: '' });
}
export const generateOfflinePositionalAnagram = async (options: GeneratorOptions): Promise<PositionalAnagramData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Yer Değiştirmeli Anagram', prompt: 'Numaralı kutucuklardaki harflerin yerlerini değiştirerek kelimeler bulun.', puzzles: [] });
}
export const generateOfflineThematicOddOneOut = async (options: GeneratorOptions): Promise<ThematicOddOneOutData[]> => {
    const { itemCount, worksheetCount, theme } = options;
    const results: ThematicOddOneOutData[] = [];
    const validCategories = Object.keys(TR_VOCAB).filter(k => Array.isArray((TR_VOCAB as any)[k]) && typeof (TR_VOCAB as any)[k][0] === 'string' && !k.endsWith('_words') && !k.includes('confusing'));

    for (let i = 0; i < worksheetCount; i++) {
        const actualTheme = (theme && theme !== 'Rastgele' && validCategories.includes(theme.toLowerCase())) ? theme.toLowerCase() : getRandomItems(validCategories, 1)[0];
        const otherCategory = getRandomItems(validCategories.filter(c => c !== actualTheme), 1)[0];

        const rows = Array.from({ length: itemCount }).map(() => {
// FIX: Added explicit type casting to '(TR_VOCAB as any)[...] as string[]' to resolve a TypeScript inference issue where the array type was being inferred as 'unknown[]'.
            const themeWords = getRandomItems((TR_VOCAB as any)[actualTheme] as string[], 3);
            const oddWord = getRandomItems((TR_VOCAB as any)[otherCategory] as string[], 1)[0];
            return { words: shuffle([...themeWords, oddWord]), oddWord };
        });

        results.push({
            title: `Tematik Farklı Olanı Bul`,
            prompt: `Her satırda '${actualTheme}' temasına uymayan kelimeyi bulun.`,
            theme: actualTheme,
            rows,
            sentencePrompt: "Bulduğun farklı kelimelerle bir cümle yaz."
        });
    }
    return results;
};

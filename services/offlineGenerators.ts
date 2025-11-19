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
const generateSudokuGrid = (size: number = 6): (number | null)[][] => {
    const grid = Array.from({ length: size }, () => Array(size).fill(null));
    const base = shuffle(Array.from({length: size}, (_, i) => i + 1));
    
    // Basit bir latin karesi oluşturma (tam Sudoku değil, hızlı mod için)
    for(let r=0; r<size; r++) {
        for(let c=0; c<size; c++) {
            grid[r][c] = base[(c + Math.floor(r/Math.sqrt(size))*Math.sqrt(size) + r) % size];
        }
    }
    
    // Hücreleri boşalt
    const emptyCount = Math.floor(size * size * 0.6); // %60 boşalt
    for(let i=0; i<emptyCount; i++) {
        let r, c;
        do {
            r = getRandomInt(0, size-1);
            c = getRandomInt(0, size-1);
        } while (grid[r][c] === null);
        grid[r][c] = null;
    }
    
    return grid as (number | null)[][];
};


// Helper to combine vocab based on difficulty
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

    return [...new Set(shuffle(filteredPool))]; // Ensure unique words
};

// --- Generator Functions ---

export const generateOfflineWordSearch = async (options: GeneratorOptions): Promise<WordSearchData[]> => {
    const { topic, itemCount, difficulty, worksheetCount } = options;
    const results: WordSearchData[] = [];
    let size = options.gridSize || (difficulty === 'Orta' ? 12 : (difficulty === 'Zor' ? 14 : 10));

    for (let i = 0; i < worksheetCount; i++) {
        const availableWords = getWordsForDifficulty(difficulty, topic);
        const sheetWords = getRandomItems(availableWords, itemCount);
        const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
        const placedWords: string[] = [];
        
        sheetWords.forEach(word => {
            if (word.length > size) return;
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 50) {
                const dir = Math.random() > 0.5 ? 'H' : 'V';
                const r = getRandomInt(0, size - (dir === 'V' ? word.length : 1));
                const c = getRandomInt(0, size - (dir === 'H' ? word.length : 1));
                
                let fits = true;
                for(let k=0; k<word.length; k++) {
                    const nr = dir === 'V' ? r+k : r;
                    const nc = dir === 'H' ? c+k : c;
                    if(grid[nr][nc] !== '' && grid[nr][nc] !== word[k]) fits = false;
                }
                
                if(fits) {
                    for(let k=0; k<word.length; k++) {
                         const nr = dir === 'V' ? r+k : r;
                         const nc = dir === 'H' ? c+k : c;
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

            if (op === '+') {
                answer = val1 + val2;
            } else if (op === '-') {
                if (val1 < val2) { [val1, val2] = [val2, val1]; problemStr = `${currentObjects[idx2]} ${op} ${currentObjects[idx1]} = ?`; }
                answer = val1 - val2;
            } else if (op === '*') {
                answer = val1 * val2;
            } else if (op === '/') {
                if (val2 === 0) val2 = 1;
                const product = val1 * val2;
                problemStr = `${product} ${op} ${val2} = ?`;
                question = `İpucu: ${currentObjects[0]}=?, ${currentObjects[1]}=?, ${currentObjects[2]}=?`;
                problemStr = `❓ ${op} ${currentObjects[idx2]} = ${currentObjects[idx1]}`;
                question = `Eğer ${currentObjects[idx2]}=${val2} ve ${currentObjects[idx1]}=${val1} ise ❓ kaçtır?`;
                answer = product;
            }
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

            if(difficulty === 'Başlangıç' && chars.length > 1) {
                [chars[0], chars[chars.length - 1]] = [chars[chars.length - 1], chars[0]];
                differentWord = chars.join('');
            } else if (difficulty === 'Orta' && chars.length > 2) {
                const pos = getRandomInt(1, chars.length - 2);
                chars[pos] = turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)];
                differentWord = chars.join('');
            } else { // Zor & Uzman
                if (baseWord.includes('b')) differentWord = baseWord.replace('b', 'd');
                else if (baseWord.includes('d')) differentWord = baseWord.replace('d', 'b');
                else if (baseWord.includes('p')) differentWord = baseWord.replace('p', 'q');
                else if (baseWord.includes('q')) differentWord = baseWord.replace('q', 'p');
                else if (chars.length > 1) { // Fallback for other words
                    const pos = getRandomInt(0, chars.length - 1);
                    chars[pos] = getRandomItems(turkishAlphabet.split('').filter(c => c !== chars[pos]), 1)[0];
                    differentWord = chars.join('');
                } else {
                    differentWord = baseWord + 'a';
                }
            }
            if (!differentWord || differentWord === baseWord) differentWord = baseWord + 'x'; // Ensure differentWord is not empty and actually different

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
        
        const allNumbers = shuffle([...numbersToFind, ...distractors]);

        results.push({
            title: `Sayı Avı (${difficulty})`,
            numbers: allNumbers,
            range: range
        });
    }
    return results;
};

export const generateOfflineStoryComprehension = async (options: GeneratorOptions): Promise<StoryData[]> => {
    const { worksheetCount, topic, difficulty, characterName } = options;
    const results: StoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const template = getRandomItems(STORY_TEMPLATES, 1)[0];
        let story = template.template
            .replace('{place}', getRandomItems(template.places, 1)[0])
            .replace(/{character}/g, characterName || getRandomItems(template.characters, 1)[0])
            .replace('{activity}', getRandomItems(template.activities, 1)[0])
            .replace('{object}', getRandomItems(template.objects, 1)[0]);
        
        const questions = Array.from({ length: 3 }).map(() => {
            const wordPool = story.split(' ').filter(w => w.length > 3);
            const answer = getRandomItems(wordPool, 1)[0] || "cevap";
            const options = shuffle([answer, getRandomItems(getWordsForDifficulty(difficulty, topic), 1)[0] || "yanlış1", getRandomItems(getWordsForDifficulty(difficulty, topic), 1)[0] || "yanlış2"]);
            return {
                question: `Hikayede geçen kelimelerden hangisi aşağıdadır?`,
                options,
                answerIndex: options.indexOf(answer)
            };
        });

        results.push({
            title: `Hikaye Anlama (${topic || 'Rastgele'})`,
            story,
            questions
        });
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
    // Basic implementation, will be expanded
    return [{ title: 'Sayı Örüntüsü', patterns: [{ sequence: '2, 4, 6, ?', answer: '8' }] }];
};

export const generateOfflineSpellingCheck = async (options: GeneratorOptions): Promise<SpellingCheckData[]> => {
    const { itemCount, worksheetCount, difficulty, topic } = options;
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

export const generateOfflineLetterGridTest = async (options: GeneratorOptions): Promise<LetterGridTestData[]> => {
    return [{ title: 'Harf Izgara Testi', grid: [['a', 'b'], ['c', 'd']], targetLetters: ['b', 'd'] }];
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
    const {itemCount, worksheetCount, topic} = options;
    const results: OddOneOutData[] = [];
    const animalPool = getWordsForDifficulty('Orta', 'animals');
    const fruitPool = getWordsForDifficulty('Orta', 'fruits_veggies');

     for(let i=0; i < worksheetCount; i++){
        const groups = Array.from({length: itemCount}).map(() => {
            const groupType = Math.random() > 0.5 ? 'animal' : 'fruit';
            const goodWords = getRandomItems(groupType === 'animal' ? animalPool : fruitPool, 3);
            const badWord = getRandomItems(groupType !== 'animal' ? animalPool : fruitPool, 1);
            return { words: shuffle([...goodWords, ...badWord]) };
        });
        results.push({title: 'Farklı Olanı Bul', groups})
     }
    return results;
}

// Add empty function shells for all remaining types to prevent crashes
const createPlaceholder = <T>(title: string): () => Promise<T[]> => {
    return async () => [{ title, prompt: "Bu etkinlik için hızlı mod henüz tam olarak desteklenmiyor.", puzzles: [] } as any];
};

export const generateOfflineWordMemory = createPlaceholder<WordMemoryData>("Kelime Hafıza");
export const generateOfflineStoryCreationPrompt = createPlaceholder<StoryCreationPromptData>("Hikaye Oluşturma");
export const generateOfflineWordComparison = createPlaceholder<WordComparisonData>("Kelime Karşılaştırma");
export const generateOfflineWordsInStory = createPlaceholder<WordsInStoryData>("Metindeki Kelimeler");
export const generateOfflineShapeMatching = createPlaceholder<ShapeMatchingData>("Şekil Eşleştirme");
export const generateOfflineSymbolCipher = createPlaceholder<SymbolCipherData>("Şifre Çözme");
export const generateOfflineLetterBridge = createPlaceholder<LetterBridgeData>("Harf Köprüsü");
export const generateOfflineFindTheDuplicateInRow = createPlaceholder<FindDuplicateData>("İkiliyi Bul");
export const generateOfflineWordLadder = createPlaceholder<WordLadderData>("Kelime Merdiveni");
export const generateOfflineFindIdenticalWord = createPlaceholder<FindIdenticalWordData>("Aynısını Bul");
export const generateOfflineWordFormation = createPlaceholder<WordFormationData>("Harflerden Kelime Türetme");
export const generateOfflineReverseWord = createPlaceholder<ReverseWordData>("Ters Oku");
export const generateOfflineFindLetterPair = createPlaceholder<FindLetterPairData>("Harf İkilisini Bul");
export const generateOfflineWordGrouping = createPlaceholder<WordGroupingData>("Gruplama");
export const generateOfflineStoryAnalysis = createPlaceholder<StoryAnalysisData>("Hikaye Analizi");
export const generateOfflineCoordinateCipher = createPlaceholder<CoordinateCipherData>("Gizemli Bulmaca");
export const generateOfflineProverbSearch = createPlaceholder<ProverbSearchData>("Atasözü Avı");
export const generateOfflineTargetSearch = createPlaceholder<TargetSearchData>("Dikkatli Göz");
export const generateOfflineShapeNumberPattern = createPlaceholder<ShapeNumberPatternData>("Şekilli Sayı Örüntüsü");
export const generateOfflineGridDrawing = createPlaceholder<GridDrawingData>("Ayna Çizimi");
export const generateOfflineStorySequencing = createPlaceholder<StorySequencingData>("Hikaye Sıralama");
export const generateOfflineChaoticNumberSearch = createPlaceholder<ChaoticNumberSearchData>("Sayıları Bulma");
export const generateOfflineBlockPainting = createPlaceholder<BlockPaintingData>("Blok Boyama");
export const generateOfflineMiniWordGrid = createPlaceholder<MiniWordGridData>("Mini Kelime Bulmaca");
export const generateOfflineShapeCounting = createPlaceholder<ShapeCountingData>("Şekil Sayma");
export const generateOfflineSymmetryDrawing = createPlaceholder<SymmetryDrawingData>("Simetri Çizimi");
export const generateOfflineBurdonTest = createPlaceholder<LetterGridTestData>("Burdon Testi");
export const generateOfflineFindDifferentString = createPlaceholder<FindDifferentStringData>("Farklı Diziyi Bul");
export const generateOfflineDotPainting = createPlaceholder<DotPaintingData>("Nokta Boyama");
export const generateOfflineAbcConnect = createPlaceholder<AbcConnectData>("ABC Bağlama");
export const generateOfflinePasswordFinder = createPlaceholder<PasswordFinderData>("Şifre Bul");
export const generateOfflineSyllableCompletion = createPlaceholder<SyllableCompletionData>("Hece Tamamlama");
export const generateOfflineSynonymWordSearch = createPlaceholder<SynonymWordSearchData>("Eş Anlamlı Kelime Avı");
export const generateOfflineWordConnect = createPlaceholder<WordConnectData>("Kelime Bağlama");
export const generateOfflineSpiralPuzzle = createPlaceholder<SpiralPuzzleData>("Sarmal Bulmaca");
export const generateOfflineCrossword = createPlaceholder<CrosswordData>("Çapraz Bulmaca");
export const generateOfflineJumbledWordStory = createPlaceholder<JumbledWordStoryData>("Karışık Kelime Hikayesi");
export const generateOfflineWordGridPuzzle = createPlaceholder<WordGridPuzzleData>("Kelime Ağı");
export const generateOfflineProverbSayingSort = createPlaceholder<ProverbSayingSortData>("Atasözü/Özdeyiş Sıralama");
export const generateOfflineAntonymFlowerPuzzle = createPlaceholder<AntonymFlowerPuzzleData>("Zıt Anlamlı Çiçek");
export const generateOfflineProverbWordChain = createPlaceholder<ProverbWordChainData>("Atasözü Zinciri");
export const generateOfflineSynonymAntonymGrid = createPlaceholder<SynonymAntonymGridData>("Eş/Zıt Anlamlı Tablosu");
export const generateOfflinePunctuationColoring = createPlaceholder<PunctuationColoringData>("Noktalama Boyama");
export const generateOfflinePunctuationMaze = createPlaceholder<PunctuationMazeData>("Noktalama Labirenti");
export const generateOfflineThematicWordSearchColor = createPlaceholder<ThematicWordSearchColorData>("Tematik Renkli Kelime Avı");
export const generateOfflineThematicOddOneOutSentence = createPlaceholder<ThematicOddOneOutSentenceData>("Tematik Farklı Olan Cümle");
export const generateOfflineProverbSentenceFinder = createPlaceholder<ProverbSentenceFinderData>("Atasözü Cümle Bulma");
export const generateOfflineSynonymSearchAndStory = createPlaceholder<SynonymSearchAndStoryData>("Eş Anlamlı Bul ve Yaz");
export const generateOfflineColumnOddOneOutSentence = createPlaceholder<ColumnOddOneOutSentenceData>("Sütunda Farklı Olan Cümle");
export const generateOfflineSynonymAntonymColoring = createPlaceholder<SynonymAntonymColoringData>("Eş/Zıt Anlamlı Boyama");
export const generateOfflinePunctuationPhoneNumber = createPlaceholder<PunctuationPhoneNumberData>("Noktalama Telefon No");
export const generateOfflinePunctuationSpiralPuzzle = createPlaceholder<PunctuationSpiralPuzzleData>("Noktalama Sarmal Bulmaca");
export const generateOfflineThematicJumbledWordStory = createPlaceholder<ThematicJumbledWordStoryData>("Tematik Karışık Kelime Hikaye");
export const generateOfflineSynonymMatchingPattern = createPlaceholder<SynonymMatchingPatternData>("Eş Anlamlı Desen Eşleştirme");
export const generateOfflineFutoshiki = createPlaceholder<FutoshikiData>("Futoşiki");
export const generateOfflineNumberPyramid = createPlaceholder<NumberPyramidData>("Sayı Piramidi");
export const generateOfflineNumberCapsule = createPlaceholder<NumberCapsuleData>("Sayı Kapsülü");
export const generateOfflineOddEvenSudoku = createPlaceholder<OddEvenSudokuData>("Tek-Çift Sudoku");
export const generateOfflineRomanNumeralConnect = createPlaceholder<RomanNumeralConnectData>("Romen Rakamı Bağlama");
export const generateOfflineRomanNumeralStarHunt = createPlaceholder<RomanNumeralStarHuntData>("Romen Rakamlı Yıldız Avı");
export const generateOfflineRoundingConnect = createPlaceholder<RoundingConnectData>("Yuvarlama Bağlama");
export const generateOfflineRomanNumeralMultiplication = createPlaceholder<RomanNumeralMultiplicationData>("Romen Rakamlı Çarpma");
export const generateOfflineArithmeticConnect = createPlaceholder<ArithmeticConnectData>("Aritmetik Bağlama");
export const generateOfflineRomanArabicMatchConnect = createPlaceholder<RomanArabicMatchConnectData>("Romen-Arap Rakam Eşleştirme");
export const generateOfflineSudoku6x6Shaded = createPlaceholder<Sudoku6x6ShadedData>("6x6 Gölgeli Sudoku");
export const generateOfflineKendoku = createPlaceholder<KendokuData>("Kendoku");
export const generateOfflineDivisionPyramid = createPlaceholder<DivisionPyramidData>("Bölme Piramidi");
export const generateOfflineMultiplicationPyramid = createPlaceholder<MultiplicationPyramidData>("Çarpma Piramidi");
export const generateOfflineOperationSquareSubtraction = createPlaceholder<OperationSquareSubtractionData>("Çıkarma İşlem Karesi");
export const generateOfflineOperationSquareFillIn = createPlaceholder<OperationSquareFillInData>("İşlem Karesi Doldurma");
export const generateOfflineMultiplicationWheel = createPlaceholder<MultiplicationWheelData>("Çarpım Çarkı");
export const generateOfflineTargetNumber = createPlaceholder<TargetNumberData>("Hedef Sayı");
export const generateOfflineOperationSquareMultDiv = createPlaceholder<OperationSquareMultDivData>("Çarpma/Bölme İşlem Karesi");
export const generateOfflineShapeSudoku = createPlaceholder<ShapeSudokuData>("Şekilli Sudoku");
export const generateOfflineWeightConnect = createPlaceholder<WeightConnectData>("Ağırlık Bağlama");
export const generateOfflineFutoshikiLength = createPlaceholder<FutoshikiLengthData>("Futoşiki Uzunluk");
export const generateOfflineMatchstickSymmetry = createPlaceholder<MatchstickSymmetryData>("Kibrit Simetrisi");
export const generateOfflineWordWeb = createPlaceholder<WordWebData>("Kelime Ağı");
export const generateOfflineStarHunt = createPlaceholder<StarHuntData>("Yıldız Avı");
export const generateOfflineLengthConnect = createPlaceholder<LengthConnectData>("Uzunluk Bağlama");
export const generateOfflineVisualNumberPattern = createPlaceholder<VisualNumberPatternData>("Görsel Sayı Örüntüsü");
export const generateOfflineMissingParts = createPlaceholder<MissingPartsData>("Eksik Parçalar");
export const generateOfflineWordSearchWithPassword = createPlaceholder<WordSearchWithPasswordData>("Şifreli Kelime Avı");
export const generateOfflineWordWebWithPassword = createPlaceholder<WordWebWithPasswordData>("Şifreli Kelime Ağı");
export const generateOfflineLetterGridWordFind = createPlaceholder<LetterGridWordFindData>("Harf Tablosunda Kelime Bulma");
export const generateOfflineWordPlacementPuzzle = createPlaceholder<WordPlacementPuzzleData>("Kelime Yerleştirme");
export const generateOfflinePositionalAnagram = createPlaceholder<PositionalAnagramData>("Konumsal Anagram");

// --- VISUAL OFFLINE GENERATORS ---

export const generateOfflineVisualMemory = async (options: GeneratorOptions): Promise<VisualMemoryData[]> => {
    const { itemCount, worksheetCount, memorizeRatio } = options;
    const results: VisualMemoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const memorizeCount = Math.floor(itemCount * ((memorizeRatio || 50) / 100));
        const allItems = getRandomItems(EMOJIS, itemCount);
        const itemsToMemorize = allItems.slice(0, memorizeCount);
        const testItems = shuffle(allItems);
        results.push({
            title: 'Görsel Hafıza (Hızlı Mod)',
            memorizeTitle: 'Bunları Aklında Tut',
            testTitle: 'Aklında Tuttuklarını İşaretle',
            itemsToMemorize,
            testItems,
        });
    }
    return results;
};

export const generateOfflineCharacterMemory = async (options: GeneratorOptions): Promise<CharacterMemoryData[]> => {
    const { itemCount, worksheetCount, memorizeRatio } = options;
    const results: CharacterMemoryData[] = [];
    const itemPool = TR_VOCAB.easy_words.concat(TR_VOCAB.animals);

    for (let i = 0; i < worksheetCount; i++) {
        const memorizeCount = Math.floor(itemCount * ((memorizeRatio || 50) / 100));
        const allChars = getRandomItems([...new Set(itemPool)], itemCount).map(item => {
            const color = getRandomItems(COLORS, 1)[0];
            const emoji = getRandomItems(EMOJIS, 1)[0];
            return { description: `${color.name} ${item} ${emoji}` };
        });
        
        const charactersToMemorize = allChars.slice(0, memorizeCount);
        const testCharacters = shuffle(allChars);

        results.push({
            title: 'Karakter Hafıza (Hızlı Mod)',
            memorizeTitle: 'Bu Karakterleri Hafızanda Tut',
            testTitle: 'Hafızandaki Karakterleri İşaretle',
            charactersToMemorize,
            testCharacters,
        });
    }
    return results;
};


export const generateOfflineImageComprehension = async (options: GeneratorOptions): Promise<ImageComprehensionData[]> => {
    const results: ImageComprehensionData[] = [];
    for (let i = 0; i < options.worksheetCount; i++) {
        const scene = {
            description: "Parkta yeşil bir ağacın 🌳 altında kırmızı bir top ⚽ var. Yanında iki tane kuş 🐦 duruyor. Gökyüzü mavi 🔵 ve güneş ☀️ parlıyor.",
            questions: ["Top ne renk?", "Kaç tane kuş var?", "Güneş parlıyor mu?"]
        };
        results.push({
            title: 'Resim Anlama (Hızlı Mod)',
            memorizeTitle: 'Sahneyi İncele',
            testTitle: 'Soruları Yanıtla',
            sceneDescription: scene.description,
            questions: scene.questions
        });
    }
    return results;
};

export const generateOfflineHomonymImageMatch = async (options: GeneratorOptions): Promise<HomonymImageMatchData[]> => {
    const homonymMap: { [key: string]: { description: string, emoji: string }[] } = {
        'yüz': [{ description: 'sayı', emoji: '💯' }, { description: 'surat', emoji: '😊' }, { description: 'yüzmek', emoji: '🏊' }],
        'çay': [{ description: 'içecek', emoji: '🍵' }, { description: 'akarsu', emoji: '🏞️' }],
        'at': [{ description: 'hayvan', emoji: '🐎' }, { description: 'eylem', emoji: '🎯' }],
        'gül': [{ description: 'çiçek', emoji: '🌹' }, { description: 'gülmek', emoji: '😄' }],
    };
    const results: HomonymImageMatchData[] = [];
    for (let i = 0; i < options.worksheetCount; i++) {
        const homonym = getRandomItems(Object.keys(homonymMap), 1)[0];
        const meanings = getRandomItems(homonymMap[homonym], 2);
        
        const leftImages = [{ id: 1, word: meanings[0].description, imageBase64: meanings[0].emoji }];
        const rightImages = [{ id: 1, word: meanings[1].description, imageBase64: meanings[1].emoji }];

        results.push({
            title: 'Eş Sesli Resim Eşleştirme',
            prompt: `Aşağıdaki resimler aynı kelimenin farklı anlamlarına aittir. Kelimeyi bulun.`,
            leftImages,
            rightImages,
            wordScramble: { letters: shuffle(homonym.split('')), word: homonym },
        });
    }
    return results;
};

export const generateOfflineResfebe = async (options: GeneratorOptions): Promise<ResfebeData[]> => {
    const puzzles = [
        { clues: [{ type: 'text' as 'text', value: 'C' }, { type: 'image' as 'image', value: ' Cebinde 1 TL var 💰' }], answer: 'cebir' },
        { clues: [{ type: 'image' as 'image', value: 'Arı 🐝' }, { type: 'text' as 'text', value: 'FE' }], answer: 'arife' }
    ];
    return [{
        title: "Resfebe (Hızlı Mod)",
        prompt: "Resim ve harflerle kelimeleri bulun.",
        puzzles: getRandomItems(puzzles, 2)
    }];
};

export const generateOfflineAntonymResfebe = async (options: GeneratorOptions): Promise<AntonymResfebeData[]> => {
    // FIX: Moved `antonymsPrompt` to the top level of the returned object to match the AntonymResfebeData type.
    const puzzle = {
        word: 'gece',
        antonym: 'gündüz',
        clues: [{ type: 'text' as 'text', value: 'GE' }, { type: 'image' as 'image', value: 'C C C 🎶' }],
    };
    return [{
        title: "Zıt Anlamlı Resfebe (Hızlı Mod)",
        prompt: "Resfebeyi çöz, sonra kelimenin zıttını bul.",
        puzzles: [puzzle],
        antonymsPrompt: 'Bulduğun kelimelerin zıt anlamlılarını yaz.'
    }];
};

export const generateOfflineVisualOddOneOut = createPlaceholder<VisualOddOneOutData>("Görsel Farkı Bul");
export const generateOfflineColorWheelMemory = createPlaceholder<ColorWheelMemoryData>("Renk Çemberi");
export const generateOfflineVisualOddOneOutThemed = createPlaceholder<VisualOddOneOutThemedData>("Tematik Görsel Farkı Bul");
export const generateOfflineLogicGridPuzzle = createPlaceholder<LogicGridPuzzleData>("Mantık Tablosu");
export const generateOfflineImageAnagramSort = createPlaceholder<ImageAnagramSortData>("Resimli Anagram Sıralama");
export const generateOfflineAnagramImageMatch = createPlaceholder<AnagramImageMatchData>("Anagram Resim Eşleştirme");
export const generateOfflineSyllableWordSearch = createPlaceholder<SyllableWordSearchData>("Heceli Kelime Avı");
export const generateOfflineProfessionConnect = createPlaceholder<ProfessionConnectData>("Meslek Bağlama");
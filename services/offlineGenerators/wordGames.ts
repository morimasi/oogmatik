import { 
    GeneratorOptions, WordSearchData, AnagramsData, SpellingCheckData, WordLadderData, 
    WordFormationData, ReverseWordData, MiniWordGridData, PasswordFinderData, 
    SyllableCompletionData, CrosswordData, WordGridPuzzleData, HomonymImageMatchData, 
    AntonymFlowerPuzzleData, SynonymAntonymGridData, SynonymMatchingPatternData, 
    WordWebData, WordPlacementPuzzleData, PositionalAnagramData, ImageAnagramSortData, 
    AnagramImageMatchData, JumbledWordStoryData, ResfebeData, WordSearchWithPasswordData, 
    LetterGridWordFindData, ThematicWordSearchColorData, AntonymResfebeData,
    // Fix: Added missing type imports below
    LetterBridgeData, HomonymSentenceData, PunctuationSpiralPuzzleData
} from '../../types';
import { shuffle, getRandomInt, getRandomItems, getWordsForDifficulty, turkishAlphabet, simpleSyllabify, generateCrosswordLayout, wordToRebus, getDifficultySettings } from './helpers';

// ... (existing WordSearch logic)

export const generateOfflineWordSearch = async (options: GeneratorOptions & { words?: string[] }): Promise<WordSearchData[]> => {
    const { topic, itemCount, difficulty, worksheetCount, words, customInput, mode } = options;
    const results: WordSearchData[] = [];
    
    const settings = getDifficultySettings(difficulty);
    let size = options.gridSize || settings.gridSize;
    
    let directions: number[] = [];
    if (difficulty === 'Başlangıç') {
        directions = [0, 1]; 
    } else if (difficulty === 'Orta') {
        directions = [0, 1, 2];
    } else {
        if (options.directions === 'simple') directions = [0, 1];
        else if (options.directions === 'diagonal') directions = [0, 1, 2];
        else directions = [0, 1, 2, 3, 4, 5, 6, 7];
    }
    
    const isUpperCase = options.case !== 'lower';

    let manualWords: string[] = [];
    if (mode === 'manual' && customInput) {
        if (typeof customInput === 'string') {
            manualWords = customInput.split(/[\n,]+/).map(w => w.trim().toLocaleLowerCase('tr').replace(/ /g, '')).filter(w => w.length > 1);
        } else if (Array.isArray(customInput)) {
            manualWords = customInput.map(w => w.trim().toLocaleLowerCase('tr').replace(/ /g, '')).filter(w => w.length > 1);
        }
        const longest = Math.max(...manualWords.map(w => w.length));
        if (longest > size) size = longest + 2;
    }

    let masterWordPool: string[] = [];
    if (mode === 'manual' && manualWords.length > 0) {
        masterWordPool = manualWords;
    } else if (words && words.length > 0) {
        masterWordPool = words.map(w => w.toLocaleLowerCase('tr').replace(/ /g, ''));
    } else {
        masterWordPool = getWordsForDifficulty(difficulty, topic).map(w => w.toLocaleLowerCase('tr').replace(/ /g, ''));
    }
    
    masterWordPool = shuffle(masterWordPool);
    const wordsPerSheet = itemCount || 15; 

    for (let i = 0; i < worksheetCount; i++) {
        let startIndex = (i * wordsPerSheet) % Math.max(1, masterWordPool.length);
        let sheetWords = masterWordPool.slice(startIndex, startIndex + wordsPerSheet);
        
        const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
        const placedWords: string[] = [];
        
        sheetWords.forEach(word => {
            if (word.length > size) return;
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 100) {
                const dir = getRandomItems(directions, 1)[0];
                const dr = [0, 1, 1, -1, 0, 1, -1, -1]; 
                const dc = [1, 0, 1, 0, -1, -1, -1, 1];
                const r = getRandomInt(0, size - 1);
                const c = getRandomInt(0, size - 1);
                const endR = r + (word.length - 1) * dr[dir];
                const endC = c + (word.length - 1) * dc[dir];

                if (endR >= 0 && endR < size && endC >= 0 && endC < size) {
                    let fits = true;
                    for (let k = 0; k < word.length; k++) {
                        const nr = r + k * dr[dir];
                        const nc = c + k * dc[dir];
                        if (grid[nr][nc] !== '' && grid[nr][nc] !== word[k]) { fits = false; break; }
                    }
                    if (fits) {
                        for (let k = 0; k < word.length; k++) {
                            const nr = r + k * dr[dir];
                            const nc = c + k * dc[dir];
                            grid[nr][nc] = word[k];
                        }
                        placedWords.push(word);
                        placed = true;
                    }
                }
                attempts++;
            }
        });

        for(let r=0; r<size; r++) {
            for(let c=0; c<size; c++) {
                if(grid[r][c] === '') grid[r][c] = turkishAlphabet[getRandomInt(0, 28)];
            }
        }
        
        results.push({ 
            title: `Kelime Bulmaca`, 
            instruction: "Kelimeleri bul ve işaretle.",
            pedagogicalNote: "Görsel tarama.",
            imagePrompt: `Word Search`,
            words: placedWords.map(w => isUpperCase ? w.toUpperCase() : w), 
            grid: grid.map(row => row.map(cell => isUpperCase ? cell.toUpperCase() : cell))
        });
    }
    return results;
};

export const generateOfflineAnagram = async (options: GeneratorOptions): Promise<AnagramsData[]> => {
    const { topic, itemCount, worksheetCount, difficulty } = options;
    const pool = shuffle(getWordsForDifficulty(difficulty, topic));
    return Array.from({ length: worksheetCount }, () => ({
        title: 'Harf Çorbası',
        instruction: "Karışık harfleri düzenle.",
        pedagogicalNote: "Kelime türetme.",
        imagePrompt: 'Anagram',
        anagrams: pool.slice(0, itemCount || 8).map(word => ({ word, scrambled: shuffle(word.split('')).join(''), letters: word.split('') })),
        sentencePrompt: 'Cümle kur:'
    }));
};

export const generateOfflineCrossword = async (options: GeneratorOptions): Promise<CrosswordData[]> => {
    const { worksheetCount, difficulty, itemCount } = options;
    const results: CrosswordData[] = [];
    const masterPool = shuffle(getWordsForDifficulty(difficulty).filter(w => w.length > 2));
    const count = itemCount || 8;

    for(let i=0; i<worksheetCount; i++) {
        const startIndex = (i * count) % Math.max(1, masterPool.length - count);
        let words = masterPool.slice(startIndex, startIndex + count);
        if (words.length === 0) words = ["ELMA", "ARMUT"];
        const layout = generateCrosswordLayout(words); 
        const grid = Array.from({length: 15}, () => Array(15).fill(null)); 
        const clues = layout.placements.map((p, idx) => ({ id: idx + 1, direction: p.dir, text: `Bu kelime ${p.word.length} harflidir.`, start: { row: p.row, col: p.col }, word: p.word.toUpperCase(), imagePrompt: p.word }));
        results.push({
            title: `Çapraz Bulmaca`, instruction: "Çöz", pedagogicalNote: "Kelime", imagePrompt: 'Crossword', theme: 'Genel', grid: grid as (string|null)[][], clues, passwordCells: [], passwordLength: 0, passwordPrompt: ''
        });
    }
    return results;
};

export const generateOfflineResfebe = async (o: GeneratorOptions): Promise<ResfebeData[]> => {
    const { itemCount, worksheetCount, difficulty } = o;
    const pool = shuffle(getWordsForDifficulty(difficulty));
    return Array.from({ length: worksheetCount }, (_, i) => ({
        title: 'Resfebe', instruction: 'Çöz', pedagogicalNote: 'Sembol', imagePrompt: 'Rebus',
        puzzles: pool.slice((i * (itemCount || 4)) % pool.length).slice(0, itemCount || 4).map(word => ({ clues: wordToRebus(word).map(c => ({...c, imagePrompt: c.value})), answer: word }))
    }));
};

export const generateOfflineSpellingCheck = async (o: GeneratorOptions): Promise<SpellingCheckData[]> => [];
export const generateOfflineWordLadder = async (o: GeneratorOptions): Promise<WordLadderData[]> => [];
export const generateOfflineSyllableCompletion = async (o: GeneratorOptions): Promise<SyllableCompletionData[]> => [];
export const generateOfflineLetterBridge = async (o: GeneratorOptions): Promise<LetterBridgeData[]> => [];
export const generateOfflineWordFormation = async (o: GeneratorOptions): Promise<WordFormationData[]> => [];
export const generateOfflineReverseWord = async (o: GeneratorOptions): Promise<ReverseWordData[]> => [];
export const generateOfflineMiniWordGrid = async (o: GeneratorOptions): Promise<MiniWordGridData[]> => [];
export const generateOfflinePasswordFinder = async (o: GeneratorOptions): Promise<PasswordFinderData[]> => [];
export const generateOfflineSyllableWordSearch = async (o: GeneratorOptions) => generateOfflineWordSearch(o) as any;
export const generateOfflineHomonymImageMatch = async (o: GeneratorOptions): Promise<HomonymImageMatchData[]> => [];
export const generateOfflineAntonymFlowerPuzzle = async (o: GeneratorOptions): Promise<AntonymFlowerPuzzleData[]> => [];
export const generateOfflineSynonymAntonymGrid = async (o: GeneratorOptions): Promise<SynonymAntonymGridData[]> => [];
export const generateOfflineSynonymSearchAndStory = async (o: GeneratorOptions) => generateOfflineWordSearch(o) as any;
export const generateOfflineSynonymMatchingPattern = async (o: GeneratorOptions): Promise<SynonymMatchingPatternData[]> => [];
export const generateOfflineWordWeb = async (o: GeneratorOptions): Promise<WordWebData[]> => [];
export const generateOfflineWordWebWithPassword = async (o: GeneratorOptions) => generateOfflineWordWeb(o) as any;
export const generateOfflineWordPlacementPuzzle = async (o: GeneratorOptions): Promise<WordPlacementPuzzleData[]> => [];
export const generateOfflinePositionalAnagram = async (o: GeneratorOptions): Promise<PositionalAnagramData[]> => [];
export const generateOfflineImageAnagramSort = async (o: GeneratorOptions): Promise<ImageAnagramSortData[]> => [];
export const generateOfflineAnagramImageMatch = async (o: GeneratorOptions): Promise<AnagramImageMatchData[]> => [];
export const generateOfflineHomonymSentenceWriting = async (o: GeneratorOptions): Promise<HomonymSentenceData[]> => [];
export const generateOfflineWordGridPuzzle = async (o: GeneratorOptions): Promise<WordGridPuzzleData[]> => [];
export const generateOfflineJumbledWordStory = async (o: GeneratorOptions): Promise<JumbledWordStoryData[]> => [];
export const generateOfflineSpiralPuzzle = async (o: GeneratorOptions) => generateOfflineWordSearch(o) as any;
export const generateOfflinePunctuationSpiralPuzzle = async (o: GeneratorOptions) => generateOfflineSpiralPuzzle(o) as any as Promise<PunctuationSpiralPuzzleData[]>;
export const generateOfflineThematicWordSearchColor = async (o: GeneratorOptions) => generateOfflineWordSearch(o) as any as Promise<ThematicWordSearchColorData[]>;
export const generateOfflineAntonymResfebe = async (o: GeneratorOptions) => generateOfflineResfebe(o) as any as Promise<AntonymResfebeData[]>;
export const generateOfflineLetterGridWordFind = async (o: GeneratorOptions) => generateOfflineWordSearch(o) as any as Promise<LetterGridWordFindData[]>;
export const generateOfflineWordSearchWithPassword = async (o: GeneratorOptions) => generateOfflineWordSearch(o) as any as Promise<WordSearchWithPasswordData[]>;
export const generateOfflineSynonymWordSearch = async (o: GeneratorOptions) => generateOfflineWordSearch(o) as any;

import { GeneratorOptions, WordSearchData, AnagramsData, SpellingCheckData, CrosswordData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, getWordsForDifficulty, turkishAlphabet, generateCrosswordLayout, getDifficultySettings } from './helpers';
import { TR_VOCAB } from './helpers';

export const generateOfflineWordSearch = async (options: GeneratorOptions & { words?: string[] }): Promise<WordSearchData[]> => {
    const { topic, itemCount, difficulty, worksheetCount, words } = options;
    const results: WordSearchData[] = [];
    
    const settings = getDifficultySettings(difficulty);
    const size = options.gridSize || settings.gridSize;
    
    // 0: E, 1: S, 2: SE, 3: N, 4: W, 5: SW, 6: NW, 7: NE
    let directions: number[] = [];
    if (options.directions === 'simple') directions = [0, 1];
    else if (options.directions === 'diagonal') directions = [0, 1, 2];
    else if (options.directions === 'all') directions = [0, 1, 2, 3, 4, 5, 6, 7];
    else directions = settings.directions; 
    
    const isUpperCase = options.case !== 'lower';

    for (let i = 0; i < worksheetCount; i++) {
        const availableWords = getWordsForDifficulty(difficulty, topic);
        let sheetWords = words 
            ? words.map(w => w.toLocaleLowerCase('tr').replace(/ /g, ''))
            : getRandomItems(availableWords, itemCount || 10).map(w => w.toLocaleLowerCase('tr').replace(/ /g, ''));
            
        sheetWords.sort((a, b) => b.length - a.length);

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
                        if (grid[nr][nc] !== '' && grid[nr][nc] !== word[k]) {
                            fits = false;
                            break;
                        }
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
        
        const finalGrid = grid.map(row => row.map(cell => isUpperCase ? cell.toUpperCase() : cell));
        const finalWords = placedWords.map(w => isUpperCase ? w.toUpperCase() : w);

        results.push({ 
            title: `Kelime Bulmaca (${difficulty})`, 
            instruction: "Listelenen kelimeleri tablonun içinde bul ve işaretle.",
            pedagogicalNote: "Görsel tarama, şekil-zemin algısı ve seçici dikkat becerilerini destekler.",
            words: finalWords, 
            grid: finalGrid, 
            hiddenMessage: difficulty === 'Uzman' ? 'BAŞARDIN' : '', 
            followUpQuestion: 'Bulduğun en uzun kelime hangisi?' 
        });
    }
    return results;
};

export const generateOfflineAnagram = async (options: GeneratorOptions): Promise<AnagramsData[]> => {
    const { topic, itemCount, worksheetCount, difficulty } = options;
    const results: AnagramsData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const words = getRandomItems(getWordsForDifficulty(difficulty, topic), itemCount || 8);
        results.push({
            title: 'Anagram Çözmece',
            instruction: "Karışık verilen harfleri düzenleyerek anlamlı kelimeleri bul.",
            pedagogicalNote: "Kelime türetme, harf dizilimi ve fonolojik farkındalık çalışması.",
            prompt: 'Harfleri doğru sıraya diz.',
            anagrams: words.map(word => ({ word, scrambled: shuffle(word.split('')).join(''), imageBase64: '' })),
            sentencePrompt: 'Bulduğun kelimelerden üç tanesi ile bir hikaye cümlesi kur.'
        });
    }
    return results;
};

export const generateOfflineCrossword = async (options: GeneratorOptions): Promise<CrosswordData[]> => {
    const { worksheetCount, difficulty, itemCount } = options;
    const results: CrosswordData[] = [];
    const settings = getDifficultySettings(difficulty);
    
    for(let i=0; i<worksheetCount; i++) {
        const words = getRandomItems(getWordsForDifficulty(difficulty).filter(w => w.length > 2), itemCount || 6);
        const layout = generateCrosswordLayout(words);
        
        const gridRows = settings.gridSize;
        const gridCols = settings.gridSize;
        const grid = Array.from({length: gridRows}, () => Array(gridCols).fill(null));
        
        layout.placements.forEach(p => {
            for(let k=0; k<p.word.length; k++) {
                if (p.dir === 'across') {
                    if(p.col+k < gridCols) grid[p.row][p.col+k] = ''; 
                } else {
                    if(p.row+k < gridRows) grid[p.row+k][p.col] = ''; 
                }
            }
        });

        const clues = layout.placements.map((p, idx) => ({
            id: idx + 1,
            direction: p.dir,
            text: difficulty === 'Başlangıç' ? `(Resim: ${p.word.toUpperCase()})` : `Bu kelime ${p.word.length} harflidir ve ... ile başlar.`,
            start: { row: p.row, col: p.col },
            word: p.word.toUpperCase()
        }));

        results.push({
            title: `Çapraz Bulmaca (${difficulty})`,
            instruction: "Numaralara ve yönlere dikkat ederek bulmacayı çöz.",
            pedagogicalNote: "Uzamsal organizasyon ve kelime bilgisi.",
            prompt: 'İpuçlarını takip et.',
            theme: 'Genel',
            grid: grid as (string|null)[][],
            clues,
            passwordCells: [{row: 0, col: 0}],
            passwordLength: 1,
            passwordPrompt: ''
        });
    }
    return results;
};

export const generateOfflineSpellingCheck = async (options: GeneratorOptions): Promise<SpellingCheckData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: SpellingCheckData[] = [];
    const confusingPairs = TR_VOCAB.confusing_words;

    for (let i = 0; i < worksheetCount; i++) {
        const checks = getRandomItems(confusingPairs, itemCount || 8).map(pair => {
            const correct = pair[0];
            const incorrect = pair[1];
            const distractor = correct.replace(/[aeıioöuü]/, (m) => m === 'a' ? 'e' : 'a');
            return { correct, options: shuffle([correct, incorrect, distractor]) };
        });
        results.push({ 
            title: `Doğru Yazılışı Bul`, 
            instruction: "Hangi kelimenin yazımı doğru? İşaretle.",
            pedagogicalNote: "Yazım kuralları ve görsel dikkat.",
            checks 
        });
    }
    return results;
};

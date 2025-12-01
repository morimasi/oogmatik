
import { GeneratorOptions, WordSearchData, AnagramsData, SpellingCheckData, WordComparisonData, ProverbSearchData, ReverseWordData, FindDuplicateData, WordGroupingData, WordLadderData, WordFormationData, FindIdenticalWordData, LetterBridgeData, MiniWordGridData, PasswordFinderData, SyllableCompletionData, CrosswordData, WordGridPuzzleData, ProverbSayingSortData, HomonymImageMatchData, AntonymFlowerPuzzleData, SynonymAntonymGridData, AntonymResfebeData, ThematicWordSearchColorData, SynonymSearchAndStoryData, PunctuationSpiralPuzzleData, SynonymMatchingPatternData, MissingPartsData, WordWebData, SyllableWordSearchData, WordSearchWithPasswordData, WordWebWithPasswordData, LetterGridWordFindData, WordPlacementPuzzleData, PositionalAnagramData, ImageAnagramSortData, AnagramImageMatchData, SynonymWordSearchData, SpiralPuzzleData, HomonymSentenceData, ResfebeData, ResfebeClue, JumbledWordStoryData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, getWordsForDifficulty, turkishAlphabet, TR_VOCAB, COLORS, HOMONYMS, EMOJIS, simpleSyllabify, generateCrosswordLayout, wordToRebus, ITEM_CATEGORIES, CATEGORY_NAMES, getDifficultySettings } from './helpers';
import { PROVERBS } from '../../data/sentences';

export const generateOfflineWordSearch = async (options: GeneratorOptions & { words?: string[] }): Promise<WordSearchData[]> => {
    const { topic, itemCount, difficulty, worksheetCount, words, customInput, mode } = options;
    const results: WordSearchData[] = [];
    
    const settings = getDifficultySettings(difficulty);
    // Increase grid size if manual words are long
    let size = options.gridSize || settings.gridSize;
    
    // 0: E, 1: S, 2: SE, 3: N, 4: W, 5: SW, 6: NW, 7: NE
    let directions: number[] = [];
    if (options.directions === 'simple') directions = [0, 1];
    else if (options.directions === 'diagonal') directions = [0, 1, 2];
    else if (options.directions === 'all') directions = [0, 1, 2, 3, 4, 5, 6, 7];
    else directions = settings.directions; // Use difficulty defaults if not specified
    
    // Case handling
    const isUpperCase = options.case !== 'lower';

    // MANUAL INPUT HANDLING
    let manualWords: string[] = [];
    if (mode === 'manual' && customInput) {
        if (typeof customInput === 'string') {
            manualWords = customInput.split(/[\n,]+/).map(w => w.trim().toLocaleLowerCase('tr').replace(/ /g, '')).filter(w => w.length > 1);
        } else if (Array.isArray(customInput)) {
            manualWords = customInput.map(w => w.trim().toLocaleLowerCase('tr').replace(/ /g, '')).filter(w => w.length > 1);
        }
        // Adjust grid size based on longest word
        const longest = Math.max(...manualWords.map(w => w.length));
        if (longest > size) size = longest + 2;
        if (manualWords.length > size) size = Math.max(size, Math.ceil(Math.sqrt(manualWords.length * 2)) + 2);
    }

    // POOL PREPARATION (VARIATION LOGIC)
    let masterWordPool: string[] = [];
    if (mode === 'manual' && manualWords.length > 0) {
        masterWordPool = manualWords;
    } else if (words && words.length > 0) {
        masterWordPool = words.map(w => w.toLocaleLowerCase('tr').replace(/ /g, ''));
    } else {
        masterWordPool = getWordsForDifficulty(difficulty, topic).map(w => w.toLocaleLowerCase('tr').replace(/ /g, ''));
    }
    
    // Shuffle the master pool once to ensure random distribution across pages
    masterWordPool = shuffle(masterWordPool);
    const wordsPerSheet = itemCount || 10;

    for (let i = 0; i < worksheetCount; i++) {
        // Slice distinct words for each sheet to maximize variation
        // If pool is exhausted, loop back or reshuffle
        let startIndex = (i * wordsPerSheet) % masterWordPool.length;
        let endIndex = startIndex + wordsPerSheet;
        let sheetWords: string[] = [];

        if (endIndex <= masterWordPool.length) {
            sheetWords = masterWordPool.slice(startIndex, endIndex);
        } else {
            // Wrap around
            sheetWords = [...masterWordPool.slice(startIndex), ...masterWordPool.slice(0, endIndex - masterWordPool.length)];
        }
        
        // If we still need filler words (in case pool was small), add randoms
        if (sheetWords.length < wordsPerSheet) {
             const fillers = getRandomItems(getWordsForDifficulty(difficulty, 'Rastgele'), wordsPerSheet - sheetWords.length);
             sheetWords = [...sheetWords, ...fillers.map(w => w.toLocaleLowerCase('tr'))];
        }
            
        // Sort by length descending to place longer words first
        sheetWords.sort((a, b) => b.length - a.length);

        // Grid Generation Logic
        const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
        const placedWords: string[] = [];
        
        sheetWords.forEach(word => {
            if (word.length > size) return;
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 150) {
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

        // Fill empty cells
        for(let r=0; r<size; r++) {
            for(let c=0; c<size; c++) {
                if(grid[r][c] === '') grid[r][c] = turkishAlphabet[getRandomInt(0, 28)];
            }
        }
        
        // Apply case to the final grid
        const finalGrid = grid.map(row => row.map(cell => isUpperCase ? cell.toUpperCase() : cell));
        const finalWords = placedWords.map(w => isUpperCase ? w.toUpperCase() : w);

        results.push({ 
            title: `Kelime Bulmaca ${mode === 'manual' ? '(Özel)' : `(${difficulty})`}`, 
            instruction: "Listelenen kelimeleri tablonun içinde bul ve işaretle.",
            pedagogicalNote: "Görsel tarama, şekil-zemin algısı ve seçici dikkat becerilerini destekler.",
            imagePrompt: 'Kelime Bulmaca',
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
    
    // Master pool for variety
    const masterPool = shuffle(getWordsForDifficulty(difficulty, topic));
    const itemsPerSheet = itemCount || 8;

    for (let i = 0; i < worksheetCount; i++) {
        let startIndex = (i * itemsPerSheet) % masterPool.length;
        let sheetWords = masterPool.slice(startIndex, startIndex + itemsPerSheet);
        
        // Ensure enough words
        if (sheetWords.length < itemsPerSheet) {
             sheetWords = [...sheetWords, ...getRandomItems(getWordsForDifficulty(difficulty, 'Rastgele'), itemsPerSheet - sheetWords.length)];
        }

        results.push({
            title: 'Anagram Çözmece',
            instruction: "Karışık verilen harfleri düzenleyerek anlamlı kelimeleri bul.",
            pedagogicalNote: "Kelime türetme, harf dizilimi ve fonolojik farkındalık çalışması.",
            imagePrompt: 'Harfler',
            prompt: 'Harfleri doğru sıraya diz.',
            anagrams: sheetWords.map(word => ({ word, scrambled: shuffle(word.split('')).join(''), imageBase64: '' })),
            sentencePrompt: 'Bulduğun kelimelerden üç tanesi ile bir hikaye cümlesi kur.'
        });
    }
    return results;
};

export const generateOfflineCrossword = async (options: GeneratorOptions): Promise<CrosswordData[]> => {
    const { worksheetCount, difficulty, itemCount } = options;
    const results: CrosswordData[] = [];
    const settings = getDifficultySettings(difficulty);
    
    // Pool strategy
    const masterPool = shuffle(getWordsForDifficulty(difficulty).filter(w => w.length > 2));
    const count = itemCount || 6;

    for(let i=0; i<worksheetCount; i++) {
        // Pick distinct words for each sheet
        const startIndex = (i * count) % Math.max(1, masterPool.length - count);
        const words = masterPool.slice(startIndex, startIndex + count);
        
        const layout = generateCrosswordLayout(words);
        
        const gridRows = settings.gridSize;
        const gridCols = settings.gridSize;
        const grid = Array.from({length: gridRows}, () => Array(gridCols).fill(null));
        
        layout.placements.forEach(p => {
            for(let k=0; k<p.word.length; k++) {
                if (p.dir === 'across') {
                    if(p.col+k < gridCols) grid[p.row][p.col+k] = ''; // Empty cell for user
                } else {
                    if(p.row+k < gridRows) grid[p.row+k][p.col] = ''; // Empty cell for user
                }
            }
        });

        const clues = layout.placements.map((p, idx) => ({
            id: idx + 1,
            direction: p.dir,
            text: difficulty === 'Başlangıç' ? `(Resim: ${p.word.toUpperCase()})` : `Bu kelime ${p.word.length} harflidir ve ... ile başlar.`,
            start: { row: p.row, col: p.col },
            word: p.word.toUpperCase(),
            imagePrompt: p.word
        }));

        results.push({
            title: `Çapraz Bulmaca (${difficulty})`,
            instruction: "Numaralara ve yönlere dikkat ederek bulmacayı çöz.",
            pedagogicalNote: "Uzamsal organizasyon ve kelime bilgisi.",
            imagePrompt: 'Bulmaca',
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
    const confusingPairs = shuffle(TR_VOCAB.confusing_words); // Shuffle master list
    const count = itemCount || 8;

    for (let i = 0; i < worksheetCount; i++) {
        const startIndex = (i * count) % confusingPairs.length;
        const sheetPairs = confusingPairs.slice(startIndex, startIndex + count);
        
        const checks = sheetPairs.map(pair => {
            const correct = pair[0];
            const incorrect = pair[1];
            // Generate a visual distractor by replacing a vowel or similar consonant
            const distractor = correct.replace(/[aeıioöuü]/, (m) => m === 'a' ? 'e' : 'a');
            return { correct, options: shuffle([correct, incorrect, distractor]), imagePrompt: correct };
        });
        results.push({ 
            title: `Doğru Yazılışı Bul`, 
            instruction: "Hangi kelimenin yazımı doğru? İşaretle.",
            pedagogicalNote: "Yazım kuralları ve görsel dikkat.",
            imagePrompt: 'Yazım Kuralı',
            checks 
        });
    }
    return results;
};

export const generateOfflineLetterBridge = async (options: GeneratorOptions): Promise<LetterBridgeData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const results: LetterBridgeData[] = [];
    const wordPool = shuffle(getWordsForDifficulty(difficulty)); // Shuffle once
    
    for (let i = 0; i < worksheetCount; i++) {
        const pairs = [];
        let attempts = 0;
        // Use a pointer to avoid reusing same words if possible, or just random scan
        while(pairs.length < (itemCount || 8) && attempts < 200) {
            const bridgeLetter = getRandomItems(turkishAlphabet.split(''), 1)[0];
            // Find words dynamically from the pool
            const word1 = wordPool.find(w => w.endsWith(bridgeLetter) && w.length > 2);
            const word2 = wordPool.find(w => w.startsWith(bridgeLetter) && w.length > 2 && w !== word1);
            
            if (word1 && word2) {
                // Ensure unique pairs in this sheet
                if(!pairs.some(p => p.word1 === word1 && p.word2 === word2)) {
                    pairs.push({ word1: word1.slice(0, -1), word2: word2.slice(1) });
                }
            }
            attempts++;
        }
        results.push({ 
            title: 'Harf Köprüsü', 
            instruction: "Ortadaki boşluğa öyle bir harf yaz ki, soldaki kelimenin sonu, sağdakinin başı olsun.",
            pedagogicalNote: "Kelime sonu ve başı ses farkındalığı (Fonoloji).",
            imagePrompt: 'Köprü',
            pairs, 
            followUpPrompt: 'Oluşturduğun köprü harflerini birleştirince hangi kelime çıkıyor?' 
        });
    }
    return results;
};

export const generateOfflineWordLadder = async (options: GeneratorOptions): Promise<WordLadderData[]> => {
    const { itemCount, worksheetCount, steps, difficulty } = options;
    const results: WordLadderData[] = [];
    
    const simpleLadders = [
        { startWord: 'bal', endWord: 'sel', steps: 2 }, 
        { startWord: 'kış', endWord: 'yaz', steps: 3 }, 
        { startWord: 'ekim', endWord: 'ekip', steps: 1},
        { startWord: 'koyu', endWord: 'kuyu', steps: 1},
        { startWord: 'kasa', endWord: 'masa', steps: 1},
        { startWord: 'yol', endWord: 'yıl', steps: 1},
        { startWord: 'kel', endWord: 'yel', steps: 2},
        { startWord: 'saz', endWord: 'söz', steps: 2}
    ];

    const expertLadders = [
         { startWord: 'KITA', endWord: 'KASA', steps: 4 }, 
         { startWord: 'ALAN', endWord: 'ÖLEN', steps: 3 }, 
         { startWord: 'SERT', endWord: 'KURT', steps: 4 }, 
         { startWord: 'ELMA', endWord: 'EKME', steps: 4 }, 
         { startWord: 'KALE', endWord: 'LALE', steps: 3 },
    ];

    const selectedLadders = difficulty === 'Zor' || difficulty === 'Uzman' ? expertLadders : simpleLadders;
    const shuffledLadders = shuffle(selectedLadders); // Shuffle pool

    for (let i = 0; i < worksheetCount; i++) {
        // Slice logic for variation
        const start = (i * (itemCount || 2)) % shuffledLadders.length;
        const sheetLadders = shuffledLadders.slice(start, start + (itemCount || 2));
        
        results.push({ 
            title: 'Kelime Merdiveni', 
            instruction: "Her basamakta sadece bir harf değiştirerek yeni kelimeye ulaş.",
            pedagogicalNote: "Harf manipülasyonu ve kelime analizi.",
            imagePrompt: 'Merdiven',
            theme: 'Harf Değişimi', 
            ladders: sheetLadders.map(l => ({...l, steps: steps || l.steps})) 
        });
    }
    return results;
};

export const generateOfflineWordFormation = async (options: GeneratorOptions): Promise<WordFormationData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const results: WordFormationData[] = [];
    const masterPool = shuffle(getWordsForDifficulty(difficulty)); // Shuffle once

    for (let i = 0; i < worksheetCount; i++) {
        const count = itemCount || 6;
        const start = (i * count) % masterPool.length;
        const sheetWords = masterPool.slice(start, start + count);

        const sets = sheetWords.map(baseWord => {
            return { letters: shuffle(baseWord.split('')), jokerCount: difficulty === 'Başlangıç' ? 2 : 1 };
        });
        results.push({ 
            title: 'Kelime Türetmece', 
            instruction: "Verilen harfleri kullanarak anlamlı kelimeler türet.",
            pedagogicalNote: "Anagram çözme ve kelime dağarcığı aktivasyonu.",
            imagePrompt: 'Harfler',
            sets, 
            mysteryWordChallenge: { prompt: 'Tüm harfleri kullanırsan hangi kelime çıkar?', solution: 'Gizli Kelime'} 
        });
    }
    return results;
};

export const generateOfflineReverseWord = async (options: GeneratorOptions): Promise<ReverseWordData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const results: ReverseWordData[] = [];
    const masterPool = shuffle(getWordsForDifficulty(difficulty));

    for (let i = 0; i < worksheetCount; i++) {
        const count = itemCount || 8;
        const start = (i * count) % masterPool.length;
        
        results.push({ 
            title: 'Ters Oku, Düz Yaz', 
            instruction: "Kelimeleri tersten oku ve doğrusunu yanına yaz.",
            pedagogicalNote: "Görsel işlemleme hızı ve ortografik bellek.",
            imagePrompt: 'Ters',
            words: masterPool.slice(start, start + count), 
            funFact: 'Beynimiz kelimeleri harf harf değil, bütün olarak algılar.' 
        });
    }
    return results;
};

export const generateOfflineWordGrouping = async (options: GeneratorOptions): Promise<WordGroupingData[]> => {
    const { worksheetCount, categoryCount } = options;
    const results: WordGroupingData[] = [];
    
    // Ensure varied categories across sheets
    const shuffledCats = shuffle([...ITEM_CATEGORIES]); 

    for (let i = 0; i < worksheetCount; i++) {
        // Rotate categories
        const selectedCats = shuffledCats.slice(0, categoryCount || 3);
        shuffledCats.push(...shuffledCats.splice(0, 1)); // Rotate for next sheet

        const words: any[] = [];
        selectedCats.forEach(cat => {
            const catWords = (TR_VOCAB as any)[cat] as string[] || [];
            const items = getRandomItems(catWords, 4);
            words.push(...items.map(w => ({ text: w, imagePrompt: w })));
        });
        
        results.push({ 
            title: 'Kelime Gruplama', 
            instruction: "Kelimeleri anlamlarına göre doğru kutulara yerleştir.",
            pedagogicalNote: "Semantik kategorizasyon ve kavramsal düşünme.",
            imagePrompt: 'Grup',
            words: shuffle(words), 
            categoryNames: selectedCats.map(c => CATEGORY_NAMES[c] || c) 
        });
    }
    return results;
};

export const generateOfflineMiniWordGrid = async (options: GeneratorOptions): Promise<MiniWordGridData[]> => {
     const {itemCount, worksheetCount, difficulty} = options;
     const results: MiniWordGridData[] = [];
     const masterPool = shuffle(getWordsForDifficulty(difficulty));

     for(let i=0; i<worksheetCount; i++){
         const count = itemCount || 6;
         const start = (i * count) % masterPool.length;
         const words = masterPool.slice(start, start + count);

         const puzzles = words.map(word => {
            const size = Math.max(3, Math.ceil(Math.sqrt(word.length)));
            const grid = Array.from({length: size}, () => Array(size).fill(''));
            
            let idx = 0;
            for(let r=0; r<size; r++) {
                for(let c=0; c<size; c++) {
                    grid[r][c] = idx < word.length ? word[idx++] : turkishAlphabet[getRandomInt(0, 28)];
                }
            }
            return {grid, start: {row: 0, col: 0}}
         })
         results.push({
             title: 'Mini Kelime Kareleri', 
             instruction: "Renkli kareden başlayarak harfleri takip et ve kelimeyi bul.",
             pedagogicalNote: "Görsel takip ve parça-bütün ilişkisi.",
             imagePrompt: 'Kare',
             prompt: 'Gizli kelimeyi bul.', 
             puzzles
         })
     }
    return results;
};

export const generateOfflinePasswordFinder = async (options: GeneratorOptions): Promise<PasswordFinderData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: PasswordFinderData[] = [];
    const secrets = shuffle(["bilgi", "kitap", "kalem", "sevgi", "barış", "zekâ", "okul"]);

    for(let i=0; i<worksheetCount; i++){
        const words: PasswordFinderData['words'] = [];
        const secretWord = secrets[i % secrets.length];
        
        for(let j=0; j<secretWord.length; j++){
            const char = secretWord[j];
            const hintWord = getRandomItems(getWordsForDifficulty('Orta').filter(w => w.startsWith(char)), 1)[0] || char + "...";
            words.push({word: hintWord, passwordLetter: char, isProperNoun: j===0});
        }
        results.push({
            title: 'Şifre Çözücü', 
            instruction: "Her kelimenin ilk harfini alarak gizli şifreyi çöz.",
            pedagogicalNote: "Akrostiş mantığı ve ilk ses farkındalığı.",
            imagePrompt: 'Şifre',
            prompt: 'Kelimelerin baş harfleri sana şifreyi verecek.', 
            words, 
            passwordLength: secretWord.length
        });
    }
    return results;
};

export const generateOfflineSyllableCompletion = async (options: GeneratorOptions): Promise<SyllableCompletionData[]> => {
    const {itemCount, worksheetCount, difficulty} = options;
    const results: SyllableCompletionData[] = [];
    const masterPool = shuffle(getWordsForDifficulty(difficulty));

    for(let i=0; i<worksheetCount; i++){
        const count = itemCount || 8;
        const start = (i * count) % masterPool.length;
        const words = masterPool.slice(start, start + count);

        const wordParts = words.map(w => {
            const parts = simpleSyllabify(w);
            return {first: parts[0], second: parts.slice(1).join('')};
        });
        const syllables = shuffle(wordParts.map(p => p.second));
        results.push({
            title: 'Heceleri Birleştir', 
            instruction: "Verilen ilk heceyi, kutudaki uygun heceyle tamamla.",
            pedagogicalNote: "Heceleme becerisi ve fonolojik sentez.",
            imagePrompt: 'Hece',
            prompt: 'Kelimeleri tamamla.', 
            theme: 'Karışık', 
            wordParts, 
            syllables, 
            storyTemplate: '', 
            storyPrompt: 'Tamamladığın kelimelerle bir hikaye kur.'
        });
    }
    return results;
}

export const generateOfflineSynonymWordSearch = async (options: GeneratorOptions): Promise<SynonymWordSearchData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: SynonymWordSearchData[] = [];
    const masterPairs = shuffle(TR_VOCAB.synonyms);

    for(let i=0; i<worksheetCount; i++) {
        const count = itemCount || 8;
        const start = (i * count) % masterPairs.length;
        const pairs = masterPairs.slice(start, start + count);
        
        const wordsToFind = pairs.map(p => p.synonym);
        const searchData = await generateOfflineWordSearch({...options, worksheetCount: 1, words: wordsToFind});
        
        results.push({
            title: 'Eş Anlamlı Kelime Avı',
            prompt: 'Kelimelerin eş anlamlılarını bulup bulmacada ara.',
            instruction: "Listelenen kelimelerin eş anlamlılarını bulup bulmacada işaretleyin.",
            pedagogicalNote: "Kelime dağarcığını ve anlamsal ilişkileri güçlendirir.",
            imagePrompt: 'Eş Anlam',
            wordsToMatch: pairs,
            grid: searchData[0].grid
        });
    }
    return results;
};

export const generateOfflineSpiralPuzzle = async (options: GeneratorOptions): Promise<SpiralPuzzleData[]> => {
     const {itemCount, worksheetCount, gridSize} = options;
     return Array.from({length: worksheetCount}, () => {
         const size = gridSize || 10;
         const grid = Array.from({length: size}, () => Array(size).fill(''));
         return {
             title: 'Sarmal Bulmaca', 
             instruction: "Merkezden dışarıya (veya dışarıdan içeriye) doğru kelimeleri yaz.",
             pedagogicalNote: "Görsel takip ve sarmal okuma becerisi.",
             imagePrompt: 'Sarmal',
             theme: 'Rastgele', 
             prompt: 'İpuçlarını takip et.', 
             clues: Array.from({length: itemCount || 10}, (_, i) => `${i+1}. ipucu`), 
             grid, 
             wordStarts: [{id: 1, row: Math.floor(size/2), col: Math.floor(size/2)}], 
             passwordPrompt: 'Şifre nedir?' 
        };
    });
}
export const generateOfflinePunctuationSpiralPuzzle = async (options: GeneratorOptions) => generateOfflineSpiralPuzzle(options) as any as Promise<PunctuationSpiralPuzzleData[]>;
export const generateOfflineJumbledWordStory = async (options: GeneratorOptions): Promise<JumbledWordStoryData[]> => {
     const {itemCount, worksheetCount, difficulty, topic} = options;
     const masterPool = shuffle(getWordsForDifficulty(difficulty, topic));

     return Array.from({length: worksheetCount}, (_, i) => {
        const count = itemCount || 4;
        const start = (i * count) % masterPool.length;
        const words = masterPool.slice(start, start + count);
        
        const puzzles = words.map(w => ({jumbled: shuffle(w.split('')), word: w}));
        return {
            title: `Karışık Kelimeler ve Hikaye (${topic || 'Genel'})`,
            instruction: "Harfleri düzelt, kelimeyi bul, sonra bulduğun kelimelerle bir hikaye yaz.",
            pedagogicalNote: "Harf dizilimi farkındalığı ve yaratıcı yazma becerilerini birleştirir.",
            imagePrompt: 'Harfler',
            prompt: 'Kelimeleri çöz ve hikayeni oluştur.',
            theme: topic || 'Rastgele',
            puzzles,
            storyPrompt: 'Bulduğun kelimelerden en az üçünü kullanarak kısa bir metin yaz.'
        }
     });
}
export const generateOfflineThematicJumbledWordStory = async (options: GeneratorOptions) => generateOfflineJumbledWordStory(options) as Promise<JumbledWordStoryData[]>;

export const generateOfflineHomonymSentenceWriting = async (options: GeneratorOptions): Promise<HomonymSentenceData[]> => {
    const { itemCount, worksheetCount } = options;
    const masterPool = shuffle(HOMONYMS);

    return Array.from({ length: worksheetCount }, (_, i) => {
        const count = itemCount || 4;
        const start = (i * count) % masterPool.length;
        const items = masterPool.slice(start, start + count).map(word => ({
            word,
            meaning1: '1. Anlam',
            meaning2: '2. Anlam',
            meaning2_text: 'İkinci anlam için bir cümle yaz.',
            imagePrompt_1: 'Anlam 1',
            imagePrompt_2: 'Anlam 2'
        }));
        return {
            title: 'Eş Sesli Kelimeler (Hızlı Mod)',
            prompt: "Verilen eş sesli (sesteş) kelimelerin her bir anlamı için ayrı birer cümle yazın.",
            instruction: "Her kelimenin iki farklı anlamını düşünerek cümleler kur.",
            pedagogicalNote: "Kelimenin farklı bağlamlardaki anlamlarını anlama ve kullanma becerisini geliştirir.",
            imagePrompt: 'Sesteş',
            items,
        };
    });
};

export const generateOfflineWordGridPuzzle = async (options: GeneratorOptions): Promise<WordGridPuzzleData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const settings = getDifficultySettings(difficulty);
    const masterPool = shuffle(getWordsForDifficulty(difficulty));

    return Array.from({ length: worksheetCount }, (_, i) => {
        const count = itemCount || 10;
        const start = (i * count) % masterPool.length;
        const wordList = masterPool.slice(start, start + count);
        
        return {
            title: 'Kelime Ağı (Hızlı Mod)',
            prompt: "Kelimeleri bulmacaya yerleştir.",
            instruction: "Listeden kelimeleri bulmacaya uygun şekilde yerleştirin.",
            pedagogicalNote: "Mantıksal yerleştirme ve görsel-uzamsal planlama.",
            imagePrompt: 'Bulmaca',
            theme: 'Genel',
            wordList,
            grid: Array.from({ length: settings.gridSize }, () => Array(settings.gridSize).fill(null)),
            unusedWordPrompt: "Kullanmadığın kelimeyle bir cümle kur."
        };
    });
};

export const generateOfflineHomonymImageMatch = async (options: GeneratorOptions): Promise<HomonymImageMatchData[]> => {
    const { itemCount, worksheetCount } = options;
    const masterPool = shuffle(HOMONYMS);

    return Array.from({ length: worksheetCount }, (_, i) => {
        const word = masterPool[i % masterPool.length];
        return {
            title: 'Eş Sesli Resim Eşleme (Hızlı Mod)',
            prompt: "Resimlerin ortak kelimesini bul.",
            instruction: "Resimlerin anlattığı ortak kelimeyi bulup harfleri düzenleyin.",
            pedagogicalNote: "Görsel ipuçlarından yola çıkarak anlamsal bağlantı kurma.",
            imagePrompt: 'Eş Sesli',
            leftImages: [{ id: 1, word: '1. Anlam', imageBase64: '', imagePrompt: 'Anlam 1' }],
            rightImages: [{ id: 2, word: '2. Anlam', imageBase64: '', imagePrompt: 'Anlam 2' }],
            wordScramble: { letters: shuffle(word.split('')), word }
        };
    });
};

export const generateOfflineAntonymFlowerPuzzle = async (options: GeneratorOptions): Promise<AntonymFlowerPuzzleData[]> => {
    const { itemCount, worksheetCount, passwordLength } = options;
    const antonymsPool = shuffle(TR_VOCAB.antonyms);

    return Array.from({ length: worksheetCount }, (_, i) => {
        const count = itemCount || 4;
        const start = (i * count) % antonymsPool.length;
        
        const puzzles = antonymsPool.slice(start, start + count).map(pair => ({
            centerWord: pair.word,
            antonym: pair.antonym,
            petalLetters: shuffle(pair.antonym.split(''))
        }));
        return {
            title: 'Zıt Anlam Papatyası (Hızlı Mod)',
            prompt: 'Papatyaların ortasındaki kelimenin zıt anlamlısını yapraklardaki harflerle oluşturun.',
            instruction: 'Harfleri düzenleyerek zıt anlamlı kelimeyi bulun.',
            pedagogicalNote: 'Zıt anlamlı kelime dağarcığını ve anagram çözme becerisini geliştirir.',
            imagePrompt: 'Papatya',
            puzzles,
            passwordLength: passwordLength || 0
        };
    });
};

export const generateOfflineSynonymAntonymGrid = async (options: GeneratorOptions): Promise<SynonymAntonymGridData[]> => {
    const {itemCount, worksheetCount} = options;
    const synonymsPool = shuffle(TR_VOCAB.synonyms);
    const antonymsPool = shuffle(TR_VOCAB.antonyms);
    const results: SynonymAntonymGridData[] = [];

    for(let i=0; i<worksheetCount; i++) {
         const count = itemCount || 10;
         const startS = (i * Math.ceil(count/2)) % synonymsPool.length;
         const startA = (i * Math.floor(count/2)) % antonymsPool.length;

         const selectedSynonyms = synonymsPool.slice(startS, startS + Math.ceil(count/2));
         const selectedAntonyms = antonymsPool.slice(startA, startA + Math.floor(count/2));

         const wordsToFind = [
             ...selectedSynonyms.map(p => p.synonym),
             ...selectedAntonyms.map(p => p.antonym)
         ];
         
         const searchResult = await generateOfflineWordSearch({ ...options, words: wordsToFind, itemCount: wordsToFind.length, worksheetCount: 1 });
         
         results.push({
             title: 'Eş/Zıt Anlam Tablosu',
             prompt: 'Kelimelerin eş ve zıt anlamlılarını bulup bulmacada yerleştirin.',
             instruction: 'Listelenen kelimelerin eş veya zıt anlamlılarını bulmacada bul.',
             pedagogicalNote: 'Kelime anlam ilişkileri ve kelime hazinesi.',
             imagePrompt: 'Tablo',
             antonyms: selectedAntonyms.map(p => ({word: p.word})),
             synonyms: selectedSynonyms.map(p => ({word: p.word})),
             grid: searchResult[0].grid,
         });
    }
    return results;
};

export const generateOfflineAntonymResfebe = async (options: GeneratorOptions): Promise<AntonymResfebeData[]> => {
    const { itemCount, worksheetCount } = options;
    const pool = shuffle(TR_VOCAB.antonyms);
    
    return Array.from({ length: worksheetCount }, (_, i) => {
        const count = itemCount || 4;
        const start = (i * count) % pool.length;
        
        const puzzles = pool.slice(start, start + count).map(pair => ({
            word: pair.word,
            antonym: pair.antonym,
            clues: wordToRebus(pair.word), // Uses smart rebus generator
            imagePrompt: pair.word
        }));
        return {
            title: 'Zıt Anlam Resfebe (Hızlı Mod)',
            prompt: "Resfebeyi çöz, kelimeyi bul, sonra zıt anlamlısını yaz.",
            instruction: 'İpuçlarını birleştirerek kelimeyi bulun ve zıt anlamlısını yazın.',
            pedagogicalNote: 'Görsel çağrışım ve zıt kavramları eşleştirme.',
            imagePrompt: 'Resfebe',
            puzzles,
            antonymsPrompt: "Bulduğun kelimelerin zıt anlamlılarıyla cümle kur."
        };
    });
};

export const generateOfflineResfebe = async (options: GeneratorOptions): Promise<ResfebeData[]> => {
     const { itemCount, worksheetCount, difficulty } = options;
     const pool = shuffle(getWordsForDifficulty(difficulty));

     return Array.from({ length: worksheetCount }, (_, i) => {
         const count = itemCount || 4;
         const start = (i * count) % pool.length;
         
         const puzzles = pool.slice(start, start + count).map(word => ({
             clues: wordToRebus(word), // Uses smart rebus generator
             answer: word
         }));
         return {
             title: 'Resfebe (Hızlı Mod)',
             prompt: 'Harf ve şekillerden kelimeyi tahmin et.',
             instruction: 'İpuçlarını birleştirerek kelimeyi bulun.',
             pedagogicalNote: 'Yaratıcı düşünme ve sembolik akıl yürütme.',
             imagePrompt: 'Resfebe',
             puzzles
         };
     });
};


export const generateOfflineThematicWordSearchColor = async (options: GeneratorOptions): Promise<ThematicWordSearchColorData[]> => {
    const data = await generateOfflineWordSearch(options);
    return data.map(d => ({
        ...d,
        theme: options.topic || 'Genel',
        title: `Tematik Kelime Avı: ${options.topic || 'Genel'} (Hızlı Mod)`,
        prompt: `Aşağıdaki tabloda ${options.topic || 'bu konuyla'} ilgili kelimeleri bulun.`,
        imagePrompt: 'Tema'
    }));
}

export const generateOfflineSynonymSearchAndStory = async (options: GeneratorOptions): Promise<SynonymSearchAndStoryData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: SynonymSearchAndStoryData[] = [];
    const masterPool = shuffle(TR_VOCAB.synonyms);
    
    for(let i=0; i<worksheetCount; i++) {
        const count = itemCount || 8;
        const start = (i * count) % masterPool.length;
        const pairs = masterPool.slice(start, start + count);
        
        const wordsToFind = pairs.map(p => p.synonym);
        const searchData = await generateOfflineWordSearch({...options, worksheetCount: 1, words: wordsToFind});
        
        results.push({
            title: 'Eş Anlamlı Hikaye Avı (Hızlı Mod)',
            prompt: 'Kelimelerin eş anlamlılarını bulup bulmacada ara.',
            instruction: "Listelenen kelimelerin eş anlamlılarını bulup bulmacada işaretleyin, sonra bu kelimelerle hikaye yazın.",
            pedagogicalNote: "Kelime dağarcığı, anlamsal ilişkiler ve yaratıcı yazma entegrasyonu.",
            imagePrompt: 'Hikaye',
            wordTable: pairs, 
            grid: searchData[0].grid,
            storyPrompt: "Bulduğun eş anlamlı kelimeleri kullanarak kısa bir hikaye yaz."
        });
    }
    return results;
};

export const generateOfflineSynonymMatchingPattern = async (options: GeneratorOptions): Promise<SynonymMatchingPatternData[]> => {
    const { itemCount, worksheetCount, theme } = options;
    const masterPool = shuffle(TR_VOCAB.synonyms);

    return Array.from({ length: worksheetCount }, (_, i) => {
        const count = itemCount || 8;
        const start = (i * count) % masterPool.length;
        const pairs = masterPool.slice(start, start + count);
        
        return {
            title: 'Eş Anlam Deseni (Hızlı Mod)',
            prompt: 'Eş anlamlı kelimeleri bularak deseni tamamla.',
            instruction: 'Eş anlamlı kelimeleri bularak eşleştirin.',
            pedagogicalNote: 'Kelime dağarcığı ve görsel eşleştirme.',
            imagePrompt: 'Eş Anlam',
            theme: theme || 'Genel',
            pairs
        };
    });
};

export const generateOfflineMissingParts = async (options: GeneratorOptions): Promise<MissingPartsData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const masterPool = shuffle(getWordsForDifficulty(difficulty, 'medium'));

    return Array.from({ length: worksheetCount }, (_, i) => {
        const count = itemCount || 8;
        const start = (i * count) % masterPool.length;
        const words = masterPool.slice(start, start + count);
        
        const leftParts = words.map((w, idx) => ({ id: idx, text: w.substring(0, Math.floor(w.length / 2)) }));
        const rightParts = shuffle(words.map((w, idx) => ({ id: idx, text: w.substring(Math.floor(w.length / 2)) })));
        return {
            title: 'Eksik Parçalar (Hızlı Mod)',
            prompt: 'Kelime parçalarını birleştir.',
            instruction: 'Sol ve sağdaki parçaları birleştirerek anlamlı kelimeler oluşturun.',
            pedagogicalNote: 'Görsel bütünleme ve hece farkındalığı.',
            imagePrompt: 'Parça',
            leftParts,
            rightParts,
            givenParts: []
        };
    });
};

export const generateOfflineWordWeb = async (options: GeneratorOptions): Promise<WordWebData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const settings = getDifficultySettings(difficulty);
    const masterPool = shuffle(getWordsForDifficulty(difficulty));

    return Array.from({ length: worksheetCount }, (_, i) => {
        const count = itemCount || 8;
        const start = (i * count) % masterPool.length;
        const wordsToFind = masterPool.slice(start, start + count);
        
        return {
            title: 'Kelime Ağı (Hızlı Mod)',
            prompt: 'Kelimeleri bulmacaya yerleştir.',
            instruction: 'Verilen kelimeleri bulmacaya yerleştirin.',
            pedagogicalNote: 'Mantıksal yerleştirme ve kelime bilgisi.',
            imagePrompt: 'Ağ',
            wordsToFind,
            grid: Array.from({ length: settings.gridSize }, () => Array(settings.gridSize).fill(null)),
            keyWordPrompt: "Ortadaki anahtar kelime nedir?"
        };
    });
};

export const generateOfflineSyllableWordSearch = async (options: GeneratorOptions): Promise<SyllableWordSearchData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const searchData = await generateOfflineWordSearch({ ...options, itemCount });
    return searchData.map(data => ({
        title: 'Hece ve Kelime Avı (Hızlı Mod)',
        prompt: 'Heceleri birleştir, kelimeleri bulmacada ara.',
        instruction: 'Önce heceleri birleştirip kelimeleri oluştur, sonra bu kelimeleri bulmacada bul.',
        pedagogicalNote: 'Hece birleştirme ve görsel tarama becerilerini entegre eder.',
        imagePrompt: 'Hece',
        syllablesToCombine: ['ke', 'lem', 'tap', 'ki'],
        wordsToCreate: [{ syllable1: 'ke', syllable2: 'lem', answer: 'kalem' }, {syllable1: 'ki', syllable2: 'tap', answer: 'kitap'}],
        wordsToFindInSearch: data.words || [],
        grid: data.grid,
        passwordPrompt: "Şifreyi çöz."
    }));
};

export const generateOfflineWordSearchWithPassword = async (options: GeneratorOptions): Promise<WordSearchWithPasswordData[]> => {
    const searchData = await generateOfflineWordSearch(options);
    return searchData.map(data => ({
        title: 'Şifreli Kelime Avı (Hızlı Mod)',
        prompt: 'Kelimeleri bul ve şifreyi çöz.',
        instruction: 'Kelimeleri bulduktan sonra renkli kutulardaki harflerle şifreyi oluşturun.',
        pedagogicalNote: 'Dikkat ve sıralı işlem becerisi.',
        imagePrompt: 'Şifre',
        grid: data.grid,
        words: data.words || [],
        passwordCells: [{ row: 0, col: 0 }, { row: 1, col: 1 }, {row: 2, col: 2}]
    }));
};

export const generateOfflineWordWebWithPassword = async (options: GeneratorOptions): Promise<WordWebWithPasswordData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const settings = getDifficultySettings(difficulty);
    const masterPool = shuffle(getWordsForDifficulty(difficulty));

    return Array.from({ length: worksheetCount }, (_, i) => {
        const count = itemCount || 8;
        const start = (i * count) % masterPool.length;
        const words = masterPool.slice(start, start + count);

        return {
            title: 'Şifreli Kelime Ağı (Hızlı Mod)',
            prompt: 'Kelimeleri yerleştir ve şifreyi bul.',
            instruction: 'Kelimeleri yerleştirdikten sonra renkli sütundaki harflerle şifreyi oluşturun.',
            pedagogicalNote: 'Mantıksal yerleştirme ve dikkat.',
            imagePrompt: 'Şifre',
            words,
            grid: Array.from({ length: settings.gridSize }, () => Array(settings.gridSize).fill(null)),
            passwordColumnIndex: Math.floor(settings.gridSize / 2)
        };
    });
};

export const generateOfflineLetterGridWordFind = async (options: GeneratorOptions): Promise<LetterGridWordFindData[]> => {
    const searchData = await generateOfflineWordSearch(options);
    return searchData.map(data => ({
        title: 'Harf Tablosundan Kelime Bulma (Hızlı Mod)',
        prompt: 'Gizli kelimeleri bul ve metin yaz.',
        instruction: 'Tabloda gizlenmiş kelimeleri bulun ve bu kelimelerle bir metin yazın.',
        pedagogicalNote: 'Görsel tarama ve yaratıcı yazma.',
        imagePrompt: 'Kelime',
        grid: data.grid,
        words: data.words || [],
        writingPrompt: "Bulduğun kelimelerle bir hikaye yaz."
    }));
};

export const generateOfflineWordPlacementPuzzle = async (options: GeneratorOptions): Promise<WordPlacementPuzzleData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const settings = getDifficultySettings(difficulty);
    const masterPool = shuffle(getWordsForDifficulty(difficulty));

    return Array.from({ length: worksheetCount }, (_, i) => {
        const count = itemCount || 6;
        const start = (i * count) % masterPool.length;
        const words = masterPool.slice(start, start + count);
        
        return {
            title: 'Kelime Yerleştirme (Hızlı Mod)',
            prompt: 'Kelimeleri harf sayısına göre yerleştir.',
            instruction: 'Verilen kelimeleri harf sayılarına göre bulmaca diyagramına yerleştirin.',
            pedagogicalNote: 'Sınıflandırma ve mantıksal yerleştirme.',
            imagePrompt: 'Bulmaca',
            grid: Array.from({ length: settings.gridSize }, () => Array(settings.gridSize).fill(null)),
            wordGroups: [
                { length: 4, words: words.filter(w => w.length === 4) },
                { length: 5, words: words.filter(w => w.length === 5) }
            ],
            unusedWordPrompt: "Boşta kalan kelime hangisidir?"
        };
    });
};

export const generateOfflinePositionalAnagram = async (options: GeneratorOptions): Promise<PositionalAnagramData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const masterPool = shuffle(getWordsForDifficulty(difficulty));

    return Array.from({ length: worksheetCount }, (_, i) => {
        const count = itemCount || 4;
        const start = (i * count) % masterPool.length;
        const words = masterPool.slice(start, start + count);

        return {
            title: 'Yer Değiştirmeli Anagram (Hızlı Mod)',
            prompt: 'Numaralı kutulardaki harfleri değiştirerek kelimeler bulun.',
            instruction: 'Numaralı kutulardaki harflerin yerlerini değiştirerek anlamlı kelimeler bulun.',
            pedagogicalNote: 'Harf sırası farkındalığı ve problem çözme.',
            imagePrompt: 'Anagram',
            puzzles: words.map((word, idx) => ({
                id: idx,
                scrambled: shuffle(word.split('')).join(''),
                answer: word
            }))
        };
    });
};

export const generateOfflineImageAnagramSort = async (options: GeneratorOptions): Promise<ImageAnagramSortData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const masterPool = shuffle(getWordsForDifficulty(difficulty));

    return Array.from({ length: worksheetCount }, (_, i) => {
        const count = itemCount || 4;
        const start = (i * count) % masterPool.length;
        const words = masterPool.slice(start, start + count);

        return {
            title: 'Kart Sıralama (Hızlı Mod)',
            prompt: 'Kelimeleri çözüp alfabetik sıraya dizin.',
            instruction: 'Karışık kelimeleri çözüp ilgili görsellerle alfabetik olarak sıralayın.',
            pedagogicalNote: 'Kelime sıralama ve görsel destekli kod çözme.',
            imagePrompt: 'Sıralama',
            cards: words.map(word => ({
                imageDescription: word,
                imagePrompt: word,
                scrambledWord: shuffle(word.split('')).join(''),
                correctWord: word
            }))
        };
    });
};

export const generateOfflineAnagramImageMatch = async (options: GeneratorOptions): Promise<AnagramImageMatchData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const masterPool = shuffle(getWordsForDifficulty(difficulty));

    return Array.from({ length: worksheetCount }, (_, i) => {
        const count = itemCount || 4;
        const start = (i * count) % masterPool.length;
        const words = masterPool.slice(start, start + count);

        return {
            title: 'Resim - Kelime Eşleme (Hızlı Mod)',
            prompt: 'Kelimeleri çözüp resimlerle eşleştirin.',
            instruction: 'Karışık kelimeleri çözüp ilgili görsellerle eşleştirin.',
            pedagogicalNote: 'Kelime tanıma ve görsel eşleştirme.',
            imagePrompt: 'Eşleşme',
            wordBank: shuffle(words),
            puzzles: words.map(word => ({
                imageDescription: word,
                imagePrompt: word,
                partialAnswer: word.substring(0, 1) + "_".repeat(word.length - 1),
                correctWord: word
            }))
        };
    });
};
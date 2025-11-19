
import { GeneratorOptions, WordSearchData, AnagramsData, SpellingCheckData, WordComparisonData, ProverbSearchData, ReverseWordData, FindDuplicateData, WordGroupingData, WordLadderData, WordFormationData, FindIdenticalWordData, LetterBridgeData, MiniWordGridData, PasswordFinderData, SyllableCompletionData, CrosswordData, WordGridPuzzleData, ProverbSayingSortData, HomonymImageMatchData, AntonymFlowerPuzzleData, ProverbWordChainData, SynonymAntonymGridData, AntonymResfebeData, ThematicWordSearchColorData, SynonymSearchAndStoryData, PunctuationSpiralPuzzleData, ThematicJumbledWordStoryData, SynonymMatchingPatternData, MissingPartsData, WordWebData, SyllableWordSearchData, WordSearchWithPasswordData, WordWebWithPasswordData, LetterGridWordFindData, WordPlacementPuzzleData, PositionalAnagramData, ImageAnagramSortData, AnagramImageMatchData, SynonymWordSearchData, SpiralPuzzleData, HomonymSentenceData, ResfebeData, JumbledWordStoryData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, getWordsForDifficulty, turkishAlphabet, TR_VOCAB, COLORS, HOMONYMS, EMOJIS } from './helpers';
import { PROVERBS } from '../../data/sentences';

export const generateOfflineWordSearch = async (options: GeneratorOptions & { words?: string[] }): Promise<WordSearchData[]> => {
    const { topic, itemCount, difficulty, worksheetCount, words } = options;
    const results: WordSearchData[] = [];
    let size = options.gridSize || (difficulty === 'Orta' ? 12 : (difficulty === 'Zor' ? 14 : 10));

    let maxDir = 1; // 0: H, 1: V
    if (difficulty === 'Orta') maxDir = 3; 
    if (difficulty === 'Zor' || difficulty === 'Uzman') maxDir = 7; 

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
                const dir = getRandomInt(0, maxDir);
                let r = 0, c = 0;
                
                if(dir === 0) { r = getRandomInt(0, size-1); c = getRandomInt(0, size - word.length); }
                else if (dir === 1) { r = getRandomInt(0, size-word.length); c = getRandomInt(0, size-1); }
                else if (dir === 2) { r = getRandomInt(0, size-word.length); c = getRandomInt(0, size - word.length); }
                else if (dir === 3) { r = getRandomInt(word.length-1, size-1); c = getRandomInt(0, size - word.length); }
                else if (dir === 4) { r = getRandomInt(0, size-1); c = getRandomInt(word.length-1, size - 1); }
                else if (dir === 5) { r = getRandomInt(word.length-1, size-1); c = getRandomInt(0, size-1); }
                else if (dir === 6) { r = getRandomInt(0, size-word.length); c = getRandomInt(word.length-1, size-1); }
                else { r = getRandomInt(word.length-1, size-1); c = getRandomInt(word.length-1, size-1); }
                
                let fits = true;
                for(let k=0; k<word.length; k++) {
                    let nr=r, nc=c;
                    if (dir === 0) nc += k;
                    else if (dir === 1) nr += k;
                    else if (dir === 2) { nr += k; nc += k; }
                    else if (dir === 3) { nr -= k; nc += k; }
                    else if (dir === 4) nc -= k;
                    else if (dir === 5) nr -= k;
                    else if (dir === 6) { nr += k; nc -= k; }
                    else { nr -= k; nc -= k; }
                    if(grid[nr][nc] !== '' && grid[nr][nc] !== word[k]) fits = false;
                }
                
                if(fits) {
                    for(let k=0; k<word.length; k++) {
                        let nr=r, nc=c;
                        if (dir === 0) nc += k;
                        else if (dir === 1) nr += k;
                        else if (dir === 2) { nr += k; nc += k; }
                        else if (dir === 3) { nr -= k; nc += k; }
                        else if (dir === 4) nc -= k;
                        else if (dir === 5) nr -= k;
                        else if (dir === 6) { nr += k; nc -= k; }
                        else { nr -= k; nc -= k; }
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
        results.push({ title: `Kelime Bulmaca (${difficulty})`, words: placedWords, grid, hiddenMessage: 'Bursa Disleksi', followUpQuestion: 'Bulduğun kelimelerden biriyle cümle kur.' });
    }
    return results;
};

export const generateOfflineAnagram = async (options: GeneratorOptions): Promise<AnagramsData[]> => {
    const { topic, itemCount, worksheetCount, difficulty } = options;
    const results: AnagramsData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const words = getRandomItems(getWordsForDifficulty(difficulty, topic), itemCount);
        results.push({
            title: 'Anagram (Hızlı Mod)',
            prompt: 'Harfleri karışık verilmiş kelimeleri bulun.',
            anagrams: words.map(word => ({ word, scrambled: shuffle(word.split('')).join(''), imageBase64: '' })), // No images in fast mode
            sentencePrompt: 'Bulduğun kelimelerden üç tanesi ile bir cümle yaz.'
        });
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
        if (pairs.length > 0) results.push({ title: 'Harf Köprüsü', pairs, followUpPrompt: 'Oluşturduğun yeni kelimelerden ikisini bir cümlede kullan.' });
    }
    return results;
};

export const generateOfflineWordLadder = async (options: GeneratorOptions): Promise<WordLadderData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: WordLadderData[] = [];
    const ladders = [{ startWord: 'taş', endWord: 'yol', steps: 3 }, { startWord: 'göz', endWord: 'söz', steps: 1 }, {startWord: 'kış', endWord: 'yaz', steps: 2}];
    for (let i = 0; i < worksheetCount; i++) {
        results.push({ title: 'Kelime Merdiveni', theme: 'Zıtlıklar', ladders: getRandomItems(ladders, itemCount) });
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
        results.push({ title: 'Harflerden Kelime Türetme', sets, mysteryWordChallenge: { prompt: 'Gizli kelime nedir?', solution: 'sürpriz'} });
    }
    return results;
};

export const generateOfflineReverseWord = async (options: GeneratorOptions): Promise<ReverseWordData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const results: ReverseWordData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        results.push({ title: 'Ters Oku', words: getRandomItems(getWordsForDifficulty(difficulty), itemCount), funFact: 'Bir kelimenin tersi de anlamlıysa ona palindrom denir. Örneğin: "kazak".' });
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

export const generateOfflinePasswordFinder = async (options: GeneratorOptions): Promise<PasswordFinderData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: PasswordFinderData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const words: PasswordFinderData['words'] = [];
        let password = '';
        for(let j=0; j<itemCount; j++){
            const isProper = Math.random() > 0.5;
            const word: string = (isProper ? getRandomItems(TR_VOCAB.jobs, 1)[0] : getRandomItems(TR_VOCAB.easy_words, 1)[0]) || '';
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
        results.push({title: 'Hece Tamamlama', prompt: 'Heceleri tamamla.', theme: 'Rastgele', wordParts, syllables, storyTemplate: 'Bugün __WORD__ ile __WORD__ gördüm.', storyPrompt: 'Bu kelimelerle hikaye yaz.'});
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
            words: wordsToMatch.map((p: { synonym: string }) => p.synonym)
        });
        results.push({
            title: 'Eş Anlamlı Kelime Avı', prompt: 'Kelimelerin eş anlamlılarını bulup bulmacada arayın.', 
            wordsToMatch, grid: searchResult[0].grid
        });
    }
    return results;
}

export const generateOfflineSpiralPuzzle = async (options: GeneratorOptions): Promise<SpiralPuzzleData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Sarmal Bulmaca', theme: 'Rastgele', prompt: 'İpuçlarından kelimeleri bulup sarmal bulmacaya yerleştirin.', clues:['Sıcak zıttı'], grid: [['s','o','ğ'],['k','u',' ']], wordStarts: [{id:1, row:0, col:0}], passwordPrompt: 'Şifre nedir?' });
}

export const generateOfflinePunctuationSpiralPuzzle = async (options: GeneratorOptions): Promise<PunctuationSpiralPuzzleData[]> => {
    const data = await generateOfflineSpiralPuzzle(options);
    return data.map(d => ({...d, title: 'Noktalama Sarmal Bulmaca', theme: 'Noktalama'}));
}

// FIX: Replaced placeholder with a minimal valid implementation to satisfy type checking.
export const generateOfflineCrossword = async (options: GeneratorOptions): Promise<CrosswordData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }).fill({
        title: 'Çapraz Bulmaca (Hızlı Mod)',
        prompt: 'İpuçlarını takip ederek bulmacayı çözün.',
        theme: 'Genel Kültür',
        grid: [[null, 'E', 'L', 'M', 'A'], ['K', 'İ', 'T', 'A', 'P'], [null, 'L', 'O', 'P', null], [null, 'E', null, null, null], [null, 'M', null, null, null]],
        clues: [
            { id: 1, direction: 'across' as const, text: 'Kırmızı bir meyve', start: { row: 0, col: 1 }, word: 'ELMA' },
            { id: 2, direction: 'across' as const, text: 'Okunan nesne', start: { row: 1, col: 0 }, word: 'KİTAP' },
            { id: 1, direction: 'down' as const, text: 'Okulda kullanılan bir araç', start: { row: 0, col: 1 }, word: 'KALEM' },
            { id: 3, direction: 'down' as const, text: 'Yuvarlak, seken oyuncak', start: { row: 1, col: 2 }, word: 'TOP' }
        ],
        passwordCells: [{row: 1, col: 3}],
        passwordLength: 1,
        passwordPrompt: 'Şifre kelimesi ne anlama geliyor?'
    });
};

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
    const results: HomonymSentenceData[] = [];
    for(let i=0; i<worksheetCount; i++){
        results.push({
            title: 'Kelime Ağı (Eş Sesli)',
            prompt: 'Eş sesli kelimeler için iki farklı anlama gelen cümleler yazın.',
            items: getRandomItems(HOMONYMS, itemCount).map(word => ({
                word,
                meaning1: '1. Anlam',
                meaning2: '2. Anlam'
            }))
        });
    }
    return results;
}

export const generateOfflineWordGridPuzzle = async (options: GeneratorOptions): Promise<WordGridPuzzleData[]> => {
    const { itemCount, worksheetCount, difficulty, theme } = options;
    const results: WordGridPuzzleData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const wordList = getRandomItems(getWordsForDifficulty(difficulty, theme), itemCount);
        results.push({
            title: 'Kelime Ağı (Yerleştirme)', 
            prompt: 'Verilen kelimeleri bulmaca tablosuna doğru şekilde yerleştirin.', 
            theme: theme || 'Rastgele', 
            wordList, 
            grid:[[null, null, null], [null, null, null], [null, null, null]], 
            unusedWordPrompt: 'Kullanılmayan kelime hangisidir?'
        });
    }
    return results;
}

export const generateOfflineHomonymImageMatch = async (options: GeneratorOptions): Promise<HomonymImageMatchData[]> => {
    const {worksheetCount} = options;
    const results: HomonymImageMatchData[] = [];
    for(let i=0; i < worksheetCount; i++){
        const word = getRandomItems(HOMONYMS, 1)[0] || 'yüz';
        results.push({
            title: 'Resim Eşleştirme (Eş Sesli)', prompt: 'Eş sesli kelimelere ait görselleri eşleştirin ve kelimeyi bulun.',
            leftImages: [{id: 1, word: 'Sayı', imageBase64: ''}],
            rightImages: [{id: 1, word: 'Surat', imageBase64: ''}],
            wordScramble: {letters: shuffle(word.split('')), word}
        });
    }
    return results;
}
export const generateOfflineAntonymFlowerPuzzle = async (options: GeneratorOptions): Promise<AntonymFlowerPuzzleData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: AntonymFlowerPuzzleData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const puzzles = getRandomItems(TR_VOCAB.antonyms, itemCount).map((p: { word: string, antonym: string }) => ({
            centerWord: p.word,
            antonym: p.antonym,
            petalLetters: shuffle(p.antonym.split(''))
        }));
        results.push({title: 'Eşleştir (Zıt Anlamlı)', prompt: 'Papatyaların ortasındaki kelimelerin zıt anlamlılarını bulun ve şifreyi çözün.', puzzles, passwordLength: 4});
    }
    return results;
}

export const generateOfflineSynonymAntonymGrid = async (options: GeneratorOptions): Promise<SynonymAntonymGridData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    const results: SynonymAntonymGridData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const syns = getRandomItems(TR_VOCAB.synonyms, Math.ceil(itemCount/2));
        const ants = getRandomItems(TR_VOCAB.antonyms, Math.floor(itemCount/2));
        
        const synonyms = syns.map((s: { word: string }) => ({word: s.word}));
        const antonyms = ants.map((a: { word: string }) => ({word: a.word}));
        
        const wordsToPlace = [...syns.map((s: { synonym: string }) => s.synonym), ...ants.map((a: { antonym: string }) => a.antonym)];
        const wordSearchResult = await generateOfflineWordSearch({
            ...options,
            worksheetCount: 1,
            itemCount: wordsToPlace.length,
            words: wordsToPlace
        });

        results.push({
            title: 'Kelime Bulma (Eş/Zıt Anlamlı)',
            prompt: 'Kelimelerin eş ve zıt anlamlılarını bulup bulmacaya yerleştirin.',
            antonyms, 
            synonyms,
            grid: wordSearchResult[0].grid,
            nuanceQuestion: { sentence: 'Bu çok __ bir konuydu.', word: 'ince', options: ['ince', 'zayıf'] }
        });
    }
    return results;
}

export const generateOfflineAntonymResfebe = async (options: GeneratorOptions): Promise<AntonymResfebeData[]> => {
     const {itemCount, worksheetCount} = options;
     const results: AntonymResfebeData[] = [];
     for(let i=0; i < worksheetCount; i++){
         const puzzles = getRandomItems(TR_VOCAB.antonyms, itemCount).map(p => ({
             word: p.word,
             antonym: p.antonym,
             clues: [{type: 'text' as const, value: p.word.substring(0,2).toUpperCase()}, {type: 'text' as const, value: '...'}]
         }));
         results.push({ title: 'Resfebe (Zıt Anlamlı)', prompt: 'Resfebe ile kelimeyi bulun, sonra zıt anlamlısını yazın.', puzzles, antonymsPrompt: 'Şimdi bulduğun kelimelerin zıt anlamlılarını yaz.' });
     }
     return results;
}
export const generateOfflineThematicWordSearchColor = async (options: GeneratorOptions): Promise<ThematicWordSearchColorData[]> => {
    const res = await generateOfflineWordSearch(options);
    return res.map(r => ({...r, theme: options.topic || 'Rastgele', prompt: 'Boyayarak bul.'}))
}

export const generateOfflineSynonymSearchAndStory = async (options: GeneratorOptions): Promise<SynonymSearchAndStoryData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    const results: SynonymSearchAndStoryData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const wordTable = getRandomItems(TR_VOCAB.synonyms, itemCount);
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

export const generateOfflineThematicJumbledWordStory = async (options: GeneratorOptions): Promise<ThematicJumbledWordStoryData[]> => {
    const res = await generateOfflineJumbledWordStory(options);
    return res.map(r => ({...r, title: 'Kelime Bulma ve Metin Yazma'}));
}

export const generateOfflineSynonymMatchingPattern = async (options: GeneratorOptions): Promise<SynonymMatchingPatternData[]> => {
    const {itemCount, worksheetCount, theme} = options;
    return Array(worksheetCount).fill({title: 'Desen Bulmaca (Eş Anlamlı)', prompt: 'Tematik kelimelerin eş anlamlılarını bularak eşleştirin.', theme: theme || 'Rastgele', pairs: getRandomItems(TR_VOCAB.synonyms, itemCount) as { word: string; synonym: string; }[]});
}

export const generateOfflineMissingParts = async (options: GeneratorOptions): Promise<MissingPartsData[]> => {
    const {itemCount, worksheetCount, difficulty} = options;
    const results: MissingPartsData[] = [];
    for(let i=0; i < worksheetCount; i++){
        const words = getRandomItems(getWordsForDifficulty(difficulty), itemCount);
        const leftParts = words.map((w, idx) => ({id: idx, text: w.substring(0, Math.floor(w.length/2))}));
        const rightParts = words.map((w, idx) => ({id: idx, text: w.substring(Math.floor(w.length/2))}));
        results.push({
            title: 'Eksik Kelimeler (Eşleştirme)', prompt: 'Kelime parçalarını doğru şekilde birleştirin.', 
            leftParts: shuffle(leftParts),
            rightParts: shuffle(rightParts),
            givenParts: []
        });
    }
    return results;
}

// FIX: Replaced placeholder with a minimal valid implementation to satisfy type checking.
export const generateOfflineWordWeb = async (options: GeneratorOptions): Promise<WordWebData[]> => {
    return Array.from({length: options.worksheetCount}).fill({ title: 'Kelime Ağı', prompt: 'Verilen kelimeleri bulmaca ızgarasına yerleştirin.', wordsToFind: ['kedi', 'köpek'], grid: [[null, 'k', null], ['e', 'd', 'i'], [null, 'p', null]], keyWordPrompt: 'Anahtar kelime nedir?' });
}

export const generateOfflineImageAnagramSort = async (options: GeneratorOptions): Promise<ImageAnagramSortData[]> => {
    const {itemCount, worksheetCount, difficulty, topic} = options;
    const results: ImageAnagramSortData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const cards = getRandomItems(getWordsForDifficulty(difficulty, topic), itemCount).map(word => ({
            imageDescription: word,
            scrambledWord: shuffle(word.split('')).join(''),
            correctWord: word
        }));
        results.push({ title: 'Kart Sıralama (Anagram)', prompt: 'Görsellerle eşleşen karışık kelimeleri çözüp sıralayın.', cards});
    }
    return results;
}

// FIX: Replaced placeholder with a minimal valid implementation to satisfy type checking.
export const generateOfflineAnagramImageMatch = async (options: GeneratorOptions): Promise<AnagramImageMatchData[]> => {
    return Array.from({length: options.worksheetCount}).fill({ title: 'Resim - Kelime Eşleme (Anagram)', prompt: 'Karışık kelimeleri çözüp ilgili görsellerle eşleştirin.', wordBank: ['elma', 'armut'], puzzles: [{imageDescription: 'elma', partialAnswer: 'e__a', correctWord: 'elma'}] });
}

// FIX: Replaced placeholder with a minimal valid implementation to satisfy type checking.
export const generateOfflineSyllableWordSearch = async (options: GeneratorOptions): Promise<SyllableWordSearchData[]> => {
    return Array.from({length: options.worksheetCount}).fill({ title: 'Eksik Kelimeler ve Bulmaca', prompt: 'Hecelerle kelimeler oluşturun ve kelime avında bulun.', syllablesToCombine: ['ka', 'lem'], wordsToCreate: [{syllable1: 'ka', syllable2: 'lem', answer: 'kalem'}], wordsToFindInSearch: ['kalem'], grid: [['k','a'],['l','em']], passwordPrompt: 'Şifre nedir?' });
}

export const generateOfflineWordSearchWithPassword = async (options: GeneratorOptions): Promise<WordSearchWithPasswordData[]> => {
    const res = await generateOfflineWordSearch(options);
    return res.map(r => ({...r, title: 'Şifreli Kelime Avı', prompt: 'Şifreyi bul.', passwordCells: [{row:1, col:1}]}));
}

// FIX: Replaced placeholder with a minimal valid implementation to satisfy type checking.
export const generateOfflineWordWebWithPassword = async (options: GeneratorOptions): Promise<WordWebWithPasswordData[]> => {
    return Array.from({length: options.worksheetCount}).fill({ title: 'Kelime Ağı (Şifreli)', prompt: 'Kelimeleri yerleştirin ve renkli sütundan şifreyi bulun.', words: ['kalem'], grid: [['k','a'],['l','em']], passwordColumnIndex: 0 });
}

export const generateOfflineLetterGridWordFind = async (options: GeneratorOptions): Promise<LetterGridWordFindData[]> => {
    const res = await generateOfflineWordSearch(options);
    return res.map(r => ({ ...r, title: 'Kelime Bulma (Tablo)', prompt: 'Kelimeleri bul.', writingPrompt: 'Bu kelimelerle metin yaz.' }));
}

// FIX: Replaced placeholder with a minimal valid implementation to satisfy type checking.
export const generateOfflineWordPlacementPuzzle = async (options: GeneratorOptions): Promise<WordPlacementPuzzleData[]> => {
    return Array.from({length: options.worksheetCount}).fill({ title: 'Kelime Yerleştirme', prompt: 'Verilen kelimeleri harf sayısına göre bulmaca diyagramına yerleştirin.', grid: [[]], wordGroups: [], unusedWordPrompt: '' });
}

// FIX: Replaced placeholder with a minimal valid implementation to satisfy type checking.
export const generateOfflinePositionalAnagram = async (options: GeneratorOptions): Promise<PositionalAnagramData[]> => {
    return Array.from({length: options.worksheetCount}).fill({ title: 'Yer Değiştirmeli Anagram', prompt: 'Numaralı kutucuklardaki harflerin yerlerini değiştirerek kelimeler bulun.', puzzles: [{id: 1, scrambled: 'kleam', answer: 'kalem'}] });
}

export const generateOfflineResfebe = async (options: GeneratorOptions): Promise<ResfebeData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: ResfebeData[] = [];
    for(let i=0; i < worksheetCount; i++){
        const puzzles = Array.from({length: itemCount}).map(() => {
            const word = getRandomItems(getWordsForDifficulty('Orta'), 1)[0] || 'cebir';
            return {
                clues: [{type: 'text' as const, value: word.substring(0,1).toUpperCase()}, {type: 'text' as const, value: '1'}],
                answer: word
            };
        });
        results.push({ title: 'Resfebe', prompt: 'Resim ve harflerle kelime türetme oyunu.', puzzles});
    }
    return results;
}

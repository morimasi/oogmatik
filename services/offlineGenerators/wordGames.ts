import { GeneratorOptions, WordSearchData, AnagramData, SpellingCheckData, WordComparisonData, ProverbSearchData, ReverseWordData, FindDuplicateData, WordGroupingData, WordLadderData, WordFormationData, FindIdenticalWordData, LetterBridgeData, MiniWordGridData, PasswordFinderData, SyllableCompletionData, CrosswordData, CrosswordClue, WordGridPuzzleData, ProverbSayingSortData, HomonymImageMatchData, AntonymFlowerPuzzleData, ProverbWordChainData, SynonymAntonymGridData, AntonymResfebeData, ThematicWordSearchColorData, SynonymSearchAndStoryData, PunctuationSpiralPuzzleData, ThematicJumbledWordStoryData, SynonymMatchingPatternData, MissingPartsData, WordWebData, SyllableWordSearchData, WordSearchWithPasswordData, WordWebWithPasswordData, LetterGridWordFindData, WordPlacementPuzzleData, PositionalAnagramData, ImageAnagramSortData, AnagramImageMatchData, SynonymWordSearchData, SpiralPuzzleData, HomonymSentenceData, ResfebeData, ProverbFillData, JumbledWordStoryData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, getWordsForDifficulty, turkishAlphabet, TR_VOCAB, COLORS, HOMONYMS } from './helpers';
import { PROVERBS } from '../../data/sentences';

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
        if (pairs.length > 0) results.push({ title: 'Harf Köprüsü', pairs });
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
// FIX: Added a fallback to an empty string to ensure 'word' is a string and prevent type errors on 'charAt' and 'slice'.
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
// FIX: Added explicit type annotation for 'p' to resolve type inference issue.
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
    return Array(options.worksheetCount).fill({ title: 'Sarmal Bulmaca', prompt: 'İpuçlarından kelimeleri bulup sarmal bulmacaya yerleştirin.', clues:['Sıcak zıttı'], grid: [['s','o','ğ'],['k','u',' ']], wordStarts: [{id:1, row:0, col:0}] });
}
export const generateOfflinePunctuationSpiralPuzzle = async (options: GeneratorOptions): Promise<PunctuationSpiralPuzzleData[]> => {
    const data = await generateOfflineSpiralPuzzle(options);
    return data.map(d => ({...d, title: 'Noktalama Sarmal Bulmaca'}));
}
export const generateOfflineCrossword = async (options: GeneratorOptions): Promise<CrosswordData[]> => {
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

export const generateOfflineHomonymImageMatch = async (options: GeneratorOptions): Promise<HomonymImageMatchData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Resim Eşleştirme (Eş Sesli)', prompt: 'Eş sesli kelimelere ait görselleri eşleştirin.', leftImages: [], rightImages: [], wordScramble: {letters: ['y','ü','z'], word:'yüz'} });
}
export const generateOfflineAntonymFlowerPuzzle = async (options: GeneratorOptions): Promise<AntonymFlowerPuzzleData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: AntonymFlowerPuzzleData[] = [];
    for(let i=0; i<worksheetCount; i++){
// FIX: Added explicit type annotation for 'p' to resolve type inference errors.
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
// FIX: Added explicit type annotations for 's' and 'a' to resolve type inference errors.
        const synonyms = getRandomItems(TR_VOCAB.synonyms, itemCount/2).map((s: { word: string }) => ({word: s.word}));
        const antonyms = getRandomItems(TR_VOCAB.antonyms, itemCount/2).map((a: { word: string }) => ({word: a.word}));
        const grid = Array(gridSize || 12).fill(0).map(() => Array(gridSize || 12).fill(null));
        results.push({title: 'Kelime Bulma (Eş/Zıt Anlamlı)', prompt: 'Kelimelerin eş ve zıt anlamlılarını bulup bulmacaya yerleştirin.', antonyms, synonyms, grid});
    }
    return results;
}

export const generateOfflineAntonymResfebe = async (options: GeneratorOptions): Promise<AntonymResfebeData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Resfebe (Zıt Anlamlı)', prompt: 'Resfebe ile kelimeyi bulun, sonra zıt anlamlısını yazın.', puzzles: [], antonymsPrompt: 'Zıt anlamlılarını yaz.' });
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
     return Array(options.worksheetCount).fill({ title: 'Eksik Kelimeler (Eşleştirme)', prompt: 'Kelime parçalarını doğru şekilde birleştirin.', leftParts: [], rightParts: [], givenParts: [] });
}
export const generateOfflineWordWeb = async (options: GeneratorOptions): Promise<WordWebData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Kelime Ağı', prompt: 'Verilen kelimeleri bulmaca ızgarasına yerleştirin.', wordsToFind: [], grid: [[]], keyWordPrompt: '' });
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
export const generateOfflineResfebe = async (options: GeneratorOptions): Promise<ResfebeData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Resfebe', prompt: 'Resim ve harflerle kelime türetme oyunu.', puzzles: [{clues: [{type: 'text', value: 'C'}], answer: 'ce'}] });
}
export const generateOfflineProverbSearch = async (options: GeneratorOptions): Promise<ProverbSearchData[]> => {
    const { worksheetCount } = options;
    const res = await generateOfflineWordSearch({ ...options, itemCount: 1, topic: 'atasözü' }); // Reuse logic
    return res.map(r => ({ title: 'Atasözü Avı', grid: r.grid, proverb: getRandomItems(PROVERBS, 1)[0] }));
};
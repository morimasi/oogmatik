
import { 
    FindTheDifferenceData, WordComparisonData, ShapeMatchingData, FindIdenticalWordData, GridDrawingData, SymbolCipherData, BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, CoordinateCipherData, WordConnectData, ProfessionConnectData, MatchstickSymmetryData, VisualOddOneOutThemedData, PunctuationColoringData, SynonymAntonymColoringData, StarHuntData, ShapeCountingData, ShapeType,
    GeneratorOptions
} from '../../types';
import { shuffle, getRandomInt, getRandomItems, getWordsForDifficulty, turkishAlphabet, SHAPE_TYPES, TR_VOCAB, COLORS, generateSmartConnectGrid, CONNECT_COLORS, ITEM_CATEGORIES, CATEGORY_NAMES, EMOJI_MAP, generateRandomPattern, generateLatinSquare, generateMaze, getDifficultySettings } from './helpers';

const dotArtShapes: Record<string, { dots: { cx: number; cy: number }[]; name: string; }> = {
    'heart': {
        name: 'Kalp',
        dots: [
            { cx: 50, cy: 90 }, { cx: 40, cy: 80 }, { cx: 60, cy: 80 }, { cx: 30, cy: 70 }, { cx: 70, cy: 70 },
            { cx: 20, cy: 60 }, { cx: 80, cy: 60 }, { cx: 20, cy: 50 }, { cx: 80, cy: 50 }, { cx: 30, cy: 40 },
            { cx: 70, cy: 40 }, { cx: 40, cy: 30 }, { cx: 60, cy: 30 }, { cx: 50, cy: 40 }
        ]
    },
    'house': {
        name: 'Ev',
        dots: [
            { cx: 20, cy: 80 }, { cx: 30, cy: 80 }, { cx: 40, cy: 80 }, { cx: 50, cy: 80 }, { cx: 60, cy: 80 }, { cx: 70, cy: 80 }, { cx: 80, cy: 80 },
            { cx: 20, cy: 70 }, { cx: 80, cy: 70 }, { cx: 20, cy: 60 }, { cx: 80, cy: 60 }, { cx: 20, cy: 50 }, { cx: 80, cy: 50 },
            { cx: 50, cy: 20 }, { cx: 40, cy: 30 }, { cx: 60, cy: 30 }, { cx: 30, cy: 40 }, { cx: 70, cy: 40 },
            { cx: 40, cy: 60 }, { cx: 50, cy: 60 }, { cx: 60, cy: 60 }, 
        ]
    },
    'star': {
        name: 'Yıldız',
        dots: [
            { cx: 50, cy: 10 }, { cx: 60, cy: 40 }, { cx: 90, cy: 40 }, { cx: 65, cy: 60 },
            { cx: 75, cy: 90 }, { cx: 50, cy: 70 }, { cx: 25, cy: 90 }, { cx: 35, cy: 60 },
            { cx: 10, cy: 40 }, { cx: 40, cy: 40 }
        ]
    }
};

const matchstickPatterns = [
    { name: 'House', lines: [{x1:1, y1:3, x2:3, y2:1}, {x1:3, y1:1, x2:5, y2:3}, {x1:1, y1:3, x2:1, y2:5}, {x1:1,y1:5, x2:5, y2:5}] },
    { name: 'Boat', lines: [{x1:0, y1:4, x2:6, y2:4}, {x1:1, y1:4, x2:2, y2:3}, {x1:5,y1:4, x2:4, y2:3}, {x1:2,y1:3, x2:4, y2:3}] },
    { name: 'Fish', lines: [{x1:1, y1:3, x2:3, y2:1}, {x1:1, y1:3, x2:3, y2:5}, {x1:3,y1:1, x2:3,y2:5}] }
];

const pixelArtPatterns = {
    'heart': [
        [0,0,0,0,0,0,0,0],
        [0,1,1,0,0,1,1,0],
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0]
    ],
    'smile': [
        [0,0,1,1,1,1,0,0],
        [0,1,0,0,0,0,1,0],
        [1,0,1,0,0,1,0,1],
        [1,0,0,0,0,0,0,1],
        [1,0,1,0,0,1,0,1],
        [1,0,0,1,1,0,0,1],
        [0,1,0,0,0,0,1,0],
        [0,0,1,1,1,1,0,0]
    ],
    'boat': [
        [0,0,0,0,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,1,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [1,0,0,1,1,0,0,1],
        [1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,0]
    ],
    'diamond': [
        [0,0,0,1,1,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,0,0],
        [0,0,0,1,1,0,0,0]
    ]
};

export const generateOfflineFindTheDifference = async (options: GeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { topic, itemCount, worksheetCount, difficulty } = options;
    const results: FindTheDifferenceData[] = [];
    const pool = [...TR_VOCAB.confusing_words.flat(), ...getWordsForDifficulty(difficulty, topic)];
    
    for (let i = 0; i < worksheetCount; i++) {
        const rows = Array.from({ length: itemCount || 5 }).map(() => {
            const baseWord = getRandomItems(pool, 1)[0];
            const correctIndex = getRandomInt(0, 3);
            let differentWord = '';
            const chars = baseWord.split('');

            if (difficulty === 'Başlangıç' && chars.length > 1) { 
                [chars[0], chars[chars.length - 1]] = [chars[chars.length - 1], chars[0]]; 
                differentWord = chars.join(''); 
            } else if (difficulty === 'Orta' && chars.length > 2) { 
                const pos = getRandomInt(1, chars.length - 2); 
                chars[pos] = turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)]; 
                differentWord = chars.join(''); 
            } else { 
                if (baseWord.includes('b')) differentWord = baseWord.replace('b', 'd');
                else if (baseWord.includes('d')) differentWord = baseWord.replace('d', 'b');
                else if (baseWord.includes('p')) differentWord = baseWord.replace('p', 'q');
                else if (baseWord.includes('q')) differentWord = baseWord.replace('q', 'p');
                else if (baseWord.includes('m')) differentWord = baseWord.replace('m', 'n');
                else if (baseWord.includes('n')) differentWord = baseWord.replace('n', 'm');
                else if (chars.length > 1) { 
                    const pos = getRandomInt(0, chars.length - 1); 
                    chars[pos] = getRandomItems(turkishAlphabet.split('').filter(c => c !== chars[pos]), 1)[0]; 
                    differentWord = chars.join(''); 
                } else { 
                    differentWord = baseWord + '.'; 
                }
            }
            
            if (!differentWord || differentWord === baseWord) differentWord = baseWord.split('').reverse().join('');

            const items = Array(4).fill(baseWord);
            items[correctIndex] = differentWord;
            return { 
                items, 
                correctIndex, 
                visualDistractionLevel: (difficulty === 'Uzman' ? 'high' : 'medium') as 'low' | 'medium' | 'high'
            };
        });
        results.push({ 
            title: `Farklı Olanı Bul (Hızlı Mod)`, 
            instruction: "Her satırda, diğerlerinden farklı yazılmış veya görünen kelimeyi bulup işaretleyin.",
            pedagogicalNote: "Bu etkinlik görsel ayrım ve detaylara dikkat becerisini güçlendirir.",
            imagePrompt: 'Fark',
            rows 
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
            instruction: "İki kutuyu karşılaştırın ve sadece bir kutuda olup diğerinde olmayan kelimeleri bulun.",
            pedagogicalNote: "Görsel tarama ve kısa süreli bellek kullanımını destekler.",
            imagePrompt: 'Karşılaştırma',
            box1Title: 'Liste A',
            box2Title: 'Liste B',
            wordList1: shuffle([...commonWords, ...list1_diff]),
            wordList2: shuffle([...commonWords, ...list2_diff]),
            correctDifferences: [...list1_diff, ...list2_diff]
        });
    }
    return results;
};

export const generateOfflineShapeMatching = async (options: GeneratorOptions): Promise<ShapeMatchingData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const results: ShapeMatchingData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const shapeCount = difficulty === 'Başlangıç' ? 2 : (difficulty === 'Orta' ? 3 : 4);
        const leftColumn = Array.from({ length: itemCount || 5 }, (_, k) => ({ 
            id: k + 1, 
            shapes: getRandomItems(SHAPE_TYPES, shapeCount),
            color: getRandomItems(COLORS, 1)[0].css
        }));
        const rightColumn = shuffle(leftColumn.map((item, index) => ({ 
            id: String.fromCharCode(65 + index), 
            shapes: item.shapes,
            color: item.color 
        })));
        
        results.push({ 
            title: 'Şekil Eşleştirme', 
            instruction: "Sol sütundaki şekil gruplarını sağ sütundaki eşleriyle çizgilerle birleştirin.",
            pedagogicalNote: "Görsel form algısı ve eşleştirme becerisi çalışmasıdır.",
            imagePrompt: 'Şekiller',
            leftColumn, 
            rightColumn,
            complexity: shapeCount
        });
    }
    return results;
};

export const generateOfflineFindIdenticalWord = async (options: GeneratorOptions): Promise<FindIdenticalWordData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: FindIdenticalWordData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const groups = getRandomItems(TR_VOCAB.confusing_words, itemCount || 5).map(pair => ({ 
            words: pair as [string, string],
            distractors: [pair[0] + 'a', pair[1].split('').reverse().join('')]
        }));
        results.push({ 
            title: 'Aynısını Bul', 
            instruction: "Verilen örneğin aynısı olan kelimeyi seçenekler arasından bulun.",
            pedagogicalNote: "Benzer uyaranlar arasından doğru olanı seçme (şekil-zemin) becerisi.",
            imagePrompt: 'Kelime',
            groups 
        });
    }
    return results;
};

export const generateOfflineGridDrawing = async (options: GeneratorOptions): Promise<GridDrawingData[]> => {
    const {itemCount, worksheetCount, gridSize, difficulty} = options;
    const results: GridDrawingData[] = [];
    for(let i=0; i < worksheetCount; i++){
        const dim = gridSize || 6;
        const density = difficulty === 'Başlangıç' ? 1 : (difficulty === 'Orta' ? 2 : 3);
        
        const drawings = Array.from({length: itemCount || 2}).map(() => {
            return { 
                lines: generateRandomPattern(dim, density) as [number, number][][],
                complexityLevel: difficulty
            };
        });
        results.push({ 
            title: 'Kare Çizim / Ayna Çizimi', 
            instruction: "Soldaki deseni sağdaki boş ızgaraya birebir aynı olacak şekilde çizin.",
            pedagogicalNote: "El-göz koordinasyonu ve uzamsal konumlandırma becerisini geliştirir.",
            imagePrompt: 'Çizim',
            gridDim: dim, 
            drawings 
        });
    }
    return results;
};

export const generateOfflineSymbolCipher = async (options: GeneratorOptions): Promise<SymbolCipherData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const results: SymbolCipherData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const cipherKey = getRandomItems(SHAPE_TYPES, 10).map((shape, index) => ({ 
            shape, 
            letter: turkishAlphabet[index],
            color: '#000'
        }));
        
        const availableLetters = cipherKey.map(k => k.letter);
        const simpleWords = ['baba', 'baca', 'aba', 'caba', 'ede', 'fece'].filter(w => w.split('').every(l => availableLetters.includes(l)));
        
        const wordsToUse = simpleWords.length >= (itemCount || 5) ? getRandomItems(simpleWords, itemCount || 5) : Array.from({length: itemCount || 5}, () => 
            Array.from({length: 4}, () => getRandomItems(availableLetters, 1)[0]).join('')
        );

        const wordsToSolve = wordsToUse.map(word => {
            const shapeSequence = word.split('').map(letter => cipherKey.find(item => item.letter === letter)!.shape);
            return { shapeSequence, wordLength: word.length, answer: word };
        });

        results.push({ 
            title: 'Şekil Şifresi', 
            instruction: "Anahtar tablosunu kullanarak şekillerle yazılmış şifreli kelimeleri çözün.",
            pedagogicalNote: "Sembolik kodlama ve kod çözme becerisi, okuma-yazma temelli bilişsel süreçleri destekler.",
            imagePrompt: 'Şifre',
            cipherKey, 
            wordsToSolve 
        });
    }
    return results;
};

export const generateOfflineBlockPainting = async (options: GeneratorOptions): Promise<BlockPaintingData[]> => {
    const { worksheetCount } = options;
    const results: BlockPaintingData[] = [];
    const keys = Object.keys(pixelArtPatterns);
    
    for (let i = 0; i < worksheetCount; i++) {
        // Select a random standard pattern
        const patternKey = keys[getRandomInt(0, keys.length - 1)] as keyof typeof pixelArtPatterns;
        const pattern = pixelArtPatterns[patternKey];

        results.push({
            title: 'Blok Boyama (Piksel Sanatı)',
            instruction: "Soldaki örneğe bakarak, sağdaki boş ızgaradaki kareleri aynı şekilde boya.",
            pedagogicalNote: "Görsel bütünleme, parça-bütün ilişkisi ve konumsal kopyalama becerisi.",
            imagePrompt: 'Blok',
            grid: {rows: 8, cols: 8},
            targetPattern: pattern,
            shapes: [
                { id: 1, color: '#3B82F6', pattern: [[1]], count: pattern.flat().filter(x => x===1).length },
            ]
        });
    }
    return results;
};

export const generateOfflineVisualOddOneOut = async (options: GeneratorOptions): Promise<VisualOddOneOutData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const results: VisualOddOneOutData[] = [];
    
    for(let i=0; i<worksheetCount; i++) {
        const rows = Array.from({length: itemCount || 5}).map(() => {
            const correctIndex = getRandomInt(0, 3);
            
            if (difficulty === 'Zor' || difficulty === 'Uzman') {
                 const baseSegments = [true, true, false, true, false, true, true, false, false];
                 const rotate90 = (segs: boolean[]) => [segs[6], segs[3], segs[0], segs[7], segs[4], segs[1], segs[8], segs[5], segs[2]];
                 const r0 = baseSegments;
                 const r90 = rotate90(r0);
                 const r180 = rotate90(r90);
                 const r270 = rotate90(r180);
                 const rotations = [r0, r90, r180, r270];
                 const oddOne = [...r0];
                 oddOne[4] = !oddOne[4]; 
                 const items = Array(4).fill(null).map((_, idx) => {
                     if (idx === correctIndex) return { segments: oddOne, rotation: 0 };
                     return { segments: rotations[idx % 4], rotation: 0 };
                 });
                 return { items, correctIndex, reason: "Diğerleri aynı şeklin döndürülmüş hali, bu farklı." };
            } else {
                const standard = [true, true, true, true, true, true, true, true, true];
                for(let k=0; k<3; k++) standard[getRandomInt(0,8)] = false;
                const odd = [...standard];
                const flipIdx = getRandomInt(0, 8);
                odd[flipIdx] = !odd[flipIdx];
                const items = Array(4).fill(null).map((_, idx) => ({ segments: idx === correctIndex ? odd : standard }));
                return { items, correctIndex, reason: "Diğerlerinden farklı çizgiye sahip." };
            }
        });

        results.push({
            title: 'Görsel Farklı Olanı Bul',
            instruction: difficulty === 'Uzman' ? "Şekiller döndürülmüş olabilir. Yapısal olarak farklı olanı bul." : "Her satırda kuralı bozan şekli bul.",
            pedagogicalNote: "Görsel sınıflandırma, zihinsel döndürme ve mantıksal çıkarım.",
            imagePrompt: 'Şekil',
            rows
        });
    }
    return results;
}

export const generateOfflineSymmetryDrawing = async (options: GeneratorOptions): Promise<SymmetryDrawingData[]> => {
    const {itemCount, worksheetCount, gridSize, difficulty} = options;
    const results: SymmetryDrawingData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const dim = gridSize || 10;
        const dotCount = difficulty === 'Başlangıç' ? 3 : (difficulty === 'Orta' ? 5 : 7);
        const dots = Array.from({length: dotCount}).map(() => ({x: getRandomInt(0, (dim/2) - 1), y: getRandomInt(0, dim-1), color: '#000'}));
        results.push({
            title: 'Simetri Tamamlama',
            instruction: "Kırmızı çizgiye göre şeklin yansımasını (ayna görüntüsünü) çizin.",
            pedagogicalNote: "Uzamsal algı ve simetri kavramını pekiştirir.",
            imagePrompt: 'Simetri',
            gridDim: dim,
            dots,
            axis: 'vertical',
            isMirrorImage: true
        });
    }
    return results;
}

export const generateOfflineFindDifferentString = async (options: GeneratorOptions): Promise<FindDifferentStringData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: FindDifferentStringData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const rows = Array.from({length:itemCount || 8}).map(() => {
            const base = getRandomItems(["X89K", "M2N4", "A7B3", "K9L1", "7UP5"], 1)[0];
            const diff = base.substring(0, 2) + (base.charAt(2) === '9' ? '8' : '9') + base.substring(3);
            const items = shuffle([base, base, base, diff]);
            return {items, correctIndex: items.indexOf(diff)};
        });
        results.push({
            title: 'Farklı Diziyi Bul',
            instruction: "Her satırda diğerlerinden farklı olan karakter dizisini bulun.",
            pedagogicalNote: "Dikkat süresi ve görsel tarama hızını artırır.",
            imagePrompt: 'Dizi',
            rows
        });
    }
    return results;
};

export const generateOfflineDotPainting = async (options: GeneratorOptions): Promise<DotPaintingData[]> => {
    const { worksheetCount, itemCount } = options; // itemCount unused visually but could mean more complex dots
    const results: DotPaintingData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const shapeKey = getRandomItems(Object.keys(dotArtShapes), 1)[0];
        const shape = dotArtShapes[shapeKey];
        const color = getRandomItems(COLORS, 1)[0].css;
        const shapeDots = shape.dots.map(d => ({ ...d, color }));

        results.push({
            title: 'Nokta Boyama',
            instruction: "Verilen renkteki noktaları boyayarak gizli resmi ortaya çıkar.",
            pedagogicalNote: "İnce motor becerileri ve görsel bütünleme.",
            imagePrompt: 'Nokta',
            prompt1: 'Sadece renkli noktaları takip et.',
            prompt2: `Gizli Şekil: ${shape.name}`,
            svgViewBox: '0 0 100 100',
            gridPaths: [], 
            dots: shapeDots,
            hiddenImageName: shape.name
        });
    }
    return results;
}

export const generateOfflineAbcConnect = async (options: GeneratorOptions): Promise<AbcConnectData[]> => {
    const {itemCount, worksheetCount, gridSize, targetLetters} = options;
    const results: AbcConnectData[] = [];
    const dim = gridSize || 6;
    
    // Logic to use custom letters if provided, otherwise fallback to A-J
    let letters = ['A','B','C','D','E','F','G','H','J'];
    if (targetLetters) {
        const customLetters = targetLetters.split(/[\s,]+/).map(s => s.trim().toUpperCase()).filter(s => s.length === 1);
        if (customLetters.length > 0) {
            letters = customLetters;
        }
    }

    // Ensure enough letters for pairs requested, loop if needed
    const count = Math.min(letters.length, Math.floor((itemCount || 6) / 2));
    const actualLetters = letters.slice(0, count);

    for(let i=0; i<worksheetCount; i++){
        const placements = generateSmartConnectGrid(dim, count);
        
        const points = placements.map(p => ({
            label: actualLetters[p.pairIndex % actualLetters.length],
            x: p.x,
            y: p.y,
            color: CONNECT_COLORS[p.pairIndex % CONNECT_COLORS.length]
        }));

        results.push({
            title: 'ABC Bağlama (Profesyonel)',
            instruction: "Aynı harfleri, çizgiler birbirini kesmeyecek şekilde birleştirin. Tüm kareler dolmalıdır.",
            pedagogicalNote: "Planlama ve uzamsal akıl yürütme.",
            imagePrompt: 'Bağlama',
            puzzles: [{id: 1, gridDim: dim, points}]
        });
    }
    return results;
}

export const generateOfflineCoordinateCipher = async (options: GeneratorOptions): Promise<CoordinateCipherData[]> => {
    const { gridSize, worksheetCount } = options;
    const results: CoordinateCipherData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const size = gridSize || 6;
        const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => getRandomItems(turkishAlphabet.split(''), 1)[0]));
        const message = "OKU";
        const cipherCoordinates: string[] = [];
        
        for(let k=0; k<message.length; k++) {
            const r = k;
            const c = k;
            if(r < size && c < size) {
                grid[r][c] = message[k].toUpperCase();
                cipherCoordinates.push(`${String.fromCharCode(65 + r)}${c+1}`);
            }
        }

        results.push({ 
            title: 'Koordinat Şifreleme', 
            instruction: "Verilen koordinatlardaki harfleri bularak şifreyi çözün.",
            pedagogicalNote: "Matris mantığı ve kod çözme.",
            imagePrompt: 'Koordinat',
            grid, 
            wordsToFind: [], 
            cipherCoordinates, 
            decodedMessage: message 
        });
    }
    return results;
};

// --- UPDATED WORD CONNECT GENERATOR ---
export const generateOfflineWordConnect = async (options: GeneratorOptions): Promise<WordConnectData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const results: WordConnectData[] = [];
    
    // Choose pool based on difficulty or random mix
    let pairsPool: {word: string, match: string}[] = [];
    
    if (difficulty === 'Başlangıç') {
        // Simple associations
        pairsPool = [
            {word: 'Güneş', match: 'Sıcak'}, {word: 'Kar', match: 'Soğuk'}, {word: 'Arı', match: 'Bal'},
            {word: 'İnek', match: 'Süt'}, {word: 'Tavuk', match: 'Yumurta'}, {word: 'Fırça', match: 'Boya'},
            {word: 'Kalem', match: 'Kağıt'}, {word: 'Çekiç', match: 'Çivi'}, {word: 'Gemi', match: 'Deniz'}
        ];
    } else {
        // Synonyms or Antonyms
        const pool = Math.random() > 0.5 ? TR_VOCAB.synonyms : TR_VOCAB.antonyms;
        pairsPool = pool.map(p => ({word: p.word, match: (p as any).synonym || (p as any).antonym}));
    }

    for(let i = 0; i < worksheetCount; i++) {
        const count = itemCount || 6;
        const selectedPairs = getRandomItems(pairsPool, count);
        const points: any[] = [];
        const colors = getRandomItems(CONNECT_COLORS, count);

        // Prepare shuffle for right column
        const rightSideIndices = shuffle(Array.from({length: count}, (_, k) => k));

        selectedPairs.forEach((pair, idx) => {
            // Left Side (x=0)
            // Note: We use EMOJI_MAP to try and find an icon for the word
            // Or just pass the word as imagePrompt and let frontend handle it if AI mode
            // For offline, let's try to map known emojis
            const leftIcon = EMOJI_MAP[pair.word] || EMOJI_MAP[Object.keys(EMOJI_MAP).find(k => EMOJI_MAP[k] === pair.word) || ''] || pair.word;
            const rightIcon = EMOJI_MAP[pair.match] || EMOJI_MAP[Object.keys(EMOJI_MAP).find(k => EMOJI_MAP[k] === pair.match) || ''] || pair.match;

            points.push({ 
                word: pair.word, 
                pairId: idx, 
                x: 0, 
                y: idx, 
                color: colors[idx % colors.length],
                imagePrompt: leftIcon // In offline mode, this acts as a hint or emoji if available
            });
            
            // Right Side (x=1) - randomized position
            points.push({ 
                word: pair.match, 
                pairId: idx, 
                x: 1, 
                y: rightSideIndices[idx], 
                color: colors[idx % colors.length],
                imagePrompt: rightIcon
            });
        });
        
        results.push({
            title: "Kelime Bağlama (Hızlı Mod)",
            instruction: "Sol sütundaki kelimeleri sağ sütundaki eşleriyle (eş/zıt anlam veya ilişki) çizgilerle birleştir.",
            pedagogicalNote: "Anlamsal ilişkilendirme, kelime dağarcığı ve görsel eşleştirme becerisi.",
            imagePrompt: 'Bağlantı', // Cover image
            gridDim: 1, // Logic handled by column layout in frontend
            points
        });
    }
    return results;
};

export const generateOfflineProfessionConnect = async (options: GeneratorOptions): Promise<ProfessionConnectData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: ProfessionConnectData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const professions: string[] = getRandomItems(TR_VOCAB.jobs, itemCount || 5);
        const points = professions.flatMap((p: string, idx) => ([
            { label: p, imageDescription: p, imagePrompt: 'Meslek', x: 0, y: idx * 2, pairId: idx },
            { label: '', imageDescription: `${p} Aracı`, imagePrompt: 'Meslek', x: 5, y: idx * 2, pairId: idx }
        ]));
        results.push({ 
            title: 'Meslek Eşleştirme', 
            instruction: "Meslekleri kullandıkları araçlarla eşleştirin.",
            pedagogicalNote: "İlişkilendirme ve kelime dağarcığı.",
            imagePrompt: 'Meslek',
            gridDim: 6, 
            points 
        });
    }
    return results;
}

export const generateOfflineMatchstickSymmetry = async (options: GeneratorOptions): Promise<MatchstickSymmetryData[]> => {
    const { worksheetCount } = options;
    const results: MatchstickSymmetryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const pattern = getRandomItems(matchstickPatterns, 1)[0];
        results.push({
            title: 'Kibrit Simetrisi',
            instruction: "Verilen şeklin simetriğini çizin.",
            pedagogicalNote: "Görsel kopyalama ve simetri.",
            imagePrompt: 'Kibrit',
            puzzles: [{
                id: 1,
                axis: 'vertical',
                lines: pattern.lines.map(l => ({ ...l, color: 'black' }))
            }]
        });
    }
    return results;
}

export const generateOfflineVisualOddOneOutThemed = async (options: GeneratorOptions): Promise<VisualOddOneOutThemedData[]> => {
    const { itemCount, worksheetCount, topic } = options;
    const results: VisualOddOneOutThemedData[] = [];

    for (let i = 0; i < worksheetCount; i++) {
        const rows: VisualOddOneOutThemedData['rows'] = [];
        for (let j = 0; j < (itemCount || 5); j++) {
            const topicStr = topic as string;
            const randomMainCat = getRandomItems(ITEM_CATEGORIES, 1)[0] as string | undefined;
            const mainCatKey = (topicStr && topicStr !== 'Rastgele' && ITEM_CATEGORIES.includes(topicStr.toLowerCase())) ? topicStr.toLowerCase() : randomMainCat || 'animals';
            const oddCatKey = getRandomItems(ITEM_CATEGORIES.filter(c => c !== mainCatKey), 1)[0];

            const vocab = TR_VOCAB as any;
            const mainItems: string[] = getRandomItems((vocab[mainCatKey] || []) as string[], 3);
            const oddItem: string | undefined = getRandomItems((vocab[oddCatKey] || []) as string[], 1)[0];

            if (!oddItem || mainItems.length < 3) {
                j--; 
                continue;
            }

            const items = shuffle([
                ...mainItems.map(desc => ({ description: desc, imagePrompt: 'Tema', isOdd: false })),
                { description: oddItem, imagePrompt: 'Tema', isOdd: true }
            ]);

            rows.push({ theme: mainCatKey, items });
        }
        
        results.push({
            title: 'Tematik Farklı Olanı Bul (Hızlı Mod)',
            instruction: "Her grupta, konuyla ilgisiz olanı bulun.",
            pedagogicalNote: "Kategorizasyon ve mantıksal çıkarım.",
            imagePrompt: 'Tema',
            rows
        });
    }
    return results;
};

export const generateOfflinePunctuationColoring = async (options: GeneratorOptions): Promise<PunctuationColoringData[]> => {
    const { itemCount, worksheetCount } = options;
    const punctuationSentences = [
        { text: 'Okula gittim', correctMark: '.' }, { text: 'Nereye gidiyorsun', correctMark: '?' },
        { text: 'Eyvah, geç kaldım', correctMark: '!' }, { text: 'Kedi, köpek ve kuş besliyorum', correctMark: '.' }
    ];
    return Array.from({ length: worksheetCount }, () => {
        // Use itemCount to determine number of sentences
        const count = itemCount || 4;
        // Generate more sentences if needed by duplicating or expanding pool
        const sentences = getRandomItems(punctuationSentences, Math.min(count, punctuationSentences.length)).map((s, i) => ({
            ...s,
            color: COLORS[i % COLORS.length].css
        }));
        
        // If user wants more items than we have unique ones, fill with random duplicates
        while (sentences.length < count) {
             const s = getRandomItems(punctuationSentences, 1)[0];
             sentences.push({ ...s, color: COLORS[sentences.length % COLORS.length].css });
        }

        return {
            title: 'Noktalama Boyama',
            instruction: "Cümlenin sonuna gelecek işarete göre kutuyu boya.",
            pedagogicalNote: "Dilbilgisi kurallarını görselleştirme.",
            imagePrompt: 'Noktalama',
            sentences: sentences.slice(0, count)
        };
    });
}

export const generateOfflineSynonymAntonymColoring = async (options: GeneratorOptions): Promise<SynonymAntonymColoringData[]> => {
    const { worksheetCount } = options;
    const results: SynonymAntonymColoringData[] = [];
    for(let i=0; i < worksheetCount; i++) {
        const synonymPair: { word: string; synonym: string } = getRandomItems(TR_VOCAB.synonyms, 1)[0];
        const antonymPair: { word: string; antonym: string } = getRandomItems(TR_VOCAB.antonyms, 1)[0];
        const color1 = getRandomItems(COLORS, 1)[0].css;
        const color2 = getRandomItems(COLORS.filter(c => c.css !== color1), 1)[0].css;

        const colorKey = [
            { text: `"${synonymPair.word}" kelimesinin eş anlamlısı`, color: color1 },
            { text: `"${antonymPair.word}" kelimesinin zıt anlamlısı`, color: color2 },
        ];

        const wordsOnImage = shuffle([
            { word: synonymPair.synonym, x: 20, y: 30 },
            { word: antonymPair.antonym, x: 70, y: 60 },
            { word: getRandomItems(getWordsForDifficulty('Başlangıç'), 1)[0], x: 40, y: 80 },
            { word: getRandomItems(getWordsForDifficulty('Başlangıç'), 1)[0], x: 60, y: 10 }
        ]);

        results.push({
            title: 'Eş/Zıt Anlamlı Boyama',
            instruction: "Kelimelerin ilişkisine göre (eş/zıt) boyama yap.",
            pedagogicalNote: "Kelime anlamı ilişkileri pekiştirme.",
            imagePrompt: 'Eş Anlam',
            colorKey,
            wordsOnImage
        });
    }
    return results;
};

export const generateOfflineStarHunt = async (options: GeneratorOptions): Promise<StarHuntData[]> => {
    const { worksheetCount, gridSize, difficulty } = options;
    const size = gridSize || (difficulty === 'Orta' ? 6 : (difficulty === 'Zor' ? 8 : 5));
    
    return Array.from({ length: worksheetCount }, () => {
        // Use Latin Square to generate a valid non-colliding grid for stars
        const latin = generateLatinSquare(size); 
        const grid: (ShapeType | 'star' | 'question' | null)[][] = latin.map(row => 
            row.map(val => val === 1 ? 'star' : null)
        );

        return {
            title: 'Yıldız Avı (Hızlı Mod)',
            instruction: "Her satır ve sütunda 1 yıldız olacak şekilde yerleştirin. Yıldızlar birbirine değmemelidir.",
            pedagogicalNote: "Mantıksal çıkarım ve kısıtlama yönetimi (Constraint Satisfaction).",
            imagePrompt: 'Yıldız',
            grid: grid,
            targetCount: size
        };
    });
}

export const generateOfflineShapeCounting = async (options: GeneratorOptions): Promise<ShapeCountingData[]> => {
    const { worksheetCount, difficulty } = options;
    const shapeCountingFigures = {
        easy: {
            svgPaths: [ {d: "M 10 90 L 50 10 L 90 90 Z", fill: '#bfdbfe'}, {d: "M 30 90 L 50 50 L 70 90 Z", fill: '#bbf7d0'} ],
            correctCount: 2
        },
        medium: {
            svgPaths: [ { d: "M 50 10 L 90 80 L 10 80 Z", fill: '#f4f4f5' }, { d: "M 50 10 L 70 45 L 30 45 Z", fill: '#fde047' }, { d: "M 30 45 L 50 80 L 10 80 Z", fill: '#fde047' }, { d: "M 70 45 L 90 80 L 50 80 Z", fill: '#fde047' } ],
            correctCount: 5 
        },
        hard: {
            svgPaths: [ { d: "M 50 5 L 61 40 L 98 40 L 68 62 L 79 96 L 50 75 L 21 96 L 32 62 L 2 40 L 39 40 Z", fill: '#bfdbfe' }, { d: "M 50 75 L 32 62 L 68 62 Z", fill: 'rgba(0,0,0,0.1)'}, { d: "M 39 40 L 50 5 L 61 40 Z", fill: 'rgba(0,0,0,0.1)'} ],
            correctCount: 10 
        }
    };

    return Array.from({ length: worksheetCount }, () => {
        let figure;
        if (difficulty === 'Başlangıç') figure = shapeCountingFigures.easy;
        else if (difficulty === 'Orta') figure = shapeCountingFigures.medium;
        else figure = shapeCountingFigures.hard;

        return {
            title: 'Üçgen Sayma',
            instruction: "Şeklin içinde kaç tane üçgen olduğunu sayın.",
            pedagogicalNote: "Görsel ayrıştırma, parça-bütün ilişkisi ve sistematik sayma becerisi.",
            imagePrompt: 'Üçgen',
            figures: [{
                svgPaths: figure.svgPaths,
                targetShape: 'triangle',
                correctCount: figure.correctCount
            }]
        };
    });
};


import { 
    FindTheDifferenceData, WordComparisonData, ShapeMatchingData, FindIdenticalWordData, GridDrawingData, SymbolCipherData, BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, CoordinateCipherData, WordConnectData, ProfessionConnectData, MatchstickSymmetryData, VisualOddOneOutThemedData, PunctuationColoringData, SynonymAntonymColoringData, StarHuntData, ShapeCountingData, ShapeType,
    GeneratorOptions
} from '../../types';
import { shuffle, getRandomInt, getRandomItems, getWordsForDifficulty, SHAPE_TYPES, TR_VOCAB, generateConnectedPath, generateSymmetricPattern } from './helpers';

// --- HELPER: PROCEDURAL SYMMETRIC GRID GENERATOR ---
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

export const generateOfflineFindTheDifference = async (options: GeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { topic, itemCount, worksheetCount, difficulty } = options;
    const results: FindTheDifferenceData[] = [];
    
    // Mix confusing words and regular similar words
    const pool = [...TR_VOCAB.confusing_words.flat(), ...getWordsForDifficulty(difficulty, topic)];
    const uniquePool = [...new Set(pool)];

    for (let i = 0; i < worksheetCount; i++) {
        const rows = [];
        const rowsCount = itemCount || 8;
        
        for(let r=0; r<rowsCount; r++) {
            // Pick a word
            const word = getRandomItems(uniquePool, 1)[0] || 'ELMA';
            const distractionLevel = difficulty === 'Zor' || difficulty === 'Uzman' ? 'high' : 'low';
            
            // Create variations
            const variation = word.length > 3 ? word.substring(0,2) + word[3] + word[2] + word.substring(4) : word + '.'; 
            const isWordDiff = Math.random() > 0.5;
            
            const target = isWordDiff ? variation : word;
            const items = Array.from({length: 4}, () => word);
            
            const correctIndex = getRandomInt(0, 3);
            items[correctIndex] = target;
            
            rows.push({
                items,
                correctIndex,
                visualDistractionLevel: distractionLevel
            });
        }

        results.push({
            title: 'Farklı Olanı Bul',
            instruction: "Sıradaki farklı kelimeyi/şekli bul ve işaretle.",
            pedagogicalNote: "Görsel ayrıştırma ve dikkat.",
            imagePrompt: 'Difference',
            rows
        });
    }
    return results;
};

export const generateOfflineWordComparison = async (options: GeneratorOptions): Promise<WordComparisonData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => {
        const words = getWordsForDifficulty(difficulty, 'Rastgele').slice(0, 10);
        const modifiedWords = words.map(w => {
            if(Math.random() > 0.5) {
                // minor change
                if(w.length > 2) return w.substring(0,1) + w[2] + w[1] + w.substring(3);
                return w + 'a';
            }
            return w;
        });
        
        const diffs = words.filter((w, i) => w !== modifiedWords[i]);
        
        return {
            title: 'Kelime Karşılaştırma',
            instruction: 'İki listeyi karşılaştır ve farklı olanları bul.',
            pedagogicalNote: 'Görsel tarama ve karşılaştırma.',
            imagePrompt: 'Comparison',
            box1Title: 'Liste A',
            box2Title: 'Liste B',
            wordList1: words,
            wordList2: modifiedWords,
            correctDifferences: diffs
        };
    });
};

export const generateOfflineShapeMatching = async (options: GeneratorOptions): Promise<ShapeMatchingData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => {
        const count = difficulty === 'Başlangıç' ? 4 : 6;
        const shapes: ShapeType[] = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'];
        const colors = ['red', 'blue', 'green', 'orange', 'purple', 'black'];
        
        const leftItems = Array.from({length: count}, (_, i) => ({
            id: i+1,
            shapes: [shapes[i % shapes.length]],
            color: colors[i % colors.length]
        }));
        
        const rightItems = shuffle([...leftItems]);
        
        return {
            title: 'Şekil Eşleştirme',
            instruction: 'Aynı olan şekilleri eşleştir.',
            pedagogicalNote: 'Şekil algısı.',
            imagePrompt: 'Shapes',
            leftColumn: leftItems,
            rightColumn: rightItems,
            complexity: 1
        };
    });
};

export const generateOfflineFindIdenticalWord = async (options: GeneratorOptions): Promise<FindIdenticalWordData[]> => {
    const { worksheetCount, difficulty } = options;
    const words = getWordsForDifficulty(difficulty, 'Rastgele');
    
    return Array.from({ length: worksheetCount }, () => {
        const target = getRandomItems(words, 1)[0];
        const distractors = getRandomItems(words.filter(w => w !== target), 5);
        
        return {
            title: 'Aynısını Bul',
            instruction: 'Ortadaki kelimenin aynısını bul.',
            pedagogicalNote: 'Kelime tanıma.',
            imagePrompt: 'Target Word',
            groups: [{ words: [target, target], distractors }]
        };
    });
};

export const generateOfflineGridDrawing = async (options: GeneratorOptions): Promise<GridDrawingData[]> => {
    const { worksheetCount, gridSize, difficulty } = options;
    const dim = gridSize || (difficulty === 'Başlangıç' ? 4 : 6);
    
    return Array.from({ length: worksheetCount }, () => ({
        title: 'Kare Çizim',
        instruction: 'Soldaki deseni sağdaki kareli alana kopyala.',
        pedagogicalNote: 'Görsel-motor kopyalama.',
        imagePrompt: 'Grid Art',
        gridDim: dim,
        drawings: Array.from({length: 2}, () => ({
            lines: generateConnectedPath(dim, 2),
            complexityLevel: difficulty
        }))
    }));
};

export const generateOfflineSymbolCipher = async (options: GeneratorOptions): Promise<SymbolCipherData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const letters = ['A','B','C','D','E','K','L','M'];
        const shapes = SHAPE_TYPES.slice(0, letters.length);
        const key = letters.map((l, i) => ({ letter: l, shape: shapes[i], color: '#000' }));
        
        const words = ['KALEM', 'BEBEK', 'ELMA']; // Simple offline words
        
        return {
            title: 'Şekil Şifresi',
            instruction: 'Şifreyi çöz.',
            pedagogicalNote: 'Sembolik kodlama.',
            imagePrompt: 'Cipher',
            cipherKey: key,
            wordsToSolve: words.map(w => ({
                wordLength: w.length,
                answer: w,
                shapeSequence: w.split('').map(char => key.find(k => k.letter === char)?.shape || 'circle')
            }))
        };
    });
};

export const generateOfflineBlockPainting = async (options: GeneratorOptions): Promise<BlockPaintingData[]> => {
    const { worksheetCount, gridSize } = options;
    const dim = gridSize || 5;
    
    return Array.from({ length: worksheetCount }, () => ({
        title: 'Blok Boyama',
        instruction: 'Verilen deseni oluşturmak için kareleri boya.',
        pedagogicalNote: 'Uzamsal konumlandırma.',
        imagePrompt: 'Pixel Art',
        grid: { rows: dim, cols: dim },
        targetPattern: generateSymmetricPattern(dim, dim, 0.4),
        shapes: [{ id: 1, color: '#3b82f6', count: 5, pattern: [] }]
    }));
};

export const generateOfflineVisualOddOneOut = async (options: GeneratorOptions): Promise<VisualOddOneOutData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const count = itemCount || 6;
    
    return Array.from({ length: worksheetCount }, () => {
        const rows = Array.from({ length: count }, () => {
            const baseSegments = Array.from({ length: 9 }, () => Math.random() > 0.5);
            
            const items = [
                { segments: baseSegments, rotation: 0 },
                { segments: baseSegments, rotation: 90 },
                { segments: baseSegments, rotation: 180 },
                { segments: baseSegments.map(b => !b), rotation: 0 } 
            ];
            
            return {
                items: shuffle(items),
                correctIndex: -1, 
                reason: 'Farklı desen'
            };
        });
        
        return {
            title: 'Görsel Farkı Bul',
            instruction: 'Diğerlerinden farklı olan şekli bul.',
            pedagogicalNote: 'Görsel ayırt etme ve zihinsel döndürme.',
            imagePrompt: 'Odd Shape',
            rows
        };
    });
};

export const generateOfflineSymmetryDrawing = async (options: GeneratorOptions): Promise<SymmetryDrawingData[]> => {
    const { worksheetCount, gridSize } = options;
    const dim = gridSize || 6;
    
    return Array.from({ length: worksheetCount }, () => {
        const dots = [];
        for(let i=0; i<8; i++) {
            dots.push({ x: getRandomInt(0, dim/2 - 1), y: getRandomInt(0, dim-1), color: 'black' });
        }
        
        return {
            title: 'Simetri Tamamlama',
            instruction: 'Şeklin simetriğini çiz.',
            pedagogicalNote: 'Simetri algısı.',
            imagePrompt: 'Symmetry',
            gridDim: dim,
            axis: 'vertical',
            isMirrorImage: true,
            dots
        };
    });
};

export const generateOfflineFindDifferentString = async (options: GeneratorOptions): Promise<FindDifferentStringData[]> => {
    const { worksheetCount, itemCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const base = "xyxyxy";
        const odd = "xyyxyx";
        
        const rows = Array.from({ length: itemCount || 8 }, () => ({
            items: shuffle([base, base, base, odd]),
            correctIndex: -1
        }));
        
        return {
            title: 'Farklı Diziyi Bul',
            instruction: 'Farklı olan harf dizisini bul.',
            pedagogicalNote: 'Görsel dikkat.',
            imagePrompt: 'String',
            rows
        };
    });
};

export const generateOfflineDotPainting = async (options: GeneratorOptions): Promise<DotPaintingData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const shape = dotArtShapes['heart'];
        
        return {
            title: 'Nokta Boyama',
            instruction: 'Koordinatları verilen noktaları boya ve gizli resmi bul.',
            prompt1: 'Gizli Resim',
            prompt2: 'Noktaları birleştir.',
            pedagogicalNote: 'Koordinat sistemi ve ince motor.',
            imagePrompt: 'Dot Art',
            svgViewBox: "0 0 100 100",
            gridPaths: [],
            dots: shape.dots.map(d => ({...d, color: '#ef4444'})),
            hiddenImageName: shape.name
        };
    });
};

export const generateOfflineAbcConnect = async (options: GeneratorOptions): Promise<AbcConnectData[]> => {
    const { worksheetCount, gridSize } = options;
    const dim = gridSize || 5;
    
    return Array.from({ length: worksheetCount }, () => ({
        title: 'Nokta Birleştirme',
        instruction: 'Aynı harfleri/sayıları yollar kesişmeden birleştir.',
        pedagogicalNote: 'Planlama ve uzamsal zeka.',
        imagePrompt: 'Flow',
        puzzles: [{
            id: 1,
            gridDim: dim,
            points: [
                {label: 'A', x: 0, y: 0, color: 'red'}, {label: 'A', x: 4, y: 1, color: 'red'},
                {label: 'B', x: 0, y: 4, color: 'blue'}, {label: 'B', x: 4, y: 4, color: 'blue'}
            ]
        }]
    }));
};

export const generateOfflineCoordinateCipher = async (options: GeneratorOptions): Promise<CoordinateCipherData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: 'Koordinat Şifreleme',
        instruction: 'Koordinatları verilen harfleri bul ve şifreyi çöz.',
        pedagogicalNote: 'Konumlandırma.',
        imagePrompt: 'Map',
        grid: [['A','B','C'],['D','E','F'],['G','H','I']],
        wordsToFind: ['EGE'],
        cipherCoordinates: ['B2', 'C1', 'B2'],
        decodedMessage: 'EGE'
    }));
};

export const generateOfflineWordConnect = async (options: GeneratorOptions): Promise<WordConnectData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: 'Kelime Bağlama',
        instruction: 'İlişkili kelimeleri eşleştir.',
        pedagogicalNote: 'Semantik ilişki.',
        imagePrompt: 'Connect',
        gridDim: 2,
        points: [
            {word: 'Doktor', pairId: 1, x: 0, y: 0, color: 'blue', imagePrompt: 'Doctor'},
            {word: 'Hastane', pairId: 1, x: 1, y: 1, color: 'blue', imagePrompt: 'Hospital'},
            {word: 'Öğretmen', pairId: 2, x: 0, y: 1, color: 'green', imagePrompt: 'Teacher'},
            {word: 'Okul', pairId: 2, x: 1, y: 0, color: 'green', imagePrompt: 'School'}
        ]
    }));
};

export const generateOfflineProfessionConnect = async (o: GeneratorOptions) => generateOfflineWordConnect(o) as any as Promise<ProfessionConnectData[]>;

export const generateOfflineMatchstickSymmetry = async (options: GeneratorOptions): Promise<MatchstickSymmetryData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: 'Kibrit Simetrisi',
        instruction: 'Kırmızı çizgiye göre simetriğini oluştur.',
        pedagogicalNote: 'Görsel simetri.',
        imagePrompt: 'Matchstick',
        puzzles: [{
            id: 1,
            axis: 'vertical',
            lines: matchstickPatterns[0].lines.map(l => ({...l, color: '#f59e0b'}))
        }]
    }));
};

export const generateOfflineVisualOddOneOutThemed = async (options: GeneratorOptions): Promise<VisualOddOneOutThemedData[]> => {
    const { worksheetCount, topic } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: 'Tematik Farkı Bul',
        instruction: 'Temaya uymayanı bul.',
        pedagogicalNote: 'Kategorizasyon.',
        imagePrompt: 'Theme Odd',
        rows: [{
            theme: topic || 'Meyveler',
            items: [
                {description: 'Elma', imagePrompt: 'Apple', isOdd: false},
                {description: 'Armut', imagePrompt: 'Pear', isOdd: false},
                {description: 'Araba', imagePrompt: 'Car', isOdd: true}
            ]
        }]
    }));
};

export const generateOfflineStarHunt = async (options: GeneratorOptions): Promise<StarHuntData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const grid = Array.from({length: 5}, () => Array.from({length: 5}, () => Math.random() > 0.8 ? '★' : ''));
        const count = grid.flat().filter(c => c === '★').length;
        
        return {
            title: 'Yıldız Avı',
            instruction: 'Kaç tane yıldız olduğunu bul.',
            pedagogicalNote: 'Görsel tarama ve sayma.',
            imagePrompt: 'Stars',
            grid,
            targetCount: count
        };
    });
};

export const generateOfflineShapeCounting = async (options: GeneratorOptions): Promise<ShapeCountingData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: 'Şekil Sayma',
        instruction: 'Kaç tane üçgen var?',
        pedagogicalNote: 'Şekil algısı.',
        imagePrompt: 'Geometry',
        figures: [{
            targetShape: 'triangle',
            correctCount: 3,
            svgPaths: [
                {d: 'M 50 10 L 90 90 L 10 90 Z', fill: 'none', stroke: 'black'},
                {d: 'M 50 10 L 50 90', fill: 'none', stroke: 'black'}
            ]
        }]
    }));
};

// Fallbacks
export const generateOfflinePunctuationColoring = async (o: GeneratorOptions) => generateOfflineVisualOddOneOut(o) as any as Promise<PunctuationColoringData[]>;
export const generateOfflineSynonymAntonymColoring = async (o: GeneratorOptions) => generateOfflineVisualOddOneOut(o) as any as Promise<SynonymAntonymColoringData[]>;

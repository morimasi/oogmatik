
import { 
    FindTheDifferenceData, WordComparisonData, ShapeMatchingData, FindIdenticalWordData, GridDrawingData, SymbolCipherData, BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, CoordinateCipherData, WordConnectData, ProfessionConnectData, MatchstickSymmetryData, VisualOddOneOutThemedData, PunctuationColoringData, SynonymAntonymColoringData, StarHuntData, ShapeCountingData, ShapeType,
    GeneratorOptions,
    RomanNumeralConnectData,
    WeightConnectData,
    LengthConnectData
} from '../../types';
import { shuffle, getRandomInt, getRandomItems, getWordsForDifficulty, SHAPE_TYPES, TR_VOCAB, generateConnectedPath, generateSymmetricPattern, PREDEFINED_GRID_PATTERNS } from './helpers';

const CRITICAL_PAIRS = {
    linguistic: [['b', 'd'], ['p', 'q'], ['m', 'n'], ['u', 'n'], ['a', 'e'], ['s', 'z'], ['t', 'f'], ['ğ', 'g'], ['ı', 'i'], ['v', 'y']],
    numeric: [['6', '9'], ['2', '5'], ['1', '7'], ['0', '8'], ['3', '8'], ['4', '7']],
    semantic: [['dere', 'dede'], ['baba', 'dada'], ['kasa', 'masa'], ['kale', 'lale'], ['kitap', 'katip'], ['sarı', 'darı'], ['para', 'yara'], ['kuzu', 'kutu']],
    pictographic: [['▲', '▼'], ['◀', '▶'], ['⬈', '⬉'], ['◐', '◑'], ['◒', '◓'], ['◖', '◗']]
};

export const generateOfflineFindTheDifference = async (options: GeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { worksheetCount, difficulty, itemCount, findDiffType, distractionLevel } = options;
    const results: FindTheDifferenceData[] = [];
    const type = findDiffType || 'linguistic';
    const pairPool = (CRITICAL_PAIRS as any)[type] || CRITICAL_PAIRS.linguistic;
    for (let i = 0; i < worksheetCount; i++) {
        const rows = [];
        const rowsCount = itemCount || 8;
        for(let r = 0; r < rowsCount; r++) {
            const pair = pairPool[getRandomInt(0, pairPool.length - 1)];
            const base = pair[0]; const odd = pair[1];
            const itemsCount = difficulty === 'Uzman' ? 6 : (difficulty === 'Zor' ? 5 : 4);
            const items = Array.from({ length: itemsCount }, () => base);
            const correctIndex = getRandomInt(0, itemsCount - 1);
            items[correctIndex] = odd;
            rows.push({ items, correctIndex, visualDistractionLevel: (distractionLevel as any) || 'medium' });
        }
        results.push({ title: `Farklı Olanı Bul: ${type}`, instruction: "Her satırda diğerlerinden farklı olan öğeyi bul ve işaretle.", pedagogicalNote: "Görsel ayrıştırma becerisini geliştirir.", imagePrompt: 'Visual Discrimination', rows });
    }
    return results;
};

export const generateOfflineGridDrawing = async (options: GeneratorOptions): Promise<GridDrawingData[]> => {
    const { worksheetCount, gridSize, difficulty, concept, useSearch, itemCount } = options;
    const dim = gridSize || 6;
    const mode = (concept as any) || 'copy';
    const patternKeys = Object.keys(PREDEFINED_GRID_PATTERNS);
    
    return Array.from({ length: worksheetCount }, () => {
        const drawings = Array.from({length: 2}, () => {
            const key = getRandomItems(patternKeys, 1)[0] as keyof typeof PREDEFINED_GRID_PATTERNS;
            let lines = PREDEFINED_GRID_PATTERNS[key];
            if (difficulty === 'Zor' || difficulty === 'Uzman') { lines = generateConnectedPath(dim, itemCount || 5); }
            return { lines: lines as [number, number][][], complexityLevel: difficulty, title: "Çalışma Bloğu" };
        });
        return { 
            title: 'Kare Kopyalama & Dönüşüm', 
            instruction: 'Soldaki deseni analiz edin ve istenen dönüşümle sağdaki boş ızgaraya çizin.', 
            pedagogicalNote: 'Görsel-uzamsal kopyalama, zihinsel rotasyon ve koordinat takibi becerilerini destekler.', 
            imagePrompt: 'Grid Art', 
            gridDim: dim, 
            transformMode: mode,
            showCoordinates: !!useSearch,
            drawings 
        };
    });
};

export const generateOfflineSymmetryDrawing = async (options: GeneratorOptions): Promise<SymmetryDrawingData[]> => {
    const { worksheetCount, gridSize, visualType, useSearch, itemCount } = options;
    const dim = gridSize || 10;
    const axis = (visualType as any) || 'vertical';
    
    return Array.from({ length: worksheetCount }, () => {
        const lines: {x1:number, y1:number, x2:number, y2:number, color:string}[] = [];
        const steps = itemCount || 5;
        const mid = Math.floor(dim/2);
        
        let cx = axis === 'vertical' ? getRandomInt(0, mid-1) : getRandomInt(0, dim-1);
        let cy = axis === 'vertical' ? getRandomInt(0, dim-1) : getRandomInt(0, mid-1);

        for(let k=0; k<steps; k++) {
            const moves = [[0,1],[0,-1],[1,0],[-1,0]];
            const move = moves[getRandomInt(0,3)];
            let nx = cx + move[0];
            let ny = cy + move[1];

            if (axis === 'vertical') {
                nx = Math.max(0, Math.min(mid, nx));
                ny = Math.max(0, Math.min(dim, ny));
            } else {
                nx = Math.max(0, Math.min(dim, nx));
                ny = Math.max(0, Math.min(mid, ny));
            }

            lines.push({ x1: cx, y1: cy, x2: nx, y2: ny, color: 'black' });
            cx = nx; cy = ny;
        }

        return { 
            title: 'Simetri Tamamlama', 
            instruction: 'Kırmızı simetri eksenine göre desenin aynadaki yansımasını diğer tarafa çizin.', 
            pedagogicalNote: 'Simetri algısı, görsel tamamlama ve planlama becerilerini geliştirir.', 
            imagePrompt: 'Symmetry', 
            gridDim: dim, 
            axis, 
            showCoordinates: !!useSearch, 
            isMirrorImage: true, 
            lines 
        };
    });
};

export const generateOfflineWordComparison = async (options: GeneratorOptions): Promise<WordComparisonData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => {
        const words = getWordsForDifficulty(difficulty, 'Rastgele').slice(0, 10);
        const modifiedWords = words.map(w => (Math.random() > 0.5 ? (w.length > 2 ? w.substring(0,1) + w[2] + w[1] + w.substring(3) : w + 'a') : w));
        const diffs = words.filter((w, i) => w !== modifiedWords[i]);
        return { title: 'Kelime Karşılaştırma', instruction: 'İki listeyi karşılaştır ve farklı olanları bul.', pedagogicalNote: 'Görsel tarama ve karşılaştırma.', imagePrompt: 'Comparison', box1Title: 'Liste A', box2Title: 'Liste B', wordList1: words, wordList2: modifiedWords, correctDifferences: diffs };
    });
};

export const generateOfflineShapeMatching = async (options: GeneratorOptions): Promise<ShapeMatchingData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => {
        const count = difficulty === 'Başlangıç' ? 4 : 5;
        const shapes: ShapeType[] = ['triangle', 'heart', 'star', 'hexagon'];
        const baseItems = Array.from({length: count}, (_, i) => ({ id: i + 1, shape: shapes[i % shapes.length], color: 'black' }));
        const leftColumn = baseItems.map(item => ({ id: item.id, shapes: [item.shape], color: item.color, rotation: 0, scale: 1 }));
        const rightColumn = shuffle(baseItems).map(item => ({ id: item.id, shapes: [item.shape], color: item.color, rotation: difficulty !== 'Başlangıç' ? 90 : 0, scale: 1 }));
        return { title: 'Şekil Eşleştirme', instruction: 'Şekillerin eşlerini bul.', pedagogicalNote: 'Görsel eşleştirme.', imagePrompt: 'Shapes', leftColumn, rightColumn, complexity: 1 };
    });
};

export const generateOfflineFindIdenticalWord = async (options: GeneratorOptions): Promise<FindIdenticalWordData[]> => {
    const { worksheetCount, difficulty } = options;
    const words = getWordsForDifficulty(difficulty, 'Rastgele');
    return Array.from({ length: worksheetCount }, () => {
        const target = getRandomItems(words, 1)[0] || 'KİTAP';
        const distractors = getRandomItems(words.filter(w => w !== target), 5);
        return { title: 'Aynısını Bul', instruction: 'Ortadaki kelimenin aynısını bul.', pedagogicalNote: 'Kelime tanıma.', imagePrompt: 'Target Word', groups: [{ words: [target, target], distractors }] };
    });
};

export const generateOfflineSymbolCipher = async (options: GeneratorOptions): Promise<SymbolCipherData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const letters = ['A','B','C','D','E','K','L','M'];
        const shapes = SHAPE_TYPES.slice(0, letters.length);
        const key = letters.map((l, i) => ({ letter: l, shape: shapes[i], color: '#000' }));
        const words = ['KALEM', 'BEBEK', 'ELMA'];
        return { title: 'Şekil Şifresi', instruction: 'Şifreyi çöz.', pedagogicalNote: 'Sembolik kodlama.', imagePrompt: 'Cipher', cipherKey: key, wordsToSolve: words.map(w => ({ wordLength: w.length, answer: w, shapeSequence: w.split('').map(char => key.find(k => k.letter === char)?.shape || 'circle') })) };
    });
};

export const generateOfflineBlockPainting = async (options: GeneratorOptions): Promise<BlockPaintingData[]> => {
    const { worksheetCount, gridSize } = options;
    const dim = gridSize || 5;
    return Array.from({ length: worksheetCount }, () => ({ title: 'Blok Boyama', instruction: 'Desenleri boya.', pedagogicalNote: 'Uzamsal konumlandırma.', imagePrompt: 'Pixel Art', grid: { rows: dim, cols: dim }, targetPattern: generateSymmetricPattern(dim, dim, 0.4), shapes: [{ id: 1, color: '#3b82f6', count: 5, pattern: [] }] }));
};

export const generateOfflineVisualOddOneOut = async (options: GeneratorOptions): Promise<VisualOddOneOutData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const count = itemCount || 6;
    return Array.from({ length: worksheetCount }, () => {
        const rows = Array.from({ length: count }, () => {
            const baseSegments = Array.from({ length: 9 }, () => Math.random() > 0.5);
            const oddSegments = [...baseSegments]; oddSegments[0] = !oddSegments[0];
            const items = [ { segments: baseSegments, rotation: 0 }, { segments: baseSegments, rotation: 0 }, { segments: oddSegments, rotation: 0 } ];
            const shuffled = shuffle(items.map((item, idx) => ({...item, originalIdx: idx})));
            return { items: shuffled, correctIndex: shuffled.findIndex(x => (x as any).originalIdx === 2), reason: "Farklı desen" };
        });
        return { title: 'Görsel Farkı Bul', instruction: 'Farklı olanı bul.', pedagogicalNote: 'Görsel ayırt etme.', imagePrompt: 'Odd Shape', rows };
    });
};

export const generateOfflineFindDifferentString = async (options: GeneratorOptions): Promise<FindDifferentStringData[]> => {
    const { worksheetCount, itemCount } = options;
    return Array.from({ length: worksheetCount }, () => ({ title: 'Farklı Diziyi Bul', instruction: 'Farklı harf dizisini bul.', pedagogicalNote: 'Görsel dikkat.', imagePrompt: 'String', rows: Array.from({ length: itemCount || 8 }, () => ({ items: shuffle(["xyxyxy", "xyxyxy", "xyyxyx"]), correctIndex: -1 })) }));
};

/* Fixed generateOfflineDotPainting by adding missing prompt1 and prompt2 properties */
export const generateOfflineDotPainting = async (options: GeneratorOptions): Promise<DotPaintingData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({ 
        title: 'Nokta Boyama', 
        instruction: 'Noktaları boya.', 
        prompt1: 'Noktaları Birleştir',
        prompt2: 'Gizli resmi ortaya çıkar.',
        pedagogicalNote: 'İnce motor.', 
        imagePrompt: 'Dot Art', 
        svgViewBox: "0 0 100 100", 
        gridPaths: [], 
        dots: [{ cx: 50, cy: 50, color: 'red' }], 
        hiddenImageName: 'Nokta' 
    }));
};

export const generateOfflineAbcConnect = async (options: GeneratorOptions): Promise<AbcConnectData[]> => {
    const { worksheetCount, gridSize } = options;
    return Array.from({ length: worksheetCount }, () => ({ title: 'Nokta Birleştirme', instruction: 'Aynı harfleri birleştir.', pedagogicalNote: 'Planlama.', imagePrompt: 'Flow', puzzles: [{ id: 1, gridDim: gridSize || 5, points: [ {label: 'A', x: 0, y: 0, color: 'red'}, {label: 'A', x: 4, y: 4, color: 'red'} ] }] }));
};

export const generateOfflineCoordinateCipher = async (options: GeneratorOptions): Promise<CoordinateCipherData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({ title: 'Koordinat Şifreleme', instruction: 'Şifreyi çöz.', pedagogicalNote: 'Konumlandırma.', imagePrompt: 'Map', grid: [['A','B'],['C','D']], wordsToFind: ['AD'], cipherCoordinates: ['A1', 'B2'], decodedMessage: 'AD' }));
};

export const generateOfflineWordConnect = async (options: GeneratorOptions): Promise<WordConnectData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({ title: 'Kelime Bağlama', instruction: 'Eşleştir.', pedagogicalNote: 'Semantik ilişki.', imagePrompt: 'Connect', gridDim: 2, points: [ {word: 'A', pairId: 1, x: 0, y: 0, color: 'blue'}, {word: 'A', pairId: 1, x: 1, y: 0, color: 'blue'} ] }));
};

export const generateOfflineProfessionConnect = async (o: GeneratorOptions) => generateOfflineWordConnect(o) as any as Promise<ProfessionConnectData[]>;

export const generateOfflineMatchstickSymmetry = async (options: GeneratorOptions): Promise<MatchstickSymmetryData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({ title: 'Kibrit Simetrisi', instruction: 'Simetriğini oluştur.', pedagogicalNote: 'Görsel simetri.', imagePrompt: 'Matchstick', puzzles: [{ id: 1, axis: 'vertical', lines: [{x1:1, y1:1, x2:2, y2:2, color:'orange'}] }] }));
};

export const generateOfflineVisualOddOneOutThemed = async (options: GeneratorOptions): Promise<VisualOddOneOutThemedData[]> => {
    const { worksheetCount, topic } = options;
    return Array.from({ length: worksheetCount }, () => ({ title: 'Tematik Farkı Bul', instruction: 'Uymayanı bul.', pedagogicalNote: 'Kategorizasyon.', imagePrompt: 'Theme Odd', rows: [{ theme: topic || 'Genel', items: [ {description: 'A', imagePrompt: 'A', isOdd: false}, {description: 'B', imagePrompt: 'B', isOdd: true} ] }] }));
};

export const generateOfflineStarHunt = async (options: GeneratorOptions): Promise<StarHuntData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => ({ title: `Yıldız Avı (${difficulty})`, instruction: 'Yıldızları bul.', pedagogicalNote: 'Seçici dikkat.', imagePrompt: 'Stars', grid: [['★', '○'], ['□', '★']], targetCount: 2 }));
};

export const generateOfflineShapeCounting = async (options: GeneratorOptions): Promise<ShapeCountingData[]> => {
    const { worksheetCount, concept, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => ({ title: `Şekil Sayma (${difficulty})`, instruction: 'Şekilleri say.', pedagogicalNote: 'Görsel ayrıştırma.', imagePrompt: 'Shapes', figures: [{ targetShape: 'triangle', correctCount: 5, svgPaths: [] }] }));
};

/* Removed JSX code mistakenly placed in a service file and replaced with proper placeholder offline generators */
export const generateOfflinePunctuationColoring = async (options: GeneratorOptions): Promise<PunctuationColoringData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({ title: 'Noktalama Boyama', instruction: 'Noktalama işaretlerini doğru renklere boya.', pedagogicalNote: 'Gramer ve dikkat.', imagePrompt: 'Punctuation', sentences: [] }));
};

export const generateOfflineSynonymAntonymColoring = async (options: GeneratorOptions): Promise<SynonymAntonymColoringData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({ title: 'Eş/Zıt Anlam Boyama', instruction: 'Kelimeleri anlamlarına göre boya.', pedagogicalNote: 'Semantik ilişkilendirme.', imagePrompt: 'Vocabulary', colorKey: [], wordsOnImage: [] }));
};

export const generateOfflineRomanNumeralConnect = async (options: GeneratorOptions): Promise<RomanNumeralConnectData[]> => {
    return generateOfflineAbcConnect(options) as any;
};

export const generateOfflineWeightConnect = async (options: GeneratorOptions): Promise<WeightConnectData[]> => {
    return generateOfflineAbcConnect(options) as any;
};

export const generateOfflineLengthConnect = async (options: GeneratorOptions): Promise<LengthConnectData[]> => {
    return generateOfflineAbcConnect(options) as any;
};

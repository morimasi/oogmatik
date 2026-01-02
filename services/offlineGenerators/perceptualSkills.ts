
import { 
    FindTheDifferenceData, WordComparisonData, ShapeMatchingData, FindIdenticalWordData, GridDrawingData, SymbolCipherData, BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, CoordinateCipherData, WordConnectData, ProfessionConnectData, MatchstickSymmetryData, VisualOddOneOutThemedData, PunctuationColoringData, SynonymAntonymColoringData, StarHuntData, ShapeCountingData, ShapeType,
    GeneratorOptions,
    RomanNumeralConnectData,
    WeightConnectData,
    LengthConnectData,
    VisualOddOneOutItem
} from '../../types';
import { shuffle, getRandomInt, getRandomItems, getWordsForDifficulty, SHAPE_TYPES, TR_VOCAB, generateConnectedPath, generateSymmetricPattern, PREDEFINED_GRID_PATTERNS } from './helpers';

const CHARACTER_PAIRS = [['b', 'd'], ['p', 'q'], ['m', 'n'], ['u', 'n'], ['6', '9'], ['2', '5'], ['s', 'z'], ['E', '3']];

const generateProceduralPolygon = (points: number, size = 40) => {
    let d = `M 50 ${50 - size}`;
    for (let i = 1; i < points; i++) {
        const angle = (i * 360 / points) * Math.PI / 180;
        const x = 50 + size * Math.sin(angle);
        const y = 50 - size * Math.cos(angle);
        d += ` L ${x} ${y}`;
    }
    return d + " Z";
};

const generateAbstractPath = (complexity: number) => {
    let d = `M ${getRandomInt(20, 80)} ${getRandomInt(20, 80)}`;
    for (let i = 0; i < complexity; i++) {
        d += ` L ${getRandomInt(10, 90)} ${getRandomInt(10, 90)}`;
    }
    return d;
};

// --- VISUAL ODD ONE OUT ---
export const generateOfflineVisualOddOneOut = async (options: GeneratorOptions): Promise<VisualOddOneOutData[]> => {
    const { worksheetCount, itemCount, difficulty, distractionLevel, gridSize, visualType = 'geometric' } = options;
    const results: VisualOddOneOutData[] = [];
    
    for (let p = 0; p < worksheetCount; p++) {
        const rowCount = itemCount || 8;
        const colCount = gridSize || 4;
        const rows = [];

        for (let i = 0; i < rowCount; i++) {
            const items: VisualOddOneOutItem[] = [];
            const correctIndex = getRandomInt(0, colCount - 1);
            
            const createBaseItem = (): VisualOddOneOutItem => {
                if (visualType === 'character') {
                    const pair = CHARACTER_PAIRS[getRandomInt(0, CHARACTER_PAIRS.length - 1)];
                    return { label: pair[0], rotation: 0 };
                }
                if (visualType === 'abstract') {
                    return { svgPaths: [{ d: generateAbstractPath(3), stroke: "#1e293b", strokeWidth: 2 }] };
                }
                if (visualType === 'complex') {
                    return { 
                        svgPaths: [
                            { d: generateProceduralPolygon(6, 40), stroke: "#1e293b", strokeWidth: 2 },
                            { d: `M 50 10 L 50 90 M 10 50 L 90 50`, stroke: "#94a3b8", strokeWidth: 1 }
                        ] 
                    };
                }
                return { svgPaths: [{ d: generateProceduralPolygon(getRandomInt(3, 8)), stroke: "#1e293b", strokeWidth: 3 }] };
            };

            const baseItem = createBaseItem();

            for (let j = 0; j < colCount; j++) {
                if (j === correctIndex) {
                    const oddItem = { ...JSON.parse(JSON.stringify(baseItem)) };
                    if (visualType === 'character') {
                        const pair = CHARACTER_PAIRS.find(p => p[0] === baseItem.label);
                        oddItem.label = pair ? pair[1] : (baseItem.label === 'b' ? 'd' : 'b');
                    } else if (distractionLevel === 'low') {
                        if (oddItem.svgPaths) oddItem.svgPaths[0].stroke = "#ef4444";
                    } else if (distractionLevel === 'medium') {
                        oddItem.rotation = 90;
                    } else if (distractionLevel === 'high') {
                        oddItem.rotation = 15;
                        if (oddItem.svgPaths) oddItem.svgPaths[0].strokeWidth = 1.5;
                    } else {
                        oddItem.isMirrored = true;
                        oddItem.scale = 0.85;
                    }
                    items.push(oddItem);
                } else {
                    items.push({ ...JSON.parse(JSON.stringify(baseItem)) });
                }
            }
            rows.push({ items, correctIndex, reason: `${visualType} farkı` });
        }

        results.push({
            title: `Görsel Ayrıştırma: ${visualType === 'character' ? 'Karakterler' : 'Örüntü Takibi'}`,
            instruction: "Satırdaki öğeleri incele. Diğerlerine benzemeyen farklı olanı bul ve işaretle.",
            pedagogicalNote: `Bu çalışma ${visualType} mimarisi üzerinden görsel dikkat ve şekil sabitliği becerilerini geliştirir.`,
            difficultyLevel: difficulty as any || 'Orta',
            distractionLevel: distractionLevel as any || 'medium',
            rows
        });
    }
    return results;
};

export const generateOfflineFindTheDifference = async (options: GeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { worksheetCount, difficulty, findDiffType = 'linguistic', distractionLevel = 'medium', itemCount, gridSize } = options;
    const results: FindTheDifferenceData[] = [];

    const getTitle = (type: string) => {
        switch(type) {
            case 'numeric': return 'Sayısal Ayrıştırma';
            case 'semantic': return 'Kelime Dedektifi';
            case 'pictographic': return 'Sembolik Dikkat';
            default: return 'Harf Ayrıştırma';
        }
    };

    const CRITICAL_PAIRS: Record<string, string[][]> = {
        linguistic: [['b', 'd'], ['p', 'q'], ['m', 'n'], ['u', 'n'], ['a', 'e'], ['s', 'z'], ['t', 'f'], ['ğ', 'g'], ['ı', 'i'], ['v', 'y']],
        numeric: [['6', '9'], ['2', '5'], ['1', '7'], ['0', '8'], ['3', '8'], ['4', '7']],
        semantic: [['dere', 'dede'], ['baba', 'dada'], ['kasa', 'masa'], ['kale', 'lale'], ['kitap', 'katip'], ['sarı', 'darı'], ['para', 'yara'], ['kuzu', 'kutu']],
        pictographic: [['▲', '▼'], ['◀', '▶'], ['⬈', '⬉'], ['◐', '◑'], ['◒', '◓'], ['◖', '◗']]
    };

    for (let p = 0; p < worksheetCount; p++) {
        const rowCount = itemCount || (difficulty === 'Uzman' ? 10 : 8);
        const colCount = gridSize || (difficulty === 'Uzman' ? 6 : 4);
        const rows = [];

        for (let i = 0; i < rowCount; i++) {
            const pairPool = CRITICAL_PAIRS[findDiffType] || CRITICAL_PAIRS.linguistic;
            const pair = pairPool[getRandomInt(0, pairPool.length - 1)];
            const baseChar = pair[0];
            const oddChar = pair[1];

            const correctIndex = getRandomInt(0, colCount - 1);
            const items = Array.from({ length: colCount }, (_, idx) => idx === correctIndex ? oddChar : baseChar);

            rows.push({
                items,
                correctIndex,
                visualDistractionLevel: distractionLevel as any
            });
        }

        results.push({
            title: `Farkı Bul: ${getTitle(findDiffType)}`,
            instruction: "Her satırı dikkatle inceleyin. Diğerlerinden farklı olan öğeyi bulun ve işaretleyin.",
            pedagogicalNote: "Disleksi rehabilitasyonunda kritik olan görsel ayrıştırma, seçici dikkat ve bilişsel esneklik becerilerini güçlendirir.",
            rows
        });
    }
    return results;
};

export const generateOfflineGridDrawing = async (options: GeneratorOptions): Promise<GridDrawingData[]> => {
    const { worksheetCount, difficulty, concept, gridSize = 6, itemCount = 1, useSearch } = options;
    const results: GridDrawingData[] = [];

    const diffLevelMap: Record<string, number> = {
        'Başlangıç': 1,
        'Orta': 2,
        'Zor': 3,
        'Uzman': 4
    };
    const complexity = diffLevelMap[difficulty] || 2;

    for (let p = 0; p < worksheetCount; p++) {
        const drawings = [];
        const taskCount = itemCount || 1;

        for (let i = 0; i < taskCount; i++) {
            const lines = generateConnectedPath(gridSize, complexity);
            drawings.push({
                lines,
                complexityLevel: difficulty,
                title: `Desen ${i + 1}`
            });
        }

        results.push({
            title: "Kare Kopyalama & Dönüşüm",
            instruction: getGridInstruction(concept as string || 'copy'),
            pedagogicalNote: "Görsel-uzamsal algı, şekil-zemin ilişkisi ve el-göz koordinasyonu becerilerini destekler.",
            gridDim: gridSize,
            showCoordinates: useSearch || false,
            transformMode: (concept as any) || 'copy',
            drawings
        });
    }

    return results;
};

const getGridInstruction = (mode: string) => {
    switch(mode) {
        case 'mirror_v': return "Soldaki deseni, sağdaki boş ızgaraya dikey aynadaki yansıması olacak şekilde çiz.";
        case 'mirror_h': return "Üstteki deseni, alttaki boş ızgaraya yatay aynadaki yansıması olacak şekilde çiz.";
        case 'rotate_90': return "Soldaki deseni, sağdaki boş ızgaraya saat yönünde 90 derece döndürerek çiz.";
        case 'rotate_180': return "Soldaki deseni, sağdaki boş ızgaraya baş aşağı (180 derece) döndürerek çiz.";
        default: return "Soldaki deseni sağdaki boş ızgaraya aynı şekilde kopyala.";
    }
};

export const generateOfflineSymmetryDrawing = async (options: GeneratorOptions): Promise<SymmetryDrawingData[]> => {
    const { worksheetCount, difficulty, visualType = 'vertical', gridSize = 10, useSearch } = options;
    const results: SymmetryDrawingData[] = [];

    const diffLevelMap: Record<string, number> = {
        'Başlangıç': 3,
        'Orta': 5,
        'Zor': 8,
        'Uzman': 12
    };
    const lineCount = diffLevelMap[difficulty] || 5;
    const axis = (visualType === 'horizontal' ? 'horizontal' : 'vertical') as 'vertical' | 'horizontal';

    for (let p = 0; p < worksheetCount; p++) {
        const lines: { x1: number, y1: number, x2: number, y2: number, color: string }[] = [];
        const dots: { x: number, y: number, color: string }[] = [];
        
        const dim = gridSize || 10;
        const half = Math.floor(dim / 2);
        
        // Simetri merkezi/ekseni çizgisi dışında kalan alanlarda noktalar üret
        const getPoint = () => {
            if (axis === 'vertical') {
                return { x: getRandomInt(0, half), y: getRandomInt(0, dim) };
            } else {
                return { x: getRandomInt(0, dim), y: getRandomInt(0, half) };
            }
        };

        let lastPoint = getPoint();
        dots.push({ ...lastPoint, color: '#4f46e5' });

        for (let i = 0; i < lineCount; i++) {
            const nextPoint = getPoint();
            // Aynı noktaya çizgi çekme
            if (nextPoint.x === lastPoint.x && nextPoint.y === lastPoint.y) continue;

            lines.push({
                x1: lastPoint.x,
                y1: lastPoint.y,
                x2: nextPoint.x,
                y2: nextPoint.y,
                color: '#0f172a'
            });
            lastPoint = nextPoint;
        }

        results.push({
            title: "Simetri Tamamlama",
            instruction: axis === 'vertical' ? "Şeklin dikey eksene göre ayna görüntüsünü sağ tarafa çizerek tamamla." : "Şeklin yatay eksene göre ayna görüntüsünü alt tarafa çizerek tamamla.",
            pedagogicalNote: "Zihinsel döndürme (mental rotation), uzamsal akıl yürütme ve simetri algısı becerilerini geliştirir.",
            gridDim: dim,
            axis: axis,
            showCoordinates: useSearch || false,
            isMirrorImage: true,
            lines,
            dots
        });
    }

    return results;
};


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
        const rowCount = itemCount || 6;
        const colCount = Math.min(20, gridSize || 4);
        const rows = [];

        for (let i = 0; i < rowCount; i++) {
            const items: VisualOddOneOutItem[] = [];
            const correctIndex = getRandomInt(0, colCount - 1);
            
            const createBaseItem = (): VisualOddOneOutItem => {
                if (visualType === 'character') {
                    const pair = CHARACTER_PAIRS[getRandomInt(0, CHARACTER_PAIRS.length - 1)];
                    return { label: pair[0], rotation: 0 };
                }
                return { svgPaths: [{ d: generateProceduralPolygon(getRandomInt(3, 8)), stroke: "#1e293b", strokeWidth: 3.5 }] };
            };

            const baseItem = createBaseItem();

            for (let j = 0; j < colCount; j++) {
                if (j === correctIndex) {
                    const oddItem = JSON.parse(JSON.stringify(baseItem));
                    if (visualType === 'character') {
                        const pair = CHARACTER_PAIRS.find(p => p[0] === baseItem.label);
                        oddItem.label = pair ? pair[1] : (baseItem.label === 'b' ? 'd' : 'b');
                    } else {
                        oddItem.rotation = 90;
                        oddItem.isMirrored = true;
                    }
                    items.push(oddItem);
                } else {
                    items.push(JSON.parse(JSON.stringify(baseItem)));
                }
            }
            rows.push({ items, correctIndex, reason: `${visualType} difference` });
        }

        results.push({
            title: `Görsel Ayrıştırma: ${visualType.toUpperCase()}`,
            instruction: `Farklı olan öğeyi bul ve işaretle.`,
            pedagogicalNote: `Görsel tarama ve seçici dikkat becerilerini geliştirir.`,
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
    const CRITICAL_PAIRS: Record<string, string[][]> = {
        linguistic: [['b', 'd'], ['p', 'q'], ['m', 'n'], ['u', 'n'], ['a', 'e']],
        numeric: [['6', '9'], ['2', '5'], ['1', '7']],
        semantic: [['dere', 'dede'], ['baba', 'dada'], ['kasa', 'masa']]
    };

    for (let p = 0; p < worksheetCount; p++) {
        const rows = [];
        for (let i = 0; i < (itemCount || 8); i++) {
            const pairPool = CRITICAL_PAIRS[findDiffType] || CRITICAL_PAIRS.linguistic;
            const pair = pairPool[getRandomInt(0, pairPool.length - 1)];
            const correctIndex = getRandomInt(0, (gridSize || 4) - 1);
            const items = Array.from({ length: (gridSize || 4) }, (_, idx) => idx === correctIndex ? pair[1] : pair[0]);
            rows.push({ items, correctIndex, visualDistractionLevel: distractionLevel as any });
        }
        results.push({
            title: `Farkı Bul: ${findDiffType}`,
            instruction: "Diğerlerinden farklı olan öğeyi bulun.",
            pedagogicalNote: "Görsel ayrıştırma becerisini güçlendirir.",
            rows
        });
    }
    return results;
};

export const generateOfflineGridDrawing = async (options: GeneratorOptions): Promise<GridDrawingData[]> => {
    const { worksheetCount, difficulty, concept, gridSize = 6, itemCount = 1 } = options;
    const results: GridDrawingData[] = [];
    for (let p = 0; p < worksheetCount; p++) {
        const drawings = Array.from({ length: itemCount || 1 }, (_, i) => ({
            lines: generateConnectedPath(gridSize, 3),
            complexityLevel: difficulty,
            title: `Desen ${i + 1}`
        }));
        results.push({
            title: "Kare Kopyalama",
            instruction: "Soldaki deseni sağdaki boş ızgaraya kopyala.",
            pedagogicalNote: "Görsel-motor entegrasyonu destekler.",
            gridDim: gridSize,
            showCoordinates: true,
            transformMode: (concept as any) || 'copy',
            drawings
        });
    }
    return results;
};

// --- ENHANCED SYMMETRY DRAWING GENERATOR ---
export const generateOfflineSymmetryDrawing = async (options: GeneratorOptions): Promise<SymmetryDrawingData[]> => {
    const { worksheetCount, difficulty, visualType = 'vertical', gridSize = 10 } = options;
    const results: SymmetryDrawingData[] = [];

    // Seviyeye göre nokta sayısı (Zorluk skalası)
    const complexityMap: Record<string, number> = {
        'Başlangıç': 4,
        'Orta': 6,
        'Zor': 9,
        'Uzman': 13
    };
    const nodeCount = complexityMap[difficulty] || 6;
    const axis = (visualType === 'horizontal' ? 'horizontal' : 'vertical') as 'vertical' | 'horizontal';
    const dim = gridSize || 10;
    const mid = Math.floor(dim / 2);

    for (let p = 0; p < worksheetCount; p++) {
        const lines: { x1: number, y1: number, x2: number, y2: number, color: string }[] = [];
        const dots: { x: number, y: number, color: string }[] = [];
        
        // 1. Koordinat havuzu oluştur (Sadece sol veya üst taraf için)
        // Eksen çizgisi (mid) üzerinde en az bir nokta olsun ki şekil bitişik dursun
        let currentPos = axis === 'vertical' ? { x: mid, y: getRandomInt(1, dim - 1) } : { x: getRandomInt(1, dim - 1), y: mid };
        dots.push({ ...currentPos, color: '#0f172a' });

        for (let i = 0; i < nodeCount; i++) {
            let nextPos;
            let attempts = 0;
            
            while (attempts < 20) {
                // Komşu noktalara hareket et (Mühendislik hissi için 45-90 derece)
                const dx = getRandomInt(-2, 2);
                const dy = getRandomInt(-2, 2);
                
                nextPos = { x: currentPos.x + dx, y: currentPos.y + dy };
                
                // Sınır Kontrolü
                const inBounds = nextPos.x >= 0 && nextPos.y >= 0 && nextPos.x <= dim && nextPos.y <= dim;
                // Taraf Kontrolü (Simetri eksenini geçmemeli)
                const inSide = axis === 'vertical' ? nextPos.x <= mid : nextPos.y <= mid;
                // Aynı nokta olmamalı
                const isDifferent = nextPos.x !== currentPos.x || nextPos.y !== currentPos.y;

                if (inBounds && inSide && isDifferent) break;
                attempts++;
            }

            if (nextPos) {
                lines.push({
                    x1: currentPos.x,
                    y1: currentPos.y,
                    x2: nextPos.x,
                    y2: nextPos.y,
                    color: '#0f172a'
                });
                dots.push({ ...nextPos, color: '#0f172a' });
                currentPos = nextPos;
            }
        }

        results.push({
            title: "Simetri Tamamlama Atölyesi",
            instruction: axis === 'vertical' 
                ? "Şeklin dikey eksene göre ayna görüntüsünü sağ tarafa çizerek tamamla." 
                : "Şeklin yatay eksene göre ayna görüntüsünü alt tarafa çizerek tamamla.",
            pedagogicalNote: "Zihinsel döndürme, uzamsal konumlandırma ve şekil sabitliği becerilerini geliştirir.",
            gridDim: dim,
            axis: axis,
            showCoordinates: options.useSearch || false,
            isMirrorImage: true,
            lines,
            dots
        });
    }

    return results;
};


import {
    FindTheDifferenceData, VisualOddOneOutData, GridDrawingData, SymmetryDrawingData, ShapeCountingData, DirectionalTrackingData,
    GeneratorOptions, SearchFieldItem, ShapeType
} from '../../types';
import { getRandomInt, shuffle, getRandomItems, generateConnectedPath, SHAPE_TYPES, PREDEFINED_GRID_PATTERNS, generateSymmetricPattern, turkishAlphabet } from './helpers';

// --- GEOMETRIC PATH CONSTANTS ---
const SHAPE_PATHS: Record<string, string> = {
    triangle: "M 50 15 L 85 85 L 15 85 Z",
    circle: "M 50 50 m -35 0 a 35 35 0 1 0 70 0 a 35 35 0 1 0 -70 0",
    square: "M 20 20 L 80 20 L 80 80 L 20 80 Z",
    star: "M 50 10 L 61 35 L 88 35 L 66 52 L 75 78 L 50 62 L 25 78 L 34 52 L 12 35 L 39 35 Z",
    hexagon: "M 50 10 L 85 30 L 85 70 L 50 90 L 15 70 L 15 30 Z",
    pentagon: "M 50 10 L 90 40 L 75 85 L 25 85 L 10 40 Z",
    diamond: "M 50 10 L 85 50 L 50 90 L 15 50 Z"
};

export const generateOfflineShapeCounting = async (options: GeneratorOptions): Promise<ShapeCountingData[]> => {
    const { worksheetCount, difficulty, itemCount = 30 } = options;
    const results: ShapeCountingData[] = [];

    // Zorluk seviyesine göre hedef/çeldirici oranı
    const config = {
        'Başlangıç': { targetRatio: 0.4, types: ['circle', 'square', 'triangle'] },
        'Orta': { targetRatio: 0.3, types: ['circle', 'square', 'triangle', 'star', 'hexagon'] },
        'Zor': { targetRatio: 0.2, types: SHAPE_TYPES },
        'Uzman': { targetRatio: 0.15, types: SHAPE_TYPES }
    }[difficulty] || { targetRatio: 0.3, types: ['circle', 'square', 'triangle', 'star'] };

    for (let p = 0; p < worksheetCount; p++) {
        // A4 sayfasında 4 ana bölge (Puzzle) oluştur
        const puzzles: any[] = [];

        for (let section = 0; section < 4; section++) {
            const searchField: any[] = [];
            let targetCount = 0;
            const currentItemCount = itemCount + (section * 5); // Her bölgede yoğunluk biraz artar

            for (let i = 0; i < currentItemCount; i++) {
                const isTarget = Math.random() < config.targetRatio;
                const type = isTarget ? 'triangle' : getRandomItems(config.types.filter(t => t !== 'triangle'), 1)[0];

                if (type === 'triangle') targetCount++;

                searchField.push({
                    id: `s-${section}-${i}`,
                    type: type as any,
                    x: getRandomInt(5, 90),
                    y: getRandomInt(5, 90),
                    rotation: getRandomInt(0, 359),
                    size: getRandomInt(15, 35) / 10, // 1.5 - 3.5 scale
                    color: 'black'
                });
            }

            puzzles.push({
                id: `section-${section}`,
                searchField: shuffle(searchField),
                correctCount: targetCount,
                difficultyScore: section + 1
            });
        }

        results.push({
            title: "Görsel Tarama: Üçgen Avı",
            instruction: "Aşağıdaki kutuların içindeki TÜM ÜÇGENLERİ bul ve sayısını altındaki kutucuğa yaz. Dikkat et, bazıları dönmüş veya gizlenmiş olabilir!",
            pedagogicalNote: "Şekil-zemin algısı (figure-ground) ve görsel sabitlik (visual constancy) becerilerini geliştiren klinik dikkat çalışması.",
            settings: {
                difficulty: difficulty || 'Orta',
                itemCount: itemCount,
                targetShape: 'triangle',
                colorComplexity: 'monochrome',
                layoutType: 'chaotic'
            },
            searchField: puzzles as any, // Taşınan yeni yapı
            correctCount: puzzles.reduce((acc, curr) => acc + curr.correctCount, 0),
            clues: ["İpucu: Gözlerinle satır satır tarama yaparak ilerlemek hata payını azaltır."]
        });
    }
    return results;
};

export const generateOfflineGridDrawing = async (options: GeneratorOptions): Promise<GridDrawingData[]> => {
    const { worksheetCount, difficulty, gridSize = 8, concept = 'copy' } = options;
    const results: GridDrawingData[] = [];

    for (let p = 0; p < worksheetCount; p++) {
        // Seçilen zorluğa/konsepte göre bir desen seç veya üret
        const patternName = getRandomItems(Object.keys(PREDEFINED_GRID_PATTERNS), 1)[0];
        const sourcePattern = PREDEFINED_GRID_PATTERNS[patternName];

        results.push({
            title: "Kare Kopyalama",
            instruction: "Sol taraftaki deseni sağdaki boş ızgaraya noktaları ve çizgileri takip ederek kopyalayın.",
            pedagogicalNote: "Görsel-motor koordinasyon, planlama ve mekansal ilişkilendirme becerilerini geliştirir.",
            gridDim: gridSize,
            showCoordinates: (options as any).showCoordinates !== false,
            transformMode: concept as any,
            drawings: [{
                lines: sourcePattern,
                title: patternName,
                complexityLevel: 'medium'
            }]
        });
    }
    return results;
};

export const generateOfflineSymmetryDrawing = async (options: GeneratorOptions): Promise<SymmetryDrawingData[]> => {
    const { worksheetCount, difficulty, gridSize = 8, concept = 'mirror_v' } = options;
    const results: SymmetryDrawingData[] = [];

    for (let p = 0; p < worksheetCount; p++) {
        // Simetrik çizgiler üret
        const lines = generateConnectedPath(gridSize / 2, 3).map(line => ({
            x1: line[0][0], y1: line[0][1],
            x2: line[1][0], y2: line[1][1],
            color: 'black'
        }));

        results.push({
            title: "Simetri Tamamlama",
            instruction: "Desenleri simetri eksenine göre aynadaki yansıması olacak şekilde tamamlayın.",
            pedagogicalNote: "Bilateral koordinasyon, görsel algı ve simetri kavramını güçlendirir.",
            gridDim: gridSize,
            axis: concept === 'mirror_h' ? 'horizontal' : 'vertical',
            showCoordinates: (options as any).showCoordinates !== false,
            lines,
            dots: []
        });
    }
    return results;
};

export const generateOfflineFindTheDifference = async (options: GeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { worksheetCount, difficulty, itemCount = 5, findDiffType = 'visual' } = options;
    const results: FindTheDifferenceData[] = [];

    for (let p = 0; p < worksheetCount; p++) {
        const size = difficulty === 'Başlangıç' ? 5 : (difficulty === 'Orta' ? 7 : 10);
        const sourceGrid: string[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => getRandomItems(findDiffType === 'char' ? turkishAlphabet.split('') : SHAPE_TYPES, 1)[0]));

        const targetGrid = sourceGrid.map(row => [...row]);
        const diffPositions: { r: number, c: number }[] = [];

        while (diffPositions.length < itemCount) {
            const r = getRandomInt(0, size - 1);
            const c = getRandomInt(0, size - 1);
            if (!diffPositions.some(pos => pos.r === r && pos.c === c)) {
                let newVal = getRandomItems(findDiffType === 'char' ? turkishAlphabet.split('') : SHAPE_TYPES, 1)[0];
                while (newVal === sourceGrid[r][c]) newVal = getRandomItems(findDiffType === 'char' ? turkishAlphabet.split('') : SHAPE_TYPES, 1)[0];
                targetGrid[r][c] = newVal;
                diffPositions.push({ r, c });
            }
        }

        results.push({
            title: "Farkı Bul",
            instruction: `İki tablo arasındaki ${itemCount} farkı bul ve işaretle.`,
            pedagogicalNote: "Dikkat yoğunluğu, görsel tarama ve karşılaştırmalı analiz yeteneğini geliştirir.",
            rows: Array.from({ length: size }, (_, r) => ({
                items: sourceGrid[r],
                correctIndex: -1, // Not used in this variant
                visualDistractionLevel: 'medium'
            }))
        } as any);
    }
    return results;
};

export const generateOfflineDirectionalTracking = async (options: GeneratorOptions): Promise<DirectionalTrackingData[]> => {
    const { worksheetCount, difficulty, codeLength = 5 } = options;
    const results: DirectionalTrackingData[] = [];

    for (let p = 0; p < worksheetCount; p++) {
        const size = 6;
        const grid: string[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => getRandomItems(turkishAlphabet.split(''), 1)[0]));

        const path: { r: number, c: number, char: string, direction: string }[] = [];
        let cr = getRandomInt(0, size - 3), cc = getRandomInt(0, size - 3);

        const directions = [
            { label: 'SAĞ', dr: 0, dc: 1, icon: 'fa-arrow-right' },
            { label: 'SOL', dr: 0, dc: -1, icon: 'fa-arrow-left' },
            { label: 'AŞAĞI', dr: 1, dc: 0, icon: 'fa-arrow-down' },
            { label: 'YUKARI', dr: -1, dc: 0, icon: 'fa-arrow-up' }
        ];

        for (let i = 0; i < codeLength; i++) {
            const move = directions[getRandomInt(0, 3)];
            const nr = Math.max(0, Math.min(size - 1, cr + move.dr));
            const nc = Math.max(0, Math.min(size - 1, cc + move.dc));
            path.push({ r: nr, c: nc, char: grid[nr][nc], direction: move.label });
            cr = nr; cc = nc;
        }

        results.push({
            title: "Yönsel İz Sürme",
            instruction: "Okları ve yönergeleri takip ederek ızgara üzerindeki harfleri topla ve gizli şifreyi oluştur.",
            pedagogicalNote: "Yönsel algı, takip ve mekansal kodlama becerilerini destekler.",
            puzzles: [{
                grid,
                path: path.map(p => p.direction),
                startPos: { r: path[0].r, c: path[0].c },
                targetWord: path.map(pt => pt.char).join('')
            }]
        });
    }
    return results;
};


import { 
    FindTheDifferenceData, VisualOddOneOutData, GridDrawingData, SymmetryDrawingData, ShapeCountingData,
    GeneratorOptions,
    VisualOddOneOutItem
} from '../../types';
import { shuffle, getRandomInt, getRandomItems, generateConnectedPath } from './helpers';

// --- VISUAL ODD ONE OUT ---
export const generateOfflineVisualOddOneOut = async (options: GeneratorOptions): Promise<VisualOddOneOutData[]> => {
    const { worksheetCount, difficulty, distractionLevel } = options;
    const results: VisualOddOneOutData[] = [];
    
    for(let i=0; i<worksheetCount; i++) {
        const rows = Array.from({length: 5}, () => {
            const isRotation = Math.random() > 0.5;
            const correctIndex = getRandomInt(0, 3);
            
            const items = Array.from({length: 4}, (_, idx) => {
                if (idx === correctIndex) {
                    return { 
                        rotation: isRotation ? 45 : 0, 
                        scale: isRotation ? 1 : 0.8,
                        label: "★" 
                    };
                }
                return { rotation: 0, scale: 1, label: "★" };
            });

            return {
                items,
                correctIndex,
                reason: isRotation ? "Dönmüş" : "Küçük"
            };
        });

        results.push({
            title: "Görsel Farklıyı Bul",
            instruction: "Her satırda diğerlerinden farklı olan şekli bul.",
            pedagogicalNote: "Görsel ayrımlaştırma.",
            difficultyLevel: difficulty as any,
            distractionLevel: distractionLevel || 'medium',
            rows
        });
    }
    return results;
};

// --- GRID DRAWING ---
export const generateOfflineGridDrawing = async (options: GeneratorOptions): Promise<GridDrawingData[]> => {
    const { worksheetCount, gridSize = 6 } = options;
    const results: GridDrawingData[] = [];

    for (let p = 0; p < worksheetCount; p++) {
        const lines = generateConnectedPath(gridSize, 5); 
        
        results.push({
            title: "Kare Kopyalama",
            instruction: "Soldaki deseni sağdaki boş alana aynen çiz.",
            pedagogicalNote: "Görsel-mekansal kopyalama ve ince motor becerisi.",
            gridDim: gridSize,
            showCoordinates: true,
            transformMode: 'copy',
            drawings: [{
                lines: lines,
                complexityLevel: 'Orta',
                title: 'Desen 1'
            }]
        });
    }
    return results;
};

// --- SYMMETRY DRAWING ---
export const generateOfflineSymmetryDrawing = async (options: GeneratorOptions): Promise<SymmetryDrawingData[]> => {
    const { worksheetCount, gridSize = 10 } = options;
    const results: SymmetryDrawingData[] = [];

    for (let p = 0; p < worksheetCount; p++) {
        const halfGrid = Math.floor(gridSize / 2);
        const lines: {x1:number, y1:number, x2:number, y2:number, color: string}[] = [];
        
        let cx = getRandomInt(0, halfGrid - 1);
        let cy = getRandomInt(0, gridSize);
        
        for(let k=0; k<6; k++) {
            const nx = getRandomInt(0, halfGrid - 1);
            const ny = getRandomInt(0, gridSize);
            lines.push({ x1: cx, y1: cy, x2: nx, y2: ny, color: '#000' });
            cx = nx;
            cy = ny;
        }

        results.push({
            title: "Simetri Tamamlama",
            instruction: "Şeklin diğer yarısını simetri eksenine göre tamamla.",
            pedagogicalNote: "Simetri algısı ve uzamsal ilişkilendirme.",
            gridDim: gridSize,
            axis: 'vertical',
            showCoordinates: true,
            isMirrorImage: true,
            lines,
            dots: []
        });
    }
    return results;
};

// --- SHAPE COUNTING (TRIANGLE PUZZLE) ---
export const generateOfflineShapeCounting = async (options: GeneratorOptions): Promise<ShapeCountingData[]> => {
    const { worksheetCount, difficulty, itemCount } = options;
    const results: ShapeCountingData[] = [];
    const count = itemCount || (difficulty === 'Başlangıç' ? 2 : 4);

    for (let p = 0; p < worksheetCount; p++) {
        const figures = [];
        
        for (let i = 0; i < count; i++) {
            // Algoritma: Tek tepeli üçgen bölünmesi
            // n: Dikey bölme sayısı (tabanı bölen)
            // h: Yatay kesik sayısı
            // Formül: (n * (n+1) / 2) * (h + 1)
            
            const n = getRandomInt(2, difficulty === 'Zor' ? 5 : 3); 
            const h = difficulty === 'Zor' || difficulty === 'Uzman' ? getRandomInt(1, 2) : 0; 
            const correctCount = (n * (n + 1) / 2) * (h + 1);
            
            // SVG Koordinatları (100x100 ViewBox)
            const top = { x: 50, y: 10 };
            const left = { x: 10, y: 90 };
            const right = { x: 90, y: 90 };
            
            const paths = [];
            // Ana Çerçeve
            paths.push({ d: `M ${top.x} ${top.y} L ${left.x} ${left.y} L ${right.x} ${right.y} Z`, fill: "none", stroke: "black", strokeWidth: 3 });
            
            // Dikey Çizgiler (Tepeden tabana)
            for (let k = 1; k < n; k++) {
                const ratio = k / n;
                const bx = left.x + (right.x - left.x) * ratio;
                const by = left.y;
                paths.push({ d: `M ${top.x} ${top.y} L ${bx} ${by}`, fill: "none", stroke: "black", strokeWidth: 2 });
            }
            
            // Yatay Çizgiler (Katmanlar)
            for (let k = 1; k <= h; k++) {
                const ratio = k / (h + 1);
                const lx = top.x + (left.x - top.x) * ratio;
                const ly = top.y + (left.y - top.y) * ratio;
                const rx = top.x + (right.x - top.x) * ratio;
                const ry = top.y + (right.y - top.y) * ratio;
                paths.push({ d: `M ${lx} ${ly} L ${rx} ${ry}`, fill: "none", stroke: "black", strokeWidth: 2 });
            }
            
            figures.push({
                targetShape: 'triangle',
                correctCount,
                svgPaths: paths
            });
        }
        
        results.push({
            title: "Şekil Sayma: Üçgenler",
            instruction: "Her şekilde kaç tane üçgen olduğunu say ve altındaki kutuya yaz.",
            pedagogicalNote: "Şekil-zemin ayrımı ve sistematik sayma stratejisi geliştirir.",
            figures
        });
    }
    return results;
};

// --- FIND THE DIFFERENCE (ENHANCED) ---
export const generateOfflineFindTheDifference = async (options: GeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { worksheetCount, difficulty, findDiffType = 'linguistic', distractionLevel = 'medium', gridSize = 4, itemCount = 6 } = options;
    const results: FindTheDifferenceData[] = [];
    
    const PAIRS: Record<string, string[][]> = {
        linguistic: [['b', 'd'], ['p', 'q'], ['m', 'n'], ['u', 'ü'], ['a', 'e'], ['K', 'H'], ['E', 'F'], ['M', 'W']],
        numeric: [['6', '9'], ['2', '5'], ['1', '7'], ['3', '8'], ['0', '8'], ['5', 'S']],
        semantic: [['Elma', 'Armut'], ['Kedi', 'Köpek'], ['Masa', 'Sandalye'], ['Göz', 'Gözlük']],
        shape: [['△', '▲'], ['□', '■'], ['○', '●'], ['★', '☆']]
    };

    for (let p = 0; p < worksheetCount; p++) {
        const rows = [];
        for (let i = 0; i < itemCount; i++) {
            const pairPool = PAIRS[findDiffType] || PAIRS.linguistic;
            const pair = pairPool[getRandomInt(0, pairPool.length - 1)];
            const base = pair[0];
            const target = pair[1];
            const correctIndex = getRandomInt(0, gridSize - 1);
            const items = Array.from({ length: gridSize }, (_, idx) => idx === correctIndex ? target : base);
            
            rows.push({ 
                items, 
                correctIndex, 
                visualDistractionLevel: distractionLevel as any 
            });
        }
        
        results.push({
            title: `Farkı Bul: ${findDiffType === 'linguistic' ? 'Harfler' : findDiffType === 'numeric' ? 'Rakamlar' : 'Şekiller'}`,
            instruction: "Her satırda diğerlerinden farklı olanı bul ve daire içine al.",
            pedagogicalNote: "Görsel ayrımlaştırma (Visual Discrimination) ve dikkat.",
            rows
        });
    }
    return results;
};

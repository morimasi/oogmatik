
import { 
    FindTheDifferenceData, VisualOddOneOutData, GridDrawingData, SymmetryDrawingData, ShapeCountingData, DirectionalTrackingData,
    GeneratorOptions
} from '../../types';
import { getRandomInt, shuffle, getRandomItems, generateConnectedPath, getWordsForDifficulty } from './helpers';

// --- HELPERS FOR SHAPE COUNTING (NESTED GEOMETRY) ---

const generateNestedTrianglePaths = (complexity: number) => {
    const paths = [];
    const top = { x: 50, y: 10 };
    const left = { x: 10, y: 90 };
    const right = { x: 90, y: 90 };

    // Base Triangle
    paths.push({ d: `M ${top.x} ${top.y} L ${left.x} ${left.y} L ${right.x} ${right.y} Z`, fill: "none", stroke: "black", strokeWidth: 3 });

    // Complexity 1: Vertical splits from top
    const n = complexity + 1; 
    for (let k = 1; k < n; k++) {
        const ratio = k / n;
        const bx = left.x + (right.x - left.x) * ratio;
        const by = left.y;
        paths.push({ d: `M ${top.x} ${top.y} L ${bx} ${by}`, fill: "none", stroke: "black", strokeWidth: 2 });
    }

    // Complexity 2: Horizontal layers
    if (complexity > 2) {
        const h = Math.floor(complexity / 2);
        for (let k = 1; k <= h; k++) {
            const ratio = k / (h + 1);
            const lx = top.x + (left.x - top.x) * ratio;
            const ly = top.y + (left.y - top.y) * ratio;
            const rx = top.x + (right.x - top.x) * ratio;
            const ry = top.y + (right.y - top.y) * ratio;
            paths.push({ d: `M ${lx} ${ly} L ${rx} ${ry}`, fill: "none", stroke: "black", strokeWidth: 2 });
        }
    }

    // Calculate correct count mathematically for nested triangles
    // (n * (n + 1) / 2) * (h + 1)
    const n_splits = n;
    const h_layers = complexity > 2 ? Math.floor(complexity / 2) : 0;
    const count = (n_splits * (n_splits + 1) / 2) * (h_layers + 1);

    return { paths, count };
};

export const generateOfflineShapeCounting = async (options: GeneratorOptions): Promise<ShapeCountingData[]> => {
    const { worksheetCount, difficulty, itemCount = 4 } = options;
    const results: ShapeCountingData[] = [];

    const difficultyMap: Record<string, number> = {
        'Başlangıç': 2,
        'Orta': 3,
        'Zor': 4,
        'Uzman': 6
    };

    const complexity = difficultyMap[difficulty] || 3;

    for (let p = 0; p < worksheetCount; p++) {
        const searchField: any[] = [];
        let totalTrianglesOnPage = 0;

        for (let i = 0; i < itemCount; i++) {
            // Her soru için hafif farklı karmaşıklık
            const variantComplexity = Math.max(1, complexity + (i % 2 === 0 ? 0 : -1));
            const { paths, count } = generateNestedTrianglePaths(variantComplexity);
            
            searchField.push({
                id: `fig-${i}`,
                type: 'nested', // Custom rendering indicator
                targetShape: 'triangle',
                correctCount: count,
                svgPaths: paths, // Geometrik datayı buraya gömüyoruz
                complexityScore: variantComplexity
            });
            totalTrianglesOnPage += count;
        }

        results.push({
            title: "Geometrik Analiz: Üçgen Sayma",
            instruction: "Aşağıdaki karmaşık şekilleri incele. Her bir görselin içinde kaç tane üçgen olduğunu dikkatlice say ve altındaki kutuya yaz.",
            pedagogicalNote: "Şekil-zemin algısı, görsel analiz ve çalışma belleği kapasitesini geliştirir.",
            settings: { 
                difficulty: difficulty || 'Orta', 
                itemCount: itemCount, 
                targetShape: 'triangle', 
                colorComplexity: 'monochrome', 
                layoutType: 'grid' 
            },
            searchField: searchField,
            correctCount: totalTrianglesOnPage,
            clues: ["İpucu: Sadece en küçük parçaları değil, birleşerek oluşan büyük üçgenleri de saymayı unutma!"]
        });
    }
    return results;
};

// ... remaining perceptual generators ...

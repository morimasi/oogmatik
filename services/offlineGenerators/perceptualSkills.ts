
import { 
    FindTheDifferenceData, VisualOddOneOutData, GridDrawingData, SymmetryDrawingData, ShapeCountingData, DirectionalTrackingData,
    GeneratorOptions, SearchFieldItem
} from '../../types';
import { getRandomInt, shuffle, getRandomItems, generateConnectedPath, SHAPE_TYPES } from './helpers';

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

// ... remaining generators ...

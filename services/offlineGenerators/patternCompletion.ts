import { PatternCompletionData } from '../../types';
import { GeneratorOptions } from '../../types/core';
import { getRandomInt, getRandomItems, shuffle } from './helpers';

export const generateOfflinePatternCompletion = async (options: GeneratorOptions): Promise<PatternCompletionData[]> => {
    const { worksheetCount, difficulty } = options;
    const diff = difficulty || 'Orta';

    const results: PatternCompletionData[] = [];

    const shapes = ["circle", "square", "triangle", "star", "hexagon", "diamond"];
    const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

    for (let i = 0; i < worksheetCount; i++) {
        // Logik tipi belirle
        const logicTypes = ["rotation", "shifting", "progressive", "alternating"];
        const logicType = logicTypes[getRandomInt(0, logicTypes.length - 1)];

        const matrix: any[] = [];
        const gridSize = 3;

        // Rastgele bir ana şekil ve renk seti seç
        const selectedShapes = getRandomItems(shapes, 3);
        const selectedColors = getRandomItems(colors, 3);

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                let cellShapes = [];
                const isMissing = x === gridSize - 1 && y === gridSize - 1;

                if (!isMissing) {
                    if (logicType === "shifting") {
                        // Satır bazlı kaydırma
                        const shapeIdx = (x + y) % selectedShapes.length;
                        cellShapes.push({ type: selectedShapes[shapeIdx], color: selectedColors[shapeIdx], rotation: 0 });
                    } else if (logicType === "rotation") {
                        // Köşe bazlı rotasyon (basitleştirilmiş)
                        const rotation = (x * 90 + y * 90) % 360;
                        cellShapes.push({ type: selectedShapes[0], color: selectedColors[0], rotation });
                    } else {
                        // Alternating
                        const idx = (x + y) % 2;
                        cellShapes.push({ type: selectedShapes[idx], color: selectedColors[idx], rotation: 0 });
                    }
                }

                matrix.push({
                    x, y,
                    isMissing,
                    shapes: cellShapes
                });
            }
        }

        // Doğru cevabı üret (en sağ alt köşe kuralına göre)
        let correctShapes = [];
        if (logicType === "shifting") {
            const shapeIdx = (2 + 2) % selectedShapes.length;
            correctShapes.push({ type: selectedShapes[shapeIdx], color: selectedColors[shapeIdx], rotation: 0 });
        } else if (logicType === "rotation") {
            const rotation = (2 * 90 + 2 * 90) % 360;
            correctShapes.push({ type: selectedShapes[0], color: selectedColors[0], rotation });
        } else {
            const idx = (2 + 2) % 2;
            correctShapes.push({ type: selectedShapes[idx], color: selectedColors[idx], rotation: 0 });
        }

        const optionsArr = [
            { id: "A", isCorrect: true, cell: { x: 2, y: 2, isMissing: false, shapes: correctShapes } },
            { id: "B", isCorrect: false, cell: { x: 2, y: 2, isMissing: false, shapes: [{ type: selectedShapes[2], color: selectedColors[1], rotation: 45 }] } },
            { id: "C", isCorrect: false, cell: { x: 2, y: 2, isMissing: false, shapes: [{ type: shapes[getRandomInt(0, 5)], color: colors[getRandomInt(0, 5)], rotation: 180 }] } },
            { id: "D", isCorrect: false, cell: { x: 2, y: 2, isMissing: false, shapes: [{ type: "star", color: "#000000", rotation: 0 }] } }
        ];

        results.push({
            id: 'pattern_' + Date.now() + '_' + i,
            activityType: 'PATTERN_COMPLETION' as any,
            title: "Kafayı Çalıştır: Deseni Tamamla (Premium)",
            settings: {
                difficulty: diff,
                patternType: 'geometric',
                gridSize: 3
            },
            content: {
                title: "Matrisi Tamamla",
                instruction: "Matristeki örüntü kuralını bozmadan soru işaretli yere gelecek parçayı bulun.",
                matrix,
                options: shuffle(optionsArr)
            }
        } as any);
    }

    return results;
};

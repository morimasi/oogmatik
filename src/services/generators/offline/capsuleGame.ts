import { NumberCapsuleData, GeneratorOptions } from '../../../types';

export const generateOfflineCapsuleGame = async (options: GeneratorOptions): Promise<NumberCapsuleData[]> => {
    const { difficulty, worksheetCount } = options;
    let size = 3;
    if (difficulty === 'Orta') size = 4;
    if (difficulty === 'Zor' || difficulty === 'Uzman') size = 5;

    // A4 page can fit multiple capsules depending on size.
    // size 3 -> 6 per page
    // size 4 -> 4 per page
    // size 5 -> 2-4 per page
    const puzzlesPerPage = size === 3 ? 6 : (size === 4 ? 4 : 2);

    const activities: NumberCapsuleData[] = [];

    for (let c = 0; c < worksheetCount; c++) {
        const useOdds = Math.random() > 0.5;
        const pagePuzzles = [];

        for (let p = 0; p < puzzlesPerPage; p++) {
            const puzzleGrid: (number | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
            const solutionGrid: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));

            const baseNumbers = useOdds ? [1, 3, 5, 7, 9] : [2, 4, 6, 8, 10];

            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    solutionGrid[i][j] = baseNumbers[Math.floor(Math.random() * baseNumbers.length)];
                }
            }

            const capsules: { id: string, target: number, cells: { x: number, y: number }[] }[] = [];
            const usedCells = new Set<string>();
            let capsId = 1;

            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    if (usedCells.has(`${i},${j}`)) continue;

                    const cellsInCapsule = [{ x: j, y: i }];
                    usedCells.add(`${i},${j}`);

                    const goRight = Math.random() > 0.5;

                    if (goRight && j + 1 < size && !usedCells.has(`${i},${j + 1}`)) {
                        cellsInCapsule.push({ x: j + 1, y: i });
                        usedCells.add(`${i},${j + 1}`);
                        if (Math.random() > 0.7 && j + 2 < size && !usedCells.has(`${i},${j + 2}`)) {
                            cellsInCapsule.push({ x: j + 2, y: i });
                            usedCells.add(`${i},${j + 2}`);
                        }
                    } else if (!goRight && i + 1 < size && !usedCells.has(`${i + 1},${j}`)) {
                        cellsInCapsule.push({ x: j, y: i + 1 });
                        usedCells.add(`${i + 1},${j}`);
                        if (Math.random() > 0.7 && i + 2 < size && !usedCells.has(`${i + 2},${j}`)) {
                            cellsInCapsule.push({ x: j, y: i + 2 });
                            usedCells.add(`${i + 2},${j}`);
                        }
                    }

                    let target = 0;
                    cellsInCapsule.forEach(cell => {
                        target += solutionGrid[cell.y][cell.x];
                    });

                    capsules.push({
                        id: `capsule_${capsId++}`,
                        target,
                        cells: cellsInCapsule
                    });
                }
            }

            const rowTargets = [];
            const colTargets = [];
            for (let i = 0; i < size; i++) {
                let rSum = 0;
                let cSum = 0;
                for (let j = 0; j < size; j++) {
                    rSum += solutionGrid[i][j];
                    cSum += solutionGrid[j][i];
                }
                rowTargets.push(rSum);
                colTargets.push(cSum);
            }
            
            pagePuzzles.push({
                id: `p${p+1}`,
                grid: puzzleGrid,
                capsules,
                rowTargets,
                colTargets
            });
        }

        activities.push({
            title: `Kapsül Oyunu (${size}x${size})`,
            instruction: `Aşağıdaki ${useOdds ? 'TEK' : 'ÇİFT'} sayıları birer kez kullanarak, sütun/satır ardındaki hedeflere ve kapsül içlerindeki toplamlara ulaşın. (Örn: ${useOdds ? '1,3,5,7,9' : '2,4,6,8,10'})`,
            puzzles: pagePuzzles
        });
    }

    return activities;
};

// Aliases for compatibility
export const generateCapsuleGameActivity = (difficulty: string, count: number) =>
    generateOfflineCapsuleGame({ difficulty, worksheetCount: count } as any);

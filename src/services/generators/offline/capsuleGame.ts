import { NumberCapsuleData, GeneratorOptions } from '../../../types';

export const generateOfflineCapsuleGame = async (options: GeneratorOptions): Promise<NumberCapsuleData[]> => {
  const { difficulty, worksheetCount = 1 } = options;
  const customSettings = (options as any).capsuleGame || {};
  
  // Single puzzle per page — use larger grid to fill A4
  let size = customSettings.gridSize || 4;
  if (!customSettings.gridSize) {
    if (difficulty === 'Kolay') size = 3;
    if (difficulty === 'Orta') size = 4;
    if (difficulty === 'Zor' || difficulty === 'Uzman') size = 5;
  }

  const activities: NumberCapsuleData[] = [];

  for (let c = 0; c < worksheetCount; c++) {
    let useOdds = Math.random() > 0.5;
    if (customSettings.numberSet === 'even') useOdds = false;
    if (customSettings.numberSet === 'odd') useOdds = true;

    const puzzleGrid: (number | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
    const solutionGrid: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));

    let baseNumbers = useOdds ? [1, 3, 5, 7, 9] : [2, 4, 6, 8, 10];
    if (customSettings.numberSet === 'prime') baseNumbers = [2, 3, 5, 7, 11, 13, 17].slice(0, 5);
    if (customSettings.numberSet === 'mixed') baseNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        solutionGrid[i][j] = baseNumbers[Math.floor(Math.random() * baseNumbers.length)];
      }
    }

    const capsules: { id: string; target: number; cells: { x: number; y: number }[] }[] = [];
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
        cellsInCapsule.forEach((cell) => {
          target += solutionGrid[cell.y][cell.x];
        });

        capsules.push({
          id: `capsule_${capsId++}`,
          target,
          cells: cellsInCapsule,
        });
      }
    }

    const rowTargets: number[] = [];
    const colTargets: number[] = [];
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

    activities.push({
      title: `Kapsül Oyunu (${size}x${size})`,
      instruction: `Aşağıdaki ${useOdds ? 'TEK' : 'ÇİFT'} sayıları birer kez kullanarak, sütun/satır ardındaki hedeflere ve kapsül içlerindeki toplamlara ulaşın. (Sayılar: ${useOdds ? '1,3,5,7,9' : '2,4,6,8,10'})`,
      pedagogicalNote: 'Toplama, gruplama ve mantıksal akıl yürütme becerilerini geliştirir.',
      puzzles: [
        {
          id: 'capsule_main',
          grid: puzzleGrid,
          capsules,
          rowTargets,
          colTargets,
        },
      ],
      settings: {
        difficulty,
        gridSize: size,
        aestheticMode: customSettings.aestheticMode || 'premium',
      },
    });
  }

  return activities;
};

// Aliases for compatibility
export const generateCapsuleGameActivity = (difficulty: string, count: number) =>
    generateOfflineCapsuleGame({ difficulty, worksheetCount: count } as unknown as any);

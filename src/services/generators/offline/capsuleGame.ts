import { NumberCapsuleData, GeneratorOptions } from '../../../types';

export const generateOfflineCapsuleGame = async (options: GeneratorOptions): Promise<NumberCapsuleData[]> => {
  const { difficulty, worksheetCount = 1 } = options;
  const customSettings = (options as any).capsuleGame || {};

  let size = customSettings.gridSize || 4;
  if (!customSettings.gridSize) {
    if (difficulty === 'Kolay') size = 3;
    if (difficulty === 'Orta') size = 4;
    if (difficulty === 'Zor' || difficulty === 'Uzman') size = 5;
  }

  // A4 Kâğıdı Tam Dolgu: Matris boyutuna göre sayfa başına bulmaca sayısı
  // 3x3 veya 4x4 matrislerde 2 ila 4 bulmaca sığar; 5x5 veya daha büyüklerinde 2 bulmaca sığar.
  const puzzleCount = customSettings.puzzleCount || (size <= 4 ? 4 : 2);
  const operation = customSettings.operation || 'addition';
  const aestheticMode = customSettings.aestheticMode || 'crystal';

  const activities: NumberCapsuleData[] = [];

  const opSymbols: Record<string, string> = {
    addition: '+',
    subtraction: '-',
    multiplication: '×',
    division: '÷'
  };

  const opInstruction: Record<string, string> = {
    addition: 'TOPLAYARAK',
    subtraction: 'ÇIKARARAK',
    multiplication: 'ÇARPARAK',
    division: 'BÖLEREK'
  };

  for (let c = 0; c < worksheetCount; c++) {
    const pagePuzzles: any[] = [];

    for (let p = 0; p < puzzleCount; p++) {
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

          capsules.push({
            id: `capsule_${capsId++}`,
            target: 0,
            cells: cellsInCapsule,
          });
        }
      }

      // Recalculate capsule targets based on operation
      capsules.forEach(cap => {
        if (operation === 'multiplication') {
          cap.target = cap.cells.reduce((acc, cell) => acc * solutionGrid[cell.y][cell.x], 1);
        } else if (operation === 'subtraction') {
          const vals = cap.cells.map(cell => solutionGrid[cell.y][cell.x]).sort((a, b) => b - a);
          cap.target = vals.reduce((acc, val, idx) => idx === 0 ? val : acc - val);
        } else if (operation === 'division') {
          const vals = cap.cells.map(cell => solutionGrid[cell.y][cell.x]).sort((a, b) => b - a);
          cap.target = vals.reduce((acc, val, idx) => idx === 0 ? val : (val !== 0 ? Math.floor(acc / val) : acc));
        } else {
          cap.target = cap.cells.reduce((acc, cell) => acc + solutionGrid[cell.y][cell.x], 0);
        }
        cap.id = `${cap.target}${opSymbols[operation] || ''}`;
      });

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

      pagePuzzles.push({
        id: `capsule_puzzle_${p + 1}`,
        grid: puzzleGrid,
        capsules,
        rowTargets,
        colTargets,
      });
    }

    activities.push({
      title: `Kapsül Matris Oyunu (${size}x${size}) - ${opInstruction[operation] || 'TOPLAMA'}`,
      instruction: `Boşlukları uygun sayılarla doldurun. Kapsül içi sayılar ${opInstruction[operation] || 'TOPLANDIĞINDA'} kapsül hedef sayıya ulaşmalı. Satır ve sütun toplamları kenardaki hedeflere eşit olmalıdır.`,
      puzzles: pagePuzzles,
      settings: {
        difficulty,
        gridSize: size,
        operation: operation as any,
        aestheticMode,
      },
    });
  }

  return activities;
};

// Aliases for compatibility
export const generateCapsuleGameActivity = (difficulty: string, count: number) =>
  generateOfflineCapsuleGame({ difficulty, worksheetCount: count } as Record<string, unknown>);

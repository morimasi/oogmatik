import { GeneratorOptions } from '../../types';
import { ActivityType } from '../../types/activity';

interface MeyveliToplamaData {
  id: string;
  activityType: ActivityType;
  title: string;
  instruction: string;
  grid: { 
    fruits: string[]; 
    gridIndices: number[][]; 
    rowSum: number[]; 
    colSum: number[]; 
    fruitValues: number[]; 
  }[];
  settings: GeneratorOptions;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Shuffle array
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const FRUITS = ['🍎', '🍐', '🍇', '🍊', '🍋', '🍓', '🥝', '🍑', '🍒', '🍍'];

export const generateOfflineMeyveliToplama = async (
  options: GeneratorOptions
): Promise<MeyveliToplamaData[]> => {
  const opts = options;
  const {
    worksheetCount = 1,
    difficulty = 'Orta',
    gridSize = 3,
    itemsPerPage = 4,
  } = opts;

  let finalGridSize = Number(gridSize) || 3;

  // Determine number of unique fruits per puzzle and value ranges based on difficulty
  let fruitCount = 3;
  let minVal = 1;
  let maxVal = 10;
  
  if (difficulty === 'Başlangıç') {
    fruitCount = 3;
    finalGridSize = 3; // ensure 3x3
    minVal = 1;
    maxVal = 5;
  } else if (difficulty === 'Orta') {
    fruitCount = 3;
    minVal = 2;
    maxVal = 12;
  } else if (difficulty === 'Zor') {
    fruitCount = 4;
    minVal = 5;
    maxVal = 20;
  }

  const numItems = Number(itemsPerPage) || 4;

  const pages: MeyveliToplamaData[] = [];

  for (let i = 0; i < worksheetCount; i++) {
    const grids = [];

    for (let p = 0; p < numItems; p++) {
      // Pick random fruits
      const shuffledFruits = shuffle(FRUITS);
      const selectedEmojis = shuffledFruits.slice(0, fruitCount);
      
      // Assign random distinct values to fruits
      const fruitValues: number[] = [];
      const usedValues = new Set<number>();
      while (fruitValues.length < fruitCount) {
        const val = getRandomInt(minVal, maxVal);
        if (!usedValues.has(val)) {
          usedValues.add(val);
          fruitValues.push(val);
        }
      }

      // Generate grid indices ensuring every fruit appears at least once
      const gridIndices: number[][] = [];
      const flatIndices: number[] = [];
      
      // Ensure each fruit is included
      for (let f = 0; f < fruitCount; f++) flatIndices.push(f);
      // Fill the rest randomly
      while (flatIndices.length < finalGridSize * finalGridSize) {
        flatIndices.push(getRandomInt(0, fruitCount - 1));
      }
      
      const shuffledIndices = shuffle(flatIndices);
      
      let index = 0;
      for (let r = 0; r < finalGridSize; r++) {
        const row: number[] = [];
        for (let c = 0; c < finalGridSize; c++) {
          row.push(shuffledIndices[index++]);
        }
        gridIndices.push(row);
      }

      // Calculate row sums
      const rowSum = gridIndices.map(row => row.reduce((sum, fruitIdx) => sum + fruitValues[fruitIdx], 0));
      
      // Calculate col sums
      const colSum = [];
      for (let c = 0; c < finalGridSize; c++) {
        let sum = 0;
        for (let r = 0; r < finalGridSize; r++) {
          sum += fruitValues[gridIndices[r][c]];
        }
        colSum.push(sum);
      }

      grids.push({
        fruits: selectedEmojis,
        gridIndices,
        rowSum,
        colSum,
        fruitValues,
      });
    }

    pages.push({
      id: `meyveli_${Date.now()}_${i}`,
      activityType: ActivityType.MATH_PUZZLE,
      title: 'Meyveli Matematik Bulmacası',
      instruction: 'Satır ve sütunlardaki toplamları kullanarak her meyvenin değerini bulunuz.',
      grid: grids,
      settings: opts,
    });
  }

  return pages;
};

export default generateOfflineMeyveliToplama;

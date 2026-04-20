import { GeneratorOptions } from '../../types';
import { ActivityType } from '../../types/activity';

interface MeyveliToplamaData {
  id: string;
  activityType: ActivityType;
  title: string;
  instruction: string;
  grid: { fruits: string[]; counts: number[][]; rowSum: number[] }[];
  targetSum: number;
  settings: GeneratorOptions;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const FRUITS = ['🍎', '🍐', '🍇', '🍊', '🍋', '🍓', '🥝', '🍑'];
const FRUIT_NAMES = ['Elma', 'Armut', 'Üzüm', 'Portakal', 'Limon', 'Çilek', 'Kivi', 'Şeftali'];

export const generateOfflineMeyveliToplama = async (
  options: GeneratorOptions
): Promise<MeyveliToplamaData[]> => {
  const opts = options;
  const {
    worksheetCount = 1,
    difficulty = 'Orta',
    gridSize = 3,
    fruitTypes = FRUIT_NAMES.slice(0, 3),
    maxSum = 15,
    maxFruitCount = 5,
    mode = 'classic',
  } = opts;

  const selectedFruits =
    fruitTypes.length >= gridSize ? fruitTypes.slice(0, gridSize) : FRUIT_NAMES.slice(0, gridSize);

  const selectedEmojis = FRUITS.slice(0, gridSize);

  const pages: MeyveliToplamaData[] = [];

  for (let i = 0; i < worksheetCount; i++) {
    // Grid üret
    const gridCounts: number[][] = [];
    for (let r = 0; r < gridSize; r++) {
      const row: number[] = [];
      for (let c = 0; c < gridSize; c++) {
        row.push(getRandomInt(1, maxFruitCount));
      }
      gridCounts.push(row);
    }

    // Satır toplamları
    const rowSums = gridCounts.map((row) => row.reduce((a, b) => a + b, 0));

    pages.push({
      id: `meyveli_${Date.now()}_${i}`,
      activityType: ActivityType.MATH_PUZZLE,
      title: 'Meyveli Toplama Bulmacası',
      instruction: `${selectedFruits.join(', ')} meyvelerinin sayılarını bulup toplamları eşitle.`,
      grid: [
        {
          fruits: selectedEmojis,
          counts: gridCounts,
          rowSum: rowSums,
        },
      ],
      targetSum: maxSum,
      settings: opts,
    });
  }

  return pages;
};

export default generateOfflineMeyveliToplama;

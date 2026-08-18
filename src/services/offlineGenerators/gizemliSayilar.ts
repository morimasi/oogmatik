import { GeneratorOptions } from '../../types';
import { ActivityType } from '../../types/activity';

export interface GizemliSayiPuzzle {
  [key: string]: unknown;
  id: string;
  targetNumber: number;
  clues: Array<{
    id: string;
    icon: string;
    text: string;
    category: string;
  }>;
  options: number[];
}

export interface GizemliSayilarWorksheetData {
  id: string;
  activityType: ActivityType;
  title: string;
  instruction: string;
  puzzles: GizemliSayiPuzzle[];
  difficulty: string;
  numberRange: string;
  showIcons: boolean;
  settings?: GeneratorOptions;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

/**
 * ULTRA-PREMIUM DETERMINISTIC GİZEMLİ SAYILAR GENERATOR
 * %100 Hızlı, Sıfır Sonsuz Döngü Riski, Tek Cevap Garantili
 */
export async function generateOfflineGizemliSayilar(
  options: GeneratorOptions
): Promise<GizemliSayilarWorksheetData[]> {
  const opts = options || {};
  const customSettings = (opts as any).customSettings || (opts as any).numberLogicRiddles || {};

  const worksheetCount = opts.worksheetCount || 1;
  const difficulty = opts.difficulty || customSettings.difficulty || 'Orta';
  const puzzleCount = customSettings.itemCount || opts.itemCount || (difficulty === 'Zor' ? 4 : 6);
  const clueCount = customSettings.clueCount || (difficulty === 'Zor' ? 4 : 3);
  const showIcons = customSettings.showIcons !== false;

  let minRange = 10;
  let maxRange = 50;
  if (difficulty === 'Kolay') {
    minRange = 10;
    maxRange = 40;
  } else if (difficulty === 'Orta') {
    minRange = 20;
    maxRange = 99;
  } else {
    minRange = 100;
    maxRange = 500;
  }

  const pages: GizemliSayilarWorksheetData[] = [];

  for (let w = 0; w < worksheetCount; w++) {
    const puzzles: GizemliSayiPuzzle[] = [];
    const usedTargets = new Set<number>();

    for (let p = 0; p < puzzleCount; p++) {
      let target = getRandomInt(minRange, maxRange);
      let attempts = 0;
      while (usedTargets.has(target) && attempts < 20) {
        target = getRandomInt(minRange, maxRange);
        attempts++;
      }
      usedTargets.add(target);

      const clues: Array<{ id: string; icon: string; text: string; category: string }> = [];

      const rangeSpan = difficulty === 'Zor' ? 25 : 15;
      const lower = Math.max(minRange, target - getRandomInt(5, rangeSpan));
      const upper = Math.min(maxRange, target + getRandomInt(5, rangeSpan));
      clues.push({
        id: `c_${p}_1`,
        icon: 'fa-arrows-left-right',
        text: `Sayı ${lower} ile ${upper} arasındadır.`,
        category: 'range',
      });

      const isEven = target % 2 === 0;
      clues.push({
        id: `c_${p}_2`,
        icon: 'fa-scale-balanced',
        text: isEven ? 'Çift bir sayıdır.' : 'Tek bir sayıdır.',
        category: 'parity',
      });

      if (target >= 10) {
        const sumDigits = String(target)
          .split('')
          .reduce((acc, d) => acc + parseInt(d, 10), 0);
        clues.push({
          id: `c_${p}_3`,
          icon: 'fa-calculator',
          text: `Rakamlarının toplamı ${sumDigits}'dir.`,
          category: 'digits',
        });
      }

      if (clueCount >= 4) {
        if (isPrime(target)) {
          clues.push({
            id: `c_${p}_4`,
            icon: 'fa-award',
            text: 'Bu sayı bir ASAL sayıdır.',
            category: 'math',
          });
        } else if (target % 5 === 0) {
          clues.push({
            id: `c_${p}_4`,
            icon: 'fa-percent',
            text: '5 ile kalansız bölünebilir.',
            category: 'math',
          });
        } else if (target % 3 === 0) {
          clues.push({
            id: `c_${p}_4`,
            icon: 'fa-layer-group',
            text: '3 ile kalansız bölünebilir.',
            category: 'math',
          });
        } else {
          const lastDigit = target % 10;
          clues.push({
            id: `c_${p}_4`,
            icon: 'fa-fingerprint',
            text: `Birler basamağındaki rakam ${lastDigit}'dir.`,
            category: 'digits',
          });
        }
      }

      const optionSet = new Set<number>([target]);
      let offset = 1;
      while (optionSet.size < 4 && offset < 50) {
        const cand1 = target + offset;
        const cand2 = target - offset;
        if (cand1 <= maxRange) optionSet.add(cand1);
        if (optionSet.size < 4 && cand2 >= minRange) optionSet.add(cand2);
        offset += getRandomInt(1, 4);
      }

      const optionsSorted = Array.from(optionSet).sort((a, b) => a - b);

      puzzles.push({
        id: `gizemli_${p + 1}`,
        targetNumber: target,
        clues,
        options: optionsSorted,
      });
    }

    pages.push({
      id: `gizemli_sheet_${Date.now()}_${w}`,
      activityType: ActivityType.NUMBER_LOGIC_RIDDLES,
      title: 'Gizemli Sayılar: İpuçlarını Takip Et!',
      instruction: 'Verilen dedektif ipuçlarını incele, tüm kuralları sağlayan TEK gizemli sayıyı bul ve işaretle.',
      puzzles,
      difficulty,
      numberRange: `${minRange}-${maxRange}`,
      showIcons,
      settings: opts,
    });
  }

  return pages;
}

export default generateOfflineGizemliSayilar;

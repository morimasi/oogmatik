import { GeneratorOptions } from '../../types';
import { ActivityType } from '../../types/activity';

interface GizemliSayilarData {
  id: string;
  activityType: ActivityType;
  title: string;
  instruction: string;
  riddles: {
    id: string;
    mysteryNumber: number;
    clues: { id: string; text: string; type: string }[];
  }[];
  settings: GeneratorOptions;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isPrime(num: number): boolean {
  for (let i = 2, s = Math.sqrt(num); i <= s; i++) {
    if (num % i === 0) return false;
  }
  return num > 1;
}

function generateClues(
  number: number,
  opts: {
    clueCount: number;
    operationTypes?: string[];
    includeDigitClue: boolean;
    difficulty: string;
  }
): { id: string; text: string; type: string }[] {
  let availableClues: { type: string; text: string }[] = [];
  const num = number;

  // Range clue
  const rangeMargin = opts.difficulty === 'Başlangıç' ? 10 : opts.difficulty === 'Orta' ? 25 : 50;
  const minBound = Math.max(1, num - getRandomInt(2, rangeMargin));
  const maxBound = num + getRandomInt(2, rangeMargin);
  availableClues.push({
    text: `Sayı ${minBound} ile ${maxBound} arasındadır.`,
    type: 'range',
  });

  // Parity clue
  availableClues.push({
    text: num % 2 === 0 ? 'Çift bir sayıdır.' : 'Tek bir sayıdır.',
    type: 'parity',
  });

  // Digit sum clue
  if (opts.includeDigitClue && num >= 10) {
    const digitSum = String(num)
      .split('')
      .reduce((a, b) => a + Number(b), 0);
    availableClues.push({
      text: `Rakamları toplamı ${digitSum}'dır.`,
      type: 'digit',
    });
    
    // Basamak ilişkisi (Zor ve iki veya üç basamaklı ise)
    if (opts.difficulty === 'Zor' && num >= 10 && num <= 999) {
      const strNum = String(num);
      const units = Number(strNum[strNum.length - 1]);
      const tens = Number(strNum[strNum.length - 2]);
      if (units > tens) {
        availableClues.push({ text: `Birler basamağı onlar basamağından ${units - tens} büyüktür.`, type: 'digit_relation' });
      } else if (tens > units) {
        availableClues.push({ text: `Onlar basamağı birler basamağından ${tens - units} büyüktür.`, type: 'digit_relation' });
      } else {
        availableClues.push({ text: `Onlar ve birler basamağı birbirine eşittir.`, type: 'digit_relation' });
      }
    }
  }

  // Prime clue
  if (opts.difficulty === 'Zor') {
    if (isPrime(num)) {
      availableClues.push({ text: 'Bu sayı bir asal sayıdır.', type: 'prime' });
    } else {
      // availableClues.push({ text: 'Bu sayı asal değildir.', type: 'prime' }); // Maybe too vague
    }
  }

  // Factor / Multiple clue
  if (opts.difficulty !== 'Başlangıç') {
    const factors: number[] = [];
    for (let i = 2; i <= Math.min(10, num / 2); i++) {
      if (num % i === 0) factors.push(i);
    }
    if (factors.length > 0) {
      const factor = factors[getRandomInt(0, factors.length - 1)];
      availableClues.push({
        text: `${factor}'in katıdır (veya ${factor}'e kalansız bölünür).`,
        type: 'operation',
      });
    } else if (num % 5 === 0) {
      availableClues.push({ text: '5\'in katıdır.', type: 'operation' });
    } else if (num % 10 === 0) {
      availableClues.push({ text: '10\'un katıdır.', type: 'operation' });
    }
  }

  // Shuffle clues except range which should ideally be first
  const rangeClue = availableClues.find(c => c.type === 'range');
  let otherClues = availableClues.filter(c => c.type !== 'range');
  
  // Fisher-Yates shuffle for other clues
  for (let i = otherClues.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [otherClues[i], otherClues[j]] = [otherClues[j], otherClues[i]];
  }

  let finalClues = rangeClue ? [rangeClue, ...otherClues] : otherClues;
  
  // Trim to clueCount
  finalClues = finalClues.slice(0, opts.clueCount);

  return finalClues.map((c, i) => ({
    id: `c${i+1}`,
    text: c.text,
    type: c.type
  }));
}

export const generateOfflineGizemliSayilar = async (
  options: GeneratorOptions
): Promise<GizemliSayilarData[]> => {
  const opts = options;
  const {
    worksheetCount = 1,
    difficulty = 'Orta',
    numberRange = [10, 100] as [number, number],
    clueCount = 3,
    operationTypes = ['topla', 'cikar'],
    includeMultiStep = false,
    includeModular = false,
    includeDigitClue = true,
    itemsPerPage = 6,
  } = opts;

  const numItems = Number(itemsPerPage) || 6;
  const minRange = Number(numberRange[0]) || 10;
  const maxRange = Number(numberRange[1]) || 100;
  const pages: GizemliSayilarData[] = [];

  for (let i = 0; i < worksheetCount; i++) {
    const riddles = [];
    const usedNumbers = new Set<number>();

    for (let p = 0; p < numItems; p++) {
      let mysteryNumber = getRandomInt(minRange, maxRange);
      // Try to avoid duplicates if possible
      let attempts = 0;
      while (usedNumbers.has(mysteryNumber) && attempts < 20) {
        mysteryNumber = getRandomInt(minRange, maxRange);
        attempts++;
      }
      usedNumbers.add(mysteryNumber);

      const clues = generateClues(mysteryNumber, {
        clueCount,
        operationTypes,
        includeDigitClue,
        difficulty,
      });

      riddles.push({
        id: `riddle_${p}`,
        mysteryNumber,
        clues,
      });
    }

    pages.push({
      id: `gizemli_${Date.now()}_${i}`,
      activityType: ActivityType.NUMBER_LOGIC_RIDDLES,
      title: 'Gizemli Sayılar: İpuçlarını Takip Et!',
      instruction: 'Aşağıdaki ipuçlarını dikkatlice oku ve her kutudaki gizemli sayıyı bul.',
      riddles,
      settings: opts,
    });
  }

  return pages;
};

export default generateOfflineGizemliSayilar;

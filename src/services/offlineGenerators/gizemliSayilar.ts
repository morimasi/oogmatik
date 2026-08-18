import { GeneratorOptions } from '../../types';
import { ActivityType } from '../../types/activity';

interface Clue {
  id: string;
  text: string;
  type: string;
  icon: string;
}

interface Puzzle {
  id: string;
  mysteryNumber: number;
  riddleParts: Clue[];
  options: number[];
  visualDistraction?: number[];
}

interface GizemliSayilarData {
  id: string;
  activityType: ActivityType;
  title: string;
  instruction: string;
  puzzles: Puzzle[];
  settings: GeneratorOptions;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isPrime(num: number): boolean {
  if (num <= 1) return false;
  for (let i = 2, s = Math.sqrt(num); i <= s; i++) {
    if (num % i === 0) return false;
  }
  return true;
}

// Generate clues that GUARANTEE a unique target number solution
function generateDeterministicClues(
  target: number,
  minRange: number,
  maxRange: number
): { text: string; type: string; icon: string }[] {
  const clues: { text: string; type: string; icon: string }[] = [];

  // 1. Range clue
  const lower = Math.max(minRange, target - getRandomInt(5, 15));
  const upper = Math.min(maxRange, target + getRandomInt(5, 15));
  clues.push({
    text: `Sayı ${lower} ile ${upper} arasındadır.`,
    type: 'range',
    icon: 'fa-arrows-left-right'
  });

  // 2. Parity clue
  const isEven = target % 2 === 0;
  clues.push({
    text: isEven ? 'Çift bir sayıdır.' : 'Tek bir sayıdır.',
    type: 'parity',
    icon: 'fa-scale-balanced'
  });

  // 3. Digit sum or relation clue
  const str = String(target);
  if (target >= 10) {
    const sum = str.split('').reduce((acc, d) => acc + Number(d), 0);
    clues.push({
      text: `Rakamları toplamı ${sum}'dır.`,
      type: 'digit_sum',
      icon: 'fa-calculator'
    });
  }

  // 4. Divisibility or Prime clue
  if (isPrime(target)) {
    clues.push({
      text: 'Bu sayı bir asal sayıdır.',
      type: 'prime',
      icon: 'fa-award'
    });
  } else if (target % 5 === 0) {
    clues.push({
      text: "5'in tam katıdır.",
      type: 'multiple',
      icon: 'fa-percent'
    });
  } else if (target % 3 === 0) {
    clues.push({
      text: "3'e kalansız bölünür.",
      type: 'multiple',
      icon: 'fa-layer-group'
    });
  } else {
    clues.push({
      text: `${target % 10}'a bölündüğünde kalan sıfırdır veya ${target % 2 === 0 ? '2' : '1'} ile biter.`,
      type: 'unit_digit',
      icon: 'fa-fingerprint'
    });
  }

  return clues;
}

export const generateOfflineGizemliSayilar = async (
  options: GeneratorOptions
): Promise<GizemliSayilarData[]> => {
  const opts = options || {};
  const gizemliSettings = (opts as any).numberLogicRiddles || {};

  const worksheetCount = opts.worksheetCount || 1;
  const itemCount = gizemliSettings.itemCount || opts.itemCount || 6;
  const minRange = 10;
  const maxRange = opts.difficulty === 'Zor' ? 200 : opts.difficulty === 'Kolay' ? 50 : 100;

  const pages: GizemliSayilarData[] = [];

  for (let w = 0; w < worksheetCount; w++) {
    const puzzles: Puzzle[] = [];
    const usedNumbers = new Set<number>();

    for (let p = 0; p < itemCount; p++) {
      let target = getRandomInt(minRange, maxRange);
      let attempts = 0;
      while (usedNumbers.has(target) && attempts < 30) {
        target = getRandomInt(minRange, maxRange);
        attempts++;
      }
      usedNumbers.add(target);

      const rawClues = generateDeterministicClues(target, minRange, maxRange);
      const riddleParts: Clue[] = rawClues.map((c, i) => ({
        id: `c_${i + 1}`,
        text: c.text,
        type: c.type,
        icon: c.icon
      }));

      // Distractor choices for UI (3 distractors + 1 correct)
      const distractors = new Set<number>([target]);
      let distractorAttempts = 0;
      while (distractors.size < 4 && distractorAttempts < 50) {
        distractorAttempts++;
        const fake = target + getRandomInt(-10, 10);
        if (fake >= minRange && fake <= maxRange) distractors.add(fake);
      }
      // Fill remaining if needed to guarantee 4 options
      let fallbackNum = minRange;
      while (distractors.size < 4 && fallbackNum <= maxRange) {
        distractors.add(fallbackNum);
        fallbackNum++;
      }

      puzzles.push({
        id: `puz_${p + 1}`,
        mysteryNumber: target,
        riddleParts,
        options: Array.from(distractors).sort((a, b) => a - b),
        visualDistraction: [target + 2, target - 3, target + 5]
      });
    }

    pages.push({
      id: `gizemli_${Date.now()}_${w}`,
      activityType: ActivityType.NUMBER_LOGIC_RIDDLES,
      title: 'Gizemli Sayılar: İpuçlarını Takip Et!',
      instruction: 'Aşağıdaki ipuçlarını dikkatlice incele ve tek cevabı olan gizemli sayıyı bul.',
      puzzles,
      settings: opts
    });
  }

  return pages;
};

export default generateOfflineGizemliSayilar;

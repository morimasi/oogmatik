
import { GeneratorOptions } from '../../types';
import { ActivityType } from '../../types/activity';
import { shuffle } from './helpers';

interface SayiDedektifiRiddle {
  id: string;
  mysteryNumber: number;
  clues: { id: string; text: string; type: string }[];
}

interface SayiDedektifiData {
  id: string;
  activityType: ActivityType;
  title: string;
  instruction: string;
  pedagogicalNote: string;
  riddles: SayiDedektifiRiddle[];
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

function generateAdvancedClues(
  number: number,
  difficulty: string,
  clueCount: number
): { id: string; text: string; type: string }[] {
  const clues: { text: string; type: string }[] = [];
  const num = number;

  // 1. Range Clue (Always first or core)
  const range = difficulty === 'Başlangıç' ? 10 : difficulty === 'Orta' ? 25 : 50;
  const minB = Math.max(1, num - getRandomInt(1, range));
  const maxB = num + getRandomInt(1, range);
  clues.push({ text: `Sayı ${minB} ile ${maxB} arasındadır.`, type: 'range' });

  // 2. Parity
  clues.push({ text: num % 2 === 0 ? 'Bu bir çift sayıdır.' : 'Bu bir tek sayıdır.', type: 'parity' });

  // 3. Digit Sum
  if (num >= 10) {
    const sum = String(num).split('').reduce((a, b) => a + Number(b), 0);
    clues.push({ text: `Rakamlarının toplamı ${sum}'dir.`, type: 'digit_sum' });
  }

  // 4. Comparison
  const anchor = Math.round(num / 10) * 10;
  if (num !== anchor) {
    clues.push({ text: num > anchor ? `${anchor}'den büyüktür.` : `${anchor}'den küçüktür.`, type: 'comparison' });
  }

  // 5. Multiples (Medium+)
  if (difficulty !== 'Başlangıç') {
    if (num % 5 === 0) clues.push({ text: '5\'in tam katıdır.', type: 'multiple' });
    if (num % 10 === 0) clues.push({ text: '10\'un tam katıdır.', type: 'multiple' });
    if (num % 3 === 0) clues.push({ text: '3 ile kalansız bölünebilir.', type: 'multiple' });
  }

  // 6. Advanced (Zor+)
  if (difficulty === 'Zor') {
    if (isPrime(num)) {
      clues.push({ text: 'Bu bir asal sayıdır.', type: 'prime' });
    }
    const str = String(num);
    if (str.length > 1) {
       const tens = Math.floor(num / 10);
       const units = num % 10;
       if (tens > units) clues.push({ text: 'Onlar basamağı birler basamağından büyüktür.', type: 'digit_logic' });
       else if (units > tens) clues.push({ text: 'Birler basamağı onlar basamağından büyüktür.', type: 'digit_logic' });
    }
  }

  // Pick unique types and shuffle
  const selected = shuffle(clues).slice(0, clueCount);
  return selected.map((c, i) => ({ id: `c${i}`, ...c }));
}

export const generateOfflineSayiDedektifi = async (
  options: GeneratorOptions
): Promise<SayiDedektifiData[]> => {
  const {
    worksheetCount = 1,
    difficulty = 'Orta',
    itemCount = 6, // 6 riddles per page for compact layout
    clueCount = 3
  } = options;

  const pages: SayiDedektifiData[] = [];
  
  const rangeMap: Record<string, [number, number]> = {
    'Başlangıç': [1, 20],
    'Orta': [10, 100],
    'Zor': [50, 500]
  };
  const [min, max] = rangeMap[difficulty] || [1, 100];

  for (let i = 0; i < worksheetCount; i++) {
    const riddles: SayiDedektifRiddle[] = [];
    const usedNumbers = new Set<number>();

    while (riddles.length < itemCount) {
      const mysteryNumber = getRandomInt(min, max);
      if (usedNumbers.has(mysteryNumber)) continue;
      
      usedNumbers.add(mysteryNumber);
      const clues = generateAdvancedClues(mysteryNumber, difficulty, clueCount);
      
      riddles.push({
        id: `riddle_${i}_${riddles.length}`,
        mysteryNumber,
        clues
      });
    }

    pages.push({
      id: `dedektif_${Date.now()}_${i}`,
      activityType: ActivityType.NUMBER_SENSE,
      title: 'Sayı Dedektifi Macerası',
      instruction: 'Aşağıdaki ipuçlarını incele ve her gizli sayıyı bulup kutucuğa yaz.',
      pedagogicalNote: 'Bu etkinlik; sayı hissi, basamak kavramı ve mantıksal eleme becerilerini geliştirir. Ardışık ipuçlarını sentezlemek çalışma belleğini destekler.',
      riddles,
      settings: options,
    });
  }
  return pages;
};

export default generateOfflineSayiDedektifi;

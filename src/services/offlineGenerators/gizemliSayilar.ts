import { GeneratorOptions } from '../../types';
import { ActivityType } from '../../types/activity';

interface GizemliSayilarData {
  id: string;
  activityType: ActivityType;
  title: string;
  instruction: string;
  pedagogicalNote: string;
  mysteryNumber: number;
  clues: { id: string; text: string; type: string }[];
  settings: GeneratorOptions;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
  const clues: { id: string; text: string; type: string }[] = [];
  const num = number;

  // Range clue
  const minBound = Math.max(1, Math.floor(num * 0.5));
  const maxBound = Math.min(500, num + 50);
  clues.push({
    id: 'c1',
    text: `Gizemli sayı ${minBound} ile ${maxBound} arasındadır.`,
    type: 'range',
  });

  // Digit sum clue
  if (opts.includeDigitClue) {
    const digitSum = String(num)
      .split('')
      .reduce((a, b) => a + Number(b), 0);
    clues.push({
      id: 'c2',
      text: `Rakamları toplamı ${digitSum}'dır.`,
      type: 'digit',
    });
  }

  // Parity clue
  clues.push({
    id: 'c3',
    text: num % 2 === 0 ? 'Çift bir sayıdır.' : 'Tek bir sayıdır.',
    type: 'parity',
  });

  // Multiplication clue for harder difficulties
  if (opts.difficulty === 'Zor' && opts.operationTypes?.includes('carp')) {
    const factors: number[] = [];
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) factors.push(i);
    }
    if (factors.length > 0) {
      const factor = factors[getRandomInt(0, factors.length - 1)];
      clues.push({
        id: 'c4',
        text: `${factor} ile kalansız bölünebilir.`,
        type: 'operation',
      });
    }
  }

  return clues.slice(0, opts.clueCount);
}

export const generateOfflineGizemliSayilar = async (
  options: GeneratorOptions
): Promise<GizemliSayilarData[]> => {
  const opts = options;
  const {
    worksheetCount = 1,
    difficulty = 'Orta',
    numberRange = [1, 100] as [number, number],
    clueCount = 3,
    operationTypes = ['topla', 'cikar'],
    includeMultiStep = false,
    includeModular = false,
    includeDigitClue = true,
    layoutStyle = 'ipucu-liste',
  } = opts;

  const pages: GizemliSayilarData[] = [];

  for (let i = 0; i < worksheetCount; i++) {
    const mysteryNumber = getRandomInt(numberRange[0], numberRange[1]);
    const clues = generateClues(mysteryNumber, {
      clueCount,
      operationTypes,
      includeDigitClue,
      difficulty,
    });

    pages.push({
      id: `gizemli_${Date.now()}_${i}`,
      activityType: ActivityType.NUMBER_LOGIC_RIDDLES,
      title: 'Gizemli Sayı: İpuçlarını Takip Et!',
      instruction: 'Aşağıdaki ipuçlarını oku ve gizemi sayıyı bul.',
      pedagogicalNote:
        'Bu etkinlik mantıksal çıkarım, sayı hissi ve çok adımlı düşünme becerisini geliştirir. Öğrenci ipuçlarını analiz ederek gizli sayıya ulaşır.',
      mysteryNumber,
      clues,
      settings: opts,
    });
  }

  return pages;
};

export default generateOfflineGizemliSayilar;

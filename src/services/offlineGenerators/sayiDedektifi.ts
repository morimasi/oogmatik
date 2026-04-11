import { GeneratorOptions } from '../../types';
import { ActivityType } from '../../types/activity';

interface SayiDedektifiData {
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

function generateDedektifClues(
  number: number,
  opts: { clueCount: number; difficulty: string }
): { id: string; text: string; type: string }[] {
  const clues: { id: string; text: string; type: string }[] = [];

  // Range
  clues.push({
    id: 'c1',
    text: `Sayı ${Math.floor(number / 2)} ile ${number + 20} arasında.`,
    type: 'range',
  });
  // Digit
  const digitSum = String(number)
    .split('')
    .reduce((a, b) => a + Number(b), 0);
  clues.push({ id: 'c2', text: `Rakamları toplamı ${digitSum}.`, type: 'digit' });
  // Parity
  clues.push({ id: 'c3', text: number % 2 === 0 ? 'Çift' : 'Tek', type: 'parity' });
  // Greater/Less
  clues.push({ id: 'c4', text: number > 50 ? '50 den büyük' : '50 den küçük', type: 'comparison' });

  return clues.slice(0, opts.clueCount);
}

export const generateOfflineSayiDedektifi = async (
  options: GeneratorOptions
): Promise<SayiDedektifiData[]> => {
  const opts = options;
  const { worksheetCount = 1, difficulty = 'Orta', numberRange = [1, 100], clueCount = 3 } = opts;

  const pages: SayiDedektifiData[] = [];
  for (let i = 0; i < worksheetCount; i++) {
    const mysteryNumber = getRandomInt(numberRange[0], numberRange[1]);
    const clues = generateDedektifClues(mysteryNumber, { clueCount, difficulty });

    pages.push({
      id: `dedektif_${Date.now()}_${i}`,
      activityType: ActivityType.NUMBER_SENSE,
      title: 'Sayı Dedektifi Macerası',
      instruction: 'İpuçlarını takip et, gizli sayıyı bul!',
      pedagogicalNote: 'Mantıksal çıkarım ve sayı hissi geliştirir.',
      mysteryNumber,
      clues,
      settings: opts,
    });
  }
  return pages;
};

export default generateOfflineSayiDedektifi;

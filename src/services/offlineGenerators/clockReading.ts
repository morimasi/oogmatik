import { GeneratorOptions, ClockReadingData } from '../../types';
import { getRandomInt, shuffle } from './helpers';

const hourWords = ["", "Bir", "İki", "Üç", "Dört", "Beş", "Altı", "Yedi", "Sekiz", "Dokuz", "On", "On Bir", "On İki"];

const getVerbalTime = (hour: number, minute: number): string => {
  const h = hour % 12 || 12;
  const nextH = (h % 12) + 1;

  if (minute === 0) return `Saat tam ${hourWords[h]}`;
  if (minute === 15) return `${hourWords[h]}ı çeyrek geçiyor`;
  if (minute === 30) return `${hourWords[h]} buçuk`;
  if (minute === 45) return `${hourWords[nextH]}e çeyrek var`;

  const suffixMap: Record<number, string> = { 1: 'ü', 3: 'ü', 4: 'ü', 9: 'ü', 2: 'yi', 7: 'yi', 12: 'yi', 5: 'i', 8: 'i', 10: 'i', 11: 'i', 6: 'yı' };
  const s = suffixMap[h] || 'ı';
  if (minute < 30) return `${hourWords[h]}${s} ${minute} geçiyor`;

  const remaining = 60 - minute;
  const nextSuffixMap: Record<number, string> = { 2: 'ye', 7: 'ye', 12: 'ye', 1: 'e', 3: 'e', 4: 'e', 5: 'e', 8: 'e', 9: 'e', 10: 'e', 11: 'e', 6: 'a' };
  const ns = nextSuffixMap[nextH] || 'e';
  return `${hourWords[nextH]}${ns} ${remaining} var`;
};

const generateClock = (precision: string) => {
  const hour = getRandomInt(1, 12);
  let minute = 0;
  if (precision === 'hour') minute = 0;
  else if (precision === '30-min') minute = Math.random() > 0.5 ? 0 : 30;
  else if (precision === '15-min') minute = [0, 15, 30, 45][getRandomInt(0, 3)];
  else if (precision === '5-min') minute = getRandomInt(0, 11) * 5;
  else minute = getRandomInt(0, 59);
  return { hour, minute, timeString: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` };
};

const generateDistractors = (correct: string, precision: string, count: number): string[] => {
  const set = new Set<string>([correct]);
  while (set.size < count + 1) {
    const { timeString } = generateClock(precision);
    set.add(timeString);
  }
  set.delete(correct);
  return shuffle(Array.from(set)).slice(0, count);
};

export const generateOfflineClockReading = async (options: GeneratorOptions): Promise<ClockReadingData[]> => {
  const { worksheetCount = 1, difficulty } = options;
  const variant = (options.variant || 'analog-to-digital') as ClockReadingData['variant'];
  const subVariant = (options as Record<string, unknown>).subVariant as string || 'standard';
  const precision = (options as Record<string, unknown>).precision as string || '15-min';
  const itemCount = options.itemCount || 12;
  const includeElapsed = (options as Record<string, unknown>).includeElapsed === true;
  const includeRoutine = (options as Record<string, unknown>).includeRoutine === true;

  const results: ClockReadingData[] = [];

  for (let p = 0; p < worksheetCount; p++) {
    const clocks: ClockReadingData['clocks'] = [];

    for (let i = 0; i < itemCount; i++) {
      const { hour, minute, timeString } = generateClock(precision);
      const verbalTime = getVerbalTime(hour, minute);

      let problemText: string | undefined;
      if (includeElapsed && i < Math.ceil(itemCount * 0.3)) {
        const prevH = hour === 1 ? 12 : hour - 1;
        const prevM = minute < 10 ? minute + 50 : minute - 10;
        problemText = `${getVerbalTime(prevH, prevM)} — şu anki saat?`;
      }

      let options: string[] | undefined;
      if (variant === 'verbal-match') {
        const optCount = subVariant === '6-options' ? 6 : 4;
        options = shuffle([timeString, ...generateDistractors(timeString, precision, optCount - 1)]);
      }

      clocks.push({ hour, minute, timeString, verbalTime, problemText, options });
    }

    const instruction = variant === 'analog-to-digital'
      ? 'Analog saatlerde gösterilen zamanı altındaki dijital kutucuklara yazın.'
      : variant === 'digital-to-analog'
        ? 'Dijital saate bakarak akrep ve yelkovanı boş kadrana çizin.'
        : 'Sözel saat ifadesini doğru saat görseliyle eşleştirin.';

    results.push({
      title: 'Saat Okuma Atölyesi',
      instruction,
      pedagogicalNote: 'Zaman algısı, analog-dijital dönüşüm ve ritmik sayma becerilerini destekler.',
      variant,
      subVariant,
      clocks,
      settings: {
        showNumbers: (options as any).showNumbers !== false,
        showTicks: (options as any).showTicks !== false,
        showHands: variant === 'analog-to-digital',
        showOptions: variant === 'verbal-match',
        difficulty,
        precision,
        itemCount,
        includeElapsed,
        includeRoutine,
      },
    });
  }

  return results;
};

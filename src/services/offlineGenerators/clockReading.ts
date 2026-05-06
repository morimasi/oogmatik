
import { GeneratorOptions, ClockReadingData } from '../../types';
import { getRandomInt, shuffle } from './helpers';

const getVerbalTime = (hour: number, minute: number): string => {
    const hourWords = ["", "Bir", "İki", "Üç", "Dört", "Beş", "Altı", "Yedi", "Sekiz", "Dokuz", "On", "On Bir", "On İki"];
    const h = hour % 12 || 12;
    const nextH = (h % 12) + 1;
    
    if (minute === 0) return `Saat tam ${hourWords[h]}`;
    if (minute === 30) return `${hourWords[h]} buçuk`;
    
    // Turkish verbal time rules
    if (minute === 15) return `${hourWords[h]}ı çeyrek geçiyor`;
    if (minute === 45) return `${hourWords[nextH]}e çeyrek var`;
    
    if (minute < 30) {
        const suffix = [2, 5, 7, 8, 10, 11, 12].includes(h) ? 'yi' : ([1, 3, 4, 9].includes(h) ? 'ü' : 'ı');
        // Simplified suffix logic for now, but better than before
        let suffixReal = 'ı';
        if ([1, 3, 4, 9].includes(h)) suffixReal = 'ü';
        else if ([2, 7, 12].includes(h)) suffixReal = 'yi';
        else if ([5, 8, 10, 11].includes(h)) suffixReal = 'i';
        else if ([6].includes(h)) suffixReal = 'yı';

        return `${hourWords[h]}${suffixReal} ${minute} geçiyor`;
    } else {
        const remaining = 60 - minute;
        let suffixReal = 'e';
        if ([1, 3, 4, 5, 8, 9, 10, 11].includes(nextH)) suffixReal = 'e';
        else suffixReal = 'a';
        if ([2, 7, 12].includes(nextH)) suffixReal = 'ye';

        return `${hourWords[nextH]}${suffixReal} ${remaining} var`;
    }
};

export const generateOfflineClockReading = async (options: GeneratorOptions): Promise<ClockReadingData[]> => {
    const { worksheetCount, difficulty, variant = 'analog-to-digital', itemCount = 12 } = options;
    const precision = (options as unknown as { precision: string }).precision || '15-min';
    
    const results: ClockReadingData[] = [];

    for (let p = 0; p < worksheetCount; p++) {
        const clocks = Array.from({ length: itemCount }, () => {
            const hour = getRandomInt(1, 12);
            let minute = 0;

            if (precision === 'hour') {
                minute = 0;
            } else if (precision === '30-min') {
                minute = Math.random() > 0.5 ? 0 : 30;
            } else if (precision === '15-min') {
                minute = [0, 15, 30, 45][getRandomInt(0, 3)];
            } else if (precision === '5-min') {
                minute = getRandomInt(0, 11) * 5;
            } else {
                minute = getRandomInt(0, 59);
            }

            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const verbalTime = getVerbalTime(hour, minute);

            // Generate realistic distractors
            const distractors = new Set<string>();
            while (distractors.size < 3) {
                const h = getRandomInt(1, 12);
                let m = 0;
                if (precision === 'hour') m = 0;
                else if (precision === '30-min') m = [0, 30][getRandomInt(0, 1)];
                else if (precision === '15-min') m = [0, 15, 30, 45][getRandomInt(0, 3)];
                else if (precision === '5-min') m = getRandomInt(0, 11) * 5;
                else m = getRandomInt(0, 59);

                const d = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                if (d !== timeString) distractors.add(d);
            }

            return {
                hour,
                minute,
                timeString,
                verbalTime,
                options: shuffle([timeString, ...Array.from(distractors)])
            };
        });

        results.push({
            title: "Saat Okuma Atölyesi",
            instruction: variant === 'analog-to-digital'
                ? "Analog saatlerde gösterilen zamanı altındaki dijital kutucuklara yazın."
                : "Verilen dijital zamana göre saatin akrep ve yelkovanını çizin.",
            pedagogicalNote: "Zaman algısı, analog-dijital dönüşüm ve ritmik sayma becerilerini destekler.",
            variant,
            clocks,
            settings: {
                showNumbers: (options as any).showNumbers !== false,
                showTicks: (options as any).showTicks !== false,
                showHands: variant === 'analog-to-digital',
                showOptions: difficulty === 'Başlangıç',
                difficulty
            }
        });
    }
    return results;
};

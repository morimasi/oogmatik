
import { GeneratorOptions, ClockReadingData } from '../../types';
import { getRandomInt, shuffle } from './helpers';

export const generateOfflineClockReading = async (options: GeneratorOptions): Promise<ClockReadingData[]> => {
    const { worksheetCount, difficulty, variant = 'analog-to-digital', itemCount = 12 } = options;
    const precision = (options as any).precision || '15-min';
    
    const results: ClockReadingData[] = [];

    for (let p = 0; p < worksheetCount; p++) {
        const clocks = Array.from({ length: itemCount }, () => {
            const hour = getRandomInt(1, 12);
            let minute = 0;

            if (precision === '30-min') {
                minute = Math.random() > 0.5 ? 0 : 30;
            } else if (precision === '15-min') {
                minute = [0, 15, 30, 45][getRandomInt(0, 3)];
            } else if (precision === '5-min') {
                minute = getRandomInt(0, 11) * 5;
            } else {
                minute = getRandomInt(0, 59);
            }

            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

            // Sözel zaman (Opsiyonel)
            const hourWords = ["", "Bir", "İki", "Üç", "Dört", "Beş", "Altı", "Yedi", "Sekiz", "Dokuz", "On", "On Bir", "On İki"];
            let verbalTime = `Saat ${hourWords[hour]}`;
            if (minute === 30) verbalTime += " buçuk";
            else if (minute !== 0) verbalTime += ` ${minute} geçiyor`;

            return {
                hour,
                minute,
                timeString,
                verbalTime,
                options: shuffle([timeString, `${(hour % 12) + 1}:15`, `${hour}:45`, `${hour - 1}:30`]).slice(0, 4)
            };
        });

        results.push({
            title: "Saat Okuma Atölyesi",
            instruction: variant === 'analog-to-digital'
                ? "Analog saatlerde gösterilen zamanı altındaki dijital kutucuklara yazın."
                : "Verilen dijital zamana göre saatin akrep ve yelkovanını çizin.",
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


import { GeneratorOptions, ClockReadingData } from '../../types';
import { getRandomInt, shuffle } from './helpers';

export const generateOfflineClockReading = async (options: GeneratorOptions): Promise<ClockReadingData[]> => {
    const { worksheetCount, difficulty, variant = 'analog-to-digital' } = options;
    const results: ClockReadingData[] = [];

    for (let p = 0; p < worksheetCount; p++) {
        const clocks = Array.from({ length: 6 }, () => {
            const hour = getRandomInt(1, 12);
            let minute = 0;

            if (difficulty === 'Başlangıç') {
                minute = Math.random() > 0.5 ? 0 : 30; // Sadece tam ve yarım saatler
            } else if (difficulty === 'Orta') {
                minute = [0, 15, 30, 45][getRandomInt(0, 3)]; // Çeyrek saatler eklendi
            } else {
                minute = getRandomInt(0, 11) * 5; // 5 dakikalık artışlar
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
                showNumbers: true,
                showTicks: true,
                showHands: variant === 'analog-to-digital',
                showOptions: difficulty === 'Başlangıç',
                difficulty
            }
        });
    }
    return results;
};

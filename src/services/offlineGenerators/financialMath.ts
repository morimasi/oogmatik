
import { GeneratorOptions, MoneyCountingData } from '../../types';
import { getRandomInt, shuffle } from './helpers';

export const generateOfflineMoneyCounting = async (options: GeneratorOptions): Promise<MoneyCountingData[]> => {
    const { worksheetCount, difficulty } = options;
    const results: MoneyCountingData[] = [];

    const notes = [200, 100, 50, 20, 10, 5];
    const coins = [1, 0.5, 0.25, 0.1, 0.05];

    for (let p = 0; p < worksheetCount; p++) {
        const puzzles = Array.from({ length: 4 }, () => {
            const selectedNotes: { value: number; count: number }[] = [];
            const selectedCoins: { value: number; count: number }[] = [];
            let total = 0;

            // Seviyeye göre para karmaşıklığı
            const noteCount = difficulty === 'Başlangıç' ? 2 : (difficulty === 'Orta' ? 3 : 5);

            for (let i = 0; i < noteCount; i++) {
                const val = notes[getRandomInt(0, difficulty === 'Başlangıç' ? 3 : 5)];
                const count = getRandomInt(1, 3);
                selectedNotes.push({ value: val, count });
                total += val * count;
            }

            if (difficulty !== 'Başlangıç') {
                for (let i = 0; i < 2; i++) {
                    const val = coins[getRandomInt(0, 2)];
                    const count = getRandomInt(1, 4);
                    selectedCoins.push({ value: val, count });
                    total += val * count;
                }
            }

            const formattedTotal = total.toFixed(2);

            return {
                notes: selectedNotes,
                coins: selectedCoins,
                question: "Cüzdandaki toplam para miktarını bulun.",
                options: shuffle([
                    `${total} TL`,
                    `${(total + 10).toFixed(2)} TL`,
                    `${(total - 5).toFixed(2)} TL`,
                    `${(total * 1.1).toFixed(2)} TL`
                ]),
                answer: `${formattedTotal} TL`
            };
        });

        results.push({
            title: "Paralarımız ve Hesaplamalar",
            instruction: "Görsellerdeki kağıt ve madeni paraları toplayarak toplam miktarı bulun.",
            puzzles
        });
    }
    return results;
};

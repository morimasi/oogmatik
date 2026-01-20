
import { GeneratorOptions, NumberPathLogicData, NumberLogicRiddleData } from '../../types';
import { shuffle, getRandomInt, getRandomItems } from './helpers';

/**
 * Sembolik İşlem Zinciri Yerel Üretici (Hızlı Mod)
 */
export const generateOfflineNumberPathLogic = async (options: GeneratorOptions): Promise<NumberPathLogicData[]> => {
    const { worksheetCount, difficulty, codeLength = 3, itemCount = 6 } = options;
    const pages: NumberPathLogicData[] = [];

    const SYMBOLS = ['circle', 'square', 'triangle', 'hexagon'];
    const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

    for (let p = 0; p < worksheetCount; p++) {
        // 1. Legend oluştur
        const legend = SYMBOLS.map((s, i) => ({
            symbol: s,
            operation: i % 2 === 0 ? '+' : '-',
            value: getRandomInt(1, 5),
            color: COLORS[i]
        }));

        const chains = Array.from({ length: itemCount }, () => {
            const startNumber = getRandomInt(5, 20);
            const steps = [];
            let currentVal = startNumber;

            for (let s = 0; s < codeLength; s++) {
                const leg = legend[getRandomInt(0, legend.length - 1)];
                const stepVal = leg.operation === '+' ? currentVal + leg.value : currentVal - leg.value;
                
                // Güvenlik: Sayı eksiye düşerse zorla topla
                if (stepVal < 0) {
                    const addLeg = legend.find(l => l.operation === '+') || legend[0];
                    steps.push({ symbol: addLeg.symbol, expectedValue: currentVal + addLeg.value });
                    currentVal += addLeg.value;
                } else {
                    steps.push({ symbol: leg.symbol, expectedValue: stepVal });
                    currentVal = stepVal;
                }
            }

            return { startNumber, steps };
        });

        pages.push({
            title: "Sembolik İşlem Zinciri",
            instruction: "Sembollerin hangi işlemlere geldiğini kutucuktan incele ve zinciri tamamla.",
            pedagogicalNote: "Çalışma belleği, kodlama ve aritmetik akıcılık becerilerini destekler.",
            legend,
            chains
        });
    }
    return pages;
};

/**
 * Sayısal Mantık Bilmeceleri Yerel Üretici (Hızlı Mod)
 */
export const generateOfflineNumberLogicRiddles = async (options: GeneratorOptions): Promise<NumberLogicRiddleData[]> => {
    const { worksheetCount, numberRange = '1-50', itemCount = 4 } = options;
    const pages: NumberLogicRiddleData[] = [];

    let [min, max] = numberRange.split('-').map(Number);
    if (isNaN(min)) min = 1; if (isNaN(max)) max = 50;

    for (let p = 0; p < worksheetCount; p++) {
        const puzzles = [];
        let total = 0;

        for (let i = 0; i < itemCount; i++) {
            const target = getRandomInt(min, max);
            total += target;

            const riddleParts = [
                { text: `Ben bir ${target % 2 === 0 ? 'ÇİFT' : 'TEK'} sayıyım.`, icon: 'fa-binary' },
                { text: target > (max / 2) ? `${max / 2}'den büyüğüm.` : `${max / 2}'den küçüğüm.`, icon: 'fa-arrows-left-right' },
                { text: `Rakamlarımın toplamı ${String(target).split('').reduce((a,b)=>a+Number(b),0)}'dir.`, icon: 'fa-plus' }
            ];

            const distractors = new Set<string>();
            while(distractors.size < 3) {
                const d = getRandomInt(min, max);
                if (d !== target) distractors.add(String(d));
            }

            puzzles.push({
                riddle: riddleParts.map(rp => rp.text).join(' '),
                riddleParts: shuffle(riddleParts),
                boxes: Array.from({length: 4}, () => [getRandomInt(min, max), getRandomInt(min, max)]),
                options: shuffle([String(target), ...Array.from(distractors)]),
                answer: String(target),
                answerValue: target
            });
        }

        pages.push({
            title: "Gizemli Sayılar: Dedektif Dosyası",
            instruction: "İpuçlarını oku, şüpheli sayıları incele ve doğru cevabı bul!",
            pedagogicalNote: "Mantıksal muhakeme ve sayı hissini güçlendirir.",
            sumTarget: total,
            sumMessage: "KONTROL: Bulduğun sayıları topladığında bu sonuca ulaşmalısın.",
            puzzles
        });
    }
    return pages;
};

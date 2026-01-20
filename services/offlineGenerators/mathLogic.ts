
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
 * Sayısal Mantık Bilmeceleri HIZLI MOD Motoru (Gelişmiş Dinamik Filtreleme)
 */
export const generateOfflineNumberLogicRiddles = async (options: GeneratorOptions): Promise<NumberLogicRiddleData[]> => {
    const { worksheetCount, numberRange = '1-50', itemCount = 6, gridSize = 3, difficulty } = options;
    const pages: NumberLogicRiddleData[] = [];

    let [min, max] = numberRange.split('-').map(Number);
    if (isNaN(min)) min = 1; if (isNaN(max)) max = 50;

    for (let p = 0; p < worksheetCount; p++) {
        const puzzles = [];
        let total = 0;

        for (let i = 0; i < itemCount; i++) {
            const target = getRandomInt(min, max);
            total += target;
            
            // --- DİNAMİK İPUCU HAVUZU ---
            const tStr = String(target);
            const tens = Math.floor(target / 10);
            const units = target % 10;
            const sum = tens + units;
            
            const pool = [
                { text: `Ben bir ${target % 2 === 0 ? 'ÇİFT' : 'TEK'} sayıyım.`, icon: 'fa-binary', type: 'parity' },
                { text: `Rakamlarımın toplamı ${sum}'dir.`, icon: 'fa-plus', type: 'digits' },
                { text: target > 25 ? "25'ten büyüğüm." : "25'ten küçüğüm.", icon: 'fa-arrows-left-right', type: 'comparison' },
                { text: `${target < 50 ? "50'den küçüğüm." : "50'den büyüğüm."}`, icon: 'fa-gauge-high', type: 'range' },
                { text: `Onlar basamağım ${tens % 2 === 0 ? 'ÇİFT' : 'TEK'} bir rakamdır.`, icon: 'fa-input-numeric', type: 'digits' },
                { text: `Birler basamağım ${units % 2 === 0 ? 'ÇİFT' : 'TEK'} bir rakamdır.`, icon: 'fa-fingerprint', type: 'digits' },
                { text: `${target % 5 === 0 ? "5'in tam katıyım." : "5'e bölündüğümde kalanlı çıkarım."}`, icon: 'fa-divide', type: 'arithmetic' },
                { text: `${target % 3 === 0 ? "3'ün tam katıyım." : "3'e tam bölünmem."}`, icon: 'fa-calculator', type: 'arithmetic' },
                { text: `${tens > units ? "Onlar basamağım birler basamağımdan büyüktür." : "Birler basamağım onlar basamağımdan büyük veya eşittir."}`, icon: 'fa-up-down', type: 'comparison' },
                { text: `Rakamlarımın çarpımı ${tens * units}'dir.`, icon: 'fa-xmark', type: 'arithmetic' },
                { text: `${target > 10 && target < 90 ? "10 ile 90 arasındayım." : "Uç değerlere yakınım."}`, icon: 'fa-arrows-left-right', type: 'range' },
                { text: `Birler basamağım ${units}'dir.`, icon: 'fa-hashtag', type: 'digits' },
                { text: `İsmimde ${target >= 10 && target < 20 ? 'On' : target >= 20 && target < 30 ? 'Yirmi' : 'farklı'} kelimesi geçer.`, icon: 'fa-spell-check', type: 'linguistic' },
                { text: `Komşu sayım ${target + 1}'dir.`, icon: 'fa-people-arrows', type: 'range' },
                { text: `${target > 0 ? "Pozitif bir değerim." : "Nötrüm."}`, icon: 'fa-plus-minus', type: 'parity' }
            ];

            // Kullanıcının istediği gridSize kadar ipucu seç (Karıştırılmış havuzdan)
            let selectedHints = shuffle(pool).slice(0, gridSize);
            
            // Eğer havuz yetersizse (gridSize çok büyükse) jenerik ipucu ekle
            while(selectedHints.length < gridSize) {
                selectedHints.push({ text: `Ben ${target} sayısına çok yakınım.`, icon: 'fa-location-crosshairs', type: 'range' });
            }

            // Çeldirici Şıklar Üret
            const distractors = new Set<string>();
            while(distractors.size < 3) {
                const d = getRandomInt(min, max);
                if (d !== target) distractors.add(String(d));
            }

            puzzles.push({
                id: `puzzle-${i}`,
                riddle: selectedHints.map(h => h.text).join(' '),
                riddleParts: selectedHints,
                boxes: Array.from({length: 4}, () => [getRandomInt(min, max), getRandomInt(min, max)]),
                visualDistraction: Array.from({length: 6}, () => getRandomInt(min, max)),
                options: shuffle([String(target), ...Array.from(distractors)]),
                answer: String(target),
                answerValue: target
            });
        }

        pages.push({
            title: "Sayı Dedektifi: Hızlı Analiz",
            instruction: "İpuçlarını incele, tüm şartları sağlayan tek sayıyı şıklardan bul!",
            pedagogicalNote: "Hızlı mod algoritması ile üretilmiştir. Mantıksal eleme becerisini hedefler.",
            sumTarget: total,
            sumMessage: "KONTROL: Bulduğun tüm sayıların toplamı aşağıdaki hedefe eşit olmalıdır.",
            puzzles
        });
    }
    return pages;
};


import { GeneratorOptions, NumberPatternData, NumberPyramidData, OddEvenSudokuData, KendokuData, BasicOperationsData, MoneyCountingData, MathMemoryCardsData, ClockReadingData, RealLifeProblemData, MathPuzzleData, NumberLogicRiddleData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, TR_VOCAB } from './helpers';

export const generateOfflineNumberLogicRiddles = async (options: GeneratorOptions): Promise<NumberLogicRiddleData[]> => {
    const { worksheetCount, numberRange, difficulty, logicModel, itemCount = 4, gridSize = 3 } = options;
    
    const [minRange, maxRange] = (numberRange || '1-50').split('-').map(Number);
    const pages: NumberLogicRiddleData[] = [];

    for (let p = 0; p < worksheetCount; p++) {
        const puzzles = [];
        let runningTotal = 0;
        
        for (let i = 0; i < itemCount; i++) {
            const n = getRandomInt(minRange, maxRange);
            const cluePool: string[] = [];
            
            // 1. Temel Kimlik İpuçları
            cluePool.push(n % 2 === 0 ? "Ben bir çift sayıyım." : "Ben bir tek sayıyım.");
            
            // 2. Aralık İpuçları
            const mid = Math.floor((minRange + maxRange) / 2);
            cluePool.push(n > mid ? `${mid}'den daha büyüğüm.` : `${mid}'den daha küçüğüm.`);
            
            // 3. Rakam Analizi
            const sumDigits = n.toString().split('').reduce((acc, curr) => acc + parseInt(curr), 0);
            cluePool.push(`Rakamlarımın toplamı ${sumDigits}'dir.`);
            
            // 4. Onluk Analizi (Eğer sayı > 10 ise)
            if (n >= 10) {
                const tens = Math.floor(n / 10);
                cluePool.push(`${tens}0 ile ${(tens + 1)}0 arasındayım.`);
            } else {
                cluePool.push(`Ben birler basamağında bir rakamım.`);
            }

            // 5. Kat/Bölüm İpuçları
            if (n % 5 === 0) cluePool.push("5'er sayarken beni söylersin.");
            else if (n % 3 === 0) cluePool.push("3'er ritmik saymada varım.");
            else cluePool.push(`${n-1}'den hemen sonra gelirim.`);

            // Seçilen derinliğe (gridSize) göre benzersiz ipuçlarını al
            const selectedClues = getRandomItems([...new Set(cluePool)], Math.min(gridSize, cluePool.length));

            // Options Matrix
            const boxes = Array.from({ length: 5 }, () => [getRandomInt(minRange, maxRange), getRandomInt(minRange, maxRange)]);
            boxes[getRandomInt(0, 4)][0] = n;

            const distractors = new Set<number>();
            while(distractors.size < 3) {
                const d = getRandomInt(minRange, maxRange);
                if (d !== n) distractors.add(d);
            }
            const allOptions = shuffle([n.toString(), ...Array.from(distractors).map(d => d.toString())]);
            const correctLetter = ['A', 'B', 'C', 'D'][allOptions.indexOf(n.toString())];

            puzzles.push({
                clues: selectedClues,
                visualHint: 'math_logic_icon',
                boxes,
                options: allOptions,
                answer: `${correctLetter} - ${n}`,
                answerValue: n
            });
            
            runningTotal += n;
        }

        pages.push({
            title: "Sayısal Mantık Bilmeceleri",
            instruction: "İpuçlarını tek tek oku, elediğin sayıların üzerine çarpı at ve gizli sayıyı bul!",
            pedagogicalNote: "Bu etkinlik, öğrencinin çalışma belleğini ve tümdengelimsel mantık yürütme becerilerini geliştirir. İpucu derinliği arttıkça analitik düşünme yükü artar.",
            sumTarget: runningTotal,
            sumMessage: `Sayfadaki 4 bilmecenin cevaplarını topladığında sonuç ${runningTotal} olmalı.`,
            puzzles
        });
    }

    return pages;
};

export const generateOfflineRealLifeMathProblems = async (options: GeneratorOptions): Promise<RealLifeProblemData[]> => {
    const { worksheetCount, difficulty, topic } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: "Günlük Yaşam Problemleri",
        instruction: "Problemleri dikkatlice oku ve çözümlerini yap.",
        pedagogicalNote: "Matematiksel kavramları günlük hayat durumlarına transfer etme.",
        imagePrompt: "Math in life",
        problems: [
            { text: `${topic || 'Ali'} marketten 5 elma aldı, 3 tanesini yedi. Kaç elması kaldı?`, solution: "2" },
            { text: `Bir sınıfta 12 öğrenci var. 4 öğrenci daha gelirse toplam kaç öğrenci olur?`, solution: "16" }
        ]
    }));
};

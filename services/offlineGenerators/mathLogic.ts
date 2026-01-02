
import { GeneratorOptions, NumberPatternData, NumberPyramidData, OddEvenSudokuData, KendokuData, BasicOperationsData, MoneyCountingData, MathMemoryCardsData, ClockReadingData, RealLifeProblemData, MathPuzzleData, NumberLogicRiddleData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, turkishAlphabet, generateSudokuGrid, generateLatinSquare, TR_VOCAB } from './helpers';

// SAYISAL MANTIK BİLMECELERİ (Gelişmiş Yerel Üretici)
export const generateOfflineNumberLogicRiddles = async (options: GeneratorOptions): Promise<NumberLogicRiddleData[]> => {
    const { worksheetCount, numberRange, difficulty, gridSize = 3, itemCount = 4 } = options;
    
    const [minRange, maxRange] = (numberRange || '1-50').split('-').map(Number);
    const pages: NumberLogicRiddleData[] = [];

    for (let p = 0; p < worksheetCount; p++) {
        const puzzles = [];
        let runningTotal = 0;
        
        for (let i = 0; i < itemCount; i++) {
            const targetNumber = getRandomInt(minRange, maxRange);
            const hints: string[] = [];
            
            // Dinamik İpucu Üretim Havuzu (gridSize kadar seçilecek)
            const potentialHints = [
                targetNumber % 2 === 0 ? "Ben bir çift sayıyım." : "Ben bir tek sayıyım.",
                targetNumber > (maxRange / 2) ? `${Math.floor(maxRange/2)}'den büyüğüm.` : `${Math.floor(maxRange/2)}'den küçüğüm.`,
                targetNumber > 9 ? `Onlar basamağım ${Math.floor(targetNumber/10)}'dir.` : "Tek basamaklı bir sayıyım.",
                targetNumber % 5 === 0 ? "5'in tam katıyım." : "5'e tam bölünmem.",
                targetNumber % 10 === 0 ? "Sonumda 0 rakamı var." : "Son rakamım 0 değil.",
                `Rakamlarım toplamı ${targetNumber.toString().split('').reduce((a,b)=>a+parseInt(b),0)}'dir.`,
                targetNumber < 100 ? `100'e olan uzaklığım ${100-targetNumber}'dir.` : "Üç basamaklıyım."
            ];

            // Kullanıcının istediği ipucu sayısı kadar rastgele ama tutarlı ipucu seç
            const selectedHints = shuffle(potentialHints).slice(0, gridSize);

            // Seçenek kutuları (Boxes) görsel doluluk için
            const boxes = Array.from({ length: 5 }, () => {
                const b = [getRandomInt(minRange, maxRange), getRandomInt(minRange, maxRange)];
                return b;
            });
            // Bir tanesine mutlaka doğru cevabı koy
            boxes[getRandomInt(0, 4)][getRandomInt(0, 1)] = targetNumber;

            const distractors = new Set<number>();
            while(distractors.size < 3) {
                const d = getRandomInt(minRange, maxRange);
                if (d !== targetNumber) distractors.add(d);
            }
            const allOptions = shuffle([targetNumber.toString(), ...Array.from(distractors).map(d => d.toString())]);
            const correctLetter = ['A', 'B', 'C', 'D'][allOptions.indexOf(targetNumber.toString())];

            puzzles.push({
                riddle: selectedHints.join(' '),
                boxes,
                options: allOptions,
                answer: `${correctLetter} - ${targetNumber}`,
                answerValue: targetNumber
            });
            
            runningTotal += targetNumber;
        }

        pages.push({
            title: "Sayısal Mantık Bilmeceleri",
            instruction: "İpuçlarını dikkatle oku, zihninde sayıyı canlandır ve doğru seçeneği işaretle!",
            pedagogicalNote: `Bu etkinlik, ${gridSize} aşamalı mantıksal çıkarım yapma, işleyen bellek ve sayı hissi becerilerini geliştirir.`,
            sumTarget: runningTotal,
            sumMessage: `Kontrol Paneli: Tüm doğru cevapları topladığında ${runningTotal} sayısına ulaşmalısın.`,
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

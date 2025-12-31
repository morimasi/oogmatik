
import { GeneratorOptions, NumberPatternData, NumberPyramidData, OddEvenSudokuData, KendokuData, BasicOperationsData, MoneyCountingData, MathMemoryCardsData, ClockReadingData, RealLifeProblemData, MathPuzzleData, NumberLogicRiddleData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, turkishAlphabet, generateSudokuGrid, generateLatinSquare, TR_VOCAB } from './helpers';

// ... (helper functions same)

// NUMBER LOGIC RIDDLES (Offline Enhanced)
export const generateOfflineNumberLogicRiddles = async (options: GeneratorOptions): Promise<NumberLogicRiddleData[]> => {
    const { worksheetCount, numberRange, difficulty, codeLength, itemCount = 4 } = options;
    
    const [minRange, maxRange] = (numberRange || '1-50').split('-').map(Number);
    const pages: NumberLogicRiddleData[] = [];

    for (let p = 0; p < worksheetCount; p++) {
        const puzzles = [];
        let runningTotal = 0;
        
        for (let i = 0; i < itemCount; i++) {
            const n = getRandomInt(minRange, maxRange);
            const hints = [];
            
            if (n % 2 === 0) hints.push("Ben bir çift sayıyım.");
            else hints.push("Ben bir tek sayıyım.");

            if (n > (maxRange / 2)) hints.push(`${Math.floor(maxRange/2)}'den büyüğüm.`);
            else hints.push(`${Math.floor(maxRange/2)}'den küçüğüm.`);

            if (difficulty === 'Zor' || difficulty === 'Uzman') {
                const sumDigits = n.toString().split('').reduce((acc, curr) => acc + parseInt(curr), 0);
                hints.push(`Rakamlarım toplamı ${sumDigits}'dir.`);
            }

            const boxes = Array.from({ length: 5 }, () => {
                return [getRandomInt(minRange, maxRange), getRandomInt(minRange, maxRange)];
            });
            boxes[getRandomInt(0, 4)][0] = n;

            const distractors = new Set<number>();
            while(distractors.size < 3) {
                const d = getRandomInt(minRange, maxRange);
                if (d !== n) distractors.add(d);
            }
            const allOptions = shuffle([n.toString(), ...Array.from(distractors).map(d => d.toString())]);
            const correctLetter = ['A', 'B', 'C', 'D'][allOptions.indexOf(n.toString())];

            puzzles.push({
                riddle: hints.join(' '),
                boxes,
                options: allOptions,
                answer: `${correctLetter} - ${n}`,
                answerValue: n
            });
            
            runningTotal += n;
        }

        pages.push({
            title: "Sayısal Mantık Bilmeceleri",
            instruction: "Bilmeceleri çöz, doğru şıkkı bul ve tüm cevapların toplamıyla büyük hedefe ulaş!",
            pedagogicalNote: "Çalışma belleği, sayı hissi ve mantıksal çıkarım becerilerini geliştirir.",
            sumTarget: runningTotal,
            sumMessage: `Bu sayfadaki doğru cevapların toplamı tam olarak ${runningTotal} olmalıdır.`,
            puzzles
        });
    }

    return pages;
};

// Added missing offline real life math problems generator
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

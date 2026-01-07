
import { GeneratorOptions, NumberPatternData, NumberPyramidData, OddEvenSudokuData, KendokuData, MoneyCountingData, MathMemoryCardsData, ClockReadingData, RealLifeProblemData, MathPuzzleData, NumberLogicRiddleData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, turkishAlphabet, generateSudokuGrid, generateLatinSquare, TR_VOCAB } from './helpers';

export const generateOfflineMathPuzzle = async (options: GeneratorOptions): Promise<MathPuzzleData[]> => {
    const { worksheetCount, difficulty } = options;
    const items = [];
    
    for (let p = 0; p < worksheetCount; p++) {
        const puzzles = [];
        const count = difficulty === 'Başlangıç' ? 2 : 4;

        for (let i = 0; i < count; i++) {
            const v1 = getRandomInt(1, 10);
            const v2 = getRandomInt(1, 10);
            
            const obj1 = { name: "Yıldız", value: v1, imagePrompt: "star icon" };
            const obj2 = { name: "Kalp", value: v2, imagePrompt: "heart icon" };

            puzzles.push({
                id: `off-puz-${p}-${i}`,
                complexity: 'systemic' as const,
                equations: [
                    {
                        leftSide: [{ objectName: "Yıldız", multiplier: 1 }, { objectName: "Yıldız", multiplier: 1 }],
                        operator: "+",
                        rightSide: v1 + v1
                    },
                    {
                        leftSide: [{ objectName: "Yıldız", multiplier: 1 }, { objectName: "Kalp", multiplier: 1 }],
                        operator: "+",
                        rightSide: v1 + v2
                    }
                ],
                finalQuestion: "Kalp - Yıldız",
                answer: (v2 - v1).toString(),
                objects: [obj1, obj2]
            });
        }

        items.push({
            title: "Gizemli Matematik Atölyesi",
            instruction: "Denklemleri çözerek nesnelerin değerini bul, final sorusunu yanıtla.",
            pedagogicalNote: "Değişken kavramını somutlaştırarak cebirsel düşünme temellerini atar.",
            puzzles
        });
    }
    return items;
};

export const generateOfflineClockReading = async (options: GeneratorOptions): Promise<ClockReadingData[]> => {
    const { worksheetCount, difficulty, itemCount = 6, variant = 'analog-to-digital', is24Hour, showNumbers, showTicks, showOptions, showHands } = options;
    const pages: ClockReadingData[] = [];

    for (let p = 0; p < worksheetCount; p++) {
        const clocks = [];
        for (let i = 0; i < itemCount; i++) {
            // Hour logic: If 24h format, randomly pick afternoon hours too
            let hour = getRandomInt(1, 12);
            if (is24Hour && Math.random() > 0.5) {
                hour = getRandomInt(13, 23);
            }
            
            let minute = 0;

            // Pedagojik Seviyeleme
            if (difficulty === 'Başlangıç') {
                minute = Math.random() > 0.5 ? 0 : 30;
            } else if (difficulty === 'Orta') {
                const step = [0, 15, 30, 45, 10, 20, 40, 50];
                minute = step[getRandomInt(0, step.length - 1)];
            } else {
                minute = getRandomInt(0, 59);
            }

            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            
            // Sözel okunuş (Offline basit versiyon)
            let displayHour = hour > 12 ? hour - 12 : hour;
            let verbalTime = `${displayHour} ${minute === 0 ? 'tam' : minute === 30 ? 'buçuk' : minute + ' geçiyor'}`;

            // Problem kurgusu (Offline basit versiyon)
            let problemText = variant === 'elapsed-time' 
                ? `Saat tam olarak ${timeString} olduğunda, 45 dakika sonra saat kaç olur?`
                : undefined;

            clocks.push({
                id: `clk-${p}-${i}`,
                hour,
                minute,
                timeString,
                verbalTime,
                problemText,
                options: shuffle([timeString, `${(hour+1)%24}:00`, `${hour}:15`, `${(hour-1+24)%24}:30`].map(t => t.padStart(5, '0'))),
                answer: timeString
            });
        }

        pages.push({
            title: "Zaman Atölyesi",
            instruction: variant === 'digital-to-analog' ? "Verilen saati analog kadran üzerinde akrep ve yelkovanla çizin." : "Saatin kaç olduğunu bulun ve doğru şekilde yazın.",
            pedagogicalNote: "Zaman algısı, mekansal yönelim ve sayısal sembolizasyon becerilerini geliştirir.",
            variant: variant as any,
            clocks,
            settings: {
                showNumbers: showNumbers !== undefined ? showNumbers : true,
                is24Hour: !!is24Hour,
                showTicks: showTicks !== undefined ? showTicks : true,
                showOptions: showOptions !== undefined ? showOptions : true,
                showHands: showHands !== undefined ? showHands : true,
                difficulty
            }
        });
    }
    return pages;
};

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


import { GeneratorOptions, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData } from '../../types';
import { getRandomInt, getRandomItems, COLORS, SHAPE_TYPES, shuffle, getWordsForDifficulty } from './helpers';

export const generateOfflineCodeReading = async (options: GeneratorOptions): Promise<CodeReadingData[]> => {
    const { worksheetCount, symbolType, codeLength, itemCount } = options;
    const len = codeLength || 4;
    const count = itemCount || 5;
    
    return Array.from({ length: worksheetCount }, () => {
        let symbols: string[] = [];
        let values: string[] = [];

        if (symbolType === 'shapes') {
            symbols = getRandomItems(SHAPE_TYPES, 5);
            values = getRandomItems(['A', 'E', 'K', 'L', 'M', '1', '2', '3'], 5);
        } else if (symbolType === 'colors') {
            const selectedColors = getRandomItems(COLORS, 5);
            symbols = selectedColors.map(c => c.css); 
            values = getRandomItems(['1', '2', '3', '4', '5'], 5);
        } else {
            // Arrows default
            symbols = ['arrow-up', 'arrow-down', 'arrow-left', 'arrow-right'];
            values = getRandomItems(['b', 'd', 'p', 'q'], 4);
        }

        // Create Key Map
        const keyMap = symbols.map((sym, i) => ({
            symbol: sym,
            value: values[i],
            color: symbolType === 'shapes' ? COLORS[i % COLORS.length].css : undefined
        }));

        // Generate Puzzles
        const codesToSolve = Array.from({ length: count }, () => {
            const sequenceIndices = Array.from({ length: len }, () => getRandomInt(0, symbols.length - 1));
            const sequence = sequenceIndices.map(i => symbols[i]);
            const answer = sequenceIndices.map(i => values[i]).join('');
            return { sequence, answer };
        });

        return {
            title: 'Kod Okuma ve Şifre Çözme (Hızlı Mod)',
            instruction: 'Sembollerin karşılıklarını tablodan bul ve kutulara yaz.',
            pedagogicalNote: 'Sembolik işlemleme, çalışma belleği ve dikkat geliştirme.',
            imagePrompt: 'Şifre',
            keyMap,
            codesToSolve
        };
    });
};

export const generateOfflineAttentionToQuestion = async (options: GeneratorOptions): Promise<AttentionToQuestionData[]> => {
    const { worksheetCount, subType, difficulty, gridSize, itemCount } = options;
    const type = subType || 'letter-cancellation';
    const size = gridSize || 5;

    return Array.from({ length: worksheetCount }, () => {
        // 1. Letter Cancellation (Harf Eleme - Şifre)
        if (type === 'letter-cancellation') {
            const target = getRandomItems(['A', 'K', 'S', 'M'], 1)[0]; // Cross out this char
            const passwordWord = getRandomItems(getWordsForDifficulty(difficulty), 1)[0] || 'ELMA';
            const password = passwordWord.toUpperCase().slice(0, Math.floor((size*size)/3)); // Limit password length
            
            const grid = Array.from({ length: size }, () => Array(size).fill(''));
            let passIndex = 0;
            
            for(let r=0; r<size; r++) {
                for(let c=0; c<size; c++) {
                    // Fill with password letters in sequence, otherwise distractions/targets
                    const isPasswordSlot = Math.random() > 0.6 && passIndex < password.length;
                    
                    if (isPasswordSlot) {
                        grid[r][c] = password[passIndex++];
                    } else {
                        // Fill with target mostly, some random distractions
                        grid[r][c] = target; 
                    }
                }
            }
            
            return {
                title: 'Harf Eleme ve Şifre (Hızlı Mod)',
                subType: 'letter-cancellation',
                instruction: `Kutulardaki "${target}" harflerinin üzerini çizin. Kalan harfleri sırasıyla yazarak şifreyi bulun.`,
                pedagogicalNote: 'Seçici dikkat ve görsel tarama.',
                imagePrompt: 'Harf',
                grid,
                targetChars: [target],
                password
            };
        }

        // 2. Path Finding (Yol Takibi)
        if (type === 'path-finding') {
            const grid = Array.from({ length: size }, () => Array(size).fill('star-outline'));
            // Create a random path
            let r=0, c=0;
            grid[r][c] = 'start';
            const path = [{r,c}];
            
            // Simple random walk
            for(let k=0; k<15; k++) {
                const moves = [
                    {r:r+1, c}, {r, c:c+1} // Move down or right for simplicity
                ].filter(m => m.r < size && m.c < size);
                
                if(moves.length === 0) break;
                const move = getRandomItems(moves, 1)[0];
                r = move.r; c = move.c;
                grid[r][c] = 'arrow-right'; // Simplified visual representation
                path.push({r,c});
            }
            grid[r][c] = 'end';

            return {
                title: 'Yol Takibi (Hızlı Mod)',
                subType: 'path-finding',
                instruction: 'Başlangıçtan bitişe giden yolu takip edin.',
                pedagogicalNote: 'Yönerge takibi ve uzamsal algı.',
                imagePrompt: 'Labirent',
                pathGrid: grid,
                correctPath: path
            };
        }

        // 3. Visual Logic (Pentagon/Shape Logic)
        const items = Array.from({length: itemCount || 4}).map((_, i) => {
            const isOdd = i === 2; // Make 3rd item odd for simplicity in generator
            
            // Base pattern: connections
            const baseConn = [0, 1]; // Connect vertex 0 to 1
            const oddConn = [0, 2];  // Connect vertex 0 to 2
            
            // Generate 5 dots for pentagon
            const shapes = Array.from({length: 5}).map((__, vIdx) => ({
                color: COLORS[vIdx % COLORS.length].css,
                type: 'dot',
                connectedTo: (isOdd ? oddConn : baseConn).includes(vIdx) ? [(isOdd ? oddConn : baseConn)[(isOdd ? oddConn : baseConn).indexOf(vIdx) === 0 ? 1 : 0]] : []
            }));

            return {
                id: i+1,
                isOdd,
                correctAnswer: isOdd ? 'Farklı Olan' : '',
                shapes
            };
        });

        return {
            title: 'Görsel Mantık (Hızlı Mod)',
            subType: 'visual-logic',
            instruction: 'Aşağıdaki şekillerden kuralı bozan (farklı olanı) bulun.',
            pedagogicalNote: 'Görsel ayrım ve mantıksal çıkarım.',
            imagePrompt: 'Şekil',
            logicItems: shuffle(items)
        };
    });
};

export const generateOfflineAttentionDevelopment = async (options: GeneratorOptions): Promise<AttentionDevelopmentData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const count = itemCount || 4;

    return Array.from({ length: worksheetCount }, () => {
        const puzzles = Array.from({ length: count }, () => {
            // 1. Generate Boxes
            const rangeMax = difficulty === 'Uzman' ? 99 : (difficulty === 'Zor' ? 50 : 20);
            
            // Generate distinct random numbers
            const allNumbers = new Set<number>();
            while(allNumbers.size < 8) {
                allNumbers.add(getRandomInt(1, rangeMax));
            }
            const numsArray = Array.from(allNumbers);
            const box1 = numsArray.slice(0, 4);
            const box2 = numsArray.slice(4, 8);

            // 2. Select a target Answer randomly
            const isLeft = Math.random() > 0.5;
            const targetBox = isLeft ? box1 : box2;
            const answerNum = getRandomItems(targetBox, 1)[0];
            
            // 3. Analyze Properties of the Answer
            const isEven = answerNum % 2 === 0;
            const isTwoDigit = answerNum >= 10;
            const isMaxInBox = answerNum === Math.max(...targetBox);
            const isMinInBox = answerNum === Math.min(...targetBox);
            
            // 4. Build a Complex Riddle based on Difficulty
            let riddle = "";
            const boxName = isLeft ? "sol kutudaki" : "sağ kutudaki";
            const otherBoxName = isLeft ? "sağ kutudaki" : "sol kutudaki";

            if (difficulty === 'Başlangıç') {
                // Simple logic, slightly wordy
                const prop = isEven ? "çift bir sayıdır" : "tek bir sayıdır";
                const comp = isMaxInBox ? "en büyük" : (isMinInBox ? "en küçük" : "ne en büyük ne de en küçük");
                riddle = `Aradığımız sayı ${boxName} sayıların arasındadır. Bu sayı ${prop}. Ayrıca bulunduğu kutudaki ${comp} sayıdır.`;
            } 
            else if (difficulty === 'Orta') {
                // Negations and distractors
                const notProp = isEven ? "tek sayı değildir" : "çift sayı değildir";
                const rangeHint = answerNum > 10 ? "bir desteden (10) fazladır" : "bir desteden (10) azdır";
                
                riddle = `Dikkatli bak! Aradığımız sayı ${boxName} sayılardan biridir. Bu sayı ${notProp}. Aynı zamanda ${rangeHint}.`;
            }
            else { // Zor ve Uzman
                // Complex logic, "Not the biggest", neighbor logic or math
                const parts = [`Aradığımız sayı ${boxName} gizlenmiştir.`];
                
                // Distractor part
                parts.push(`Bu sayı ${otherBoxName} hiçbir sayıya benzemez.`);
                
                // Tricky logic
                if (isMaxInBox) {
                    parts.push("Bulunduğu kutunun kralıdır, yani en büyüğüdür.");
                } else if (isMinInBox) {
                    parts.push("Bulunduğu kutunun en ufağıdır ama en değerlisidir.");
                } else {
                    parts.push("Bu sayı bulunduğu kutunun en büyüğü veya en küçüğü değildir.");
                }

                if (isTwoDigit) {
                    const digitSum = Math.floor(answerNum / 10) + (answerNum % 10);
                    parts.push(`Rakamlarını toplarsan ${digitSum} eder.`);
                } else {
                    parts.push("Tek basamaklı yalnız bir sayıdır.");
                }

                if (answerNum % 5 === 0) {
                    parts.push("Beşer beşer sayarken bu sayıyı duyarsın.");
                } else if (isEven) {
                    parts.push("İkiye tam bölünebilen çift bir sayıdır.");
                } else {
                    parts.push("İkiye bölünemeyen tek bir sayıdır.");
                }

                riddle = parts.join(' ');
            }

            // Create logical distractors for multiple choice
            const distractors = shuffle([
                ...box1.filter(n => n !== answerNum), 
                ...box2.filter(n => n !== answerNum)
            ]).slice(0, 4);
            
            const options = shuffle([answerNum.toString(), ...distractors.map(d => d.toString())]);

            return {
                riddle,
                boxes: [
                    { label: '', numbers: box1 },
                    { label: '', numbers: box2 }
                ],
                options,
                answer: answerNum.toString()
            };
        });

        return {
            title: `Dikkat Geliştirme (${difficulty})`,
            instruction: 'Aşağıdaki ipuçlarını dikkatlice okuyun, çeldiricilere aldanmayın ve doğru sayıyı bulun.',
            pedagogicalNote: 'Sözel/Mantıksal akıl yürütme, yönerge takibi ve seçici dikkat becerilerini geliştirir.',
            imagePrompt: 'Dedektif',
            puzzles
        };
    });
};

export const generateOfflineAttentionFocus = async (options: GeneratorOptions): Promise<AttentionFocusData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const count = itemCount || 4;

    // Hardcoded logic templates for Offline Mode robustness
    // These mimic the PDF style riddles
    const logicTemplates = [
        {
            category: 'fruit',
            items: ['Muz', 'Kavun', 'Biber', 'Karpuz', 'Limon', 'Çilek'],
            target: 'Limon',
            riddle: "Aradığımız yiyecek acı bir sebzenin (Biber) bulunduğu kutudadır. Bulunduğu kutudaki sarı bir meyvedir. Bu yiyecek aşağıdakilerden hangisi olabilir?"
        },
        {
            category: 'clothes',
            items: ['Şort', 'Gömlek', 'Tişört', 'Kazak', 'Etek', 'Mayo'],
            target: 'Mayo',
            riddle: "Aradığımız kıyafet denize girerken giyilen giysinin bulunduğu kutudadır. Bulunduğu kutudaki vücudumuzun üst kısmına giydiğimiz bir giyecektir."
        },
        {
            category: 'vehicles',
            items: ['Araba', 'Kamyon', 'Bisiklet', 'Tramvay', 'Helikopter', 'Gemi'],
            target: 'Tramvay',
            riddle: "Aradığımız taşıt, raylarda giden bir taşıtın bulunduğu kutudadır. Bulunduğu kutudaki havada giden taşıtlardan birisidir. (Not: Bu şablon zor, dikkatli okuyun!)"
        },
        {
            category: 'numbers_logic',
            items: ['5', '11', '3', '13', '14', '8', '10', '6'],
            target: '13',
            riddle: "Aradığımız sayı çift sayı değildir. Bulunduğu kutudaki en büyük sayıdır. Bu sayı aşağıdakilerden hangisi olabilir?"
        },
        {
            category: 'colors',
            items: ['Sarı', 'Turuncu', 'Kahverengi', 'Pembe', 'Krem', 'Lila'],
            target: 'Turuncu',
            riddle: "Aradığımız renk, cevizin renginin bulunduğu kutudadır. Bulunduğu kutudaki muzun olabileceği renklerden birisidir."
        }
    ];

    return Array.from({ length: worksheetCount }, () => {
        const puzzles = Array.from({ length: count }, () => {
            // Select a random template or generate simple number logic
            const template = getRandomItems(logicTemplates, 1)[0];
            const isLeft = Math.random() > 0.5;
            
            // Distribute items into two boxes
            const allItems = shuffle(template.items);
            const box1 = allItems.slice(0, Math.ceil(allItems.length/2));
            const box2 = allItems.slice(Math.ceil(allItems.length/2));
            
            // Place target in one box and adjust riddle directions if needed
            // For simplicity in offline mode without complex NLP, we use generic but accurate placement
            
            // Just use the predefined riddle directly if possible, or simple number logic
            if (template.category === 'numbers_logic') {
                // Generate a fresh number puzzle
                const nums = Array.from({length: 8}, () => getRandomInt(1, 50));
                const b1 = nums.slice(0, 4);
                const b2 = nums.slice(4, 8);
                const targetBox = isLeft ? b1 : b2;
                const targetNum = Math.max(...targetBox); // Let's say we look for max
                
                return {
                    riddle: `Aradığımız sayı ${isLeft ? 'sol' : 'sağ'} kutudadır. Bulunduğu kutudaki en büyük sayıdır.`,
                    boxes: [{items: b1.map(String)}, {items: b2.map(String)}],
                    options: shuffle([targetNum.toString(), ...getRandomItems(nums.filter(n=>n!==targetNum), 4).map(String)]),
                    answer: targetNum.toString()
                };
            } else {
                // Word Puzzle Fallback (Simplified for offline)
                return {
                    riddle: template.riddle,
                    boxes: [
                        { items: template.items.slice(0, 3) },
                        { items: template.items.slice(3, 6) }
                    ],
                    options: shuffle([template.target, ...getRandomItems(template.items.filter(i => i !== template.target), 4)]),
                    answer: template.target
                };
            }
        });

        return {
            title: `Dikkatini Ver (${difficulty})`,
            instruction: "İpuçlarını dikkatlice okuyun ve doğru cevabı bulun.",
            pedagogicalNote: "Okuduğunu anlama, görsel tarama ve mantıksal çıkarım.",
            imagePrompt: "Dedektif",
            puzzles
        };
    });
};

// Re-export placeholders for other offline generators if needed
export const generateOfflineReadingFlow = async (o: any): Promise<ReadingFlowData[]> => [];
export const generateOfflineLetterDiscrimination = async (o: any): Promise<LetterDiscriminationData[]> => [];
export const generateOfflineRapidNaming = async (o: any): Promise<RapidNamingData[]> => [];
export const generateOfflinePhonologicalAwareness = async (o: any): Promise<PhonologicalAwarenessData[]> => [];
export const generateOfflineMirrorLetters = async (o: any): Promise<MirrorLettersData[]> => [];
export const generateOfflineSyllableTrain = async (o: any): Promise<SyllableTrainData[]> => [];
export const generateOfflineVisualTrackingLines = async (o: any): Promise<VisualTrackingLineData[]> => [];
export const generateOfflineBackwardSpelling = async (o: any): Promise<BackwardSpellingData[]> => [];

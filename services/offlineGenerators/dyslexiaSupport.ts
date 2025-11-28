
import { GeneratorOptions, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData } from '../../types';
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
    const { worksheetCount, itemCount } = options;
    const count = itemCount || 4;

    const templates: any[] = [
        {
            type: 'max-min',
            text: (isLeft: boolean, isMax: boolean) => `Aradığımız sayı ${isLeft ? 'sol' : 'sağ'} kutudadır. Bulunduğu kutudaki en ${isMax ? 'büyük' : 'küçük'} sayıdır.`,
            logic: (box1: number[], box2: number[], isLeft: boolean, isMax: boolean) => {
                const targetBox = isLeft ? box1 : box2;
                return isMax ? Math.max(...targetBox) : Math.min(...targetBox);
            }
        },
        {
            type: 'odd-even-max',
            text: (isEven: boolean, isMax: boolean) => `Aradığımız sayı ${isEven ? 'çift' : 'tek'} sayıdır. Bulunduğu kutudaki en ${isMax ? 'büyük' : 'küçük'} ${isEven ? 'çift' : 'tek'} sayıdır.`,
            logic: (box1: number[], box2: number[], isEven: boolean, isMax: boolean) => {
                const all = [...box1, ...box2];
                const filtered = all.filter(n => isEven ? n % 2 === 0 : n % 2 !== 0);
                // Fallback if no numbers match filter
                if (filtered.length === 0) return all[0];
                return isMax ? Math.max(...filtered) : Math.min(...filtered);
            }
        },
        {
            type: 'digit-logic',
            text: (isTwoDigit: boolean) => `Aradığımız sayı ${isTwoDigit ? 'iki' : 'bir'} basamaklıdır. Bulunduğu kutudaki tek ${isTwoDigit ? 'iki' : 'bir'} basamaklı sayıdır.`,
            logic: (box1: number[], box2: number[], isTwoDigit: boolean) => {
                // This logic requires creating data that fits. 
                // We'll filter afterwards or just pick random and fix data.
                return 0; // Placeholder, handled in loop
            }
        },
        {
            type: 'range',
            text: (limit: number, isLess: boolean) => `Aradığımız sayı ${limit}'den ${isLess ? 'küçüktür' : 'büyüktür'}. Bu kurala uyan tek sayıdır.`,
            logic: (box1: number[], box2: number[], limit: number, isLess: boolean) => 0
        }
    ];

    return Array.from({ length: worksheetCount }, () => {
        const puzzles = Array.from({ length: count }, () => {
            const templateIdx = getRandomInt(0, 3); // Choose template
            let box1: number[] = [], box2: number[] = [];
            let riddle = "";
            let answer = 0;

            if (templateIdx === 0) { // Max/Min in Box
                box1 = Array.from({length: 4}, () => getRandomInt(1, 20));
                box2 = Array.from({length: 4}, () => getRandomInt(1, 20));
                const isLeft = Math.random() > 0.5;
                const isMax = Math.random() > 0.5;
                riddle = templates[0].text(isLeft, isMax);
                answer = templates[0].logic(box1, box2, isLeft, isMax);
            } 
            else if (templateIdx === 1) { // Odd/Even Max
                // Ensure at least one odd and one even exist
                box1 = [getRandomInt(1,10)*2, getRandomInt(1,10)*2+1, getRandomInt(1,20), getRandomInt(1,20)];
                box2 = [getRandomInt(1,20), getRandomInt(1,20), getRandomInt(1,20), getRandomInt(1,20)];
                const isEven = Math.random() > 0.5;
                const isMax = Math.random() > 0.5;
                riddle = templates[1].text(isEven, isMax);
                answer = templates[1].logic(box1, box2, isEven, isMax);
            }
            else { // Range or Digits (Simplified for Range)
                const target = getRandomInt(20, 40);
                const others = [target + 10, target + 20, target + 5, target + 15, target + 12];
                // Shuffle all
                const all = shuffle([target, ...others]);
                box1 = all.slice(0, 3);
                box2 = all.slice(3, 6);
                
                const limit = target + 2; // Say 22. "Less than 24". Others are > 24.
                riddle = templates[3].text(limit, true); // "Less than X"
                answer = target;
            }

            // Create logical distractors
            const options = shuffle([
                answer.toString(),
                (answer + 1).toString(),
                (answer - 1).toString(),
                box1[0].toString(),
                box2[0].toString()
            ].slice(0, 5));

            return {
                riddle,
                boxes: [
                    { label: '', numbers: box1 },
                    { label: '', numbers: box2 }
                ],
                options,
                answer: answer.toString()
            };
        });

        return {
            title: 'Dikkat Geliştirme (Hızlı Mod)',
            instruction: 'İpuçlarını okuyun ve aradığımız sayıyı bulun.',
            pedagogicalNote: 'İşitsel/Sözel dikkati sürdürme, yönerge takibi ve mantıksal eleme.',
            imagePrompt: 'Mantık',
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

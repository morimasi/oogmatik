import { GeneratorOptions, FiveWOneHData } from '../../types';
import { FIVE_W_ONE_H_LIBRARY } from './data/fiveWOneHLibrary';

const DIFFICULTY_MAP: Record<string, string> = {
  '1-2': 'çok kolay',
  'çok kolay': 'çok kolay',
  'Çok Kolay': 'çok kolay',
  '3-4': 'kolay',
  'kolay': 'kolay',
  'Kolay': 'kolay',
  '5-6': 'orta',
  'Orta': 'orta',
  'orta': 'orta',
  '7-8': 'zor',
  'Zor': 'zor',
  'zor': 'zor'
};

export const generateOfflineFiveWOneH = async (options: GeneratorOptions): Promise<FiveWOneHData[]> => {
    const { worksheetCount = 1 } = options;
    const student = options.studentContext;
    const ageGroup = student?.age ? (student.age <= 7 ? '5-7' : student.age <= 10 ? '8-10' : student.age <= 13 ? '11-13' : '14+') : null;
    const difficulty = DIFFICULTY_MAP[options.difficulty || 'orta'] || 'orta';

    // Kütüphaneden uygun hikayeleri filtrele
    let filteredPool = FIVE_W_ONE_H_LIBRARY.filter(entry => {
        const difficultyMatch = entry.difficulty === difficulty;
        const ageMatch = ageGroup ? entry.ageGroup === ageGroup : true;
        return difficultyMatch && ageMatch;
    });

    // Eğer filtre sonucu boşsa zorluk derecesine göre genişlet
    if (filteredPool.length === 0) {
        filteredPool = FIVE_W_ONE_H_LIBRARY.filter(entry => entry.difficulty === difficulty);
    }

    // Hala boşsa tüm kütüphaneyi kullan
    if (filteredPool.length === 0) {
        filteredPool = FIVE_W_ONE_H_LIBRARY;
    }

    // Mevcut havuzdan istenen sayıda rastgele seç (tekrarsız olmaya çalış)
    const results: FiveWOneHData[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < worksheetCount; i++) {
        let randomIndex;
        let attempts = 0;
        
        do {
            randomIndex = Math.floor(Math.random() * filteredPool.length);
            attempts++;
        } while (usedIndices.has(randomIndex) && usedIndices.size < filteredPool.length && attempts < 10);

        usedIndices.add(randomIndex);
        const entry = filteredPool[randomIndex];

        results.push({
            id: `5n1k_off_${entry.id}_${Date.now()}_${i}`,
            title: entry.title,
            instruction: "Metni dikkatle oku ve yanındaki soruları cevapla.",
            content: {
                title: entry.title,
                text: entry.text,
                paragraphs: entry.paragraphs
            },
            questions: entry.questions,
            settings: {
                difficulty: entry.difficulty,
                topic: entry.title,
                textLength: entry.text.length > 300 ? 'uzun' : entry.text.length > 150 ? 'orta' : 'kısa',
                syllableColoring: !!options.syllableColoring,
                fontFamily: options.fontFamily || 'Lexend',
                questionStyle: (options.questionStyle === 'only_test' || options.questionStyle === 'only_open_ended') 
                    ? options.questionStyle 
                    : 'test_and_open'
            }
        });
    }

    return results;
};

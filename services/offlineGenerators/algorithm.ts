
import { GeneratorOptions, AlgorithmData } from '../../types';

export const generateOfflineAlgorithmGenerator = async (options: GeneratorOptions): Promise<AlgorithmData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: "Algoritma Tasarımı (Hızlı Mod)",
        instruction: "Problemden çözüme giden yolu adımlarla takip et.",
        challenge: "Bir bardağa su doldurmak için gereken adımları sırala.",
        pedagogicalNote: "Problem çözme ve mantıksal sıralama becerisi.",
        steps: [
            { id: 1, type: 'start', text: 'BAŞLA' },
            { id: 2, type: 'process', text: 'Boş bir bardak al.' },
            { id: 3, type: 'process', text: 'Musluğu aç.' },
            { id: 4, type: 'decision', text: 'Bardak doldu mu?' },
            { id: 5, type: 'process', text: 'Musluğu kapat.' },
            { id: 6, type: 'end', text: 'BİTİR' }
        ]
    }));
};

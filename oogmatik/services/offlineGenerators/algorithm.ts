
import { GeneratorOptions, AlgorithmData } from '../../types';
import { getRandomItems } from './helpers';

const SCENARIOS = [
    { title: "Diş Fırçalama Algoritması", challenge: "Sabah uyandığında dişlerini fırçalamak için gereken adımları sırala." },
    { title: "Sandviç Hazırlama", challenge: "Acıktığında kendine lezzetli bir sandviç hazırlama sürecini tasarla." },
    { title: "Karşıdan Karşıya Geçiş", challenge: "Trafikte güvenli bir şekilde yolun karşısına geçme kurallarını uygula." }
];

export const generateOfflineAlgorithmGenerator = async (options: GeneratorOptions): Promise<AlgorithmData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, (_, i) => {
        const scenario = SCENARIOS[i % SCENARIOS.length];
        return {
            title: scenario.title,
            instruction: "Problemden çözüme giden yolu mantıklı adımlarla takip et ve kutucukları doldur.",
            challenge: scenario.challenge,
            pedagogicalNote: "Sıralı düşünme, neden-sonuç ilişkisi ve algoritmik muhakeme kapasitesini artırır.",
            steps: [
                { id: 1, type: 'start', text: 'BAŞLA' },
                { id: 2, type: 'process', text: 'Gerekli malzemeleri hazırla.' },
                { id: 3, type: 'input', text: 'Seçimini yap.' },
                { id: 4, type: 'decision', text: 'Her şey hazır mı?' },
                { id: 5, type: 'process', text: 'Son adımı uygula.' },
                { id: 6, type: 'end', text: 'BİTİR' }
            ]
        };
    });
};

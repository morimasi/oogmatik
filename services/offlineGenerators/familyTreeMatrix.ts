
import { GeneratorOptions, FamilyTreeMatrixData } from '../../types';

export const generateOfflineFamilyTreeMatrix = async (options: GeneratorOptions): Promise<FamilyTreeMatrixData[]> => {
    const { worksheetCount, difficulty } = options;

    return Array.from({ length: worksheetCount }, () => ({
        id: 'family_tree_' + Date.now(),
        activityType: 'FAMILY_TREE_MATRIX' as any,
        title: "Akrabalık ve Soy Ağacı Matrisi",
        instruction: "İpuçlarını okuyarak soy ağacındaki boş yerleri doldurun.",
        pedagogicalNote: "Mantıksal çıkarım ve aile bağlarını anlama.",
        content: {
            title: "Bizim Aile",
            storyIntro: "Bayram yemeği için herkes toplandı. Kimin nerede olduğunu bulalım.",
            nodes: [
                { id: "P1", role: "Dede", name: "Mehmet", gender: "M", generation: 0, isHidden: false },
                { id: "P2", role: "Baba", name: "Ali", gender: "M", generation: 1, parents: ["P1"], isHidden: true },
                { id: "P3", role: "Anne", name: "Ayşe", gender: "F", generation: 1, isHidden: false }
            ],
            clues: [
                "Mehmet, Ali'nin babasıdır.",
                "Ayşe, Ali'nin eşidir.",
                "Ali'nin babası en üstte yer alır."
            ]
        },
        settings: {
            difficulty: difficulty || 'Orta',
            familySize: 'nuclear'
        }
    } as any));
};

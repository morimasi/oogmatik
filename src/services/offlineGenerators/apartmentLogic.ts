
import { GeneratorOptions, ApartmentLogicData } from '../../types';
import { shuffle } from './helpers';

export const generateOfflineApartmentLogicPuzzle = async (options: GeneratorOptions): Promise<ApartmentLogicData[]> => {
    const { worksheetCount, difficulty } = options;

    return Array.from({ length: worksheetCount }, () => ({
        id: 'apartment_' + Date.now(),
        activityType: 'APARTMENT_LOGIC_PUZZLE' as any,
        title: "Nerede Oturuyor?",
        instruction: "İpuçlarını okuyarak binadaki kişilerin isimlerini doğru katlara yazın.",
        buildingName: "Martı Apartmanı",
        floorsCount: 3,
        residents: [
            { id: '1', name: 'Ali', floor: 1, room: 1, isTarget: true },
            { id: '2', name: 'Zeynep', floor: 2, room: 1, isTarget: true },
            { id: '3', name: 'Can', floor: 3, room: 1, isTarget: false }
        ],
        clues: [
            "Ali, Zeynep'in bir alt katında oturuyor.",
            "Can en üst katta oturuyor.",
            "En alt katta bir erkek oturuyor."
        ],
        settings: {
            difficulty: difficulty || 'Orta',
            apartmentFloors: 3,
            apartmentRoomsPerFloor: 1
        }
    } as any));
};

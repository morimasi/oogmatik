
import { GeneratorOptions, ApartmentLogicData, ApartmentResident, ApartmentLogicPuzzleItem } from '../../types';
import { shuffle } from './helpers';

const BUILDING_NAMES = [
    'Martı Apartmanı', 'Güneş Konutları', 'Lale Sütunları', 'Papatya Rezidans',
    'Yıldız Apartmanı', 'Zümrüt Palas', 'Çınar Konakları', 'Deniz Apartmanı'
];

const NAMES_MALE = ['Ali', 'Can', 'Efe', 'Burak', 'Mert', 'Kaan', 'Arda', 'Ozan', 'Emre', 'Deniz'];
const NAMES_FEMALE = ['Zeynep', 'Ayşe', 'Elif', 'Selin', 'Duru', 'Ceren', 'Mira', 'Ece', 'Sera', 'Leyla'];

const PETS = ['Kedi', 'Köpek', 'Kuş', 'Balık', 'Tavşan', 'Hamster'];
const JOBS = ['Mimar', 'Doktor', 'Öğretmen', 'Ressam', 'Mühendis', 'Aşçı', 'Kaptan', 'Müzisyen'];
const COLORS = ['Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Turuncu', 'Mor'];

export const generateOfflineApartmentLogicPuzzle = async (options: GeneratorOptions): Promise<ApartmentLogicData[]> => {
    const { worksheetCount = 1, difficulty } = options;
    const customSettings = (options as any).apartmentLogic || {};

    const floors = customSettings.apartmentFloors || (difficulty === 'Kolay' ? 2 : difficulty === 'Zor' ? 3 : 2);
    const roomsPerFloor = customSettings.apartmentRoomsPerFloor || (difficulty === 'Kolay' ? 2 : difficulty === 'Zor' ? 3 : 3);
    const varCount = customSettings.variableCount || (difficulty === 'Kolay' ? 1 : 2);
    const negativeClues = customSettings.negativeClues ?? true;
    const buildingTheme = customSettings.buildingTheme || 'modern';
    const puzzleCount = customSettings.puzzleCount || (floors * roomsPerFloor <= 4 ? 2 : 1);

    const activities: ApartmentLogicData[] = [];

    for (let w = 0; w < worksheetCount; w++) {
        const puzzles: ApartmentLogicPuzzleItem[] = [];

        for (let p = 0; p < puzzleCount; p++) {
            const totalRooms = floors * roomsPerFloor;
            const shuffledMales = shuffle([...NAMES_MALE]);
            const shuffledFemales = shuffle([...NAMES_FEMALE]);
            const namesPool = shuffle([...shuffledMales.slice(0, Math.ceil(totalRooms / 2)), ...shuffledFemales.slice(0, Math.floor(totalRooms / 2))]);

            const petsPool = shuffle([...PETS]).slice(0, totalRooms);
            const jobsPool = shuffle([...JOBS]).slice(0, totalRooms);
            const colorsPool = shuffle([...COLORS]).slice(0, totalRooms);

            const varTypes = ['İsim'];
            if (varCount >= 2) varTypes.push('Evcil Hayvan');
            if (varCount >= 3) varTypes.push('Meslek');
            if (varCount >= 4) varTypes.push('Kapı Rengi');

            const residents: ApartmentResident[] = [];
            let rIdx = 0;

            for (let f = 1; f <= floors; f++) {
                for (let r = 1; r <= roomsPerFloor; r++) {
                    const vars: Record<string, string> = {
                        'İsim': namesPool[rIdx] || `Sakin ${rIdx + 1}`
                    };
                    if (varCount >= 2) vars['Evcil Hayvan'] = petsPool[rIdx];
                    if (varCount >= 3) vars['Meslek'] = jobsPool[rIdx];
                    if (varCount >= 4) vars['Kapı Rengi'] = colorsPool[rIdx];

                    residents.push({
                        id: `R_${f}_${r}`,
                        floor: f,
                        room: r,
                        variables: vars
                    });
                    rIdx++;
                }
            }

            // Mantıksal İpuçları Üretici (Clue Generator)
            const clues: string[] = [];

            // 1. Kat bazlı kesin konum ipucu
            const r1 = residents[Math.floor(Math.random() * residents.length)];
            clues.push(`${r1.variables['İsim']}, ${r1.floor}. katta oturmaktadır.`);

            // 2. Daire bazlı ipucu
            if (roomsPerFloor > 1) {
                const r2 = residents.find(r => r.id !== r1.id) || residents[0];
                clues.push(`${r2.variables['İsim']}, ${r2.room}. numaralı dairede oturmaktadır.`);
            }

            // 3. Komşuluk veya üst/alt kat ipucu
            const topFloorResident = residents.find(r => r.floor === floors);
            if (topFloorResident && topFloorResident.id !== r1.id) {
                clues.push(`${topFloorResident.variables['İsim']} en üst katta oturmaktadır.`);
            }

            const bottomFloorResident = residents.find(r => r.floor === 1);
            if (bottomFloorResident && bottomFloorResident.id !== r1.id && bottomFloorResident.id !== topFloorResident?.id) {
                clues.push(`${bottomFloorResident.variables['İsim']} giriş katında (1. Kat) oturmaktadır.`);
            }

            // 4. Özellik bağlama ipuçları (Meslek / Hayvan / Renk)
            residents.forEach(res => {
                if (res.variables['Evcil Hayvan'] && Math.random() > 0.4 && clues.length < 7) {
                    clues.push(`${res.variables['İsim']} adlı sakinin evcil hayvanı ${res.variables['Evcil Hayvan']}'dır.`);
                }
                if (res.variables['Meslek'] && Math.random() > 0.5 && clues.length < 7) {
                    clues.push(`${res.variables['Meslek']} olan kişi ${res.floor}. katta oturmaktadır.`);
                }
                if (res.variables['Kapı Rengi'] && Math.random() > 0.5 && clues.length < 7) {
                    clues.push(`Kapısı ${res.variables['Kapı Rengi']} olan daire ${res.room}. numaralı dairedir.`);
                }
            });

            // 5. Olumsuz ipucu (Negative Clue)
            if (negativeClues && residents.length > 2) {
                const negRes = residents[Math.floor(Math.random() * residents.length)];
                const otherFloor = negRes.floor === 1 ? 2 : 1;
                clues.push(`${negRes.variables['İsim']}, ${otherFloor}. katta OTURMAMAKTADIR.`);
            }

            puzzles.push({
                id: `puzzle_${p + 1}`,
                buildingName: BUILDING_NAMES[(w * puzzleCount + p) % BUILDING_NAMES.length],
                buildingTheme,
                floorsCount: floors,
                roomsPerFloor,
                variableTypes: varTypes,
                residents,
                clues: shuffle(clues)
            });
        }

        const firstPuzzle = puzzles[0];

        activities.push({
            id: 'apartment_' + Date.now() + '_' + w,
            activityType: 'APARTMENT_LOGIC_PUZZLE' as any,
            title: `Nerede Oturuyor? (${floors} Kat - ${floors * roomsPerFloor} Daire)`,
            instruction: "İpuçlarını okuyarak binada oturan kişilerin isimlerini ve özelliklerini doğru dairelere yerleştirin.",
            content: {
                title: firstPuzzle.buildingName,
                variableTypes: firstPuzzle.variableTypes,
                residents: firstPuzzle.residents,
                clues: firstPuzzle.clues
            },
            puzzles,
            settings: {
                difficulty: (difficulty as any) || 'orta',
                apartmentFloors: floors,
                apartmentRoomsPerFloor: roomsPerFloor,
                variableCount: varCount,
                negativeClues,
                buildingTheme,
                puzzleCount
            }
        } as any);
    }

    return activities;
};

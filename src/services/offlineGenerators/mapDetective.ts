
import { GeneratorOptions, MapInstructionData } from '../../types';
import { getRandomInt, getRandomItems } from './helpers';
import { CALIBRATED_CITIES } from '../generators/geoData';

/**
 * TÜRKİYE İDARİ HARİTA KOORDİNAT SİSTEMİ 
 * Artık ../generators/geoData.ts adresinden merkezi olarak yönetiliyor.
 */

// ============================================================
// YÖNERGE ÜRETIM MOTORU — 5 KADEMELİ ZORLUK
// ============================================================

type InstructionType = 'spatial_logic' | 'linguistic_geo' | 'attribute_search' | 'neighbor_path' | 'route_planning';

const DIFFICULTY_MAP: Record<string, number> = {
    'Başlangıç': 1, 'Orta': 2, 'Zor': 3, 'Uzman': 4, 'Klinik': 5
};

export const generateOfflineMapInstruction = async (options: GeneratorOptions): Promise<MapInstructionData[]> => {
    const { worksheetCount, difficulty, itemCount, mapInstructionTypes, showCityNames, markerStyle, emphasizedRegion, customInput } = options;
    const results: MapInstructionData[] = [];
    const level = DIFFICULTY_MAP[difficulty || 'Orta'] || 2;

    // 1. Odak Bölgeye Göre Şehir Havuzunu Filtrele
    const isRegionFocused = emphasizedRegion && emphasizedRegion !== 'all';
    const cityPool = isRegionFocused
        ? CALIBRATED_CITIES.filter(c => c.region === emphasizedRegion)
        : CALIBRATED_CITIES;

    const safeCityPool = cityPool.length > 0 ? cityPool : CALIBRATED_CITIES;

    // 2. Aktif Yönerge Tiplerini Belirle
    const activeTypes: InstructionType[] = (mapInstructionTypes && mapInstructionTypes.length > 0)
        ? mapInstructionTypes as InstructionType[]
        : ['spatial_logic', 'linguistic_geo', 'attribute_search', 'neighbor_path', 'route_planning'];

    // 3. Yönerge Üretici
    const generateInstruction = (): string => {
        const type = getRandomItems(activeTypes, 1)[0];
        const randomCity = safeCityPool[getRandomInt(0, safeCityPool.length - 1)];

        if (type === 'spatial_logic') {
            const directions = ['KUZEYİNDEKİ', 'GÜNEYİNDEKİ', 'DOĞUSUNDAKİ', 'BATISINDAKİ'];
            const dir = directions[getRandomInt(0, 3)];
            if (level >= 4) {
                return `${randomCity.name} ilinin ${dir} komşu ili bul, bu ilin ismindeki tüm ünlü harfleri say ve haritanın altına not et. Sonra bu ilden güneye doğru bir ok çiz.`;
            }
            if (level >= 3) {
                return `${randomCity.name} ilinin ${dir} komşu ili bul, ismini yaz ve hangi bölgede olduğunu belirt.`;
            }
            if (level >= 2) {
                return `${randomCity.name} ilinin hemen ${dir} komşu ili bul ve üzerine bir YILDIZ çiz.`;
            }
            return `Haritada ${randomCity.name} ilini BUL ve üzerine bir DAİRE çiz.`;
        }

        if (type === 'linguistic_geo') {
            const chars = ['A', 'B', 'M', 'S', 'T', 'İ', 'K', 'E', 'D'];
            const char = chars[getRandomInt(0, chars.length - 1)];
            const colors = ['MAVİYE', 'KIRMIZIYA', 'SARIYA', 'YEŞİLE', 'TURUNCUYA'];
            const color = colors[getRandomInt(0, colors.length - 1)];

            if (level >= 4) {
                return `İsminde "${char}" harfi ile başlayan ve ${randomCity.region} bölgesinde yer alan tüm illeri bulup ${color} boya. Kaç tane olduğunu haritanın altına yaz.`;
            }
            if (level >= 3) {
                return `İsminde "${char}" harfi ile başlayan ve ${randomCity.region} bölgesinde yer alan bir ili bul ve ${color} boya. Eğer birden fazla varsa en büyüğünü seç.`;
            }
            if (level >= 2) {
                return `İsminde "${char}" harfi geçen ve ${randomCity.region} bölgesinde olan bir ili bul ve ${color} boya.`;
            }
            return `İsminde "${char}" harfi geçen bir ili haritada bul ve göster.`;
        }

        if (type === 'attribute_search') {
            const isCoastal = Math.random() > 0.5;
            if (level >= 4) {
                return `${randomCity.region} bölgesinde yer alan, denize kıyısı ${isCoastal ? 'OLAN' : 'OLMAYAN'} ve isminde çift sayıda hece bulunan bir şehri bul. Adını ve hece sayısını yaz.`;
            }
            if (level >= 3) {
                return `${randomCity.region} bölgesinde yer alan ve denize kıyısı ${isCoastal ? 'OLAN' : 'OLMAYAN'} bir ili bul ve daire içine al.`;
            }
            if (level >= 2) {
                return `${randomCity.region} bölgesinde denize kıyısı ${isCoastal ? 'olan' : 'olmayan'} bir il göster.`;
            }
            return `Denize kıyısı olan bir ili haritada bul ve göster.`;
        }

        if (type === 'neighbor_path') {
            const potentialDest = CALIBRATED_CITIES.filter(c => c.id !== randomCity.id);
            const dest = potentialDest[getRandomInt(0, potentialDest.length - 1)];

            if (level >= 4) {
                const n1 = randomCity.neighbors?.[0] || 'komşu il';
                return `${randomCity.name} → ${n1} → ? → ${dest.name} rotasındaki eksik ili bul ve haritaya yaz. Bu rotanın kaç şehirden geçtiğini hesapla.`;
            }
            if (level >= 3) {
                return `${randomCity.name} ilinden ${dest.name} iline giderken geçmen gereken komşu illerden birini bul ve isminin üzerini çiz.`;
            }
            if (level >= 2) {
                return `${randomCity.name} ilinden ${dest.name} iline doğru giderken geçtiğin bir şehri bul ve göster.`;
            }
            return `${randomCity.name} ilinin komşu illerinden birini bul ve göster.`;
        }

        if (type === 'route_planning') {
            const dest = CALIBRATED_CITIES.filter(c => c.region !== randomCity.region)[getRandomInt(0, 10)];
            if (level >= 4) {
                return `${randomCity.name} ilinden ${dest?.name || 'Ankara'} iline en kısa rotayı çiz. Geçtiğin illerin sayısını ve hangi bölgelerden geçtiğini yaz.`;
            }
            if (level >= 3) {
                return `${randomCity.name} ilinden ${dest?.name || 'İstanbul'} iline giden bir rota çiz. En az 3 şehirden geçmelisin.`;
            }
            return `${randomCity.name} ilinden başlayarak 3 komşu ili ziyaret eden bir yol çiz.`;
        }

        return `Haritadaki en büyük şehri bul ve üzerine bir çarpı (X) koy.`;
    };

    // 4. Sayfalar
    for (let p = 0; p < worksheetCount; p++) {
        const instructions: string[] = [];
        const count = itemCount || (level <= 1 ? 5 : level <= 2 ? 8 : level <= 3 ? 10 : 12);

        for (let i = 0; i < count; i++) {
            instructions.push(generateInstruction());
        }

        const regionLabel = emphasizedRegion === 'all' || !emphasizedRegion ? 'Türkiye' : emphasizedRegion + ' Bölgesi';
        const diffLabel = difficulty || 'Orta';

        results.push({
            title: `Harita Dedektifi: ${regionLabel} Analizi`,
            instruction: `${diffLabel} Seviyesi — Haritadaki illeri ve bölgeleri inceleyerek yönergeleri hatasız uygula.`,
            imageBase64: customInput,
            emphasizedRegion: emphasizedRegion || 'all',
            difficultyLevel: level as 1 | 2 | 3 | 4 | 5,
            cities: isRegionFocused ? safeCityPool.map(c => ({ ...c })) : CALIBRATED_CITIES.map(c => ({ ...c })),
            instructions,
            settings: {
                showCityNames: showCityNames !== undefined ? showCityNames : true,
                markerStyle: (markerStyle as any) || 'circle',
                difficulty: diffLabel
            }
        });
    }

    return results;
};

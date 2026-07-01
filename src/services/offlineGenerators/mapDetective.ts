
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

const MAP_TYPE_LABELS: Record<string, string> = {
    turkey: 'Türkiye Haritası',
    world: 'Dünya Haritası',
    treasure: 'Hazine Haritası'
};

function generateFallbackCoords(count: number) {
    const coords = [];
    for (let i = 0; i < count; i++) {
        coords.push({
            id: `loc_${i}`,
            name: `Konum ${i + 1}`,
            x: 100 + Math.random() * 800,
            y: 50 + Math.random() * 400,
            region: 'Genel'
        });
    }
    return coords;
}

export const generateOfflineMapInstruction = async (options: GeneratorOptions): Promise<MapInstructionData[]> => {
    const { worksheetCount, difficulty, itemCount, mapInstructionTypes, showCityNames, markerStyle, emphasizedRegion, customInput } = options;
    const mapType = options.mapType || 'turkey';
    const results: MapInstructionData[] = [];
    const level = DIFFICULTY_MAP[difficulty || 'Orta'] || 2;

    // 1. Harita tipine göre içerik havuzu
    const isRegionFocused = emphasizedRegion && emphasizedRegion !== 'all';
    const cityPool = mapType === 'turkey'
        ? (isRegionFocused ? CALIBRATED_CITIES.filter(c => c.region === emphasizedRegion) : CALIBRATED_CITIES)
        : [];
    const safeCityPool = cityPool.length > 0 ? cityPool : CALIBRATED_CITIES;

    // 2. Aktif Yönerge Tiplerini Belirle
    const activeTypes: InstructionType[] = (mapInstructionTypes && mapInstructionTypes.length > 0)
        ? mapInstructionTypes as InstructionType[]
        : ['spatial_logic', 'linguistic_geo', 'attribute_search', 'neighbor_path', 'route_planning'];

    // 3. Yönerge Üretici
    const generateInstruction = (): string => {
        const type = getRandomItems(activeTypes, 1)[0];
        const locationLabel = mapType === 'world' ? 'ülke' : mapType === 'treasure' ? 'nokta' : 'il';
        const randomCity = safeCityPool[getRandomInt(0, safeCityPool.length - 1)];
        const regionLabel = mapType === 'world' ? 'kıta' : mapType === 'treasure' ? 'bölge' : 'bölge';

        if (mapType !== 'turkey') {
            const worldLocations = [
                'Kuzey Kutbu', 'Amazon Ormanları', 'Sahra Çölü', 'Himalayalar',
                'Büyük Mercan Resifi', 'İskandinavya', 'Antarktika', 'Pasifik Okyanusu',
                'And Dağları', 'Nil Nehri', 'Grönland', 'Madagaskar'
            ];
            const treasureLocations = [
                'Yılan Koyu', 'Kafatası Mağarası', 'Üç Tepeler', 'Gümüş Nehir',
                'Yanardağ Geçidi', 'Fener Burnu', 'Batık Gemi Koyu', 'Yaslı Orman',
                'Kum Fırtınası Vahası', 'Mercan Adası', 'Kara Uçurum', 'Define Mağarası'
            ];

            const pool = mapType === 'treasure'
                ? treasureLocations
                : worldLocations;
            const loc = pool[getRandomInt(0, pool.length - 1)];
            const loc2 = pool[getRandomInt(0, pool.length - 1)];

            if (type === 'spatial_logic') {
                const dirs = ['KUZEYİNDEKİ', 'GÜNEYİNDEKİ', 'DOĞUSUNDAKİ', 'BATISINDAKİ'];
                return `${loc} noktasının hemen ${dirs[getRandomInt(0, 3)]} ${locationLabel} bul ve işaretle.`;
            }
            if (type === 'linguistic_geo') {
                const chars = ['A', 'B', 'M', 'S', 'T', 'K', 'E', 'D'];
                return `İsminde "${chars[getRandomInt(0, chars.length - 1)]}" harfi geçen bir ${locationLabel} bul ve daire içine al.`;
            }
            if (type === 'route_planning') {
                return `${loc} noktasından ${loc2} noktasına en kısa rotayı çiz.`;
            }
            return `${loc} noktasını haritada bul ve üzerine bir ${['YILDIZ', 'DAİRE', 'ÇARPİ', 'OK'][getRandomInt(0, 3)]} çiz.`;
        }

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
    for (let p = 0; p < (worksheetCount || 0); p++) {
        const instructions: string[] = [];
        const count = itemCount || (level <= 1 ? 5 : level <= 2 ? 8 : level <= 3 ? 10 : 12);

        for (let i = 0; i < count; i++) {
            instructions.push(generateInstruction());
        }

        const regionLabel = mapType === 'turkey'
            ? (emphasizedRegion === 'all' || !emphasizedRegion ? 'Türkiye' : emphasizedRegion + ' Bölgesi')
            : mapType === 'world' ? 'Dünya' : 'Hazine Adası';
        const diffLabel = difficulty || 'Orta';
        const titleLabel = MAP_TYPE_LABELS[mapType] || 'Türkiye';
        const instructionBase = mapType === 'world'
            ? 'Haritadaki ülkeleri ve kıtaları inceleyerek yönergeleri hatasız uygula.'
            : mapType === 'treasure'
                ? 'Hazine adasındaki noktaları ve gizemli yerleri keşfederek yönergeleri uygula.'
                : `${diffLabel} Seviyesi — Haritadaki illeri ve bölgeleri inceleyerek yönergeleri hatasız uygula.`;

        results.push({
            title: `Harita Dedektifi: ${titleLabel}`,
            instruction: instructionBase,
            imageBase64: customInput,
            emphasizedRegion: mapType === 'turkey' ? (emphasizedRegion || 'all') : mapType,
            difficultyLevel: level as 1 | 2 | 3 | 4 | 5,
            cities: mapType === 'turkey'
                ? (isRegionFocused ? safeCityPool.map(c => ({ ...c })) : CALIBRATED_CITIES.map(c => ({ ...c })))
                : generateFallbackCoords(15),
            instructions,
            settings: {
                showCityNames: showCityNames !== undefined ? showCityNames : true,
                markerStyle: (markerStyle as any) || 'circle',
                difficulty: diffLabel,
                mapType
            }
        });
    }

    return results;
};

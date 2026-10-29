import { GeneratorOptions, MapInstructionData } from '../../types';
import { getRandomInt, getRandomItems } from './helpers';
import { CALIBRATED_CITIES, getCleanCityPool } from '../generators/geoData';

type InstructionType = 'spatial_logic' | 'linguistic_geo' | 'attribute_search' | 'neighbor_path' | 'route_planning';

const DIFFICULTY_MAP: Record<string, 1 | 2 | 3 | 4 | 5> = {
    'Başlangıç': 1,
    'Orta': 2,
    'Zor': 3,
    'Uzman': 4,
    'Klinik': 5
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
    const {
        worksheetCount,
        difficulty,
        itemCount,
        mapInstructionTypes,
        showCityNames,
        markerStyle,
        emphasizedRegion,
        customInput,
        includeCompass,
        useGridSystem
    } = options;

    const mapType = (options.mapType as 'turkey' | 'world' | 'treasure') || 'turkey';
    const level: 1 | 2 | 3 | 4 | 5 = DIFFICULTY_MAP[difficulty || 'Orta'] || 2;
    const isGridActive = !!useGridSystem;

    // 1. Harita tipine göre şehir havuzu
    const isRegionFocused = emphasizedRegion && emphasizedRegion !== 'all';
    const regionalPool = mapType === 'turkey'
        ? (isRegionFocused ? CALIBRATED_CITIES.filter(c => c.region === emphasizedRegion) : CALIBRATED_CITIES)
        : [];
    const safeCityPool = regionalPool.length > 0 ? regionalPool : CALIBRATED_CITIES;

    // 2. Aktif Yönerge Tiplerini Belirle
    const activeTypes: InstructionType[] = (mapInstructionTypes && mapInstructionTypes.length > 0)
        ? mapInstructionTypes as InstructionType[]
        : ['spatial_logic', 'linguistic_geo', 'attribute_search', 'neighbor_path', 'route_planning'];

    // 3. Yönerge Üretici Fonksiyon
    const generateInstruction = (): string => {
        const type = getRandomItems(activeTypes, 1)[0];
        const locationLabel = mapType === 'world' ? 'ülke' : mapType === 'treasure' ? 'nokta' : 'il';
        const randomCity = safeCityPool[getRandomInt(0, safeCityPool.length - 1)];

        // Grid referansı (Izgara açık ise opsiyonel olarak yönlendir)
        const gridCol = String.fromCharCode(65 + Math.floor(randomCity.x / 100)); // A-J
        const gridRow = Math.min(5, Math.max(1, Math.floor(randomCity.y / 100) + 1)); // 1-5
        const gridPrefix = isGridActive && Math.random() > 0.6 ? `[${gridCol}-${gridRow} koordinatında] ` : '';

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

            const pool = mapType === 'treasure' ? treasureLocations : worldLocations;
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
            return `${loc} noktasını haritada bul ve üzerine bir ${['YILDIZ', 'DAİRE', 'ÇARPI', 'OK'][getRandomInt(0, 3)]} çiz.`;
        }

        // Türkiye Haritası Yönergeleri
        if (type === 'spatial_logic') {
            const directions = ['KUZEYİNDEKİ', 'GÜNEYİNDEKİ', 'DOĞUSUNDAKİ', 'BATISINDAKİ'];
            const dir = directions[getRandomInt(0, 3)];
            if (level >= 4) {
                return `${gridPrefix}${randomCity.name} ilinin ${dir} komşu ili bul, bu ilin ismindeki tüm ünlü harfleri say ve haritanın altına not et.`;
            }
            if (level >= 3) {
                return `${gridPrefix}${randomCity.name} ilinin ${dir} komşu ili bul, adını yaz ve hangi bölgede olduğunu belirt.`;
            }
            if (level >= 2) {
                return `${gridPrefix}${randomCity.name} ilinin hemen ${dir} komşu ili bul ve üzerine bir YILDIZ çiz.`;
            }
            return `${gridPrefix}Haritada ${randomCity.name} ilini BUL ve üzerine bir DAİRE çiz.`;
        }

        if (type === 'linguistic_geo') {
            const chars = ['A', 'B', 'M', 'S', 'T', 'İ', 'K', 'E', 'D'];
            const char = chars[getRandomInt(0, chars.length - 1)];
            const colors = ['MAVİYE', 'KIRMIZIYA', 'SARIYA', 'YEŞİLE', 'TURUNCUYA'];
            const color = colors[getRandomInt(0, colors.length - 1)];

            if (level >= 4) {
                return `İsminde "${char}" harfi ile başlayan ve ${randomCity.region} bölgesinde yer alan tüm illeri bulup ${color} boya.`;
            }
            if (level >= 3) {
                return `İsminde "${char}" harfi ile başlayan ve ${randomCity.region} bölgesinde yer alan bir ili bul ve ${color} boya.`;
            }
            if (level >= 2) {
                return `İsminde "${char}" harfi geçen ve ${randomCity.region} bölgesinde olan bir ili bul ve göster.`;
            }
            return `İsminde "${char}" harfi geçen bir ili haritada bul ve daire içine al.`;
        }

        if (type === 'attribute_search') {
            const isCoastal = Math.random() > 0.5;
            if (level >= 4) {
                return `${randomCity.region} bölgesinde yer alan, denize kıyısı ${isCoastal ? 'OLAN' : 'OLMAYAN'} bir şehri bul, hece sayısını hesapla.`;
            }
            if (level >= 3) {
                return `${randomCity.region} bölgesinde yer alan ve denize kıyısı ${isCoastal ? 'OLAN' : 'OLMAYAN'} bir ili bul ve işaretle.`;
            }
            if (level >= 2) {
                return `${randomCity.region} bölgesinde denize kıyısı ${isCoastal ? 'olan' : 'olmayan'} bir il göster.`;
            }
            return `Denize kıyısı olan bir ili haritada bul ve adını söyle.`;
        }

        if (type === 'neighbor_path') {
            const potentialDest = CALIBRATED_CITIES.filter(c => c.id !== randomCity.id);
            const dest = potentialDest[getRandomInt(0, potentialDest.length - 1)];

            if (level >= 4) {
                const n1 = randomCity.neighbors?.[0] || 'komşu il';
                return `${randomCity.name} → ${n1} → ? → ${dest.name} rotasındaki eksik ili haritadan bul ve yaz.`;
            }
            if (level >= 3) {
                return `${randomCity.name} ilinden ${dest.name} iline giderken geçmen gereken komşu illerden birini bul.`;
            }
            if (level >= 2) {
                return `${randomCity.name} ilinin komşu illerinden birini bul ve üzerine işaret koy.`;
            }
            return `${randomCity.name} ilinin en yakın komşu ilini göster.`;
        }

        if (type === 'route_planning') {
            const dest = CALIBRATED_CITIES.filter(c => c.region !== randomCity.region)[getRandomInt(0, 10)] || { name: 'Ankara' };
            if (level >= 4) {
                return `${randomCity.name} ilinden ${dest.name} iline en kısa rotayı çiz. Geçtiğin illerin sayısını not et.`;
            }
            if (level >= 3) {
                return `${randomCity.name} ilinden ${dest.name} iline giden bir rota çiz. En az 3 şehirden geçmelisin.`;
            }
            return `${randomCity.name} ilinden başlayarak 2 komşu ili birbirine bağlayan bir çizgi çiz.`;
        }

        return `Haritadaki ${randomCity.name} ilini bul ve üzerine bir çarpı (X) koy.`;
    };

    // 4. Sayfa Döngüsü (En az 1 sayfa üretilir)
    const pages = Math.max(1, worksheetCount || 1);
    const count = (itemCount && itemCount > 0) ? itemCount : (level <= 1 ? 6 : level <= 2 ? 8 : 10);
    const diffLabel = difficulty || 'Orta';
    const titleLabel = MAP_TYPE_LABELS[mapType] || 'Türkiye Haritası';
    const results: MapInstructionData[] = [];

    for (let p = 0; p < pages; p++) {
        const instructions: string[] = [];
        for (let i = 0; i < count; i++) {
            instructions.push(generateInstruction());
        }

        const instructionBase = mapType === 'world'
            ? 'Haritadaki ülkeleri ve kıtaları inceleyerek yönergeleri hatasız uygula.'
            : mapType === 'treasure'
                ? 'Hazine adasındaki noktaları keşfederek yönergeleri sırayla takip et.'
                : `${diffLabel} Seviyesi — Haritadaki illeri ve bölgeleri inceleyerek yönergeleri hatasız uygula.`;

        // Şehir havuzu: Görsel karmaşayı azaltmak için yönergelerdeki iller + nirengi noktaları
        const finalCities = mapType === 'turkey'
            ? getCleanCityPool(emphasizedRegion, instructions)
            : generateFallbackCoords(15);

        results.push({
            title: `Harita Dedektifi: ${titleLabel}`,
            instruction: instructionBase,
            imageBase64: customInput,
            emphasizedRegion: mapType === 'turkey' ? (emphasizedRegion || 'all') : mapType,
            difficultyLevel: level,
            cities: finalCities,
            instructions,
            pedagogicalNote: 'Öğrencinin uzamsal yön algısı, zihinsel rotalama ve komşuluk ilişkilerini görsel ipuçlarıyla keşfetmesini sağlar.',
            settings: {
                showCityNames: showCityNames !== false,
                markerStyle: (markerStyle as 'circle' | 'star' | 'target' | 'dot' | 'none') || 'circle',
                difficulty: diffLabel,
                mapType,
                includeCompass: includeCompass !== false,
                useGridSystem: isGridActive
            },
            gridConfig: isGridActive ? { rows: 5, cols: 10 } : undefined
        });
    }

    return results;
};

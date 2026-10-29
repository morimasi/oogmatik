import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions, MapInstructionData } from '../../types';
import { MAP_DETECTIVE_PROMPT, PEDAGOGICAL_BASE, getStudentContextPrompt } from './prompts';
import { CALIBRATED_CITIES, getCleanCityPool } from './geoData';

const MAP_TYPE_LABELS: Record<string, string> = {
    turkey: 'Türkiye Haritası',
    world: 'Dünya Haritası',
    treasure: 'Hazine Haritası'
};

const MAP_TYPE_DESCRIPTIONS: Record<string, string> = {
    turkey: "Türkiye'nin şehirlerini, bölgelerini ve coğrafi özelliklerini kullan. Sorular şehir adları, bölgeler, komşuluk ilişkileri ve yön bulma içersin.",
    world: 'Dünya üzerindeki ülkeleri, kıtaları ve okyanusları kullan. Sorular ülke adları, kıtalar, yönler ve coğrafi keşif içersin. Şehir adları yerine ülke adları kullan.',
    treasure: 'Hayali bir hazine adasında geçen bir etkinlik. Koylar, mağaralar, tepeler, nehirler, batık gemiler gibi hayali yer adları kullan. Sorular hazine avı, yön bulma ve harita okuma içersin.'
};

const WORLD_COUNTRIES = [
    { name: 'Brezilya', region: 'Güney Amerika', neighbors: ['Arjantin', 'Kolombiya', 'Peru', 'Venezuela'] },
    { name: 'Kanada', region: 'Kuzey Amerika', neighbors: ['ABD'] },
    { name: 'ABD', region: 'Kuzey Amerika', neighbors: ['Kanada', 'Meksika'] },
    { name: 'Meksika', region: 'Kuzey Amerika', neighbors: ['ABD', 'Guatemala'] },
    { name: 'Arjantin', region: 'Güney Amerika', neighbors: ['Brezilya', 'Şili', 'Uruguay'] },
    { name: 'Fransa', region: 'Avrupa', neighbors: ['Almanya', 'İspanya', 'İtalya', 'Belçika'] },
    { name: 'Almanya', region: 'Avrupa', neighbors: ['Fransa', 'Polonya', 'Avusturya', 'Çekya'] },
    { name: 'İtalya', region: 'Avrupa', neighbors: ['Fransa', 'Avusturya', 'İsviçre'] },
    { name: 'İspanya', region: 'Avrupa', neighbors: ['Fransa', 'Portekiz'] },
    { name: 'Mısır', region: 'Afrika', neighbors: ['Sudan', 'Libya', 'İsrail'] },
    { name: 'Güney Afrika', region: 'Afrika', neighbors: ['Namibya', 'Botsvana', 'Mozambik'] },
    { name: 'Çin', region: 'Asya', neighbors: ['Hindistan', 'Rusya', 'Vietnam'] },
    { name: 'Hindistan', region: 'Asya', neighbors: ['Çin', 'Pakistan', 'Nepal'] },
    { name: 'Japonya', region: 'Asya', neighbors: [] },
    { name: 'Avustralya', region: 'Okyanusya', neighbors: [] },
    { name: 'Rusya', region: 'Asya/Avrupa', neighbors: ['Çin', 'Kazakistan', 'Ukrayna'] },
    { name: 'Türkiye', region: 'Asya/Avrupa', neighbors: ['Yunanistan', 'Suriye', 'İran', 'Irak'] },
    { name: 'İngiltere', region: 'Avrupa', neighbors: ['Fransa'] },
    { name: 'Norveç', region: 'Avrupa', neighbors: ['İsveç', 'Finlandiya'] },
    { name: 'Endonezya', region: 'Asya', neighbors: ['Malezya', 'Papua Yeni Gine'] },
];

const TREASURE_LOCATIONS = [
    { name: 'Yılan Koyu', region: 'Güney Sahili', neighbors: ['Kafatası Mağarası', 'Üç Tepeler'] },
    { name: 'Kafatası Mağarası', region: 'Güney Sahili', neighbors: ['Yılan Koyu', 'Yaslı Orman'] },
    { name: 'Üç Tepeler', region: 'Merkez', neighbors: ['Yılan Koyu', 'Gümüş Nehir', 'Kum Fırtınası Vahası'] },
    { name: 'Gümüş Nehir', region: 'Merkez', neighbors: ['Üç Tepeler', 'Yeşil Vadi', 'Yanardağ Geçidi'] },
    { name: 'Yanardağ Geçidi', region: 'Kuzey', neighbors: ['Gümüş Nehir', 'Fener Burnu', 'Kara Uçurum'] },
    { name: 'Fener Burnu', region: 'Kuzey', neighbors: ['Yanardağ Geçidi', 'Batık Gemi Koyu'] },
    { name: 'Batık Gemi Koyu', region: 'Kuzey', neighbors: ['Fener Burnu', 'Mercan Adası'] },
    { name: 'Yaslı Orman', region: 'Merkez', neighbors: ['Kafatası Mağarası', 'Define Mağarası', 'Kara Uçurum'] },
    { name: 'Kum Fırtınası Vahası', region: 'Güney Sahili', neighbors: ['Üç Tepeler', 'Define Mağarası'] },
    { name: 'Mercan Adası', region: 'Doğu', neighbors: ['Batık Gemi Koyu', 'Define Mağarası'] },
    { name: 'Kara Uçurum', region: 'Kuzey', neighbors: ['Yanardağ Geçidi', 'Yaslı Orman', 'Define Mağarası'] },
    { name: 'Define Mağarası', region: 'Merkez', neighbors: ['Yaslı Orman', 'Kum Fırtınası Vahası', 'Mercan Adası', 'Kara Uçurum'] },
    { name: 'Yeşil Vadi', region: 'Merkez', neighbors: ['Gümüş Nehir', 'Üç Tepeler'] },
];

const DIFFICULTY_MAP: Record<string, 1 | 2 | 3 | 4 | 5> = {
    'Başlangıç': 1,
    'Orta': 2,
    'Zor': 3,
    'Uzman': 4,
    'Klinik': 5
};

const TYPE_DESCRIPTIONS: Record<string, string> = {
    spatial_logic: "Uzamsal Mantık: Yön (kuzey, güney, doğu, batı) ve komşuluk konumlandırma talimatları ('X ilinin kuzeyindeki komşuyu bul')",
    linguistic_geo: "Dilsel Coğrafya: Şehir/lokasyon adındaki harf, hece veya ses özellikleri ile coğrafi eşleştirme ('İsminde A harfi geçen bir il bul')",
    attribute_search: "Özellik Arama: Kıyı durumu (denize kıyısı olan/olmayan) veya belirli bir coğrafi nitelik arama",
    neighbor_path: "Komşu Yolu: İl → il komşuluk zinciri ve rotadaki eksik halkayı bulma ('X -> Y -> ? rotasını tamamla')",
    route_planning: "Rota Planı: İki nokta arasında belirli kurallarla (en az 3 şehirden geçen) rota planlama"
};

const getCityDataForMapType = (mapType: string | undefined, emphasizedRegion: string | undefined) => {
    if (!mapType || mapType === 'turkey') {
        const relevantCities = emphasizedRegion && emphasizedRegion !== 'all'
            ? CALIBRATED_CITIES.filter(c => c.region === emphasizedRegion)
            : CALIBRATED_CITIES;
        return relevantCities.slice(0, 45).map(c =>
            `${c.name} (${c.region}) - Komşular: ${c.neighbors?.join(', ')}`
        ).join('\n');
    }
    if (mapType === 'world') {
        return WORLD_COUNTRIES.map(c =>
            `${c.name} (${c.region}) - Komşular: ${c.neighbors.join(', ') || 'yok'}`
        ).join('\n');
    }
    if (mapType === 'treasure') {
        return TREASURE_LOCATIONS.map(l =>
            `${l.name} (${l.region}) - Yakınındakiler: ${l.neighbors.join(', ')}`
        ).join('\n');
    }
    return '';
};

export const generateMapInstructionFromAI = async (options: GeneratorOptions): Promise<MapInstructionData[]> => {
    const difficulty = options.difficulty || 'Orta';
    const level: 1 | 2 | 3 | 4 | 5 = DIFFICULTY_MAP[difficulty] || 2;
    const emphasizedRegion = options.emphasizedRegion || 'all';
    const mapType = (options.mapType as 'turkey' | 'world' | 'treasure') || 'turkey';
    const customInput = options.customInput;
    const showCityNames = options.showCityNames !== false;
    const markerStyle = (options.markerStyle as 'circle' | 'star' | 'target' | 'dot' | 'none') || 'circle';
    const includeCompass = options.includeCompass !== false;
    const useGridSystem = !!options.useGridSystem;
    const targetItemCount = (options.itemCount && options.itemCount > 0) ? options.itemCount : 8;
    const student = options.studentContext;

    const mapInstructionTypes = (options.mapInstructionTypes && options.mapInstructionTypes.length > 0)
        ? options.mapInstructionTypes
        : ['spatial_logic', 'linguistic_geo', 'attribute_search', 'neighbor_path', 'route_planning'];

    const mapTypeLabel = MAP_TYPE_LABELS[mapType] || 'Türkiye Haritası';
    const mapTypeDesc = MAP_TYPE_DESCRIPTIONS[mapType] || MAP_TYPE_DESCRIPTIONS['turkey'];
    const geoContext = getCityDataForMapType(mapType, emphasizedRegion);

    const regionInstruction = (mapType === 'turkey' && emphasizedRegion !== 'all')
        ? `[ÖZEL BÖLGESEL ODAK - ÇOK ÖNEMLİ]:\nKullanıcı SADECE "${emphasizedRegion}" bölgesini seçti. Üretilecek ${targetItemCount} yönergenin TAMAMI ${emphasizedRegion} bölgesindeki iller, bu illerin komşulukları ve coğrafi özellikleri üzerine olmalıdır.`
        : (mapType === 'turkey')
            ? `[TÜRKİYE GENELİ]: Yönergeler Türkiye'nin 7 coğrafi bölgesine (Marmara, Ege, Akdeniz, İç Anadolu, Karadeniz, Doğu Anadolu, Güneydoğu) dengeli dağılsın.`
            : '';

    const selectedTypesGuide = mapInstructionTypes
        .map(t => `- ${TYPE_DESCRIPTIONS[t] || t}`)
        .join('\n');

    const gridInstruction = useGridSystem
        ? `[KOORDİNAT IZGARASI AKTİF]: Haritada yatayda A-J sütunları, dikeyde 1-5 satırları olan bir ızgara mevcuttur. Yönergelerden bazılarında "C-2 karesindeki ili bul" gibi ızgara koordinatlarını kullan.`
        : '';

    const customInputInstruction = customInput
        ? `[ÖZEL KROKİ / HARİTA]: Kullanıcı özel bir harita yükledi. Şehir isimleri yerine genel yönler, şekiller ve harita üzerindeki nesneler üzerinden yönergeler kur.`
        : '';

    const difficultyGuide = level === 1
        ? 'Seviye 1 (Başlangıç): Tek adımlı, net, bulma ve işaretleme odaklı yönergeler.'
        : level === 2
            ? 'Seviye 2 (Orta): Yön (kuzey/güney/doğu/batı) ve doğrudan komşu il ilişkileri.'
            : level === 3
                ? 'Seviye 3 (Zor): Mantıksal çıkarım, bölge tespiti ve iki adımlı komşuluk takibi.'
                : level === 4
                    ? 'Seviye 4 (Uzman): Rota planlama, harf/hece analizi ve algoritmik adım takibi.'
                    : 'Seviye 5 (Klinik): Dikkat, çalışma belleği ve çok aşamalı uzamsal akıl yürütme.';

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${MAP_DETECTIVE_PROMPT}
    ${getStudentContextPrompt(student)}

    GÖREV: ${mapTypeLabel} üzerinde "Harita Dedektifi" etkinliği üret.
    ${mapTypeDesc}

    ${geoContext ? `[COĞRAFİ VERİLER - KESİN REFERANS]:
    Aşağıdaki listeyi ve komşuluk ilişkilerini temel al:
    ${geoContext}` : ''}

    ${regionInstruction}
    ${gridInstruction}
    ${customInputInstruction}

    ZORLUK SEVİYESİ: ${difficulty} (Seviye ${level}/5)
    ${difficultyGuide}

    KULLANICININ SEÇTİĞİ SORU TİPLERİ (SADECE BUNLARI KULLAN):
    ${selectedTypesGuide}

    KURALLAR:
    1. Tam olarak ${targetItemCount} adet yönerge üret.
    2. Yönergeler açık, net, disleksi dostu kısa cümlelerden oluşsun.
    3. Coğrafi gerçekliği asla bozma; komşulukları doğru ver.
    4. Yönergelerde geçen iller gerçek ve haritada bulunabilir olsun.
    5. pedagogicalNote alanında öğretmene bu etkinliğin çocuğun hangi bilişsel/uzamsal becerisini desteklediğini açıkla.

    [JSON ÇIKTI FORMATI]:
    {
        "title": "Harita Dedektifi: ${mapTypeLabel}",
        "instruction": "${mapType === 'world' ? 'Dünya haritasını inceleyerek yönergeleri hatasız uygula.' : mapType === 'treasure' ? 'Hazine adası haritasını keşfederek yönergeleri uygula.' : 'Haritayı inceleyerek yönergeleri hatasız uygula.'}",
        "instructions": [
            "1. yönerge",
            "2. yönerge",
            "..."
        ],
        "pedagogicalNote": "Öğrencinin uzamsal yön algısı ve görsel tarama becerilerini ZPD sınırında destekler."
    }
    `;

    const response = await generateCreativeMultimodal({
        prompt,
        temperature: 0.3
    });

    const items = (Array.isArray(response) ? response : [response]) as unknown[];
    const pages = Math.max(1, options.worksheetCount || 1);
    const results: MapInstructionData[] = [];

    for (let p = 0; p < pages; p++) {
        const itemObj = (items[p] || items[0] || {}) as Record<string, unknown>;
        const rawInstructions = Array.isArray(itemObj.instructions)
            ? (itemObj.instructions as string[])
            : [];
        const instructions = rawInstructions.slice(0, targetItemCount);

        let finalCities: MapInstructionData['cities'] = [];
        if (mapType === 'turkey') {
            finalCities = getCleanCityPool(emphasizedRegion, instructions);
        } else if (mapType === 'world') {
            finalCities = WORLD_COUNTRIES.map((c, i) => ({
                id: `country_${i}`,
                name: c.name,
                x: 100 + (i % 5) * 180 + Math.sin(i) * 30,
                y: 80 + Math.floor(i / 5) * 90 + Math.cos(i) * 20,
                region: c.region,
                neighbors: c.neighbors,
            }));
        } else {
            finalCities = TREASURE_LOCATIONS.map((l, i) => ({
                id: `treasure_${i}`,
                name: l.name,
                x: 120 + (i % 4) * 220 + Math.cos(i) * 40,
                y: 80 + Math.floor(i / 4) * 110 + Math.sin(i) * 25,
                region: l.region,
                neighbors: l.neighbors,
            }));
        }

        results.push({
            title: (itemObj.title as string) || `Harita Dedektifi: ${mapTypeLabel}`,
            instruction: (itemObj.instruction as string) || 'Haritayı inceleyerek yönergeleri sırayla takip et.',
            imageBase64: customInput,
            emphasizedRegion: mapType === 'turkey' ? emphasizedRegion : mapType,
            difficultyLevel: level,
            instructions,
            cities: finalCities,
            pedagogicalNote: (itemObj.pedagogicalNote as string) || 'Öğrencinin uzamsal konumlandırma, yön tayini ve görsel tarama becerilerini güçlendirir.',
            settings: {
                showCityNames,
                markerStyle,
                difficulty,
                mapType,
                includeCompass,
                useGridSystem
            },
            gridConfig: useGridSystem ? { rows: 5, cols: 10 } : undefined
        });
    }

    return results;
};

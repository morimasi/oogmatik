import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions, MapInstructionData } from '../../types';
import { MAP_DETECTIVE_PROMPT, PEDAGOGICAL_BASE, getStudentContextPrompt } from './prompts';
import { CALIBRATED_CITIES } from './geoData';

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

const getCityDataForMapType = (mapType: string | undefined, emphasizedRegion: string | undefined) => {
    if (!mapType || mapType === 'turkey') {
        const relevantCities = emphasizedRegion && emphasizedRegion !== 'all'
            ? CALIBRATED_CITIES.filter(c => c.region === emphasizedRegion)
            : CALIBRATED_CITIES;
        return relevantCities.slice(0, 40).map(c =>
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

const getCityPoolForMapType = (mapType: string) => {
    if (mapType === 'world') {
        return WORLD_COUNTRIES.map((c, i) => ({
            id: `country_${i}`,
            name: c.name,
            x: 100 + Math.random() * 800,
            y: 50 + Math.random() * 400,
            region: c.region,
            neighbors: c.neighbors,
        }));
    }
    if (mapType === 'treasure') {
        return TREASURE_LOCATIONS.map((l, i) => ({
            id: `treasure_${i}`,
            name: l.name,
            x: 100 + Math.random() * 800,
            y: 50 + Math.random() * 400,
            region: l.region,
            neighbors: l.neighbors,
        }));
    }
    return CALIBRATED_CITIES;
};

export const generateMapInstructionFromAI = async (options: GeneratorOptions): Promise<MapInstructionData[]> => {
    const difficulty = options.difficulty || 'Orta';
    const emphasizedRegion = options.emphasizedRegion || 'all';
    const mapType = options.mapType || 'turkey';
    const student = options.studentContext;
    const mapTypeLabel = MAP_TYPE_LABELS[mapType] || 'Türkiye Haritası';
    const mapTypeDesc = MAP_TYPE_DESCRIPTIONS[mapType] || MAP_TYPE_DESCRIPTIONS['turkey'];

    const geoContext = getCityDataForMapType(mapType, emphasizedRegion);

    const regionContext = mapType === 'turkey'
        ? `- Odak Bölge: ${emphasizedRegion}`
        : '';

    const cityInstructions = mapType === 'turkey'
        ? `Yukarıdaki gerçek coğrafi bilgileri kullanarak 10 adet yönerge üret.
    3. Yönergeler "X ilini bul, onun yanındaki Y iline git" gibi mantıklı olmalı.
    4. Koordinatlar 0-1000 (x) ve 0-500 (y) aralığında olmalı.`
        : mapType === 'world'
            ? `Yukarıdaki ülke listesini kullanarak 10 adet dünya coğrafyası sorusu üret.
    3. Yönergeler ülkeler, kıtalar ve okyanuslar arasında coğrafi keşif, yön bulma ve mantıksal çıkarım içermeli.
    4. "Brezilya'nın kuzeybatısındaki ülkeyi bul" gibi yön talimatları kullan.
    5. Koordinatlar 0-1000 (x) ve 0-500 (y) aralığında olmalı.`
            : `Yukarıdaki hazine adası lokasyonlarını kullanarak 10 adet macera sorusu üret.
    3. Yönergeler gizemli yerler arasında yön bulma, harita okuma ve mantıksal çıkarım içermeli.
    4. "Yılan Koyu'ndan başla, kuzeye doğru ilerle ve Kafatası Mağarası'nı bul" gibi talimatlar kullan.
    5. Koordinatlar 0-1000 (x) ve 0-500 (y) aralığında olmalı.`;

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${MAP_DETECTIVE_PROMPT}
    ${getStudentContextPrompt(student)}

    ${geoContext ? `[COĞRAFİ VERİLER - REFERANS]:
    Aşağıdaki ${mapType === 'turkey' ? 'şehir' : mapType === 'world' ? 'ülke' : 'lokasyon'} listesini ve komşuluk ilişkilerini temel al:
    ${geoContext}` : ''}

    GÖREV: ${mapTypeLabel} üzerinde "Harita Dedektifi" etkinliği üret.
    ${mapTypeDesc}

    PARAMETRELER:
    - Zorluk: ${difficulty}
    ${regionContext}

    KURALLAR:
    1. ${cityInstructions}
    5. Çıktıyı MapInstructionData tipine uygun JSON olarak dön.
    6. instructions dizisine sadece yönerge metinlerini yaz, her biri net ve anlaşılır olsun.

    [JSON FORMATI]:
    {
        "title": "Harita Dedektifi: ${mapTypeLabel}",
        "instruction": "${mapType === 'world' ? 'Dünya haritasını inceleyerek yönergeleri hatasız uygula.' : mapType === 'treasure' ? 'Hazine adası haritasını keşfederek yönergeleri uygula.' : 'Haritayı inceleyerek yönergeleri hatasız uygula.'}",
        "instructions": ["Yönerge 1", "Yönerge 2", "..."],
        "difficultyLevel": 3,
        "emphasizedRegion": "${mapType === 'turkey' ? emphasizedRegion : mapTypeLabel}",
        "settings": {
            "showCityNames": true,
            "markerStyle": "circle",
            "difficulty": "${difficulty}",
            "mapType": "${mapType}"
        }
    }
    `;

    const response = await generateCreativeMultimodal({
        prompt: prompt,
        temperature: 0.7
    });

    const items = (Array.isArray(response) ? response : [response]) as unknown[];

    const cityPool = getCityPoolForMapType(mapType);

    const processedData = items.map(item => ({
        ...item,
        cities: cityPool,
        settings: {
            ...(item as any).settings,
            mapType,
            showCityNames: (item as any).settings?.showCityNames ?? true,
            markerStyle: (item as any).settings?.markerStyle || 'circle',
        }
    })) as unknown as MapInstructionData[];

    return processedData;
};

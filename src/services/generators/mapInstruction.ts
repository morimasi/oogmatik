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
    turkey: 'Türkiye'nin şehirlerini, bölgelerini ve coğrafi özelliklerini kullan.',
    world: 'Dünya üzerindeki ülkeleri, kıtaları ve okyanusları kullan. Şehir adları yerine ülke adları kullan, koordinatlar gerçek dünya koordinatlarına yakın olsun.',
    treasure: 'Hayali bir hazine adasında geçen bir etkinlik. Koylar, mağaralar, tepeler, nehirler gibi hayali yer adları kullan.'
};

const getCityDataForMapType = (mapType: string | undefined, emphasizedRegion: string | undefined) => {
    if (!mapType || mapType === 'turkey') {
        const relevantCities = emphasizedRegion && emphasizedRegion !== 'all'
            ? CALIBRATED_CITIES.filter(c => c.region === emphasizedRegion)
            : CALIBRATED_CITIES;
        return relevantCities.slice(0, 40).map(c =>
            `${c.name} (${c.region}) - Komşular: ${c.neighbors?.join(', ')}`
        ).join('\n');
    }
    return '';
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
        : `Gerçek dünya coğrafyasına uygun 10 adet yönerge üret.
   3. Yönergeler coğrafi keşif, yön bulma ve mantıksal çıkarım içermeli.
   4. Koordinatlar 0-1000 (x) ve 0-500 (y) aralığında olmalı.`;

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${MAP_DETECTIVE_PROMPT}
    ${getStudentContextPrompt(student)}

    ${geoContext ? `[COĞRAFİ GERÇEKLER - REHBER]:
    Aşağıdaki şehir listesini ve komşuluk ilişkilerini temel al:
    ${geoContext}` : ''}

    GÖREV: ${mapTypeLabel} üzerinde "Harita Dedektifi" etkinliği üret.
    ${mapTypeDesc}

    PARAMETRELER:
    - Zorluk: ${difficulty}
    ${regionContext}

    KURALLAR:
    1. ${cityInstructions}
    5. Çıktıyı MapInstructionData tipine uygun JSON olarak dön.

    [JSON FORMATI]:
    {
        "title": "Harita Dedektifi: ${mapTypeLabel}",
        "instruction": "Haritayı inceleyerek yönergeleri hatasız uygula.",
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

    const processedData = items.map(item => ({
        ...item,
        cities: mapType === 'turkey'
            ? CALIBRATED_CITIES
            : (item as any).cities || generateFallbackCoords(10),
        settings: {
            ...(item as any).settings,
            mapType
        }
    })) as unknown as MapInstructionData[];

    return processedData;
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

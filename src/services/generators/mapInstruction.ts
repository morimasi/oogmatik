import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions, MapInstructionData } from '../../types';
import { MAP_DETECTIVE_PROMPT, PEDAGOGICAL_BASE, getStudentContextPrompt } from './prompts';
import { CALIBRATED_CITIES } from './geoData';

export const generateMapInstructionFromAI = async (options: GeneratorOptions): Promise<MapInstructionData[]> => {
    const difficulty = options.difficulty || 'Orta';
    const emphasizedRegion = options.emphasizedRegion || 'all';
    const student = options.studentContext;

    // Harita verilerini AI'ya rehber olması için özetle
    const relevantCities = emphasizedRegion !== 'all' 
        ? CALIBRATED_CITIES.filter(c => c.region === emphasizedRegion)
        : CALIBRATED_CITIES;

    const geoContext = relevantCities.slice(0, 40).map(c => 
        `${c.name} (${c.region}) - Komşular: ${c.neighbors?.join(', ')}`
    ).join('\n');

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${MAP_DETECTIVE_PROMPT}
    ${getStudentContextPrompt(student)}
    
    [COĞRAFİ GERÇEKLER - REHBER]:
    Aşağıdaki şehir listesini ve komşuluk ilişkilerini temel al:
    ${geoContext}
    
    GÖREV: Türkiye Haritası üzerinde "Harita Dedektifi" etkinliği üret.
    
    PARAMETRELER:
    - Zorluk: ${difficulty}
    - Odak Bölge: ${emphasizedRegion}
    
    KURALLAR:
    1. Yukarıdaki gerçek coğrafi bilgileri kullanarak 10 adet yönerge üret.
    2. Yönergeler "X ilini bul, onun yanındaki Y iline git" gibi mantıklı olmalı.
    3. Çıktıyı MapInstructionData tipine uygun JSON olarak dön.
    
    [JSON FORMATI]:
    {
        "title": "Harita Dedektifi: ${emphasizedRegion} Analizi",
        "instruction": "Haritadaki illeri ve bölgeleri inceleyerek yönergeleri hatasız uygula.",
        "pedagogicalNote": "Uzamsal algı ve yön tayini becerilerini geliştirir.",
        "instructions": ["Yönerge 1", "Yönerge 2", "..."],
        "difficultyLevel": 3,
        "emphasizedRegion": "${emphasizedRegion}",
        "settings": {
            "showCityNames": true,
            "markerStyle": "circle",
            "difficulty": "${difficulty}"
        }
    }
    `;

    const response = await generateCreativeMultimodal({
        prompt: prompt,
        temperature: 0.7
    });

    const items = (Array.isArray(response) ? response : [response]) as any[];

    // Veri Tamamlama (Post-processing): AI'nın döndüğü objelere eksik 'cities' verisini ekle
    const processedData = items.map(item => ({
        ...item,
        cities: CALIBRATED_CITIES // Tüm koordinat verilerini jeneratörden enjekte ediyoruz
    })) as MapInstructionData[];

    return processedData;
};

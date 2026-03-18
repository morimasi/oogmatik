
import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions, MapInstructionData } from '../../types';
import { MAP_DETECTIVE_PROMPT, PEDAGOGICAL_BASE, getStudentContextPrompt } from './prompts';

export const generateMapInstructionFromAI = async (options: GeneratorOptions): Promise<MapInstructionData[]> => {
    const difficulty = options.difficulty || 'Orta';
    const emphasizedRegion = options.emphasizedRegion || 'all';
    const student = options.studentContext;

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${MAP_DETECTIVE_PROMPT}
    ${getStudentContextPrompt(student)}
    
    GÖREV: Türkiye Haritası üzerinde "Harita Dedektifi" etkinliği üret.
    
    PARAMETRELER:
    - Zorluk: ${difficulty}
    - Odak Bölge: ${emphasizedRegion}
    
    KURALLAR:
    1. İlleri, komşulukları ve coğrafi konumları (Kuzey, Güney, Doğu, Batı) kullanarak 10 adet yönerge üret.
    2. Yönergeler "X ilini bul, onun doğusundaki ile git ve isminin ilk harfini yaz" gibi etkileşimli olmalı.
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

    const parsedData = await generateCreativeMultimodal({
        prompt: prompt,
        temperature: 0.7
    });

    // API bir dizi veya tek bir obje dönebilir, diziye sarmalayalım
    return (Array.isArray(parsedData) ? parsedData : [parsedData]) as MapInstructionData[];
};

import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions } from '../../types/core';
import { PatternCompletionData } from '../../types/visual';

export const generatePatternCompletionFromAI = async (
    options: GeneratorOptions
): Promise<PatternCompletionData> => {
    const opts = options as Record<string, unknown>;
    const difficulty = options.difficulty || 'Orta';
    const gridSize = (opts.gridSize as number) || 3;
    const patternType = (opts.patternType as string) || 'geometric';
    const puzzleCount = (opts.puzzleCount as number) || 4;
    const optionCount = (opts.optionCount as number) || 4;

    let typeInstruction = '';
    if (patternType === 'geometric') {
        typeInstruction =
            'Geometrik örüntüler kullan. Her hücrede bir şekil (circle, square, triangle, star, diamond, pentagon) ve bir renk olsun. Şekiller satıra veya sütuna göre mantıksal bir sıra/dönüşüm (rotasyon, renk değişimi, şekil artışı) izlesin.';
    } else if (patternType === 'color_blocks') {
        typeInstruction =
            'Sadece renk blokları kullan. Matris hücreleri belirli bir renk geçişi, simetri veya mantıksal kaydırma (shift) ile boyansın. Sadece "color" özelliği (hex veya ad) döndür.';
    } else if (patternType === 'logic_sequence') {
        typeInstruction =
            'Dizisel mantık veya özel semboller (sayılar, harfler, özel işaretler) kullan. (Örn: Hücrelerde artan sayılar, belli kurala göre atlayan harfler). Değerleri "content" alanına ver.';
    }

    const prompt = `
Sen görsel zeka ve uzamsal mantık geliştiren bir "Desen ve Parça Tamamlama" oyunu yapay zekasısın. IQ testlerindeki matris bulmacalarına benzer ama çocuklar için uygun, eğlenceli ve mantıklı matrisler üreteceksin. 
Görev: Verilen parametrelere uygun tam ${puzzleCount} adet matris bulmacası oluştur.

PARAMETRELER:
- Zorluk Kategorisi: ${difficulty}
- Matris Boyutu: ${gridSize} x ${gridSize}
- Bulmaca Sayısı: ${puzzleCount} adet (Tek A4 sayfasına kompakt sığacak)
- Örüntü Türü: ${typeInstruction}
- Şık Sayısı: ${optionCount} adet

TASARIM KURALLARI:
1. Sonuçta "puzzles" dizisi olacak. Her objenin içinde "matrix", "options", "gridSize" ve "patternType" olmalı.
2. "matrix" dizisi: Her hücrenin {x: number, y: number} koordinatları olsun. (0,0 sol üst). Toplam ${gridSize * gridSize} öğe. Yalnızca BİR öğede isMissing: true olsun. En sağ alt köşedeki (x:${gridSize - 1}, y:${gridSize - 1}) hücre boş bırakılır.
3. Hücre İçerikleri: typeInstruction kuralına göre hücrenin içini doldur. Geometrik ise "shapes" dizisi (type, color, rotation). Color-blocks ise "color". Mantık ise "content". 
4. "options": ${optionCount} adet şık ver. Yalnızca biri isCorrect: true olsun. Seçenek id'leri A, B, C, D... şeklinde ardışık olsun.

ZORUNLU JSON ÇIKTISI FORMATI:
{
    "id": "pattern_comp_123",
    "activityType": "PATTERN_COMPLETION",
    "title": "Kafayı Çalıştır: Deseni Tamamla",
    "instruction": "Matrislerdeki örüntü kurallarını bozmadan soru işaretli yerlere gelecek parçaları bulun.",
    "pedagogicalNote": "Bu etkinlik öğrencinin görsel algı, uzamsal akıl yürütme ve ardışık mantık kurma becerilerini geliştirir.",
    "settings": {
        "difficulty": "${difficulty}",
        "patternType": "${patternType}",
        "gridSize": ${gridSize},
        "puzzleCount": ${puzzleCount}
    },
    "content": {
        "title": "Eksik Parçaları Bul",
        "instruction": "Matrislerdeki örüntü kurallarını çözüp eksik parçaları işaretle.",
        "puzzles": [
            {
               "id": "pz_1",
               "gridSize": ${gridSize},
               "patternType": "${patternType}",
               "matrix": [
                   { "x": 0, "y": 0, "isMissing": false, "shapes": [ { "type": "square", "color": "#ef4444", "rotation": 0 } ] },
                   { "x": 1, "y": 0, "isMissing": false, "shapes": [ { "type": "circle", "color": "#3b82f6", "rotation": 0 } ] }
                   // ... diğer matris hücreleri (toplam ${gridSize * gridSize})
               ],
               "options": [
                   { "id": "A", "isCorrect": true, "cell": { "x": ${gridSize - 1}, "y": ${gridSize - 1}, "isMissing": false, "shapes": [ { "type": "triangle", "color": "#10b981", "rotation": 90 } ] } },
                   { "id": "B", "isCorrect": false, "cell": { "x": ${gridSize - 1}, "y": ${gridSize - 1}, "isMissing": false, "shapes": [ { "type": "star", "color": "#f59e0b", "rotation": 0 } ] } }
                   // ... toplam ${optionCount} seçenek
               ]
            }
            // tam ${puzzleCount} adet bulmaca olacak şekilde tamamla
        ]
    }
}
`;

    const parsedData = await generateCreativeMultimodal({
        prompt: prompt,
        temperature: 0.6,
    });

    return parsedData as PatternCompletionData;
};

import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions } from '../../types/core';
import { PatternCompletionData } from '../../types/visual';

export const generatePatternCompletion = async (options: GeneratorOptions): Promise<PatternCompletionData> => {
    const difficulty = options.difficulty || 'Orta';
    const gridSize = options.gridSize || 3;
    const patternType = options.patternType || 'geometric';

    let typeInstruction = '';
    if (patternType === 'geometric') {
        typeInstruction = 'Geometrik örüntüler kullan. Her hücrede bir şekil (circle, square, triangle, star) ve bir renk olsun. Şekiller satıra veya sütuna göre mantıksal bir sıra/dönüşüm (rotasyon, renk değişimi) izlesin.';
    } else if (patternType === 'color_blocks') {
        typeInstruction = 'Sadece renk blokları kullan. Matris hücreleri belirli bir renk geçişi, simetri veya mantıksal kaydırma (shift) ile boyansın. Sadece "color" özelliği (hex veya basit bir renk, örn: #ff0000 veya bg-red-500) döndür.';
    } else if (patternType === 'logic_sequence') {
        typeInstruction = 'Dizisel mantık veya özel semboller (sayılar, ok işaretleri, harfler) kullan. (Örn: Hücrelerde artan sayılar veya saat yönünde dönen ok sembolleri olsun). Değerleri "content" alanına ver.';
    }

    const prompt = `
Sen görsel zeka ve uzamsal mantık geliştiren bir "Desen ve Parça Tamamlama" oyunu yapay zekasısın. IQ testlerindeki matris bulmacalarına benzer ama çocuklar için uygun, eğlenceli matrisler üreteceksin. 
Görev: ${gridSize}x${gridSize} boyutunda bir matris oluştur. Bu matrisin tam olarak BİR HÜCRESİ EKSİK (isMissing: true) olacak. Ardından öğrenciye eksik parçayı bulması için 4 çoktan seçmeli seçenek sun.

PARAMETRELER:
- Zorluk Kategorisi: ${difficulty}
- Matris Boyutu: ${gridSize} x ${gridSize} 
- Örüntü Türü: ${typeInstruction}

TASARIM KURALLARI:
1. "matrix" dizisi: Her hücrenin {x: number, y: number} koordinatları olsun. (0,0 sol üst). Toplam ${gridSize * gridSize} öğe. Yalnızca BİR öğede isMissing: true olsun. (Genellikle en sağ alt köşedeki (x:${gridSize - 1}, y:${gridSize - 1}) hücre boş bırakılır ama farklı da olabilir).
2. Hücre İçerikleri: typeInstruction kuralına göre hücrenin içini doldur. Geometrik ise "shapes" dizisi (type, color, rotation). Color-blocks ise "color". Mantık ise "content". 
3. "options": 4 seçenek ver (A, B, C, D id'leri). Yalnızca biri isCorrect: true olsun. 

Aşağıdaki JSON formatında (Kesinlikle MD veya kod bloğu olmadan, doğrudan JSON formatında döneceksin):

{
    "id": "pattern_comp_123",
    "activityType": "PATTERN_COMPLETION",
    "title": "Kafayı Çalıştır: Deseni Tamamla",
    "settings": {
        "difficulty": "${difficulty}",
        "patternType": "${patternType}",
        "gridSize": ${gridSize}
    },
    "content": {
        "title": "Eksik Parçayı Bul",
        "instruction": "Yukarıdaki kuralı çözüp soru işaretli yere gelecek olan şekli seçeneklerden işaretle.",
        "matrix": [
            { "x": 0, "y": 0, "isMissing": false, "shapes": [ { "type": "square", "color": "#ef4444", "rotation": 0 } ] },
            { "x": 1, "y": 0, "isMissing": false, "shapes": [ { "type": "circle", "color": "#3b82f6", "rotation": 0 } ] }
            // ... diğer matris hücreleri
        ],
        "options": [
            { "id": "A", "isCorrect": true, "cell": { "x": 0, "y": 0, "isMissing": false, "shapes": [ { "type": "triangle", "color": "#10b981", "rotation": 90 } ] } },
            ... { B, C, D }
        ]
    }
}
`;

    const parsedData = await generateCreativeMultimodal({
        prompt: prompt,
        temperature: 0.5, // Mantık bulmacalarında tutarlılık çok önemlidir.
    });

    return parsedData as PatternCompletionData;
}

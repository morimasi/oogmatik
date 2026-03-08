import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions, DirectionalCodeReadingData } from '../../types/visual';

export const generateDirectionalCodeReadingFromAI = async (options: GeneratorOptions): Promise<DirectionalCodeReadingData> => {
    const difficulty = options.difficulty || 'Orta';
    const gridSize = options.gridSize || 6;
    const obstacleDensity = options.obstacleDensity || 20;
    const cipherType = options.cipherType || 'arrows';
    const student = options.studentContext;

    let cipherInstruction = 'Klasik oklar kullanarak yönlendirme yap (Örn: 2 birim yukarı, 3 birim sol).';
    if (cipherType === 'letters') {
        cipherInstruction = 'Harf sembolojisi kullan. Örn: Yukarı=Y, Aşağı=A, Sağ=S, Sol=L. "2Y" = 2 birim yukarı demek.';
    } else if (cipherType === 'colors') {
        cipherInstruction = 'Renk sembolojisi veya karmaşık şifreleme. Örn: "Mavi 2" = 2 yukarı, "Kırmızı 1" = 1 sol.';
    }

    let studentContextInfo = '';
    if (student) {
        studentContextInfo = `Öğrenci Profili: ${student.age} yaşında. Senaryoyu (Örn: "Uzay gemisini istasyona ulaştır" veya "Köpeği kemiğe götür") onun ilgisini çekecek şekilde kısa tut.`;
    }

    // Grid boyutuna göre path (adım) sayısını sınırla
    const maxSteps = Math.floor(gridSize * 1.5);

    const prompt = `
Sen "Şifreli Kod Okuma / Rota Labirenti" tarzında algoritmik düşünme becerisi geliştiren bir OÖG (Özel Öğrenme Güçlüğü) etkinlik jeneratörüsün.
Görev: ${gridSize}x${gridSize} boyutunda bir ızgara üzerinde başlangıç(start) noktasından hedef(target) noktasına ENGEL (obstacle) KUTULARINI AŞARAK giden bir algoritma rotası ve bu rotanın kodlarını üretmek.

PARAMETRELER:
- Zorluk Kategorisi: ${difficulty}
- Matris(Grid) Boyutu: ${gridSize}x${gridSize} (Koordinatlar x: 0..${gridSize - 1}, y: 0..${gridSize - 1})
- Engel Yoğunluğu: %${obstacleDensity}
- Şifreleme/Kodlama Türü: ${cipherInstruction}
${studentContextInfo}

ALGORİTMA TASARIM KURALLARI:
1. grid dizisi 2 boyutlu (array of array) olacaktır. Her hücre bir obje. \`y\` satırı (yukarıdan aşağıya), \`x\` sütunu (soldan sağa) temsil eder. [0][0] en sol üsttür.
2. startPos ve targetPos hücreleri belirlenmeli.
3. Arada geçerli zikzak veya L-şeklinde bir "path" (güzergah) olmalı ve bu rotadaki hücreleri "path" olarak işaretle (hata giderme veya ipucu vermek amaçlı).
4. Rotanın üzerine ASLA "obstacle" (engel) koyma. 
5. "instructions" dizisine, öğrencinin adım adım hedefi bulması için vereceği "KOD" satırlarını yaz.
   direction: 'up' (y azalır), 'down' (y artar), 'left' (x azalır), 'right' (x artar).
   Örn: 2 yukarı, 1 sağ, 3 aşağı gibi. Toplam adım sayısı maks ${maxSteps} komut civarında kalsın.

Aşağıdaki JSON formatında kesin, parse edilebilir ve mantıksal olarak ÇÖZÜLEBİLİR formatta dön:

{
    "id": "directional_code",
    "activityType": "DIRECTIONAL_CODE_READING",
    "title": "Şifreyi Çöz ve Hedefe Ulaş",
    "settings": {
        "difficulty": "${difficulty}",
        "gridSize": ${gridSize},
        "obstacleDensity": ${obstacleDensity},
        "cipherType": "${cipherType}"
    },
    "content": {
        "title": "Uzay Gemisini Park Et",
        "storyIntro": "Komutan! Göktaşlarına (engellere) çarpmadan uzay istasyonuna ulaşmak için aşağıdaki kodları takip et.",
        "startPos": { "x": 0, "y": 0 },
        "targetPos": { "x": 4, "y": 4 },
        "grid": [
            [
                { "x": 0, "y": 0, "type": "start", "icon": "fa-solid fa-rocket" },
                { "x": 1, "y": 0, "type": "empty" },
                // ... X eksenindeki hücreler (Toplam gridSize kadar sütun)
            ],
            [
               // ... Satır y=1
            ]
            // ... Toplam gridSize kadar satır arrayi
        ],
        "instructions": [
            { "step": 1, "count": 2, "direction": "down" },
            { "step": 2, "count": 3, "direction": "right" },
            { "step": 3, "count": 2, "direction": "down" },
            { "step": 4, "count": 1, "direction": "right" }
        ]
    }
}
`;

    const parsedData = await generateCreativeMultimodal({
        prompt: prompt,
        temperature: 0.6, // Mantık oyunlarında düşük yaratıcılık katı kurallara uymasını sağlar.
    });

    return parsedData as DirectionalCodeReadingData;
}

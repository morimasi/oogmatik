import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions } from '../../types/core';
import { DirectionalCodeReadingData } from '../../types/visual';

export const generateDirectionalCodeReadingFromAI = async (
  options: GeneratorOptions
): Promise<DirectionalCodeReadingData> => {
  const difficulty = options.difficulty || 'Orta';
  const gridSize = options.gridSize || 6;
  const obstacleDensity = options.obstacleDensity || 20;
  const cipherType = options.cipherType || 'arrows';
  const puzzleCount = options.puzzleCount || (difficulty === 'Zor' ? 1 : 2);
  const student = options.studentContext;

  let systemContext = '';
  if (student) {
    systemContext = `Öğrenci Profili: ${student.age} yaşında. Senaryoyu öğrencinin ilgisini çekecek (Uzay, Gizli Ajan, Define Avı vb.) bir temaya oturt.`;
  }

  const prompt = `
Sen "Şifreli Kod Okuma / Rota Labirenti" üzerine uzmanlaşmış bir OÖG (Özel Öğrenme Güçlüğü) etkinlik jeneratörüsün.
Bireyin algoritmik düşünme, uzamsal planlama ve yönetici işlevlerini geliştirecek ${puzzleCount} farklı bulmaca (puzzles) üret.

PARAMETRELER:
- Zorluk: ${difficulty} (Basit seviyede tek hamleli, Zor seviyede L ve Z dönüşlü rotalar)
- Izgara: ${gridSize}x${gridSize}
- Engel Yoğunluğu: %${obstacleDensity}
- Şifreleme Türü: ${cipherType} (arrows: oklar, letters: koordinat harfleri, colors: renk kodları)
${systemContext}

ALGORİTMA KURALLARI:
1. Her bulmaca için ayrı bir "puzzles" array elemanı üret.
2. grid yapısında: 'empty', 'obstacle', 'start', 'target' tiplerini kullan.
3. Zorluğa göre yönerge karmaşıklığını artır:
   - Basit: "2 Sağ, 1 Aşağı"
   - Orta: (+/-) Matematiksel şifreler (Örn: "4-2 Sağ" = 2 Sağ)
   - Zor: Koordinat / Renk karmaşası (Örn: "Mavi Kapıdan 3 birim x-ekseni pozitif")
4. ASLA engellerin üzerinden geçen bir rota (instructions) oluşturma.
5. Her puzzle için klinikMeta (bilişsel yük, planlama zorluğu) ekle.

Aşağıdaki JSON formatında (DirectionalCodeReadingData) çıktı ver:
{
    "id": "directional_code_premium",
    "activityType": "DIRECTIONAL_CODE_READING",
    "settings": { "difficulty": "${difficulty}", "gridSize": ${gridSize}, "cipherType": "${cipherType}" },
    "content": {
        "title": "ALGORİTMİK ROTA PROTOKOLÜ",
        "storyIntro": "Premium seviye rota analizi ve kod okuma görevi.",
        "puzzles": [
            {
                "id": "p1",
                "title": "Sektör 7: Labirent",
                "grid": [ [{ "x":0, "y":0, "type":"start", "icon":"fa-rocket" }, {...}] ],
                "startPos": { "x": 0, "y": 0 },
                "targetPos": { "x": 4, "y": 4 },
                "instructions": [ { "step": 1, "count": 2, "direction": "down", "label": "2 Birim Aşağı" } ],
                "clinicalMeta": { "cognitiveLoad": 0.7, "planningComplexity": "high" }
            }
        ]
    }
}
`;

  const parsedData = await generateCreativeMultimodal({
    prompt: prompt,
    temperature: 0.5,
  });

  return parsedData as DirectionalCodeReadingData;
};

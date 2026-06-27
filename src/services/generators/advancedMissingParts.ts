import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions } from '../../types/core';

export const generateAdvancedMissingPartsFromAI = async (
  options: GeneratorOptions
): Promise<any> => {
  const opts = options as unknown as Record<string, unknown>;
  const topic = (opts.topic as string) || 'Genel Kültür';
  const difficulty = options.difficulty || 'Orta';
  const blankType = (opts.blankType as string) || 'word';

  const prompt = `
Uzman: Dil Bilgisi Profesörü & Özel Eğitim Uzmanı
Görev: "${topic}" temalı, "${difficulty}" zorluk seviyesinde bir "Eksik Parçaları Tamamla" (Cloze Test) etkinliği üret.

KURAL 1: Veri Yapısı (JSON)
{
  "id": "amp_ai_v2",
  "activityType": "MISSING_PARTS",
  "title": "${topic} - Eksik Parçaları Tamamla",
  "instruction": "Cümlelerdeki boşlukları anlam bütünlüğünü bozmayacak şekilde tamamla.",
  "pedagogicalNote": "Bağlamsal ipuçlarını kullanma ve semantik tamamlama becerisi odaklıdır.",
  "content": {
    "items": [
      { "id": "1", "text": "Cümle yapısı (boşluk için ........... kullan)", "answer": "eksik_kelime", "hint": "İpucu" }
    ],
    "wordBank": ["kelime1", "kelime2"],
    "insight": {
       "title": "İpucu",
       "text": "Eksik parçayı bulmak için cümlenin genel akışına bak."
    }
  }
}

KURAL 2: Zorluk (${difficulty})
- ${blankType === 'phrase' ? 'Eksik parçalar sadece kelime değil, 2-3 kelimelik öbekler olmalı.' : 'Eksik parçalar tek bir kelime olmalı.'}
- Dil bilgisi kurallarına (ekler, uyumlar) %100 uyumlu olmalı.

ZORUNLU: Sadece JSON döndür.
  `;

  const parsedData = await generateCreativeMultimodal({
    prompt: prompt,
    temperature: 0.5,
  });

  return parsedData;
};

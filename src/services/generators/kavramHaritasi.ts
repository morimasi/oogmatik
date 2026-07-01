import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions } from '../../types/core';

export const generateKavramHaritasiFromAI = async (
  options: GeneratorOptions
): Promise<any> => {
  const opts = options as unknown as Record<string, unknown>;
  const topic = (opts.topic as string) || 'Hayat Bilgisi';
  const difficulty = options.difficulty || 'Orta';

  const prompt = `
İsim: Kavram Haritası Master (Nöro-Pedagojik Tasarımcı)
Görev: "${topic}" konusu üzerine, disleksi dostu, görsel hiyerarşisi mükemmel bir A4 INFOGRAPHIC taslağı oluştur.

KURAL 1: Veri Yapısı (JSON)
{
  "id": "concept_ai_v2",
  "activityType": "KAVRAM_HARITASI",
  "title": "${topic} İnfografik Haritası",
  "instruction": "Kavram haritasındaki hiyerarşik boşlukları tamamla ve alt kısımdaki analizleri gerçekleştir.",
  "settings": { "difficulty": "${difficulty}", "isAI": true },
  "content": {
    "topic": "${topic}",
    "nodes": [
      { "id": "1", "label": "ANA KAVRAM", "type": "root", "icon": "Star" },
      { "id": "2", "label": "Alt Kavram", "parentId": "1", "isMissing": true },
      { "id": "3", "label": "Dolu Kavram", "parentId": "1", "isMissing": false }
    ],
    "wordBank": ["id:2'nin gerçek cevabı", "diğer eksiklerin cevapları"],
    "matching": [
       { "q": "Kavram tanımı", "a": "Kavram adı" }
    ],
    "insight": "Konuyla ilgili 1 paragraflık, çocuk diline uygun özet bilgi."
  }
}

KURAL 2: Pedagoji
- Düğümlerin %50'si isMissing: true olsun.
- Hiyerarşi en az 3 katmanlı olsun.
- Müfredat uygunluğunu maksimize et.

ZORUNLU: Sadece JSON döndür.
  `;

  const parsedData = await generateCreativeMultimodal({
    prompt: prompt,
    temperature: 0.3, // Daha stabil hiyerarşi için
  });

  return parsedData;
};

import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions } from '../../types/core';

export const generateKavramHaritasiFromAI = async (
  options: GeneratorOptions
): Promise<any> => {
  const opts = options as Record<string, unknown>;
  const difficulty = options.difficulty || 'Orta';
  const topic = (opts.topic as string) || 'Genel bir bilimsel konu';
  const depth = (opts.depth as number) || 2;
  const branchCount = (opts.branchCount as number) || 3;

  const prompt = `
Sen bir eğitim teknolojileri uzmanı ve nöro-pedagogsun. Disleksi ve öğrenme güçlüğü çeken çocuklar için yüksek kaliteli, görsel hiyerarşisi net bir "Kavram Haritası" oluşturacaksın.

GÖREV: "${topic}" konusu üzerine, ${difficulty} zorluk seviyesinde bir kavram haritası yapılandır.

PARAMETRELER:
- Konu: ${topic}
- Zorluk: ${difficulty}
- Derinlik: ${depth} (Ana kavramdan itibaren kaç katman aşağı inileceği)
- Dal Sayısı: Her düğümden ortalama ${branchCount} dal çıkmalı.

TASARIM KURALLARI:
1. "nodes" dizisi oluştur. Her düğüm (node) şu özellikleri içermeli:
   - id: Benzersiz bir ID (string)
   - label: Kavramın adı (Kısa, öz, anlaşılır)
   - parentId: Bağlı olduğu üst kavramın ID'si (root hariç)
   - type: En üst kavram için "root", diğerleri için "concept".
2. Bilişsel yükü optimize et: Kavramlar arası ilişkiler mantıklı ve müfredata uygun olmalı.
3. Boşluk Bırakma: Çocuğun doldurması için düğümlerin %${(opts.fillRatio as number) || 60}'ını dolu, kalanını boş (label: "") bırak ama parentId ilişkisini koru.

ZORUNLU JSON FORMATI:
{
  "id": "kavram_ai_123",
  "activityType": "KAVRAM_HARITASI",
  "title": "${topic} Kavram Haritası",
  "instruction": "Kavramlar arasındaki ilişkileri takip ederek boş kutucukları doğru terimlerle tamamlayın.",
  "pedagogicalNote": "Bu harita, öğrencinin ${topic} konusundaki şemalarını organize etmesine ve hiyerarşik düşünme becerisini geliştirmesine yardımcı olur.",
  "settings": {
    "difficulty": "${difficulty}",
    "depth": ${depth},
    "topic": "${topic}"
  },
  "content": {
    "nodes": [
      { "id": "1", "label": "${topic}", "type": "root" },
      { "id": "2", "label": "Örnek Alt Kavram", "parentId": "1", "type": "concept" }
      // ... diğer düğümler
    ]
  }
}
`;

  const parsedData = await generateCreativeMultimodal({
    prompt: prompt,
    temperature: 0.5,
  });

  return parsedData;
};

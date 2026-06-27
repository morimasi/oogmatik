import { ActivityType } from '../../types/activity';
import { GeneratorOptions } from '../../types/core';
import { shuffle } from './helpers';

export const generateOfflineMissingParts = async (
  options: GeneratorOptions
): Promise<any[]> => {
  const { difficulty = 'Orta' } = options;
  const opts = options as Record<string, unknown>;
  const mode = (opts.blankType as string) || 'word'; // word, syllable, character

  const library: Record<string, string[]> = {
    'Bilim': [
        "Dünyanın en büyük (gezegeni) Jüpiter'dir.",
        "Bitkiler fotosentez yaparak (oksijen) üretir.",
        "Su, yüz derecede (kaynamaya) başlar.",
        "Mıknatıslar demir ve (nikel) gibi metalleri çeker.",
        "Güneş bir (yıldızdır) ve ısı kaynağımızdır."
    ],
    'Tarih': [
        "İstanbul bin dört yüz elli üç yılında (fethedilmiştir).",
        "Atatürk, Türkiye Cumhuriyeti'nin (kurucusudur).",
        "Anadolu asırlardır birçok (medeniyete) ev sahipliği yapmıştır.",
        "Lale Devri, Osmanlı'da bir (yenilik) dönemidir.",
        "Kurtuluş Savaşı (milli) mücadelenin adıdır."
    ],
    'Doğa': [
        "Ormanlar dünyanın en önemli (akciğerleridir).",
        "Okyanuslar devasa (su) kütleleridir.",
        "Yağmur bulutlardan süzülerek (toprağa) ulaşır.",
        "Arılar çiçeklerden (bal) toplar.",
        "Mevsimler, dünyanın (eksen) eğikliği sayesinde oluşur."
    ]
  };

  const topic = (opts.topic as string) || 'Doğa';
  const sentences = library[topic] || library['Doğa'];
  const itemCount = (opts.blankCount as number) || 8;

  const items = sentences.slice(0, itemCount).map((raw, idx) => {
    const match = raw.match(/\((.*?)\)/);
    const answer = match ? match[1] : '';
    const text = raw.replace(/\((.*?)\)/, '...........');
    
    return {
      id: `mp_${idx}`,
      original: raw,
      text: text,
      answer: answer,
      hint: difficulty === 'Kolay' ? answer[0] + '...' : ''
    };
  });

  return [{
    id: `missing_parts_v2_${Date.now()}`,
    activityType: ActivityType.MISSING_PARTS,
    title: `EKSİK PARÇALARI TAMAMLA: ${topic.toUpperCase()}`,
    instruction: 'Cümlelerdeki boşlukları anlam bütünlüğüne göre uygun kelimelerle doldur.',
    pedagogicalNote: 'Okuduğunu anlama, bağlamsal ipuçlarını değerlendirme ve kelime bilgisini ölçer.',
    settings: { ...options },
    content: {
      items: shuffle(items),
      wordBank: shuffle(items.map(i => i.answer)),
      topic: topic,
      mode: mode,
      insight: {
          title: "Strateji",
          text: "Önce tüm cümleyi oku, sonra cümlenin genel anlamından yola çıkarak eksik parçayı tahmin et."
      }
    }
  }];
};

export default generateOfflineMissingParts;

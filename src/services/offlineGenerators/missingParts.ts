import { ActivityType } from '../../types/activity';
import { GeneratorOptions } from '../../types/core';
import { shuffle } from './helpers';

export const generateOfflineMissingParts = async (
  options: GeneratorOptions
): Promise<any[]> => {
  const { difficulty = 'Orta' } = options;
  const opts = options as Record<string, unknown>;
  const mode = (opts.blankType as string) || 'word'; // word, syllable, character
  const itemCount = (opts.blankCount as number) || (difficulty === 'Zor' ? 12 : difficulty === 'Orta' ? 9 : 7);
  const topic = (opts.topic as string) || 'Doğa';

  const library: Record<string, string[]> = {
    'Bilim': [
        "Dünyanın en büyük (gezegeni) Jüpiter'dir.",
        "Bitkiler fotosentez yaparak (oksijen) üretir.",
        "Su, yüz derecede (kaynamaya) başlar.",
        "Mıknatıslar demir ve (nikel) gibi metalleri çeker.",
        "Güneş bir (yıldızdır) ve ısı kaynağımızdır.",
        "Hava, (nitrojen) ve oksijen içerir.",
        "Dünya, Güneş etrafında (döner).",
        "Bitkilerin kökleri (suyu) alır."
    ],
    'Tarih': [
        "İstanbul bin dört yüz elli üç yılında (fethedilmiştir).",
        "Atatürk, Türkiye Cumhuriyeti'nin (kurucusudur).",
        "Anadolu asırlardır birçok (medeniyete) ev sahipliği yapmıştır.",
        "Lale Devri, Osmanlı'da bir (yenilik) dönemidir.",
        "Kurtuluş Savaşı (milli) mücadelenin adıdır.",
        "Türklerin ilk devleti (Göktürk) Devletidir.",
        "İstanbul, iki (kıta) üzerinde kurulmuştur.",
        "Ankara, Türkiye'nin (başkenti)dir."
    ],
    'Doğa': [
        "Ormanlar dünyanın en önemli (akciğerleridir).",
        "Okyanuslar devasa (su) kütleleridir.",
        "Yağmur bulutlardan sızarak (toprağa) ulaşır.",
        "Arılar çiçeklerden (bal) toplar.",
        "Mevsimler, dünyanın (eksen) eğikliği sayesinde oluşur.",
        "Kuşlar (uçabilir) ve yumurta verir.",
        "Ağaçlar, havayı (temizler).",
        "Balıklar suda (yaşar)."
    ],
    'Uzay': [
        "Dünya, Güneş sisteminde bir (gezegendir).",
        "Ay, Dünya'nın (uydu)dur.",
        "Yıldızlar çok (uzak) tedir.",
        "Güneş, bir (yıldızdır).",
        "Mars, kırmızı (gezegendir).",
        "Venüs, (sıcak) bir gezegendir.",
        "Jüpiter, en (büyük) gezegendir.",
        "Satürn'ün (halkaları) vardır."
    ]
  };

  const sentences = library[topic] || library['Doğa'];
  const selectedSentences = shuffle(sentences).slice(0, itemCount);

  // Convert sentences into parts format for consistency with other MissingParts components!
  const parts = selectedSentences.map((raw, idx) => {
    const match = raw.match(/\((.*?)\)/);
    const answer = match ? match[1] : '';
    const idxMatch = match?.index ?? raw.length;
    const before = raw.substring(0, idxMatch);
    const after = raw.substring(idxMatch + (match ? match[0].length : 0));
    
    return {
      id: `p-${idx}`,
      parts: [
        { text: before, isBlank: false },
        { text: answer, isBlank: true, answer: answer },
        { text: after, isBlank: false }
      ]
    };
  });

  // Build word bank with distractors!
  let wordBank = parts.map(p => p.parts.find(x => x.isBlank)?.answer || '');
  if (opts.includeDistractors) {
    const distractors: string[] = [];
    const distractorCount = Math.min(opts.distractorCount as number || 4, library['Doğa'].length);
    for (let i = 0; i < distractorCount; i++) {
      const randomTopic = Object.keys(library)[Math.floor(Math.random() * Object.keys(library).length)];
      const randomSentence = library[randomTopic][Math.floor(Math.random() * library[randomTopic].length)];
      const matchDistractor = randomSentence.match(/\((.*?)\)/);
      if (matchDistractor) distractors.push(matchDistractor[1]);
    }
    wordBank = shuffle([...wordBank, ...distractors]);
  } else {
    wordBank = shuffle(wordBank);
  }

  return [{
    id: `missing_parts_premium_${Date.now()}`,
    activityType: ActivityType.MISSING_PARTS,
    title: `EKSİK PARÇALARI TAMAMLA: ${topic.toUpperCase()}`,
    instruction: 'Aşağıdaki metinleri dikkatlice okuyun ve kutudaki kelimeleri uygun boşluklara yerleştirin.',
    settings: {
      aestheticMode: 'ultra-compact',
      pageFormat: 'A4',
      margins: { top: 15, bottom: 15, left: 12, right: 12 },
      difficulty: difficulty,
      blankType: mode,
      blankCount: itemCount,
      showWordBank: opts.showWordBank !== false,
      compactLayout: true,
      topic: topic,
      ...options
    },
    content: {
      title: `EKSİK PARÇALARI TAMAMLA: ${topic.toUpperCase()}`,
      instruction: 'Aşağıdaki metinleri dikkatlice okuyun ve kutudaki kelimeleri uygun boşluklara yerleştirin.',
      paragraphs: parts,
      wordBank: { words: wordBank }
    }
  }];
};

export default generateOfflineMissingParts;

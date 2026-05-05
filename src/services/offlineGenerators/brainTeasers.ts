import { GeneratorOptions, WorksheetData } from '../../types';
import { getRandomInt } from './helpers';

interface BrainTeaserPuzzle {
  id: string;
  type: 'riddle' | 'lateral_thinking' | 'visual_math' | 'sequence_find';
  category: string;
  difficulty_stars: number;
  q: string;
  hint: string;
  visual: null;
  a: string;
}

interface BrainTeasersData {
  id: string;
  activityType: 'BRAIN_TEASERS';
  title: string;
  instruction: string;
  difficultyLevel: string;
  ageGroup: string;
  profile: string;
  puzzles: BrainTeaserPuzzle[];
}

const riddles = [
  {
    q: "Ben herkesin dilindeyim ama kimse beni tutamaz. Benim neyim?",
    a: "Söz",
    hint: "İletişimle ilgili"
  },
  {
    q: "Ne kadar çok alırsan, o kadar çok bırakırsın. Ben neyim?",
    a: "Adım",
    hint: "Yürüyüşle ilgili"
  },
  {
    q: "Gözleri var ama göremez, ağzı var ama konuşamaz. Bu ne?",
    a: "İğne",
    hint: "Dikişle ilgili"
  }
];

const lateralThinking = [
  {
    q: "Bir odada 3 ampül var. Odanın dışında 3 anahtar var. Sadece bir kez odaya girerek hangi anahtarın hangi ampüle aitini nasıl bulursun?",
    a: "Bir ampülü 5 dakika yak, sonra söndür. İkinci bir ampülü yak. Odaya gir: Sıcak olan ilk anahtar, sönük ama sıcak olan ikinci, yanık olan üçüncü.",
    hint: "Isıyı kullan"
  },
  {
    q: "Bir adam her gün 10. katından asansöre binip iniyor. Dönüşünde sadece yağmur yağdığında veya asansörde başka biri olduğunda 10. kata kadar çıkıyor, yoksa 7. katta inip merdiven çıkıyor. Neden?",
    a: "Adam kısa boylu, 10. kat butonuna ulaşamıyor. Yağmurlu günlerde şemsiyesiyle veya bir başkasına bastırıyor.",
    hint: "Boyuyla ilgili"
  }
];

const visualMath = [
  {
    q: "Devamı ne olmalı: 2, 6, 12, 20, 30, ?",
    a: "42 (Her seferinde 4, 6, 8, 10, 12 ekleniyor)",
    hint: "Artan sayılar ekle"
  },
  {
    q: "Saat 3'te iken, akrep ve yelkovan arasındaki açı kaç derecedir?",
    a: "90 derece",
    hint: "Saatin matematiğini düşün"
  }
];

const sequenceFind = [
  {
    q: "Dizi: △, ○, □, △, ○, ? Sonraki şekil ne?",
    a: "□ (Üçgenli döngü tekrar ediyor)",
    hint: "Tekrarlayan desen"
  },
  {
    q: "A, C, F, J, O, ? Sonraki harf ne?",
    a: "U (A'dan C'ye 2, C'den F'ye 3, F'den J'ye 4, J'den O'ya 5, O'dan U'ya 6)",
    hint: "Artan farklar"
  }
];

export const generateOfflineBrainTeasers = async (options: GeneratorOptions): Promise<WorksheetData[]> => {
  const {
    worksheetCount = 1,
    difficulty = 'Orta',
    itemCount = 6,
    ageGroup = '8-10',
    profile = 'general'
  } = options;

  const pages: BrainTeasersData[] = [];

  for (let p = 0; p < worksheetCount; p++) {
    const puzzles: BrainTeaserPuzzle[] = [];
    
    // Her kategoriden en az 1 tane seç
    const selectedRiddles = [...riddles].sort(() => 0.5 - Math.random()).slice(0, Math.ceil(itemCount / 4));
    const selectedLateral = [...lateralThinking].sort(() => 0.5 - Math.random()).slice(0, Math.ceil(itemCount / 4));
    const selectedMath = [...visualMath].sort(() => 0.5 - Math.random()).slice(0, Math.ceil(itemCount / 4));
    const selectedSequence = [...sequenceFind].sort(() => 0.5 - Math.random()).slice(0, Math.ceil(itemCount / 4));

    const allPuzzles = [
      ...selectedRiddles.map((p, i) => ({ ...p, id: `riddle-${i}`, type: 'riddle' as const, category: 'Dil', difficulty_stars: 2 })),
      ...selectedLateral.map((p, i) => ({ ...p, id: `lateral-${i}`, type: 'lateral_thinking' as const, category: 'Mantık', difficulty_stars: 3 })),
      ...selectedMath.map((p, i) => ({ ...p, id: `math-${i}`, type: 'visual_math' as const, category: 'Sayı', difficulty_stars: 3 })),
      ...selectedSequence.map((p, i) => ({ ...p, id: `seq-${i}`, type: 'sequence_find' as const, category: 'Görsel', difficulty_stars: 2 }))
    ];

    // Rastgele sırala ve istenen sayıda al
    puzzles.push(...allPuzzles.sort(() => 0.5 - Math.random()).slice(0, itemCount));

    pages.push({
      id: `brain-teasers-${p}`,
      activityType: 'BRAIN_TEASERS',
      title: 'Kafayı Çalıştır: Zeka Oyunları',
      instruction: 'Soruları dikkatlice oku ve yaratıcı düşünerek çöz.',
      difficultyLevel: difficulty,
      ageGroup: ageGroup,
      profile: profile,
      puzzles: puzzles.map((puzzle, i) => ({
        ...puzzle,
        id: `p${i + 1}`,
        visual: null
      }))
    });
  }

  return pages as WorksheetData[];
};

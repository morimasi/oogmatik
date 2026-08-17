import { GeneratorOptions, WorksheetData } from '../../types';
import { getRandomInt, shuffle } from './helpers';

export interface BrainTeaserPuzzle {
  id: string;
  type: 'riddle' | 'lateral_thinking' | 'visual_math' | 'sequence_find' | 'matchstick' | 'crypto_code';
  category: 'Dil' | 'Mantık' | 'Sayı' | 'Görsel' | 'Şifre' | 'Kibrit';
  difficulty_stars: number;
  q: string;
  hint: string;
  visual: string | null;
  a: string;
  codePattern?: string[];
}

export interface BrainTeasersData {
  id: string;
  activityType: 'BRAIN_TEASERS';
  title: string;
  instruction: string;
  difficultyLevel: string;
  ageGroup: string;
  profile: string;
  puzzles: BrainTeaserPuzzle[];
  settings?: {
    layoutCols?: 2 | 3;
    showHints?: boolean;
    cardStyle?: 'modern' | 'compact' | 'playful';
  };
}

const riddles = [
  { q: "Ben herkesin dilindeyim ama kimse beni tutamaz. Benim neyim?", a: "Söz", hint: "İletişimle ilgili" },
  { q: "Ne kadar çok alırsan, o kadar çok bırakırsın. Ben neyim?", a: "Adım", hint: "Yürüyüşle ilgili" },
  { q: "Gözleri var ama göremez, ağzı var ama konuşamaz. Bu ne?", a: "İğne", hint: "Dikişle ilgili" },
  { q: "Delikleri olmasına rağmen su tutabilen şey nedir?", a: "Sünger", hint: "Temizlikle ilgili" },
  { q: "Düştüğünde asla kırılmaz ama suya girince dağılır. Nedir bu?", a: "Kağıt", hint: "Yazı yazmakla ilgili" },
  { q: "Sana aittir ama başkaları onu senden daha çok kullanır. Nedir o?", a: "İsmin", hint: "Kimliğinle ilgili" },
  { q: "Sabahları dört, öğlenleri iki, akşamları üç ayakla yürüyen nedir?", a: "İnsan", hint: "Hayat evreleri" },
  { q: "Benim ağzım yok ama fısıldarım. Kanatlarım yok ama uçarım. Ben neyim?", a: "Rüzgar", hint: "Hava durumu" },
  { q: "Hiçbir şey yemem ama sürekli büyürüm. Sudan korkarım. Ben neyim?", a: "Ateş", hint: "Sıcaklıkla ilgili" },
  { q: "Kolu var eli yok, yakası var başı yok. Bu nedir?", a: "Gömlek", hint: "Giyim" }
];

const lateralThinking = [
  { q: "Bir odada 3 ampül var. Odanın dışında 3 anahtar var. Sadece bir kez odaya girerek hangi anahtarın hangi ampüle aitini nasıl bulursun?", a: "Birinciyi 5 dk yak, kapat. İkinciyi yak. Odaya gir: Sıcak olan ilk, yanan ikinci, soğuk üçüncü.", hint: "Isıyı düşün" },
  { q: "Adam her gün asansörle 10'dan iner, dönüşte sadece yağmurlu günlerde 10'a çıkar. Neden?", a: "Adam kısadır. Sadece şemsiyesi olduğunda 10. düğmeye basabilir.", hint: "Fiziksel bir engel" },
  { q: "Siyah bir köpeğin üzerine siyah bir arabayla geliyorsun. Farın kapalı. Köpeğe çarpmadan nasıl durabildin?", a: "Gündüz vaktiydi.", hint: "Zamanla ilgili" },
  { q: "Pencere temizleyicisi 50 katlı binanın dış camını silerken düşer ama yaralanmaz. Nasıl?", a: "Zemin katta temizlik yapıyordu.", hint: "Yükseklik detayı" },
  { q: "İki baba ve iki oğul balık tutar. Her biri 1 balık tutar ama toplam 3 balık vardır. Nasıl?", a: "Dede, baba ve oğul gitmiştir.", hint: "Akrabalık zinciri" }
];

const visualMath = [
  { q: "Devamı ne olmalı: 2, 6, 12, 20, 30, ?", a: "42 (Sırayla +4, +6, +8, +10, +12)", hint: "Artan farklar" },
  { q: "Saat 3'te iken, akrep ve yelkovan arasındaki açı kaç derecedir?", a: "90 derece", hint: "Saat kadranı" },
  { q: "1, 1, 2, 3, 5, 8, 13 serisinin devamı nedir?", a: "21 (Fibonacci dizisi)", hint: "Önceki iki sayı" },
  { q: "Şu seride eksik sayı nedir? 3, 9, 27, 81, ?", a: "243 (x3 katlanıyor)", hint: "Çarpım" },
  { q: "Eğer 3 kedi 3 fareyi 3 dakikada yakalarsa, 100 kedi 100 fareyi kaç dakikada yakalar?", a: "3 dakikada", hint: "Birim zaman" }
];

const matchstickPuzzles = [
  { q: "VI + IV = IX (Kibrit denklemi yanlış). Sadece 1 kibritin yerini değiştirerek eşitliği sağla!", a: "VI + IV = X yap veya VI + V = XI", hint: "Romen rakamlarını hatırla" },
  { q: "3 kibrit çöpüyle 6 sayısını nasıl elde edersin?", a: "Kibritlerle 'VI' Romen rakamı yazarak", hint: "Sembolik düşün" },
  { q: "4 kibrik çöpüyle 2 kare oluşturabilir misin?", a: "Bir karenin içine çapraz dizerek", hint: "Geometrik çakışma" },
  { q: "9 - 5 = 8 denkleminde 1 kibrit hareket ettirerek doğru denklemi kur.", a: "9 - 3 = 6 veya 8 - 2 = 6 yap", hint: "Rakamların çizgileri" }
];

const cryptoCodes = [
  { q: "Gizli Şifre: A=1, B=2, C=3 ise 'Z-E-K-A' kelimesinin sayısal toplamı kaçtır?", a: "Z(29)+E(6)+K(14)+A(1) = 50", hint: "Alfabe sırası" },
  { q: "Şifreli kelime: 'K-A-L-E-M' -> 'L-B-M-F-N' şeklinde kodlandıysa 'B-İ-L-G-İ' nasıl kodlanır?", a: "C-J-M-Ğ-J (+1 harf kaydırma)", hint: "Sezar şifrelemesi" },
  { q: "Ters Kod: 'A-K-I-L' kelimesi 'L-I-K-A' ise 'Z-E-K-A' nasıl yazılır?", a: "A-K-E-Z", hint: "Ayna yansıması" }
];

export const generateOfflineBrainTeasers = async (options: GeneratorOptions): Promise<WorksheetData[]> => {
  const customSettings = (options as any).brainTeasers || {};
  const {
    worksheetCount = 1,
    difficulty = 'Orta',
    itemCount = customSettings.puzzleCount || 8,
    ageGroup = '8-10',
  } = options;

  const selectedCategories = customSettings.selectedCategories || ['Dil', 'Mantık', 'Sayı', 'Görsel', 'Şifre', 'Kibrit'];

  const pages: BrainTeasersData[] = [];

  for (let p = 0; p < worksheetCount; p++) {
    const puzzlePool: Array<Omit<BrainTeaserPuzzle, 'id' | 'difficulty_stars'>> = [];

    if (selectedCategories.includes('Dil')) {
      puzzlePool.push(...riddles.map(q => ({ ...q, type: 'riddle' as const, category: 'Dil' as const, visual: '🔍' })));
    }
    if (selectedCategories.includes('Mantık')) {
      puzzlePool.push(...lateralThinking.map(q => ({ ...q, type: 'lateral_thinking' as const, category: 'Mantık' as const, visual: '🧠' })));
    }
    if (selectedCategories.includes('Sayı')) {
      puzzlePool.push(...visualMath.map(q => ({ ...q, type: 'visual_math' as const, category: 'Sayı' as const, visual: '🔢' })));
    }
    if (selectedCategories.includes('Kibrit')) {
      puzzlePool.push(...matchstickPuzzles.map(q => ({ ...q, type: 'matchstick' as const, category: 'Kibrit' as const, visual: '🥢' })));
    }
    if (selectedCategories.includes('Şifre')) {
      puzzlePool.push(...cryptoCodes.map(q => ({ ...q, type: 'crypto_code' as const, category: 'Şifre' as const, visual: '🔐' })));
    }

    if (puzzlePool.length === 0) {
      puzzlePool.push(...riddles.map(q => ({ ...q, type: 'riddle' as const, category: 'Dil' as const, visual: '🔍' })));
    }

    const shuffled = shuffle([...puzzlePool]);
    const selected = shuffled.slice(0, itemCount);

    pages.push({
      id: `brain-teasers-${p}-${Date.now()}`,
      activityType: 'BRAIN_TEASERS',
      title: 'Kafayı Çalıştır: Zeka & Mantık Atölyesi',
      instruction: 'Zekanı konuştur! Bilmeceleri çöz, şifreleri kır ve mantık bulmacalarını aydınlat.',
      difficultyLevel: difficulty,
      ageGroup: ageGroup as any,
      profile: (options as any).profile || 'general',
      puzzles: selected.map((puzzle, i) => ({
        ...puzzle,
        id: `p${i + 1}`,
        difficulty_stars: getRandomInt(1, 3),
        hint: customSettings.showHints !== false ? puzzle.hint : ''
      })),
      settings: {
        layoutCols: customSettings.layoutCols || (itemCount > 8 ? 3 : 2),
        showHints: customSettings.showHints !== false,
        cardStyle: customSettings.cardStyle || 'modern'
      }
    });
  }

  return pages as unknown as WorksheetData[];
};

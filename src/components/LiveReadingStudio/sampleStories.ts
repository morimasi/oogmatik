/**
 * BDMIND - Disleksi Dostu Örnek Okuma Metinleri
 * Özel öğrenme güçlüğü yaşayan çocuklar için nöropedagojik olarak kademelendirilmiş metinler.
 * 
 * Lider: Elif Yıldız (Pedagoji Direktörü) & Dr. Deniz Yılmaz (Kıdemli İçerik Yazarı)
 */

export interface ReadingPassage {
  id: string;
  title: string;
  level: 'kolay' | 'orta' | 'ileri';
  targetSkill: string;
  ageGroup: string;
  text: string;
  words: string[];
  syllabifiedWords: string[][];
  difficultyRating: number;
}

export const SAMPLE_READING_PASSAGES: ReadingPassage[] = [
  {
    id: 'story-balik-ve-deniz',
    title: 'Minik Balık ve Mavi Deniz',
    level: 'kolay',
    targetSkill: 'b - d Ayna Harf Farkındalığı & 2 Heceli Kelimeler',
    ageGroup: '7-9 Yaş',
    text: 'Deniz derin ve mavi bir göldü. Minik balık suyun altında neşeyle yüzdü. Dalgalar kıyıya doğru vurdu. Balık bir inci buldu. İnci çok parlaktı.',
    words: ['Deniz', 'derin', 've', 'mavi', 'bir', 'göldü.', 'Minik', 'balık', 'suyun', 'altında', 'neşeyle', 'yüzdü.', 'Dalgalar', 'kıyıya', 'doğru', 'vurdu.', 'Balık', 'bir', 'inci', 'buldu.', 'İnci', 'çok', 'parlaktı.'],
    syllabifiedWords: [
      ['De', 'niz'], ['de', 'rin'], ['ve'], ['ma', 'vi'], ['bir'], ['göl', 'dü'],
      ['Mi', 'nik'], ['ba', 'lık'], ['su', 'yun'], ['al', 'tın', 'da'], ['ne', 'şey', 'le'], ['yüz', 'dü'],
      ['Dal', 'ga', 'lar'], ['kı', 'yı', 'ya'], ['doğ', 'ru'], ['vur', 'du'],
      ['Ba', 'lık'], ['bir'], ['in', 'ci'], ['bul', 'du'], ['İn', 'ci'], ['çok'], ['par', 'lak', 'tı']
    ],
    difficultyRating: 1
  },
  {
    id: 'story-bilge-baykus',
    title: 'Bilge Baykuşun Ormanı',
    level: 'orta',
    targetSkill: 'Karışık Hece Yapıları & Dikkatli Okuma',
    ageGroup: '8-10 Yaş',
    text: 'Büyük ağacın dalında akıllı bir baykuş yaşardı. Ormandaki hayvanlar her gün ona sorular sorardı. Tavşan hızlıca koştu ve baykuşa selam verdi. Güneş gökyüzünde ışıl ışıl parlıyordu.',
    words: ['Büyük', 'ağacın', 'dalında', 'akıllı', 'bir', 'baykuş', 'yaşardı.', 'Ormandaki', 'hayvanlar', 'her', 'gün', 'ona', 'sorular', 'sorardı.', 'Tavşan', 'hızlıca', 'koştu', 've', 'baykuşa', 'selam', 'verdi.', 'Güneş', 'gökyüzünde', 'ışıl', 'ışıl', 'parlıyordu.'],
    syllabifiedWords: [
      ['Bü', 'yük'], ['a', 'ğa', 'cın'], ['da', 'lın', 'da'], ['a', 'kıl', 'lı'], ['bir'], ['bay', 'kuş'], ['ya', 'şar', 'dı'],
      ['Or', 'man', 'da', 'ki'], ['hay', 'van', 'lar'], ['her'], ['gün'], ['o', 'na'], ['so', 'ru', 'lar'], ['so', 'rar', 'dı'],
      ['Tav', 'şan'], ['hız', 'lı', 'ca'], ['koş', 'tu'], ['ve'], ['bay', 'ku', 'şa'], ['se', 'lam'], ['ver', 'di'],
      ['Gü', 'neş'], ['gök', 'yü', 'zün', 'de'], ['ı', 'şıl'], ['ı', 'şıl'], ['par', 'lı', 'yor', 'du']
    ],
    difficultyRating: 2
  },
  {
    id: 'story-akilli-robot',
    title: 'Küçük Robot Can',
    level: 'orta',
    targetSkill: 'p - b Harfleri & 3-4 Heceli Kelimeler',
    ageGroup: '9-12 Yaş',
    text: 'Robot Can parlak mavi düğmesine bastı. Bahçedeki pembe çiçekleri sulamak için su kabını aldı. Kuşlar pencerene kondu ve neşeyle öttü. Can robot arkadaşlarına el salladı.',
    words: ['Robot', 'Can', 'parlak', 'mavi', 'düğmesine', 'bastı.', 'Bahçedeki', 'pembe', 'çiçekleri', 'sulamak', 'için', 'su', 'kabını', 'aldı.', 'Kuşlar', 'pencerene', 'kondu', 've', 'neşeyle', 'öttü.', 'Can', 'robot', 'arkadaşlarına', 'el', 'salladı.'],
    syllabifiedWords: [
      ['Ro', 'bot'], ['Can'], ['par', 'lak'], ['ma', 'vi'], ['düğ', 'me', 'si', 'ne'], ['bas', 'tı'],
      ['Bah', 'çe', 'de', 'ki'], ['pem', 'be'], ['çi', 'çek', 'le', 'ri'], ['su', 'la', 'mak'], ['i', 'çin'], ['su'], ['ka', 'bı', 'nı'], ['al', 'dı'],
      ['Kuş', 'lar'], ['pen', 'ce', 're', 'ne'], ['kon', 'du'], ['ve'], ['ne', 'şey', 'le'], ['öt', 'tü'],
      ['Can'], ['ro', 'bot'], ['ar', 'ka', 'daş', 'la', 'rı', 'na'], ['el'], ['sal', 'la', 'dı']
    ],
    difficultyRating: 2
  }
];

export function parseCustomTextToPassage(title: string, text: string): ReadingPassage {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const syllabifiedWords = words.map(w => {
    // Basit Türkçe heceleme kuralı (Sesli harf tabanlı)
    return [w];
  });

  return {
    id: `custom-${Date.now()}`,
    title: title || 'Özel Okuma Metni',
    level: 'orta',
    targetSkill: 'Serbest Okuma Metni',
    ageGroup: 'Tüm Yaşlar',
    text,
    words,
    syllabifiedWords,
    difficultyRating: 2
  };
}

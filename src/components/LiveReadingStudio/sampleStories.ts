/**
 * BDMIND - Disleksi Dostu Örnek Okuma Metinleri ve Türkçe Heceleme Motoru
 * Özel öğrenme güçlüğü yaşayan çocuklar için nöropedagojik olarak kademelendirilmiş metinler.
 * 
 * Liderler: Elif Yıldız (Pedagoji Direktörü) & Dr. Deniz Yılmaz (Kıdemli İçerik Yazarı)
 */

export interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

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
  comprehensionQuestions?: ComprehensionQuestion[];
}

const TURKISH_VOWELS = new Set([
  'a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü', 'â', 'î', 'û',
  'A', 'E', 'I', 'İ', 'O', 'Ö', 'U', 'Ü', 'Â', 'Î', 'Û'
]);

/**
 * Türk Dil Kurumu standartlarına uygun fonetik heceleme motoru.
 * Herhangi bir Türkçe kelimeyi sesli-sessiz kurallarına göre hecelerine ayırır.
 */
export function syllabifyTurkishWord(rawWord: string): string[] {
  const match = rawWord.match(/^([^a-zA-ZçÇğĞıİöÖşŞüÜâîûÂÎÛ]*)(.*?)([^a-zA-ZçÇğĞıİöÖşŞüÜâîûÂÎÛ]*)$/);
  if (!match) return [rawWord];

  const prefix = match[1];
  const cleanWord = match[2];
  const suffix = match[3];

  if (!cleanWord) return [rawWord];

  const vowelIndices: number[] = [];
  for (let i = 0; i < cleanWord.length; i++) {
    if (TURKISH_VOWELS.has(cleanWord[i])) {
      vowelIndices.push(i);
    }
  }

  if (vowelIndices.length <= 1) {
    return [prefix + cleanWord + suffix];
  }

  const cuts: number[] = [0];

  for (let v = 0; v < vowelIndices.length - 1; v++) {
    const v1 = vowelIndices[v];
    const v2 = vowelIndices[v + 1];
    const consonantCount = v2 - v1 - 1;

    if (consonantCount === 0) {
      cuts.push(v1 + 1);
    } else if (consonantCount === 1) {
      cuts.push(v1 + 1);
    } else if (consonantCount === 2) {
      cuts.push(v1 + 2);
    } else {
      cuts.push(v2 - 1);
    }
  }

  cuts.push(cleanWord.length);

  const syllables: string[] = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    const start = cuts[i];
    const end = cuts[i + 1];
    syllables.push(cleanWord.slice(start, end));
  }

  if (syllables.length > 0) {
    syllables[0] = prefix + syllables[0];
    syllables[syllables.length - 1] = syllables[syllables.length - 1] + suffix;
  }

  return syllables;
}

export const SAMPLE_READING_PASSAGES: ReadingPassage[] = [
  {
    id: 'story-balik-ve-deniz',
    title: 'Minik Balık ve Mavi Deniz',
    level: 'kolay',
    targetSkill: 'b - d Ayna Harf Farkındalığı & 2 Heceli Kelimeler',
    ageGroup: '1. Sınıf (6-8 Yaş)',
    text: 'Deniz derin ve mavi bir göldü. Minik balık suyun altında neşeyle yüzdü. Dalgalar kıyıya doğru vurdu. Balık bir inci buldu. İnci çok parlaktı.',
    words: ['Deniz', 'derin', 've', 'mavi', 'bir', 'göldü.', 'Minik', 'balık', 'suyun', 'altında', 'neşeyle', 'yüzdü.', 'Dalgalar', 'kıyıya', 'doğru', 'vurdu.', 'Balık', 'bir', 'inci', 'buldu.', 'İnci', 'çok', 'parlaktı.'],
    syllabifiedWords: [
      ['De', 'niz'], ['de', 'rin'], ['ve'], ['ma', 'vi'], ['bir'], ['göl', 'dü.'],
      ['Mi', 'nik'], ['ba', 'lık'], ['su', 'yun'], ['al', 'tın', 'da'], ['ne', 'şey', 'le'], ['yüz', 'dü.'],
      ['Dal', 'ga', 'lar'], ['kı', 'yı', 'ya'], ['doğ', 'ru'], ['vur', 'du.'],
      ['Ba', 'lık'], ['bir'], ['in', 'ci'], ['bul', 'du.'], ['İn', 'ci'], ['çok'], ['par', 'lak', 'tı.']
    ],
    difficultyRating: 1,
    comprehensionQuestions: [
      {
        id: 'q1',
        question: 'Minik balık suyun altında ne buldu?',
        options: ['Mavi bir taş', 'Parlak bir inci', 'Yeşil yosun', 'Eski bir kutu'],
        correctIndex: 1,
        explanation: 'Metinde "Balık bir inci buldu. İnci çok parlaktı." ifadesi yer alır.'
      },
      {
        id: 'q2',
        question: 'Balık suyun altında nasıl yüzüyordu?',
        options: ['Korkuyla', 'Hızlıca kaçarak', 'Neşeyle', 'Yorulup durarak'],
        correctIndex: 2,
        explanation: 'Metinde minik balığın "neşeyle yüzdüğü" belirtilmektedir.'
      }
    ]
  },
  {
    id: 'story-tavsan-pitircik',
    title: 'Tavşan Pıtırcık ve Havuçlar',
    level: 'kolay',
    targetSkill: 'p - b - d Fonem Ayırt Etme & Kısa Cümleler',
    ageGroup: '1-2. Sınıf (7-9 Yaş)',
    text: 'Pıtırcık sevimli beyaz bir tavşandı. Bahçede taze turuncu havuçlar gördü. Pıt pıt zıplayarak çitlerin altından geçti. Bir havuç aldı ve çıtır çıtır yedi. Güneş ona gülümsedi.',
    words: ['Pıtırcık', 'sevimli', 'beyaz', 'bir', 'tavşandı.', 'Bahçede', 'taze', 'turuncu', 'havuçlar', 'gördü.', 'Pıt', 'pıt', 'zıplayarak', 'çitlerin', 'altından', 'geçti.', 'Bir', 'havuç', 'aldı', 've', 'çıtır', 'çıtır', 'yedi.', 'Güneş', 'ona', 'gülümsedi.'],
    syllabifiedWords: [
      ['Pı', 'tır', 'cık'], ['se', 'vim', 'li'], ['be', 'yaz'], ['bir'], ['tav', 'şan', 'dı.'],
      ['Bah', 'çe', 'de'], ['ta', 'ze'], ['tu', 'run', 'cu'], ['ha', 'vuç', 'lar'], ['gör', 'dü.'],
      ['Pıt'], ['pıt'], ['zıp', 'la', 'ya', 'rak'], ['çit', 'le', 'rin'], ['al', 'tın', 'dan'], ['geç', 'ti.'],
      ['Bir'], ['ha', 'vuç'], ['al', 'dı'], ['ve'], ['çı', 'tır'], ['çı', 'tır'], ['ye', 'di.'],
      ['Gü', 'neş'], ['o', 'na'], ['gü', 'lüm', 'se', 'di.']
    ],
    difficultyRating: 1,
    comprehensionQuestions: [
      {
        id: 'q1',
        question: 'Pıtırcık çitlerin altından nasıl geçti?',
        options: ['Sürünerek', 'Pıt pıt zıplayarak', 'Koşarak', 'Uçarak'],
        correctIndex: 1,
        explanation: 'Pıtırcık bahçeye pıt pıt zıplayarak geçmiştir.'
      },
      {
        id: 'q2',
        question: 'Pıtırcık bahçede ne gördü?',
        options: ['Taze turuncu havuçlar', 'Kırmızı elmalar', 'Mavi çiçekler', 'Yeşil marullar'],
        correctIndex: 0,
        explanation: 'Bahçede taze turuncu havuçlar vardı.'
      }
    ]
  },
  {
    id: 'story-bilge-baykus',
    title: 'Bilge Baykuşun Ormanı',
    level: 'orta',
    targetSkill: 'Karışık Hece Yapıları & Akıcı Okuma Ritmi',
    ageGroup: '2-3. Sınıf (8-10 Yaş)',
    text: 'Büyük ağacın dalında akıllı bir baykuş yaşardı. Ormandaki hayvanlar her gün ona sorular sorardı. Tavşan hızlıca koştu ve baykuşa selam verdi. Güneş gökyüzünde ışıl ışıl parlıyordu.',
    words: ['Büyük', 'ağacın', 'dalında', 'akıllı', 'bir', 'baykuş', 'yaşardı.', 'Ormandaki', 'hayvanlar', 'her', 'gün', 'ona', 'sorular', 'sorardı.', 'Tavşan', 'hızlıca', 'koştu', 've', 'baykuşa', 'selam', 'verdi.', 'Güneş', 'gökyüzünde', 'ışıl', 'ışıl', 'parlıyordu.'],
    syllabifiedWords: [
      ['Bü', 'yük'], ['a', 'ğa', 'cın'], ['da', 'lın', 'da'], ['a', 'kıl', 'lı'], ['bir'], ['bay', 'kuş'], ['ya', 'şar', 'dı.'],
      ['Or', 'man', 'da', 'ki'], ['hay', 'van', 'lar'], ['her'], ['gün'], ['o', 'na'], ['so', 'ru', 'lar'], ['so', 'rar', 'dı.'],
      ['Tav', 'şan'], ['hız', 'lı', 'ca'], ['koş', 'tu'], ['ve'], ['bay', 'ku', 'şa'], ['se', 'lam'], ['ver', 'di.'],
      ['Gü', 'neş'], ['gök', 'yü', 'zün', 'de'], ['ı', 'şıl'], ['ı', 'şıl'], ['par', 'lı', 'yor', 'du.']
    ],
    difficultyRating: 2,
    comprehensionQuestions: [
      {
        id: 'q1',
        question: 'Ormandaki hayvanlar baykuşa neden geliyordu?',
        options: ['Yemek istemek için', 'Ona sorular sormak için', 'Oyun oynamak için', 'Şarkı söylemek için'],
        correctIndex: 1,
        explanation: 'Baykuş akıllı olduğu için hayvanlar ona sorular sormaya geliyordu.'
      }
    ]
  },
  {
    id: 'story-akilli-robot',
    title: 'Küçük Robot Can ve Mavi Kuş',
    level: 'orta',
    targetSkill: 'p - b Harfleri & 3-4 Heceli Kelimeler',
    ageGroup: '3-4. Sınıf (9-11 Yaş)',
    text: 'Robot Can parlak mavi düğmesine bastı. Bahçedeki pembe çiçekleri sulamak için su kabını aldı. Kuşlar pencerene kondu ve neşeyle öttü. Can robot arkadaşlarına el salladı.',
    words: ['Robot', 'Can', 'parlak', 'mavi', 'düğmesine', 'bastı.', 'Bahçedeki', 'pembe', 'çiçekleri', 'sulamak', 'için', 'su', 'kabını', 'aldı.', 'Kuşlar', 'pencerene', 'kondu', 've', 'neşeyle', 'öttü.', 'Can', 'robot', 'arkadaşlarına', 'el', 'salladı.'],
    syllabifiedWords: [
      ['Ro', 'bot'], ['Can'], ['par', 'lak'], ['ma', 'vi'], ['düğ', 'me', 'si', 'ne'], ['bas', 'tı.'],
      ['Bah', 'çe', 'de', 'ki'], ['pem', 'be'], ['çi', 'çek', 'le', 'ri'], ['su', 'la', 'mak'], ['i', 'çin'], ['su'], ['ka', 'bı', 'nı'], ['al', 'dı.'],
      ['Kuş', 'lar'], ['pen', 'ce', 're', 'ne'], ['kon', 'du'], ['ve'], ['ne', 'şey', 'le'], ['öt', 'tü.'],
      ['Can'], ['ro', 'bot'], ['ar', 'ka', 'daş', 'la', 'rı', 'na'], ['el'], ['sal', 'la', 'dı.']
    ],
    difficultyRating: 2,
    comprehensionQuestions: [
      {
        id: 'q1',
        question: 'Can bahçedeki çiçekleri sulamak için neyi aldı?',
        options: ['Hortumu', 'Su kabını', 'Sarı kovayı', 'Büyük şişeyi'],
        correctIndex: 1,
        explanation: 'Can bahçedeki pembe çiçekleri sulamak için su kabını aldı.'
      }
    ]
  },
  {
    id: 'story-deniz-feneri',
    title: 'Gizemli Deniz Feneri ve Efe',
    level: 'ileri',
    targetSkill: 'Prozodi, Vurgu ve Noktalama İşaretleri Takibi',
    ageGroup: '4-5. Sınıf (10-12 Yaş)',
    text: 'Kıyıdaki eski deniz feneri geceleri karanlık suları aydınlatırdı. Efe elindeki dürbünle açıkta süzülen gemilere baktı. Kaptanın ışıkla verdiği teşekkür sinyalini görünce yüzünde sıcacık bir tebessüm belirdi. Deniz dalgaları sakince sahile vurdu.',
    words: ['Kıyıdaki', 'eski', 'deniz', 'feneri', 'geceleri', 'karanlık', 'suları', 'aydınlatırdı.', 'Efe', 'elindeki', 'dürbünle', 'açıkta', 'süzülen', 'gemilere', 'baktı.', 'Kaptanın', 'ışıkla', 'verdiği', 'teşekkür', 'sinyalini', 'görünce', 'yüzünde', 'sıcacık', 'bir', 'tebessüm', 'belirdi.', 'Deniz', 'dalgaları', 'sakince', 'sahile', 'vurdu.'],
    syllabifiedWords: [
      ['Kı', 'yı', 'da', 'ki'], ['es', 'ki'], ['de', 'niz'], ['fe', 'ne', 'ri'], ['ge', 'ce', 'le', 'ri'], ['ka', 'ran', 'lık'], ['su', 'la', 'rı'], ['ay', 'dın', 'la', 'tır', 'dı.'],
      ['E', 'fe'], ['e', 'lin', 'de', 'ki'], ['dür', 'bün', 'le'], ['a', 'çık', 'ta'], ['sü', 'zü', 'len'], ['ge', 'mi', 'le', 're'], ['bak', 'tı.'],
      ['Kap', 'ta', 'nın'], ['ı', 'şık', 'la'], ['ver', 'di', 'ği'], ['te', 'şek', 'kür'], ['sin', 'ya', 'li', 'ni'], ['gö', 'rün', 'ce'], ['yü', 'zün', 'de'], ['sı', 'ca', 'cık'], ['bir'], ['te', 'bes', 'süm'], ['be', 'lir', 'di.'],
      ['De', 'niz'], ['dal', 'ga', 'la', 'rı'], ['sa', 'kin', 'ce'], ['sa', 'hi', 'le'], ['vur', 'du.']
    ],
    difficultyRating: 3,
    comprehensionQuestions: [
      {
        id: 'q1',
        question: 'Efe gemileri ne ile izliyordu?',
        options: ['Teleskopla', 'Gözlükle', 'Elindeki dürbünle', 'Fenerin penceresinden çıplak gözle'],
        correctIndex: 2,
        explanation: 'Efe elindeki dürbünle açıkta süzülen gemilere baktı.'
      }
    ]
  },
  {
    id: 'story-kutup-ayisi',
    title: "Kutup Ayısı Boni'nin Keşfi",
    level: 'ileri',
    targetSkill: 'Hızlı ve Doğru Okuma (WCPM) & Akademik Sözcük Dağarcığı',
    ageGroup: '5-8. Sınıf (11-14 Yaş)',
    text: 'Buzulların arasında yaşayan Boni, araştırmacıların bıraktığı renkli bayrakları merakla inceledi. Kutup rüzgarları uğultuyla eserken penguen dostu ona eşlik etti. Birlikte buz dağının zirvesine tırmanıp kuzey ışıklarının büyüleyici dansını izlediler.',
    words: ['Buzulların', 'arasında', 'yaşayan', 'Boni,', 'araştırmacıların', 'bıraktığı', 'renkli', 'bayrakları', 'merakla', 'inceledi.', 'Kutup', 'rüzgarları', 'uğultuyla', 'eserken', 'penguen', 'dostu', 'ona', 'eşlik', 'etti.', 'Birlikte', 'buz', 'dağının', 'zirvesine', 'tırmanıp', 'kuzey', 'ışıklarının', 'büyüleyici', 'dansını', 'izlediler.'],
    syllabifiedWords: [
      ['Bu', 'zul', 'la', 'rın'], ['a', 'ra', 'sın', 'da'], ['ya', 'şa', 'yan'], ['Bo', 'ni,'], ['a', 'raş', 'tır', 'ma', 'cı', 'la', 'rın'], ['bı', 'rak', 'tı', 'ğı'], ['renk', 'li'], ['bay', 'rak', 'la', 'rı'], ['me', 'rak', 'la'], ['in', 'ce', 'le', 'di.'],
      ['Ku', 'tup'], ['rüz', 'gar', 'la', 'rı'], ['u', 'ğul', 'tuy', 'la'], ['e', 'ser', 'ken'], ['pen', 'gu', 'en'], ['dos', 'tu'], ['o', 'na'], ['eş', 'lik'], ['et', 'ti.'],
      ['Bir', 'lik', 'te'], ['buz'], ['da', 'ğı', 'nın'], ['zir', 've', 'si', 'ne'], ['tır', 'ma', 'nıp'], ['ku', 'zey'], ['ı', 'şık', 'la', 'rı', 'nın'], ['bü', 'yü', 'le', 'yi', 'ci'], ['dan', 'sı', 'nı'], ['iz', 'le', 'di', 'ler.']
    ],
    difficultyRating: 3,
    comprehensionQuestions: [
      {
        id: 'q1',
        question: 'Boni ve dostu zirveye tırmandıklarında neyi izlediler?',
        options: ['Güneşin doğuşunu', 'Kuzey ışıklarının büyüleyici dansını', 'Denizdeki balinaları', 'Kayan yıldızları'],
        correctIndex: 1,
        explanation: 'Buz dağının zirvesine tırmanıp kuzey ışıklarının büyüleyici dansını izlediler.'
      }
    ]
  }
];

export function parseCustomTextToPassage(title: string, text: string): ReadingPassage {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const syllabifiedWords = words.map(w => syllabifyTurkishWord(w));

  return {
    id: `custom-${Date.now()}`,
    title: title || 'Özel Okuma Metni',
    level: 'orta',
    targetSkill: 'Serbest Okuma Metni & Dinamik Heceleme',
    ageGroup: 'Tüm Yaşlar',
    text,
    words,
    syllabifiedWords,
    difficultyRating: 2,
    comprehensionQuestions: []
  };
}

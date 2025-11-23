
import { Activity, ActivityType, ActivityCategory } from './types';

export const ACTIVITIES: Activity[] = [
  // --- KELİME OYUNLARI ---
  {
    id: ActivityType.WORD_SEARCH,
    title: 'Kelime Bulmaca',
    description: 'Verilen kelimeleri harf tablosunda bulun.',
    icon: 'fa-solid fa-search',
  },
  {
    id: ActivityType.ANAGRAM,
    title: 'Anagram',
    description: 'Karışık harflerden anlamlı kelimeler oluşturun.',
    icon: 'fa-solid fa-shuffle',
  },
  {
    id: ActivityType.CROSSWORD,
    title: 'Çapraz Bulmaca',
    description: 'İpuçlarını kullanarak bulmacayı çözün.',
    icon: 'fa-solid fa-border-all',
  },
  {
    id: ActivityType.SPELLING_CHECK,
    title: 'Doğru Yazılışı Bulma',
    description: 'Verilen kelimeler arasından doğru yazılanı seçin.',
    icon: 'fa-solid fa-spell-check',
  },

  // --- MATEMATİK & MANTIK ---
  {
    id: ActivityType.BASIC_OPERATIONS,
    title: 'Dört İşlem',
    description: 'Toplama, çıkarma, çarpma ve bölme alıştırmaları.',
    icon: 'fa-solid fa-calculator',
  },
  {
    id: ActivityType.REAL_LIFE_MATH_PROBLEMS,
    title: 'Matematik Problemleri',
    description: 'Gerçek hayatla ilişkilendirilmiş problemler.',
    icon: 'fa-solid fa-basket-shopping',
  },
  {
    id: ActivityType.MATH_PUZZLE,
    title: 'Matematik Bulmacası',
    description: 'Sembollerle gizlenmiş sayıları bulun.',
    icon: 'fa-solid fa-puzzle-piece',
  },
  {
    id: ActivityType.NUMBER_PATTERN,
    title: 'Sayı Örüntüsü',
    description: 'Sayı dizisindeki kuralı bulup eksik sayıyı tamamlayın.',
    icon: 'fa-solid fa-arrow-trend-up',
  },
  {
    id: ActivityType.NUMBER_PYRAMID,
    title: 'Sayı Piramidi',
    description: 'İşlemlerle piramidin tepesine ulaşın.',
    icon: 'fa-solid fa-layer-group',
  },
  {
    id: ActivityType.SHAPE_SUDOKU,
    title: 'Şekilli Sudoku',
    description: 'Şekilleri tekrar etmeden ızgaraya yerleştirin.',
    icon: 'fa-solid fa-table-cells',
  },
  {
    id: ActivityType.FUTOSHIKI,
    title: 'Futoşiki',
    description: 'Büyüktür/küçüktür ilişkisine göre sayıları dizin.',
    icon: 'fa-solid fa-greater-than-less-than',
  },
  {
    id: ActivityType.LOGIC_GRID_PUZZLE,
    title: 'Mantık Tablosu',
    description: 'İpuçlarını kullanarak tabloyu doldurun ve çözüme ulaşın.',
    icon: 'fa-solid fa-table-list',
  },

  // --- DİKKAT & HAFIZA ---
  {
    id: ActivityType.FIND_THE_DIFFERENCE,
    title: 'Farklı Olanı Bul (Görsel)',
    description: 'Benzer şekiller arasında farklı olanı bulun.',
    icon: 'fa-solid fa-not-equal',
  },
  {
    id: ActivityType.BURDON_TEST,
    title: 'Burdon Dikkat Testi',
    description: 'Belirli harfleri tarayarak bulun ve işaretleyin.',
    icon: 'fa-solid fa-tasks',
  },
  {
    id: ActivityType.VISUAL_MEMORY,
    title: 'Görsel Hafıza',
    description: 'Görselleri aklınızda tutup sonraki sayfada bulun.',
    icon: 'fa-solid fa-eye',
  },
  {
    id: ActivityType.STROOP_TEST,
    title: 'Stroop Testi',
    description: 'Kelimeyi değil, rengi söyleyin.',
    icon: 'fa-solid fa-palette',
  },

  // --- GÖRSEL ALGI ---
  {
    id: ActivityType.GRID_DRAWING,
    title: 'Kare Çizim / Kopyalama',
    description: 'Deseni kareli alana birebir kopyalayın.',
    icon: 'fa-solid fa-vector-square',
  },
  {
    id: ActivityType.SYMMETRY_DRAWING,
    title: 'Simetri Çizimi',
    description: 'Şeklin yansımasını çizerek tamamlayın.',
    icon: 'fa-solid fa-reflect-horizontal',
  },
  {
    id: ActivityType.SHAPE_MATCHING,
    title: 'Şekil Eşleştirme',
    description: 'Aynı şekil gruplarını eşleştirin.',
    icon: 'fa-solid fa-shapes',
  },
  {
    id: ActivityType.ABC_CONNECT,
    title: 'Nokta Birleştirme',
    description: 'Aynı harfleri çizgiler kesişmeden birleştirin.',
    icon: 'fa-solid fa-bezier-curve',
  },
  {
    id: ActivityType.BLOCK_PAINTING,
    title: 'Blok Boyama (Piksel)',
    description: 'Verilen kodlara göre kareleri boyayın.',
    icon: 'fa-solid fa-brush',
  },
  {
    id: ActivityType.VISUAL_ODD_ONE_OUT,
    title: 'Şekillerle Farkı Bul',
    description: 'Görsel kurala uymayan şekli bulun.',
    icon: 'fa-solid fa-circle-exclamation',
  },
  {
    id: ActivityType.SHAPE_COUNTING,
    title: 'Şekil Sayma',
    description: 'Karmaşık desen içindeki belirli şekilleri sayın.',
    icon: 'fa-solid fa-cubes',
  },

  // --- OKUMA & ANLAMA ---
  {
    id: ActivityType.STORY_COMPREHENSION,
    title: 'Hikaye Anlama',
    description: 'Hikayeyi okuyun ve soruları yanıtlayın.',
    icon: 'fa-solid fa-book-open',
  },
  {
    id: ActivityType.STORY_CREATION_PROMPT,
    title: 'Hikaye Oluşturma',
    description: 'Verilen kelimelerle kendi hikayenizi yazın.',
    icon: 'fa-solid fa-pen-fancy',
  },
  {
    id: ActivityType.STORY_SEQUENCING,
    title: 'Olay Sıralama',
    description: 'Olayları oluş sırasına göre dizin.',
    icon: 'fa-solid fa-list-ol',
  },
  {
    id: ActivityType.STORY_ANALYSIS,
    title: 'Hikaye Analizi',
    description: 'Hikayenin unsurlarını (yer, zaman, karakter) inceleyin.',
    icon: 'fa-solid fa-magnifying-glass-chart',
  },

  // --- DİSLEKSİ DESTEK ---
  {
    id: ActivityType.READING_FLOW,
    title: 'Akıcı Okuma',
    description: 'Renklendirilmiş hecelerle okuma çalışması.',
    icon: 'fa-solid fa-align-left',
  },
  {
    id: ActivityType.LETTER_DISCRIMINATION,
    title: 'Harf Ayrımı',
    description: 'Karışan harfleri (b-d, p-q) ayırt etme.',
    icon: 'fa-solid fa-arrow-right-arrow-left',
  },
  {
    id: ActivityType.RAPID_NAMING,
    title: 'Hızlı İsimlendirme (RAN)',
    description: 'Nesneleri hızlıca isimlendirme egzersizi.',
    icon: 'fa-solid fa-stopwatch',
  },
  {
    id: ActivityType.MIRROR_LETTERS,
    title: 'Ayna Harfler',
    description: 'Ters dönmüş harfleri bulma.',
    icon: 'fa-solid fa-retweet',
  },
  {
    id: ActivityType.PHONOLOGICAL_AWARENESS,
    title: 'Fonolojik Farkındalık',
    description: 'Ses ve hece çalışmaları.',
    icon: 'fa-solid fa-ear-listen',
  },
  {
    id: ActivityType.SYLLABLE_TRAIN,
    title: 'Hece Treni',
    description: 'Kelimeleri hecelerine ayırma.',
    icon: 'fa-solid fa-train',
  },
  {
    id: ActivityType.VISUAL_TRACKING_LINES,
    title: 'Görsel Takip',
    description: 'Karmaşık çizgileri gözle takip etme.',
    icon: 'fa-solid fa-route',
  }
];

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  {
    id: 'word-games',
    title: 'Kelime Oyunları',
    description: 'Kelime dağarcığı ve yazım kuralları.',
    icon: 'fa-solid fa-spell-check',
    activities: [
      ActivityType.WORD_SEARCH,
      ActivityType.ANAGRAM,
      ActivityType.CROSSWORD,
      ActivityType.SPELLING_CHECK
    ]
  },
  {
    id: 'math-logic',
    title: 'Matematik & Mantık',
    description: 'Problem çözme ve mantıksal düşünme.',
    icon: 'fa-solid fa-calculator',
    activities: [
      ActivityType.BASIC_OPERATIONS,
      ActivityType.REAL_LIFE_MATH_PROBLEMS,
      ActivityType.MATH_PUZZLE,
      ActivityType.NUMBER_PATTERN,
      ActivityType.NUMBER_PYRAMID,
      ActivityType.SHAPE_SUDOKU,
      ActivityType.FUTOSHIKI,
      ActivityType.LOGIC_GRID_PUZZLE
    ]
  },
  {
    id: 'attention-memory',
    title: 'Dikkat & Hafıza',
    description: 'Odaklanma ve görsel bellek.',
    icon: 'fa-solid fa-brain',
    activities: [
      ActivityType.FIND_THE_DIFFERENCE,
      ActivityType.BURDON_TEST,
      ActivityType.VISUAL_MEMORY,
      ActivityType.STROOP_TEST
    ]
  },
  {
    id: 'visual-perception',
    title: 'Görsel Algı',
    description: 'Görsel ayrıştırma ve kopyalama.',
    icon: 'fa-solid fa-eye',
    activities: [
      ActivityType.GRID_DRAWING,
      ActivityType.SYMMETRY_DRAWING,
      ActivityType.SHAPE_MATCHING,
      ActivityType.ABC_CONNECT,
      ActivityType.BLOCK_PAINTING,
      ActivityType.VISUAL_ODD_ONE_OUT,
      ActivityType.SHAPE_COUNTING
    ]
  },
  {
    id: 'reading-comprehension',
    title: 'Okuma & Anlama',
    description: 'Metin analizi ve yaratıcı yazma.',
    icon: 'fa-solid fa-book-open-reader',
    activities: [
      ActivityType.STORY_COMPREHENSION,
      ActivityType.STORY_CREATION_PROMPT,
      ActivityType.STORY_SEQUENCING,
      ActivityType.STORY_ANALYSIS
    ]
  },
  {
    id: 'dyslexia-support',
    title: 'Özel Öğrenme Desteği',
    description: 'Disleksiye özel yapılandırılmış egzersizler.',
    icon: 'fa-solid fa-hands-holding-circle',
    activities: [
        ActivityType.READING_FLOW,
        ActivityType.LETTER_DISCRIMINATION,
        ActivityType.RAPID_NAMING,
        ActivityType.MIRROR_LETTERS,
        ActivityType.PHONOLOGICAL_AWARENESS,
        ActivityType.SYLLABLE_TRAIN,
        ActivityType.VISUAL_TRACKING_LINES
    ]
  }
];

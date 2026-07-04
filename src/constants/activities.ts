import { Activity, ActivityType } from '../types';

// Activities List
export const ACTIVITIES: Activity[] = [
  {
    id: ActivityType.FIND_LETTER_PAIR,
    title: 'Harf İkilisi Dedektifi',
    description: 'Karışık harfler içinden hedef ikiliyi (heceyi) bulma ve ayırt etme çalışması.',
    icon: 'fa-solid fa-magnifying-glass-chart',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.READING_SUDOKU,
    title: 'Dil ve Mantık Sudokusu',
    description:
      'Harfler, kelimeler veya sembollerle kurgulanmış, disleksi dostu mantıksal akıl yürütme.',
    icon: 'fa-solid fa-table-cells-large',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.SYLLABLE_MASTER_LAB,
    title: 'Hece Ustası Laboratuvarı',
    description:
      'Heceleme, birleştirme, tamamlama and karışık hece oyunları içeren kapsamlı modül.',
    icon: 'fa-solid fa-puzzle-piece',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.READING_STROOP,
    title: 'Sözel Stroop Testi',
    description: 'Renk ve kelime çelişkisi üzerinden dikkat ve sözel enterferans çalışması.',
    icon: 'fa-solid fa-traffic-light',
  },
  {
    id: ActivityType.FAMILY_RELATIONS,
    title: 'Akrabalık İlişkileri',
    description: 'Aile bağlarını tanımlama, eşleştirme ve kategorize etme çalışması.',
    icon: 'fa-solid fa-sitemap',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.FAMILY_LOGIC_TEST,
    title: 'Akrabalık Mantık Testi',
    description: 'Akrabalık bağları üzerinden doğru/yanlış çıkarımı ve mantıksal muhakeme.',
    icon: 'fa-solid fa-user-group',
  },
  {
    id: ActivityType.SYNONYM_ANTONYM_MATCH,
    title: 'Eş ve Zıt Anlamlılar',
    description: 'Kelimeler arası anlamsal ilişkileri kurma ve bağlamda kullanma çalışması.',
    icon: 'fa-solid fa-arrows-spin',
  },
  {
    id: ActivityType.LETTER_VISUAL_MATCHING,
    title: 'Harf-Görsel Eşleme',
    description: 'Harflerin şekillerini ve başlangıç seslerini görsellerle ilişkilendirme.',
    icon: 'fa-solid fa-font',
  },
  {
    id: ActivityType.SYLLABLE_WORD_BUILDER,
    title: 'Hece Dedektifi',
    description: 'Karışık heceleri birleştirerek görselle eşleşen kelimeyi inşa etme.',
    icon: 'fa-solid fa-puzzle-piece',
  },
  {
    id: ActivityType.MAP_INSTRUCTION,
    title: 'Harita Dedektifi',
    description:
      'Türkiye haritası üzerinde yön, konum and harf takibi yaparak yönergeleri uygulama.',
    icon: 'fa-solid fa-map-location-dot',
  },
  {
    id: ActivityType.ALGORITHM_GENERATOR,
    title: 'Algoritma Üretici',
    description: 'Sıralı düşünme ve mantık yürütme becerilerini geliştiren akış şemaları.',
    icon: 'fa-solid fa-code-fork',
  },

  {
    id: ActivityType.HIDDEN_PASSWORD_GRID,
    title: 'Gizli Şifre Matrisi',
    description: 'Izgara içindeki harfleri eleyerek gizli kelimeyi bulma bulmacası.',
    icon: 'fa-solid fa-border-none',
  },
  {
    id: ActivityType.NUMBER_LOGIC_RIDDLES,
    title: 'Sayısal Mantık Bilmeceleri',
    description:
      'Sayıların özellikleri üzerinden miktar ve büyüklük kavramlarını geliştiren mantık oyunları.',
    icon: 'fa-solid fa-brain-circuit',
  },
  {
    id: ActivityType.MATH_PUZZLE,
    title: 'Matematik Bulmacaları',
    description: 'Görsel öğelerle desteklenmiş eğlenceli matematik problemleri.',
    icon: 'fa-solid fa-puzzle-piece',
  },
  {
    id: ActivityType.CLOCK_READING,
    title: 'Saat Okuma',
    description: 'Analog ve dijital saatler arasındaki ilişkiyi kavrama alıştırmaları.',
    icon: 'fa-solid fa-clock',
  },
  {
    id: ActivityType.MONEY_COUNTING,
    title: 'Paralarımız',
    description: 'Madeni ve kağıp paraları tanıma, basit alışveriş hesapları.',
    icon: 'fa-solid fa-money-bill-wave',
  },
  {
    id: ActivityType.MATH_MEMORY_CARDS,
    title: 'Matematik Hafıza Kartları',
    description: 'İşlemler ve sonuçlarını eşleştirerek belleği güçlendiren hafıza oyunu.',
    icon: 'fa-solid fa-clone',
  },
  {
    id: ActivityType.FIND_THE_DIFFERENCE,
    title: 'Farkı Bul',
    description: 'Görsel veya metinsel diziler arasındaki farkları ayırt etme.',
    icon: 'fa-solid fa-eye',
  },
  {
    id: ActivityType.VISUAL_ODD_ONE_OUT,
    title: 'Görsel Farklıyı Bul',
    description: 'Görsel örüntüler içindeki uyumsuz öğeyi tespit etme.',
    icon: 'fa-solid fa-ghost',
  },
  {
    id: ActivityType.GRID_DRAWING,
    title: 'Kare Kopyalama',
    description: 'Izgara üzerindeki desenleri hatasız bir şekilde kopyalama çalışması.',
    icon: 'fa-solid fa-border-all',
  },
  {
    id: ActivityType.SYMMETRY_DRAWING,
    title: 'Simetri Tamamlama',
    description: 'Görselin aynadaki yansımasını çizerek tamamlama çalışması.',
    icon: 'fa-solid fa-mirror',
  },
  {
    id: ActivityType.WORD_SEARCH,
    title: 'Kelime Bulmaca',
    description: 'Karışık harfler arasına gizlenmiş kelimeleri bulma etkinliği.',
    icon: 'fa-solid fa-table-cells',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.SHAPE_COUNTING,
    title: 'Kaç Tane Üçgen Var?',
    description: 'İç içe geçmiş geometrik şekilleri sayarak görsel algıyı güçlendirme.',
    icon: 'fa-solid fa-shapes',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.MORPHOLOGY_MATRIX,
    title: 'Morfolojik Kelime İnşaatı',
    description: 'Kök ve ekleri birleştirerek kelime türetme ve anlamlandırma çalışması.',
    icon: 'fa-solid fa-cubes-stacked',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.READING_PYRAMID,
    title: 'Akıcı Okuma Piramidi',
    description: 'Göz takibini ve okuma hızını geliştiren genişleyen cümleler çalışması.',
    icon: 'fa-solid fa-arrow-down-wide-short',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.NUMBER_PATH_LOGIC,
    title: 'Sembolik İşlem Zinciri',
    description: 'Sembollerin matematiksel değerlerini çözerek mantık zincirini tamamlama.',
    icon: 'fa-solid fa-code-merge',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.DIRECTIONAL_TRACKING,
    title: 'Yönsel İz Sürme (Kod Çözme)',
    description: 'Okları takip ederek ızgaradaki gizli harfleri topla ve kelimeyi bul.',
    icon: 'fa-solid fa-arrow-trend-up',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.ABC_CONNECT,
    title: 'ABC Bağlama (Romenler)',
    description:
      'Romen rakamları ile doğal sayıları ızgara üzerinde yolları kesiştirmeden birleştirin.',
    icon: 'fa-solid fa-draw-polygon',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.ODD_EVEN_SUDOKU,
    title: 'Tek ve Çift Sudoku',
    description: 'Renk kurallarına uygun olarak tek ve çift sayı kısıtlamalı Sudoku mantığı.',
    icon: 'fa-solid fa-table-cells',
    defaultStyle: { columns: 2 },
  },
  {
    id: ActivityType.FUTOSHIKI,
    title: 'Futoşhiki',
    description:
      'Büyüktür ve küçüktür (> <) sembollerini dikkate alarak ızgarayı sayılarla doldurun.',
    icon: 'fa-solid fa-less-than-equal',
    defaultStyle: { columns: 2 },
  },
  {
    id: ActivityType.MAGIC_PYRAMID,
    title: 'Sihirli Piramit',
    description:
      'Tepeden başlayarak ritmik sayma kurallarına göre tabana kadar kesintisiz bir yol bulun.',
    icon: 'fa-solid fa-pyramid',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.CAPSULE_GAME,
    title: 'Kapsül Oyunu',
    description:
      'Izgara dışındaki hedef sayılara ulaşmak için içerdeki kapsülleri doğru rakamlarla doldurun.',
    icon: 'fa-solid fa-capsules',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.FIVE_W_ONE_H,
    title: '5N1K Okuma Anlama Simülatörü',
    description:
      'Özelleştirilebilir metin uzunluğu ve konu seçenekleriyle AI destekli hikaye okuma ve 5N1K kavramsal soruları.',
    icon: 'fa-solid fa-file-signature',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.SENTENCE_5W1H,
    title: 'Cümlede 5N1K',
    description:
      'Tekil cümleler içerisinde Kim, Ne, Nerede gibi temel öğeleri bulmaya odaklanan yüksek yoğunluklu dil çalışması.',
    icon: 'fa-solid fa-quote-left',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.STORY_ANALYSIS,
    title: 'Hikaye Analizi (Ultra Pro)',
    description: 'Okunan metnin ana fikrini, karakterlerini ve olay örgüsünü derinlemesine analiz eden üst düzey anlama çalışması.',
    icon: 'fa-solid fa-magnifying-glass-chart',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.STORY_SEQUENCING,
    title: 'Olay Sıralama (Hikaye)',
    description: 'Karışık verilen olayları mantıksal ve zamansal sıraya koyarak hikaye bütünlüğü oluşturma egzersizi.',
    icon: 'fa-solid fa-list-ol',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.MISSING_PARTS,
    title: 'Eksik Parçaları Tamamlama',
    description: 'Bütünsel algı ve bağlamdan anlam çıkarma becerisi için metindeki veya cümledeki boşlukları mantıklı şekilde doldurma.',
    icon: 'fa-solid fa-puzzle-piece',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.COLORFUL_SYLLABLE_READING,
    title: 'Renkli Hece / Odaklı Okuma',
    description:
      'Disleksi dostu palette hece ve kelime renklendirmesiyle (Di-kkat!) saniye tutulabilecek WPM artırıcı okuma egzersizi.',
    icon: 'fa-solid fa-highlighter',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.FAMILY_TREE_MATRIX,
    title: 'Akrabalık ve Soy Ağacı Matrisi',
    description:
      'Mantıksal çıkarım ve yönergeleri takip ederek soy ağacındaki kayıp aile üyelerini bulma oyunu.',
    icon: 'fa-solid fa-network-wired',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.APARTMENT_LOGIC_PUZZLE,
    title: 'Nerede Oturuyor? (Einstein Apartmanı)',
    description:
      'Komşuluk ilişkilerini, mantıksal zıtlıkları ve yönleri bir araya getiren klasik apartman yerleşim bulmacası.',
    icon: 'fa-solid fa-building',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.FINANCIAL_MARKET_CALCULATOR,
    title: 'Pazar Yeri & Finans',
    description:
      'Diskalkuli için bütçe, para üstü ve alışveriş sepeti hesaplamaları içeren market standı simülasyonu.',
    icon: 'fa-solid fa-store',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.DIRECTIONAL_CODE_READING,
    title: 'Şifreli Kod & Rota',
    description:
      'Oklar ve harflerle verilen algoritmik kodu takip ederek (sağ, sol, yukarı) hedefi bulma oyunu.',
    icon: 'fa-solid fa-map-location-dot',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.LOGIC_ERROR_HUNTER,
    title: 'Mantık Hataları Avcısı',
    description:
      'Paragraf içindeki mantıksal, zamansal veya fiziksel hataları tespit edip düzeltme etkinliği.',
    icon: 'fa-solid fa-bug-slash',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.PATTERN_COMPLETION,
    title: 'Kafayı Çalıştır (Desen Tamamla)',
    description: 'Verilen matris desenlerindeki eksik bloğu/parçayı bulma ve tamamlama mantığı.',
    icon: 'fa-solid fa-puzzle-piece',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.VISUAL_INTERPRETATION,
    title: 'Resim Yorumlama ve Analiz',
    description: 'Görsel sahneleri analiz etme, detayları fark etme ve mantıksal çıkarımlar yapma.',
    icon: 'fa-solid fa-magnifying-glass-plus',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.BRAIN_TEASERS,
    title: 'Kafayı Çalıştır (Zeka Oyunları)',
    description:
      'Farklı zorluk seviyelerinde mantık, dikkat ve problem çözme odaklı zeka soruları.',
    icon: 'fa-solid fa-lightbulb',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.BOX_MATH,
    title: 'Kutularla Matematik',
    description: 'Ters işlem ve yerine koyma mantığıyla cebirsel düşünme ve işlem yeteneği.',
    icon: 'fa-solid fa-box-archive',
    defaultStyle: { columns: 2 },
  },
  {
    id: ActivityType.QUEUE_ORDERING,
    title: 'Sıralama (Sıra Alma Becerisi)',
    description: 'Kuyruk ve sıralama mantığıyla pozisyon, sıra ve göreceli konum belirleme çalışması.',
    icon: 'fa-solid fa-list-ol',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.STORY_COMPREHENSION,
    title: 'Hikaye Kavrama',
    description: 'Okunan hikayeyi anlama, karakterleri tanıma ve olay örgüsünü çözümleme çalışması.',
    icon: 'fa-solid fa-book-open',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.REAL_LIFE_MATH_PROBLEMS,
    title: 'Gerçek Hayat Matematiği',
    description: 'Günlük hayattan alınmış pratik matematik problemleriyle işlemsel düşünme becerilerini geliştirme.',
    icon: 'fa-solid fa-calculator',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.NUMBER_PATTERN,
    title: 'Sayı Örüntüleri',
    description: 'Sayısal dizilerdeki kuralı bularak eksik terimleri tamamlama ve örüntü oluşturma.',
    icon: 'fa-solid fa-chart-line',
    defaultStyle: { columns: 1 },
  },
  {
    id: ActivityType.KENDOKU,
    title: 'Kendoku (İşlem Blokları)',
    description: 'Her bloktaki işlemi kullanarak ızgarayı sayılarla doldurma, mantıksal akıl yürütme oyunu.',
    icon: 'fa-solid fa-border-all',
    defaultStyle: { columns: 2 },
  },
  {
    id: ActivityType.NUMBER_PYRAMID,
    title: 'Sayı Piramidi',
    description: 'Alt bloklardaki sayıları toplayarak/çıkararak piramidi tamamlama, ters işlem ve örüntü çalışması.',
    icon: 'fa-solid fa-pyramid',
    defaultStyle: { columns: 1 },
  },
  // ── İNFOGRAFİK STÜDYOSU v3 — 96 Premium Aktivite (Gruplandırılmış Kayıtlar) ──
  {
    id: ActivityType.INFOGRAPHIC_CONCEPT_MAP,
    title: 'Kavram Haritası (İnfografik)',
    description: 'Konular arası hiyerarşik bağları görselleştiren gelişmiş zihin haritası.',
    icon: 'fa-solid fa-sitemap',
  },
  {
    id: ActivityType.INFOGRAPHIC_5W1H_BOARD,
    title: '5N1K Panosu',
    description: 'Kim, Ne, Nerede, Ne Zaman, Nasıl, Niçin sorularını görsel bir panoda analiz et.',
    icon: 'fa-solid fa-clipboard-question',
  },
  {
    id: ActivityType.INFOGRAPHIC_SHORT_ANSWER,
    title: 'Kısa Cevaplı Sorular (Premium)',
    description: 'Halkalı ve satırlı profesyonel ızgara soru panosu.',
    icon: 'fa-solid fa-list-check',
  },
  {
    id: ActivityType.LETTER_MAZE_TEST,
    title: 'Harf Labirenti Test',
    description: 'Harf labirenti testi.',
    icon: 'fa-solid fa-route',
    defaultStyle: { columns: 1 }
  },
  {
    id: ActivityType.SARI_KITAP_STUDIO,
    title: 'Sarı Kitap Stüdyosu',
    description: 'Öğrenme güçlüğü profil değerlendirmesi ve profesyonel içerik üretimi stüdyosu.',
    icon: 'fa-solid fa-book-medical',
    defaultStyle: { columns: 1 }
  },
  {
    id: ActivityType.SEMANTIC_LINKER,
    title: 'Anlamsal İlişki',
    description: 'Kelimeler arası anlamsal bağ kurma.',
    icon: 'fa-solid fa-link',
    defaultStyle: { columns: 2 }
  },
  {
    id: ActivityType.LETTER_CONNECT,
    title: 'Harf Bağlama',
    description: 'Öğrencilerin görsel ayrımsama yeteneğini geliştiren eğlenceli bir harf-ses eşleştirme etkinliği.',
    icon: 'fa-solid fa-link',
    defaultStyle: { columns: 1 }
  },
  {
    id: ActivityType.HARF_BAGLAMA,
    title: 'Harf Bağlama Etkinliği',
    description: 'Özel öğrenme güçlüğü yaşayan çocuklar için eğlenceli ve öğretici bir harf bağlama aktivitesi.',
    icon: 'fa-solid fa-link',
    categories: ['Bilişsel Beceriler', 'Analitik Düşünme'],
    difficulty: 'Kolay',
    color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
  },
  // AUTONOM_ACTIVITIES_START
  // AUTONOM_ACTIVITIES_END
];

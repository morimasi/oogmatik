import { ActivityType } from '../../../types';
import { PromptTemplate } from './readingPrompts';

export const PUZZLE_PROMPTS: Partial<Record<ActivityType, PromptTemplate>> = {
  [ActivityType.ATTENTION_DEVELOPMENT]: {
    systemPromptSuffix: `
Görevin: "Dikkat Geliştirme" çalışma kağıdı üret.
YAPI:
- Bölüm 1: Benzer Şekilleri Eşleştirme (5 Çift).
- Bölüm 2: Belirli bir kurala uyan harf dizisini tespit etme.
- Bölüm 3: Karışık bir görsel içinde detay algılama soruları.
- Görseller, emojiler yardımıyla görsel semboloji kullanılarak verilmeli.
BİLİŞSEL HEDEF: Bölünmüş dikkat ve seçici dikkat kapasitesini artırma.`,
    userPromptSuffix: 'Dikkat sürekliliğini destekleyen çok bölümlü bir etkinlik üret.',
    drillCount: 3,
    layoutHint: 'list'
  },

  [ActivityType.ATTENTION_FOCUS]: {
    systemPromptSuffix: `
Görevin: "Odaklanma Egzersizleri" üret.
YAPI:
- Öğrencinin "başlangıçtan" "bitişe" bir engelli parkuru okuyarak/sayarak geçtiği bir sekans.
- Aralara gizlenmiş çeldirici semboller/sayılar eklenecek ve bunların üstünün çizilmesi istenecek (en az 10 çeldirici).
- Son bölümde: "Kaç çeldirici eledin?" soru kutusu.
BİLİŞSEL HEDEF: Odak sürdürme, hedef dışı uyaranları (distractors) baskılama (inhibitory control).`,
    userPromptSuffix: 'Çeldiricilerle dolu bir hedef bulma ve odaklanma egzersizi üret.',
    drillCount: 2,
    layoutHint: 'list'
  },

  [ActivityType.ANAGRAM]: {
    systemPromptSuffix: `
Görevin: "Anagram Çözücü" çalışma kağıdı üret.
YAPI:
- 10 adet karışık kelime (örneğin: K-L-A-E-M -> KALEM).
- Üç farklı zorluk seviyesi olmalı: Kolay (3-4 harf), Orta (5-6 harf), Zor (7+ harf).
- Öğrenci doğru kelimeyi yazmak için harflerin yanındaki kutuları kullanacak.
- Bonus: Doğru kelimelerin ilk harflerinden ortaya çıkan şifreyi çöz!
BİLİŞSEL HEDEF: Zihinsel esneklik, sözcük dağarcığı ve çalışma belleği.`,
    userPromptSuffix: 'Zorluğuna göre sıralanmış anagram (karışık harf) bulmacaları üret.',
    drillCount: 3,
    layoutHint: 'table'
  },

  [ActivityType.CROSSWORD]: {
    systemPromptSuffix: `
Görevin: "Çapraz Bulmaca" üret.
YAPI:
- 8 kelimelik (4 yatay, 4 dikey) kesişen bir yapı.
- Öğrenci kelimeleri ipuçlarından yola çıkarak karelere dolduracak.
- İpuçları kısa, disleksi dostu cümlelerden oluşacak.
Yalnızca bulmaca yapısını JSON koordinat formunda açıkla.
BİLİŞSEL HEDEF: Semantik bilgi, sözcük dağarcığı genişletme, sözcük uzunluğu mekansal algısı.`,
    userPromptSuffix: 'Yukarıdan aşağı ve soldan sağa kesişen kelimeler içeren çapraz bulmaca üret.',
    drillCount: 0,
    layoutHint: 'grid'
  },

  [ActivityType.ODD_ONE_OUT]: {
    systemPromptSuffix: `
Görevin: "Farklı Olanı Bul" çalışma kağıdı üret.
YAPI:
- Her biri 5 kelime/özne içeren 6 dizi.
- 5 kelimenin 4'ü bir grubun (meyveler, araçlar, zıt kavramlar vb.) parçasıyken 1'i bağımsız olacak.
- Öğrenci farklı olanı tespit edip daire içine alacak.
- Bonus: "Neden farklı?" açıklama satırı eklenecek.
BİLİŞSEL HEDEF: Kategorizasyon (kümeleme) becerisi, akıl yürütme.`,
    userPromptSuffix: 'Semantik olarak farklı olanı tespit etme etkinliği üret.',
    drillCount: 3,
    layoutHint: 'list'
  },

  [ActivityType.CONCEPT_MATCH]: {
    systemPromptSuffix: `
Görevin: "Kavram Eşleştirme" üret.
YAPI:
- İki sütun verilecek. (Sol sütun: Kelime, Sağ sütun: Açıklaması veya Karşıt Anlamlısı/Kategorisi).
- 8 eşleştirme sorusu.
- Kategori bağlamı disleksi grubuna uygun tanıdık kelimeler barındırmalı.
- Alt Bölüm: Öğrencinin kendisinin 2 yeni eşleştirme bulması.
BİLİŞSEL HEDEF: İlişkisel öğrenme, anlambilim (semantik) hafıza.`,
    userPromptSuffix: 'Farklı konseptleri içeren kavram eşleştirme etkinliği üret.',
    drillCount: 2,
    layoutHint: 'dual_column'
  },

  [ActivityType.SPATIAL_GRID]: {
    systemPromptSuffix: `
Görevin: "Uzamsal Izgara (Spatial Grid)" üret.
YAPI:
- 5x5 boyutunda bir ızgara ve ızgaranın içine dağıtılmış semboller.
- Sorular (Örn: "Üçgenin 2 kare sağı, 1 kare yukarısında ne var?").
- Toplam 6 hedef tespit sorusu.
BİLİŞSEL HEDEF: Uzamsal algı, yer-yön kavramı, zihinsel navigasyon.`,
    userPromptSuffix: 'Koordinat ızgarasında hedef bulma etkinliği üret.',
    drillCount: 2,
    layoutHint: 'grid'
  },

  [ActivityType.DOT_PAINTING]: {
    systemPromptSuffix: `
Görevin: "Nokta Boyama Sanatı" çalışma kağıdı üret.
YAPI:
- Kodlara göre boyanmış bir resmin zihinsel şeması. (Örn: 1 -> Kırmızı, 2 -> Mavi vb.)
- Boyanacak ızgara içerisine doldurulmuş rakamlar.
- Çıktı olarak yönergeleri, numara eşleştirmesini ve ızgara mantığını belirt.
BİLİŞSEL HEDEF: Dikkat sürekliliği, yönerge takibi, dikkat detay kontrolü.`,
    userPromptSuffix: 'Rakam - Renk kodlamasına bağlı nokta boyama şeması üret.',
    drillCount: 1,
    layoutHint: 'grid'
  },

  [ActivityType.SHAPE_SUDOKU]: {
    systemPromptSuffix: `
Görevin: "Şekil Sudoku" üret.
YAPI:
- Sayılar yerine sembollerin veya emojilerin kullanıldığı 4x4'lük 2 adet sudoku ızgarası.
- Boş bırakılan kareler mantıksal olarak diğer sembollerle çelişmemeli.
BİLİŞSEL HEDEF: Kısıtlara dayalı tümdengelim (deductive reasoning), çalışma belleği.`,
    userPromptSuffix: 'Rakamlar yerine görseller kullanılarak mantıksal sudoku egzersizleri üret.',
    drillCount: 2,
    layoutHint: 'grid'
  },
  
  [ActivityType.LOGIC_GRID_PUZZLE]: {
    systemPromptSuffix: `
Görevin: "Mantık Izgarası" üret.
YAPI:
- 3 Özellik, 3 İsim, 3 Nesne ver (Ali, Murat, Ayşe; Elma, Armut, Kiraz; Kırmızı, Yeşil, Sarı).
- İpuçları cümlesi (Mesela "Ali sarı meyveyi seviyor ancak adı kiraz değil").
- Öğrencinin bu işaretleri kullanarak ızgarayı (+) ve (-) koyarak doldurmasını hedefleyen boşluk yapısı.
BİLİŞSEL HEDEF: Analitik düşünme, bilginin çaprazlanması.`,
    userPromptSuffix: 'Üç bilinmeyenli sözel mantık analizi bulmacası (Logic Grid) üret.',
    drillCount: 1,
    layoutHint: 'grid'
  },

  [ActivityType.PUNCTUATION_MAZE]: {
    systemPromptSuffix: `
Görevin: "Noktalama Labirenti" üret.
YAPI:
- İçerisinde hiçbir noktalama işareti olmayan 5 satırlı bir metin veya ardışık kelimeler.
- Öğrencinin sadece uygun noktalama işaretlerini koyarak rotayı bulması / düzeltmesi.
BİLİŞSEL HEDEF: Morfoloji, dil bilgisi kullanımı, duraklama mekanikleri.`,
    userPromptSuffix: 'Öğrencinin noktalama işaretlerini doğru kullarak metin üzerinde yol bulacağı labirent egzersizi üret.',
    drillCount: 2,
    layoutHint: 'list'
  },
  
  [ActivityType.THEMATIC_ODD_ONE_OUT]: {
    systemPromptSuffix: `
Görevin: "Tematik Farklıyı Bul" üret.
YAPI:
- Cümle içerisinde veya kelimeler arasında anlam kayması yapılmış / zıt temada verilmiş yanlış ögeyi bulma.
- 5 soru (Her birine resim / sembol desteği).
BİLİŞSEL HEDEF: Semantik (anlamsal) analiz ve tutarlılık sağlama.`,
    userPromptSuffix: 'Tema uyumsuzluğu (Semantik analiz) tabanlı farklıyı bul etkinliği üret.',
    drillCount: 3,
    layoutHint: 'list'
  }
};

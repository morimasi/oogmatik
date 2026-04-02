import { ActivityType } from '../../../types';

/**
 * promptTemplates.ts — Aktivite-Spesifik Premium Prompt Şablonları
 *
 * Her aktivite türü için Gemini 2.5 Flash'a gönderilecek
 * özelleştirilmiş system prompt, user prompt eki ve JSON schema tanımı.
 *
 * Bu dosya SmartFallbackGenerator tarafından kullanılır.
 * Genel bir prompt yerine, her aktivite kendi pedagojik bağlamını alır.
 */

export interface PromptTemplate {
  /** Aktivite-spesifik Gemini system talimatı */
  systemPromptSuffix: string;
  /** Kullanıcı promptuna eklenen aktivite-spesifik yönerge */
  userPromptSuffix: string;
  /** Gemini'nin döneceği JSON yapısındaki ek alanlar */
  extraSchemaFields?: Record<string, unknown>;
  /** A4 sayfasında kaç bölüm (drill) olacağı */
  drillCount?: number;
  /** Önerilen grid/layout yapısı */
  layoutHint?: 'grid' | 'table' | 'list' | 'svg' | 'dual_column' | 'pyramid';
}

// ═══════════════════════════════════════════════════════════════
// OKUMA & DİL BECERİLERİ (17 Aktivite)
// ═══════════════════════════════════════════════════════════════

const READING_TEMPLATES: Partial<Record<ActivityType, PromptTemplate>> = {
  [ActivityType.HECE_PARKURU]: {
    systemPromptSuffix: `
Görevin: "Hece Parkuru" çalışma kağıdı üret.
YAPI:
- 20-30 adet kelimeyi hecelere ayırılmış şekilde, renkli kodlamayla sun.
- Açık hece (sesliyle biten) ve kapalı hece (ünsüzle biten) ayrımını göster.
- Zorluk artışı: 2 heceli → 3 heceli → 4+ heceli kelimeler.
- Her 5 kelimeden sonra bir "CHECK" kutusu ekle.
BİLİŞSEL HEDEF: Fonolojik sentez ve hece farkındalığı.`,
    userPromptSuffix: 'Heceleme kurallarına uygun, disleksi dostu renkli kodlamalı hece parkuru üret.',
    drillCount: 3,
    layoutHint: 'grid'
  },

  [ActivityType.FIND_LETTER_PAIR]: {
    systemPromptSuffix: `
Görevin: "Harf İkilisi Dedektifi" çalışma kağıdı üret.
YAPI:
- 15x10 harf matrisi oluştur (toplam 150 harf).
- Matris içine hedef harf ikilisini (ör: "ba", "de", "ka") 8-12 kez gizle.
- Dikkat dağıtıcı benzer ikililer ekle (ör: hedef "ba" ise "da", "bo", "ab" gibi).
- Altına 3 kısa pekiştirme sorusu ekle.
BİLİŞSEL HEDEF: Görsel tarama hızı ve harf dizisi tanıma.`,
    userPromptSuffix: 'Hedef harf ikilisini belirle ve rastgele dağıtılmış 15x10 matris üret.',
    drillCount: 3,
    layoutHint: 'grid'
  },

  [ActivityType.SYLLABLE_WORD_BUILDER]: {
    systemPromptSuffix: `
Görevin: "Hece Dedektifi" çalışma kağıdı üret.
YAPI:
- 8 adet kelime için: karışık heceleri ver, öğrenci doğru sırayı yazacak.
- Her kelimenin yanında görsel ipucu (emoji veya açıklama) olsun.
- Kolay (2 hece) → Zor (4+ hece) sıralama.
- Alt bölümde: verilen hecelerden yeni kelimeler türetme (serbest bölüm).
BİLİŞSEL HEDEF: Fonolojik sentez ve kelime inşa becerisi.`,
    userPromptSuffix: 'Karışık hecelerden kelime oluşturma etkinliği üret.',
    drillCount: 2,
    layoutHint: 'table'
  },

  [ActivityType.FAMILY_RELATIONS]: {
    systemPromptSuffix: `
Görevin: "Akrabalık İlişkileri" çalışma kağıdı üret.
YAPI:
- Basit bir aile şeması (3 nesil, 6-8 kişi) oluştur.
- Eşleştirme bölümü: "Ali'nin annesi → ?" formatında 8 soru.
- Doğru/Yanlış bölümü: "Elif, Ahmet'in teyzesidir" gibi 5 ifade.
- Serbest yazım: "Kendi aileni anlat" bölümü.
BİLİŞSEL HEDEF: İlişkisel muhakeme ve sözel mantık.`,
    userPromptSuffix: 'Türk aile yapısına uygun akrabalık etkinliği üret.',
    drillCount: 3,
    layoutHint: 'dual_column'
  },

  [ActivityType.FAMILY_LOGIC_TEST]: {
    systemPromptSuffix: `
Görevin: "Akrabalık Mantık Testi" üret.
YAPI:
- 3-4 cümlelik bir senaryo ver (ör: "Ali'nin 2 kızı var. Elif, Zeynep'in ablasıdır...").
- 6 mantıksal çıkarım sorusu sor (ör: "Zeynep, Ali'nin nesidir?").
- Her sorunun altında boş cevap kutusu olsun.
- Son bölümde: "Kendi mantık sorunu yaz" serbest alan.
BİLİŞSEL HEDEF: Tümdengelimsel muhakeme ve sözel çıkarım.`,
    userPromptSuffix: 'Akrabalık bağları üzerinden mantıksal çıkarım soruları üret.',
    drillCount: 2,
    layoutHint: 'list'
  },

  [ActivityType.READING_PYRAMID]: {
    systemPromptSuffix: `
Görevin: "Akıcı Okuma Piramidi" üret.
YAPI:
- 4 adet piramit oluştur, her biri 5-7 basamak.
- Her basamak bir öncekinden 1 kelime daha uzun (ör: "Güneş." → "Güneş açtı." → "Bugün güneş açtı.").
- Piramitler farklı temalardan (hayvan, okul, doğa, aile).
- Altında "Okuma Süresi" tablosu: Her piramit için saniye kutusu.
BİLİŞSEL HEDEF: Göz takip (saccades) genişliği ve okuma akıcılığı.`,
    userPromptSuffix: 'Genişleyen cümlelerle akıcı okuma piramitleri üret.',
    drillCount: 1,
    layoutHint: 'pyramid'
  },

  [ActivityType.READING_FLOW]: {
    systemPromptSuffix: `
Görevin: "Ritmik Okuma Akıcılığı" çalışması üret.
YAPI:
- 3 farklı tema (örn: doğa, okul, macera) için birer ritmik okuma seti.
- Her set: 1 kelimelik → 2 kelimelik → ... → 6 kelimelik cümleler.
- Hece-renklendirme işaretleri: sesli harfler altı çizili.
- Altında: "Dakikada Kelime (WPM)" hesaplama tablosu.
BİLİŞSEL HEDEF: Kelime tanıma eşiği ve okuma otomatikliği.`,
    userPromptSuffix: 'Kademeli genişleyen cümle setleriyle okuma akıcılığı çalışması üret.',
    drillCount: 1,
    layoutHint: 'pyramid'
  },

  [ActivityType.PHONOLOGICAL_AWARENESS]: {
    systemPromptSuffix: `
Görevin: "Fonolojik Farkındalık" çalışma kağıdı üret.
YAPI:
- Bölüm 1: "Hangi kelime ___ sesiyle başlar?" (5 soru, 3 seçenek)
- Bölüm 2: "Bu kelimelerin ortak sesi nedir?" (5 soru)
- Bölüm 3: "Kelimeyi seslere ayır" (5 kelime → kutucuklar)
- Bölüm 4: "Sesi değiştir, yeni kelime bul" (3 soru)
BİLİŞSEL HEDEF: Sesbirimsel farkındalık ve işitsel ayrıştırma.`,
    userPromptSuffix: 'Çok bölümlü fonolojik farkındalık etkinliği üret.',
    drillCount: 4,
    layoutHint: 'list'
  },

  [ActivityType.RAPID_NAMING]: {
    systemPromptSuffix: `
Görevin: "Hızlı İsimlendirme (RAN)" çalışma kağıdı üret.
YAPI:
- 5 satır × 10 sütun nesne/renk/harf grid'i (toplam 50 öğe).
- Nesneler: 5 farklı sembol/emoji tekrarlı kullanılacak.
- Alt bölümde: "Süre Tablosu" (1. deneme, 2. deneme, 3. deneme kutuları).
- İkinci bir set: Aynı formatla harfler veya renkler.
BİLİŞSEL HEDEF: Görsel işlemleme hızı ve sözel tepki akıcılığı.`,
    userPromptSuffix: 'Nesne ve harf tabanlı hızlı isimlendirme grid\'i üret.',
    drillCount: 2,
    layoutHint: 'grid'
  },

  [ActivityType.LETTER_DISCRIMINATION]: {
    systemPromptSuffix: `
Görevin: "Harf Ayırt Etme Testi" üret.
YAPI:
- Hedef harf çifti seç (b/d, p/q, m/n gibi).
- 15 satır × 20 sütun harf matrisi.
- Hedef harfler matrise rastgele serpiştirilmiş olacak.
- Öğrenci hedef harfleri daire içine alacak.
- Alt bölüm: "Kaç tane buldun?" sayım kutusu.
BİLİŞSEL HEDEF: Seçici dikkat ve görsel diskriminasyon.`,
    userPromptSuffix: 'Karışık harfler arasında hedef harf bulma matrisi üret.',
    drillCount: 1,
    layoutHint: 'grid'
  },

  [ActivityType.MIRROR_LETTERS]: {
    systemPromptSuffix: `
Görevin: "Ayna Harfler" çalışması üret.
YAPI:
- 10 satırlık b/d veya p/q harf dizileri.
- Her satırda 8 harf, bazıları ayna yansıması (ters).
- Öğrenci doğru yönlü olanları işaretleyecek.
- Alt bölüm: El referansı (b=sol el baş parmak yukarı) görseli açıklaması.
- Pekiştirme: 5 kelimede doğru b/d kullanımı.
BİLİŞSEL HEDEF: Yönsel algı ve lateralizasyon.`,
    userPromptSuffix: 'Ayna harf ayırt etme ve yön tayini çalışması üret.',
    drillCount: 2,
    layoutHint: 'grid'
  },

  [ActivityType.SYLLABLE_TRAIN]: {
    systemPromptSuffix: `
Görevin: "Hece Ekspresi (Vagon Sentezi)" üret.
YAPI:
- 6 adet "tren": Her trenin vagonları hece parçaları.
- Mod 1: Vagonları birleştirip kelimeyi yaz (3 tren).
- Mod 2: Eksik vagonu bul ve tamamla (2 tren).
- Mod 3: Karışık vagonları sırala (1 tren).
- Alt bölüm: "Kendi trenini kur" serbest alan (2 boş tren).
BİLİŞSEL HEDEF: Hece sentezi ve fonolojik manipülasyon.`,
    userPromptSuffix: 'Tren-vagon metaforuyla hece birleştirme etkinliği üret.',
    drillCount: 3,
    layoutHint: 'table'
  },

  [ActivityType.BACKWARD_SPELLING]: {
    systemPromptSuffix: `
Görevin: "Geriye Doğru Heceleme" çalışması üret.
YAPI:
- Bölüm 1: 6 kelimeyi sondan başa harf harf yaz (kolay: 3-4 harf).
- Bölüm 2: 4 kelimeyi sondan başa hece hece yaz (orta: 2-3 hece).
- Bölüm 3: Ters yazılmış 4 kelimeyi düzelt (zor).
- Her bölümde örnek çözüm göster.
BİLİŞSEL HEDEF: İşitsel çalışma belleği ve fonolojik manipülasyon.`,
    userPromptSuffix: 'Kademeli zorlukta geriye heceleme etkinliği üret.',
    drillCount: 3,
    layoutHint: 'table'
  },

  [ActivityType.CODE_READING]: {
    systemPromptSuffix: `
Görevin: "Şifre Okuma Labirenti" çalışması üret.
YAPI:
- Sembol-harf eşleştirme tablosu (8 sembol → 8 harf).
- 6 adet şifreli kelime: sembol dizisi verilecek, öğrenci harfe çevirecek.
- Bonus: 2 adet öğrencinin kendi kelimesini şifrelemesi.
- Altında: Şifreli cümle çözme (uzun şifre).
BİLİŞSEL HEDEF: Sembol eşleştirme, kodlama ve çalışma belleği.`,
    userPromptSuffix: 'Emoji/sembol tabanlı şifre çözme etkinliği üret.',
    drillCount: 2,
    layoutHint: 'table'
  },

  [ActivityType.HANDWRITING_PRACTICE]: {
    systemPromptSuffix: `
Görevin: "Yazı Alıştırması" çalışma kağıdı üret.
YAPI:
- Bölüm 1: 4 harf (büyük+küçük) noktalı çizgi üzerinde takip (trace).
- Bölüm 2: 4 kelime kopyalama (copy) — satır çizgili alan.
- Bölüm 3: 2 kısa cümle dikte alanı (dictation) — boş çizgili alan.
- Her bölümde güzel yazı kriterleri: boyut, aralık, eğim ipuçları.
BİLİŞSEL HEDEF: İnce motor beceriler, yazı formasyonu ve grafo-motor kontrol.`,
    userPromptSuffix: 'Noktalı takip, kopyalama ve dikte bölümlü yazı alıştırması üret.',
    drillCount: 3,
    layoutHint: 'list'
  },

  [ActivityType.MORPHOLOGY_MATRIX]: {
    systemPromptSuffix: `
Görevin: "Morfolojik Kelime İnşaatı" çalışma kağıdı üret.
YAPI:
- 10 kök kelime ve her biri için 3 ek seçeneği (tablo formatında).
- Öğrenci doğru eki seçip yeni kelimeyi yazacak.
- İpucu kutusu: "Bu kelime ne anlama geliyor?" açıklamaları.
- Alt bölüm: Verilen 5 kelimeyi kök+ek olarak ayırma.
BİLİŞSEL HEDEF: Morfolojik farkındalık ve kelime türetme stratejisi.`,
    userPromptSuffix: 'Kök-ek birleştirme ve morfolojik analiz etkinliği üret.',
    drillCount: 2,
    layoutHint: 'table'
  },

  [ActivityType.MISSING_PARTS]: {
    systemPromptSuffix: `
Görevin: "Eksik Parçalar" çalışma kağıdı üret.
YAPI:
- Bölüm 1: 6 cümlede eksik kelimeyi tamamla (bağlam ipuçlu).
- Bölüm 2: 4 kelimede eksik harfleri yaz (noktalı).
- Bölüm 3: Resim açıklamasında eksik kelimeleri bul (2 paragraf).
- Her bölümde 3 seçenekli ipucu kutusu.
BİLİŞSEL HEDEF: Bağlamsal çıkarım ve sözel tamamlama.`,
    userPromptSuffix: 'Kelime, harf ve cümle seviyesinde eksik tamamlama etkinliği üret.',
    drillCount: 3,
    layoutHint: 'list'
  },
};

// ═══════════════════════════════════════════════════════════════
// MATEMATİK & MANTIK (12 Aktivite)
// ═══════════════════════════════════════════════════════════════

const MATH_TEMPLATES: Partial<Record<ActivityType, PromptTemplate>> = {
  [ActivityType.MATH_PUZZLE]: {
    systemPromptSuffix: `
Görevin: "Matematik Bulmacaları" çalışma kağıdı üret.
YAPI:
- 4 farklı matematik bulmacası (her biri farklı türde):
  1. Şekil-sayı şifresi (üçgen=3, kare=? gibi)
  2. Sihirli kare (3x3, satır/sütun/çapraz toplamı eşit)
  3. Eksik işlem bulma (? + 5 = 12)
  4. Sayı piramidi (her kutu üstündeki ikisinin toplamı)
- Her bulmacanın altında çözüm ipucu kutusu.
BİLİŞSEL HEDEF: Cebirsel düşünme ve problem çözme.`,
    userPromptSuffix: 'Çok türlü matematik bulmaca sayfası üret.',
    drillCount: 4,
    layoutHint: 'grid'
  },

  [ActivityType.CLOCK_READING]: {
    systemPromptSuffix: `
Görevin: "Saat Okuma" çalışma kağıdı üret.
YAPI:
- Bölüm 1: 6 analog saat görseli → dijital karşılığını yaz.
- Bölüm 2: 6 dijital saat → analog saate akrep/yelkovan çiz.
- Bölüm 3: "Aradan geçen süre" problemleri (3 soru).
- Bölüm 4: Günlük rutin zaman çizelgesi eşleştirme.
Saat görselleri için açıklayıcı metin kullan (örn: "Akrep 3'te, yelkovan 12'de").
BİLİŞSEL HEDEF: Zamansal kavramlar ve analog-dijital dönüşüm.`,
    userPromptSuffix: 'Analog/dijital saat etkinliği ve zaman problemleri üret.',
    drillCount: 4,
    layoutHint: 'grid'
  },

  [ActivityType.MONEY_COUNTING]: {
    systemPromptSuffix: `
Görevin: "Paralarımız" çalışma kağıdı üret.
YAPI:
- Bölüm 1: Para tanıma (5, 10, 25, 50 kuruş + 1, 5, 10, 20, 50, 100, 200 TL) — eşleştirme.
- Bölüm 2: "Toplam ne kadar?" (4 soru — para grubu → toplam).
- Bölüm 3: "Para üstü hesapla" (3 alışveriş senaryosu).
- Bölüm 4: "Bütçe planla" — 50 TL ile market listesi oluştur.
BİLİŞSEL HEDEF: Finansal okuryazarlık ve toplama/çıkarma pratiği.`,
    userPromptSuffix: 'TL para birimi tanıma, toplama ve alışveriş çalışması üret.',
    drillCount: 4,
    layoutHint: 'table'
  },

  [ActivityType.NUMBER_PATH_LOGIC]: {
    systemPromptSuffix: `
Görevin: "Sembolik İşlem Zinciri" çalışma kağıdı üret.
YAPI:
- 5 adet sembol-sayı şifreleme sorusu.
- Her soruda 3-4 geometrik sembol, her biri bir sayıya eşit.
- Sembollerle yazılmış denklem → sayısal sonucu bul.
- Son bölüm: Öğrenci kendi sembol şifresini oluştursun.
BİLİŞSEL HEDEF: Cebirsel düşünme ve sembolik temsil.`,
    userPromptSuffix: 'Geometrik sembol-sayı şifreleme zincirleri üret.',
    drillCount: 2,
    layoutHint: 'table'
  },

  [ActivityType.VISUAL_ARITHMETIC]: {
    systemPromptSuffix: `
Görevin: "Görsel Aritmetik" çalışma kağıdı üret.
YAPI:
- 8 görsel işlem sorusu (nesnelerle toplama/çıkarma).
- Nesneler: meyve, hayvan, şekil gibi somut görseller (emoji/metin).
- Eşitlik formatı: 🍎+🍎+🍌=? veya 🐱×3=?
- Alt bölüm: Tersine mühendislik — sonuç verilmiş, işlemi bul.
BİLİŞSEL HEDEF: Somut düşünmeden soyut düşünmeye geçiş.`,
    userPromptSuffix: 'Emoji/nesne tabanlı görsel aritmetik soruları üret.',
    drillCount: 2,
    layoutHint: 'grid'
  },

  [ActivityType.NUMBER_SENSE]: {
    systemPromptSuffix: `
Görevin: "Sayı Hissi" çalışma kağıdı üret.
YAPI:
- Bölüm 1: Sayı doğrusu üzerinde konum bulma (6 soru).
- Bölüm 2: "Hangisi daha büyük?" hızlı karşılaştırma (10 çift).
- Bölüm 3: Tahmini toplama (kesin hesap yapmadan yaklaşık sonuç — 4 soru).
- Bölüm 4: Nokta gruplarını saymadan tahmin etme (subitizing — 5 grup).
BİLİŞSEL HEDEF: Sayısal büyüklük algısı ve anlık miktar tahmini.`,
    userPromptSuffix: 'Sayı doğrusu, karşılaştırma ve subitizing çalışması üret.',
    drillCount: 4,
    layoutHint: 'dual_column'
  },

  [ActivityType.NUMBER_PATTERN]: {
    systemPromptSuffix: `
Görevin: "Sayı Örüntüsü" çalışma kağıdı üret.
YAPI:
- 10 adet sayı dizisi, her birinde 2 eksik sayı.
- Kurallar: +2, ×2, -3, tekrarlı desen, Fibonacci benzeri.
- Her dizinin yanında "Kural: ___" boş kutusu.
- Bonus: Öğrencinin kendi dizisini oluşturması.
BİLİŞSEL HEDEF: Örüntü tanıma ve serisel muhakeme.`,
    userPromptSuffix: 'Çeşitli kurallı sayı dizisi tamamlama etkinliği üret.',
    drillCount: 2,
    layoutHint: 'list'
  },

  [ActivityType.KENDOKU]: {
    systemPromptSuffix: `
Görevin: "Kendoku" (KenKen) bulmacası üret.
YAPI:
- 2 adet 4×4 Kendoku ızgarası.
- 1 adet 5×5 Kendoku ızgarası (zor).
- Her kafes (cage) için hedef sayı ve işlem belirtilmiş.
- Kural hatırlatması: Her satır ve sütunda sayılar tekrarlanmaz.
BİLİŞSEL HEDEF: Cebirsel düşünme ve kısıtlama çözümleme.`,
    userPromptSuffix: 'Farklı boyutlarda Kendoku bulmacaları üret.',
    drillCount: 3,
    layoutHint: 'grid'
  },

  [ActivityType.NUMBER_PYRAMID]: {
    systemPromptSuffix: `
Görevin: "Sayı Piramidi" çalışma kağıdı üret.
YAPI:
- 4 adet piramit (2 kolay-4 basamak, 2 zor-5 basamak).
- Kural: Üstteki kutu = altındaki iki kutunun toplamı.
- Bazı kutular dolu, bazıları boş (öğrenci dolduracak).
- Alt bölüm: Çıkarma piramidi (üstteki = fark).
BİLİŞSEL HEDEF: Toplama/çıkarma fluency ve ters işlem.`,
    userPromptSuffix: 'Toplama ve çıkarma tabanlı sayı piramitleri üret.',
    drillCount: 2,
    layoutHint: 'pyramid'
  },

  [ActivityType.REAL_LIFE_MATH_PROBLEMS]: {
    systemPromptSuffix: `
Görevin: "Gerçek Hayat Matematik Problemleri" üret.
YAPI:
- 6 günlük hayat senaryosu (market, yemek tarifi, seyahat, spor vb.).
- Her senaryo: durum açıklaması + 2 soru (toplam 12 soru).
- Görselleştirme: her senaryo için emoji-sembol desteği.
- Çözüm alanı: her soru için "İşlem kutusu" + "Cevap kutusu".
BİLİŞSEL HEDEF: Matematiksel modelleme ve transfer.`,
    userPromptSuffix: 'Günlük hayat senaryolu matematik problemleri üret.',
    drillCount: 6,
    layoutHint: 'list'
  },

  [ActivityType.ESTIMATION]: {
    systemPromptSuffix: `
Görevin: "Tahmin" çalışma kağıdı üret.
YAPI:
- Bölüm 1: "Bu kavanozda kaç tane var?" (5 nesne grubu tahmini).
- Bölüm 2: Toplama tahmini — kesin hesap yapmadan yaklaşık sonuç (4 soru).
- Bölüm 3: Uzunluk/ağırlık tahmini (3 soru — "Bu masa kaç cm?").
- Her sorunun altında "Tahminim: ___ Gerçek: ___" kutuları.
BİLİŞSEL HEDEF: Sayısal tahmin becerisi ve miktar algısı.`,
    userPromptSuffix: 'Miktar, uzunluk ve hesap tahmini etkinliği üret.',
    drillCount: 3,
    layoutHint: 'dual_column'
  },

  [ActivityType.MATH_STUDIO]: {
    systemPromptSuffix: `
Görevin: "Matematik Stüdyosu" temel dril sayfası üret.
YAPI:
- 20 adet dört işlem sorusu (5 toplama, 5 çıkarma, 5 çarpma, 5 bölme).
- Zorluk seviyesine göre sayı aralığı ayarla.
- Her 5 sorudan sonra "Mini Mola" kutusu (eğlenceli bilgi).
- Alt bölüm: 3 sözel problem.
BİLİŞSEL HEDEF: İşlemsel akıcılık ve otomatikleştirme.`,
    userPromptSuffix: 'Dört işlem drili ve sözel problemler üret.',
    drillCount: 4,
    layoutHint: 'grid'
  },
};

// ═══════════════════════════════════════════════════════════════
// GÖRSEL & MEKANSAL (6 Aktivite)
// ═══════════════════════════════════════════════════════════════

const VISUAL_TEMPLATES: Partial<Record<ActivityType, PromptTemplate>> = {
  [ActivityType.GRID_DRAWING]: {
    systemPromptSuffix: `
Görevin: "Kare Kopyalama (Grid Drawing)" çalışma kağıdı üret.
YAPI:
- Sol tarafta: örnek desen dolu 8×8 ızgara (basit geometrik şekil).
- Sağ tarafta: boş 8×8 ızgara (öğrenci kopyalayacak).
- 3 farklı zorlukta desen (kolay→zor).
- AltBölüm: "Kendi desenini tasarla" boş ızgara.
Her karenin koordinatı (A1, B2 gibi) belirtilmiş olsun.
BİLİŞSEL HEDEF: Görsel-mekansal kopya ve el-göz koordinasyonu.`,
    userPromptSuffix: 'Izgaralı desen kopyalama etkinliği üret.',
    drillCount: 3,
    layoutHint: 'grid'
  },

  [ActivityType.SYMMETRY_DRAWING]: {
    systemPromptSuffix: `
Görevin: "Simetri Tamamlama" çalışma kağıdı üret.
YAPI:
- 4 adet simetri çalışması:
  1-2: Yatay simetri ekseni (sol yarısı dolu → sağ yarısını tamamla).
  3: Dikey simetri ekseni (üst yarısı dolu).
  4: Çapraz simetri (ileri seviye).
- Her çalışma 10×10 ızgarada.
- Simetri ekseni kalın çizgiyle belirtilmiş.
BİLİŞSEL HEDEF: Uzamsal akıl yürütme ve simetri algısı.`,
    userPromptSuffix: 'Farklı eksenlerde simetri tamamlama etkinliği üret.',
    drillCount: 4,
    layoutHint: 'grid'
  },

  [ActivityType.WORD_SEARCH]: {
    systemPromptSuffix: `
Görevin: "Kelime Bulmaca (Word Search)" çalışma kağıdı üret.
YAPI:
- Tema seçilmiş (hayvanlar/meyveler/meslekler vb.) bir kelime bulmaca.
- Grid boyutu: zorluk bazlı (Kolay: 8×8, Orta: 10×10, Zor: 12×12).
- Gizlenen kelimeler: 8-12 adet, yatay ve dikey (zorda çapraz da).
- Kelime listesi grid'in altında verilmiş.
- Bonus: "Kalan harflerden gizli mesajı bul" bölümü.
BİLİŞSEL HEDEF: Görsel tarama, harf dizisi tanıma ve seçici dikkat.`,
    userPromptSuffix: 'Tematik Türkçe kelime bulmaca grid\'i üret.',
    drillCount: 1,
    layoutHint: 'grid'
  },

  [ActivityType.DIRECTIONAL_TRACKING]: {
    systemPromptSuffix: `
Görevin: "Yönsel İz Sürme (Kod Çözme)" çalışma kağıdı üret.
YAPI:
- 8×8 harf ızgarası + başlangıç noktası.
- Yön komutları dizisi (→↓→→↑← gibi) ile ızgarada ilerle.
- Topladığın harfler gizli kelimeyi oluşturur.
- 3 farklı zorlukta iz sürme (kısa→uzun komut dizisi).
- Bonus: Öğrenci kendi yön kodunu yazsın.
BİLİŞSEL HEDEF: Yön tayini, ardışık işlem ve çalışma belleği.`,
    userPromptSuffix: 'Ok yönlerini takip ederek gizli kelime bulma etkinliği üret.',
    drillCount: 3,
    layoutHint: 'grid'
  },

  [ActivityType.VISUAL_TRACKING_LINES]: {
    systemPromptSuffix: `
Görevin: "Görsel Takip Çizgileri" çalışma kağıdı üret.
YAPI:
- Sol tarafta: harfler (A, B, C, D, E).
- Sağ tarafta: rakamlar (1, 2, 3, 4, 5).
- Arada: birbirine geçmiş 5 eğri çizgi — her harf bir rakama gider.
- Öğrenci sadece gözüyle takip edip eşleştirmeyi yazacak.
- İkinci set: 7 çizgi (daha karmaşık).
BİLİŞSEL HEDEF: Oküler motor kontrol ve sürdürülebilir görsel dikkat.`,
    userPromptSuffix: 'Karmaşık çizgi takip ve eşleştirme etkinliği üret.',
    drillCount: 2,
    layoutHint: 'svg'
  },

  [ActivityType.ATTENTION_TO_QUESTION]: {
    systemPromptSuffix: `
Görevin: "Dikkat ve Sorular" çalışma kağıdı üret.
YAPI:
- Bölüm 1: Harf eleme — 10 satır harfler, hedef harfi bul ve say.
- Bölüm 2: Sözcük eleme — paragrafta belirli kelimeyi bul.
- Bölüm 3: Sayı eleme — sayı matrisinde çift sayıları işaretle.
- Her bölümde doğrulama kutusu: "Toplam bulduğum: ___".
BİLİŞSEL HEDEF: Seçici dikkat, sürdürülebilir dikkat ve hız.`,
    userPromptSuffix: 'Çok bölümlü harf/kelime/sayı eleme etkinliği üret.',
    drillCount: 3,
    layoutHint: 'grid'
  },
};

// ═══════════════════════════════════════════════════════════════
// BULMACA & DİKKAT (12 Aktivite)
// ═══════════════════════════════════════════════════════════════

const PUZZLE_TEMPLATES: Partial<Record<ActivityType, PromptTemplate>> = {
  [ActivityType.ANAGRAM]: {
    systemPromptSuffix: `
Görevin: "Anagram" çalışma kağıdı üret.
YAPI:
- 12 adet karışık harf grubu → doğru kelimeyi bul.
- Her kelimenin yanında kategori ipucu (ör: "Bir hayvan").
- Zorluk: 4 harfli → 5 harfli → 6+ harfli.
- Bonus: 2 cümle anagramı (cümledeki kelimelerin sırası karışık).
BİLİŞSEL HEDEF: Kelime hafızası ve fonolojik manipülasyon.`,
    userPromptSuffix: 'İpuçlu anagram çözme etkinliği üret.',
    drillCount: 2,
    layoutHint: 'table'
  },

  [ActivityType.CROSSWORD]: {
    systemPromptSuffix: `
Görevin: "Çapraz Bulmaca" çalışma kağıdı üret.
YAPI:
- Tema bazlı (konu parametresine göre) çapraz bulmaca.
- 8-10 kelime (5 yatay + 5 dikey minimum, kesişimli).
- Her kelime için açıklayıcı ipucu (tanım/eşanlamlı).
- Grid boyutu: 10×10.
İPUÇLARINI "Yatay" ve "Dikey" başlıkları altında listele.
BİLİŞSEL HEDEF: Sözcük dağarcığı ve çapraz referans.`,
    userPromptSuffix: 'Tematik Türkçe çapraz bulmaca üret.',
    drillCount: 1,
    layoutHint: 'grid'
  },

  [ActivityType.ODD_ONE_OUT]: {
    systemPromptSuffix: `
Görevin: "Farklıyı Bul (Odd One Out)" çalışma kağıdı üret.
YAPI:
- 10 satır, her satırda 4 öğe (kelime veya kavram).
- 3'ü aynı kategoriden, 1'i farklı.
- Her satırın altında "Neden farklı? ___" yazım alanı.
- Son 2 satır: görsel/şekil bazlı farklıyı bul.
BİLİŞSEL HEDEF: Kategorize etme ve tümdengelimsel akıl yürütme.`,
    userPromptSuffix: 'Sözel ve görsel farklıyı bulma etkinliği üret.',
    drillCount: 2,
    layoutHint: 'table'
  },

  [ActivityType.CONCEPT_MATCH]: {
    systemPromptSuffix: `
Görevin: "Kavram Eşleştirme" çalışma kağıdı üret.
YAPI:
- Sol sütun: 10 kavram/kelime.
- Sağ sütun: 10 tanım/eşanlamlı (karışık sırada).
- Öğrenci çizgiyle eşleştirecek.
- Alt bölüm: 5 cümlede boşluk doldurma (aynı kavramlarla).
BİLİŞSEL HEDEF: Anlamsal ağ oluşturma ve sözcük bilgisi.`,
    userPromptSuffix: 'İki sütunlu kavram eşleştirme etkinliği üret.',
    drillCount: 2,
    layoutHint: 'dual_column'
  },

  [ActivityType.LOGIC_GRID_PUZZLE]: {
    systemPromptSuffix: `
Görevin: "Mantık Izgarası (Logic Grid)" çalışma kağıdı üret.
YAPI:
- 3 kategori × 3 öğe mantık tablosu (3×3 grid).
- 4-5 sözel ipucu (ör: "Ali mavi olanı almadı").
- Doğru/yanlış işaretlemeli ızgara tablosu.
- Sonuç tablosu: Kişi → Nesne → Özellik eşleşmesi.
- İpucu ipuçları: Rehber adımlar (isteğe bağlı).
BİLİŞSEL HEDEF: Tümdengelimsel mantık ve organizasyonel strateji.`,
    userPromptSuffix: 'Sözel ipuçlu mantık çıkarım ızgarası üret.',
    drillCount: 1,
    layoutHint: 'grid'
  },

  [ActivityType.PUNCTUATION_MAZE]: {
    systemPromptSuffix: `
Görevin: "Noktalama Labirenti" çalışma kağıdı üret.
YAPI:
- Noktalama işaretleri olmayan 2 paragraf metin.
- Öğrenci: nokta, virgül, soru işareti, ünlem yerleştirecek.
- Altında: 5 cümledeki yanlış noktalamayı düzelt.
- Bonus: Sadece noktalama ile değişen anlam örnekleri.
BİLİŞSEL HEDEF: Metin organizasyonu ve dilbilgisi farkındalığı.`,
    userPromptSuffix: 'Noktalama işaretleri yerleştirme ve düzeltme etkinliği üret.',
    drillCount: 3,
    layoutHint: 'list'
  },

  [ActivityType.SPATIAL_GRID]: {
    systemPromptSuffix: `
Görevin: "Uzamsal Izgara" çalışma kağıdı üret.
YAPI:
- 6×6 koordinat ızgarası (A-F satır, 1-6 sütun).
- 8 komut: "B3'e üçgen çiz", "D1'den E4'e çizgi çek" gibi.
- Sorulan: "C2'de ne var?", "Üçgen hangi koordinatta?" gibi 4 soru.
- Bonus: Öğrencinin kendi koordinat komutlarını yazması.
BİLİŞSEL HEDEF: Uzamsal kodlama ve yön-konum ilişkisi.`,
    userPromptSuffix: 'Koordinat tabanlı uzamsal yerleştirme etkinliği üret.',
    drillCount: 2,
    layoutHint: 'grid'
  },

  [ActivityType.DOT_PAINTING]: {
    systemPromptSuffix: `
Görevin: "Nokta Boyama (Sayıya Göre)" çalışma kağıdı üret.
YAPI:
- Basit bir figür (kelebek, ev, çiçek vb.) numaralı bölgelere ayrılmış.
- Renk anahtarı: 1=Kırmızı, 2=Mavi, 3=Yeşil, 4=Sarı gibi.
- Zorluk bazlı: renk sayısı (Kolay: 4, Orta: 6, Zor: 8).
- Alt bölüm: "Kaç tane mavi bölge var?" gibi 3 sayma sorusu.
Her bölgenin numarasını ve sınırlarını metin olarak tanımla.
BİLİŞSEL HEDEF: Sayı-renk eşleştirme ve ince motor kontrol.`,
    userPromptSuffix: 'Numaralı bölge-renk eşleştirmeli boyama etkinliği üret.',
    drillCount: 1,
    layoutHint: 'grid'
  },

  [ActivityType.SHAPE_SUDOKU]: {
    systemPromptSuffix: `
Görevin: "Şekil Sudoku" çalışma kağıdı üret.
YAPI:
- 2 adet 4×4 şekil sudoku (▲ ■ ● ◆).
- 1 adet 6×6 şekil sudoku (6 farklı şekil).
- Kural: Her satır ve sütunda her şekil bir kez.
- Başlangıç şekilleri %40 dolu (çözülebilir).
BİLİŞSEL HEDEF: Mantıksal eliminasyon ve uzamsal düzenleme.`,
    userPromptSuffix: 'Geometrik şekillerle sudoku bulmacaları üret.',
    drillCount: 3,
    layoutHint: 'grid'
  },

  [ActivityType.THEMATIC_ODD_ONE_OUT]: {
    systemPromptSuffix: `
Görevin: "Tematik Farklıyı Bul" çalışma kağıdı üret.
YAPI:
- 8 grup, her grupta 5 öğe (kelime/kavram).
- 4'ü temaya ait, 1'i farklı kategoriden.
- Her grubun teması açık değil — öğrenci hem farklıyı hem temayı bulacak.
- Alt bölüm: "Tema neydi? ___" ve "Neden farklı? ___" kutuları.
BİLİŞSEL HEDEF: Kategorizasyon, soyut düşünme ve tema çıkarımı.`,
    userPromptSuffix: 'Tema bulmalı farklıyı tespit etkinliği üret.',
    drillCount: 2,
    layoutHint: 'table'
  },

  [ActivityType.ATTENTION_DEVELOPMENT]: {
    systemPromptSuffix: `
Görevin: "Dikkat Geliştirme" çalışma kağıdı üret.
YAPI:
- Bölüm 1: Ardışık dikkat — sayı dizisinde belirli kurala uyanları işaretle (8 satır).
- Bölüm 2: Bölünmüş dikkat — hem harfleri hem sayıları aynı anda takip et (4 soru).
- Bölüm 3: Dikkat sürdürme — 100 öğelik listede hedefi say.
- Süre kutuları: her bölüm için "Sürem: ___ saniye".
BİLİŞSEL HEDEF: Ardışık, bölünmüş ve sürdürülebilir dikkat.`,
    userPromptSuffix: 'Üç dikkat türü için ayrı bölümlü çalışma kağıdı üret.',
    drillCount: 3,
    layoutHint: 'list'
  },

  [ActivityType.ATTENTION_FOCUS]: {
    systemPromptSuffix: `
Görevin: "Dikkat ve Odaklanma" çalışma kağıdı üret.
YAPI:
- 15×15 sembol matrisi (emoji/harf/sayı karışık).
- Görev 1: Tüm "★" sembollerini bul ve say.
- Görev 2: Tüm "çift sayıları" bul ve topla.
- Görev 3: Belirli bir harf çiftini (ör: "ab") bul.
- Sonuç kutuları: "Yıldız: ___ Çift toplam: ___ Çift sayısı: ___"
BİLİŞSEL HEDEF: Seçici dikkat yoğunluğu ve çoklu hedef takibi.`,
    userPromptSuffix: 'Çoklu hedefli sembol tarama ve sayma etkinliği üret.',
    drillCount: 3,
    layoutHint: 'grid'
  },
};


// ═══════════════════════════════════════════════════════════════
// BİRLEŞİK EXPORT
// ═══════════════════════════════════════════════════════════════

export const PROMPT_TEMPLATES: Partial<Record<ActivityType, PromptTemplate>> = {
  ...READING_TEMPLATES,
  ...MATH_TEMPLATES,
  ...VISUAL_TEMPLATES,
  ...PUZZLE_TEMPLATES,
};

/**
 * Belirli bir aktivite türü için özel prompt şablonunu döndürür.
 * Eğer şablon yoksa undefined döner (fallback devreye girer).
 */
export function getPromptTemplate(type: ActivityType): PromptTemplate | undefined {
  return PROMPT_TEMPLATES[type];
}

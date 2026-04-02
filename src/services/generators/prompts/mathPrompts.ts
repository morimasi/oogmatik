import { ActivityType } from '../../../types';
import { PromptTemplate } from './readingPrompts';

export const MATH_PROMPTS: Partial<Record<ActivityType, PromptTemplate>> = {
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
